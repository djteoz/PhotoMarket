import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Share, Edit } from "lucide-react";
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

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const studio = await prisma.studio.findUnique({
    where: { id },
    select: { name: true, description: true, images: true },
  });

  if (!studio) {
    return {
      title: "Студия не найдена",
    };
  }

  return {
    title: `${studio.name} | PhotoMarket`,
    description: studio.description?.slice(0, 160) || "Аренда фотостудии",
    openGraph: {
      images: studio.images[0] ? [studio.images[0]] : [],
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
  let hasCompletedBooking = false;

  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { favorites: true },
    });

    if (dbUser) {
      isFavorite = dbUser.favorites.some((f) => f.studioId === studio.id);

      // Check if user has completed booking to allow review
      const booking = await prisma.booking.findFirst({
        where: {
          userId: dbUser.id,
          room: { studioId: studio.id },
          status: "COMPLETED",
        },
      });
      hasCompletedBooking = !!booking;
    }
  }

  const averageRating =
    studio.reviews.length > 0
      ? studio.reviews.reduce((acc, review) => acc + review.rating, 0) /
        studio.reviews.length
      : 0;

  const isOwner = user?.id === studio.owner.clerkId;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{studio.name}</h1>
          <div className="flex items-center text-gray-600 gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {studio.city}, {studio.address}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {averageRating > 0 ? averageRating.toFixed(1) : "Нет оценок"} (
              {studio.reviews.length} отзывов)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <Button variant="outline" asChild>
              <Link href={`/studios/${studio.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" /> Редактировать
              </Link>
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Share className="h-4 w-4" />
          </Button>
          <FavoriteButton studioId={studio.id} initialIsFavorite={isFavorite} />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] mb-12 rounded-xl overflow-hidden">
        <div className="md:col-span-2 h-full bg-gray-200 relative">
          {studio.images[0] ? (
            <Image
              src={studio.images[0]}
              alt={studio.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Нет фото
            </div>
          )}
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <div className="bg-gray-100 relative">
            {studio.images[1] && (
              <Image
                src={studio.images[1]}
                alt={`${studio.name} 2`}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="bg-gray-100 relative">
            {studio.images[2] && (
              <Image
                src={studio.images[2]}
                alt={`${studio.name} 3`}
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <div className="bg-gray-100 relative">
            {studio.images[3] && (
              <Image
                src={studio.images[3]}
                alt={`${studio.name} 4`}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="bg-gray-100 relative">
            {studio.images[4] && (
              <Image
                src={studio.images[4]}
                alt={`${studio.name} 5`}
                fill
                className="object-cover"
              />
            )}
            {studio.images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:bg-black/60 transition-colors">
                +{studio.images.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">О студии</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {studio.description || "Описание отсутствует."}
            </p>
          </section>

          {studio.lat && studio.lng && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Расположение</h2>
              <SearchMap studios={[studio]} />
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-4">
              Залы ({studio.rooms.length})
            </h2>
            {studio.rooms.length > 0 ? (
              <div className="space-y-4">
                {studio.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border rounded-lg p-4 flex gap-4"
                  >
                    <div className="w-32 h-24 bg-gray-100 rounded-md flex-shrink-0 relative overflow-hidden">
                      {room.images[0] ? (
                        <Image
                          src={room.images[0]}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{room.name}</h3>
                      <p className="text-sm text-gray-500">
                        {room.area} м² • {Number(room.pricePerHour)} ₽/час
                      </p>
                      {room.hasNaturalLight && (
                        <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Естественный свет
                        </span>
                      )}
                    </div>
                    <div className="ml-auto self-center flex flex-col gap-2">
                      {isOwner && (
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
                          <Button>Забронировать</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Бронирование: {room.name}</DialogTitle>
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
              <p className="text-gray-500">
                В этой студии пока нет добавленных залов.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Отзывы</h2>

            {user && !isOwner && hasCompletedBooking && (
              <div className="mb-8">
                <AddReviewForm studioId={studio.id} />
              </div>
            )}

            {user && !isOwner && !hasCompletedBooking && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                Чтобы оставить отзыв, необходимо завершить хотя бы одно
                бронирование в этой студии.
              </div>
            )}

            <div className="space-y-6">
              {studio.reviews.length > 0 ? (
                studio.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {review.user.image ? (
                            <Image
                              src={review.user.image}
                              alt={review.user.name || "User"}
                              width={32}
                              height={32}
                            />
                          ) : (
                            <span className="text-xs font-bold text-gray-500">
                              {(review.user.name ||
                                review.user.email ||
                                "U")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {review.user.name || "Пользователь"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(review.createdAt, "d MMMM yyyy", {
                              locale: ru,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm mt-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Отзывов пока нет. Будьте первым!
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="border rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4">Контакты</h3>
            <div className="space-y-3 text-sm">
              {studio.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Телефон</span>
                  <span className="font-medium">{studio.phone}</span>
                </div>
              )}
              {studio.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{studio.email}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                {!isOwner && user ? (
                  <ContactOwnerButton
                    ownerId={studio.owner.id}
                    studioName={studio.name}
                  />
                ) : !user ? (
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/sign-in">Войти, чтобы написать</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
