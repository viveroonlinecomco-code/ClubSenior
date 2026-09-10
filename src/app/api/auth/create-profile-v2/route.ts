import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile, getOrCreateDefaultCondominio, createParticipante } from '@/lib/supabase/database';

/**
 * Simple validation functions
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function isValidName(name: string): boolean {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
}

function isValidBirthDate(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const age = new Date().getFullYear() - date.getFullYear();
    return !isNaN(date.getTime()) && age >= 18 && age <= 120;
  } catch {
    return false;
  }
}

/**
 * Check OTP was verified
 */
async function wasOtpVerified(supabaseUrl: string, supabaseKey: string, email: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}&verified=eq.true&order=verified_at.desc&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) return false;
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return false;

    const verifiedAt = new Date(data[0].verified_at);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return verifiedAt >= thirtyMinutesAgo;
  } catch (error) {
    console.error('[OTP-CHECK] Error:', error);
    return false;
  }
}

/**
 * POST /api/auth/create-profile-v2
 * 
 * SIMPLIFIED: No Auth dependency, just save profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nombreAbuelo, apellidoAbuelo, telefono, fechaNacimiento, ciudad } = body;

    console.log('[PROFILE-V2] Creating profile');

    // Validate
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (!isValidName(nombreAbuelo) || !isValidName(apellidoAbuelo)) {
      return NextResponse.json({ error: 'Invalid names' }, { status: 400 });
    }
    if (!isValidBirthDate(fechaNacimiento)) {
      return NextResponse.json({ error: 'Invalid birth date' }, { status: 400 });
    }
    if (!ciudad || ciudad.trim().length < 2) {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 });
    }

    // Check OTP
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const otpOk = await wasOtpVerified(supabaseUrl, supabaseKey, email);
    if (!otpOk) {
      return NextResponse.json({ error: 'Please verify OTP first' }, { status: 403 });
    }

    // Generate UUID
    const userId = crypto.randomUUID();
    const cleanEmail = email.toLowerCase().trim();

    // Create profile
    const profileResult = await createUserProfile(
      userId,
      cleanEmail,
      `${nombreAbuelo.trim()} ${apellidoAbuelo.trim()}`,
      telefono?.trim() || ''
    );

    if (profileResult.error) {
      console.error('[PROFILE-V2] Profile error:', profileResult.error);
      return NextResponse.json(
        { error: `Profile error` },
        { status: 500 }
      );
    }

    // Get/create condominio
    const condominioResult = await getOrCreateDefaultCondominio(ciudad.trim());
    if (condominioResult.error) {
      console.error('[PROFILE-V2] Condominio error:', condominioResult.error);
      return NextResponse.json({ error: 'Condominio error' }, { status: 500 });
    }

    // Calculate age
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let edad = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      edad--;
    }

    // Create participante
    const participanteResult = await createParticipante(
      userId,
      condominioResult.data.id,
      nombreAbuelo.trim(),
      edad,
      'otro',
      true,
      `Registered: ${new Date().toLocaleDateString('es-CO')}`
    );

    if (participanteResult.error) {
      console.error('[PROFILE-V2] Participante error:', participanteResult.error);
      return NextResponse.json({ error: 'Participante error' }, { status: 500 });
    }

    console.log('[PROFILE-V2] ✅ Success');
    
    return NextResponse.json({
      success: true,
      userId,
      email: cleanEmail,
      message: 'Account created. Welcome!',
    });

  } catch (error: any) {
    console.error('[PROFILE-V2] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
