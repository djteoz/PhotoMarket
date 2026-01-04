import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import ical, { ICalCalendarMethod } from "ical-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const room = await prisma.room.findFirst({
    where: { icalExportToken: token },
    include: {
      studio: true,
      bookings: {
        where: {
          status: "CONFIRMED", // Only export confirmed bookings
        },
      },
    },
  });

  if (!room) {
    return new NextResponse("Calendar not found", { status: 404 });
  }

  const calendar = ical({
    name: `${room.studio.name} - ${room.name}`,
    method: ICalCalendarMethod.PUBLISH,
  });

  room.bookings.forEach((booking) => {
    calendar.createEvent({
      start: booking.startTime,
      end: booking.endTime,
      summary: "Забронировано (PhotoMarket)",
      description: `Бронирование через PhotoMarket\nID: ${booking.id}`,
      location: `${room.studio.city}, ${room.studio.address}, ${room.name}`,
      id: booking.id,
    });
  });

  return new NextResponse(calendar.toString(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="calendar-${room.id}.ics"`,
    },
  });
}
