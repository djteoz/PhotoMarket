import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Mail,
  User,
  Calendar,
  MessageSquare,
  Send,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { TicketStatusSelector } from "@/components/admin/ticket-status-selector";

export default async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
  });

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">
          Обращение не найдено
        </h2>
        <p className="text-slate-500 mt-1">Возможно, оно было удалено</p>
        <Button asChild className="mt-4">
          <Link href="/admin/tickets">Вернуться к списку</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="hover:bg-violet-50 hover:border-violet-300"
        >
          <Link href="/admin/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Обращение #{ticket.id.slice(-4)}
          </h2>
          <p className="text-slate-500 text-sm">Детали тикета поддержки</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg text-slate-900">
                {ticket.subject}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-4 bg-slate-50 rounded-lg whitespace-pre-wrap text-slate-700 leading-relaxed">
                {ticket.message}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg text-slate-900">
                Информация
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Статус
                </span>
                <TicketStatusSelector
                  ticketId={ticket.id}
                  currentStatus={ticket.status}
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Отправитель
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-slate-900">
                    {ticket.name}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Email
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-slate-600" />
                  </div>
                  <a
                    href={`mailto:${ticket.email}`}
                    className="text-violet-600 hover:text-violet-700 hover:underline font-medium"
                  >
                    {ticket.email}
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Дата создания
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-slate-700">
                    {format(ticket.createdAt, "dd MMM yyyy, HH:mm", {
                      locale: ru,
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  <a
                    href={`mailto:${
                      ticket.email
                    }?subject=Re: ${encodeURIComponent(ticket.subject)}`}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Ответить на Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
