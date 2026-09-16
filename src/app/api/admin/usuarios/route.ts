import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const condominio = searchParams.get('condominio') || '';

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    // ✅ Base query
    let q = supabase
      .from('usuarios')
      .select(`
        id,
        email,
        nombre_abuelo,
        apellido_abuelo,
        condominio,
        eps,
        created_at
      `)
      .order('nombre_abuelo', { ascending: true });

    // ✅ Filtro por búsqueda (nombre o email)
    if (query) {
      q = q.or(
        `nombre_abuelo.ilike.%${query}%,apellido_abuelo.ilike.%${query}%,email.ilike.%${query}%`
      );
    }

    // ✅ Filtro por condominio
    if (condominio) {
      q = q.eq('condominio', condominio);
    }

    const { data, error } = await q.limit(100);

    if (error) {
      console.error('[LIST USUARIOS] Error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[LIST USUARIOS] ✅ Total:', (data || []).length);

    return NextResponse.json({
      success: true,
      usuarios: data || [],
      total: (data || []).length,
      query,
      condominio,
    });
  } catch (error: any) {
    console.error('[LIST USUARIOS] Exception:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
