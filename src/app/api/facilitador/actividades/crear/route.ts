import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/facilitador/actividades/crear
 * Facilitador crea una actividad (sesión semanal)
 */
export async function POST(request: NextRequest) {
  try {
    const {
      nombre,
      descripcion,
      fecha,
      hora_inicio,
      duracion_minutos,
      condominio_id,
      ubicacion,
      capacidad_max,
    } = await request.json();

    if (!nombre || !fecha || !hora_inicio || !condominio_id) {
      return NextResponse.json(
        { error: 'nombre, fecha, hora_inicio, condominio_id son requeridos' },
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

    console.log('[ACTIVIDAD] Creating activity:', { nombre, fecha, hora_inicio });

    // Crear actividad
    const actividadData = {
      nombre,
      descripcion: descripcion || null,
      fecha,
      hora_inicio,
      duracion_minutos: duracion_minutos || 120,
      condominio_id,
      ubicacion: ubicacion || null,
      capacidad_max: capacidad_max || null,
      estado: 'PROGRAMADA',
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/actividades`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actividadData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[ACTIVIDAD] Create failed:', error);
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: response.status }
      );
    }

    console.log('[ACTIVIDAD] ✅ Created:', nombre);

    return NextResponse.json({
      success: true,
      message: 'Actividad creada correctamente',
    });

  } catch (error: any) {
    console.error('[ACTIVIDAD] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
