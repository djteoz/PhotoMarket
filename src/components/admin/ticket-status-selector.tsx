"use client";

import { updateTicketStatus } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

export function TicketStatusSelector({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await updateTicketStatus(ticketId, newStatus);
      setStatus(newStatus);
      toast.success("Статус обновлен");
    } catch (error) {
      toast.error("Ошибка при обновлении статуса");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onValueChange={handleStatusChange}
        disabled={loading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Статус" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="OPEN">Открыто</SelectItem>
          <SelectItem value="IN_PROGRESS">В работе</SelectItem>
          <SelectItem value="CLOSED">Закрыто</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
