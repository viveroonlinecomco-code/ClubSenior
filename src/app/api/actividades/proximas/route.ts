import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/actividades/proximas
 * Obtiene las próximas actividades de Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[ACTIVIDADES] Missing Supabase config');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Obtener todas las actividades ordenadas por semana y día
    const response = await fetch(
      `${supabaseUrl}/rest/v1/actividades?order=semana.asc,dia.asc,hora_inicio.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch actividades from Supabase');
    }

    const actividades = await response.json();

    // Mapeo de emojis por tipo
    const emojiMap: Record<string, string> = {
      fisica: '💪',
      cognitiva: '🧠',
      social: '👥',
      tertulia: '📖',
    };

    // Formatear respuesta
    const formatted = actividades.map((act: any) => ({
      id: act.id,
      emoji: emojiMap[act.tipo] || '📅',
      nombre: act.nombre,
      tipo: act.tipo,
      descripcion: act.descripcion,
      objetivo: act.objetivo,
      dia: act.dia,
      hora_inicio: act.hora_inicio,
      duracion_minutos: act.duracion_minutos,
      semana: act.semana,
    }));

    console.log('[ACTIVIDADES] Fetched', formatted.length, 'actividades');
    
    return NextResponse.json({
      success: true,
      actividades: formatted,
      count: formatted.length,
    });

  } catch (error: any) {
    console.error('[ACTIVIDADES] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch actividades' },
      { status: 500 }
    );
  }
}
