import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/actividades/proximas
 * Lista las próximas actividades (sesiones semanales)
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Obtener actividades activas y ordenadas por fecha
    const actividadesResponse = await fetch(
      `${supabaseUrl}/rest/v1/actividades?activo=eq.true&order=fecha_inicio.asc&limit=10`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const actividades = await actividadesResponse.json();

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
