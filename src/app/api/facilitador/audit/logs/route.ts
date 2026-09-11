import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/facilitador/audit/logs
 * Obtiene audit logs (solo admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Validar que sea admin
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    let userRole = 'FACILITADOR';
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split('|');
      userRole = parts[2]; // role está en posición 2
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Solo admin puede ver logs
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tabla = searchParams.get('tabla');
    const usuario = searchParams.get('usuario');
    const accion = searchParams.get('accion');

    // Construir query
    let query = `${supabaseUrl}/rest/v1/audit_log?order=created_at.desc&limit=${limit}&offset=${offset}`;

    if (tabla) {
      query += `&tabla_afectada=eq.${encodeURIComponent(tabla)}`;
    }

    if (usuario) {
      query += `&usuario_email=ilike.%${encodeURIComponent(usuario)}%`;
    }

    if (accion) {
      query += `&accion=eq.${encodeURIComponent(accion)}`;
    }

    console.log('[AUDIT-GET] Query:', query);

    const getHeaders = new Headers({
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    });

    const response = await fetch(query, {
      method: 'GET',
      headers: getHeaders,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[AUDIT-GET] Failed:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: response.status }
      );
    }

    const logs = await response.json();

    // Obtener count total
    const countHeaders = new Headers({
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'count=exact',
    });

    const countResponse = await fetch(
      `${supabaseUrl}/rest/v1/audit_log?select=count`,
      {
        method: 'GET',
        headers: countHeaders,
      }
    );

    let total = 0;
    if (countResponse.ok) {
      total = parseInt(countResponse.headers.get('content-range')?.split('/')[1] || '0');
    }

    return NextResponse.json({
      success: true,
      logs: Array.isArray(logs) ? logs : [],
      pagination: {
        limit,
        offset,
        total,
      },
    });

  } catch (error: any) {
    console.error('[AUDIT-GET] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
