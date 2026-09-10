import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/participantes/create
 * Crea un nuevo participante (abuelo) vinculado al usuario
 */
export async function POST(request: NextRequest) {
  try {
    const { email, nombre, edad, genero, notas } = await request.json();

    if (!email || !nombre || !edad) {
      return NextResponse.json(
        { error: 'Email, nombre y edad son requeridos' },
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

    console.log('[PARTICIPANTES] Creating:', { email, nombre, edad });

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

    // 2. Obtener condominio_id
    const condominioResponse = await fetch(
      `${supabaseUrl}/rest/v1/condominios?select=id&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const condominios = await condominioResponse.json();
    if (!Array.isArray(condominios) || condominios.length === 0) {
      return NextResponse.json(
        { error: 'No hay condominios disponibles' },
        { status: 404 }
      );
    }

    const condominio_id = condominios[0].id;

    // 3. Crear participante
    const participanteData = {
      nombre: nombre.trim(),
      edad: parseInt(edad),
      genero: genero || null,
      notas: notas || null,
      condominio_id,
      usuario_id,
      activo: true,
    };

    const createResponse = await fetch(
      `${supabaseUrl}/rest/v1/participantes`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participanteData),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('[PARTICIPANTES] Create failed:', error);
      return NextResponse.json(
        { error: 'Failed to create participante' },
        { status: createResponse.status }
      );
    }

    console.log('[PARTICIPANTES] ✅ Created successfully');

    return NextResponse.json({
      success: true,
      message: 'Participante creado correctamente',
    });

  } catch (error: any) {
    console.error('[PARTICIPANTES] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
