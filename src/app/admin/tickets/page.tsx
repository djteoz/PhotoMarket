import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
} from "lucide-react";

export default async function AdminTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Статистика по статусам
  const statusStats = {
    OPEN: tickets.filter((t) => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    CLOSED: tickets.filter((t) => t.status === "CLOSED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Обращения в поддержку
          </h2>
          <p className="text-slate-500 mt-1">
            Управление тикетами и запросами пользователей
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg">
          <MessageSquare className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-orange-600">
            {tickets.length}
          </span>
          <span className="text-slate-500">обращений</span>
        </div>
      </div>

      {/* Status Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-200">
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span className="text-sm text-red-700">
            Открыто: {statusStats.OPEN}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span className="text-sm text-amber-700">
            В работе: {statusStats.IN_PROGRESS}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          <span className="text-sm text-green-700">
            Закрыто: {statusStats.CLOSED}
          </span>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">
                  Дата
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Тема
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Отправитель
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Статус
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-slate-500">
                    <div className="flex flex-col">
                      <span>
                        {format(ticket.createdAt, "dd MMM yyyy", {
                          locale: ru,
                        })}
                      </span>
                      <span className="text-xs">
                        {format(ticket.createdAt, "HH:mm")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-900">
                      {ticket.subject}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {ticket.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-900">{ticket.name}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {ticket.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        ticket.status === "OPEN"
                          ? "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                          : ticket.status === "IN_PROGRESS"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
                          : "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                      }
                      variant="outline"
                    >
                      {ticket.status === "OPEN"
                        ? "Открыто"
                        : ticket.status === "IN_PROGRESS"
                        ? "В работе"
                        : "Закрыто"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                    >
                      <Link href={`/admin/tickets/${ticket.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Просмотр
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Обращений пока нет</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
