import { NextResponse } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach per IP address.
 *
 * Limitations:
 * - In-memory storage is per-process, not shared across serverless instances.
 * - For production at scale, replace with @upstash/ratelimit + Redis.
 */
const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60_000;

let lastCleanup = Date.now();

const cleanup = (): void => {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
};

type RateLimitConfig = {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
  /** Optional route-specific key prefix to isolate buckets */
  keyPrefix?: string;
};

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000,
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Check rate limit for a given identifier (typically IP address).
 */
export const checkRateLimit = (
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult => {
  cleanup();

  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: config.maxRequests - 1, resetAt };
  }

  entry.count += 1;

  if (entry.count > config.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
};

/**
 * Extract client IP from request headers.
 * Handles common proxy headers (X-Forwarded-For, X-Real-IP).
 */
export const getClientIp = (request: Request): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
};

/**
 * Apply rate limiting to an API route handler.
 * Returns a 429 response if the limit is exceeded.
 */
export const withRateLimit = (
  request: Request,
  config: RateLimitConfig = DEFAULT_CONFIG
): NextResponse | null => {
  const ip = getClientIp(request);
  let keyPrefix = config.keyPrefix ?? "global";

  if (!config.keyPrefix) {
    try {
      keyPrefix = new URL(request.url).pathname;
    } catch {
      keyPrefix = "global";
    }
  }

  const result = checkRateLimit(`${keyPrefix}:${ip}`, config);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((result.resetAt - Date.now()) / 1000)
          ),
          "X-RateLimit-Limit": String(config.maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      }
    );
  }

  return null;
};
