/**
 * POST /api/subscriptions/create
 * Create subscription after step 3 completion
 * Handles plan selection and initial subscription state
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSuscripcion, getPlanByNombre } from '@/lib/supabase/database';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No user found. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { planNombre } = body;

    if (!planNombre) {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    // Get plan details
    const planResult = await getPlanByNombre(planNombre);
    if (planResult.error || !planResult.data) {
      return NextResponse.json(
        { error: 'Plan not found', details: planResult.error },
        { status: 404 }
      );
    }

    const plan = planResult.data;

    // Create subscription
    const suscripcionResult = await createSuscripcion(
      user.id, // participante_id (user just created is also the senior)
      plan.id,
      user.id, // sponsor_id (same user for now)
      'LEGAL_ACCEPTED' // Estado después de aceptar términos
    );

    if (suscripcionResult.error) {
      return NextResponse.json(
        { error: 'Failed to create subscription', details: suscripcionResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suscripcion: suscripcionResult.data,
      plan,
    });
  } catch (error: any) {
    console.error('Error in create subscription:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
