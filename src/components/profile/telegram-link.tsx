"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, Link2, Unlink, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function TelegramLink() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLinked, setIsLinked] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    fetchLinkStatus();
  }, []);

  async function fetchLinkStatus() {
    try {
      const res = await fetch("/api/telegram/link");
      if (res.ok) {
        const data = await res.json();
        setIsLinked(data.linked);
        setLinkUrl(data.linkUrl);
      }
    } catch (error) {
      console.error("Failed to fetch Telegram link status:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnlink() {
    setIsUnlinking(true);
    try {
      const res = await fetch("/api/telegram/link", { method: "DELETE" });
      if (res.ok) {
        setIsLinked(false);
        toast.success("Telegram отвязан");
      } else {
        toast.error("Не удалось отвязать Telegram");
      }
    } catch (error) {
      console.error("Failed to unlink Telegram:", error);
      toast.error("Ошибка при отвязке");
    } finally {
      setIsUnlinking(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          Telegram уведомления
        </CardTitle>
        <CardDescription>
          Получайте уведомления о бронированиях и отзывах прямо в Telegram
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLinked ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Link2 className="h-4 w-4" />
              <span className="text-sm font-medium">Telegram привязан</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Вы будете получать уведомления о новых бронированиях, изменениях
              статуса и отзывах.
            </p>
            <Button
              variant="outline"
              onClick={handleUnlink}
              disabled={isUnlinking}
            >
              {isUnlinking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Отвязать Telegram
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Привяжите Telegram, чтобы получать мгновенные уведомления о:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Новых бронированиях</li>
              <li>Изменениях статуса</li>
              <li>Новых отзывах</li>
            </ul>
            {linkUrl && (
              <Button asChild>
                <a href={linkUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Привязать Telegram
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
