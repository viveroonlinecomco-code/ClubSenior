import { NextRequest, NextResponse } from 'next/server';

/**
 * Validar email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validar que nombre/apellido no estén vacíos y sean seguros
 */
function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  if (name.trim().length < 2 || name.trim().length > 100) return false;
  // Solo permitir letras, números, espacios, guiones
  return /^[a-záéíóúñ0-9\s\-']+$/i.test(name);
}

/**
 * Validar teléfono (opcional)
 */
function isValidPhone(phone: string | undefined): boolean {
  if (!phone) return true; // Opcional
  if (typeof phone !== 'string') return false;
  // Solo números, +, -, espacios
  return /^[\d\+\-\s]{6,20}$/.test(phone);
}

/**
 * Validar fecha de nacimiento
 */
function isValidBirthDate(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    
    // Verificar que sea una fecha válida
    if (isNaN(date.getTime())) return false;
    // Persona debe tener al menos 18 años
    if (age < 18) return false;
    // Persona no puede ser más vieja que 120 años
    if (age > 120) return false;
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Validar ciudad (no puede estar vacía)
 */
function isValidCity(city: string): boolean {
  if (!city || typeof city !== 'string') return false;
  if (city.trim().length < 2 || city.trim().length > 100) return false;
  return /^[a-záéíóúñ0-9\s\-']+$/i.test(city);
}

/**
 * Verificar que el OTP fue verificado antes de permitir create-profile
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
    
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    const verifiedRecord = data[0];
    const verifiedAt = new Date(verifiedRecord.verified_at);
    const now = new Date();
    
    // OTP debe haber sido verificado en últimos 30 minutos
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    return verifiedAt >= thirtyMinutesAgo;
  } catch (error) {
    console.error('[SECURITY] Error checking OTP verification:', error);
    return false;
  }
}

/**
 * Import database functions
 */
import { createUserProfile, getOrCreateDefaultCondominio, createParticipante } from '@/lib/supabase/database';

/**
 * POST /api/auth/create-profile
 * 
 * ARCHITECTURE:
 * - Validates all inputs (email, names, phone, date, city)
 * - Verifies OTP was verified (30-minute window)
 * - Creates profile in database with local UUID
 * - Does NOT create Supabase Auth user (OTP verification IS the auth)
 * - Saves participante and assigns condominio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      email, 
      nombreAbuelo, 
      apellidoAbuelo, 
      telefono, 
      fechaNacimiento, 
      ciudad 
    } = body;

    console.log('[CREATE-PROFILE] Request received');

    // ✅ SECURITY: Validate all inputs
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!isValidName(nombreAbuelo)) {
      return NextResponse.json(
        { error: 'Invalid first name' },
        { status: 400 }
      );
    }

    if (!isValidName(apellidoAbuelo)) {
      return NextResponse.json(
        { error: 'Invalid last name' },
        { status: 400 }
      );
    }

    if (!isValidPhone(telefono)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    if (!isValidBirthDate(fechaNacimiento)) {
      return NextResponse.json(
        { error: 'Invalid birth date. Must be 18+ years old' },
        { status: 400 }
      );
    }

    if (!isValidCity(ciudad)) {
      return NextResponse.json(
        { error: 'Invalid city' },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Verify OTP was actually verified
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[SECURITY] Supabase config missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const otpVerified = await wasOtpVerified(supabaseUrl, supabaseKey, email);
    
    if (!otpVerified) {
      console.warn('[SECURITY] OTP not verified for email registration attempt');
      return NextResponse.json(
        { error: 'Email verification required. Please verify your OTP first.' },
        { status: 403 }
      );
    }

    console.log('[CREATE-PROFILE] OTP verified, proceeding with profile creation');

    // ✅ Generate a UUID for the user (local ID, not from Auth)
    // OTP verification IS the authentication mechanism
    const userId = crypto.randomUUID();
    const cleanEmail = email.toLowerCase().trim();

    // ✅ Create profile in database
    const profileResult = await createUserProfile(
      userId,
      cleanEmail,
      `${nombreAbuelo.trim()} ${apellidoAbuelo.trim()}`,
      telefono?.trim() || ''
    );

    if (profileResult.error) {
      console.error('[CREATE-PROFILE] Profile creation error:', profileResult.error);
      return NextResponse.json(
        { error: `Failed to create profile: ${profileResult.error}` },
        { status: 500 }
      );
    }

    // ✅ Get or create condominio
    const condominioResult = await getOrCreateDefaultCondominio(ciudad.trim());
    if (condominioResult.error) {
      console.error('[CREATE-PROFILE] Condominio error:', condominioResult.error);
      return NextResponse.json(
        { error: `Failed to set condominio: ${condominioResult.error}` },
        { status: 500 }
      );
    }

    // ✅ Calculate age
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let edad = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      edad--;
    }

    // ✅ Create participante
    const participanteResult = await createParticipante(
      userId,
      condominioResult.data.id,
      nombreAbuelo.trim(),
      edad,
      'otro',
      true,
      `Registrado: ${new Date().toLocaleDateString('es-CO')}`
    );

    if (participanteResult.error) {
      console.error('[CREATE-PROFILE] Participante error:', participanteResult.error);
      return NextResponse.json(
        { error: `Failed to create participante: ${participanteResult.error}` },
        { status: 500 }
      );
    }

    console.log('[CREATE-PROFILE] ✅ Account created successfully');
    
    return NextResponse.json({
      success: true,
      userId,
      message: 'Account created successfully. Please log in.',
    });

  } catch (error: any) {
    console.error('[CREATE-PROFILE] Unhandled error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
