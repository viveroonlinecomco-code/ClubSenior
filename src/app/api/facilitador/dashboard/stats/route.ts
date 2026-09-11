import { NextRequest, NextResponse } from 'next/server';
import { verifyFacilitadorToken } from '@/lib/auth/jwt';
import { jwtDecode } from 'jwt-decode';

export async function POST(request: NextRequest) {
  try {
    const { facilitador_id } = await request.json();
    const token = request.headers.get('Authorization')?.substring(7);

    if (!token || !facilitador_id) {
      return NextResponse.json(
        { error: 'Missing token or facilitador_id' },
        { status: 400 }
      );
    }

    // Verify token
    const decoded = jwtDecode<any>(token);
    if (!decoded || decoded.facilitadorId !== facilitador_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    const headers = new Headers({
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    });

    // 1. Get facilitador's condominio
    const facResponse = await fetch(
      `${supabaseUrl}/rest/v1/facilitadores?id=eq.${facilitador_id}&select=condominio_id`,
      { method: 'GET', headers }
    );
    const facilitadores = await facResponse.json();
    const condominio_id = facilitadores[0]?.condominio_id;

    if (!condominio_id) {
      return NextResponse.json(
        { error: 'Facilitador not found' },
        { status: 404 }
      );
    }

    // 2. Get total activities for this month
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const activResponse = await fetch(
      `${supabaseUrl}/rest/v1/actividades?condominio_id=eq.${condominio_id}&fecha=gte.${monthStart}&select=count()`,
      { method: 'GET', headers }
    );
    const totalActividades = activResponse.headers.get('content-range')?.split('/')[1] || 0;

    // 3. Get next activity
    const mañana = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const nextResponse = await fetch(
      `${supabaseUrl}/rest/v1/actividades?condominio_id=eq.${condominio_id}&fecha=lte.${mañana}&fecha=gte.${today.toISOString().split('T')[0]}&order=fecha.asc,hora_inicio.asc&limit=1&select=nombre,hora_inicio`,
      { method: 'GET', headers }
    );
    const nextActivities = await nextResponse.json();
    const proximaActividad = nextActivities[0]
      ? `${nextActivities[0].nombre} - ${nextActivities[0].hora_inicio}`
      : null;

    // 4. Get total participants in condominio
    const partResponse = await fetch(
      `${supabaseUrl}/rest/v1/participantes?condominio_id=eq.${condominio_id}&activo=eq.true&select=count()`,
      { method: 'GET', headers }
    );
    const totalParticipantes = partResponse.headers.get('content-range')?.split('/')[1] || 0;

    // 5. Get attendance average for this week
    const semanaStart = new Date(today);
    semanaStart.setDate(semanaStart.getDate() - semanaStart.getDay());
    const semanaEnd = new Date(semanaStart);
    semanaEnd.setDate(semanaEnd.getDate() + 6);

    const attResponse = await fetch(
      `${supabaseUrl}/rest/v1/asistencias?select=presente&actividad_id=in.(SELECT id FROM actividades WHERE condominio_id = '${condominio_id}' AND fecha >= '${semanaStart.toISOString().split('T')[0]}' AND fecha <= '${semanaEnd.toISOString().split('T')[0]}')`,
      { method: 'GET', headers }
    );
    const attendances = await attResponse.json();
    const asistenciaPromedio =
      attendances.length > 0
        ? Math.round((attendances.filter((a: any) => a.presente).length / attendances.length) * 100)
        : 0;

    // 6. Get reports created this week
    const semanaStartStr = semanaStart.toISOString().split('T')[0];
    const reportResponse = await fetch(
      `${supabaseUrl}/rest/v1/reportes_semanales?created_at=gte.${semanaStartStr}&select=count()`,
      { method: 'GET', headers }
    );
    const reportesEstaSeana = reportResponse.headers.get('content-range')?.split('/')[1] || 0;

    return NextResponse.json({
      totalActividades: parseInt(totalActividades as string),
      proximaActividad,
      totalParticipantes: parseInt(totalParticipantes as string),
      asistenciaPromedio,
      reportesEstaSeana: parseInt(reportesEstaSeana as string),
    });
  } catch (error: any) {
    console.error('[FACILITADOR-STATS] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
