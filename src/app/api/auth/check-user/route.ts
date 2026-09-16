import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/check-user
 * Verifica si un usuario ya existe y está registrado
 * 
 * Input: { email }
 * Output: { exists: boolean, inscripcion_completada: boolean, suscripcion_estado: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuración servidor incompleta' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Buscar usuario en BD
    const { data, error } = await supabase
      .from('usuarios')
      .select('email, inscripcion_completada, suscripcion_estado')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "No rows found" (usuario no existe)
      console.error('[CHECK-USER] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      // Usuario no existe
      console.log('[CHECK-USER] Usuario no existe:', email);
      return NextResponse.json({
        exists: false,
        inscripcion_completada: false,
        suscripcion_estado: null,
      });
    }

    // Usuario existe
    console.log('[CHECK-USER] Usuario existe:', email, data);
    return NextResponse.json({
      exists: true,
      inscripcion_completada: data.inscripcion_completada || false,
      suscripcion_estado: data.suscripcion_estado || null,
    });

  } catch (error: any) {
    console.error('[CHECK-USER] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
