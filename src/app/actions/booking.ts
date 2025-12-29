"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const bookingSchema = z.object({
  roomId: z.string(),
  date: z.date(),
  startTime: z.string(), // "10:00"
  duration: z.coerce.number().min(1), // hours
});

export async function createBooking(formData: z.infer<typeof bookingSchema>) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Получаем пользователя из БД
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  const { roomId, date, startTime, duration } = formData;

  // Парсим время начала
  const [hours, minutes] = startTime.split(":").map(Number);

  const startDateTime = new Date(date);
  startDateTime.setHours(hours, minutes, 0, 0);

  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(startDateTime.getHours() + duration);

  // Получаем информацию о зале для расчета цены
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new Error("Room not found");
  }

  // Проверка на пересечение бронирований
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      roomId,
      status: { not: "CANCELLED" },
      OR: [
        {
          startTime: { lt: endDateTime },
          endTime: { gt: startDateTime },
        },
      ],
    },
  });

  if (conflictingBooking) {
    return { error: "Selected time is already booked" };
  }

  const totalPrice = Number(room.pricePerHour) * duration;

  try {
    await prisma.booking.create({
      data: {
        userId: dbUser.id,
        roomId,
        startTime: startDateTime,
        endTime: endDateTime,
        totalPrice,
        status: "CONFIRMED", // В реальном приложении сначала PENDING, потом оплата
      },
    });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { error: "Failed to create booking" };
  }

  return { success: true };
}
