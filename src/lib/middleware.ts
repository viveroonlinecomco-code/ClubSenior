// src/lib/middleware.ts
// ============================================================================
// MIDDLEWARE - Logging + Rate Limiting + Request/Response tracking
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// RATE LIMITING - Simple in-memory (producción usar Redis)
// ============================================================================

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 60 segundos
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests por minuto

export function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    // Nuevo window
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
  // Agregar timestamp si no existe
  if (!log.timestamp) {
    log.timestamp = new Date().toISOString()
  }

  requestLogs.push(log)

  // Limitar tamaño en memoria
  if (requestLogs.length > MAX_LOGS_IN_MEMORY) {
    requestLogs.shift()
  }

  // Log a consola en desarrollo
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

  // TODO: En producción, enviar a servicio de logging (Sentry, LogRocket, etc)
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

    // ====================================================================
    // RATE LIMITING
    // ====================================================================
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

    // ====================================================================
    // EJECUTAR HANDLER
    // ====================================================================
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

    // ====================================================================
    // LOG RESULTADO
    // ====================================================================
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

    // ====================================================================
    // AGREGAR HEADERS DE TRACKING
    // ====================================================================
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
  // Solo permitir en desarrollo o con auth
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
