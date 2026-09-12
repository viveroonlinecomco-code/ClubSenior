import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/middleware/csrf';

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

    // Get OTP record
    const response = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&code=eq.${code}&verified=eq.false`,
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

/**
 * POST /api/auth/verify-otp
 * Verify OTP code - does NOT create Auth user
 * 
 * IMPORTANT: This only verifies the OTP.
 * User creation in Auth happens in create-profile endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF Protection: Validate request origin
    const csrfError = await validateCSRFToken(request);
    if (csrfError) {
      return csrfError;
    }

    const body = await request.json();
    const { email, code } = body;

    console.log(`[VERIFY-OTP] Request received - email: ${email}, code: ${code?.substring(0, 3)}***`);

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code required' },
        { status: 400 }
      );
    }

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
      // Don't return auth token - user creation happens in create-profile
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
