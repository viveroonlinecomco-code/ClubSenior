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

    // Helper function to check if origin is allowed
    const isOriginAllowed = (url: string | null): boolean => {
      if (!url) return true // Allow requests without origin (same-site)
      
      try {
        const parsedUrl = new URL(url)
        const host = parsedUrl.hostname
        
        // Allow production domains
        if (host === 'club-senior.vercel.app') return true
        if (host === 'www.tardesdelcafe.com') return true
        if (host === 'tardesdelcafe.com') return true
        
        // Allow ALL Vercel preview deployments (*.vercel.app)
        if (host.endsWith('.vercel.app')) return true
        
        // Allow localhost for development
        if (process.env.NODE_ENV === 'development' && 
            (host === 'localhost' || host === '127.0.0.1')) return true
        
        return false
      } catch {
        return false
      }
    }

    // Validate origin header (browsers always send this for cross-origin requests)
    if (origin && !isOriginAllowed(origin)) {
      console.warn(`[CSRF] Invalid origin: ${origin}`)
      return NextResponse.json(
        { error: 'CSRF validation failed: Invalid origin' },
        { status: 403 }
      )
    }

    // Validate referer header (secondary check)
    if (referer && !isOriginAllowed(referer)) {
      console.warn(`[CSRF] Invalid referer: ${referer}`)
      return NextResponse.json(
        { error: 'CSRF validation failed: Invalid referer' },
        { status: 403 }
      )
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
