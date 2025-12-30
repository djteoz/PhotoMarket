import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const mockSuccess = searchParams.get("mock_payment");

  if (!paymentId) {
    return NextResponse.redirect(new URL("/pricing?error=missing_id", req.url));
  }

  // In a real scenario, YooKassa sends a webhook (POST) to notify status change.
  // The return_url (GET) is just for user redirection.
  // However, for this demo/mock, we will check the status here or trust the mock param.

  if (mockSuccess === "success") {
    // Handle Mock Success
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (payment && payment.status !== "SUCCEEDED") {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: "SUCCEEDED" },
      });

      // Grant Subscription
      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + 30);

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionPlan: payment.plan,
          subscriptionEndsAt: endsAt,
        },
      });
    }

    return NextResponse.redirect(
      new URL("/dashboard?payment=success", req.url)
    );
  }

  // Real YooKassa flow: Check status via API (omitted for brevity, assuming webhook handles it or user waits)
  // For now, just redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
}

// Webhook handler
export async function POST(req: NextRequest) {
  // Handle YooKassa Webhook here
  return NextResponse.json({ received: true });
}
