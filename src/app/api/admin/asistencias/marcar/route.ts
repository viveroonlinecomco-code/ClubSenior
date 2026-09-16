import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * POST /api/admin/asistencias/marcar
 * Guardar asistencias para una actividad programada
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actividades_programadas_id, asistencias } = body;

    if (!actividades_programadas_id || !asistencias || !Array.isArray(asistencias)) {
      return NextResponse.json(
        { error: 'actividades_programadas_id y asistencias array son requeridos' },
        { status: 400 }
      );
    }

    // Validar que la programación existe
    const checkProg = await fetch(
      `${supabaseUrl}/rest/v1/actividades_programadas?id=eq.${actividades_programadas_id}&select=id`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const progData = await checkProg.json();
    if (!Array.isArray(progData) || progData.length === 0) {
      return NextResponse.json(
        { error: 'Actividad programada no encontrada' },
        { status: 404 }
      );
    }

    // Procesar asistencias
    const registrosValidos = asistencias.filter(
      (a: any) => a.participante_id && typeof a.asistio === 'boolean'
    );

    if (registrosValidos.length === 0) {
      return NextResponse.json(
        { error: 'Sin asistencias válidas para registrar' },
        { status: 400 }
      );
    }

    // Upsert asistencias
    const response = await fetch(`${supabaseUrl}/rest/v1/asistencias`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(
        registrosValidos.map((a: any) => ({
          actividades_programadas_id,
          participante_id: a.participante_id,
          asistio: a.asistio,
          updated_at: new Date().toISOString(),
        }))
      ),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[MARK ATTENDANCE] Error:', data);
      return NextResponse.json(
        { error: data.message || 'Error al guardar asistencias' },
        { status: response.status }
      );
    }

    console.log('[MARK ATTENDANCE] ✅ Registradas:', Array.isArray(data) ? data.length : 1);

    return NextResponse.json({
      success: true,
      total: Array.isArray(data) ? data.length : 1,
      mensaje: `✅ ${Array.isArray(data) ? data.length : 1} asistencias registradas`,
    });
  } catch (error: any) {
    console.error('[MARK ATTENDANCE] Exception:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/asistencias/marcar
 * Obtener asistencias registradas para una actividad programada
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const actividades_programadas_id = searchParams.get('actividades_programadas_id');

    if (!actividades_programadas_id) {
      return NextResponse.json(
        { error: 'actividades_programadas_id requerido' },
        { status: 400 }
      );
    }

    // Obtener participantes del condominio
    const progResponse = await fetch(
      `${supabaseUrl}/rest/v1/actividades_programadas?id=eq.${actividades_programadas_id}&select=condominio_id`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const progData = await progResponse.json();
    if (!Array.isArray(progData) || progData.length === 0) {
      return NextResponse.json(
        { error: 'Actividad programada no encontrada' },
        { status: 404 }
      );
    }

    const condominio_id = progData[0].condominio_id;

    // Obtener participantes del condominio
    const partResponse = await fetch(
      `${supabaseUrl}/rest/v1/participantes?condominio_id=eq.${condominio_id}&select=id,nombre,edad&order=nombre.asc`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const participantes = await partResponse.json();

    // Obtener asistencias ya registradas
    const asiResponse = await fetch(
      `${supabaseUrl}/rest/v1/asistencias?actividades_programadas_id=eq.${actividades_programadas_id}&select=participante_id,asistio`,
      {
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const asistencias = await asiResponse.json();

    return NextResponse.json({
      success: true,
      participantes: Array.isArray(participantes) ? participantes : [],
      asistencias: Array.isArray(asistencias) ? asistencias : [],
    });
  } catch (error: any) {
    console.error('[GET ATTENDANCE] Exception:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
