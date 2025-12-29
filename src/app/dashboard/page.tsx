import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Calendar, Clock } from "lucide-react";
import { Studio } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      studios: true,
    },
  });

  if (!dbUser) {
    // Sync user if not found
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        image: user.imageUrl,
      },
      include: {
        studios: true,
      },
    });
  }

  const myBookings = await prisma.booking.findMany({
    where: { userId: dbUser.id },
    include: {
      room: {
        include: {
          studio: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  const incomingBookings = await prisma.booking.findMany({
    where: {
      room: {
        studio: {
          ownerId: dbUser.id,
        },
      },
    },
    include: {
      user: true,
      room: {
        include: {
          studio: true,
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        <Link href="/add-studio">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Добавить студию
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="studios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="studios">Мои студии</TabsTrigger>
          <TabsTrigger value="bookings">Мои бронирования</TabsTrigger>
          <TabsTrigger value="incoming">Входящие заявки</TabsTrigger>
        </TabsList>

        <TabsContent value="studios" className="space-y-4">
          {dbUser.studios.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">У вас пока нет студий</h3>
              <p className="text-gray-500 mb-4">
                Добавьте свою первую студию, чтобы начать принимать бронирования.
              </p>
              <Link href="/add-studio">
                <Button variant="outline">Добавить студию</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbUser.studios.map((studio: Studio) => (
                <Card key={studio.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>{studio.name}</CardTitle>
                    <div className="flex items-center text-gray-500 text-sm gap-1">
                      <MapPin className="h-4 w-4" />
                      {studio.city}, {studio.address}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {studio.description || "Нет описания"}
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/studios/${studio.id}`}>Просмотр</Link>
                        </Button>
                        <Button size="sm" className="w-full">
                          Редактировать
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        asChild
                      >
                        <Link href={`/studios/${studio.id}/add-room`}>
                          <Plus className="mr-2 h-3 w-3" /> Добавить зал
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          {myBookings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-gray-500">У вас пока нет бронирований.</p>
              <Button variant="link" asChild>
                <Link href="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {booking.room.name} ({booking.room.studio.name})
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(booking.startTime, "d MMMM yyyy", { locale: ru })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(booking.startTime, "HH:mm")} - {format(booking.endTime, "HH:mm")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {Number(booking.totalPrice)} ₽
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {booking.status.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="incoming">
          {incomingBookings.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-gray-500">Входящих заявок пока нет.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {booking.room.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Клиент: {booking.user.name || booking.user.email}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(booking.startTime, "d MMMM yyyy", { locale: ru })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(booking.startTime, "HH:mm")} - {format(booking.endTime, "HH:mm")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {Number(booking.totalPrice)} ₽
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {booking.status.toLowerCase()}
                        </div>
                      </div>
                      {booking.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">Подтвердить</Button>
                          <Button size="sm" variant="destructive">Отклонить</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
