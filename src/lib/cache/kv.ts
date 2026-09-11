import { kv } from '@vercel/kv';

/**
 * Get cached value or fetch fresh data
 * If cache miss, fetches data and stores in cache for TTL seconds
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  try {
    // Try to get from cache
    const cached = await kv.get<T>(key);
    if (cached) {
      console.log(`[CACHE] Hit: ${key}`);
      return cached;
    }

    console.log(`[CACHE] Miss: ${key}`);
  } catch (error) {
    console.error(`[CACHE] Get error for ${key}:`, error);
    // Fall through to fetch
  }

  // Cache miss or error - fetch fresh data
  try {
    const data = await fetcher();

    // Try to store in cache
    try {
      await kv.setex(key, ttl, JSON.stringify(data));
      console.log(`[CACHE] Set: ${key} (ttl: ${ttl}s)`);
    } catch (cacheError) {
      console.error(`[CACHE] Set error for ${key}:`, cacheError);
      // Still return data even if cache write fails
    }

    return data;
  } catch (error) {
    console.error(`[CACHE] Fetch error for ${key}:`, error);
    throw error;
  }
}

/**
 * Invalidate cache by pattern
 * Deletes all keys matching pattern (simple prefix match)
 */
export async function invalidateCache(pattern: string): Promise<number> {
  try {
    const keys = await kv.keys(`${pattern}*`);
    if (keys.length === 0) {
      return 0;
    }

    console.log(`[CACHE] Invalidating ${keys.length} keys matching ${pattern}*`);
    
    // Delete in batches to avoid timeout
    const batchSize = 100;
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);
      await kv.del(...batch);
    }

    return keys.length;
  } catch (error) {
    console.error(`[CACHE] Invalidate error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Set cache value directly
 */
export async function setCached<T>(
  key: string,
  data: T,
  ttl: number = 300
): Promise<void> {
  try {
    await kv.setex(key, ttl, JSON.stringify(data));
    console.log(`[CACHE] Set: ${key}`);
  } catch (error) {
    console.error(`[CACHE] Set error for ${key}:`, error);
    // Don't throw - cache is not critical
  }
}

/**
 * Get cache value directly (no fetcher)
 */
export async function getCachedDirect<T>(key: string): Promise<T | null> {
  try {
    const cached = await kv.get<T>(key);
    if (cached) {
      console.log(`[CACHE] Hit: ${key}`);
      return cached;
    }
    return null;
  } catch (error) {
    console.error(`[CACHE] Get error for ${key}:`, error);
    return null;
  }
}

/**
 * Delete specific cache key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await kv.del(key);
    console.log(`[CACHE] Deleted: ${key}`);
  } catch (error) {
    console.error(`[CACHE] Delete error for ${key}:`, error);
  }
}

/**
 * Get cache statistics (for monitoring)
 */
export async function getCacheStats(): Promise<{ keys: number }> {
  try {
    const keys = await kv.keys('*');
    return { keys: keys.length };
  } catch (error) {
    console.error('[CACHE] Stats error:', error);
    return { keys: 0 };
  }
}
