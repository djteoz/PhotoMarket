import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Star,
  Crown,
  Camera,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog/filters";
import { currentUser } from "@clerk/nextjs/server";
import { FavoriteButton } from "@/components/studios/favorite-button";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { getCitySlug } from "@/lib/cities";
import {
  getCachedStudios,
  getCachedCities,
  getCachedRoomsCount,
} from "@/app/actions/cached-queries";

export const metadata: Metadata = {
  title: "Каталог фотостудий",
  description:
    "Полный каталог фотостудий для аренды. Выбирайте из сотен залов по всей России с актуальными ценами и онлайн-бронированием.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();
  const { city, minPrice, maxPrice } = await searchParams;

  // Use cached queries for better performance
  const [studios, cities, totalRooms] = await Promise.all([
    getCachedStudios({
      city: typeof city === "string" ? city : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }),
    getCachedCities(),
    getCachedRoomsCount(),
  ]);

  // Sort: Premium first
  studios.sort((a, b) => {
    const isAPremium =
      a.owner?.subscriptionPlan === "BUSINESS" ||
      a.owner?.subscriptionPlan === "PRO";
    const isBPremium =
      b.owner?.subscriptionPlan === "BUSINESS" ||
      b.owner?.subscriptionPlan === "PRO";
    if (isAPremium && !isBPremium) return -1;
    if (!isAPremium && isBPremium) return 1;
    return 0;
  });

  let favoriteIds: string[] = [];
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { favorites: true },
    });
    if (dbUser) {
      favoriteIds = dbUser.favorites.map((f) => f.studioId);
    }
  }

  // Рейтинг студии (null если нет отзывов)
  const getAverageRating = (reviews: { rating: number }[]): number | null => {
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Каталог фотостудий
          </h1>
          <p className="text-slate-300 max-w-2xl">
            {studios.length} студий и {totalRooms} залов для аренды в{" "}
            {cities.length} городах России
          </p>

          {/* City Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {cities.slice(0, 8).map((c) => (
              <Link
                key={c.city}
                href={`/city/${getCitySlug(c.city)}`}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-colors",
                  city === c.city
                    ? "bg-white text-slate-900"
                    : "bg-white/10 hover:bg-white/20"
                )}
              >
                {c.city} ({c._count.city})
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold">Фильтры</h2>
              </div>
              <Suspense
                fallback={
                  <div className="animate-pulse bg-slate-100 h-64 rounded-xl" />
                }
              >
                <CatalogFilters />
              </Suspense>
            </div>
          </div>

          {/* Studios Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600">
                Найдено:{" "}
                <strong className="text-slate-900">{studios.length}</strong>{" "}
                студий
                {city && <span className="ml-1">в городе {city}</span>}
              </p>
            </div>
            {studios.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl">
                <Camera className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 text-lg mb-2">Студии не найдены</p>
                <p className="text-slate-500 text-sm mb-6">
                  Попробуйте изменить параметры поиска или выберите другой город
                </p>
                <Link href="/catalog">
                  <Button variant="outline">Сбросить фильтры</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {studios.map((studio) => {
                  const minStudioPrice =
                    studio.rooms.length > 0
                      ? Math.min(
                          ...studio.rooms.map((r) => Number(r.pricePerHour))
                        )
                      : null;

                  const isFavorite = favoriteIds.includes(studio.id);
                  const isPremium =
                    studio.owner?.subscriptionPlan === "BUSINESS" ||
                    studio.owner?.subscriptionPlan === "PRO";
                  const rating = getAverageRating(studio.reviews);

                  return (
                    <Link
                      href={`/studios/${studio.id}`}
                      key={studio.id}
                      className="group block h-full"
                    >
                      <Card
                        className={cn(
                          "overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border-0 shadow-md",
                          isPremium && "ring-2 ring-amber-400 bg-amber-50/30"
                        )}
                      >
                        <div className="relative h-52 bg-slate-100">
                          {studio.images[0] ? (
                            <Image
                              src={studio.images[0]}
                              alt={studio.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                              <Camera className="h-12 w-12" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Top badges */}
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                            <div className="flex gap-2">
                              {rating !== null ? (
                                <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {rating}
                                </div>
                              ) : (
                                <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 shadow-lg">
                                  Новая
                                </div>
                              )}
                              {isPremium && (
                                <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                  <Crown className="h-3 w-3" />
                                  PRO
                                </div>
                              )}
                            </div>
                            <div className="z-10">
                              <FavoriteButton
                                studioId={studio.id}
                                initialIsFavorite={isFavorite}
                                isIconOnly
                              />
                            </div>
                          </div>

                          {/* Bottom title */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-white font-semibold text-lg drop-shadow-lg line-clamp-1">
                              {studio.name}
                            </h3>
                          </div>
                        </div>

                        <CardContent className="flex-1 pt-4">
                          <div className="flex items-center text-slate-500 text-sm mb-3">
                            <MapPin className="h-4 w-4 mr-1.5 text-slate-400 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {studio.address || studio.city}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {studio.description}
                          </p>
                        </CardContent>

                        <CardFooter className="border-t pt-4 flex justify-between items-center">
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Building2 className="h-4 w-4" />
                            {studio.rooms.length}{" "}
                            {studio.rooms.length === 1
                              ? "зал"
                              : studio.rooms.length < 5
                              ? "зала"
                              : "залов"}
                          </div>
                          {minStudioPrice !== null && (
                            <div className="font-semibold text-slate-900">
                              от {minStudioPrice.toLocaleString("ru-RU")} ₽/час
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
