import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * POST /api/inscribir/sync-profile
 * 
 * Sincroniza datos de inscripción (localStorage) a Supabase
 * Usad cuando el usuario completa pasos en /inscribir pero aún no verifica OTP
 * O para actualizar datos existentes del usuario
 * 
 * IMPORTANTE: Evita duplicación - usa SIEMPRE tabla 'usuarios'
 * No hay tabla separada para contacto familiar
 */
export async function POST(request: NextRequest) {
  try {
    // Autenticar con token (puede ser simple email en base64 si no tiene JWT aún)
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
      // Fallback: Token es email en base64
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

    // Obtener datos a sincronizar
    const body = await request.json();
    const {
      nombreAbuelo,
      nombre_abuelo,
      apellidoAbuelo,
      apellido_abuelo,
      telefono,
      phone,
      fechaNacimiento,
      fecha_nacimiento,
      ciudad,
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
    } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Normalizar datos (soportar ambos formatos)
    const updateData: any = {};

    if (nombreAbuelo !== undefined || nombre_abuelo !== undefined) 
      updateData.nombre_abuelo = nombreAbuelo || nombre_abuelo;

    if (apellidoAbuelo !== undefined || apellido_abuelo !== undefined) 
      updateData.apellido_abuelo = apellidoAbuelo || apellido_abuelo;

    if (telefono !== undefined || phone !== undefined) 
      updateData.phone = telefono || phone;

    if (fechaNacimiento !== undefined || fecha_nacimiento !== undefined) 
      updateData.fecha_nacimiento = fechaNacimiento || fecha_nacimiento;

    if (ciudad !== undefined) 
      updateData.ciudad = ciudad;

    if (eps !== undefined) 
      updateData.eps = eps;

    if (emergenciaNombre !== undefined || emergencia_nombre !== undefined) 
      updateData.emergencia_nombre = emergenciaNombre || emergencia_nombre;

    if (emergenciaTelefono !== undefined || emergencia_telefono !== undefined) 
      updateData.emergencia_telefono = emergenciaTelefono || emergencia_telefono;

    // IMPORTANTE: Contacto Familiar está en TABLA USUARIOS, no tabla separada
    if (familiarNombre !== undefined || familiar_nombre !== undefined) 
      updateData.familiar_nombre = familiarNombre || familiar_nombre;

    if (familiarRelacion !== undefined || familiar_relacion !== undefined) 
      updateData.familiar_relacion = familiarRelacion || familiar_relacion;

    if (familiarTelefono !== undefined || familiar_telefono !== undefined) 
      updateData.familiar_telefono = familiarTelefono || familiar_telefono;

    // Marcar como sincronizado
    updateData.updated_at = new Date().toISOString();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No data to sync' },
        { status: 400 }
      );
    }

    console.log('[SYNC-PROFILE] Sincronizando para:', email.toLowerCase());
    console.log('[SYNC-PROFILE] Datos:', JSON.stringify(updateData));

    // Intentar UPDATE primero (usuario ya existe)
    const { data: updateResult, error: updateError } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('email', email.toLowerCase())
      .select()
      .single();

    if (updateError && updateError.code !== 'PGRST116') {
      // Error que no sea "no rows found"
      console.error('[SYNC-PROFILE] Update error:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    if (updateResult) {
      console.log('[SYNC-PROFILE] ✅ Perfil sincronizado (UPDATE)');
      return NextResponse.json({
        success: true,
        message: 'Profile synced successfully',
        user: updateResult,
      });
    }

    // Si no existe, insertar nuevo (RARO, pero posible)
    console.log('[SYNC-PROFILE] Usuario no existe, insertando...');
    const { data: insertResult, error: insertError } = await supabase
      .from('usuarios')
      .insert([{
        email: email.toLowerCase(),
        ...updateData,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('[SYNC-PROFILE] Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('[SYNC-PROFILE] ✅ Perfil sincronizado (INSERT)');
    return NextResponse.json({
      success: true,
      message: 'Profile created and synced',
      user: insertResult,
    });

  } catch (error: any) {
    console.error('[SYNC-PROFILE] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
