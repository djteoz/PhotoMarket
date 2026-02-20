"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { geocodeAddress } from "@/lib/geocode";

// Схема валидации (дублируем или выносим в отдельный файл позже)
const studioSchema = z.object({
  name: z.string().min(2, "Название должно быть не менее 2 символов"),
  description: z.string().optional(),
  address: z.string().min(5, "Адрес должен быть не менее 5 символов"),
  city: z.string().min(2, "Город должен быть не менее 2 символов"),
  images: z.array(z.string()).optional(),
});

export async function createStudio(formData: z.infer<typeof studioSchema>) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Проверяем, есть ли пользователь в нашей БД, если нет - создаем
  // В продакшене лучше использовать Webhooks, но для MVP это ок
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        image: user.imageUrl,
        role: "OWNER", // Первый создавший студию становится владельцем
      },
    });
  }

  // Валидация данных
  const validatedFields = studioSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, description, address, city, images } = validatedFields.data;

  // Геокодирование адреса для отображения карты
  const coords = await geocodeAddress(city, address);

  try {
    await prisma.studio.create({
      data: {
        name,
        description,
        address,
        city,
        images: images || [],
        ownerId: dbUser.id,
        ...(coords && { lat: coords.lat, lng: coords.lng }),
      },
    });
  } catch (error) {
    console.error("Failed to create studio:", error);
    return { error: "Failed to create studio" };
  }

  redirect("/dashboard");
}

export async function updateStudio(
  studioId: string,
  formData: z.infer<typeof studioSchema>,
) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    include: { owner: true },
  });

  if (!studio) {
    return { error: "Studio not found" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (
    studio.owner.clerkId !== user.id &&
    dbUser?.role !== "ADMIN" &&
    dbUser?.role !== "OWNER"
  ) {
    return { error: "Unauthorized" };
  }

  const validatedFields = studioSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, description, address, city, images } = validatedFields.data;

  // Геокодирование адреса если адрес или город изменились
  const addressChanged = studio.address !== address || studio.city !== city;
  const coords = addressChanged ? await geocodeAddress(city, address) : null;

  try {
    await prisma.studio.update({
      where: { id: studioId },
      data: {
        name,
        description,
        address,
        city,
        images: images || [],
        ...(coords && { lat: coords.lat, lng: coords.lng }),
      },
    });
  } catch (error) {
    console.error("Failed to update studio:", error);
    return { error: "Failed to update studio" };
  }

  redirect("/dashboard");
}
