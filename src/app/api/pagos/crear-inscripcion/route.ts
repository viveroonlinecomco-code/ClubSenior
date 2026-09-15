import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pagos/crear-inscripcion
 * Crea enlace de pago Wompi para NUEVA inscripción
 * Entrada: { planSeleccionado: 'mensual' | 'sesion', email: string }
 * Salida: { wompi_checkout_url: string, referencia: string, monto_cop: number }
 * 
 * ✅ Wompi maneja TODO el pago - NO pedimos datos de tarjeta
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planSeleccionado, email } = body;

    // Validar inputs
    if (!planSeleccionado || !['mensual', 'sesion'].includes(planSeleccionado)) {
      return NextResponse.json(
        { error: 'Plan debe ser "mensual" o "sesion"' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Precios (deben coincidir con Step3Form)
    const PRECIOS: { [key: string]: number } = {
      mensual: 150000,  // $150.000 COP
      sesion: 40000,     // $40.000 COP
    };

    const montoCOP = PRECIOS[planSeleccionado];
    const montoCents = montoCOP * 100;  // Wompi usa centavos

    // Validar variables de entorno
    const wompiPublicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.tardesdelcafe.com';

    if (!wompiPublicKey) {
      console.error('[PAGOS-INSCRIPCION] Missing Wompi public key');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Generar referencia única
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const referencia = `CLUB-${planSeleccionado.toUpperCase()}-${randomStr}-${timestamp}`;

    console.log('[PAGOS-INSCRIPCION] ✅ Creating Wompi link:', {
      email,
      plan: planSeleccionado,
      monto: montoCOP,
      referencia,
    });

    // Generar URL de checkout de Wompi
    // URL params según documentación de Wompi:
    // https://docs.wompi.co/checkout/crear-enlace-de-pago
    const params = new URLSearchParams([
      ['public-key', wompiPublicKey],
      ['currency', 'COP'],
      ['amount-in-cents', montoCents.toString()],
      ['reference', referencia],
      ['customer-email', email],
      ['redirect-url', `${appUrl}/familia?payment_status=success&reference=${referencia}`],
    ]);

    const wompiCheckoutUrl = `https://checkout.wompi.co/l/${wompiPublicKey}?${params.toString()}`;

    return NextResponse.json({
      success: true,
      referencia,
      plan: planSeleccionado,
      monto_cop: montoCOP,
      monto_cents: montoCents,
      email,
      wompi_checkout_url: wompiCheckoutUrl,
      message: 'Pago listo. Redirigiendo a Wompi...',
    });

  } catch (error: any) {
    console.error('[PAGOS-INSCRIPCION] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Error del servidor' },
      { status: 500 }
    );
  }
}
