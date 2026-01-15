import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  MessageSquare,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";

export default async function AdminDashboard() {
  const [
    usersCount,
    studiosCount,
    ticketsCount,
    bookingsCount,
    recentUsers,
    recentStudios,
    openTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.studio.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.booking.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        image: true,
      },
    }),
    prisma.studio.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, city: true, createdAt: true },
    }),
    prisma.supportTicket.findMany({
      where: { status: "OPEN" },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = [
    {
      title: "Пользователи",
      value: usersCount,
      icon: Users,
      description: "Всего зарегистрировано",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Студии",
      value: studiosCount,
      icon: Building2,
      description: "Активных студий",
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      title: "Обращения",
      value: ticketsCount,
      icon: MessageSquare,
      description: "Открытых тикетов",
      alert: ticketsCount > 0,
      color:
        ticketsCount > 0
          ? "from-red-500 to-red-600"
          : "from-emerald-500 to-emerald-600",
      bgColor: ticketsCount > 0 ? "bg-red-50" : "bg-emerald-50",
      textColor: ticketsCount > 0 ? "text-red-600" : "text-emerald-600",
    },
    {
      title: "Бронирования",
      value: bookingsCount,
      icon: Calendar,
      description: "Всего бронирований",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Панель управления
          </h2>
          <p className="text-slate-500 mt-1">
            Добро пожаловать в админ-панель PhotoMarket
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          {format(new Date(), "d MMMM yyyy, HH:mm", { locale: ru })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Новые пользователи
            </CardTitle>
            <Link
              href="/admin/users"
              className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              Все <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUsers.length > 0 ? (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium overflow-hidden">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0) || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {user.name || "Без имени"}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {format(user.createdAt, "dd.MM.yy", { locale: ru })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                Пока нет пользователей
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Studios */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Новые студии
            </CardTitle>
            <Link
              href="/admin/studios"
              className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              Все <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentStudios.length > 0 ? (
              recentStudios.map((studio) => (
                <div
                  key={studio.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {studio.name}
                    </p>
                    <p className="text-sm text-slate-500">{studio.city}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {format(studio.createdAt, "dd.MM.yy", { locale: ru })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                Пока нет студий
              </p>
            )}
          </CardContent>
        </Card>

        {/* Open Tickets */}
        <Card className="border-0 shadow-sm bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Открытые обращения
              {ticketsCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                  {ticketsCount}
                </span>
              )}
            </CardTitle>
            <Link
              href="/admin/tickets"
              className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              Все обращения <ArrowUpRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {openTickets.length > 0 ? (
              <div className="space-y-3">
                {openTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">
                          от {ticket.name || ticket.email}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">
                          {format(ticket.createdAt, "dd MMM, HH:mm", {
                            locale: ru,
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-slate-600 font-medium">
                  Нет открытых обращений
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Все тикеты обработаны
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
