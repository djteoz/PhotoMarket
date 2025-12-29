"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(studioId: string) {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    return { error: "User not found" };
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_studioId: {
        userId: dbUser.id,
        studioId,
      },
    },
  });

  try {
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
    return { error: "Failed to toggle favorite" };
  }
}
