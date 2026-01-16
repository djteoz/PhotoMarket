/**
 * Rate Limiter для API защиты
 * Использует Upstash Redis если настроен, иначе in-memory
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Redis is configured
const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis client if configured
const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// ============================================
// Upstash Rate Limiters (production)
// ============================================
const createUpstashLimiter = (
  requests: number,
  window: string,
  prefix: string
) => {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      requests,
      window as Parameters<typeof Ratelimit.slidingWindow>[1]
    ),
    analytics: true,
    prefix: `ratelimit:${prefix}`,
  });
};

// Upstash limiters
const upstashLimiters = {
  api: createUpstashLimiter(100, "1 m", "api"),
  auth: createUpstashLimiter(10, "1 m", "auth"),
  search: createUpstashLimiter(60, "1 m", "search"),
  booking: createUpstashLimiter(20, "1 m", "booking"),
  message: createUpstashLimiter(30, "1 m", "message"),
  contact: createUpstashLimiter(5, "5 m", "contact"),
  ai: createUpstashLimiter(10, "1 m", "ai"),
  upload: createUpstashLimiter(20, "5 m", "upload"),
};

// ============================================
// In-memory fallback (development)
// ============================================
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every minute
    if (typeof window === "undefined") {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  async isRateLimited(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000
  ): Promise<{ limited: boolean; remaining: number; resetIn: number }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetTime < now) {
      // New window
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { limited: false, remaining: limit - 1, resetIn: windowMs };
    }

    if (entry.count >= limit) {
      return {
        limited: true,
        remaining: 0,
        resetIn: entry.resetTime - now,
      };
    }

    entry.count++;
    return {
      limited: false,
      remaining: limit - entry.count,
      resetIn: entry.resetTime - now,
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Preset configurations for different endpoints
export const RATE_LIMITS = {
  // General API calls
  api: { limit: 100, windowMs: 60000 }, // 100 req/min

  // Auth-related
  auth: { limit: 10, windowMs: 60000 }, // 10 req/min

  // Search (more generous)
  search: { limit: 60, windowMs: 60000 }, // 60 req/min

  // Booking creation
  booking: { limit: 20, windowMs: 60000 }, // 20 req/min

  // Message sending
  message: { limit: 30, windowMs: 60000 }, // 30 req/min

  // Contact form
  contact: { limit: 5, windowMs: 300000 }, // 5 per 5 min

  // AI requests (expensive)
  ai: { limit: 10, windowMs: 60000 }, // 10 req/min

  // File uploads
  upload: { limit: 20, windowMs: 300000 }, // 20 per 5 min
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check rate limit - uses Redis if available, otherwise in-memory
 */
export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<{ limited: boolean; remaining: number; resetIn: number }> {
  const upstashLimiter = upstashLimiters[type];

  // Use Upstash if available
  if (upstashLimiter) {
    try {
      const { success, remaining, reset } = await upstashLimiter.limit(
        identifier
      );
      return {
        limited: !success,
        remaining,
        resetIn: Math.max(0, reset - Date.now()),
      };
    } catch (error) {
      console.error(
        "Upstash rate limit error, falling back to in-memory:",
        error
      );
    }
  }

  // Fallback to in-memory
  const config = RATE_LIMITS[type];
  return rateLimiter.isRateLimited(identifier, config.limit, config.windowMs);
}

/**
 * Get client identifier for rate limiting
 */
export function getClientIdentifier(
  request: Request,
  userId?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");

  const ip = cfIp || realIp || forwarded?.split(",")[0] || "unknown";
  return `ip:${ip}`;
}
