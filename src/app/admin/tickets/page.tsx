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
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function AdminTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Обращения в поддержку
        </h2>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Тема</TableHead>
              <TableHead>Отправитель</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  {format(ticket.createdAt, "dd MMM yyyy HH:mm", {
                    locale: ru,
                  })}
                </TableCell>
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{ticket.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {ticket.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ticket.status === "OPEN" ? "destructive" : "secondary"
                    }
                  >
                    {ticket.status === "OPEN" ? "Открыто" : ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/tickets/${ticket.id}`}>Просмотр</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tickets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Обращений пока нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
