"use server";

import { prisma } from "@/lib/prisma";
import { cache, cacheKeys, TTL } from "@/lib/redis";

/**
 * Get studios for catalog with caching
 */
export async function getCachedStudios(filters?: {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const cacheKey = cacheKeys.studiosList(
    filters?.city,
    undefined // page could be added later
  );

  return cache.getOrSet(
    cacheKey,
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (filters?.city) {
        where.city = { contains: filters.city, mode: "insensitive" };
      }

      if (filters?.minPrice || filters?.maxPrice) {
        where.rooms = {
          some: {
            pricePerHour: {
              gte: filters.minPrice || undefined,
              lte: filters.maxPrice || undefined,
            },
          },
        };
      }

      return prisma.studio.findMany({
        where,
        include: {
          rooms: true,
          reviews: true,
          owner: {
            select: {
              subscriptionPlan: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    },
    TTL.MEDIUM // 5 minutes cache
  );
}

/**
 * Get cities list with studio counts (cached)
 */
export async function getCachedCities() {
  return cache.getOrSet(
    cacheKeys.catalogCities(),
    async () => {
      return prisma.studio.groupBy({
        by: ["city"],
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
      });
    },
    TTL.LONG // 30 minutes - cities don't change often
  );
}

/**
 * Get total rooms count (cached)
 */
export async function getCachedRoomsCount() {
  return cache.getOrSet(
    "catalog:rooms:count",
    async () => prisma.room.count(),
    TTL.LONG // 30 minutes
  );
}

/**
 * Get single studio with details (cached)
 */
export async function getCachedStudio(id: string) {
  return cache.getOrSet(
    cacheKeys.studioDetail(id),
    async () => {
      return prisma.studio.findUnique({
        where: { id },
        include: {
          rooms: {
            include: {
              bookings: {
                where: {
                  startTime: { gte: new Date() },
                },
              },
            },
            orderBy: { pricePerHour: "asc" },
          },
          reviews: {
            include: {
              user: {
                select: { name: true, image: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
              subscriptionPlan: true,
            },
          },
        },
      });
    },
    TTL.MEDIUM // 5 minutes
  );
}

/**
 * Invalidate studio caches after updates
 */
export async function invalidateStudioCache(studioId?: string, city?: string) {
  if (studioId) {
    await cache.invalidate(cacheKeys.studioDetail(studioId));
  }
  if (city) {
    await cache.invalidatePattern(`studios:list:${city}:*`);
  }
  // Always invalidate general lists
  await cache.invalidatePattern("studios:list:all:*");
  await cache.invalidate(cacheKeys.catalogCities());
  await cache.invalidate("catalog:rooms:count");
}
