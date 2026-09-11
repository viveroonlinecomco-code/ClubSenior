/**
 * Simple in-memory rate limiter for Vercel serverless
 * Note: Multi-instance = separate counts (acceptable for MVP)
 * TODO: Upgrade to Redis para distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if a request is within rate limit
 * Returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 3,
  windowSeconds: number = 900 // 15 min default
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // New window - first attempt
    store.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return true;
  }

  if (entry.count < maxAttempts) {
    entry.count++;
    return true;
  }

  // Rate limit exceeded
  return false;
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(
  key: string,
  maxAttempts: number = 3,
  windowSeconds: number = 900
): { remaining: number; resetTime: Date; isLimited: boolean } {
  const entry = store.get(key);
  const now = Date.now();

  if (!entry || now > entry.resetTime) {
    return {
      remaining: maxAttempts,
      resetTime: new Date(now + windowSeconds * 1000),
      isLimited: false,
    };
  }

  return {
    remaining: Math.max(0, maxAttempts - entry.count),
    resetTime: new Date(entry.resetTime),
    isLimited: entry.count >= maxAttempts,
  };
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Cleanup old entries every 5 minutes to prevent memory leak
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`[RATE-LIMIT] Cleaned up ${cleaned} expired entries`);
  }
}, 5 * 60 * 1000);

// Don't keep the interval running in the background in serverless
if (typeof global !== 'undefined') {
  (global as any).rateLimitCleanup = cleanupInterval;
}

export function getStoreSize(): number {
  return store.size;
}
