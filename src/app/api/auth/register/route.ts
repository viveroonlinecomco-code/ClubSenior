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

    // Step 2: Insert into usuarios table
    console.log('[REGISTER] Inserting into usuarios...');
    
    const usuarioData = {
      email: email.toLowerCase(),
      phone: telefono || null,
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
    console.log('[REGISTER] Insert response:', insertText);

    if (!insertResponse.ok) {
      console.error('[REGISTER] Insert failed');
      return NextResponse.json(
        { error: `Insert failed: ${insertText.substring(0, 200)}` },
        { status: insertStatus }
      );
    }

    console.log('[REGISTER] ✅ User registered successfully');

    return NextResponse.json({
      success: true,
      email,
      message: 'Account created successfully! Welcome to ClubSenior.',
    });

  } catch (error: any) {
    console.error('[REGISTER] Exception:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
