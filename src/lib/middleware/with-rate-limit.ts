/**
 * HOC para endpoints con rate limiting
 * Uso:
 * 
 * export const GET = withRateLimit(async (request: NextRequest) => {
 *   // tu código aquí
 * });
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, checkStrictRateLimit } from './rate-limiter';

type RequestHandler = (request: NextRequest) => Promise<Response>;

export function withRateLimit(handler: RequestHandler, strict: boolean = false) {
  return async (request: NextRequest) => {
    // Obtener IP del cliente
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') ||
               request.ip ||
               'unknown';

    // Verificar rate limit
    const allowed = strict ? checkStrictRateLimit(ip) : checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: strict 
            ? 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.'
            : 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.',
          retry_after: 60,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': strict ? '5' : '100',
            'X-RateLimit-Window': strict ? '60000' : '900000',
          },
        }
      );
    }

    // Continuar con el handler
    return handler(request);
  };
}

/**
 * Middleware para aplicar rate limiting a nivel global
 * Importar en middleware.ts
 */
export async function globalRateLimitMiddleware(request: NextRequest) {
  // Obtener IP
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') ||
             request.ip ||
             'unknown';

  // Solo limitar GET requests que no sean auth
  if (request.method === 'GET' && !request.nextUrl.pathname.includes('/api/auth')) {
    const allowed = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.',
        },
        { status: 429 }
      );
    }
  }

  // POST/PUT/DELETE requests (más restrictivo)
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const allowed = checkStrictRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.',
        },
        { status: 429 }
      );
    }
  }

  return null; // Permitir request
}
