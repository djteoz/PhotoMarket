import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Eye } from "lucide-react";
import { DeleteStudioButton } from "@/components/admin/delete-studio-button";

export default async function AdminStudiosPage() {
  const studios = await prisma.studio.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Студии</h2>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Город</TableHead>
              <TableHead>Владелец</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studios.map((studio) => (
              <TableRow key={studio.id}>
                <TableCell className="font-medium">{studio.name}</TableCell>
                <TableCell>{studio.city}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{studio.owner.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {studio.owner.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {format(studio.createdAt, "dd MMM yyyy", { locale: ru })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/studios/${studio.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteStudioButton studioId={studio.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {studios.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Студий пока нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
