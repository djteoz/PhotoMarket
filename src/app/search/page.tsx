import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPin,
  Star,
  Search,
  Camera,
  Building2,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SearchHero } from "@/components/search/search-hero";
import { SearchFilters } from "@/components/search/search-filters";
import { Prisma } from "@prisma/client";
import SearchMap from "@/components/search/search-map-wrapper";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>;
}): Promise<Metadata> {
  const { q, city } = await searchParams;

  let title = "Поиск фотостудий | PhotoMarket";
  let description = "Найдите идеальную фотостудию для вашей съемки";

  if (city) {
    title = `Фотостудии в г. ${city} | PhotoMarket`;
    description = `Аренда фотостудий в г. ${city}. Большой выбор залов, отзывы, цены.`;
  } else if (q) {
    title = `Поиск: ${q} | PhotoMarket`;
  }

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    minArea?: string;
    city?: string;
    hasNaturalLight?: string;
  }>;
}) {
  const { q, minPrice, maxPrice, minArea, city, hasNaturalLight } =
    await searchParams;
  const query = q || "";

  // Construct where clause
  const where: Prisma.StudioWhereInput = {
    AND: [],
  };

  // Basic search query (name or city)
  if (query) {
    (where.AND as Prisma.StudioWhereInput[]).push({
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  // City filter (specific)
  if (city) {
    (where.AND as Prisma.StudioWhereInput[]).push({
      city: { contains: city, mode: "insensitive" },
    });
  }

  // Room filters
  const roomWhere: Prisma.RoomWhereInput = {};

  if (minPrice) {
    roomWhere.pricePerHour = {
      ...(typeof roomWhere.pricePerHour === "object"
        ? roomWhere.pricePerHour
        : {}),
      gte: Number(minPrice),
    };
  }
  if (maxPrice) {
    roomWhere.pricePerHour = {
      ...(typeof roomWhere.pricePerHour === "object"
        ? roomWhere.pricePerHour
        : {}),
      lte: Number(maxPrice),
    };
  }
  if (minArea) {
    roomWhere.area = { gte: Number(minArea) };
  }
  if (hasNaturalLight === "true") {
    roomWhere.hasNaturalLight = true;
  }

  // If any room filters are applied, add them to the studio query
  if (Object.keys(roomWhere).length > 0) {
    (where.AND as Prisma.StudioWhereInput[]).push({
      rooms: {
        some: roomWhere,
      },
    });
  }

  const studios = await prisma.studio.findMany({
    where,
    include: {
      rooms: true,
      reviews: true,
    },
  });

  // Подсчёт результатов для статистики
  const hasFilters = !!(
    city ||
    minPrice ||
    maxPrice ||
    minArea ||
    hasNaturalLight
  );
  const searchQuery = query || city || "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Найдено {studios.length} студий</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {searchQuery ? (
                <>
                  Результаты по запросу:{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    «{searchQuery}»
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Поиск
                  </span>{" "}
                  фотостудий
                </>
              )}
            </h1>
            <p className="text-slate-300 mb-8">
              Найдите идеальное пространство для вашей съёмки
            </p>

            {/* Search Bar */}
            <SearchHero />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters />
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Filters & Stats Bar */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Активные фильтры:
                </span>
                {city && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                    📍 {city}
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                    💰 {minPrice || "0"} — {maxPrice || "∞"} ₽
                  </span>
                )}
                {minArea && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                    📐 от {minArea} м²
                  </span>
                )}
                {hasNaturalLight === "true" && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded-full">
                    ☀️ Естественный свет
                  </span>
                )}
              </div>
            )}

            {/* Map */}
            <SearchMap studios={studios} />

            {/* Results */}
            {studios.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ничего не найдено</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Попробуйте изменить параметры поиска или сбросить фильтры
                </p>
                <Link href="/search">
                  <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Сбросить фильтры
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studios.map((studio) => {
                  const minStudioPrice =
                    studio.rooms.length > 0
                      ? Math.min(
                          ...studio.rooms.map((r) => Number(r.pricePerHour)),
                        )
                      : null;

                  const averageRating =
                    studio.reviews.length > 0
                      ? (
                          studio.reviews.reduce((acc, r) => acc + r.rating, 0) /
                          studio.reviews.length
                        ).toFixed(1)
                      : null;

                  return (
                    <Link href={`/studios/${studio.id}`} key={studio.id}>
                      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white dark:bg-slate-800 border-0 shadow-md hover:-translate-y-1">
                        <div className="relative h-52 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          {studio.images[0] ? (
                            <Image
                              src={studio.images[0]}
                              alt={studio.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                              <Camera className="w-10 h-10 mb-2" />
                              <span className="text-sm">Нет фото</span>
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute top-3 left-3 right-3 flex justify-between">
                            {averageRating && (
                              <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {averageRating}
                              </div>
                            )}
                            <div className="bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5" />
                              {studio.rooms.length} зал
                              {studio.rooms.length === 1
                                ? ""
                                : studio.rooms.length < 5
                                  ? "а"
                                  : "ов"}
                            </div>
                          </div>
                        </div>

                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                            {studio.name}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 pb-4">
                          <div className="flex items-center text-slate-500 text-sm mb-3">
                            <MapPin className="h-4 w-4 mr-1.5 text-purple-500" />
                            {studio.city}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {studio.description}
                          </p>
                        </CardContent>

                        <CardFooter className="border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between items-center">
                          {minStudioPrice !== null ? (
                            <div>
                              <span className="text-xs text-slate-500">от</span>
                              <span className="text-xl font-bold text-purple-600 ml-1">
                                {minStudioPrice.toLocaleString()} ₽
                              </span>
                              <span className="text-sm text-slate-500">
                                /час
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">
                              Цена по запросу
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            Подробнее
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
