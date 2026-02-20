"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureDbUser } from "@/lib/ensure-db-user";

const createReviewSchema = z.object({
  studioId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function createReview(formData: FormData) {
  try {
    const { dbUser } = await ensureDbUser();

    if (!dbUser) {
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

    await prisma.review.create({
      data: {
        rating,
        comment,
        studioId,
        userId: dbUser.id,
      },
    });

    revalidatePath(`/studios/${studioId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating review:", error);
    return { error: "Не удалось создать отзыв" };
  }
}
