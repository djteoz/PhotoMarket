"use client";

import { banIp, unbanIp } from "@/app/actions/ban-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Trash2,
  Shield,
  Plus,
  Globe,
  ShieldAlert,
  ShieldOff,
} from "lucide-react";
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Безопасность</h2>
          <p className="text-slate-500 mt-1">
            Управление IP-адресами и защита платформы
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span className="font-semibold text-red-600">{bannedIps.length}</span>
          <span className="text-slate-500">заблокировано</span>
        </div>
      </div>

      {/* Ban Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
            <Plus className="w-5 h-5 text-violet-600" />
            Заблокировать IP
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleBan} className="flex gap-4 items-end flex-wrap">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                IP адрес
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="192.168.1.1"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-48 pl-9"
                />
              </div>
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-slate-700">
                Причина
              </label>
              <Input
                placeholder="Спам, атака, подозрительная активность..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Заблокировать
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Blocked IPs Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">
                  IP адрес
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Причина
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Дата блокировки
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bannedIps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <ShieldOff className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Заблокированных IP нет</p>
                    <p className="text-slate-400 text-sm mt-1">Все чисто!</p>
                  </TableCell>
                </TableRow>
              ) : (
                bannedIps.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-red-600" />
                        </div>
                        <code className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {item.ip}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item.reason || (
                        <span className="text-slate-400">Не указана</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm", {
                        locale: ru,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleUnban(item.ip)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Разблокировать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
