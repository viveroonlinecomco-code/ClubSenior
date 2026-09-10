import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify OTP code and create user in Supabase Auth
 */
async function verifyOTPInDatabase(email: string, code: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured');
    }

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

    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, message: 'Código inválido o expirado' };
    }

    const otpRecord = data[0];

    // Check if expired
    const expiresAt = new Date(otpRecord.expires_at);
    if (new Date() > expiresAt) {
      return { valid: false, message: 'Código expirado' };
    }

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
      throw new Error('Failed to mark OTP as verified');
    }

    // Create user in Supabase Auth (without password - OTP only)
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          verified_at: new Date().toISOString(),
        },
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      // If user already exists, that's fine - continue
      if (errorData.code !== 'user_already_exists') {
        throw new Error(`Failed to create auth user: ${errorData.message}`);
      }
    }

    return { valid: true, message: 'Código verificado correctamente', email };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
}

/**
 * POST /api/auth/verify-otp
 * Verify OTP code and create user in Auth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code required' },
        { status: 400 }
      );
    }

    // Verify OTP and create user
    const result = await verifyOTPInDatabase(email, code);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      email: result.email,
    });
  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error verifying OTP',
      },
      { status: 500 }
    );
  }
}
