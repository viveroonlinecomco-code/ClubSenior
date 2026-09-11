import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/facilitador/asistencias/registrar
 * Registra la asistencia de un participante a una actividad
 */
export async function POST(request: NextRequest) {
  try {
    const {
      actividad_id,
      participante_id,
      presente,
      observaciones,
    } = await request.json();

    if (!actividad_id || !participante_id || presente === undefined) {
      return NextResponse.json(
        { error: 'actividad_id, participante_id, presente son requeridos' },
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

    console.log('[ASISTENCIA] Registering:', {
      actividad_id,
      participante_id,
      presente,
    });

    // 1. Verificar si ya existe registro de asistencia
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/asistencias?actividad_id=eq.${encodeURIComponent(actividad_id)}&participante_id=eq.${encodeURIComponent(participante_id)}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const existingRegistros = await checkResponse.json();
    const hora_registro = new Date().toISOString();

    let response;

    if (Array.isArray(existingRegistros) && existingRegistros.length > 0) {
      // UPDATE existing record
      response = await fetch(
        `${supabaseUrl}/rest/v1/asistencias?id=eq.${encodeURIComponent(existingRegistros[0].id)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            presente,
            observaciones: observaciones || null,
            hora_llegada: presente ? hora_registro : null,
          }),
        }
      );

      console.log('[ASISTENCIA] Updated existing record');
    } else {
      // CREATE new record
      const asistenciaData = {
        actividad_id,
        participante_id,
        presente,
        observaciones: observaciones || null,
        hora_llegada: presente ? hora_registro : null,
      };

      response = await fetch(`${supabaseUrl}/rest/v1/asistencias`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asistenciaData),
      });

      console.log('[ASISTENCIA] Created new record');
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('[ASISTENCIA] Failed:', error);
      return NextResponse.json(
        { error: 'Failed to register attendance' },
        { status: response.status }
      );
    }

    console.log('[ASISTENCIA] ✅ Registered successfully');

    return NextResponse.json({
      success: true,
      message: 'Asistencia registrada correctamente',
      presente,
    });

  } catch (error: any) {
    console.error('[ASISTENCIA] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
