import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // ✅ Validación: Solo Elena puede hacer login admin
    if (email !== 'promesaobca@gmail.com') {
      console.warn('[ADMIN LOGIN] Intento login no autorizado:', email);
      return NextResponse.json(
        { error: 'No tienes acceso admin' },
        { status: 403 }
      );
    }

    // ✅ Crear cliente Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    // ✅ Autenticación Supabase (sin romper nada)
    console.log('[ADMIN LOGIN] Intentando login:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[ADMIN LOGIN] Error auth:', error.message);
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'No session created' },
        { status: 401 }
      );
    }

    console.log('[ADMIN LOGIN] ✅ Login exitoso:', email);

    // ✅ Retornar JWT
    return NextResponse.json({
      success: true,
      token: data.session.access_token,
      expiresAt: data.session.expires_at,
      admin: {
        email,
        nombre: 'Elena',
      },
    });
  } catch (error: any) {
    console.error('[ADMIN LOGIN] Exception:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
