// src/app/api/admin/monitoring/route.ts
// ============================================================================
// ENDPOINT: GET /api/admin/monitoring
// Dashboard de monitoreo y debugging del sistema
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getRequestLogs, getPerformanceMetrics } from '@/lib/middleware'

// ============================================================================
// AUTENTICACIÓN ADMIN
// ============================================================================
function validateAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.ADMIN_MONITORING_TOKEN

  if (!expectedToken) {
    console.warn('[Monitoring] ADMIN_MONITORING_TOKEN not configured')
    return process.env.NODE_ENV === 'development' // Permitir en dev
  }

  const token = authHeader?.replace('Bearer ', '')
  return token === expectedToken
}

// ============================================================================
// GET: Sistema status + métricas
// ============================================================================
export async function GET(request: NextRequest) {
  if (!validateAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const url = new URL(request.url)
  const section = url.searchParams.get('section') || 'summary'

  try {
    // ====================================================================
    // SUMMARY - Resumen general del sistema
    // ====================================================================
    if (section === 'summary') {
      const logs = getRequestLogs()
      const metrics = getPerformanceMetrics()

      const totalRequests = logs.length
      const successRequests = logs.filter((l) => l.status && l.status < 400).length
      const errorRequests = logs.filter((l) => l.status && l.status >= 400).length
      const avgDuration =
        logs.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / (logs.length || 1)

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        system: {
          environment: process.env.NODE_ENV,
          buildId: process.env.NEXT_BUILD_ID || 'unknown',
          uptime: process.uptime(),
        },
        requests: {
          total: totalRequests,
          success: successRequests,
          errors: errorRequests,
          successRate: totalRequests > 0
            ? ((successRequests / totalRequests) * 100).toFixed(2) + '%'
            : 'N/A',
          avgDuration_ms: avgDuration.toFixed(2),
        },
        topEndpoints: metrics.slice(0, 5).map((m) => ({
          endpoint: m.endpoint,
          method: m.method,
          requests: m.totalRequests,
          avgDuration: m.avgDuration_ms.toFixed(2) + 'ms',
          successRate:
            m.totalRequests > 0
              ? ((m.successCount / m.totalRequests) * 100).toFixed(2) + '%'
              : 'N/A',
        })),
      })
    }

    // ====================================================================
    // LOGS - Últimos requests
    // ====================================================================
    if (section === 'logs') {
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const pathname = url.searchParams.get('pathname')
      const status = url.searchParams.get('status')

      const logs = getRequestLogs({
        pathname: pathname || undefined,
        status: status ? parseInt(status) : undefined,
      })

      return NextResponse.json({
        success: true,
        total: logs.length,
        logs: logs.slice(-limit).reverse(),
      })
    }

    // ====================================================================
    // PERFORMANCE - Métricas detalladas
    // ====================================================================
    if (section === 'performance') {
      const metrics = getPerformanceMetrics()

      return NextResponse.json({
        success: true,
        metrics: metrics.map((m) => ({
          endpoint: `${m.method} ${m.endpoint}`,
          totalRequests: m.totalRequests,
          successCount: m.successCount,
          errorCount: m.errorCount,
          successRate:
            m.totalRequests > 0
              ? ((m.successCount / m.totalRequests) * 100).toFixed(2) + '%'
              : 'N/A',
          duration: {
            min: m.minDuration_ms.toFixed(2) + 'ms',
            max: m.maxDuration_ms.toFixed(2) + 'ms',
            avg: m.avgDuration_ms.toFixed(2) + 'ms',
          },
        })),
      })
    }

    // ====================================================================
    // HEALTH - Health check del sistema
    // ====================================================================
    if (section === 'health') {
      const logs = getRequestLogs()
      const recentLogs = logs.slice(-100) // Últimos 100 requests

      const recentErrors = recentLogs.filter((l) => l.error || l.status === 500)
      const errorRate =
        recentLogs.length > 0
          ? ((recentErrors.length / recentLogs.length) * 100).toFixed(2)
          : '0'

      const isHealthy = parseFloat(errorRate) < 5 // Menos de 5% de errores

      return NextResponse.json({
        success: true,
        status: isHealthy ? 'HEALTHY' : 'DEGRADED',
        errorRate: errorRate + '%',
        recentErrors: recentErrors.slice(-10).map((l) => ({
          timestamp: l.timestamp,
          endpoint: `${l.method} ${l.pathname}`,
          error: l.error,
          status: l.status,
        })),
        recommendations: isHealthy
          ? []
          : ['Monitor error rate', 'Check recent deployments', 'Review logs'],
      })
    }

    // ====================================================================
    // DEFAULT
    // ====================================================================
    return NextResponse.json({
      success: true,
      message: 'Monitoring endpoint',
      sections: ['summary', 'logs', 'performance', 'health'],
      usage: 'Append ?section=<name> to get detailed information',
    })
  } catch (error: any) {
    console.error('[Monitoring] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================
/*
GET /api/admin/monitoring
└─ ?section=summary (default)
   └─ System info + top endpoints

GET /api/admin/monitoring?section=logs
   └─ Últimos 50 requests (configurable con ?limit=N)

GET /api/admin/monitoring?section=performance
   └─ Métricas de performance por endpoint

GET /api/admin/monitoring?section=health
   └─ Health check general del sistema

AUTENTICACIÓN:
- Header: Authorization: Bearer <ADMIN_MONITORING_TOKEN>
- Env var: ADMIN_MONITORING_TOKEN
- Dev: permitido sin token

EJEMPLO DE USO:
curl -H "Authorization: Bearer secret_token_here" \
  "https://club-senior.vercel.app/api/admin/monitoring?section=summary"
*/
