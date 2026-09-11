import { createLogger } from './logger';

// Create specialized loggers for different modules
export const authLogger = createLogger('AUTH');
export const dbLogger = createLogger('DATABASE');
export const cacheLogger = createLogger('CACHE');
export const paymentLogger = createLogger('PAYMENT');
export const emailLogger = createLogger('EMAIL');
export const activityLogger = createLogger('ACTIVITY');
export const rateLimitLogger = createLogger('RATE-LIMIT');
export const validationLogger = createLogger('VALIDATION');
export const securityLogger = createLogger('SECURITY');

// Authentication logging
export interface AuthLogContext {
  email: string;
  facilitadorId?: string;
  action: 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'OTP_SEND' | 'OTP_VERIFY' | 'TOKEN_REFRESH';
  success: boolean;
  error?: string;
  duration?: number;
}

export function logAuthAction(context: AuthLogContext) {
  const level = context.success ? 'info' : 'warn';
  const logFn = level === 'info' ? authLogger.info.bind(authLogger) : authLogger.warn.bind(authLogger);

  logFn(
    {
      email: context.email,
      facilitadorId: context.facilitadorId,
      action: context.action,
      duration: context.duration,
      error: context.error,
    },
    `Auth action: ${context.action} ${context.success ? '✓' : '✗'}`
  );
}

// Database logging
export interface DbLogContext {
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  recordCount?: number;
  duration?: number;
  error?: string;
}

export function logDbOperation(context: DbLogContext) {
  dbLogger.debug(
    {
      operation: context.operation,
      table: context.table,
      recordCount: context.recordCount,
      duration: `${context.duration || 0}ms`,
    },
    `DB ${context.operation} on ${context.table}`
  );
}

// Cache logging
export interface CacheLogContext {
  operation: 'GET' | 'SET' | 'DELETE' | 'INVALIDATE';
  key: string;
  hit: boolean;
  duration?: number;
  size?: number;
}

export function logCacheOperation(context: CacheLogContext) {
  const hitStatus = context.hit ? 'HIT' : 'MISS';
  const level = context.operation === 'SET' ? 'debug' : 'trace';
  const logFn = level === 'debug' ? cacheLogger.debug.bind(cacheLogger) : cacheLogger.trace.bind(cacheLogger);

  logFn(
    {
      operation: context.operation,
      key: context.key,
      hitStatus,
      duration: `${context.duration || 0}ms`,
      size: context.size,
    },
    `Cache ${context.operation} ${hitStatus}: ${context.key}`
  );
}

// Payment logging
export interface PaymentLogContext {
  action: 'INITIATE' | 'WEBHOOK_RECEIVED' | 'CONFIRMATION' | 'ERROR';
  transactionId: string;
  amount: number;
  status: string;
  error?: string;
}

export function logPayment(context: PaymentLogContext) {
  const level = context.action === 'ERROR' ? 'error' : 'info';
  const logFn = level === 'error' ? paymentLogger.error.bind(paymentLogger) : paymentLogger.info.bind(paymentLogger);

  logFn(
    {
      action: context.action,
      transactionId: context.transactionId,
      amount: context.amount,
      status: context.status,
      error: context.error,
    },
    `Payment ${context.action}: ${context.transactionId}`
  );
}

// Email logging
export interface EmailLogContext {
  to: string;
  subject: string;
  template: string;
  success: boolean;
  error?: string;
  provider?: string;
}

export function logEmailSent(context: EmailLogContext) {
  const level = context.success ? 'info' : 'error';
  const logFn = level === 'info' ? emailLogger.info.bind(emailLogger) : emailLogger.error.bind(emailLogger);

  logFn(
    {
      to: context.to,
      subject: context.subject,
      template: context.template,
      provider: context.provider,
      error: context.error,
    },
    `Email ${context.success ? 'sent' : 'failed'}: ${context.subject} to ${context.to}`
  );
}

// Rate limit logging
export interface RateLimitLogContext {
  key: string;
  attempts: number;
  limit: number;
  blocked: boolean;
  ip?: string;
}

export function logRateLimitCheck(context: RateLimitLogContext) {
  if (context.blocked) {
    rateLimitLogger.warn(
      {
        key: context.key,
        attempts: context.attempts,
        limit: context.limit,
        ip: context.ip,
      },
      `Rate limit exceeded: ${context.key} (${context.attempts}/${context.limit})`
    );
  } else {
    rateLimitLogger.trace(
      {
        key: context.key,
        attempts: context.attempts,
        limit: context.limit,
      },
      `Rate limit OK: ${context.key}`
    );
  }
}

// Validation logging
export interface ValidationLogContext {
  schema: string;
  success: boolean;
  errors?: Record<string, string[]>;
  input?: any;
}

export function logValidation(context: ValidationLogContext) {
  if (!context.success) {
    validationLogger.warn(
      {
        schema: context.schema,
        errors: context.errors,
      },
      `Validation failed for ${context.schema}`
    );
  } else {
    validationLogger.trace(
      {
        schema: context.schema,
      },
      `Validation passed for ${context.schema}`
    );
  }
}

// Security logging
export interface SecurityLogContext {
  event: 'UNAUTHORIZED_ACCESS' | 'INVALID_TOKEN' | 'INSUFFICIENT_PERMISSIONS' | 'SUSPICIOUS_ACTIVITY';
  ip: string;
  email?: string;
  details?: string;
}

export function logSecurityEvent(context: SecurityLogContext) {
  securityLogger.warn(
    {
      event: context.event,
      ip: context.ip,
      email: context.email,
      details: context.details,
    },
    `🔒 Security Event: ${context.event}`
  );
}
