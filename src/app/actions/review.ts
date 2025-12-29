"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createReviewSchema = z.object({
  studioId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function createReview(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Вы должны быть авторизованы, чтобы оставить отзыв" };
  }

  const rawData = {
    studioId: formData.get("studioId"),
    rating: Number(formData.get("rating")),
    comment: formData.get("comment"),
  };

  const validatedFields = createReviewSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: "Неверные данные формы" };
  }

  const { studioId, rating, comment } = validatedFields.data;

  try {
    // Check if user exists in our db
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { error: "Пользователь не найден" };
    }

    // Check if user has already reviewed this studio?
    // The schema doesn't enforce unique constraint, but maybe we should check logic-wise?
    // For now, let's allow multiple reviews or just proceed.
    // Usually one review per user per studio is standard, but let's keep it simple for MVP.

    await prisma.review.create({
      data: {
        rating,
        comment,
        studioId,
        userId: user.id,
      },
    });

    revalidatePath(`/studios/${studioId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating review:", error);
    return { error: "Не удалось создать отзыв" };
  }
}
