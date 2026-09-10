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
    const supabaseAdmin = await getSupabaseAdmin();
    const body = await request.json();
    const { email, nombreAbuelo, apellidoAbuelo, telefono, fechaNacimiento, ciudad } = body;

    console.log(`[CREATE-PROFILE] Request for email: ${email}`);

    if (!email || !nombreAbuelo || !apellidoAbuelo || !ciudad) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let userId: string = '';

    // Try to create user in Auth (email_confirm: true for OTP-only auth)
    console.log(`[CREATE-PROFILE] Creating user in Auth: ${email}`);
    
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        verified_otp_at: new Date().toISOString(),
      },
    });

    if (authError) {
      // If user already exists, use them (expected for re-registration)
      if (authError.message?.toLowerCase().includes('already exists')) {
        console.log(`[CREATE-PROFILE] User already exists for: ${email}`);
        // We'll try to get the user ID from the auth session in next request
        // For now, we can't proceed without a user ID
        return NextResponse.json(
          { 
            error: 'User already registered. Please log in instead.',
            code: 'USER_EXISTS'
          },
          { status: 409 }
        );
      }
      console.error(`[CREATE-PROFILE] Auth error:`, authError);
      return NextResponse.json(
        { error: `Failed to create user: ${authError.message}` },
        { status: 500 }
      );
    }

    userId = newUser?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to get user ID after creation' },
        { status: 500 }
      );
    }

    console.log(`[CREATE-PROFILE] User created: ${userId}`);

    // Create profile
    const profileResult = await createUserProfile(
      userId,
      email,
      `${nombreAbuelo} ${apellidoAbuelo}`,
      telefono
    );

    if (profileResult.error) {
      console.error(`[CREATE-PROFILE] Profile error:`, profileResult.error);
      return NextResponse.json(
        { error: 'Failed to create profile', details: profileResult.error },
        { status: 500 }
      );
    }

    // Get or create condominio
    const condominioResult = await getOrCreateDefaultCondominio(ciudad);
    if (condominioResult.error) {
      console.error(`[CREATE-PROFILE] Condominio error:`, condominioResult.error);
      return NextResponse.json(
        { error: 'Failed to get condominio', details: condominioResult.error },
        { status: 500 }
      );
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
      nombreAbuelo,
      edad,
      'otro',
      true,
      `Registrado: ${new Date().toLocaleDateString('es-CO')}`
    );

    if (participanteResult.error) {
      console.error(`[CREATE-PROFILE] Participante error:`, participanteResult.error);
      return NextResponse.json(
        { error: 'Failed to create participante', details: participanteResult.error },
        { status: 500 }
      );
    }

    console.log(`[CREATE-PROFILE] ✅ Success - userId: ${userId}`);
    
    return NextResponse.json({
      success: true,
      userId,
      email,
      profile: profileResult.data,
      participante: participanteResult.data,
    });
  } catch (error: any) {
    console.error('[CREATE-PROFILE] Unhandled error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
