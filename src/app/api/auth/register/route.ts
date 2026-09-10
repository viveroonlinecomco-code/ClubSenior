import { NextRequest, NextResponse } from 'next/server';

/**
 * ULTRA-MINIMAL: Only save what we know exists
 * email, phone, full_name
 * Let Supabase auto-generate id
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

    console.log('[REGISTER] Start for:', email);

    // Check OTP
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

    // Insert ONLY what we know exists: email, phone, full_name
    console.log('[REGISTER] Inserting to participantes...');
    
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/participantes`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          phone: telefono || '',
          full_name: `${nombreAbuelo} ${apellidoAbuelo}`,
        }),
      }
    );

    const insertStatus = insertResponse.status;
    const insertText = await insertResponse.text();

    console.log('[REGISTER] Insert response:', insertStatus);

    if (!insertResponse.ok) {
      console.error('[REGISTER] Insert error:', insertText);
      return NextResponse.json(
        { error: `Insert failed: ${insertText.substring(0, 150)}` },
        { status: insertStatus }
      );
    }

    console.log('[REGISTER] ✅ SUCCESS');
    return NextResponse.json({ success: true, email, message: 'Welcome!' });

  } catch (error: any) {
    console.error('[REGISTER] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
