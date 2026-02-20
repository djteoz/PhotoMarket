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
import { createYookassaPayment } from "@/lib/payment/yookassa";

const PLATFORM_COMMISSION_PERCENT = 10; // Комиссия платформы 10%

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

    // Отменяем старые неоплаченные PENDING брони этого пользователя на этот зал
    await prisma.booking.updateMany({
      where: {
        roomId,
        userId: dbUser.id,
        status: "PENDING",
        isPaid: false,
      },
      data: { status: "CANCELLED" },
    });

    // Проверка на пересечение бронирований (только оплаченные/подтверждённые)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        OR: [
          { status: "CONFIRMED" },
          { status: "COMPLETED" },
          { status: "PENDING", isPaid: true },
        ],
        AND: [
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
    const commission = Math.round(
      (totalPrice * PLATFORM_COMMISSION_PERCENT) / 100,
    );
    const totalWithCommission = totalPrice + commission;

    // Создаём бронирование со статусом PENDING (неоплачено)
    const booking = await prisma.booking.create({
      data: {
        userId: dbUser.id,
        roomId,
        startTime: startDateTime,
        endTime: endDateTime,
        totalPrice: totalWithCommission,
        status: "PENDING",
        isPaid: false,
      },
    });

    // Создаём платёж в БД
    const payment = await prisma.payment.create({
      data: {
        userId: dbUser.id,
        amount: totalWithCommission,
        provider: "YOOKASSA",
        status: "PENDING",
        type: "BOOKING",
        plan: "FREE", // Не подписка, но поле обязательное
      },
    });

    // Привязываем платёж к бронированию
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentId: payment.id },
    });

    // Создаём платёж в ЮKassa
    const appUrl = "https://photomarket.tech";
    const returnUrl = `${appUrl}/api/payment/callback/yookassa?paymentId=${payment.id}`;

    const dateStr = format(startDateTime, "d MMMM yyyy", { locale: ru });
    const timeStr = `${format(startDateTime, "HH:mm")} - ${format(endDateTime, "HH:mm")}`;

    const yookassaPayment = await createYookassaPayment(
      totalWithCommission,
      `Бронирование: ${room.studio.name} — ${room.name}, ${dateStr}, ${timeStr}`,
      returnUrl,
      {
        paymentId: payment.id,
        bookingId: booking.id,
        type: "booking",
      },
    );

    // Сохраняем ID платежа от ЮKassa
    await prisma.payment.update({
      where: { id: payment.id },
      data: { externalId: yookassaPayment.id },
    });

    // Возвращаем URL для редиректа на страницу оплаты
    return {
      success: true,
      paymentUrl: yookassaPayment.confirmation.confirmation_url,
      bookingId: booking.id,
    };
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
      // Показываем как занятые только оплаченные или подтверждённые брони
      OR: [
        { status: "CONFIRMED" },
        { status: "COMPLETED" },
        { status: "PENDING", isPaid: true },
      ],
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
        payment: true,
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

    // Если отменяем оплаченное бронирование — помечаем платёж как отменённый
    if (status === "CANCELLED" && booking.paymentId && booking.isPaid) {
      await prisma.payment.update({
        where: { id: booking.paymentId },
        data: { status: "CANCELED" },
      });
      // TODO: Реализовать автоматический возврат через YooKassa API refunds
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update booking status:", error);
    return { error: "Не удалось обновить статус" };
  }
}
