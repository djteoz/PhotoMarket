"use client";

import { banIp, unbanIp } from "@/app/actions/ban-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BannedIp {
  id: string;
  ip: string;
  reason: string | null;
  createdAt: Date;
}

export default function SecurityPage({
  initialBannedIps,
}: {
  initialBannedIps: BannedIp[];
}) {
  const [bannedIps, setBannedIps] = useState<BannedIp[]>(initialBannedIps);
  const [newIp, setNewIp] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;

    setLoading(true);
    try {
      const result = await banIp(newIp, reason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("IP адрес заблокирован");
        setNewIp("");
        setReason("");
        // Optimistic update or refresh needed.
        // For simplicity, we just reload via server action implicitly or manual refresh.
        // But since we pass initialBannedIps, we should ideally re-fetch.
        // Let's just create a fake record for UI feedback or rely on revalidation.
        setBannedIps([
          ...bannedIps,
          {
            id: Date.now().toString(),
            ip: newIp,
            reason: reason || null,
            createdAt: new Date(),
          },
        ]);
      }
    } catch (error) {
      toast.error("Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (ip: string) => {
    try {
      await unbanIp(ip);
      setBannedIps(bannedIps.filter((item) => item.ip !== ip));
      toast.success("IP разблокирован");
    } catch (error) {
      toast.error("Ошибка");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Безопасность</h2>
      </div>

      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h3 className="text-lg font-medium">Заблокировать IP</h3>
        <form onSubmit={handleBan} className="flex gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">IP адрес</label>
            <Input
              placeholder="192.168.1.1"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Причина</label>
            <Input
              placeholder="Спам, атака..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            Забанить
          </Button>
        </form>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP</TableHead>
              <TableHead>Причина</TableHead>
              <TableHead>Дата блокировки</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bannedIps.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Список пуст
                </TableCell>
              </TableRow>
            ) : (
              bannedIps.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.ip}</TableCell>
                  <TableCell>{item.reason || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(item.createdAt), "dd MMM yyyy HH:mm", {
                      locale: ru,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleUnban(item.ip)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
