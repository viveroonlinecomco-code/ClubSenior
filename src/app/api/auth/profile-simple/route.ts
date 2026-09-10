import { NextRequest, NextResponse } from 'next/server';

/**
 * ULTRA-SIMPLE: Verify OTP → Save profile
 */
export async function POST(request: NextRequest) {
  try {
    const { email, nombreAbuelo, apellidoAbuelo, telefono, fechaNacimiento, ciudad } = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 });
    }

    // Check OTP verified
    const otpCheck = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&verified=eq.true&order=verified_at.desc&limit=1`,
      {
        method: 'GET',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
      }
    );

    const otpData = await otpCheck.json();
    if (!Array.isArray(otpData) || otpData.length === 0) {
      return NextResponse.json({ error: 'OTP not verified' }, { status: 403 });
    }

    // Generate UUID
    const userId = crypto.randomUUID();

    // Save to profiles
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        id: userId,
        email: email.toLowerCase(),
        nombre_completo: `${nombreAbuelo} ${apellidoAbuelo}`,
        telefono: telefono || '',
        fecha_nacimiento: fechaNacimiento,
        ciudad: ciudad,
        rol: 'participante',
        created_at: new Date().toISOString(),
      }),
    });

    if (!insertResponse.ok) {
      const error = await insertResponse.text();
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    console.log('✅ Profile created:', userId);

    return NextResponse.json({
      success: true,
      userId,
      message: 'Welcome!',
    });

  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
