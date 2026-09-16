import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const { actividad_id, asistencias } = await request.json();

    if (!actividad_id || !asistencias || !Array.isArray(asistencias)) {
      return NextResponse.json(
        { error: 'actividad_id y asistencias array son requeridos' },
        { status: 400 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    // ✅ Validar que la actividad existe
    const { data: actividad, error: actError } = await supabase
      .from('actividades')
      .select('id')
      .eq('id', actividad_id)
      .single();

    if (actError || !actividad) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    // ✅ Procesar asistencias en lote
    const registrosValidos = asistencias.filter(
      (a) => a.participante_id && typeof a.asistio === 'boolean'
    );

    if (registrosValidos.length === 0) {
      return NextResponse.json(
        { error: 'Sin asistencias válidas para registrar' },
        { status: 400 }
      );
    }

    // ✅ Upsert: actualizar si existe, crear si no
    const { data, error } = await supabase
      .from('asistencias')
      .upsert(
        registrosValidos.map((a) => ({
          actividad_id,
          participante_id: a.participante_id,
          asistio: a.asistio,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'actividad_id,participante_id' }
      )
      .select();

    if (error) {
      console.error('[MARK ATTENDANCE] Error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[MARK ATTENDANCE] ✅ Registradas:', (data || []).length);

    return NextResponse.json({
      success: true,
      total: (data || []).length,
      mensaje: `✅ ${(data || []).length} asistencias registradas`,
    });
  } catch (error: any) {
    console.error('[MARK ATTENDANCE] Exception:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const actividad_id = searchParams.get('actividad_id');

    if (!actividad_id) {
      return NextResponse.json(
        { error: 'actividad_id requerido' },
        { status: 400 }
      );
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    );

    // ✅ Step 1: Obtener actividad + condominio
    const { data: actividad, error: actError } = await supabase
      .from('actividades')
      .select('condominio_id')
      .eq('id', actividad_id)
      .single();

    if (actError || !actividad) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    // ✅ Step 2: Obtener participantes del condominio
    const { data: participantes, error: partError } = await supabase
      .from('participantes')
      .select('id, nombre, edad, genero')
      .eq('condominio_id', actividad.condominio_id)
      .order('nombre', { ascending: true });

    if (partError) {
      console.error('[GET PARTICIPANTS] Error:', partError.message);
      return NextResponse.json(
        { error: partError.message },
        { status: 500 }
      );
    }

    // ✅ Step 3: Obtener asistencias de esta actividad
    const { data: asistenciasData, error: asiError } = await supabase
      .from('asistencias')
      .select('participante_id, asistio')
      .eq('actividad_id', actividad_id);

    if (asiError) {
      console.error('[GET ASISTENCIAS] Error:', asiError.message);
      return NextResponse.json(
        { error: asiError.message },
        { status: 500 }
      );
    }

    // ✅ Step 4: Mapear asistencias
    const asistenciasMap = new Map(
      (asistenciasData || []).map((a: any) => [a.participante_id, a.asistio])
    );

    const participantesEnriquecidos = (participantes || []).map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      edad: p.edad,
      genero: p.genero,
      asistio: asistenciasMap.get(p.id) ?? false,
    }));

    return NextResponse.json({
      success: true,
      participantes: participantesEnriquecidos,
      total: participantesEnriquecidos.length,
    });
  } catch (error: any) {
    console.error('[GET PARTICIPANTS] Exception:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
