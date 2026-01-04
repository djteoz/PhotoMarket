import { prisma } from "@/lib/prisma";
import { syncRoomCalendar } from "@/lib/ical-sync";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // static by default, unless reading the request

export async function GET(request: Request) {
  // Basic security check (optional for now, but good practice)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const rooms = await prisma.room.findMany({
      where: {
        icalImportUrl: {
          not: null,
        },
      },
      select: { id: true },
    });

    const results = await Promise.allSettled(
      rooms.map((room) => syncRoomCalendar(room.id))
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    return NextResponse.json({
      success: true,
      processed: rooms.length,
      successful: successCount,
    });
  } catch (error) {
    console.error("Cron sync failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
