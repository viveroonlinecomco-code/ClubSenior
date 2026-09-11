/**
 * GET /api/dashboard/data
 * Get dashboard data for authenticated user
 * Uses token from Authorization header (passed from frontend localStorage)
 * OPTIMIZED: Caches dashboard data for 5 minutes
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyFacilitadorToken } from '@/lib/auth/jwt';
import { getCached } from '@/lib/cache/kv';
import { jwtDecode } from 'jwt-decode';

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

    const token = authHeader.substring(7);
    let email: string;
    
    // Try JWT first (new format)
    try {
      const decoded = jwtDecode<any>(token);
      if (decoded.email && decoded.exp && Date.now() < decoded.exp * 1000) {
        email = decoded.email;
        console.log('[DASHBOARD] Authenticated with JWT:', email);
      } else {
        throw new Error('Invalid JWT');
      }
    } catch {
      // Fallback to Base64 (legacy format for familia users)
      try {
        const legacyEmail = Buffer.from(token, 'base64').toString('utf-8');
        if (legacyEmail && legacyEmail.includes('@')) {
          email = legacyEmail;
          console.log('[DASHBOARD] Authenticated with legacy token:', email);
        } else {
          throw new Error('Invalid legacy token');
        }
      } catch (err) {
        console.error('[DASHBOARD] Invalid token format');
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    if (!email) {
      console.log('[DASHBOARD] Token decoded to empty email');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('[DASHBOARD] Authenticated:', email);

    // ✅ OPTIMIZED: Use cache with 5-minute TTL
    const cacheKey = `dashboard:${email}`;
    const data = await getCached(
      cacheKey,
      async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
          console.error('[DASHBOARD] Missing Supabase config');
          throw new Error('Server configuration error');
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
        return {
          success: true,
          email,
          user: { email },
          suscripcion,
          reportes,
          asistencias: null,
          pagos: [],
          message: 'Welcome to your dashboard!',
        };
      },
      300 // Cache for 5 minutes
    );

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[DASHBOARD] Error:', error.message);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
