import { NextRequest, NextResponse } from 'next/server';
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

    // Get facilitador's condominio
    const facResponse = await fetch(
      `${supabaseUrl}/rest/v1/facilitadores?id=eq.${facilitador_id}&select=condominio_id`,
      { method: 'GET', headers }
    );
    const facilitadores = await facResponse.json();

    if (!facilitadores.length) {
      return NextResponse.json(
        { error: 'Facilitador not found' },
        { status: 404 }
      );
    }

    const condominio_id = facilitadores[0].condominio_id;

    // Get activities for this condominio (últimos 90 días)
    const noventa_dias = new Date();
    noventa_dias.setDate(noventa_dias.getDate() - 90);
    const ninety_days_ago = noventa_dias.toISOString().split('T')[0];

    const activResponse = await fetch(
      `${supabaseUrl}/rest/v1/actividades?condominio_id=eq.${condominio_id}&fecha=gte.${ninety_days_ago}&order=fecha.desc,hora_inicio.desc&select=id,nombre,fecha,hora_inicio,duracion_minutos,capacidad_max,estado`,
      { method: 'GET', headers }
    );

    if (!activResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: activResponse.status }
      );
    }

    const actividades = await activResponse.json();

    return NextResponse.json({
      success: true,
      actividades: actividades || [],
    });
  } catch (error: any) {
    console.error('[FACILITADOR-ACTIVIDADES] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
