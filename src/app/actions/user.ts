"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureDbUser } from "@/lib/ensure-db-user";

const profileSchema = z.object({
  name: z.string().min(2, "Имя должно быть не короче 2 символов"),
  phone: z.string().optional(),
});

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return { error: "Необходимо авторизоваться" };

    const validated = profileSchema.parse(formData);

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        name: validated.name,
        phone: validated.phone,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Не удалось обновить профиль" };
  }
}
