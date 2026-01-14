/**
 * Rate Limiter для API защиты
 * Использует in-memory хранилище (для продакшена рекомендуется Redis)
 */

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
