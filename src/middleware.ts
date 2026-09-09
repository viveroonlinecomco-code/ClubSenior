import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Simple routing without Supabase calls at middleware level
  // Supabase auth check happens in AuthProvider (client-side)
  
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Get auth session from cookies if it exists
  const sessionCookie = request.cookies.get('sb-session');
  const hasSession = !!sessionCookie?.value;

  // Protect /familia route - redirect to signin if no session
  if (request.nextUrl.pathname.startsWith('/familia') && !hasSession) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Redirect logged-in users away from signin/inscribir
  if (hasSession && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname.startsWith('/inscribir'))) {
    return NextResponse.redirect(new URL('/familia', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/familia/:path*', '/signin', '/inscribir/:path*'],
};
