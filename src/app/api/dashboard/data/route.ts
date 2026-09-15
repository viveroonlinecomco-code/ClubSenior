/**
 * GET /api/dashboard/data
 * Get dashboard data for authenticated user
 * Uses token from Authorization header (passed from frontend localStorage)
 */

import { NextRequest, NextResponse } from 'next/server';
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

    // ✅ Fetch data directly (no cache - KV not configured)
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

    // 2. Fetch usuario data AND suscripcion for this user
    let usuario = null;
    let suscripcion = null;
    let usuario_id = null;
    
    try {
      // ✅ CRITICAL FIX: Fetch usuario WITH all personal data
      const usuariosResponse = await fetch(
        `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (usuariosResponse.ok) {
        const usuarios = await usuariosResponse.json();
        if (Array.isArray(usuarios) && usuarios.length > 0) {
          usuario = usuarios[0];
          usuario_id = usuario.id;

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
      console.error('[DASHBOARD] Error fetching usuario/suscripcion:', err);
    }

    // 3. Fetch asistencias for this user
    let asistencias = null;
    try {
      const asistResponse = await fetch(
        new URL('/api/asistencias/historia', request.url),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (asistResponse.ok) {
        asistencias = await asistResponse.json();
      }
    } catch (err) {
      console.error('[DASHBOARD] Error fetching asistencias:', err);
    }

    // ✅ CRITICAL FIX: Return REAL user data from database, not hardcoded
    const data = {
      success: true,
      email,
      user: { 
        email,
        id: usuario?.id || null,
        nombre: usuario?.nombre_abuelo || 'Usuario',
        apellido: usuario?.apellido_abuelo || 'Grupo Plateado',
        ciudad: usuario?.ciudad || null,
        fecha_nacimiento: usuario?.fecha_nacimiento || null,
        terminos_aceptados: usuario?.terminos_aceptados || false,
        politica_privacidad_aceptada: usuario?.politica_privacidad_aceptada || false,
        contratos_sponsor_firmado: usuario?.contratos_sponsor_firmado || false,
        contratos_participant_firmado: usuario?.contratos_participant_firmado || false,
        inscripcion_completada: usuario?.inscripcion_completada || false,
      },
      suscripcion: suscripcion ? {
        ...suscripcion,
        plan: usuario?.suscripcion_plan || suscripcion?.plan_type,
        estado: usuario?.suscripcion_estado || 'activa',
        fecha_pago: usuario?.fecha_pago_ultimo || null,
      } : null,
      reportes,
      asistencias,
      pagos: [],
      message: `Bienvenido ${usuario?.nombre_abuelo || 'a Grupo Plateado'}!`,
    };

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[DASHBOARD] Error:', error.message);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
