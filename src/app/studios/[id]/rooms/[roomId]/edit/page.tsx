import { AddRoomForm } from "@/components/rooms/add-room-form";
import { ICalSettings } from "@/components/rooms/ical-settings";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Camera, Edit, Calendar } from "lucide-react";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const user = await currentUser();
  const { id, roomId } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { studio: { include: { owner: true } } },
  });

  if (!room) {
    notFound();
  }

  if (room.studioId !== id) {
    notFound();
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (room.studio.owner.clerkId !== user.id && dbUser?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={`/studios/${id}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к студии
          </Link>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Edit className="w-8 h-8 text-purple-400" />
            Редактировать зал
          </h1>
          <p className="text-slate-300">
            {room.name} • {room.studio.name}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Room Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600" />
                Информация о зале
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Обновите данные зала
              </p>
            </div>
            <div className="p-6">
              <AddRoomForm studioId={id} initialData={room} />
            </div>
          </div>

          {/* iCal Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Синхронизация календаря
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Настройки iCal для интеграции с внешними календарями
              </p>
            </div>
            <div className="p-6">
              <ICalSettings room={room} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
