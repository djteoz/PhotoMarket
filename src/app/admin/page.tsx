import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, MessageSquare, Calendar } from "lucide-react";

export default async function AdminDashboard() {
  const [usersCount, studiosCount, ticketsCount, bookingsCount] = await Promise.all([
    prisma.user.count(),
    prisma.studio.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.booking.count(),
  ]);

  const stats = [
    {
      title: "Пользователи",
      value: usersCount,
      icon: Users,
      description: "Всего зарегистрировано",
    },
    {
      title: "Студии",
      value: studiosCount,
      icon: Building2,
      description: "Активных студий",
    },
    {
      title: "Обращения",
      value: ticketsCount,
      icon: MessageSquare,
      description: "Открытых тикетов",
      alert: ticketsCount > 0,
    },
    {
      title: "Бронирования",
      value: bookingsCount,
      icon: Calendar,
      description: "Всего бронирований",
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Панель управления</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.alert ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Последние регистрации</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Здесь будет график или список последних регистраций.
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Последние обращения</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Здесь будет список последних тикетов.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
