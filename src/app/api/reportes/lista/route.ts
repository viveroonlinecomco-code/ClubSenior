import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

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

    // Try JWT first (new format)
    try {
      const decoded = jwtDecode<any>(token);
      if (decoded.email && decoded.exp && Date.now() < decoded.exp * 1000) {
        email = decoded.email;
      } else {
        throw new Error('Invalid JWT');
      }
    } catch {
      // Fallback to Base64 (legacy format)
      try {
        const legacyEmail = Buffer.from(token, 'base64').toString('utf-8');
        if (legacyEmail && legacyEmail.includes('@')) {
          email = legacyEmail;
        } else {
          throw new Error('Invalid legacy token');
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    // ✅ Fetch data directly (no cache - KV not configured)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Server configuration error');
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

    if (!usuarioResponse.ok) {
      console.error('[REPORTES-LISTA] Usuario fetch failed:', usuarioResponse.status);
      return NextResponse.json(
        { error: 'Failed to fetch user', reportes: [] },
        { status: 200 }
      );
    }

    const usuarios = await usuarioResponse.json();
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      // Usuario no existe - retorna array vacío
      return NextResponse.json({
        success: true,
        reportes: [],
      });
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

    if (!participantesResponse.ok) {
      console.error('[REPORTES-LISTA] Participantes fetch failed:', participantesResponse.status);
      return NextResponse.json({
        success: true,
        reportes: [],
      });
    }

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
      try {
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

        if (!reportesResponse.ok) {
          console.error('[REPORTES-LISTA] Reportes fetch failed for participante', participante.id);
          continue;
        }

        const reportes = await reportesResponse.json();
        if (Array.isArray(reportes)) {
          allReportes.push({
            participante: participante.nombre,
            participante_id: participante.id,
            reportes,
          });
        }
      } catch (err) {
        console.error('[REPORTES-LISTA] Error fetching reportes for participante:', err);
        // Continue with next participante
      }
    }

    return NextResponse.json({
      success: true,
      reportes: allReportes,
    });

  } catch (error: any) {
    console.error('[REPORTES-LISTA] Error:', error.message);
    return NextResponse.json(
      { 
        error: error.message || 'Server error',
        reportes: []
      },
      { status: 200 } // Return 200 with empty reportes for graceful degradation
    );
  }
}
