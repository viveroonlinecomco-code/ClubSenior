import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/reportes/seed-test
 * Crea reportes de prueba para todos los participantes del usuario
 * SOLO para testing/development
 */
export async function POST(request: NextRequest) {
  try {
    // Extraer email del token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let email: string;

    try {
      email = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
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

    // 1. Obtener usuario_id
    const usuarioResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const usuarios = await usuarioResponse.json();
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const usuario_id = usuarios[0].id;

    // 2. Obtener participantes del usuario
    const participantesResponse = await fetch(
      `${supabaseUrl}/rest/v1/participantes?usuario_id=eq.${usuario_id}&select=id,nombre`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const participantes = await participantesResponse.json();
    if (!Array.isArray(participantes) || participantes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay participantes para crear reportes',
        created: 0,
      });
    }

    // 3. Crear reportes de prueba
    const reportesCreados = [];
    const contenidos = [
      'Sesión muy productiva. El abuelo participó activamente en las actividades de memoria.',
      'Buena asistencia. Disfrutó mucho de la conversación grupal sobre viajes.',
      'Excelente sesión. Participó en el juego de ajedrez y ganó una partida.',
      'Sesión tranquila. Prefirió escuchar historias de otros participantes.',
      'Muy animado hoy. Contó historias fascinantes sobre su juventud.',
    ];

    const comportamientos = [
      'Muy atento y participativo.',
      'Tranquilo pero interesado.',
      'Sociable y conversador.',
      'Reflexivo y observador.',
      'Animado y alegre.',
    ];

    const progresos = [
      'Mejorando su memoria a corto plazo.',
      'Ganando más confianza social.',
      'Mejorando su concentración.',
      'Más cómodo expresando sus emociones.',
      'Integrándose mejor al grupo.',
    ];

    const recomendaciones = [
      'Continuar estimulando la memoria con juegos.',
      'Fomentar más participación en grupo.',
      'Permitir que comparta historias personales.',
      'Mantener un ritmo tranquilo en las actividades.',
      'Invitar a participar en dinámicas grupales.',
    ];

    for (const participante of participantes) {
      // Crear 3 reportes para cada participante (últimas 3 semanas)
      for (let i = 0; i < 3; i++) {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1 - i * 7);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const semana_inicio = monday.toISOString().split('T')[0];
        const semana_fin = sunday.toISOString().split('T')[0];

        const calificacion = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
        const contenido = contenidos[Math.floor(Math.random() * contenidos.length)];
        const comportamiento = comportamientos[Math.floor(Math.random() * comportamientos.length)];
        const progreso = progresos[Math.floor(Math.random() * progresos.length)];
        const recomendacion = recomendaciones[Math.floor(Math.random() * recomendaciones.length)];

        const reporteData = {
          participante_id: participante.id,
          semana_inicio,
          semana_fin,
          contenido_sesion: contenido,
          comportamiento,
          progreso,
          recomendaciones: recomendacion,
          calificacion,
        };

        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/reportes_semanales`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reporteData),
          });

          if (response.ok) {
            reportesCreados.push({
              participante: participante.nombre,
              semana: `${semana_inicio} a ${semana_fin}`,
              calificacion,
            });
          }
        } catch (err) {
          console.error('[SEED] Error creating report:', err);
        }
      }
    }

    console.log(`[SEED] Created ${reportesCreados.length} test reports`);

    return NextResponse.json({
      success: true,
      message: 'Reportes de prueba creados exitosamente',
      created: reportesCreados.length,
      reportes: reportesCreados,
    });

  } catch (error: any) {
    console.error('[SEED] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
