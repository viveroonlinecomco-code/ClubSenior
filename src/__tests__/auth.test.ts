import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateFacilitadorToken, verifyFacilitadorToken } from '@/lib/auth/jwt';

describe('JWT Authentication', () => {
  const testSecret = 'test-secret-min-32-chars-required-1234';
  const testData = {
    email: 'test@example.com',
    facilitadorId: 'fac-123',
    role: 'FACILITADOR',
  };

  beforeEach(() => {
    process.env.JWT_SECRET = testSecret;
  });

  describe('generateFacilitadorToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateFacilitadorToken(
        testData.email,
        testData.facilitadorId,
        testData.role
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should encode correct payload', () => {
      const token = generateFacilitadorToken(
        testData.email,
        testData.facilitadorId,
        testData.role
      );

      const decoded = jwt.decode(token) as any;
      expect(decoded.email).toBe(testData.email);
      expect(decoded.facilitadorId).toBe(testData.facilitadorId);
      expect(decoded.role).toBe(testData.role);
    });

    it('should include expiration', () => {
      const token = generateFacilitadorToken(
        testData.email,
        testData.facilitadorId,
        testData.role
      );

      const decoded = jwt.decode(token) as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('verifyFacilitadorToken', () => {
    it('should verify a valid token', () => {
      const token = generateFacilitadorToken(
        testData.email,
        testData.facilitadorId,
        testData.role
      );

      const decoded = verifyFacilitadorToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.email).toBe(testData.email);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        verifyFacilitadorToken(invalidToken);
      }).toThrow();
    });

    it('should reject expired token', () => {
      const expiredToken = jwt.sign(
        { ...testData, exp: Math.floor(Date.now() / 1000) - 3600 },
        testSecret,
        { algorithm: 'HS256' }
      );

      expect(() => {
        verifyFacilitadorToken(expiredToken);
      }).toThrow();
    });
  });
});
