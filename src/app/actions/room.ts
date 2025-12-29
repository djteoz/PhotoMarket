"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

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
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Проверяем, является ли пользователь владельцем студии
  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    include: { owner: true },
  });

  if (!studio) {
    throw new Error("Studio not found");
  }

  if (studio.owner.clerkId !== user.id) {
    throw new Error("Forbidden");
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
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { studio: { include: { owner: true } } },
  });

  if (!room) {
    return { error: "Room not found" };
  }

  if (room.studio.owner.clerkId !== user.id) {
    return { error: "Unauthorized" };
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
  } catch (error) {
    console.error("Failed to update room:", error);
    return { error: "Failed to update room" };
  }

  redirect(`/studios/${room.studioId}`);
}
