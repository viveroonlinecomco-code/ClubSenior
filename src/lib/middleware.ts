// src/lib/middleware.ts
// ============================================================================
// MIDDLEWARE - Logging + Rate Limiting + JWT Expiration Validation
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// JWT SETUP
// ============================================================================

interface JWTPayload {
  user_id: string
  email: string
  exp: number
  iat: number
}

// ============================================================================
// JWT EXPIRATION VALIDATION (sin dependencia jose)
// ============================================================================

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('[JWT] Invalid token format')
      return null
    }

    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    const parsed = JSON.parse(decoded) as JWTPayload

    return parsed
  } catch (error: any) {
    console.error('[JWT] Decode failed:', error.message)
    return null
  }
}

export function isTokenExpired(payload: JWTPayload): boolean {
  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp) {
    console.warn('[JWT] No expiration claim found in token')
    return true
  }
  return now > payload.exp
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (!token) {
      console.warn('[JWT] No token provided')
      return null
    }

    const jwtPayload = decodeJWT(token)
    
    if (!jwtPayload) {
      console.warn('[JWT] Failed to decode token')
      return null
    }
    
    if (!jwtPayload.user_id || !jwtPayload.email) {
      console.warn('[JWT] Invalid token payload structure')
      return null
    }

    if (isTokenExpired(jwtPayload)) {
      console.warn('[JWT] Token expired:', {
        exp: jwtPayload.exp,
        now: Math.floor(Date.now() / 1000),
      })
      return null
    }

    return jwtPayload
  } catch (error: any) {
    console.error('[JWT] Verification failed:', error.message)
    return null
  }
}

export async function withJWTAuth(
  request: NextRequest,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const context = `[JWT Auth] ${request.method} ${request.nextUrl.pathname}`

  console.log(`${context} Starting`)

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    console.warn(`${context} No Authorization header`)
    return NextResponse.json(
      { error: 'Missing authorization header' },
      { status: 401 }
    )
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.warn(`${context} Invalid authorization format`)
    return NextResponse.json(
      { error: 'Invalid authorization format' },
      { status: 401 }
    )
  }

  const token = parts[1]

  const payload = await verifyJWT(token)
  if (!payload) {
    console.warn(`${context} Token verification failed`)
    return NextResponse.json(
      { error: 'Token verification failed or expired' },
      { status: 401 }
    )
  }

  console.log(`${context} Token valid for user: ${payload.user_id}`)

  return handler(request, payload.user_id)
}

// ============================================================================
// RATE LIMITING - Simple in-memory (producción usar Redis)
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 100

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count }
}

// ============================================================================
// REQUEST LOGGING
// ============================================================================

export interface RequestLog {
  timestamp: string
  method: string
  pathname: string
  status?: number
  duration_ms?: number
  user_id?: string
  ip_address?: string
  error?: string
  headers?: Record<string, string>
}

const requestLogs: RequestLog[] = []
const MAX_LOGS_IN_MEMORY = 1000

export function logRequest(log: RequestLog) {
  if (!log.timestamp) {
    log.timestamp = new Date().toISOString()
  }

  requestLogs.push(log)

  if (requestLogs.length > MAX_LOGS_IN_MEMORY) {
    requestLogs.shift()
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[${log.timestamp}] ${log.method} ${log.pathname}`,
      {
        status: log.status,
        duration: log.duration_ms + 'ms',
        error: log.error,
      }
    )
  }
}

export function getRequestLogs(
  filter?: {
    pathname?: string
    status?: number
    since?: Date
  }
): RequestLog[] {
  let logs = [...requestLogs]

  if (filter?.pathname) {
    logs = logs.filter((l) => l.pathname.includes(filter.pathname!))
  }

  if (filter?.status) {
    logs = logs.filter((l) => l.status === filter.status)
  }

  if (filter?.since) {
    const sinceTime = filter.since.getTime()
    logs = logs.filter((l) => new Date(l.timestamp).getTime() >= sinceTime)
  }

  return logs
}

// ============================================================================
// MIDDLEWARE: Aplicar logging + rate limiting a endpoints
// ============================================================================

export async function withLogging(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    enableRateLimit?: boolean
    rateLimitKey?: (req: NextRequest) => string
  }
) {
  return async (request: NextRequest) => {
    const startTime = Date.now()
    const pathname = new URL(request.url).pathname
    const method = request.method
    const userId = request.headers.get('x-user-id')
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'

    if (options?.enableRateLimit) {
      const rateLimitKey = options.rateLimitKey
        ? options.rateLimitKey(request)
        : ipAddress

      const { allowed, remaining } = checkRateLimit(rateLimitKey)

      if (!allowed) {
        logRequest({
          timestamp: new Date().toISOString(),
          method,
          pathname,
          status: 429,
          user_id: userId || undefined,
          ip_address: ipAddress,
          error: 'Rate limit exceeded',
          duration_ms: Date.now() - startTime,
        })

        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: RATE_LIMIT_WINDOW / 1000,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(RATE_LIMIT_WINDOW / 1000),
              'X-RateLimit-Remaining': '0',
            },
          }
        )
      }
    }

    let response: NextResponse
    let error: string | undefined

    try {
      response = await handler(request)
    } catch (err: any) {
      error = err.message || 'Unknown error'
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    const duration = Date.now() - startTime

    logRequest({
      timestamp: new Date().toISOString(),
      method,
      pathname,
      status: response.status,
      duration_ms: duration,
      user_id: userId || undefined,
      ip_address: ipAddress,
      error,
    })

    const newResponse = new NextResponse(response.body, response)
    newResponse.headers.set('X-Response-Time', `${duration}ms`)
    newResponse.headers.set('X-Request-ID', request.headers.get('x-request-id') || generateRequestId())

    return newResponse
  }
}

// ============================================================================
// HELPER: Generar request ID único
// ============================================================================

export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// EXPORT LOGGING ENDPOINT (para debugging)
// ============================================================================

export async function handleLogsEndpoint(
  request: NextRequest
): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'production') {
    const authToken = request.headers.get('x-logging-token')
    if (authToken !== process.env.LOGGING_SECRET_TOKEN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  const url = new URL(request.url)
  const limit = url.searchParams.get('limit') || '100'
  const pathname = url.searchParams.get('pathname')
  const status = url.searchParams.get('status')
  const since = url.searchParams.get('since')

  const logs = getRequestLogs({
    pathname: pathname || undefined,
    status: status ? parseInt(status) : undefined,
    since: since ? new Date(since) : undefined,
  })

  return NextResponse.json({
    success: true,
    count: logs.length,
    logs: logs.slice(-parseInt(limit)),
  })
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export interface PerformanceMetric {
  endpoint: string
  method: string
  avgDuration_ms: number
  minDuration_ms: number
  maxDuration_ms: number
  totalRequests: number
  successCount: number
  errorCount: number
}

export function getPerformanceMetrics(): PerformanceMetric[] {
  const metricsMap = new Map<string, PerformanceMetric>()

  requestLogs.forEach((log) => {
    const key = `${log.method} ${log.pathname}`

    if (!metricsMap.has(key)) {
      metricsMap.set(key, {
        endpoint: log.pathname,
        method: log.method,
        avgDuration_ms: 0,
        minDuration_ms: Infinity,
        maxDuration_ms: 0,
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
      })
    }

    const metric = metricsMap.get(key)!
    metric.totalRequests++

    if (log.status && log.status < 400) {
      metric.successCount++
    } else if (log.error) {
      metric.errorCount++
    }

    if (log.duration_ms) {
      metric.minDuration_ms = Math.min(metric.minDuration_ms, log.duration_ms)
      metric.maxDuration_ms = Math.max(metric.maxDuration_ms, log.duration_ms)
      metric.avgDuration_ms =
        (metric.avgDuration_ms * (metric.totalRequests - 1) + log.duration_ms) /
        metric.totalRequests
    }
  })

  return Array.from(metricsMap.values()).sort(
    (a, b) => b.avgDuration_ms - a.avgDuration_ms
  )
}

// ============================================================================
// NEXT.JS MIDDLEWARE CONFIG (JWT Validation en rutas protegidas)
// ============================================================================

export function middleware(request: NextRequest) {
  const context = `[Middleware] ${request.method} ${request.nextUrl.pathname}`

  console.log(`${context} Processing`)

  const protectedPaths = [
    '/api/dashboard',
    '/api/perfil',
    '/api/actividades',
    '/api/suscripciones',
    '/api/participantes',
  ]

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!isProtected) {
    console.log(`${context} Not protected, allowing`)
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    console.warn(`${context} Protected route, no auth header`)
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.warn(`${context} Invalid auth format`)
    return NextResponse.json(
      { error: 'Invalid authorization format' },
      { status: 401 }
    )
  }

  const token = parts[1]

  return (async () => {
    const payload = await verifyJWT(token)
    if (!payload) {
      console.warn(`${context} Token invalid or expired`)
      return NextResponse.json(
        { error: 'Token invalid or expired' },
        { status: 401 }
      )
    }

    console.log(`${context} Token valid, user: ${payload.user_id}`)
    return NextResponse.next()
  })()
}

export const config = {
  matcher: [
    '/api/dashboard/:path*',
    '/api/perfil/:path*',
    '/api/actividades/:path*',
    '/api/suscripciones/:path*',
    '/api/participantes/:path*',
  ],
}
