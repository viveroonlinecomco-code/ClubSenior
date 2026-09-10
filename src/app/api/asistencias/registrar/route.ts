import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/asistencias/registrar
 * Registra la asistencia de un participante a una actividad
 */
export async function POST(request: NextRequest) {
  try {
    const { participante_id, actividad_id, presente, notas } = await request.json();

    if (!participante_id || !actividad_id || presente === undefined) {
      return NextResponse.json(
        { error: 'participante_id, actividad_id y presente son requeridos' },
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

    console.log('[ASISTENCIAS] Registering:', { participante_id, actividad_id, presente });

    // Crear o actualizar asistencia
    const asistenciaData = {
      participante_id,
      actividad_id,
      presente,
      notas: notas || null,
      fecha: new Date().toISOString(),
    };

    const response = await fetch(
      `${supabaseUrl}/rest/v1/asistencias`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asistenciaData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[ASISTENCIAS] Failed:', error);
      return NextResponse.json(
        { error: 'Failed to register asistencia' },
        { status: response.status }
      );
    }

    console.log('[ASISTENCIAS] ✅ Registered successfully');

    return NextResponse.json({
      success: true,
      message: 'Asistencia registrada correctamente',
    });

  } catch (error: any) {
    console.error('[ASISTENCIAS] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
