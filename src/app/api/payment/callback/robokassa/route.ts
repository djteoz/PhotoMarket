import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateRobokassaSignature } from "@/lib/payment/robokassa";

// Robokassa Result URL (POST or GET)
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const outSum = formData.get("OutSum") as string;
  const invId = formData.get("InvId") as string;
  const signature = formData.get("SignatureValue") as string;

  if (!validateRobokassaSignature(outSum, invId, signature)) {
    return new NextResponse("Bad signature", { status: 400 });
  }

  // Find payment by externalId (invId)
  const payment = await prisma.payment.findFirst({
    where: { externalId: invId },
  });

  if (payment && payment.status !== "SUCCEEDED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCEEDED" },
    });

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

  return new NextResponse(`OK${invId}`);
}

// Success URL (User redirect)
export async function GET(req: NextRequest) {
  // Robokassa redirects user here after payment
  return NextResponse.redirect(
    new URL("/dashboard?payment=success", "https://photomarket.tech"),
  );
}
