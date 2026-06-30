import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
type Store = Map<string, Bucket>;

declare global {
  // eslint-disable-next-line no-var
  var __organoRateLimitStore: Store | undefined;
}

const store: Store = globalThis.__organoRateLimitStore ?? new Map<string, Bucket>();
globalThis.__organoRateLimitStore = store;

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function enforceRateLimit(request: NextRequest, scope: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = `${scope}:${clientIp(request)}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + windowMs };
    store.set(key, bucket);
    return { allowed: true, remaining: limit - 1, retryAfter: Math.ceil(windowMs / 1000) };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }

  current.count += 1;
  store.set(key, current);
  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}

export function requestTooLarge(request: NextRequest, maxBytes = 24_000): boolean {
  const length = Number(request.headers.get("content-length") || 0);
  return Number.isFinite(length) && length > maxBytes;
}
