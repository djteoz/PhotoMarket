import { NextResponse } from "next/server";
import { rateLimiter, RATE_LIMITS, RateLimitType } from "./rate-limit";

/**
 * Rate limit middleware helper for API routes
 */
export async function withRateLimit(
  request: Request,
  type: RateLimitType = "api"
) {
  // Get identifier - prefer user ID, fallback to IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0] ?? "unknown";

  // You can also use Clerk's user ID if available
  const identifier = ip;

  const config = RATE_LIMITS[type];
  const result = await rateLimiter.isRateLimited(
    `${type}:${identifier}`,
    config.limit,
    config.windowMs
  );

  if (result.limited) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Слишком много запросов. Попробуйте позже.",
        retryAfter: Math.ceil(result.resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(result.resetIn / 1000)),
          "X-RateLimit-Limit": String(config.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Date.now() + result.resetIn),
        },
      }
    );
  }

  return null; // Not rate limited, continue
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetIn: number,
  limit: number
) {
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Date.now() + resetIn));
  return response;
}
