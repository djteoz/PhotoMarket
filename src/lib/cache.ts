/**
 * Redis Cache Layer using Upstash
 *
 * Для использования:
 * 1. Создайте бесплатный аккаунт на https://upstash.com
 * 2. Добавьте UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN в .env
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = "photomarket:";

// Default TTLs in seconds
const DEFAULT_TTL = {
  studios: 300, // 5 минут
  search: 180, // 3 минуты
  user: 600, // 10 минут
  stats: 60, // 1 минута
} as const;

class RedisCache {
  private baseUrl: string;
  private token: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.UPSTASH_REDIS_REST_URL || "";
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
    this.enabled = !!(this.baseUrl && this.token);

    if (!this.enabled) {
      console.warn("Redis cache disabled: Missing UPSTASH credentials");
    }
  }

  private async command<T>(cmd: string[]): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cmd),
      });

      if (!response.ok) {
        console.error("Redis error:", response.status);
        return null;
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Redis command error:", error);
      return null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.command<string>(["GET", CACHE_PREFIX + key]);
    if (!result) return null;

    try {
      const entry: CacheEntry<T> = JSON.parse(result);
      return entry.data;
    } catch {
      return null;
    }
  }

  async set<T>(
    key: string,
    data: T,
    ttlSeconds: number = 300
  ): Promise<boolean> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };

    const result = await this.command([
      "SETEX",
      CACHE_PREFIX + key,
      String(ttlSeconds),
      JSON.stringify(entry),
    ]);

    return result === "OK";
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.command(["DEL", CACHE_PREFIX + key]);
    return result === 1;
  }

  async deletePattern(pattern: string): Promise<void> {
    // Get all keys matching pattern
    const keys = await this.command<string[]>(["KEYS", CACHE_PREFIX + pattern]);
    if (keys && keys.length > 0) {
      await this.command(["DEL", ...keys]);
    }
  }

  // Convenience methods
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttlSeconds);
    return data;
  }

  // Cache key generators
  static keys = {
    studio: (id: string) => `studio:${id}`,
    studioList: (params: string) => `studios:list:${params}`,
    search: (query: string) =>
      `search:${Buffer.from(query).toString("base64")}`,
    user: (id: string) => `user:${id}`,
    stats: (type: string) => `stats:${type}`,
    popular: () => `popular:studios`,
  };
}

export const cache = new RedisCache();
export const CACHE_TTL = DEFAULT_TTL;
