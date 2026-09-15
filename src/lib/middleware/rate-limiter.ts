/**
 * Rate Limiting Middleware
 * Protege endpoints contra abuso y DDoS
 * 
 * Estrategia: Token bucket per IP
 * - 100 requests por 15 minutos (usuarios normales)
 * - 10 requests por minuto (endpoints sensibles)
 */

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

// Simple in-memory store (en producción usar Redis)
const buckets = new Map<string, RateLimitBucket>();

const MAX_TOKENS = 100; // tokens por ventana
const REFILL_RATE = 100 / (15 * 60 * 1000); // tokens por millisegundo (100 en 15 min)
const WINDOW = 15 * 60 * 1000; // 15 minutos

/**
 * Check rate limit for an IP address
 * Retorna true si el request es permitido, false si fue rechazado
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let bucket = buckets.get(ip);

  if (!bucket) {
    // Primera vez viendo esta IP
    bucket = {
      tokens: MAX_TOKENS,
      lastRefill: now,
    };
    buckets.set(ip, bucket);
    return true;
  }

  // Refill tokens basado en tiempo pasado
  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = timePassed * REFILL_RATE;
  bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Usar un token
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

/**
 * Check strict rate limit for sensitive endpoints (auth, admin)
 * 5 requests por minuto
 */
export function checkStrictRateLimit(ip: string): boolean {
  const key = `strict:${ip}`;
  const now = Date.now();
  let bucket = buckets.get(key);

  const STRICT_MAX_TOKENS = 5;
  const STRICT_REFILL_RATE = 5 / (60 * 1000); // 5 en 60 segundos

  if (!bucket) {
    bucket = {
      tokens: STRICT_MAX_TOKENS,
      lastRefill: now,
    };
    buckets.set(key, bucket);
    return true;
  }

  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = timePassed * STRICT_REFILL_RATE;
  bucket.tokens = Math.min(STRICT_MAX_TOKENS, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

/**
 * Cleanup old buckets (ejecutar cada hora para no llenar memoria)
 */
export function cleanupOldBuckets(): void {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hora

  for (const [ip, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAge) {
      buckets.delete(ip);
    }
  }
}

// Ejecutar cleanup cada 10 minutos
if (typeof global !== 'undefined') {
  setInterval(cleanupOldBuckets, 10 * 60 * 1000);
}
