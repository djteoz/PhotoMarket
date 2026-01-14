/**
 * Cached data fetchers for better performance
 */

import { prisma } from "@/lib/prisma";
import { cache, CACHE_TTL } from "@/lib/cache";

/**
 * Get studio by ID with caching
 */
export async function getCachedStudio(id: string) {
  return cache.getOrSet(
    `studio:${id}`,
    async () => {
      return prisma.studio.findUnique({
        where: { id },
        include: {
          rooms: {
            include: { amenities: true },
          },
          reviews: {
            include: { user: { select: { name: true, image: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
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
    CACHE_TTL.studios
  );
}

/**
 * Get popular studios with caching
 */
export async function getCachedPopularStudios(limit: number = 6) {
  return cache.getOrSet(
    `popular:${limit}`,
    async () => {
      return prisma.studio.findMany({
        take: limit,
        include: {
          rooms: true,
          reviews: true,
          owner: {
            select: { subscriptionPlan: true },
          },
        },
        orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
      });
    },
    CACHE_TTL.studios
  );
}

/**
 * Get search results with caching
 */
export async function getCachedSearchResults(params: {
  q?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  hasNaturalLight?: boolean;
}) {
  const cacheKey = `search:${JSON.stringify(params)}`;

  return cache.getOrSet(
    cacheKey,
    async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { AND: [] };

      if (params.q) {
        where.AND.push({
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { city: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
          ],
        });
      }

      if (params.city) {
        where.AND.push({
          city: { contains: params.city, mode: "insensitive" },
        });
      }

      // Room filters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roomWhere: any = {};

      if (params.minPrice) roomWhere.pricePerHour = { gte: params.minPrice };
      if (params.maxPrice) {
        roomWhere.pricePerHour = {
          ...roomWhere.pricePerHour,
          lte: params.maxPrice,
        };
      }
      if (params.minArea) roomWhere.area = { gte: params.minArea };
      if (params.hasNaturalLight) roomWhere.hasNaturalLight = true;

      if (Object.keys(roomWhere).length > 0) {
        where.AND.push({ rooms: { some: roomWhere } });
      }

      return prisma.studio.findMany({
        where: where.AND.length > 0 ? where : undefined,
        include: {
          rooms: true,
          reviews: true,
          owner: { select: { subscriptionPlan: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    },
    CACHE_TTL.search
  );
}

/**
 * Get cities list with caching
 */
export async function getCachedCities() {
  return cache.getOrSet(
    "cities:all",
    async () => {
      const studios = await prisma.studio.findMany({
        select: { city: true },
        distinct: ["city"],
      });
      return studios.map((s) => s.city).sort();
    },
    CACHE_TTL.studios * 2 // Cities change rarely
  );
}

/**
 * Get global stats with caching
 */
export async function getCachedStats() {
  return cache.getOrSet(
    "stats:global",
    async () => {
      const [studiosCount, roomsCount, bookingsCount, usersCount] =
        await Promise.all([
          prisma.studio.count(),
          prisma.room.count(),
          prisma.booking.count({ where: { status: "COMPLETED" } }),
          prisma.user.count(),
        ]);

      return {
        studios: studiosCount,
        rooms: roomsCount,
        bookings: bookingsCount,
        users: usersCount,
      };
    },
    CACHE_TTL.stats
  );
}

/**
 * Invalidate studio cache when updated
 */
export async function invalidateStudioCache(studioId: string) {
  await Promise.all([
    cache.delete(`studio:${studioId}`),
    cache.deletePattern("search:*"),
    cache.deletePattern("popular:*"),
  ]);
}

/**
 * Invalidate all search caches
 */
export async function invalidateSearchCache() {
  await cache.deletePattern("search:*");
}
