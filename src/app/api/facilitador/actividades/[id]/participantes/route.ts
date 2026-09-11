import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/facilitador/actividades/:id/participantes
 * Obtiene lista de participantes inscritos en una actividad
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actividad_id = params.id;

    if (!actividad_id) {
      return NextResponse.json(
        { error: 'Actividad ID is required' },
        { status: 400 }
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

    // 1. Obtener datos de la actividad
    const actividadResponse = await fetch(
      `${supabaseUrl}/rest/v1/actividades?id=eq.${encodeURIComponent(actividad_id)}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!actividadResponse.ok) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const actividades = await actividadResponse.json();
    if (!Array.isArray(actividades) || actividades.length === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    const actividad = actividades[0];

    // 2. Obtener participantes de ese condominio
    const participantesResponse = await fetch(
      `${supabaseUrl}/rest/v1/participantes?condominio_id=eq.${encodeURIComponent(actividad.condominio_id)}&select=id,nombre,edad,genero`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!participantesResponse.ok) {
      return NextResponse.json({
        success: true,
        actividad,
        participantes: [],
      });
    }

    const participantes = await participantesResponse.json();

    // 3. Obtener asistencias registradas para esta actividad
    const asistenciasResponse = await fetch(
      `${supabaseUrl}/rest/v1/asistencias?actividad_id=eq.${encodeURIComponent(actividad_id)}&select=participante_id,presente,hora_llegada`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const asistencias = await asistenciasResponse.json();
    const asistenciasMap = new Map();

    if (Array.isArray(asistencias)) {
      asistencias.forEach((a: any) => {
        asistenciasMap.set(a.participante_id, a);
      });
    }

    // 4. Enriquecer participantes con info de asistencia
    const participantesConAsistencia = (participantes || []).map(
      (p: any) => ({
        ...p,
        asistencia: asistenciasMap.get(p.id) || null,
      })
    );

    return NextResponse.json({
      success: true,
      actividad,
      participantes: participantesConAsistencia,
    });

  } catch (error: any) {
    console.error('[PARTICIPANTES] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
