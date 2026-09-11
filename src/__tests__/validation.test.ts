import { describe, it, expect } from 'vitest';
import { SendOTPSchema, VerifyOTPSchema, CreateActivitySchema } from '@/lib/validation/schemas';

describe('Input Validation - Zod Schemas', () => {
  describe('SendOTPSchema', () => {
    it('should accept valid email', () => {
      const result = SendOTPSchema.safeParse({
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      const result = SendOTPSchema.safeParse({
        email: 'invalid-email',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = SendOTPSchema.safeParse({
        email: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject email longer than 254 chars', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = SendOTPSchema.safeParse({
        email: longEmail,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('VerifyOTPSchema', () => {
    it('should accept valid email and code', () => {
      const result = VerifyOTPSchema.safeParse({
        email: 'test@example.com',
        code: '123456',
      });

      expect(result.success).toBe(true);
    });

    it('should reject non-numeric code', () => {
      const result = VerifyOTPSchema.safeParse({
        email: 'test@example.com',
        code: 'ABCDEF',
      });

      expect(result.success).toBe(false);
    });

    it('should reject code shorter than 6 digits', () => {
      const result = VerifyOTPSchema.safeParse({
        email: 'test@example.com',
        code: '12345',
      });

      expect(result.success).toBe(false);
    });

    it('should reject code longer than 6 digits', () => {
      const result = VerifyOTPSchema.safeParse({
        email: 'test@example.com',
        code: '1234567',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('CreateActivitySchema', () => {
    const validData = {
      nombre: 'Yoga Session',
      descripcion: 'Morning yoga class',
      fecha: '2026-09-20',
      hora_inicio: '09:00',
      duracion_minutos: 60,
      ubicacion: 'Salón 1',
      capacidad_max: 20,
      condominio_id: 'cond-123',
    };

    it('should accept valid activity data', () => {
      const result = CreateActivitySchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should reject missing nombre', () => {
      const result = CreateActivitySchema.safeParse({
        ...validData,
        nombre: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = CreateActivitySchema.safeParse({
        ...validData,
        fecha: 'invalid-date',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const result = CreateActivitySchema.safeParse({
        ...validData,
        hora_inicio: '25:00',
      });

      expect(result.success).toBe(false);
    });

    it('should reject duracion_minutos less than 30', () => {
      const result = CreateActivitySchema.safeParse({
        ...validData,
        duracion_minutos: 15,
      });

      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalData = {
        nombre: 'Activity',
        fecha: '2026-09-20',
        hora_inicio: '10:00',
        condominio_id: 'cond-123',
      };

      const result = CreateActivitySchema.safeParse(minimalData);

      expect(result.success).toBe(true);
    });
  });
});
