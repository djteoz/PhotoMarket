"use client";

import { useState, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBooking } from "@/app/actions/booking";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner"; // Assuming sonner is installed or we use alert for now

interface BookingFormProps {
  roomId: string;
  pricePerHour: number;
}

export function BookingForm({ roomId, pricePerHour }: BookingFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("1");
  const [isPending, startTransition] = useTransition();

  // Генерируем доступные слоты времени (с 09:00 до 22:00)
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 9;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const handleBooking = () => {
    if (!date || !startTime) return;

    startTransition(async () => {
      const result = await createBooking({
        roomId,
        date,
        startTime,
        duration: Number(duration),
      });

      if (result?.error) {
        alert(result.error);
      } else {
        alert("Бронирование успешно создано!");
        // Можно добавить редирект или обновление страницы
      }
    });
  };

  const totalPrice = pricePerHour * Number(duration);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Выберите дату</h3>
        <div className="border rounded-md p-2 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            initialFocus
            locale={ru}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Время начала</h3>
          <Select onValueChange={setStartTime}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите время" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="font-medium mb-2">Длительность</h3>
          <Select onValueChange={setDuration} defaultValue="1">
            <SelectTrigger>
              <SelectValue placeholder="Часов" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                <SelectItem key={hours} value={hours.toString()}>
                  {hours} ч.
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Итого:</span>
          <span className="text-xl font-bold">{totalPrice} ₽</span>
        </div>
        <Button
          className="w-full"
          onClick={handleBooking}
          disabled={!date || !startTime || isPending}
        >
          {isPending ? "Бронирование..." : "Забронировать"}
        </Button>
      </div>
    </div>
  );
}
