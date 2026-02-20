"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureDbUser } from "@/lib/ensure-db-user";

const roomSchema = z.object({
  name: z.string().min(2, "Название должно быть не менее 2 символов"),
  description: z.string().optional(),
  pricePerHour: z.coerce.number().min(0, "Цена должна быть положительной"),
  area: z.coerce.number().min(1, "Площадь должна быть больше 0"),
  capacity: z.coerce
    .number()
    .min(1, "Вместимость должна быть больше 0")
    .optional(),
  hasNaturalLight: z.boolean().default(false),
  images: z.array(z.string()).optional(),
});

export async function createRoom(
  studioId: string,
  formData: z.infer<typeof roomSchema>
) {
  try {
    const { clerkUser, dbUser } = await ensureDbUser();

    if (!clerkUser) {
      return { error: "Необходимо авторизоваться" };
    }

    // Проверяем, является ли пользователь владельцем студии
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { owner: true },
    });

    if (!studio) {
      return { error: "Студия не найдена" };
    }

    if (studio.owner.clerkId !== clerkUser.id && dbUser?.role !== "ADMIN") {
      return { error: "Нет прав для добавления зала" };
    }

  const validatedFields = roomSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const {
    name,
    description,
    pricePerHour,
    area,
    capacity,
    hasNaturalLight,
    images,
  } = validatedFields.data;

  try {
    await prisma.room.create({
      data: {
        studioId,
        name,
        description,
        pricePerHour,
        area,
        capacity,
        hasNaturalLight,
        images: images || [],
      },
    });
  } catch (error) {
    console.error("Failed to create room:", error);
    return { error: "Failed to create room" };
  }

  redirect(`/studios/${studioId}`);
}

export async function updateRoom(
  roomId: string,
  formData: z.infer<typeof roomSchema>
) {
  try {
    const { clerkUser, dbUser } = await ensureDbUser();

    if (!clerkUser) {
      return { error: "Необходимо авторизоваться" };
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { studio: { include: { owner: true } } },
    });

    if (!room) {
      return { error: "Зал не найден" };
    }

    if (room.studio.owner.clerkId !== clerkUser.id && dbUser?.role !== "ADMIN") {
      return { error: "Нет прав для редактирования" };
    }

    const validatedFields = roomSchema.safeParse(formData);

    if (!validatedFields.success) {
      return { error: "Неверные данные формы" };
    }

    const {
      name,
      description,
      pricePerHour,
      area,
      capacity,
      hasNaturalLight,
      images,
    } = validatedFields.data;

    await prisma.room.update({
      where: { id: roomId },
      data: {
        name,
        description,
        pricePerHour,
        area,
        capacity,
        hasNaturalLight,
        images: images || [],
      },
    });

    redirect(`/studios/${room.studioId}`);
  } catch (error) {
    console.error("Failed to update room:", error);
    return { error: "Не удалось обновить зал" };
  }
}

export async function updateRoomIcal(roomId: string, importUrl: string) {
  try {
    const { clerkUser, dbUser } = await ensureDbUser();

    if (!clerkUser) {
      return { error: "Необходимо авторизоваться" };
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { studio: { include: { owner: true } } },
    });

    if (!room) {
      return { error: "Зал не найден" };
    }

    if (room.studio.owner.clerkId !== clerkUser.id && dbUser?.role !== "ADMIN") {
      return { error: "Нет прав для редактирования" };
    }

    await prisma.room.update({
      where: { id: roomId },
      data: { icalImportUrl: importUrl },
    });

    if (importUrl) {
      const { syncRoomCalendar } = await import("@/lib/ical-sync");
      await syncRoomCalendar(roomId);
    }

    revalidatePath(`/studios/${room.studioId}/rooms/${roomId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update iCal:", error);
    return { error: "Не удалось обновить настройки" };
  }
}
