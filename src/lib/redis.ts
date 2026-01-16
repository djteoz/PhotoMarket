import { Redis } from "@upstash/redis";

// Check if Redis is configured
const isConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client (works on Edge runtime)
export const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Cache helper with automatic JSON serialization
export const cache = {
  /**
   * Get cached value or fetch from source
   * @param key - Cache key
   * @param fetcher - Function to fetch data if not cached
   * @param ttl - Time to live in seconds (default: 5 minutes)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // If Redis not configured, just fetch
    if (!redis) {
      return fetcher();
    }

    try {
      // Try to get from cache
      const cached = await redis.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch fresh data
      const fresh = await fetcher();

      // Store in cache (don't await to not block response)
      redis.set(key, fresh, { ex: ttl }).catch(console.error);

      return fresh;
    } catch (error) {
      // If Redis fails, just fetch directly
      console.error("Redis cache error:", error);
      return fetcher();
    }
  },

  /**
   * Invalidate cache by key or pattern
   */
  async invalidate(key: string): Promise<void> {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Redis invalidate error:", error);
    }
  },

  /**
   * Invalidate multiple keys by pattern
   * Note: Use sparingly, SCAN can be slow on large datasets
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Redis invalidate pattern error:", error);
    }
  },

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return !!redis;
  },
};

// Cache keys factory for consistent naming
export const cacheKeys = {
  // Studios
  studiosList: (city?: string, page?: number) =>
    `studios:list:${city || "all"}:${page || 1}`,
  studioDetail: (id: string) => `studios:detail:${id}`,
  studioRooms: (id: string) => `studios:rooms:${id}`,

  // Catalog
  catalogFilters: () => `catalog:filters`,
  catalogCities: () => `catalog:cities`,

  // User-specific (short TTL)
  userBookings: (userId: string) => `user:bookings:${userId}`,
  userFavorites: (userId: string) => `user:favorites:${userId}`,

  // Stats (longer TTL)
  siteStats: () => `stats:site`,
  cityStats: (city: string) => `stats:city:${city}`,
};

// TTL presets in seconds
export const TTL = {
  SHORT: 60, // 1 minute - for frequently changing data
  MEDIUM: 300, // 5 minutes - default
  LONG: 1800, // 30 minutes - for stable data
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours - for very stable data
};
