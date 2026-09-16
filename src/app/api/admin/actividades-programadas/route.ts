import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * GET /api/admin/actividades-programadas
 * Listar todas las actividades programadas
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/actividades_programadas?select=id,actividad_id,condominio_id,fecha,hora_inicio,hora_fin,notas,actividades(id,titulo),condominios(id,nombre)&order=fecha.desc`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Error fetching programaciones' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      actividades: data || [],
    });
  } catch (error: any) {
    console.error('[API] Error fetching actividades programadas:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/actividades-programadas
 * Crear nueva programación de actividad
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actividad_id, condominio_id, fecha, hora_inicio, hora_fin, notas } = body;

    // Validar
    if (!actividad_id || !condominio_id || !fecha || !hora_inicio || !hora_fin) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Validar hora_fin > hora_inicio
    if (hora_fin <= hora_inicio) {
      return NextResponse.json(
        { error: 'Hora fin debe ser mayor que hora inicio' },
        { status: 400 }
      );
    }

    // Insertar
    const response = await fetch(`${supabaseUrl}/rest/v1/actividades_programadas`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        actividad_id,
        condominio_id,
        fecha,
        hora_inicio,
        hora_fin,
        notas: notas || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[API] Supabase error:', data);
      return NextResponse.json(
        { error: data.message || 'Error creating programación' },
        { status: response.status }
      );
    }

    console.log('[API] ✅ Actividad programada creada:', data[0]?.id);

    return NextResponse.json({
      success: true,
      programacion: data[0],
    });
  } catch (error: any) {
    console.error('[API] Error creating programación:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
