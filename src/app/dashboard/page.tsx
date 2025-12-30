import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Calendar, Clock, Star } from "lucide-react";
import { Studio } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Image from "next/image";
import { BookingActions } from "@/components/booking/booking-actions";
import { OwnerCalendar } from "@/components/dashboard/owner-calendar";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      studios: true,
      favorites: {
        include: {
          studio: {
            include: {
              rooms: true,
            },
          },
        },
      },
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
        favorites: {
          include: {
            studio: {
              include: {
                rooms: true,
              },
            },
          },
        },
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

  const payments = await prisma.payment.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
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
          <TabsTrigger value="calendar">Календарь</TabsTrigger>
          <TabsTrigger value="favorites">Избранное</TabsTrigger>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
        </TabsList>

        <TabsContent value="studios" className="space-y-4">
          {dbUser.studios.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">
                У вас пока нет студий
              </h3>
              <p className="text-gray-500 mb-4">
                Добавьте свою первую студию, чтобы начать принимать
                бронирования.
              </p>
              <Link href="/add-studio">
                <Button variant="outline">Добавить студию</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbUser.studios.map((studio: Studio) => (
                <Card
                  key={studio.id}
                  className="hover:shadow-md transition-shadow"
                >
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
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/studios/${studio.id}/edit`}>
                            Редактировать
                          </Link>
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
                          {format(booking.startTime, "d MMMM yyyy", {
                            locale: ru,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(booking.startTime, "HH:mm")} -{" "}
                          {format(booking.endTime, "HH:mm")}
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
                      <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                        isOwner={false}
                      />
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
                      <h3 className="font-bold text-lg">{booking.room.name}</h3>
                      <p className="text-sm text-gray-500">
                        Клиент: {booking.user.name || booking.user.email}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(booking.startTime, "d MMMM yyyy", {
                            locale: ru,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(booking.startTime, "HH:mm")} -{" "}
                          {format(booking.endTime, "HH:mm")}
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
                      <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                        isOwner={true}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <OwnerCalendar bookings={incomingBookings} />
        </TabsContent>

        <TabsContent value="favorites">
          {dbUser.favorites.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-gray-500">У вас пока нет избранных студий.</p>
              <Button variant="link" asChild>
                <Link href="/catalog">Перейти в каталог</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dbUser.favorites.map(({ studio }) => {
                const minStudioPrice =
                  studio.rooms.length > 0
                    ? Math.min(
                        ...studio.rooms.map((r) => Number(r.pricePerHour))
                      )
                    : null;

                return (
                  <Link
                    href={`/studios/${studio.id}`}
                    key={studio.id}
                    className="group relative block h-full"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="relative h-48 bg-gray-200">
                        {studio.images[0] ? (
                          <Image
                            src={studio.images[0]}
                            alt={studio.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            Нет фото
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          {/* We pass true because we are in favorites tab */}
                          <div className="bg-white rounded-full">
                            <Star className="h-5 w-5 fill-red-500 text-red-500 p-1" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          4.9
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="flex justify-between items-start">
                          <span>{studio.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {studio.city}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {studio.description}
                        </p>

                        {minStudioPrice !== null && (
                          <div className="mt-4 font-semibold text-primary">
                            от {minStudioPrice} ₽/час
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments">
          {payments.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-gray-500">История платежей пуста.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-3">Дата</th>
                    <th className="px-6 py-3">Тариф</th>
                    <th className="px-6 py-3">Сумма</th>
                    <th className="px-6 py-3">Способ</th>
                    <th className="px-6 py-3">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        {format(payment.createdAt, "d MMMM yyyy HH:mm", {
                          locale: ru,
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium">{payment.plan}</td>
                      <td className="px-6 py-4">{Number(payment.amount)} ₽</td>
                      <td className="px-6 py-4">{payment.provider}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === "SUCCEEDED"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status === "SUCCEEDED"
                            ? "Оплачено"
                            : payment.status === "PENDING"
                            ? "Ожидание"
                            : "Отменено"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
