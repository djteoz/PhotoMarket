"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Имя должно быть не короче 2 символов"),
  phone: z.string().optional(),
});

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = profileSchema.parse(formData);

  await prisma.user.update({
    where: { clerkId: user.id },
    data: {
      name: validated.name,
      phone: validated.phone,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
