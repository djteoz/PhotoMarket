"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SubscriptionPlan } from "@prisma/client";

export async function subscribe(plan: SubscriptionPlan) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return { error: "User not found" };
  }

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Calculate end date (30 days from now)
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 30);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: plan,
        subscriptionEndsAt: endsAt,
      },
    });

    revalidatePath("/pricing");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Subscription error:", error);
    return { error: "Failed to process subscription" };
  }
}
