import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/create-test-user
 * Crea usuario de PRUEBA SIN PAGAR para testing del dashboard
 * 
 * Body: { email, nombre, apellido, plan }
 * Headers: x-admin-key: [ADMIN_SECRET_KEY]
 * 
 * ⚠️ SOLO USAR EN DESARROLLO
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombre = 'Elena', apellido = 'Test', plan = 'mensual' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    // Validar que sea admin
    const adminKey = request.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Conectar a Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Configuración servidor incompleta' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Crear o actualizar usuario de prueba
    const { data, error } = await supabase
      .from('usuarios')
      .upsert(
        {
          email: email.toLowerCase(),
          nombre_abuelo: nombre,
          apellido_abuelo: apellido,
          fecha_nacimiento: '1990-05-15',
          ciudad: 'Cajicá',
          terminos_aceptados: true,
          politica_privacidad_aceptada: true,
          contratos_sponsor_firmado: true,
          contratos_participant_firmado: true,
          suscripcion_plan: plan,
          suscripcion_estado: 'ACTIVA',
          inscripcion_completada: true,
          phone: '3002937403',
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (error) {
      console.error('[ADMIN] Error creando usuario:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[ADMIN] ✅ Usuario de prueba creado:', email);

    return NextResponse.json({
      success: true,
      message: '✅ Usuario de prueba creado',
      user: {
        email: data.email,
        nombre: data.nombre_abuelo,
        apellido: data.apellido_abuelo,
        plan: data.suscripcion_plan,
        estado: data.suscripcion_estado,
        dashboard_url: `https://www.tardesdelcafe.com/familia`,
      },
    });
  } catch (error: any) {
    console.error('[ADMIN] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
