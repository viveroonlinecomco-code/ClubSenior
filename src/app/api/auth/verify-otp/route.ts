import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/middleware/csrf';
import { checkRateLimit } from '@/lib/middleware';
import { z } from 'zod';

/**
 * Verify OTP code
 * NOTE: We don't create Auth user here - just verify OTP
 * Profile creation happens after in create-profile endpoint
 */
async function verifyOTPInDatabase(email: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured');
    }

    console.log(`[OTP] Verifying code for email: ${email}`);

    // Get OTP record - buscar SIN filtrar por verified (recién creado no tiene verificación)
    const response = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&code=eq.${code}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const data = await response.json();
    console.log(`[OTP] Query result:`, data);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[OTP] Code not found for email: ${email}`);
      return { valid: false, message: 'Código inválido o expirado' };
    }

    const otpRecord = data[0];

    // Check if expired
    const expiresAt = new Date(otpRecord.expires_at);
    if (new Date() > expiresAt) {
      console.warn(`[OTP] Code expired for email: ${email}`);
      return { valid: false, message: 'Código expirado' };
    }

    console.log(`[OTP] Code valid, marking as verified for: ${email}`);

    // Mark as verified
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?id=eq.${otpRecord.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          verified: true,
          verified_at: new Date().toISOString(),
        }),
      }
    );

    if (!updateResponse.ok) {
      console.error(`[OTP] Failed to update OTP status:`, updateResponse.status);
      throw new Error('Failed to mark OTP as verified');
    }

    console.log(`[OTP] Successfully verified OTP for: ${email}`);
    return { valid: true, message: 'Código verificado correctamente', email };
  } catch (error) {
    console.error('[OTP] Error verifying OTP:', error);
    throw error;
  }
}

// ✅ FIX #5: Validación de payload con Zod
const VerifyOTPSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().min(6, 'Código debe tener 6 dígitos'),
})

/**
 * POST /api/auth/verify-otp
 * Verify OTP code - does NOT create Auth user
 * 
 * IMPORTANT: This only verifies the OTP.
 * User creation in Auth happens in create-profile endpoint.
 * ✅ FIX #5: Con rate limiting por IP (brute force protection)
 */
export async function POST(request: NextRequest) {
  const context = '[POST /api/auth/verify-otp]'
  
  try {
    // ✅ FIX #5: RATE LIMITING por IP (previene brute force)
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `otp:verify:${ipAddress}`
    const { allowed, remaining } = checkRateLimit(rateLimitKey)

    if (!allowed) {
      console.warn(`${context} Rate limit exceeded for IP: ${ipAddress}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Demasiados intentos de verificación. Por favor, intenta de nuevo más tarde.',
          retryAfter: 60,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    console.log(`${context} IP: ${ipAddress}, Remaining attempts: ${remaining}`)

    // CSRF Protection: Validate request origin
    const csrfError = await validateCSRFToken(request);
    if (csrfError) {
      return csrfError;
    }

    const body = await request.json();

    // ✅ FIX #5: Validar con Zod
    let validatedData
    try {
      validatedData = VerifyOTPSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Email y código requeridos',
            errors: error.issues 
          },
          { status: 400 }
        )
      }
      throw error
    }

    const { email, code } = validatedData

    console.log(`${context} Request received - email: ${email}, code: ${code?.substring(0, 3)}***`);

    // Verify OTP
    const result = await verifyOTPInDatabase(email, code);

    if (!result.valid) {
      console.warn(`[VERIFY-OTP] Verification failed: ${result.message}`);
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    console.log(`[VERIFY-OTP] Success - email: ${email}`);
    return NextResponse.json({
      success: true,
      message: result.message,
      email: result.email,
      // ✅ NUEVO: Retornar token después de verificar OTP
      token: Buffer.from(email.toLowerCase()).toString('base64'),
    });
  } catch (error: any) {
    console.error('[VERIFY-OTP] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error verifying OTP',
      },
      { status: 500 }
    );
  }
}
