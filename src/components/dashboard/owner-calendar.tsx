"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking, Room, Studio, User } from "@prisma/client";
import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User as UserIcon } from "lucide-react";

type BookingWithDetails = Booking & {
  room: Room & {
    studio: Studio;
  };
  user: User;
};

interface OwnerCalendarProps {
  bookings: BookingWithDetails[];
}

export function OwnerCalendar({ bookings }: OwnerCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Filter bookings for the selected date
  const selectedDateBookings = bookings.filter((booking) =>
    date ? isSameDay(new Date(booking.startTime), date) : false
  );

  // Create a set of days that have bookings for the modifiers
  const bookedDays = bookings.map((b) => new Date(b.startTime));

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Календарь</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ru}
              modifiers={{
                booked: bookedDays,
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                  color: "var(--primary)",
                },
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {date
                ? format(date, "d MMMM yyyy", { locale: ru })
                : "Выберите дату"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateBookings.length > 0 ? (
              <div className="space-y-4">
                {selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-2 border p-4 rounded-lg shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg">
                          {booking.room.name}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 gap-2">
                          <MapPin className="h-3 w-3" />
                          {booking.room.studio.name}
                        </div>
                      </div>
                      <Badge
                        variant={
                          booking.status === "CONFIRMED"
                            ? "default"
                            : booking.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {booking.status === "CONFIRMED"
                          ? "Подтверждено"
                          : booking.status === "PENDING"
                          ? "Ожидает"
                          : booking.status === "CANCELLED"
                          ? "Отменено"
                          : "Завершено"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {format(new Date(booking.startTime), "HH:mm")} -{" "}
                          {format(new Date(booking.endTime), "HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <span>{booking.user.name || booking.user.email}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t flex justify-between items-center text-sm">
                        <span className="text-gray-500">Сумма:</span>
                        <span className="font-bold">{Number(booking.totalPrice)} ₽</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>На этот день бронирований нет.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
