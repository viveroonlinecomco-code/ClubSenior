/**
 * GET /api/dashboard/data
 * Get dashboard data for authenticated user
 * Uses token from Authorization header (passed from frontend localStorage)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[DASHBOARD] No auth header');
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    // Extract email from token (base64 encoded)
    const token = authHeader.substring(7);
    let email: string;
    
    try {
      email = Buffer.from(token, 'base64').toString('utf-8');
    } catch (err) {
      console.error('[DASHBOARD] Invalid token format');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!email) {
      console.log('[DASHBOARD] Token decoded to empty email');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('[DASHBOARD] Authenticated:', email);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[DASHBOARD] Missing Supabase config');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 1. Fetch reportes for this user
    let reportes = [];
    try {
      const reportesResponse = await fetch(
        new URL('/api/reportes/lista', request.url),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (reportesResponse.ok) {
        const reportesData = await reportesResponse.json();
        reportes = reportesData.reportes || [];
      }
    } catch (err) {
      console.error('[DASHBOARD] Error fetching reportes:', err);
    }

    // 2. Fetch suscripcion for this user
    let suscripcion = null;
    try {
      const susuariosResponse = await fetch(
        `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}&select=id`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (susuariosResponse.ok) {
        const usuarios = await susuariosResponse.json();
        if (Array.isArray(usuarios) && usuarios.length > 0) {
          const usuario_id = usuarios[0].id;

          const suscrResponse = await fetch(
            `${supabaseUrl}/rest/v1/suscripciones?usuario_id=eq.${usuario_id}&order=created_at.desc&limit=1`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
              },
            }
          );

          if (suscrResponse.ok) {
            const suscripciones = await suscrResponse.json();
            if (Array.isArray(suscripciones) && suscripciones.length > 0) {
              suscripcion = suscripciones[0];
            }
          }
        }
      }
    } catch (err) {
      console.error('[DASHBOARD] Error fetching suscripcion:', err);
    }

    // Return complete dashboard data
    return NextResponse.json({
      success: true,
      email,
      user: { email },
      suscripcion,
      reportes,
      asistencias: null,
      pagos: [],
      message: 'Welcome to your dashboard!',
    });

  } catch (error: any) {
    console.error('[DASHBOARD] Error:', error.message);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
