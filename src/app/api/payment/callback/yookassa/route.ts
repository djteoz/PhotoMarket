import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";
import {
  sendBookingNotification,
  sendNewBookingNotificationToOwner,
} from "@/lib/mail";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const APP_URL = "https://photomarket.tech";

function redirect(path: string) {
  return NextResponse.redirect(new URL(path, APP_URL));
}

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
            "base64",
          ),
      },
    },
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

// Helper: Confirm booking after successful payment
async function confirmBookingPayment(paymentId: string, bookingId: string) {
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

  // Confirm booking and mark as paid
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
      isPaid: true,
    },
    include: {
      user: true,
      room: {
        include: {
          studio: {
            include: {
              owner: true,
            },
          },
        },
      },
    },
  });

  // Send email notifications after successful payment
  try {
    const dateStr = format(booking.startTime, "d MMMM yyyy", { locale: ru });
    const timeStr = `${format(booking.startTime, "HH:mm")} - ${format(booking.endTime, "HH:mm")}`;

    // Notify the customer
    await sendBookingNotification({
      to: booking.user.email,
      userName: booking.user.name || "Пользователь",
      studioName: booking.room.studio.name,
      roomName: booking.room.name,
      date: dateStr,
      time: timeStr,
    });

    // Notify the studio owner
    await sendNewBookingNotificationToOwner({
      to: booking.room.studio.owner.email,
      ownerName: booking.room.studio.owner.name || "Владелец",
      studioName: booking.room.studio.name,
      roomName: booking.room.name,
      date: dateStr,
      time: timeStr,
    });
  } catch (emailError) {
    console.error("Failed to send booking notification emails:", emailError);
    // Don't fail the payment confirmation if email fails
  }

  console.log(`Booking ${bookingId} confirmed after payment ${paymentId}`);
}

// Helper: Cancel booking after failed payment
async function cancelBookingPayment(paymentId: string, bookingId: string) {
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "CANCELED" },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  console.log(`Booking ${bookingId} cancelled due to payment failure`);
}

// Helper: Process payment based on type (subscription or booking)
async function processSucceededPayment(
  paymentId: string,
  metadata: Record<string, string>,
) {
  if (metadata.type === "booking" && metadata.bookingId) {
    await confirmBookingPayment(paymentId, metadata.bookingId);
  } else {
    // Subscription payment (legacy flow)
    const plan = metadata.plan as SubscriptionPlan;
    await activateSubscription(paymentId, plan);
  }
}

async function processCanceledPayment(
  paymentId: string,
  metadata: Record<string, string>,
) {
  if (metadata.type === "booking" && metadata.bookingId) {
    await cancelBookingPayment(paymentId, metadata.bookingId);
  } else {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "CANCELED" },
    });
  }
}

// GET: User returns from YooKassa payment page
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  const mockSuccess = searchParams.get("mock_payment");

  if (!paymentId) {
    return redirect("/pricing?error=missing_id");
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) {
    return redirect("/pricing?error=payment_not_found");
  }

  const isBookingPayment = payment.type === "BOOKING";
  const successRedirect = isBookingPayment
    ? "/dashboard?tab=bookings&payment=success"
    : "/dashboard?payment=success";
  const errorRedirect = isBookingPayment
    ? "/dashboard?tab=bookings&payment=canceled"
    : "/pricing?error=payment_canceled";

  // Mock mode for development
  if (mockSuccess === "success") {
    if (isBookingPayment && payment.booking) {
      await confirmBookingPayment(paymentId, payment.booking.id);
    } else {
      await activateSubscription(paymentId, payment.plan);
    }
    return redirect(successRedirect);
  }

  // Real mode: Check payment status via YooKassa API
  if (payment.externalId && payment.status === "PENDING") {
    const yookassaStatus = await getYookassaPaymentStatus(payment.externalId);

    if (yookassaStatus?.status === "succeeded") {
      if (isBookingPayment && payment.booking) {
        await confirmBookingPayment(paymentId, payment.booking.id);
      } else {
        await activateSubscription(paymentId, payment.plan);
      }
      return redirect(successRedirect);
    } else if (yookassaStatus?.status === "canceled") {
      if (isBookingPayment && payment.booking) {
        await cancelBookingPayment(paymentId, payment.booking.id);
      } else {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: "CANCELED" },
        });
      }
      return redirect(errorRedirect);
    }
  }

  // Payment already succeeded
  if (payment.status === "SUCCEEDED") {
    return redirect(successRedirect);
  }

  // Still pending - redirect to dashboard with waiting status
  return redirect("/dashboard?payment=pending");
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
    const metadata = paymentData.metadata;

    if (event === "payment.succeeded") {
      await processSucceededPayment(paymentId, metadata);
    } else if (event === "payment.canceled") {
      await processCanceledPayment(paymentId, metadata);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
