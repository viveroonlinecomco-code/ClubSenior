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
      nombreAbuelo,
      nombre_abuelo,
      apellidoAbuelo,
      apellido_abuelo,
      fecha_nacimiento,
      fechaNacimiento,
      ciudad,
      condominio,
      phone,
      telefono,
      eps,
      emergenciaNombre,
      emergencia_nombre,
      emergenciaTelefono,
      emergencia_telefono,
      familiarNombre,
      familiar_nombre,
      familiarRelacion,
      familiar_relacion,
      familiarTelefono,
      familiar_telefono,
      contratos_aceptados,
      contratosAceptados,
      terminos_aceptados,
      terminosAceptados,
      politica_privacidad_aceptada,
      politicaPrivacidadAceptada,
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

    // Construir objeto de actualización - Normalizar nombres
    const updateData: any = {};
    
    // Campos personales (soportar ambos formatos: camelCase y snake_case)
    if (nombreAbuelo !== undefined || nombre_abuelo !== undefined) 
      updateData.nombre_abuelo = nombreAbuelo || nombre_abuelo;
    
    if (apellidoAbuelo !== undefined || apellido_abuelo !== undefined) 
      updateData.apellido_abuelo = apellidoAbuelo || apellido_abuelo;
    
    if (fecha_nacimiento !== undefined || fechaNacimiento !== undefined) 
      updateData.fecha_nacimiento = fecha_nacimiento || fechaNacimiento;
    
    if (ciudad !== undefined) 
      updateData.ciudad = ciudad;
    
    if (condominio !== undefined) 
      updateData.condominio = condominio;
    
    if (phone !== undefined || telefono !== undefined) 
      updateData.phone = phone || telefono;
    
    // Salud
    if (eps !== undefined) 
      updateData.eps = eps;
    
    // Emergencia (soportar ambos formatos)
    if (emergenciaNombre !== undefined || emergencia_nombre !== undefined) 
      updateData.emergencia_nombre = emergenciaNombre || emergencia_nombre;
    
    if (emergenciaTelefono !== undefined || emergencia_telefono !== undefined) 
      updateData.emergencia_telefono = emergenciaTelefono || emergencia_telefono;
    
    // Familiar (soportar ambos formatos)
    if (familiarNombre !== undefined || familiar_nombre !== undefined) 
      updateData.familiar_nombre = familiarNombre || familiar_nombre;
    
    if (familiarRelacion !== undefined || familiar_relacion !== undefined) 
      updateData.familiar_relacion = familiarRelacion || familiar_relacion;
    
    if (familiarTelefono !== undefined || familiar_telefono !== undefined) 
      updateData.familiar_telefono = familiarTelefono || familiar_telefono;
    
    // Aceptaciones legales
    if (contratos_aceptados !== undefined || contratosAceptados !== undefined) 
      updateData.contratos_aceptados = contratos_aceptados !== undefined ? contratos_aceptados : contratosAceptados;
    
    if (terminos_aceptados !== undefined || terminosAceptados !== undefined) 
      updateData.terminos_aceptados = terminos_aceptados !== undefined ? terminos_aceptados : terminosAceptados;
    
    if (politica_privacidad_aceptada !== undefined || politicaPrivacidadAceptada !== undefined) 
      updateData.politica_privacidad_aceptada = politica_privacidad_aceptada !== undefined ? politica_privacidad_aceptada : politicaPrivacidadAceptada;
    
    // Marcar actualización siempre
    updateData.updated_at = new Date().toISOString();

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
