import { describe, it, expect } from "vitest";
import { cache, cacheKeys, TTL } from "@/lib/redis";

describe("Redis Cache Keys", () => {
  it("should generate correct studio list key", () => {
    expect(cacheKeys.studiosList()).toBe("studios:list:all:1");
    expect(cacheKeys.studiosList("Moscow")).toBe("studios:list:Moscow:1");
    expect(cacheKeys.studiosList("Moscow", 2)).toBe("studios:list:Moscow:2");
  });

  it("should generate correct studio detail key", () => {
    expect(cacheKeys.studioDetail("abc123")).toBe("studios:detail:abc123");
  });

  it("should generate correct catalog keys", () => {
    expect(cacheKeys.catalogFilters()).toBe("catalog:filters");
    expect(cacheKeys.catalogCities()).toBe("catalog:cities");
  });

  it("should generate correct user keys", () => {
    expect(cacheKeys.userBookings("user1")).toBe("user:bookings:user1");
    expect(cacheKeys.userFavorites("user1")).toBe("user:favorites:user1");
  });
});

describe("TTL Constants", () => {
  it("should have correct TTL values in seconds", () => {
    expect(TTL.SHORT).toBe(60);
    expect(TTL.MEDIUM).toBe(300);
    expect(TTL.LONG).toBe(1800);
    expect(TTL.HOUR).toBe(3600);
    expect(TTL.DAY).toBe(86400);
  });
});

describe("Cache Helper", () => {
  it("should indicate Redis availability", () => {
    // In test environment, Redis is not configured
    expect(typeof cache.isAvailable).toBe("function");
  });
});
