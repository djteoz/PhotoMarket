"use client";

import { toggleUserBan } from "@/app/actions/ban-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Ban, CheckCircle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BanUserButton({
  userId,
  isBanned,
  disabled,
}: {
  userId: string;
  isBanned: boolean;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleBanToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleUserBan(
        userId,
        !isBanned,
        isBanned ? undefined : reason
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isBanned ? "Пользователь разблокирован" : "Пользователь заблокирован"
        );
        setOpen(false);
      }
    } catch (error) {
      toast.error("Ошибка при изменении статуса блокировки");
    } finally {
      setLoading(false);
    }
  };

  if (isBanned) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={handleBanToggle}
        disabled={loading || disabled}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Разбанить
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={disabled}
        >
          <Ban className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Блокировка пользователя</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите заблокировать этого пользователя? Он потеряет
            доступ к сайту.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right">
              Причина
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3"
              placeholder="Нарушение правил..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleBanToggle}
            disabled={loading}
          >
            {loading ? "Блокировка..." : "Заблокировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
