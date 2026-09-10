import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/reportes/lista
 * Obtiene los reportes semanales de los participantes de una familia
 */
export async function GET(request: NextRequest) {
  try {
    // Extraer email del token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let email: string;

    try {
      email = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 1. Obtener usuario_id
    const usuarioResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const usuarios = await usuarioResponse.json();
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const usuario_id = usuarios[0].id;

    // 2. Obtener participantes del usuario
    const participantesResponse = await fetch(
      `${supabaseUrl}/rest/v1/participantes?usuario_id=eq.${usuario_id}&select=id,nombre`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const participantes = await participantesResponse.json();
    if (!Array.isArray(participantes)) {
      return NextResponse.json({
        success: true,
        reportes: [],
      });
    }

    // 3. Para cada participante, obtener sus reportes
    const allReportes = [];
    for (const participante of participantes) {
      const reportesResponse = await fetch(
        `${supabaseUrl}/rest/v1/reportes_semanales?participante_id=eq.${participante.id}&order=semana_inicio.desc&limit=10`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const reportes = await reportesResponse.json();
      if (Array.isArray(reportes)) {
        allReportes.push({
          participante: participante.nombre,
          participante_id: participante.id,
          reportes,
        });
      }
    }

    return NextResponse.json({
      success: true,
      reportes: allReportes,
    });

  } catch (error: any) {
    console.error('[REPORTES-LISTA] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
