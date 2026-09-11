import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitStatus } from '@/lib/middleware/rate-limit';

/**
 * POST /api/facilitador/auth/verify-otp
 * Verifica código OTP de facilitador
 * Rate limit: 5 intentos por 5 minutos (más agresivo que send-otp)
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }
    
    // 🔐 RATE LIMIT CHECK (5 intentos / 5 minutos - más estricto)
    const rateLimitKey = `otp:verify:${email.toLowerCase()}`;
    if (!checkRateLimit(rateLimitKey, 5, 300)) {
      const status = getRateLimitStatus(rateLimitKey, 5, 300);
      const retrySeconds = Math.ceil((status.resetTime.getTime() - Date.now()) / 1000);
      
      console.warn(`[FAC-VERIFY] Rate limit exceeded for ${email}`);
      return NextResponse.json(
        {
          error: 'Demasiados intentos de verificación. Intenta en unos minutos.',
          retryAfter: retrySeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retrySeconds.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': status.resetTime.toISOString(),
          },
        }
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

    console.log('[FAC-VERIFY] Verifying OTP for:', email);

    // 1. Obtener OTP record más reciente
    const getHeaders = new Headers({
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    });

    const otpResponse = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&tipo=eq.FACILITADOR&order=created_at.desc&limit=1`,
      {
        method: 'GET',
        headers: getHeaders,
      }
    );

    const otpRecords = await otpResponse.json();

    if (!Array.isArray(otpRecords) || otpRecords.length === 0) {
      console.warn('[FAC-VERIFY] No OTP record found');
      return NextResponse.json(
        { error: 'OTP no válido' },
        { status: 401 }
      );
    }

    const otpRecord = otpRecords[0];

    // 2. Verificar código
    if (otpRecord.code !== code) {
      console.warn('[FAC-VERIFY] Code mismatch');
      return NextResponse.json(
        { error: 'Código incorrecto' },
        { status: 401 }
      );
    }

    // 3. Verificar expiración (10 minutos)
    const expiresAt = new Date(otpRecord.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.warn('[FAC-VERIFY] Code expired');
      return NextResponse.json(
        { error: 'Código expirado' },
        { status: 401 }
      );
    }

    // 4. Verificar que no esté ya verificado
    if (otpRecord.verified) {
      console.warn('[FAC-VERIFY] Code already verified');
      return NextResponse.json(
        { error: 'Código ya fue usado' },
        { status: 401 }
      );
    }

    // 5. Marcar como verificado
    const updateHeaders = new Headers({
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    });

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?id=eq.${encodeURIComponent(otpRecord.id)}`,
      {
        method: 'PATCH',
        headers: updateHeaders,
        body: JSON.stringify({
          verified: true,
          verified_at: now.toISOString(),
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error('[FAC-VERIFY] Failed to mark OTP as verified');
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      );
    }

    console.log('[FAC-VERIFY] ✅ OTP verified for:', email);

    return NextResponse.json({
      success: true,
      message: 'OTP verificado correctamente',
      email,
    });

  } catch (error: any) {
    console.error('[FAC-VERIFY] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
