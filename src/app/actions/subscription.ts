"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SubscriptionPlan } from "@prisma/client";
import { createYookassaPayment } from "@/lib/payment/yookassa";
import { generateRobokassaLink } from "@/lib/payment/robokassa";
import { ensureDbUser } from "@/lib/ensure-db-user";

const PLAN_PRICES = {
  FREE: 0,
  PRO: 990,
  BUSINESS: 2990,
};

export async function updateUserSubscription(
  userId: string,
  plan: SubscriptionPlan,
  months: number = 1,
) {
  try {
    // Проверяем, что вызывающий — администратор
    const { dbUser: caller } = await ensureDbUser();
    if (!caller || caller.role !== "ADMIN") {
      return { error: "Требуются права администратора" };
    }

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
    return { error: "Не удалось обновить подписку" };
  }
}

export async function createSubscriptionPayment(
  plan: SubscriptionPlan,
  provider: "YOOKASSA" | "ROBOKASSA",
) {
  try {
    const { clerkUser, dbUser } = await ensureDbUser();

    if (!clerkUser || !dbUser) {
      return { error: "Необходимо авторизоваться" };
    }

    const amount = PLAN_PRICES[plan];
    if (amount === 0) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { subscriptionPlan: "FREE", subscriptionEndsAt: null },
      });
      revalidatePath("/pricing");
      return { success: true };
    }

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
      const appUrl = "https://photomarket.tech";
      const returnUrl = `${appUrl}/api/payment/callback/yookassa?paymentId=${payment.id}`;
      const yookassaPayment = await createYookassaPayment(
        amount,
        `Подписка ${plan} для ${clerkUser.emailAddresses[0].emailAddress}`,
        returnUrl,
        { paymentId: payment.id, plan: plan, userId: dbUser.id },
      );

      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: yookassaPayment.id },
      });

      redirectUrl = yookassaPayment.confirmation.confirmation_url;
    } else if (provider === "ROBOKASSA") {
      const invId = Date.now().toString().slice(-9);

      await prisma.payment.update({
        where: { id: payment.id },
        data: { externalId: invId },
      });

      redirectUrl = generateRobokassaLink(
        amount,
        invId,
        `Подписка ${plan}`,
        clerkUser.emailAddresses[0].emailAddress,
      );
    }

    return { redirectUrl };
  } catch (error) {
    console.error("Payment creation error:", error);
    return { error: "Не удалось создать платёж" };
  }
}
