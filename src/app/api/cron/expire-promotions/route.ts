import { NextResponse } from "next/server";
import { expirePromotions } from "@/app/actions/promotion";

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// Add to vercel.json:
// { "crons": [{ "path": "/api/cron/expire-promotions", "schedule": "0 * * * *" }] }

export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await expirePromotions();

    return NextResponse.json({
      success: true,
      message: `Expired ${result.expired} promotions`,
      ...result,
    });
  } catch (error) {
    console.error("Cron expire-promotions error:", error);
    return NextResponse.json(
      { error: "Failed to expire promotions" },
      { status: 500 }
    );
  }
}
