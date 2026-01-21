import { NextRequest, NextResponse } from "next/server";
import { handleTelegramWebhook, initBotCommands } from "@/lib/telegram";

// Initialize bot commands once
let initialized = false;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional but recommended)
    const secretToken = request.headers.get("x-telegram-bot-api-secret-token");
    const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    
    if (expectedToken && secretToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize bot commands on first request
    if (!initialized) {
      initBotCommands();
      initialized = true;
    }

    // Parse update
    const update = await request.json();
    
    // Handle update
    await handleTelegramWebhook(update);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// Telegram sends GET to verify webhook
export async function GET() {
  return NextResponse.json({ 
    status: "ok",
    message: "Telegram webhook endpoint" 
  });
}
