"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (studio.owner.clerkId !== user.id && dbUser?.role !== "ADMIN") {
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

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (room.studio.owner.clerkId !== user.id && dbUser?.role !== "ADMIN") {
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

export async function updateRoomIcal(roomId: string, importUrl: string) {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { studio: { include: { owner: true } } },
  });

  if (!room) {
    return { error: "Room not found" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (room.studio.owner.clerkId !== user.id && dbUser?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.room.update({
      where: { id: roomId },
      data: { icalImportUrl: importUrl },
    });

    // Trigger sync immediately if URL is provided
    if (importUrl) {
      // We can't import syncRoomCalendar here directly if it uses node-ical which might not be edge compatible
      // or if we want to keep actions clean. But let's try to import it dynamically or just call it.
      // Since this is a server action, it runs on Node, so it should be fine.
      const { syncRoomCalendar } = await import("@/lib/ical-sync");
      await syncRoomCalendar(roomId);
    }

    revalidatePath(`/studios/${room.studioId}/rooms/${roomId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update iCal:", error);
    return { error: "Failed to update settings" };
  }
}
