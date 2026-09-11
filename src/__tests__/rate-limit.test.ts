import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
} from '@/lib/middleware/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit state before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset all rate limit data
    resetRateLimit('test-key-*');
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const allowed = checkRateLimit('test-user-1', 3, 60);
      expect(allowed).toBe(true);
    });

    it('should allow requests within limit', () => {
      const key = 'test-user-2';
      expect(checkRateLimit(key, 3, 60)).toBe(true);
      expect(checkRateLimit(key, 3, 60)).toBe(true);
      expect(checkRateLimit(key, 3, 60)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const key = 'test-user-3';
      expect(checkRateLimit(key, 2, 60)).toBe(true);
      expect(checkRateLimit(key, 2, 60)).toBe(true);
      expect(checkRateLimit(key, 2, 60)).toBe(false); // Should be blocked
    });

    it('should block after reaching limit', () => {
      const key = 'test-user-4';
      checkRateLimit(key, 1, 60); // First request allowed
      expect(checkRateLimit(key, 1, 60)).toBe(false); // Should be blocked
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return status with remaining count', () => {
      const key = 'test-user-5';
      checkRateLimit(key, 5, 60);
      checkRateLimit(key, 5, 60);

      const status = getRateLimitStatus(key);
      expect(status.remaining).toBeLessThanOrEqual(5);
      expect(status.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should track rate limit state', () => {
      const key = 'test-user-6';
      checkRateLimit(key, 1, 60);
      checkRateLimit(key, 1, 60);

      const status = getRateLimitStatus(key);
      expect(status.isLimited).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset specific key', () => {
      const key = 'test-user-7';
      checkRateLimit(key, 2, 60);
      checkRateLimit(key, 2, 60);

      resetRateLimit(key);

      expect(checkRateLimit(key, 2, 60)).toBe(true);
    });

    it('should reset keys matching pattern', () => {
      checkRateLimit('test-user-8-a', 1, 60);
      checkRateLimit('test-user-8-b', 1, 60);

      resetRateLimit('test-user-8-*');

      expect(checkRateLimit('test-user-8-a', 1, 60)).toBe(true);
      expect(checkRateLimit('test-user-8-b', 1, 60)).toBe(true);
    });
  });

  describe('Time-window expiration', () => {
    it('should handle expired time windows', async () => {
      const key = 'test-user-9';
      const shortWindow = 0.01; // Very short window in seconds

      checkRateLimit(key, 2, shortWindow);
      checkRateLimit(key, 2, shortWindow);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should allow new requests after window expires
      expect(checkRateLimit(key, 2, shortWindow)).toBe(true);
    });
  });
});
