import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Inicializar cliente Supabase con service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Función para enviar OTP via Resend
async function enviarOTPResend(email: string, codigoOTP: string) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'noreply@clubsenior.com.co',
        to: email,
        subject: 'Tu código de verificación ClubSenior',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h1>ClubSenior</h1>
            <h2>Tu código de verificación</h2>
            <p>Usa este código para confirmar tu email:</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px;">
              <h3 style="font-size: 32px; letter-spacing: 5px; color: #1f2937;">${codigoOTP}</h3>
            </div>
            <p style="color: #666; font-size: 14px;">Este código expira en 30 minutos.</p>
            <p style="color: #999; font-size: 12px;">Si no solicitaste este código, ignora este email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Error enviando OTP con Resend:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error enviando OTP:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parsear datos del request
    const body = await req.json();

    // Validar que los datos requeridos existan
    const requiredFields = [
      'nombre',
      'apellido',
      'email',
      'telefono',
      'documentoId',
      'ciudad',
      'eps',
      'familiarNombre',
      'familiarEmail',
      'familiarTelefono',
      'familiarRelacion',
      'planSeleccionado',
      'firma',
      'password',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Campo requerido faltante: ${field}` },
          { status: 400 }
        );
      }
    }

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Confirmar email automáticamente
    });

    if (authError || !authData.user) {
      console.error('Error creando usuario Auth:', authError);
      return NextResponse.json(
        { message: `Error al crear usuario: ${authError?.message || 'Error desconocido'}` },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    console.log('Usuario creado en Auth:', userId);

    // 2. Insertar en tabla `usuarios`
    const { error: usuariosError } = await supabaseAdmin.from('usuarios').insert({
      id: userId,
      nombre: body.nombre,
      apellido: body.apellido,
      email: body.email,
      telefono: body.telefono,
      fecha_nacimiento: body.fechaNacimiento,
      documento_id: body.documentoId,
      ciudad: body.ciudad,
      eps: body.eps,
      numero_afiliado_eps: body.numeroAfiliadoEps || null,
      estado: 'activo',
      created_at: new Date().toISOString(),
    });

    if (usuariosError) {
      console.error('Error insertando en usuarios:', usuariosError);
      // No fallar aquí, intentar continuar
    }

    // 3. Insertar en tabla `family_relationships`
    const { error: familiaError } = await supabaseAdmin.from('family_relationships').insert({
      id: uuidv4(),
      usuario_id: userId,
      familiar_nombre: body.familiarNombre,
      familiar_email: body.familiarEmail,
      familiar_telefono: body.familiarTelefono,
      relacion: body.familiarRelacion,
      estado: 'activo',
      created_at: new Date().toISOString(),
    });

    if (familiaError) {
      console.error('Error insertando family_relationships:', familiaError);
    }

    // 4. Insertar en tabla `suscripciones`
    const { error: suscripcionesError } = await supabaseAdmin.from('suscripciones').insert({
      id: uuidv4(),
      usuario_id: userId,
      plan_id: body.planSeleccionado === 'individual' ? 1 : 2, // Ajustar según tus IDs
      estado: 'activa',
      valor_mensual: body.planSeleccionado === 'individual' ? 160000 : 450000,
      fecha_inicio: new Date().toISOString(),
      fecha_proximo_pago: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });

    if (suscripcionesError) {
      console.error('Error insertando suscripciones:', suscripcionesError);
    }

    // 5. Insertar en tabla `contratos`
    const { error: contratosError } = await supabaseAdmin.from('contratos').insert({
      id: uuidv4(),
      usuario_id: userId,
      tipo_contrato: body.planSeleccionado === 'individual' ? 'individual' : 'condominio',
      estado: 'firmado',
      fecha_firma: new Date().toISOString(),
      ip_address: req.ip || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      created_at: new Date().toISOString(),
    });

    if (contratosError) {
      console.error('Error insertando contratos:', contratosError);
    }

    // 6. Insertar en tabla `firmas`
    const { error: firmasError } = await supabaseAdmin.from('firmas').insert({
      id: uuidv4(),
      usuario_id: userId,
      firma_digital: body.firma, // base64 PNG
      tipo_firma: 'inscripcion',
      fecha_firma: new Date().toISOString(),
      ip_address: req.ip || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      created_at: new Date().toISOString(),
    });

    if (firmasError) {
      console.error('Error insertando firmas:', firmasError);
    }

    // 7. Generar y guardar OTP
    const codigoOTP = Math.random().toString().slice(2, 8); // 6 dígitos
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    const { error: otpError } = await supabaseAdmin.from('otp_codes').insert({
      id: uuidv4(),
      usuario_id: userId,
      email: body.email,
      codigo: codigoOTP,
      expires_at: expiresAt.toISOString(),
      intentos: 0,
      used: false,
      created_at: new Date().toISOString(),
    });

    if (otpError) {
      console.error('Error insertando OTP:', otpError);
    }

    // 8. Enviar OTP por email
    const otpEnviado = await enviarOTPResend(body.email, codigoOTP);

    if (!otpEnviado) {
      console.warn('No se pudo enviar OTP por email, pero usuario fue creado');
    }

    // 9. Retornar éxito
    return NextResponse.json(
      {
        message: 'Usuario creado exitosamente',
        userId: userId,
        email: body.email,
        otpEnviado: otpEnviado,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en POST /api/auth/registrar:', error);
    return NextResponse.json(
      { message: `Error del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
