import { prisma } from "@/lib/prisma";
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
import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog/filters";
import { currentUser } from "@clerk/nextjs/server";
import { FavoriteButton } from "@/components/studios/favorite-button";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();
  const { city, minPrice, maxPrice } = await searchParams;

  const where: any = {};

  if (city && typeof city === "string") {
    where.city = { contains: city, mode: "insensitive" };
  }

  if (minPrice || maxPrice) {
    where.rooms = {
      some: {
        pricePerHour: {
          gte: minPrice ? Number(minPrice) : undefined,
          lte: maxPrice ? Number(maxPrice) : undefined,
        },
      },
    };
  }

  const studios = await prisma.studio.findMany({
    where,
    include: {
      rooms: true,
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Каталог студий</h1>
        <p className="text-gray-600">
          Все доступные фотостудии для бронирования.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Suspense fallback={<div>Загрузка фильтров...</div>}>
            <CatalogFilters />
          </Suspense>
        </div>

        <div className="lg:col-span-3">
          {studios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Студии не найдены. Попробуйте изменить параметры поиска.
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

                const isFavorite = favoriteIds.includes(studio.id);

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
                          <FavoriteButton
                            studioId={studio.id}
                            initialIsFavorite={isFavorite}
                            isIconOnly
                          />
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
