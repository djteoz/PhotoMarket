"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureDbUser } from "@/lib/ensure-db-user";

export async function toggleFavorite(studioId: string) {
  try {
    const { dbUser } = await ensureDbUser();

    if (!dbUser) {
      return { error: "Необходимо авторизоваться" };
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_studioId: {
          userId: dbUser.id,
          studioId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      revalidatePath("/catalog");
      revalidatePath(`/studios/${studioId}`);
      revalidatePath("/dashboard");
      return { isFavorite: false };
    } else {
      await prisma.favorite.create({
        data: {
          userId: dbUser.id,
          studioId,
        },
      });
      revalidatePath("/catalog");
      revalidatePath(`/studios/${studioId}`);
      revalidatePath("/dashboard");
      return { isFavorite: true };
    }
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    return { error: "Не удалось обновить избранное" };
  }
}
