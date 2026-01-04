import { prisma } from "@/lib/prisma";
import nodeIcal from "node-ical";

export async function syncRoomCalendar(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room || !room.icalImportUrl) {
    return { error: "Room not found or no import URL configured" };
  }

  try {
    // 1. Fetch and parse external calendar
    const events = await nodeIcal.async.fromURL(room.icalImportUrl);

    // 2. Prepare new bookings
    const newBookings = [];

    // Get existing ICAL bookings to avoid duplicates or handle updates
    // For simplicity in MVP: We might delete future ICAL bookings and recreate them,
    // or check by externalId. Let's check by externalId.

    for (const event of Object.values(events)) {
      if (event.type !== "VEVENT") continue;

      // Skip past events? Maybe keep them for history.
      // Let's skip events older than 1 month to keep DB clean-ish if needed,
      // but for sync correctness usually we want future events.
      if (new Date(event.end) < new Date()) continue;

      newBookings.push({
        roomId: room.id,
        userId: room.studioId, // Assign to owner effectively, or a system user?
        // Actually, we need a userId for the Booking model.
        // We can use the studio owner's ID or a special "system" ID.
        // For now, let's fetch the studio owner.
        startTime: new Date(event.start),
        endTime: new Date(event.end),
        status: "CONFIRMED",
        source: "ICAL",
        externalId: event.uid,
        totalPrice: 0, // External bookings don't bring money here directly
      });
    }

    // We need the owner ID to assign these bookings to
    const studio = await prisma.studio.findUnique({
      where: { id: room.studioId },
      select: { ownerId: true },
    });

    if (!studio) throw new Error("Studio not found");

    // 3. Sync with DB
    // Strategy:
    // - Find all future bookings for this room with source="ICAL"
    // - Compare with newBookings
    // - Create missing, Delete removed, Update changed

    // Simpler Strategy for MVP:
    // - Delete all future ICAL bookings for this room
    // - Create all parsed future bookings

    const now = new Date();

    await prisma.$transaction([
      // Delete future external bookings
      prisma.booking.deleteMany({
        where: {
          roomId: room.id,
          source: "ICAL",
          startTime: { gte: now },
        },
      }),
      // Create new ones
      prisma.booking.createMany({
        data: newBookings.map((b) => ({
          ...b,
          userId: studio.ownerId,
          status: "CONFIRMED" as const,
        })),
      }),
    ]);

    return { success: true, count: newBookings.length };
  } catch (error) {
    console.error(`Failed to sync calendar for room ${roomId}:`, error);
    return { error: "Sync failed" };
  }
}
