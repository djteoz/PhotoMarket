import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SearchHero } from "@/components/search/search-hero";
import { SearchFilters } from "@/components/search/search-filters";
import { Prisma } from "@prisma/client";
import dynamic from "next/dynamic";

const SearchMap = dynamic(() => import("@/components/search/search-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse mb-6" />
  ),
});

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Результаты поиска {query ? `: "${query}"` : ""}
        </h1>
        <SearchHero />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters />
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          <SearchMap studios={studios} />

          {studios.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-xl text-gray-500">
                Ничего не найдено по вашему запросу.
              </p>
              <p className="text-gray-400 mt-2">
                Попробуйте изменить параметры фильтрации.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studios.map((studio) => {
                const minStudioPrice =
                  studio.rooms.length > 0
                    ? Math.min(
                        ...studio.rooms.map((r) => Number(r.pricePerHour))
                      )
                    : null;

                return (
                  <Link href={`/studios/${studio.id}`} key={studio.id}>
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
                        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
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
                      <CardFooter className="border-t pt-4 text-sm text-gray-500">
                        {studio.rooms.length} залов
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
  );
}
