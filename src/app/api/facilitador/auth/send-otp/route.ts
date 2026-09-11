import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/facilitador/auth/send-otp
 * Envía código OTP a email de facilitador
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseKey || !resendKey) {
      console.error('[FAC-OTP] Missing configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[FAC-OTP] Processing login for:', email);

    // 1. Verificar que el facilitador existe
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/facilitadores?email=eq.${encodeURIComponent(email)}&select=id,nombre,condominio_id,estado`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const facilitadores = await checkResponse.json();
    if (!Array.isArray(facilitadores) || facilitadores.length === 0) {
      console.warn('[FAC-OTP] Facilitador no encontrado:', email);
      return NextResponse.json(
        { error: 'Facilitador no encontrado' },
        { status: 404 }
      );
    }

    const facilitador = facilitadores[0];

    if (facilitador.estado !== 'ACTIVO') {
      console.warn('[FAC-OTP] Facilitador inactivo:', email);
      return NextResponse.json(
        { error: 'Facilitador inactivo o suspendido' },
        { status: 403 }
      );
    }

    // 2. Generar código OTP de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutos

    console.log('[FAC-OTP] Generated code:', code);

    // 3. Guardar OTP en BD
    const otpData = {
      email,
      code,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      verified: false,
      tipo: 'FACILITADOR',
    };

    const createOtpResponse = await fetch(`${supabaseUrl}/rest/v1/otp_codes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otpData),
    });

    if (!createOtpResponse.ok) {
      const error = await createOtpResponse.text();
      console.error('[FAC-OTP] Failed to create OTP record:', error);
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    }

    console.log('[FAC-OTP] OTP record created');

    // 4. Enviar email con OTP
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ClubSenior <noreply@resend.dev>',
        to: email,
        subject: '🔐 Tu código de acceso - ClubSenior Facilitador',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">🔐 Acceso Facilitador</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">ClubSenior - Tardes de Café</p>
            </div>
            
            <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
                Hola ${facilitador.nombre},
              </p>

              <p style="font-size: 16px; color: #374151; margin: 0 0 30px 0;">
                Tu código de acceso es:
              </p>

              <div style="background: #f3f4f6; border: 2px dashed #d1d5db; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <p style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #9333ea; margin: 0;">
                  ${code}
                </p>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin: 30px 0 0 0;">
                Este código expira en <strong>10 minutos</strong>.
              </p>

              <p style="font-size: 14px; color: #6b7280; margin: 10px 0;">
                Si no solicitaste este código, puedes ignorar este email.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
                ClubSenior - Panel Facilitador<br>
                Conectando generaciones, creando comunidad
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('[FAC-OTP] Email failed:', emailError);
      // No fallar, el OTP se guardó correctamente
    } else {
      console.log('[FAC-OTP] ✅ Email sent to:', email);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP enviado a tu email',
      email,
      // Solo en development mostrar el código
      ...(process.env.NODE_ENV === 'development' && { code }),
    });

  } catch (error: any) {
    console.error('[FAC-OTP] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
