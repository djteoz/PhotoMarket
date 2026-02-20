"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  sendBookingNotification,
  sendNewBookingNotificationToOwner,
} from "@/lib/mail";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ensureDbUser } from "@/lib/ensure-db-user";

const bookingSchema = z.object({
  roomId: z.string(),
  date: z.date(),
  startTime: z.string(), // "10:00"
  duration: z.coerce.number().min(1), // hours
});

export async function createBooking(formData: z.infer<typeof bookingSchema>) {
  try {
    const { dbUser } = await ensureDbUser();

    if (!dbUser) {
      return { error: "Необходимо авторизоваться" };
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
      include: {
        studio: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!room) {
      return { error: "Зал не найден" };
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
      return { error: "Выбранное время уже забронировано" };
    }

    const totalPrice = Number(room.pricePerHour) * duration;

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

    // Send notifications
    const dateStr = format(startDateTime, "d MMMM yyyy", { locale: ru });
    const timeStr = `${format(startDateTime, "HH:mm")} - ${format(
      endDateTime,
      "HH:mm",
    )}`;

    // To User
    await sendBookingNotification({
      to: dbUser.email,
      userName: dbUser.name || "Пользователь",
      studioName: room.studio.name,
      roomName: room.name,
      date: dateStr,
      time: timeStr,
    });

    // To Owner
    await sendNewBookingNotificationToOwner({
      to: room.studio.owner.email,
      ownerName: room.studio.owner.name || "Владелец",
      studioName: room.studio.name,
      roomName: room.name,
      date: dateStr,
      time: timeStr,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { error: "Не удалось создать бронирование" };
  }
}

export async function getRoomBookings(roomId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      roomId,
      status: { not: "CANCELLED" },
      startTime: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  return bookings;
}

export async function updateBookingStatus(
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED",
) {
  try {
    const { clerkUser, dbUser } = await ensureDbUser();

    if (!clerkUser) {
      return { error: "Необходимо авторизоваться" };
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
        user: true,
      },
    });

    if (!booking) {
      return { error: "Бронирование не найдено" };
    }

    const isOwner =
      booking.room.studio.owner.clerkId === clerkUser.id ||
      dbUser?.role === "ADMIN";
    const isBooker = booking.user.clerkId === clerkUser.id;

    if (!isOwner && !isBooker) {
      return { error: "Нет прав для изменения" };
    }

    if (isBooker && !isOwner) {
      if (status !== "CANCELLED") {
        return { error: "Вы можете только отменить своё бронирование" };
      }
      if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
        return {
          error: "Нельзя отменить завершённое или уже отменённое бронирование",
        };
      }
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return { error: "Не удалось обновить статус" };
  }
}
