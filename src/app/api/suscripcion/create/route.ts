import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/suscripcion/create
 * Create a new subscription for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const { email, plan_id } = await request.json();

    if (!email || !plan_id) {
      return NextResponse.json(
        { error: 'Email and plan_id are required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[SUSCRIPCION] Config missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[SUSCRIPCION] Creating subscription:', { email, plan_id });

    // 1. Get plan details
    const planResponse = await fetch(
      `${supabaseUrl}/rest/v1/planes?id=eq.${plan_id}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const plans = await planResponse.json();
    if (!Array.isArray(plans) || plans.length === 0) {
      console.error('[SUSCRIPCION] Plan not found');
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const plan = plans[0];
    const fechaInicio = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + plan.duracion_dias);

    // 2. Get user ID from usuarios table
    const usuarioResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const usuarios = await usuarioResponse.json();
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      console.error('[SUSCRIPCION] Usuario not found');
      return NextResponse.json(
        { error: 'Usuario not found' },
        { status: 404 }
      );
    }

    const usuario = usuarios[0];
    const userId = usuario.id;

    // 3. Create suscripcion
    const suscripcionData = {
      usuario_id: userId,
      plan_id: plan_id,
      estado: 'ACTIVE',
      fecha_inicio: fechaInicio.toISOString(),
      fecha_fin: fechaFin.toISOString(),
    };

    const createResponse = await fetch(
      `${supabaseUrl}/rest/v1/suscripciones`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suscripcionData),
      }
    );

    const createStatus = createResponse.status;
    const createText = await createResponse.text();

    if (!createResponse.ok) {
      console.error('[SUSCRIPCION] Create failed:', createText);
      return NextResponse.json(
        { error: `Failed to create subscription` },
        { status: createStatus }
      );
    }

    console.log('[SUSCRIPCION] ✅ Subscription created');

    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
    });

  } catch (error: any) {
    console.error('[SUSCRIPCION] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
