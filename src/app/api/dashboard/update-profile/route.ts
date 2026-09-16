import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * POST /api/dashboard/update-profile
 * Actualiza información del perfil del usuario autenticado
 * 
 * Body: { nombre_abuelo, apellido_abuelo, fecha_nacimiento, ciudad, condominio, telefono }
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticar con token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let email: string;

    try {
      const decoded = jwtDecode<any>(token);
      if (decoded.email && decoded.exp && Date.now() < decoded.exp * 1000) {
        email = decoded.email;
      } else {
        throw new Error('Invalid JWT');
      }
    } catch {
      const legacyEmail = Buffer.from(token, 'base64').toString('utf-8');
      if (legacyEmail && legacyEmail.includes('@')) {
        email = legacyEmail;
      } else {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    }

    // Obtener datos a actualizar
    const body = await request.json();
    const {
      nombre_abuelo,
      apellido_abuelo,
      fecha_nacimiento,
      ciudad,
      condominio,
      telefono,
    } = body;

    // Conectar a Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Actualizar usuario
    const updateData: any = {};
    if (nombre_abuelo) updateData.nombre_abuelo = nombre_abuelo;
    if (apellido_abuelo) updateData.apellido_abuelo = apellido_abuelo;
    if (fecha_nacimiento) updateData.fecha_nacimiento = fecha_nacimiento;
    if (ciudad) updateData.ciudad = ciudad;
    if (condominio) updateData.condominio = condominio;
    if (telefono) updateData.phone = telefono;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No data to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (error) {
      console.error('[UPDATE-PROFILE] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[UPDATE-PROFILE] ✅ Perfil actualizado:', email);

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        email: data.email,
        nombre_abuelo: data.nombre_abuelo,
        apellido_abuelo: data.apellido_abuelo,
        fecha_nacimiento: data.fecha_nacimiento,
        ciudad: data.ciudad,
        condominio: data.condominio,
        phone: data.phone,
      },
    });
  } catch (error: any) {
    console.error('[UPDATE-PROFILE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
