import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/inscribir/check-email
 * Verifica si el email existe y retorna datos preexistentes
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
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    }

    // Buscar usuario existente
    const response = await fetch(
      `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { exists: false, data: null },
        { status: 200 }
      );
    }

    const usuarios = await response.json();

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      // Usuario no existe
      return NextResponse.json(
        {
          exists: false,
          data: null,
          message: 'Usuario nuevo - completar formulario',
        },
        { status: 200 }
      );
    }

    // Usuario EXISTE - retornar datos
    const usuario = usuarios[0];
    return NextResponse.json(
      {
        exists: true,
        data: {
          nombreAbuelo: usuario.nombre_abuelo || '',
          apellidoAbuelo: usuario.apellido_abuelo || '',
          email: usuario.email || '',
          telefono: usuario.phone || '',
          fechaNacimiento: usuario.fecha_nacimiento || '',
          ciudad: usuario.ciudad || '',
          eps: usuario.eps || '',
          emergenciaNombre: usuario.emergencia_nombre || '',
          emergenciaTelefono: usuario.emergencia_telefono || '',
          familiarNombre: usuario.familiar_nombre || '',
          familiarRelacion: usuario.familiar_relacion || '',
          familiarTelefono: usuario.familiar_telefono || '',
        },
        inscripcionCompletada: usuario.inscripcion_completada || false,
        message: 'Datos encontrados - completar campos faltantes',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[CHECK-EMAIL] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
