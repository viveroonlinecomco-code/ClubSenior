import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Obtener sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteger rutas que requieren autenticación
  if (!user && request.nextUrl.pathname.startsWith('/familia')) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Redirigir si ya está logueado y va a /signin o /inscribir
  if (user && (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname.startsWith('/inscribir'))) {
    return NextResponse.redirect(new URL('/familia', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/familia/:path*', '/signin', '/inscribir/:path*'],
};
