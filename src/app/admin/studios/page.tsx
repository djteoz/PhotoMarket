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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Eye, Building2, MapPin } from "lucide-react";
import { DeleteStudioButton } from "@/components/admin/delete-studio-button";

export default async function AdminStudiosPage() {
  const studios = await prisma.studio.findMany({
    include: { owner: true, _count: { select: { rooms: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Группировка по городам
  const cityCounts = studios.reduce((acc, s) => {
    acc[s.city] = (acc[s.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Студии</h2>
          <p className="text-slate-500 mt-1">
            Управление фотостудиями на платформе
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 rounded-lg">
          <Building2 className="w-5 h-5 text-violet-600" />
          <span className="font-semibold text-violet-600">
            {studios.length}
          </span>
          <span className="text-slate-500">студий</span>
        </div>
      </div>

      {/* City Stats */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(cityCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([city, count]) => (
            <div
              key={city}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-sm"
            >
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700">{city}</span>
              <span className="text-slate-400">({count})</span>
            </div>
          ))}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">
                  Название
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Город
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Залы
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Владелец
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Дата создания
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studios.map((studio) => (
                <TableRow key={studio.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-slate-900">
                        {studio.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-slate-100 rounded-md text-sm text-slate-600">
                      {studio.city}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600">
                      {studio._count.rooms}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-slate-900">
                        {studio.owner.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {studio.owner.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {format(studio.createdAt, "dd MMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="hover:bg-violet-50 hover:text-violet-600"
                      >
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
                  <TableCell colSpan={6} className="text-center py-12">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Студий пока нет</p>
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
