import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ SOLO proteger rutas /admin/*
  // TODO: otras rutas pasan sin cambios
  if (pathname.startsWith('/admin')) {
    // ✅ /admin/login es pública (no requiere token)
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // ✅ Otras rutas /admin/* requieren token
    const token = request.headers.get('Authorization')?.split(' ')[1] ||
                  request.cookies.get('admin_token')?.value;

    if (!token) {
      console.warn('[MIDDLEWARE] Sin token, redirigiendo a /admin/login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    console.log('[MIDDLEWARE] ✅ Token válido para:', pathname);
  }

  // ✅ Todas las otras rutas pasan normalmente (SIN cambios)
  return NextResponse.next();
}

// ✅ CRÍTICO: solo aplicar middleware a rutas /admin/*
export const config = {
  matcher: ['/admin/:path*'],
};
