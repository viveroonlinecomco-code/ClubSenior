import { type NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/familia', '/dashboard', '/api/familia'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Only process protected routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // For now, allow all traffic
  return NextResponse.next();
}

// Configure which routes this middleware runs on - ONLY protected routes
export const config = {
  matcher: ['/familia/:path*', '/dashboard/:path*', '/api/familia/:path*'],
};
