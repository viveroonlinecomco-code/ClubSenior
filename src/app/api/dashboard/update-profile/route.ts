import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * POST /api/dashboard/update-profile
 * Actualiza información completa del perfil del usuario
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
      phone,
      eps,
      emergencia_nombre,
      emergencia_telefono,
      familiar_nombre,
      familiar_relacion,
      familiar_telefono,
      contratos_aceptados,
      terminos_aceptados,
      politica_privacidad_aceptada,
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

    // Construir objeto de actualización con todos los campos
    const updateData: any = {};
    
    if (nombre_abuelo !== undefined) updateData.nombre_abuelo = nombre_abuelo;
    if (apellido_abuelo !== undefined) updateData.apellido_abuelo = apellido_abuelo;
    if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento;
    if (ciudad !== undefined) updateData.ciudad = ciudad;
    if (condominio !== undefined) updateData.condominio = condominio;
    if (phone !== undefined) updateData.phone = phone;
    if (eps !== undefined) updateData.eps = eps;
    if (emergencia_nombre !== undefined) updateData.emergencia_nombre = emergencia_nombre;
    if (emergencia_telefono !== undefined) updateData.emergencia_telefono = emergencia_telefono;
    if (familiar_nombre !== undefined) updateData.familiar_nombre = familiar_nombre;
    if (familiar_relacion !== undefined) updateData.familiar_relacion = familiar_relacion;
    if (familiar_telefono !== undefined) updateData.familiar_telefono = familiar_telefono;
    if (contratos_aceptados !== undefined) updateData.contratos_aceptados = contratos_aceptados;
    if (terminos_aceptados !== undefined) updateData.terminos_aceptados = terminos_aceptados;
    if (politica_privacidad_aceptada !== undefined) updateData.politica_privacidad_aceptada = politica_privacidad_aceptada;
    if (updateData.phone) updateData.updated_at = new Date().toISOString(); // Marcar como actualizado

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
      user: data,
    });
  } catch (error: any) {
    console.error('[UPDATE-PROFILE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
