import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const { titulo, descripcion, fecha, hora_inicio, hora_fin, condominio_id, modulo } = 
      await request.json();

    // ✅ Validaciones básicas
    if (!titulo || !fecha || !hora_inicio || !hora_fin || !condominio_id) {
      return NextResponse.json(
        { error: 'Campos requeridos: titulo, fecha, hora_inicio, hora_fin, condominio_id' },
        { status: 400 }
      );
    }

    // ✅ Validar fecha >= hoy
    const fechaActividad = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaActividad < hoy) {
      return NextResponse.json(
        { error: 'La fecha no puede ser en el pasado' },
        { status: 400 }
      );
    }

    // ✅ Validar hora_fin > hora_inicio
    const [hI, mI] = hora_inicio.split(':').map(Number);
    const [hF, mF] = hora_fin.split(':').map(Number);
    const minutoInicio = hI * 60 + mI;
    const minutoFin = hF * 60 + mF;

    if (minutoFin <= minutoInicio) {
      return NextResponse.json(
        { error: 'La hora final debe ser posterior a la hora inicial' },
        { status: 400 }
      );
    }

    // ✅ Crear cliente Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    // ✅ Insertar actividad
    const { data, error } = await supabase
      .from('actividades')
      .insert({
        titulo,
        descripcion: descripcion || null,
        fecha,
        hora_inicio,
        hora_fin,
        condominio_id,
        modulo: modulo || 'general',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[CREATE ACTIVITY] Error:', error.message);
      return NextResponse.json(
        { error: `Error al crear actividad: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('[CREATE ACTIVITY] ✅ Actividad creada:', data.id);

    return NextResponse.json({
      success: true,
      actividad: data,
    });
  } catch (error: any) {
    console.error('[CREATE ACTIVITY] Exception:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    // ✅ Listar actividades futuras ordenadas por fecha
    const { data, error } = await supabase
      .from('actividades')
      .select(`
        id,
        titulo,
        descripcion,
        fecha,
        hora_inicio,
        hora_fin,
        condominio_id,
        modulo,
        condominios (
          id,
          nombre
        )
      `)
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true });

    if (error) {
      console.error('[LIST ACTIVITIES] Error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      actividades: data || [],
      total: (data || []).length,
    });
  } catch (error: any) {
    console.error('[LIST ACTIVITIES] Exception:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
