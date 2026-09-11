import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from './logger';

const logger = createLogger('HTTP');

export interface RequestContext {
  requestId: string;
  timestamp: number;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
}

// Generate unique request ID
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Extract IP address from request
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Log incoming request
export function logRequest(request: NextRequest): RequestContext {
  const context: RequestContext = {
    requestId: generateRequestId(),
    timestamp: Date.now(),
    method: request.method,
    path: request.nextUrl.pathname,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
  };

  logger.info(
    {
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      ip: context.ip,
    },
    `Incoming request: ${context.method} ${context.path}`
  );

  return context;
}

// Log outgoing response
export function logResponse(
  context: RequestContext,
  response: NextResponse | Response,
  duration: number
): void {
  const statusCode = response.status;
  const isError = statusCode >= 400;

  const logLevel = isError ? 'warn' : 'info';
  const logFn = isError
    ? logger.warn.bind(logger)
    : logger.info.bind(logger);

  logFn(
    {
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      statusCode,
      duration: `${duration}ms`,
      ip: context.ip,
    },
    `Response: ${context.method} ${context.path} - ${statusCode} (${duration}ms)`
  );
}

// Log errors
export function logErrorDetail(
  context: RequestContext,
  error: Error | unknown,
  statusCode: number = 500
): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(
    {
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      statusCode,
      error: errorMessage,
      stack: errorStack,
      ip: context.ip,
    },
    `Error in ${context.method} ${context.path}`
  );
}

// Middleware wrapper for logging API routes
export async function withRequestLogging<T>(
  request: NextRequest,
  handler: (context: RequestContext) => Promise<T>
): Promise<T> {
  const context = logRequest(request);
  const startTime = Date.now();

  try {
    const result = await handler(context);
    const duration = Date.now() - startTime;

    // Log successful operation
    logger.debug(
      {
        requestId: context.requestId,
        duration: `${duration}ms`,
      },
      'Handler completed successfully'
    );

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logErrorDetail(context, error, 500);

    throw error;
  }
}
