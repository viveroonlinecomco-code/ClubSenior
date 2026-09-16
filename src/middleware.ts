import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function verifyAuth(token: string): Promise<{ email: string; admin: boolean } | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const verified = await jwtVerify(token, secret);
    const { email, admin } = verified.payload as { email: string; admin: boolean };

    if (!admin) {
      return null;
    }

    return { email, admin };
  } catch (err) {
    console.error('[MIDDLEWARE] JWT verification failed:', err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ SOLO proteger rutas /admin/*
  if (pathname.startsWith('/admin')) {
    // ✅ /admin/login es pública (no requiere token)
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // ✅ Otras rutas /admin/* requieren token válido
    const token = request.headers.get('Authorization')?.split(' ')[1] ||
                  request.cookies.get('admin_token')?.value;

    if (!token) {
      console.warn('[MIDDLEWARE] Sin token, redirigiendo a /admin/login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verificar JWT
    const payload = await verifyAuth(token);
    if (!payload) {
      console.warn('[MIDDLEWARE] Token inválido, redirigiendo a /admin/login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    console.log('[MIDDLEWARE] ✅ Token válido para:', pathname, 'Email:', payload.email);

    // Pasar email al request para que esté disponible en las rutas
    const response = NextResponse.next();
    response.headers.set('x-admin-email', payload.email);
    return response;
  }

  // ✅ Todas las otras rutas pasan normalmente (SIN cambios)
  return NextResponse.next();
}

// ✅ CRÍTICO: solo aplicar middleware a rutas /admin/*
export const config = {
  matcher: ['/admin/:path*'],
};
