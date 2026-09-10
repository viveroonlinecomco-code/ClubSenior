import { NextRequest, NextResponse } from 'next/server';

/**
 * NUCLEAR: Direct SQL, no functions, just INSERT
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombreAbuelo, apellidoAbuelo, telefono, fechaNacimiento, ciudad } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[REGISTER] Config missing');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    console.log('[REGISTER] Start:', email);

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

    // Generate ID
    const userId = crypto.randomUUID();

    // Insert to participantes table (already exists in Supabase)
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
          id: userId,
          email: email.toLowerCase(),
          phone: telefono || '',
          full_name: `${nombreAbuelo} ${apellidoAbuelo}`,
          fecha_nacimiento: fechaNacimiento,
          ciudad: ciudad,
          rol: 'participante',
        }),
      }
    );

    const insertStatus = insertResponse.status;
    const insertText = await insertResponse.text();

    if (!insertResponse.ok) {
      console.error('[REGISTER] Insert error:', insertStatus, insertText);
      return NextResponse.json({ error: `Insert failed: ${insertText.substring(0, 200)}` }, { status: insertStatus });
    }

    console.log('[REGISTER] ✅ Success');
    return NextResponse.json({ success: true, userId, email, message: 'Welcome!' });

  } catch (error: any) {
    console.error('[REGISTER] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
