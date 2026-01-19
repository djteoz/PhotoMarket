"use client";

import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Crown, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FavoriteButton } from "@/components/studios/favorite-button";
import { cn } from "@/lib/utils";
import { getCitySlug } from "@/lib/cities";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";

// Inline skeleton for studio card
function StudioCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </CardFooter>
    </Card>
  );
}

interface InfiniteStudioGridProps {
  initialFilters?: {
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    hasNaturalLight?: boolean;
  };
  favoriteIds?: string[];
  isLoggedIn?: boolean;
}

export function InfiniteStudioGrid({
  initialFilters = {},
  favoriteIds = [],
  isLoggedIn = false,
}: InfiniteStudioGridProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    trpc.studio.list.useInfiniteQuery(
      {
        ...initialFilters,
        limit: 12,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  // Use custom infinite scroll hook
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { observerRef } = useInfiniteScroll(loadMore, {
    enabled: hasNextPage && !isFetchingNextPage,
  });

  // Calculate average rating
  const getAverageRating = (reviews: { rating: number }[]): number | null => {
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  };

  // Get min price from rooms (pricePerHour is Prisma Decimal)
  const getMinPrice = (
    rooms: { pricePerHour: { toNumber?: () => number } | number }[],
  ) => {
    if (rooms.length === 0) return null;
    return Math.min(
      ...rooms.map((r) => {
        const price = r.pricePerHour;
        return typeof price === "number"
          ? price
          : (price.toNumber?.() ?? Number(price));
      }),
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <StudioCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const allStudios = data?.pages.flatMap((page) => page.studios) ?? [];

  if (allStudios.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Студии не найдены</h3>
        <p className="text-muted-foreground">
          Попробуйте изменить параметры фильтрации
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allStudios.map((studio) => {
          const isPremium =
            studio.owner?.subscriptionPlan === "BUSINESS" ||
            studio.owner?.subscriptionPlan === "PRO";
          const avgRating = getAverageRating(studio.reviews);
          const minPrice = getMinPrice(studio.rooms);
          const isFavorite = favoriteIds.includes(studio.id);
          const citySlug = getCitySlug(studio.city);

          return (
            <Card
              key={studio.id}
              className={cn(
                "group overflow-hidden transition-all hover:shadow-lg",
                isPremium && "ring-2 ring-amber-400/50",
              )}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {studio.images?.[0] ? (
                  <Image
                    src={studio.images[0]}
                    alt={studio.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Premium badge */}
                {isPremium && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    Premium
                  </div>
                )}

                {/* Favorite button */}
                {isLoggedIn && (
                  <div className="absolute top-2 right-2">
                    <FavoriteButton
                      studioId={studio.id}
                      initialIsFavorite={isFavorite}
                    />
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <Link
                  href={`/studios/${studio.id}`}
                  className="hover:underline"
                >
                  <h3 className="font-semibold line-clamp-1">{studio.name}</h3>
                </Link>

                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <Link
                    href={`/city/${citySlug}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {studio.city}
                  </Link>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {avgRating ? (
                      <>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{avgRating}</span>
                        <span className="text-muted-foreground text-sm">
                          ({studio.reviews.length})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Нет отзывов
                      </span>
                    )}
                  </div>

                  {/* Rooms count */}
                  <span className="text-sm text-muted-foreground">
                    {studio.rooms.length}{" "}
                    {studio.rooms.length === 1
                      ? "зал"
                      : studio.rooms.length < 5
                        ? "зала"
                        : "залов"}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0 flex items-center justify-between">
                {minPrice ? (
                  <div>
                    <span className="text-lg font-bold">от {minPrice} ₽</span>
                    <span className="text-muted-foreground text-sm">/час</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Цена по запросу</span>
                )}

                <Button asChild size="sm">
                  <Link href={`/studios/${studio.id}`}>Подробнее</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Loading trigger */}
      <div ref={observerRef} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Загрузка...</span>
          </div>
        )}
        {!hasNextPage && allStudios.length > 0 && (
          <p className="text-muted-foreground text-sm">
            Показаны все студии ({allStudios.length})
          </p>
        )}
      </div>
    </>
  );
}
