/**
 * Next.js Middleware
 * Protects authenticated routes and validates JWT
 *
 * Runs BEFORE each request:
 * 1. Check if user is authenticated
 * 2. Validate JWT token from session cookie
 * 3. Redirect to login if needed
 * 4. Refresh token if close to expiration
 */

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require authentication
const PROTECTED_ROUTES = ['/familia', '/dashboard', '/api/familia'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    // Public route - just update session if exists
    return updateSession(request);
  }

  // Protected route - verify authentication
  try {
    // updateSession will also refresh the token if needed
    const response = await updateSession(request);

    // Check if user exists in session
    const supabaseUser = response?.headers.get('x-supabase-user');

    if (!supabaseUser) {
      // No session - redirect to login
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login for safety
    const loginUrl = new URL('/auth/signin', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    // Run on all routes except:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
