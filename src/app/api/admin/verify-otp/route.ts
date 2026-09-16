import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/middleware/csrf';
import { checkRateLimit } from '@/lib/middleware';
import { z } from 'zod';
import { SignJWT } from 'jose';

/**
 * Verify OTP code for admin
 */
async function verifyOTPInDatabase(email: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured');
    }

    console.log(`[ADMIN OTP] Verifying code for email: ${email}`);

    // Get OTP record
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
    console.log(`[ADMIN OTP] Query result:`, data);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[ADMIN OTP] Code not found for email: ${email}`);
      return { valid: false, message: 'Código inválido o expirado' };
    }

    const otpRecord = data[0];

    // Check if expired
    const expiresAt = new Date(otpRecord.expires_at);
    if (new Date() > expiresAt) {
      console.warn(`[ADMIN OTP] Code expired for email: ${email}`);
      return { valid: false, message: 'Código expirado' };
    }

    console.log(`[ADMIN OTP] Code valid, marking as verified for: ${email}`);

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
      console.error(`[ADMIN OTP] Failed to update OTP status:`, updateResponse.status);
      throw new Error('Failed to mark OTP as verified');
    }

    console.log(`[ADMIN OTP] Successfully verified OTP for: ${email}`);
    return { valid: true, message: 'Código verificado correctamente', email };
  } catch (error) {
    console.error('[ADMIN OTP] Error verifying OTP:', error);
    throw error;
  }
}

/**
 * Generate JWT token for admin
 */
async function generateAdminJWT(email: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  );

  const token = await new SignJWT({
    email,
    admin: true,
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);

  return token;
}

const VerifyOTPSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().min(6, 'Código debe tener 6 dígitos'),
});

/**
 * POST /api/admin/verify-otp
 * Verify OTP code and return JWT token
 */
export async function POST(request: NextRequest) {
  const context = '[POST /api/admin/verify-otp]';

  try {
    // Rate limiting por IP (brute force protection)
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `admin:otp:verify:${ipAddress}`;
    const { allowed, remaining } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      console.warn(`${context} Rate limit exceeded for IP: ${ipAddress}`);
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
          },
        }
      );
    }

    console.log(`${context} IP: ${ipAddress}, Remaining attempts: ${remaining}`);

    // CSRF Protection
    const csrfError = await validateCSRFToken(request);
    if (csrfError) {
      return csrfError;
    }

    const body = await request.json();

    // Validar con Zod
    let validatedData;
    try {
      validatedData = VerifyOTPSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email y código requeridos',
            errors: error.issues,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const { email, code } = validatedData;
    const emailLower = email.toLowerCase();

    console.log(`${context} Request received - email: ${emailLower}, code: ${code?.substring(0, 3)}***`);

    // ✅ Validación: Verificar que el email tiene rol admin en user_roles
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase not configured');
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/user_roles?email=eq.${encodeURIComponent(emailLower)}&select=*,roles(name)`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseKey || '',
            'Authorization': `Bearer ${supabaseKey || ''}`,
          } as HeadersInit,
        }
      );

      const userRoles = await response.json();
      console.log(`${context} User roles query:`, userRoles);

      if (!Array.isArray(userRoles) || userRoles.length === 0) {
        console.warn(`${context} No admin roles found for email: ${emailLower}`);
        return NextResponse.json(
          { error: 'No tienes acceso admin' },
          { status: 403 }
        );
      }

      // Verificar que tiene al menos un rol 'admin'
      const hasAdminRole = userRoles.some((ur: any) => ur.roles?.name === 'admin');
      if (!hasAdminRole) {
        console.warn(`${context} User ${emailLower} no tiene rol admin`);
        return NextResponse.json(
          { error: 'No tienes acceso admin' },
          { status: 403 }
        );
      }

      console.log(`${context} ✅ User ${emailLower} tiene acceso admin`);
    } catch (error) {
      console.error(`${context} Error checking admin roles:`, error);
      return NextResponse.json(
        { error: 'Error verificando permisos' },
        { status: 500 }
      );
    }

    // Verify OTP
    const result = await verifyOTPInDatabase(emailLower, code);

    if (!result.valid) {
      console.warn(`${context} Verification failed: ${result.message}`);
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Generate JWT
    const token = await generateAdminJWT(emailLower);
    console.log(`${context} ✅ JWT generated for ${emailLower}`);

    // Create response with token in cookie + body
    const response = NextResponse.json({
      success: true,
      message: result.message,
      email: result.email,
      token,
    });

    // Set secure HTTP-only cookie (for middleware validation)
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/admin',
    });

    return response;
  } catch (error: any) {
    console.error(`${context} Error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error verifying OTP',
      },
      { status: 500 }
    );
  }
}
