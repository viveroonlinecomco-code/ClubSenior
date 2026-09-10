import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/suscripcion/cancel
 * Cancel an active subscription
 */
export async function POST(request: NextRequest) {
  try {
    const { suscripcion_id, razon } = await request.json();

    if (!suscripcion_id) {
      return NextResponse.json(
        { error: 'suscripcion_id is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[CANCEL] Canceling subscription:', suscripcion_id);

    // Update suscripcion estado to CANCELLED
    const response = await fetch(
      `${supabaseUrl}/rest/v1/suscripciones?id=eq.${suscripcion_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'CANCELLED',
          fecha_cancelacion: new Date().toISOString(),
          razon_cancelacion: razon,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[CANCEL] Failed:', error);
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: response.status }
      );
    }

    console.log('[CANCEL] ✅ Subscription cancelled');

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });

  } catch (error: any) {
    console.error('[CANCEL] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
