import { NextRequest, NextResponse } from 'next/server';
import { getCached } from '@/lib/cache/kv';

/**
 * GET /api/facilitador/actividades/proximas
 * Obtiene actividades próximas de un condominio
 * OPTIMIZED: Caches activities for 5 minutes per condominio
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

    // ✅ OPTIMIZED: Use cache with condominio_id key
    const cacheKey = `actividades:proximas:${condominio_id}`;
    const data = await getCached(
      cacheKey,
      async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Server configuration error');
        }

        // Obtener actividades programadas o en progreso (próximas 30 días)
        const today = new Date().toISOString().split('T')[0];
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        const getHeaders = new Headers({
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        });

        const response = await fetch(
          `${supabaseUrl}/rest/v1/actividades?condominio_id=eq.${encodeURIComponent(condominio_id)}&fecha=gte.${today}&fecha=lte.${futureDate}&estado=in.(PROGRAMADA,EN_PROGRESO)&order=fecha.asc,hora_inicio.asc`,
          {
            method: 'GET',
            headers: getHeaders,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const actividades = await response.json();
        return {
          success: true,
          actividades: Array.isArray(actividades) ? actividades : [],
        };
      },
      300 // Cache for 5 minutes
    );

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[ACTIVIDADES] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
