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
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { error: "Failed to create booking" };
  }

  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED"
) {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      room: {
        include: {
          studio: {
            include: {
              owner: true,
            },
          },
        },
      },
      user: true, // The user who made the booking
    },
  });

  if (!booking) {
    return { error: "Booking not found" };
  }

  // Check permissions
  // Owner can change any status
  // User can only CANCEL their own booking if it's not completed
  const isOwner = booking.room.studio.owner.clerkId === user.id;
  const isBooker = booking.user.clerkId === user.id;

  if (!isOwner && !isBooker) {
    return { error: "Unauthorized" };
  }

  if (isBooker && !isOwner) {
    if (status !== "CANCELLED") {
      return { error: "You can only cancel your own booking" };
    }
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      return { error: "Cannot cancel completed or already cancelled booking" };
    }
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Revalidate paths
    // We can't easily revalidate everything, but dashboard is key
    // revalidatePath("/dashboard"); // This needs to be imported if used, but actions run on server so we usually rely on client router refresh or revalidatePath
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return { error: "Failed to update status" };
  }

  return { success: true };
}
