import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Star,
  Share,
  Edit,
  Phone,
  Mail,
  Clock,
  Building2,
  Sun,
  Camera,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import { BookingForm } from "@/components/booking/booking-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { currentUser } from "@clerk/nextjs/server";
import { FavoriteButton } from "@/components/studios/favorite-button";
import Link from "next/link";

import { AddReviewForm } from "@/components/reviews/add-review-form";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import SearchMap from "@/components/search/search-map-wrapper";
import { ContactOwnerButton } from "@/components/studios/contact-owner-button";
import { Metadata } from "next";
import { StudioJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ViewTracker } from "@/components/analytics/view-tracker";
import { StudioGallery } from "@/components/studios/studio-gallery";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.photomarket.tech";

  const studio = await prisma.studio.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      images: true,
      city: true,
      address: true,
    },
  });

  if (!studio) {
    return {
      title: "Студия не найдена | PhotoMarket",
    };
  }

  const description =
    studio.description?.slice(0, 155) ||
    `Фотостудия ${studio.name} в ${studio.city}. Бронируйте онлайн на PhotoMarket.`;

  return {
    title: `${studio.name} — фотостудия в ${studio.city} | PhotoMarket`,
    description,
    keywords: [
      "фотостудия",
      studio.city,
      "аренда фотостудии",
      "съемка",
      studio.name,
      "бронирование фотостудии",
    ],
    alternates: {
      canonical: `${baseUrl}/studios/${id}`,
    },
    openGraph: {
      title: `${studio.name} — фотостудия в ${studio.city}`,
      description,
      url: `${baseUrl}/studios/${id}`,
      siteName: "PhotoMarket",
      images: studio.images[0]
        ? [
            {
              url: studio.images[0],
              width: 1200,
              height: 630,
              alt: studio.name,
            },
          ]
        : [],
      locale: "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${studio.name} — фотостудия в ${studio.city}`,
      description,
      images: studio.images[0] ? [studio.images[0]] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function StudioPage({ params }: Props) {
  const user = await currentUser();
  const { id } = await params;

  const studio = await prisma.studio.findUnique({
    where: { id },
    include: {
      rooms: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      owner: true,
    },
  });

  if (!studio) {
    notFound();
  }

  let dbUser = null;
  let isFavorite = false;

  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { favorites: true },
    });

    if (dbUser) {
      isFavorite = dbUser.favorites.some((f) => f.studioId === studio.id);
    }
  }

  const averageRating =
    studio.reviews.length > 0
      ? studio.reviews.reduce((acc, review) => acc + review.rating, 0) /
        studio.reviews.length
      : 0;

  const isStudioOwner = user?.id === studio.owner.clerkId;
  const canManageStudio =
    isStudioOwner ||
    dbUser?.role === "ADMIN" ||
    dbUser?.role === "OWNER";

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.photomarket.tech";

  return (
    <>
      {/* JSON-LD структурированные данные */}
      <StudioJsonLd
        studio={studio}
        rooms={studio.rooms.map((r) => ({
          name: r.name,
          pricePerHour: Number(r.pricePerHour),
        }))}
        reviews={studio.reviews}
        averageRating={averageRating}
        reviewCount={studio.reviews.length}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", url: baseUrl },
          { name: "Каталог", url: `${baseUrl}/catalog` },
          {
            name: studio.city,
            url: `${baseUrl}/search?city=${encodeURIComponent(studio.city)}`,
          },
          { name: studio.name, url: `${baseUrl}/studios/${studio.id}` },
        ]}
      />

      {/* Track page views */}
      <ViewTracker studioId={studio.id} />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Hero Header */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                  <Link
                    href="/catalog"
                    className="hover:text-white transition-colors"
                  >
                    Каталог
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/search?city=${encodeURIComponent(studio.city)}`}
                    className="hover:text-white transition-colors"
                  >
                    {studio.city}
                  </Link>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {studio.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    {studio.city}, {studio.address}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-medium">
                      {averageRating > 0 ? averageRating.toFixed(1) : "Новая"}
                    </span>
                    <span className="text-slate-400">
                      ({studio.reviews.length} отзывов)
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Building2 className="h-4 w-4 text-purple-400" />
                    {studio.rooms.length}{" "}
                    {studio.rooms.length === 1
                      ? "зал"
                      : studio.rooms.length < 5
                        ? "зала"
                        : "залов"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {canManageStudio && (
                  <Button variant="secondary" asChild>
                    <Link href={`/studios/${studio.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" /> Редактировать
                    </Link>
                  </Button>
                )}
                <Button variant="secondary" size="icon">
                  <Share className="h-4 w-4" />
                </Button>
                <FavoriteButton
                  studioId={studio.id}
                  initialIsFavorite={isFavorite}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Gallery с лайтбоксом */}
        <div className="container mx-auto px-4 -mt-4 relative z-10">
          <StudioGallery images={studio.images} studioName={studio.name} />
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />О студии
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {studio.description || "Описание отсутствует."}
                </p>
              </section>

              {/* Map Section */}
              {studio.lat && studio.lng && (
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Расположение
                  </h2>
                  <SearchMap studios={[studio]} />
                </section>
              )}

              {/* Rooms Section */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  Залы ({studio.rooms.length})
                </h2>
                {studio.rooms.length > 0 ? (
                  <div className="space-y-4">
                    {studio.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow"
                      >
                        <div className="w-full md:w-40 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex-shrink-0 relative overflow-hidden">
                          {room.images[0] ? (
                            <Image
                              src={room.images[0]}
                              alt={room.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Camera className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2">
                            {room.name}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {room.area} м²
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-purple-600">
                              {Number(room.pricePerHour).toLocaleString()} ₽/час
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {room.hasNaturalLight && (
                              <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2.5 py-1 rounded-full">
                                <Sun className="w-3 h-3" />
                                Естественный свет
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 md:self-center">
                          {canManageStudio && (
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={`/studios/${studio.id}/rooms/${room.id}/edit`}
                              >
                                <Edit className="h-3 w-3 mr-1" /> Ред.
                              </Link>
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                                Забронировать
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>
                                  Бронирование: {room.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Выберите дату и время для бронирования.
                                </DialogDescription>
                              </DialogHeader>
                              <BookingForm
                                roomId={room.id}
                                pricePerHour={Number(room.pricePerHour)}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Camera className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>В этой студии пока нет добавленных залов.</p>
                  </div>
                )}
              </section>

              {/* Reviews Section */}
              <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Отзывы ({studio.reviews.length})
                </h2>

                {user && !isStudioOwner && (
                  <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <AddReviewForm studioId={studio.id} />
                  </div>
                )}

                {!user && (
                  <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <Link
                      href="/sign-in"
                      className="text-purple-600 hover:underline font-medium"
                    >
                      Войдите
                    </Link>
                    , чтобы оставить отзыв.
                  </div>
                )}

                <div className="space-y-6">
                  {studio.reviews.length > 0 ? (
                    studio.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-slate-100 dark:border-slate-700 pb-6 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center overflow-hidden">
                              {review.user.image ? (
                                <Image
                                  src={review.user.image}
                                  alt={review.user.name || "User"}
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              ) : (
                                <span className="text-sm font-bold text-white">
                                  {(review.user.name ||
                                    review.user.email ||
                                    "U")[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {review.user.name || "Пользователь"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {format(review.createdAt, "d MMMM yyyy", {
                                  locale: ru,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-200 dark:text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-slate-600 dark:text-slate-300 text-sm pl-13">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Отзывов пока нет. Будьте первым!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  Контакты
                </h3>
                <div className="space-y-4">
                  {studio.phone && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Телефон</p>
                        <p className="font-medium">{studio.phone}</p>
                      </div>
                    </div>
                  )}
                  {studio.email && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium">{studio.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    {!isOwner && user ? (
                      <ContactOwnerButton
                        ownerId={studio.owner.id}
                        studioName={studio.name}
                      />
                    ) : !user ? (
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                        size="lg"
                        asChild
                      >
                        <Link href="/sign-in">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Войти, чтобы написать
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
                <h3 className="font-bold mb-3 text-purple-700 dark:text-purple-300">
                  Быстрая информация
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-purple-500" />
                    Мгновенное бронирование
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    {studio.rooms.length} залов для аренды
                  </li>
                  {studio.rooms.length > 0 && (
                    <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      от{" "}
                      {Math.min(
                        ...studio.rooms.map((r) => Number(r.pricePerHour)),
                      ).toLocaleString()}{" "}
                      ₽/час
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
