import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  MapPin,
  Calendar,
  Clock,
  Star,
  Shield,
  Building2,
  Heart,
  CreditCard,
  TrendingUp,
  Eye,
  BarChart3,
  ArrowRight,
  Camera,
} from "lucide-react";
import { Studio } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Image from "next/image";
import { BookingActions } from "@/components/booking/booking-actions";
import { OwnerCalendar } from "@/components/dashboard/owner-calendar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Личный кабинет — PhotoMarket",
  description: "Управляйте своими студиями, бронированиями и настройками",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      studios: {
        include: {
          rooms: true,
          reviews: true,
        },
      },
      bookings: {
        include: {
          room: {
            include: {
              studio: true,
            },
          },
        },
        orderBy: {
          startTime: "desc",
        },
      },
      favorites: {
        include: {
          studio: {
            include: {
              rooms: true,
              reviews: true,
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
        studios: {
          include: {
            rooms: true,
            reviews: true,
          },
        },
        bookings: {
          include: {
            room: {
              include: {
                studio: true,
              },
            },
          },
          orderBy: {
            startTime: "desc",
          },
        },
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

  const myBookings = dbUser.bookings;

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

  // Calculate statistics
  const totalRooms = dbUser.studios.reduce((acc, s) => acc + s.rooms.length, 0);
  const totalReviews = dbUser.studios.reduce(
    (acc, s) => acc + s.reviews.length,
    0,
  );
  const avgRating =
    totalReviews > 0
      ? (
          dbUser.studios.reduce(
            (acc, s) => acc + s.reviews.reduce((a, r) => a + r.rating, 0),
            0,
          ) / totalReviews
        ).toFixed(1)
      : null;
  const pendingBookings = incomingBookings.filter(
    (b) => b.status === "PENDING",
  ).length;
  const totalEarnings = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const stats = [
    {
      label: "Студии",
      value: dbUser.studios.length,
      icon: Building2,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Залы",
      value: totalRooms,
      icon: Camera,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Заявки",
      value: pendingBookings,
      icon: Calendar,
      color: "text-orange-600 bg-orange-100",
      highlight: pendingBookings > 0,
    },
    {
      label: "Избранное",
      value: dbUser.favorites.length,
      icon: Heart,
      color: "text-red-600 bg-red-100",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Добро пожаловать, {dbUser.name || "Пользователь"}!
              </h1>
              <p className="text-slate-300">
                Управляйте студиями, просматривайте бронирования и аналитику
              </p>
            </div>
            <div className="flex gap-3">
              {dbUser.role === "ADMIN" && (
                <Button variant="destructive" asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" /> Админ
                  </Link>
                </Button>
              )}
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                <Link href="/add-studio">
                  <Plus className="mr-2 h-4 w-4" /> Добавить студию
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg ${
                stat.highlight ? "ring-2 ring-orange-500" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Stats Row */}
      {dbUser.studios.length > 0 && (
        <section className="container mx-auto px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Заработано</p>
                <p className="text-2xl font-bold">
                  {totalEarnings.toLocaleString()} ₽
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Средний рейтинг</p>
                <p className="text-2xl font-bold">
                  {avgRating || "—"}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({totalReviews} отзывов)
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Всего бронирований
                </p>
                <p className="text-2xl font-bold">{incomingBookings.length}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="studios" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger
              value="studios"
              className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Мои студии
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Бронирования
            </TabsTrigger>
            <TabsTrigger
              value="incoming"
              className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 relative"
            >
              <Clock className="w-4 h-4 mr-2" />
              Заявки
              {pendingBookings > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  {pendingBookings}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Календарь
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <Heart className="w-4 h-4 mr-2" />
              Избранное
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Платежи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studios" className="space-y-4">
            {dbUser.studios.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  У вас пока нет студий
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Добавьте свою первую студию, чтобы начать принимать
                  бронирования и зарабатывать.
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-violet-600"
                >
                  <Link href="/add-studio">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить студию
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbUser.studios.map(
                  (
                    studio: Studio & {
                      rooms: { id: string }[];
                      reviews: { rating: number }[];
                    },
                  ) => {
                    const studioRating =
                      studio.reviews.length > 0
                        ? (
                            studio.reviews.reduce((a, r) => a + r.rating, 0) /
                            studio.reviews.length
                          ).toFixed(1)
                        : null;

                    return (
                      <Card
                        key={studio.id}
                        className="bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                      >
                        {/* Image Header */}
                        <div className="relative h-40 bg-gradient-to-br from-purple-500 to-violet-600">
                          {studio.images?.[0] ? (
                            <Image
                              src={studio.images[0]}
                              alt={studio.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Camera className="w-12 h-12 text-white/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {studioRating && (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {studioRating}
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-bold text-white text-lg truncate">
                              {studio.name}
                            </h3>
                            <div className="flex items-center text-white/80 text-sm gap-1">
                              <MapPin className="h-3 w-3" />
                              {studio.city}
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Camera className="w-4 h-4" />
                              {studio.rooms.length} залов
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {studio.reviews.length} отзывов
                            </span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                asChild
                              >
                                <Link href={`/studios/${studio.id}`}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  Просмотр
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600"
                                asChild
                              >
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
                    );
                  },
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {myBookings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Нет бронирований</h3>
                <p className="text-muted-foreground mb-6">
                  Вы ещё не забронировали ни одну студию
                </p>
                <Button variant="outline" asChild>
                  <Link href="/catalog">
                    Перейти в каталог
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className="bg-white dark:bg-slate-800 border-0 shadow-lg"
                  >
                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg">
                          {booking.room.name}{" "}
                          <span className="text-muted-foreground font-normal">
                            • {booking.room.studio.name}
                          </span>
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            {format(booking.startTime, "d MMMM yyyy", {
                              locale: ru,
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-purple-600" />
                            {format(booking.startTime, "HH:mm")} —{" "}
                            {format(booking.endTime, "HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {Number(booking.totalPrice).toLocaleString()} ₽
                          </div>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {booking.status === "CONFIRMED"
                              ? "Подтверждено"
                              : booking.status === "PENDING"
                                ? "Ожидание"
                                : booking.status === "CANCELLED"
                                  ? "Отменено"
                                  : booking.status}
                          </span>
                          {booking.isPaid && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 ml-1">
                              💳 Оплачено
                            </span>
                          )}
                          {!booking.isPaid && booking.status === "PENDING" && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 ml-1">
                              Ожидание оплаты
                            </span>
                          )}
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
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Нет входящих заявок</h3>
                <p className="text-muted-foreground">
                  Когда клиенты забронируют вашу студию, заявки появятся здесь
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingBookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className={`bg-white dark:bg-slate-800 border-0 shadow-lg ${
                      booking.status === "PENDING"
                        ? "ring-2 ring-orange-500"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg">
                          {booking.room.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Клиент:{" "}
                          <span className="font-medium text-foreground">
                            {booking.user.name || booking.user.email}
                          </span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            {format(booking.startTime, "d MMMM yyyy", {
                              locale: ru,
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-purple-600" />
                            {format(booking.startTime, "HH:mm")} —{" "}
                            {format(booking.endTime, "HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {Number(booking.totalPrice).toLocaleString()} ₽
                          </div>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {booking.status === "CONFIRMED"
                              ? "Подтверждено"
                              : booking.status === "PENDING"
                                ? "Ожидание"
                                : booking.status === "CANCELLED"
                                  ? "Отменено"
                                  : booking.status}
                          </span>
                          {booking.isPaid && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 ml-1">
                              💳 Оплачено
                            </span>
                          )}
                          {!booking.isPaid && booking.status === "PENDING" && (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 ml-1">
                              Ожидание оплаты
                            </span>
                          )}
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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <OwnerCalendar bookings={incomingBookings} />
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            {dbUser.favorites.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Избранное пусто</h3>
                <p className="text-muted-foreground mb-6">
                  Добавляйте понравившиеся студии в избранное
                </p>
                <Button variant="outline" asChild>
                  <Link href="/catalog">
                    Перейти в каталог
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbUser.favorites.map(({ studio }) => {
                  const minStudioPrice =
                    studio.rooms.length > 0
                      ? Math.min(
                          ...studio.rooms.map((r) => Number(r.pricePerHour)),
                        )
                      : null;

                  const averageRating =
                    studio.reviews && studio.reviews.length > 0
                      ? (
                          studio.reviews.reduce((acc, r) => acc + r.rating, 0) /
                          studio.reviews.length
                        ).toFixed(1)
                      : null;

                  return (
                    <Link
                      href={`/studios/${studio.id}`}
                      key={studio.id}
                      className="group relative block h-full"
                    >
                      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                        <div className="relative h-48 bg-gradient-to-br from-purple-500 to-violet-600">
                          {studio.images[0] ? (
                            <Image
                              src={studio.images[0]}
                              alt={studio.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Camera className="w-12 h-12 text-white/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute top-3 right-3">
                            <div className="bg-red-500 rounded-full p-1.5">
                              <Heart className="h-4 w-4 fill-white text-white" />
                            </div>
                          </div>
                          {averageRating && (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {averageRating}
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {studio.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 pt-0">
                          <div className="flex items-center text-muted-foreground text-sm mb-3">
                            <MapPin className="h-4 w-4 mr-1 text-purple-600" />
                            {studio.city}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {studio.description}
                          </p>

                          {minStudioPrice !== null && (
                            <div className="mt-4 font-bold text-lg text-purple-600">
                              от {minStudioPrice.toLocaleString()} ₽/час
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
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Нет платежей</h3>
                <p className="text-muted-foreground">
                  История ваших платежей будет отображаться здесь
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Дата</th>
                      <th className="px-6 py-4">Тип</th>
                      <th className="px-6 py-4">Сумма</th>
                      <th className="px-6 py-4">Способ</th>
                      <th className="px-6 py-4">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-6 py-4">
                          {format(payment.createdAt, "d MMMM yyyy HH:mm", {
                            locale: ru,
                          })}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {payment.type === "BOOKING"
                            ? "Бронирование"
                            : `Подписка ${payment.plan}`}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {Number(payment.amount).toLocaleString()} ₽
                        </td>
                        <td className="px-6 py-4">{payment.provider}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              payment.status === "SUCCEEDED"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : payment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
      </section>
    </div>
  );
}
