"use client";

import { Button } from "@/components/ui/button";
import { updateBookingStatus } from "@/app/actions/booking";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BookingActionsProps {
  bookingId: string;
  status: string;
  isOwner: boolean;
}

export function BookingActions({
  bookingId,
  status,
  isOwner,
}: BookingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = (
    newStatus: "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) => {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Статус бронирования обновлен");
        router.refresh();
      }
    });
  };

  if (isOwner) {
    if (status === "PENDING") {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            disabled={isPending}
            onClick={() => handleStatusChange("CONFIRMED")}
          >
            Подтвердить
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => handleStatusChange("CANCELLED")}
          >
            Отклонить
          </Button>
        </div>
      );
    }
    if (status === "CONFIRMED") {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleStatusChange("COMPLETED")}
          >
            Завершить
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => handleStatusChange("CANCELLED")}
          >
            Отменить
          </Button>
        </div>
      );
    }
  } else {
    // User actions
    if (status === "PENDING" || status === "CONFIRMED") {
      return (
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => handleStatusChange("CANCELLED")}
        >
          Отменить бронь
        </Button>
      );
    }
  }

  return null;
}
