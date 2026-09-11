import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/facilitador/actividades/:id/participantes
 * Obtiene lista de participantes inscritos en una actividad
 * OPTIMIZED: Usa RPC en lugar de N+1 queries (3 queries → 1 query)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actividad_id = id;

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

    console.log('[PERF] Fetching activity details with RPC for:', actividad_id);

    // ✅ OPTIMIZED: Single RPC call instead of 3 separate queries
    const headers = new Headers({
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    });

    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/get_activity_details`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ activity_id: actividad_id }),
      }
    );

    if (!response.ok) {
      console.error('[PERF] RPC failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch activity' },
        { status: response.status }
      );
    }

    const rows = await response.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Group data by activity and participantes
    const firstRow = rows[0];
    const actividad = {
      id: firstRow.actividad_id,
      nombre: firstRow.nombre,
      descripcion: firstRow.descripcion,
      fecha: firstRow.fecha,
      hora_inicio: firstRow.hora_inicio,
      duracion_minutos: firstRow.duracion_minutos,
      condominio_id: firstRow.condominio_id,
      ubicacion: firstRow.ubicacion,
      capacidad_max: firstRow.capacidad_max,
      estado: firstRow.estado,
    };

    // Build participantes map to avoid duplicates
    const participantesMap = new Map();
    for (const row of rows) {
      if (row.participante_id && !participantesMap.has(row.participante_id)) {
        participantesMap.set(row.participante_id, {
          id: row.participante_id,
          nombre: row.participante_nombre,
          edad: row.participante_edad,
          genero: row.participante_genero,
          asistencia: {
            presente: row.asistencia_presente,
            hora_llegada: row.asistencia_hora_llegada,
            observaciones: row.asistencia_observaciones,
          },
        });
      }
    }

    const participantes = Array.from(participantesMap.values());

    return NextResponse.json({
      success: true,
      actividad,
      participantes,
    });

  } catch (error: any) {
    console.error('[PARTICIPANTES] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
