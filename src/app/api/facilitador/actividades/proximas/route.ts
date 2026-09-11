import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/facilitador/actividades/proximas
 * Obtiene actividades próximas de un condominio
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const condominio_id = searchParams.get('condominio_id');

    if (!condominio_id) {
      return NextResponse.json(
        { error: 'condominio_id is required' },
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

    // Obtener actividades programadas o en progreso (próximas 30 días)
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const response = await fetch(
      `${supabaseUrl}/rest/v1/actividades?condominio_id=eq.${encodeURIComponent(condominio_id)}&fecha=gte.${today}&fecha=lte.${futureDate}&estado=in.(PROGRAMADA,EN_PROGRESO)&order=fecha.asc,hora_inicio.asc`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: response.status }
      );
    }

    const actividades = await response.json();

    return NextResponse.json({
      success: true,
      actividades: Array.isArray(actividades) ? actividades : [],
    });

  } catch (error: any) {
    console.error('[ACTIVIDADES] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
