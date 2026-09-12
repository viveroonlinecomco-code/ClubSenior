import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/actividades/proximas
 * Obtiene las próximas actividades de Supabase
 * NOTA: Por ahora retorna datos hardcodeados mientras verificamos Supabase
 */
export async function GET(request: NextRequest) {
  try {
    // DATOS HARDCODEADOS DE PRUEBA
    const actividadesMock = [
      {
        id: 1,
        emoji: '💪',
        nombre: 'Movimiento Vital',
        tipo: 'fisica',
        descripcion: 'Calentamiento, movilidad articular, flexibilidad y vuelta a la calma.',
        objetivo: 'Movilidad, coordinación, equilibrio',
        dia: 'lunes',
        hora_inicio: '14:30',
        duracion_minutos: 30,
        semana: 1,
      },
      {
        id: 2,
        emoji: '🧠',
        nombre: 'Mente Activa',
        tipo: 'cognitiva',
        descripcion: 'Juegos de memoria, trivia, refranes, canciones, fotografías y tertulia.',
        objetivo: 'Atención, memoria, lenguaje, evocación',
        dia: 'miercoles',
        hora_inicio: '15:00',
        duracion_minutos: 90,
        semana: 1,
      },
      {
        id: 3,
        emoji: '💪',
        nombre: 'Equilibrio & Energía',
        tipo: 'fisica',
        descripcion: 'Caminata, aeróbica moderada, equilibrio.',
        objetivo: 'Balance, coordinación, movilidad',
        dia: 'lunes',
        hora_inicio: '14:30',
        duracion_minutos: 30,
        semana: 2,
      },
      {
        id: 4,
        emoji: '👥',
        nombre: 'Pintando Recuerdos',
        tipo: 'social',
        descripcion: 'Pintura guiada, temas elegidos por el grupo.',
        objetivo: 'Creatividad, expresión, autoestima, socialización',
        dia: 'viernes',
        hora_inicio: '15:00',
        duracion_minutos: 90,
        semana: 2,
      },
      {
        id: 5,
        emoji: '💪',
        nombre: 'Actívate',
        tipo: 'fisica',
        descripcion: 'Coordinación con pelota, fuerza funcional.',
        objetivo: 'Condición física, coordinación, fuerza',
        dia: 'lunes',
        hora_inicio: '14:30',
        duracion_minutos: 30,
        semana: 3,
      },
      {
        id: 6,
        emoji: '👥',
        nombre: 'Club de Amigos',
        tipo: 'social',
        descripcion: 'Juegos de mesa, conversación, café/té con snack.',
        objetivo: 'Amistades, pertenencia, estimulación mental',
        dia: 'miercoles',
        hora_inicio: '15:00',
        duracion_minutos: 90,
        semana: 3,
      },
      {
        id: 7,
        emoji: '💪',
        nombre: 'Baile & Movimiento',
        tipo: 'fisica',
        descripcion: 'Baile de bajo impacto, coreografías sencillas.',
        objetivo: 'Coordinación, ritmo, diversión, ánimo',
        dia: 'lunes',
        hora_inicio: '14:30',
        duracion_minutos: 30,
        semana: 4,
      },
      {
        id: 8,
        emoji: '👥',
        nombre: 'Creando Experiencias',
        tipo: 'social',
        descripcion: 'Evento especial mensual (karaoke, cine, música, danza, taller).',
        objetivo: 'Diversión, creatividad, conexión social, motivación',
        dia: 'viernes',
        hora_inicio: '15:00',
        duracion_minutos: 90,
        semana: 4,
      },
    ];

    console.log('[ACTIVIDADES] Returning mock data with', actividadesMock.length, 'activities');
    
    return NextResponse.json({
      success: true,
      actividades: actividadesMock,
      count: actividadesMock.length,
      _note: 'Mock data - Supabase connection pending',
    });

  } catch (error: any) {
    console.error('[ACTIVIDADES] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch actividades' },
      { status: 500 }
    );
  }
}
