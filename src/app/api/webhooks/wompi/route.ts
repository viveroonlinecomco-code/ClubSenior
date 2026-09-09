import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function validateEnvironment(): Promise<{ valid: boolean; error?: string }> {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) {
    return {
      valid: false,
      error: 'WOMPI_EVENTS_SECRET not configured',
    };
  }
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Lazy import to avoid static generation issues
    const { validateWompiSignature, parseWompiEvent } = await import('@/lib/wompi');
    const { processPaymentWebhook } = await import('@/services/payments');

    const envCheck = await validateEnvironment();
    if (!envCheck.valid) {
      console.error('Environment check failed:', envCheck.error);
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-wompi-signature');
    
    if (!signature) {
      console.warn('Missing X-Wompi-Signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const isValidSignature = validateWompiSignature(
      rawBody,
      signature,
      process.env.WOMPI_EVENTS_SECRET || ''
    );

    if (!isValidSignature) {
      console.warn('Invalid Wompi signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = parseWompiEvent(rawBody);
    if (!event) {
      console.error('Failed to parse Wompi event');
      return NextResponse.json(
        { error: 'Invalid event format' },
        { status: 400 }
      );
    }

    if (!event.event.includes('PAYMENT')) {
      console.log(`Ignoring non-payment event: ${event.event}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const result = await processPaymentWebhook(event.id, event.data);

    if (!result.success) {
      console.error('Failed to process payment:', result.error);
      return NextResponse.json(
        { error: result.error || 'Processing failed' },
        { status: 500 }
      );
    }

    console.log(`Payment webhook processed successfully: ${event.id}`);
    return NextResponse.json(
      {
        received: true,
        event_id: event.id,
        status: event.data.status,
        subscription_id: result.subscription_id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const envCheck = await validateEnvironment();
  return NextResponse.json(
    {
      status: envCheck.valid ? 'ready' : 'not_configured',
      error: envCheck.error,
    },
    { status: envCheck.valid ? 200 : 503 }
  );
}
