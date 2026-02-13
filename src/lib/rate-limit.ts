/**
 * In-memory sliding-window rate limiter.
 *
 * Each key (typically IP or IP+route) gets a bucket of timestamps.
 * If the number of hits within the window exceeds the limit, the
 * request is blocked until timestamps age out.
 *
 * Works in both Node.js and Edge runtimes (no native modules).
 * Note: per-process memory — resets on restart and not shared across
 * multiple instances. Sufficient for single-container deployments.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check and consume a rate limit token.
 *
 * @param key      Unique identifier (e.g. `login:${ip}`)
 * @param limit    Max requests in the window
 * @param windowMs Window duration in milliseconds (default 15 min)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Drop expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(retryAfterMs, 0),
    };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Check if a key is currently rate-limited (without consuming a token).
 */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number = 15 * 60 * 1000
): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  const cutoff = Date.now() - windowMs;
  const active = entry.timestamps.filter((t) => t > cutoff);
  return active.length >= limit;
}

/**
 * Clear a rate limit entry for a given key.
 * Used by admin to unlock accounts.
 */
export function clearRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Extract client IP from request headers.
 * Works with Caddy (X-Forwarded-For) and direct connections.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
