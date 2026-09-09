/**
 * POST /api/auth/create-profile
 * Create user profile after OTP verification
 * Called from /verificar-otp page
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile, getOrCreateDefaultCondominio, createParticipante } from '@/lib/supabase/database';
// Dynamic import
let supabaseAdminInstance: any = null;
async function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    supabaseAdminInstance = supabaseAdmin;
  }
  return supabaseAdminInstance;
}

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const {
      data: { user },
    } = await (await getSupabaseAdmin()).auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No user found. Please verify email first.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { nombreAbuelo, apellidoAbuelo, telefono, fechaNacimiento, ciudad } = body;

    // Validate required fields
    if (!nombreAbuelo || !apellidoAbuelo || !ciudad) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create profile
    const profileResult = await createUserProfile(
      user.id,
      user.email || '',
      `${nombreAbuelo} ${apellidoAbuelo}`,
      telefono
    );

    if (profileResult.error) {
      return NextResponse.json(
        { error: 'Failed to create profile', details: profileResult.error },
        { status: 500 }
      );
    }

    // Get or create condominio
    const condominioResult = await getOrCreateDefaultCondominio(ciudad);
    if (condominioResult.error) {
      return NextResponse.json(
        { error: 'Failed to get condominio', details: condominioResult.error },
        { status: 500 }
      );
    }

    // Calculate age from birth date
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let edad = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      edad--;
    }

    // Create participante
    const participanteResult = await createParticipante(
      user.id,
      condominioResult.data.id,
      nombreAbuelo,
      edad,
      'otro',
      true,
      `Abuelo registrado en ${new Date().toLocaleDateString()}`
    );

    if (participanteResult.error) {
      return NextResponse.json(
        { error: 'Failed to create participante', details: participanteResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: profileResult.data,
      participante: participanteResult.data,
      condominio: condominioResult.data,
    });
  } catch (error: any) {
    console.error('Error in create-profile:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
