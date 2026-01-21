import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

// Helper: Check payment status via YooKassa API
async function getYookassaPaymentStatus(externalId: string) {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    return null;
  }

  const response = await fetch(
    `https://api.yookassa.ru/v3/payments/${externalId}`,
    {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString(
            "base64"
          ),
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to get YooKassa payment status");
    return null;
  }

  return await response.json();
}

// Helper: Activate subscription for user
async function activateSubscription(paymentId: string, plan: SubscriptionPlan) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment || payment.status === "SUCCEEDED") {
    return; // Already processed or not found
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "SUCCEEDED" },
  });

  // Grant subscription (30 days)
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 30);

  await prisma.user.update({
    where: { id: payment.userId },
    data: {
      subscriptionPlan: plan,
      subscriptionEndsAt: endsAt,
    },
  });

  console.log(`Subscription ${plan} activated for user ${payment.userId}`);
}

// GET: User returns from YooKassa payment page
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const mockSuccess = searchParams.get("mock_payment");

  if (!paymentId) {
    return NextResponse.redirect(new URL("/pricing?error=missing_id", req.url));
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    return NextResponse.redirect(
      new URL("/pricing?error=payment_not_found", req.url)
    );
  }

  // Mock mode for development
  if (mockSuccess === "success") {
    await activateSubscription(paymentId, payment.plan);
    return NextResponse.redirect(
      new URL("/dashboard?payment=success", req.url)
    );
  }

  // Real mode: Check payment status via YooKassa API
  if (payment.externalId && payment.status === "PENDING") {
    const yookassaStatus = await getYookassaPaymentStatus(payment.externalId);

    if (yookassaStatus?.status === "succeeded") {
      await activateSubscription(paymentId, payment.plan);
      return NextResponse.redirect(
        new URL("/dashboard?payment=success", req.url)
      );
    } else if (yookassaStatus?.status === "canceled") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "CANCELED" },
      });
      return NextResponse.redirect(
        new URL("/pricing?error=payment_canceled", req.url)
      );
    }
  }

  // Payment already succeeded
  if (payment.status === "SUCCEEDED") {
    return NextResponse.redirect(
      new URL("/dashboard?payment=success", req.url)
    );
  }

  // Still pending - redirect to dashboard with waiting status
  return NextResponse.redirect(
    new URL("/dashboard?payment=pending", req.url)
  );
}

// POST: YooKassa Webhook (called by YooKassa servers)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // YooKassa sends event object with type and payment object
    const event = body.event;
    const paymentData = body.object;

    console.log("YooKassa webhook received:", event, paymentData?.id);

    if (!paymentData?.metadata?.paymentId) {
      console.error("No paymentId in metadata");
      return NextResponse.json({ received: true });
    }

    const paymentId = paymentData.metadata.paymentId;
    const plan = paymentData.metadata.plan as SubscriptionPlan;

    if (event === "payment.succeeded") {
      await activateSubscription(paymentId, plan);
    } else if (event === "payment.canceled") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "CANCELED" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
