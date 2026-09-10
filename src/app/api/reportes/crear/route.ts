import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/reportes/crear
 * Facilitador crea reporte semanal de un participante
 */
export async function POST(request: NextRequest) {
  try {
    const {
      participante_id,
      contenido_sesion,
      comportamiento,
      progreso,
      recomendaciones,
      calificacion,
    } = await request.json();

    if (!participante_id || !contenido_sesion || calificacion === undefined) {
      return NextResponse.json(
        { error: 'participante_id, contenido_sesion y calificacion son requeridos' },
        { status: 400 }
      );
    }

    if (calificacion < 1 || calificacion > 5) {
      return NextResponse.json(
        { error: 'calificacion debe estar entre 1 y 5' },
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

    console.log('[REPORTES] Creating weekly report:', { participante_id, calificacion });

    // Calcular semana actual
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const semana_inicio = monday.toISOString().split('T')[0];
    const semana_fin = sunday.toISOString().split('T')[0];

    // Crear reporte
    const reporteData = {
      participante_id,
      semana_inicio,
      semana_fin,
      contenido_sesion: contenido_sesion.trim(),
      comportamiento: comportamiento?.trim() || null,
      progreso: progreso?.trim() || null,
      recomendaciones: recomendaciones?.trim() || null,
      calificacion,
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/reportes_semanales`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reporteData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[REPORTES] Create failed:', error);
      return NextResponse.json(
        { error: 'Failed to create reporte' },
        { status: response.status }
      );
    }

    console.log('[REPORTES] ✅ Created successfully');

    return NextResponse.json({
      success: true,
      message: 'Reporte semanal creado correctamente',
    });

  } catch (error: any) {
    console.error('[REPORTES] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
