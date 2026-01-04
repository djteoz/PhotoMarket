"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Room } from "@prisma/client";
import { Copy, RefreshCw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { updateRoomIcal } from "@/app/actions/room";

interface ICalSettingsProps {
  room: Room;
}

export function ICalSettings({ room }: ICalSettingsProps) {
  const [importUrl, setImportUrl] = useState(room.icalImportUrl || "");
  const [isLoading, setIsLoading] = useState(false);

  const exportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/ical/${room.icalExportToken}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportUrl);
    toast.success("Ссылка скопирована");
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateRoomIcal(room.id, importUrl);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Настройки сохранены");
      }
    } catch (error) {
      toast.error("Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Синхронизация календаря (iCal)</CardTitle>
        <CardDescription>
          Подключите Google Calendar, Airbnb или Booking.com
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Экспорт (Ваша ссылка)</Label>
          <div className="flex gap-2">
            <Input value={exportUrl} readOnly className="bg-muted" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Вставьте эту ссылку в Google Calendar (&quot;Добавить по URL&quot;), чтобы
            видеть бронирования отсюда.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Импорт (Ссылка с другого сайта)</Label>
          <div className="flex gap-2">
            <Input
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://calendar.google.com/..."
            />
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Вставьте ссылку .ics из внешнего календаря, чтобы автоматически
            закрывать слоты здесь.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
