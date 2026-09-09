/**
 * Wompi payment client and validation
 * Handles signature validation and webhook processing
 */

import crypto from 'crypto';

interface WompiEvent {
  id: string;
  event: string;
  timestamp: string;
  signature: string;
  data: {
    id: string;
    created_at: string;
    finalized_at: string | null;
    amount_in_cents: number;
    reference: string;
    currency: string;
    payment_method: {
      type: string;
    };
    status: 'APPROVED' | 'PENDING' | 'FAILED';
    status_message: string;
    merchant: {
      id: string;
    };
  };
}

/**
 * Validate Wompi webhook signature
 * Using HMAC-SHA256 as per Wompi documentation
 */
export function validateWompiSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Wompi signature is X-Wompi-Signature header
    // Format: HMAC-SHA256(payload, secret)
    const computed = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(signature)
    );
  } catch (err) {
    console.error('Signature validation error:', err);
    return false;
  }
}

/**
 * Parse and validate Wompi event
 */
export function parseWompiEvent(payload: string): WompiEvent | null {
  try {
    const event = JSON.parse(payload) as WompiEvent;
    
    // Basic validation
    if (!event.id || !event.event || !event.data || !event.data.reference) {
      console.error('Invalid Wompi event structure');
      return null;
    }

    return event;
  } catch (err) {
    console.error('Error parsing Wompi event:', err);
    return null;
  }
}

/**
 * Get Wompi payment status from event
 */
export function getPaymentStatus(wompiStatus: string): 'APPROVED' | 'FAILED' | 'PENDING' {
  switch (wompiStatus.toUpperCase()) {
    case 'APPROVED':
      return 'APPROVED';
    case 'FAILED':
      return 'FAILED';
    case 'PENDING':
    default:
      return 'PENDING';
  }
}

/**
 * Generate Wompi checkout link (for client-side use)
 * This would be called when initiating a payment
 */
export function generateWompiCheckoutUrl(
  reference: string,
  amountCents: number,
  currencyCode: string = 'COP',
  publicKey: string = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || ''
): string {
  const params = new URLSearchParams([
    ['public-key', publicKey],
    ['currency', currencyCode],
    ['amount-in-cents', amountCents.toString()],
    ['reference', reference],
    ['redirect-url', `${process.env.NEXT_PUBLIC_APP_URL}/inscribir/success?reference=${reference}`],
  ]);

  return `https://checkout.wompi.co/l/${publicKey}?${params.toString()}`;
}
