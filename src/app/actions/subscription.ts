"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SubscriptionPlan } from "@prisma/client";
import { createYookassaPayment } from "@/lib/payment/yookassa";
import { generateRobokassaLink } from "@/lib/payment/robokassa";

const PLAN_PRICES = {
  FREE: 0,
  PRO: 990,
  BUSINESS: 2990,
};

export async function updateUserSubscription(
  userId: string,
  plan: SubscriptionPlan,
  months: number = 1
) {
  try {
    const endsAt = new Date();
    endsAt.setMonth(endsAt.getMonth() + months);

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        subscriptionEndsAt: plan === "FREE" ? null : endsAt,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { error: "Failed to update subscription" };
  }
}

export async function createSubscriptionPayment(
  plan: SubscriptionPlan,
  provider: "YOOKASSA" | "ROBOKASSA"
) {
  const user = await currentUser();

  if (!user || !user.id) {
    return { error: "Unauthorized" };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    return { error: "User not found" };
  }

  const amount = PLAN_PRICES[plan];
  if (amount === 0) {
    // Free plan logic
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { subscriptionPlan: "FREE", subscriptionEndsAt: null },
    });
    revalidatePath("/pricing");
    return { success: true };
  }

  try {
    // Create Payment Record
    const payment = await prisma.payment.create({
      data: {
        userId: dbUser.id,
        amount: amount,
        provider: provider,
        status: "PENDING",
        plan: plan,
      },
    });

    let redirectUrl = "";

    if (provider === "YOOKASSA") {
      const returnUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/payment/callback/yookassa?paymentId=${payment.id}`;
      const yookassaPayment = await createYookassaPayment(
        amount,
        `Подписка ${plan} для ${user.emailAddresses[0].emailAddress}`,
        returnUrl,
        { paymentId: payment.id, plan: plan, userId: dbUser.id }
      );

      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: yookassaPayment.id },
      });

      redirectUrl = yookassaPayment.confirmation.confirmation_url;
    } else if (provider === "ROBOKASSA") {
      // Robokassa uses integer ID usually, but we have UUID.
      // We can use the first 8 chars converted to int or just pass the UUID if allowed (Robokassa allows string InvId up to a limit, but usually expects int).
      // For simplicity, let's assume we can pass the ID.
      // Actually Robokassa InvId must be int < 2^31. We need a sequence or mapping.
      // Let's use a timestamp-based ID for Robokassa InvId and store it.

      // Workaround: Use a short numeric ID or hash.
      // Better: Create a separate Int autoincrement field or just use timestamp + random.
      // Let's use timestamp (last 9 digits)
      const invId = Date.now().toString().slice(-9);

      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: invId },
      });

      redirectUrl = generateRobokassaLink(
        amount,
        invId,
        `Подписка ${plan}`,
        user.emailAddresses[0].emailAddress
      );
    }

    return { redirectUrl };
  } catch (error) {
    console.error("Payment creation error:", error);
    return { error: "Failed to initiate payment" };
  }
}
