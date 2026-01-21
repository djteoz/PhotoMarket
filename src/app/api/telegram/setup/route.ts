import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { setTelegramWebhook } from "@/lib/telegram";

/**
 * Setup Telegram webhook (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { webhookUrl } = await request.json();

    if (!webhookUrl) {
      // Auto-generate webhook URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://photomarket.ru";
      const autoUrl = `${baseUrl}/api/telegram/webhook`;
      
      await setTelegramWebhook(autoUrl);
      
      return NextResponse.json({ 
        success: true, 
        webhookUrl: autoUrl 
      });
    }

    await setTelegramWebhook(webhookUrl);

    return NextResponse.json({ 
      success: true, 
      webhookUrl 
    });
  } catch (error) {
    console.error("Error setting Telegram webhook:", error);
    return NextResponse.json(
      { error: "Failed to set webhook" },
      { status: 500 }
    );
  }
}
