import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/condominios/list
 * Returns all active condominios from the database
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[CONDOMINIOS] Config missing');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    console.log('[CONDOMINIOS] Fetching all condominios...');

    // Fetch from condominios table ordered by name
    const response = await fetch(
      `${supabaseUrl}/rest/v1/condominios?activo=eq.true&order=nombre.asc`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('[CONDOMINIOS] Fetch failed:', response.status);
      return NextResponse.json(
        { error: 'Failed to fetch condominios' },
        { status: response.status }
      );
    }

    const condominios = await response.json();
    console.log(`[CONDOMINIOS] Found ${condominios.length} condominios ✅`);

    // Return only id and nombre for select options
    const formatted = condominios.map((c: any) => ({
      id: c.id,
      nombre: c.nombre,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[CONDOMINIOS] Exception:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
