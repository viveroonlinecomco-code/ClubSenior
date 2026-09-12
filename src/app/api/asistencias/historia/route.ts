import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * GET /api/asistencias/historia
 * Obtiene el historial de asistencias del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let email: string;
    
    // Decode token (JWT format)
    try {
      const decoded = jwtDecode<any>(token);
      if (decoded.email && decoded.exp && Date.now() < decoded.exp * 1000) {
        email = decoded.email;
      } else {
        throw new Error('Invalid JWT');
      }
    } catch {
      // Fallback to Base64 (legacy)
      try {
        const legacyEmail = Buffer.from(token, 'base64').toString('utf-8');
        if (legacyEmail && legacyEmail.includes('@')) {
          email = legacyEmail;
        } else {
          throw new Error('Invalid legacy token');
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 401 }
        );
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[ASISTENCIAS] Missing Supabase config');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Step 1: Get usuario_id from email
    const usuariosResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!usuariosResponse.ok) {
      throw new Error('Failed to fetch user');
    }

    const usuarios = await usuariosResponse.json();
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      // Usuario nuevo sin asistencias
      return NextResponse.json({
        activitiesEnrolled: 0,
        activitiesAttended: 0,
        attendanceRate: 0,
        lastParticipation: 'Nunca',
        byPilar: [
          { name: 'Físicas', attended: 0 },
          { name: 'Cognitivas', attended: 0 },
          { name: 'Sociales', attended: 0 },
          { name: 'Tertulias', attended: 0 },
        ],
        contribution: {
          storiesShared: 0,
          newConnections: 0,
          legacyProjects: 0,
        },
      });
    }

    const usuario_id = usuarios[0].id;

    // Step 2: Get asistencias with actividades info
    const asistenciasResponse = await fetch(
      `${supabaseUrl}/rest/v1/asistencias?usuario_id=eq.${usuario_id}&select=*,actividades(tipo,nombre)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!asistenciasResponse.ok) {
      throw new Error('Failed to fetch asistencias');
    }

    const asistencias = await asistenciasResponse.json();

    // Step 3: Calculate statistics
    const totalInscrito = asistencias.length;
    const totalAsistido = asistencias.filter((a: any) => a.asistio).length;
    const tasa = totalInscrito > 0 
      ? Math.round((totalAsistido / totalInscrito) * 100) 
      : 0;

    // Group by tipo (Físicas, Cognitivas, Sociales, Tertulias)
    const byPilar = {
      'fisica': 0,
      'cognitiva': 0,
      'social': 0,
      'tertulia': 0,
    };

    asistencias.forEach((a: any) => {
      if (a.asistio && a.actividades?.tipo) {
        byPilar[a.actividades.tipo as keyof typeof byPilar]++;
      }
    });

    const ultimaFecha = asistencias.length > 0
      ? asistencias[asistencias.length - 1].fecha
      : null;

    return NextResponse.json({
      activitiesEnrolled: totalInscrito,
      activitiesAttended: totalAsistido,
      attendanceRate: tasa,
      lastParticipation: ultimaFecha 
        ? `Hace ${Math.floor((Date.now() - new Date(ultimaFecha).getTime()) / (1000 * 60 * 60 * 24))} días`
        : 'Nunca',
      byPilar: [
        { name: 'Físicas', attended: byPilar.fisica },
        { name: 'Cognitivas', attended: byPilar.cognitiva },
        { name: 'Sociales', attended: byPilar.social },
        { name: 'Tertulias', attended: byPilar.tertulia },
      ],
      contribution: {
        storiesShared: 0,
        newConnections: 0,
        legacyProjects: 0,
      },
    });

  } catch (error: any) {
    console.error('[ASISTENCIAS] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch asistencias' },
      { status: 500 }
    );
  }
}
