import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Get Telegram link URL for account binding
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, telegramChatId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "PhotoMarketBot";
    const linkUrl = `https://t.me/${botUsername}?start=${user.id}`;

    return NextResponse.json({
      linked: !!user.telegramChatId,
      linkUrl,
    });
  } catch (error) {
    console.error("Error getting Telegram link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Unlink Telegram account
 */
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: { telegramChatId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unlinking Telegram:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
