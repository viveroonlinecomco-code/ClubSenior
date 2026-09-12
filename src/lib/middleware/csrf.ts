import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * CSRF Protection Middleware
 * Validates origin and referer headers for POST/PUT/DELETE requests
 */
export async function validateCSRFToken(req: NextRequest) {
  const method = req.method

  // Only validate on state-changing requests
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null
  }

  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    const referer = headersList.get('referer')

    // List of allowed origins
    const allowedOrigins = [
      'https://club-senior.vercel.app',
      process.env.NEXT_PUBLIC_APP_URL || 'https://club-senior.vercel.app',
      // Allow localhost for development
      ...(process.env.NODE_ENV === 'development'
        ? ['http://localhost:3000', 'http://127.0.0.1:3000']
        : []),
    ]

    // Validate origin header (browsers always send this for cross-origin requests)
    if (origin && !allowedOrigins.includes(origin)) {
      console.warn(`[CSRF] Invalid origin: ${origin}`)
      return NextResponse.json(
        { error: 'CSRF validation failed: Invalid origin' },
        { status: 403 }
      )
    }

    // Validate referer header (secondary check)
    if (referer) {
      const refererUrl = new URL(referer)
      if (!allowedOrigins.includes(refererUrl.origin)) {
        console.warn(`[CSRF] Invalid referer: ${refererUrl.origin}`)
        return NextResponse.json(
          { error: 'CSRF validation failed: Invalid referer' },
          { status: 403 }
        )
      }
    }

    // CSRF token is valid
    return null
  } catch (error) {
    console.error('[CSRF] Error validating CSRF token:', error)
    return NextResponse.json(
      { error: 'CSRF validation error' },
      { status: 400 }
    )
  }
}

/**
 * Extract user context for logging
 */
export async function getRequestContext(req: NextRequest) {
  const headersList = await headers()
  return {
    method: req.method,
    path: new URL(req.url).pathname,
    origin: headersList.get('origin'),
    userAgent: headersList.get('user-agent'),
    timestamp: new Date().toISOString(),
  }
}
