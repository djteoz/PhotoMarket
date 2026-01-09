import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, User, Calendar } from "lucide-react";
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
    return <div>Обращение не найдено</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">
          Обращение #{ticket.id.slice(-4)}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{ticket.subject}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                {ticket.message}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Статус</span>
                <TicketStatusSelector
                  ticketId={ticket.id}
                  currentStatus={ticket.status}
                />
              </div>

              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">
                  Отправитель
                </span>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{ticket.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Email</span>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${ticket.email}`}
                    className="text-primary hover:underline"
                  >
                    {ticket.email}
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">
                  Дата создания
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(ticket.createdAt, "dd MMM yyyy HH:mm", {
                      locale: ru,
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full">
                  <a
                    href={`mailto:${
                      ticket.email
                    }?subject=Re: ${encodeURIComponent(ticket.subject)}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
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
