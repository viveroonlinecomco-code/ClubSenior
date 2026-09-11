import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pagos/crear
 * Crea un registro de pago y prepara para enviar a Wompi
 * Retorna URL de checkout de Wompi
 */
export async function POST(request: NextRequest) {
  try {
    const { suscripcion_id } = await request.json();

    if (!suscripcion_id) {
      return NextResponse.json(
        { error: 'suscripcion_id is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const wompiPublicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;

    if (!supabaseUrl || !supabaseKey || !wompiPublicKey) {
      console.error('[PAGOS] Missing configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[PAGOS] Creating payment for subscription:', suscripcion_id);

    // 1. Obtener datos de suscripción y plan
    const subsResponse = await fetch(
      `${supabaseUrl}/rest/v1/suscripciones?id=eq.${encodeURIComponent(suscripcion_id)}&select=*`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!subsResponse.ok) {
      return NextResponse.json(
        { error: 'Suscripcion not found' },
        { status: 404 }
      );
    }

    const suscripciones = await subsResponse.json();
    if (!Array.isArray(suscripciones) || suscripciones.length === 0) {
      return NextResponse.json(
        { error: 'Suscripcion not found' },
        { status: 404 }
      );
    }

    const suscripcion = suscripciones[0];

    // 2. Obtener plan para saber el monto
    const planResponse = await fetch(
      `${supabaseUrl}/rest/v1/planes?id=eq.${encodeURIComponent(suscripcion.plan_id)}&select=precio_cop`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!planResponse.ok) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const planes = await planResponse.json();
    if (!Array.isArray(planes) || planes.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const plan = planes[0];
    const montoCOP = plan.precio_cop;
    const montoCents = montoCOP * 100;

    // 3. Crear referencia única
    const timestamp = Date.now();
    const referencia = `${suscripcion_id}-${timestamp}`;

    // 4. Registrar pago en BD como PENDING
    const pagoData = {
      suscripcion_id,
      monto_cop: montoCOP,
      referencia_wompi: referencia,
      estado: 'PENDING',
      metodo_pago: 'wompi',
    };

    const createPagoResponse = await fetch(
      `${supabaseUrl}/rest/v1/pagos`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagoData),
      }
    );

    if (!createPagoResponse.ok) {
      const error = await createPagoResponse.text();
      console.error('[PAGOS] Failed to create pago record:', error);
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    // 5. Actualizar suscripción a PAYMENT_PENDING
    const updateSubsResponse = await fetch(
      `${supabaseUrl}/rest/v1/suscripciones?id=eq.${encodeURIComponent(suscripcion_id)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'PAYMENT_PENDING',
        }),
      }
    );

    if (!updateSubsResponse.ok) {
      console.error('[PAGOS] Failed to update subscription status');
      // Continue anyway - payment record is created
    }

    console.log('[PAGOS] ✅ Payment record created:', referencia);

    // 6. Generar URL de checkout de Wompi
    const params = new URLSearchParams([
      ['public-key', wompiPublicKey],
      ['currency', 'COP'],
      ['amount-in-cents', montoCents.toString()],
      ['reference', referencia],
      ['redirect-url', `${process.env.NEXT_PUBLIC_APP_URL || 'https://club-senior.vercel.app'}/familia?payment_status=success&reference=${referencia}`],
    ]);

    const wompiCheckoutUrl = `https://checkout.wompi.co/l/${wompiPublicKey}?${params.toString()}`;

    return NextResponse.json({
      success: true,
      pago_id: suscripcion_id,
      referencia,
      monto_cop: montoCOP,
      monto_cents: montoCents,
      wompi_checkout_url: wompiCheckoutUrl,
      message: 'Payment initiated. Redirect to Wompi checkout.',
    });

  } catch (error: any) {
    console.error('[PAGOS] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
