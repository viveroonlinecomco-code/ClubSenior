import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/facilitador/auth/register
 * Genera token para facilitador después de verificar OTP
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[FAC-REGISTER] Processing login for:', email);

    // 1. Verificar que OTP fue verificado en los últimos 30 minutos
    const otpResponse = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&verified=eq.true&tipo=eq.FACILITADOR&order=verified_at.desc&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const otpRecords = await otpResponse.json();

    if (!Array.isArray(otpRecords) || otpRecords.length === 0) {
      console.warn('[FAC-REGISTER] OTP not verified');
      return NextResponse.json(
        { error: 'OTP no fue verificado' },
        { status: 401 }
      );
    }

    const otpRecord = otpRecords[0];
    const verifiedAt = new Date(otpRecord.verified_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - verifiedAt.getTime()) / (1000 * 60);

    if (diffMinutes > 30) {
      console.warn('[FAC-REGISTER] OTP verification expired');
      return NextResponse.json(
        { error: 'Sesión expirada, verifica tu email nuevamente' },
        { status: 401 }
      );
    }

    // 2. Obtener facilitador
    const facResponse = await fetch(
      `${supabaseUrl}/rest/v1/facilitadores?email=eq.${encodeURIComponent(email)}&select=id,nombre,condominio_id,rol,estado`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const facilitadores = await facResponse.json();

    if (!Array.isArray(facilitadores) || facilitadores.length === 0) {
      console.warn('[FAC-REGISTER] Facilitador not found');
      return NextResponse.json(
        { error: 'Facilitador no encontrado' },
        { status: 404 }
      );
    }

    const facilitador = facilitadores[0];

    if (facilitador.estado !== 'ACTIVO') {
      console.warn('[FAC-REGISTER] Facilitador not active');
      return NextResponse.json(
        { error: 'Facilitador inactivo o suspendido' },
        { status: 403 }
      );
    }

    // 3. Generar token (base64 encoding de email + role)
    const tokenData = `${email}|FACILITADOR|${facilitador.rol}|${facilitador.condominio_id}`;
    const token = Buffer.from(tokenData).toString('base64');

    // 4. Registrar en audit log
    try {
      await fetch(`${supabaseUrl}/rest/v1/audit_log`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: facilitador.id,
          usuario_email: email,
          usuario_tipo: 'FACILITADOR',
          accion: 'LOGIN',
          tabla_afectada: 'facilitadores',
          registro_id: facilitador.id,
          resultado: 'EXITOSO',
          detalles: `Facilitador ${facilitador.nombre} inició sesión`,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent'),
        }),
      });
    } catch (auditError) {
      console.error('[FAC-REGISTER] Audit log error:', auditError);
      // No fallar si el audit log falla
    }

    console.log('[FAC-REGISTER] ✅ Token generated for:', email);

    return NextResponse.json({
      success: true,
      token,
      email,
      nombre: facilitador.nombre,
      rol: facilitador.rol,
      condominio_id: facilitador.condominio_id,
      message: 'Login exitoso',
    });

  } catch (error: any) {
    console.error('[FAC-REGISTER] Error:', error.message);

    // Registrar error en audit log
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      await fetch(`${supabaseUrl}/rest/v1/audit_log`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_email: request.body?.email || 'unknown',
          usuario_tipo: 'FACILITADOR',
          accion: 'LOGIN',
          resultado: 'ERROR',
          detalles: error.message,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent'),
        }),
      });
    } catch (_) {
      // Silently fail audit logging
    }

    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
