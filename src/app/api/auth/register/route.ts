import { NextRequest, NextResponse } from 'next/server';

/**
 * Register: Insert into usuarios table
 * usuarios has: id, email, phone, created_at, updated_at
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombreAbuelo, apellidoAbuelo, telefono } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[REGISTER] Config missing');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    console.log('[REGISTER] Starting for:', email);

    // Step 1: Verify OTP
    console.log('[REGISTER] Checking OTP...');
    const otpResponse = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&verified=eq.true`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const otpList = await otpResponse.json();
    if (!Array.isArray(otpList) || otpList.length === 0) {
      console.log('[REGISTER] OTP not verified');
      return NextResponse.json({ error: 'OTP not verified' }, { status: 403 });
    }

    console.log('[REGISTER] OTP verified ✅');

    // Step 2: Insert into usuarios table with ALL data
    console.log('[REGISTER] Inserting into usuarios...');
    
    const usuarioData = {
      email: email.toLowerCase(),
      phone: telefono || null,
      // ✅ NEW: Guardar TODOS los datos personales
      nombre_abuelo: body.nombreAbuelo || null,
      apellido_abuelo: body.apellidoAbuelo || null,
      fecha_nacimiento: body.fechaNacimiento || null,
      ciudad: body.ciudad || null,
      // ✅ NEW: EPS y contactos de emergencia
      eps: body.eps || null,
      emergencia_nombre: body.emergenciaNombre || null,
      emergencia_telefono: body.emergenciaTelefono || null,
      familiar_nombre: body.familiarNombre || null,
      familiar_relacion: body.familiarRelacion || null,
      familiar_telefono: body.familiarTelefono || null,
      // Términos y contratos
      terminos_aceptados: body.terminosAceptados === true,
      politica_privacidad_aceptada: body.politicaPrivacidadAceptada === true,
      contratos_sponsor_firmado: body.sponsorContractAceptado === true,
      contratos_participant_firmado: body.participantContractAceptado === true,
      suscripcion_plan: body.planSeleccionado || null,
      inscripcion_completada: false, // Se marca true después de pago
    };

    console.log('[REGISTER] Payload:', JSON.stringify(usuarioData));

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(usuarioData),
      }
    );

    const insertStatus = insertResponse.status;
    const insertText = await insertResponse.text();

    console.log('[REGISTER] Insert status:', insertStatus);

    if (!insertResponse.ok) {
      const errorJson = JSON.parse(insertText);
      
      // Si email ya existe, ok - usuario ya autenticado por OTP
      if (errorJson.code === '23505') {
        console.log('[REGISTER] User already exists - ok');
        // Devolver token con el email (usado para identificar usuario)
        return NextResponse.json({
          success: true,
          token: Buffer.from(email.toLowerCase()).toString('base64'), // simple token
          email,
          message: 'Welcome back!',
        });
      }

      console.error('[REGISTER] Insert failed');
      return NextResponse.json(
        { error: `Insert failed` },
        { status: insertStatus }
      );
    }

    console.log('[REGISTER] ✅ User registered');

    // Parse response to get created user
    const userData = JSON.parse(insertText);
    
    return NextResponse.json({
      success: true,
      token: Buffer.from(email.toLowerCase()).toString('base64'),
      email,
      userId: userData.id,  // ✅ NUEVO: Retornar user_id
      message: 'Account created successfully!',
    });

  } catch (error: any) {
    console.error('[REGISTER] Exception:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
