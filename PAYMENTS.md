# Payment Integration — Wompi

## Overview

Payment processing via **Wompi**, Colombia's leading payment gateway. 

Key principles:
- **Webhooks are source of truth:** Backend doesn't trust frontend status
- **Idempotency:** Same webhook received twice = process once
- **Signature validation:** Verify all webhooks are really from Wompi
- **State machine:** Clear payment → subscription state transitions
- **Audit trail:** Every payment event is logged

---

## Architecture

```
User (Frontend)
  ↓
Checkout Modal (Wompi)
  ↓ (user enters card)
Wompi API
  ↓ (processes payment)
Wompi Servers
  ↓
Webhook → /api/webhooks/wompi (Backend)
  ↓
Database (mark payment APPROVED)
  ↓
Activate subscription automatically
  ↓
User sees "Payment successful"
```

---

## Payment Flow

### Step 1: Initiate Checkout

**Frontend:**
```typescript
// User clicks "Pay Now"
// Frontend generates checkout token from Wompi

const checkoutUrl = new URL('https://checkout.wompi.co/w');
checkoutUrl.searchParams.set('public-key', WOMPI_PUBLIC_KEY);
checkoutUrl.searchParams.set('currency', 'COP');
checkoutUrl.searchParams.set('amount-in-cents', 16000000); // $160,000
checkoutUrl.searchParams.set('reference', paymentId); // Unique reference
checkoutUrl.searchParams.set(
  'redirect-url',
  `${APP_URL}/familia/suscripcion/${subscriptionId}/confirmacion`
);

// Open checkout in modal/new window
window.location.href = checkoutUrl.toString();
```

**Database state:**
```
payment:
  id: uuid
  suscripcion_id: uuid
  referencia_wompi: "ABC123" (unique)
  estado: PENDING
  created_at: now()
```

### Step 2: User Pays

**Wompi:**
- Displays secure checkout form
- User enters card details
- Wompi processes payment
- User redirected to `redirect-url` (either success or failure)

### Step 3: Wompi Webhook

**Wompi servers** send webhook to `/api/webhooks/wompi`:

```json
{
  "id": "evt_abc123xyz",
  "event": "PAYMENT.APPROVED",
  "timestamp": "2026-09-07T01:55:00Z",
  "data": {
    "id": "prod_abc123xyz",
    "created_at": "2026-09-07T01:54:00Z",
    "finalized_at": "2026-09-07T01:55:00Z",
    "amount_in_cents": 16000000,
    "reference": "pago_abc123xyz",
    "currency": "COP",
    "payment_method": {
      "type": "CARD",
      "card_token": "...masked..."
    },
    "status": "APPROVED",
    "status_message": "Pago aprobado",
    "merchant": {
      "id": "mch_your_merchant_id"
    }
  }
}
```

### Step 4: Backend Processes Webhook

**Backend (`/api/webhooks/wompi`):**

1. **Verify signature:**
```typescript
const signature = request.headers.get('x-wompi-signature');
const body = await request.text();

const isValid = validateWompiSignature(
  body,
  signature,
  WOMPI_EVENTS_SECRET
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

2. **Check idempotency:**
```typescript
const existing = await db.webhook_events.findUnique({
  where: {
    proveedor_evento_id_externo: {
      proveedor: 'wompi',
      evento_id_externo: evt.id, // "evt_abc123xyz"
    },
  },
});

if (existing && existing.procesado) {
  // Already processed - return success
  return res.status(200).json({ message: 'Already processed' });
}
```

3. **Record webhook event:**
```typescript
await db.webhook_events.create({
  proveedor: 'wompi',
  evento_id_externo: evt.id,
  evento_tipo: evt.event, // "PAYMENT.APPROVED"
  payload: evt, // Store full payload for debugging
  procesado: false,
  intento_numero: 0,
  created_at: new Date(),
});
```

4. **Update payment status:**
```typescript
const payment = await db.pagos.findUnique({
  where: { referencia_wompi: evt.data.reference }, // Reference matches!
});

if (!payment) {
  // Webhook for unknown payment - log and ignore
  return res.status(404).json({ error: 'Payment not found' });
}

await db.pagos.update({
  where: { id: payment.id },
  data: {
    estado: evt.data.status === 'APPROVED' ? 'APPROVED' : 'FAILED',
    metadata_wompi: evt.data,
    processed_at: new Date(),
  },
});
```

5. **Activate subscription if approved:**
```typescript
if (evt.data.status === 'APPROVED') {
  const subscription = await db.suscripciones.findUnique({
    where: { id: payment.suscripcion_id },
  });

  if (subscription.estado === 'PAYMENT_PENDING') {
    // Transition to ACTIVE
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1); // 30 days

    await db.suscripciones.update({
      where: { id: payment.suscripcion_id },
      data: {
        estado: 'PAYMENT_APPROVED',
        fecha_inicio: now,
        fecha_fin: endDate,
      },
    });

    // Schedule transition to ACTIVE (can be done immediately or via cron)
    await db.suscripciones.update({
      where: { id: payment.suscripcion_id },
      data: { estado: 'ACTIVE' },
    });
  }
}
```

6. **Audit log:**
```typescript
await createAuditLog(
  sponsorId, // who owns the subscription
  evt.data.status === 'APPROVED' ? 'PAYMENT_APPROVED' : 'PAYMENT_FAILED',
  'PAGO',
  payment.id,
  {
    wompi_event_id: evt.id,
    amount: evt.data.amount_in_cents,
    status: evt.data.status,
  }
);
```

7. **Mark webhook as processed:**
```typescript
await db.webhook_events.update({
  where: { id: webhookEventId },
  data: {
    procesado: true,
    resultado: 'Payment status updated',
    fecha_procesamiento: new Date(),
  },
});
```

8. **Return 200 OK:**
```typescript
return res.status(200).json({
  message: 'Webhook processed successfully',
  payment_id: payment.id,
});
```

---

## Webhook Signature Validation

### How It Works

Wompi includes an HMAC-SHA256 signature in the `x-wompi-signature` header.

To verify:
1. Take the raw HTTP body (NOT parsed JSON)
2. Create HMAC-SHA256 hash using `WOMPI_EVENTS_SECRET`
3. Compare with header value

### Implementation

```typescript
import crypto from 'crypto';

function validateWompiSignature(
  body: string,
  headerSignature: string,
  secret: string
): boolean {
  // Generate expected signature
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(headerSignature)
  );
}

// In API route
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('x-wompi-signature') || '';

  if (!validateWompiSignature(body, signature, WOMPI_EVENTS_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Safe to process
  const payload = JSON.parse(body);
  // ...
}
```

---

## Idempotency

### Problem

Webhooks may be delivered multiple times:
- Wompi retry logic (network failures)
- Your server crashes mid-processing
- Wompi doesn't get 200 OK response

### Solution

Track received events by external ID:

**Table: `webhook_events`**
```
webhook_events
├── id (UUID, PK)
├── proveedor: 'wompi'
├── evento_id_externo: string (UNIQUE) ← Wompi's event ID
├── evento_tipo: 'PAYMENT.APPROVED'
├── payload: JSONB
├── procesado: boolean
├── resultado: text
├── error: text
├── fecha_procesamiento: timestamp
└── created_at: timestamp
```

**Logic:**

```typescript
// FIRST: Check if we already processed this event
const existingEvent = await db.webhook_events.findUnique({
  where: {
    proveedor_evento_id_externo: {
      proveedor: 'wompi',
      evento_id_externo: evt.id,
    },
  },
});

if (existingEvent) {
  if (existingEvent.procesado) {
    // Already processed successfully
    return res.status(200).json({ message: 'Already processed' });
  } else if (existingEvent.intento_numero >= 3) {
    // Failed 3 times - give up
    return res.status(500).json({ error: 'Max retries exceeded' });
  } else {
    // Retry processing
    const newIntento = existingEvent.intento_numero + 1;
    try {
      // Process again...
      await db.webhook_events.update({
        where: { id: existingEvent.id },
        data: {
          procesado: true,
          intento_numero: newIntento,
          fecha_procesamiento: new Date(),
        },
      });
      return res.status(200).json({ message: 'Processed on retry' });
    } catch (err) {
      await db.webhook_events.update({
        where: { id: existingEvent.id },
        data: {
          error: err.message,
          intento_numero: newIntento,
        },
      });
      return res.status(500).json({ error: 'Processing failed' });
    }
  }
}

// NEW EVENT: Record it and process
const webhookEvent = await db.webhook_events.create({
  data: {
    proveedor: 'wompi',
    evento_id_externo: evt.id,
    evento_tipo: evt.event,
    payload: evt,
    procesado: false,
    intento_numero: 0,
  },
});

try {
  // Process payment...
  await markWebhookProcessed(webhookEvent.id, 'Success');
  return res.status(200).json({ message: 'Webhook processed' });
} catch (err) {
  await markWebhookProcessed(webhookEvent.id, 'Error', err.message);
  return res.status(500).json({ error: 'Processing failed' });
}
```

---

## State Transitions

### Subscription States During Payment

```
LEGAL_ACCEPTED
    ↓ (user clicks "Pay Now")
PAYMENT_PENDING
    ↓ (user pays in checkout)
[Wompi processes...]
    ├→ PAYMENT_APPROVED (webhook: status=APPROVED)
    │    ↓ (automatic activation)
    │    ACTIVE ✓
    └→ PAYMENT_FAILED (webhook: status=FAILED)
         ↓ (user can retry)
         PAYMENT_PENDING (back to retry)
         OR
         CANCELLED (user gives up)
```

### Code

```typescript
async function handleWompiEvent(evt: any) {
  const payment = await db.pagos.findUnique({
    where: { referencia_wompi: evt.data.reference },
    include: { suscripcion: true },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const subscription = payment.suscripcion;

  // Update payment status
  await db.pagos.update({
    where: { id: payment.id },
    data: {
      estado: evt.data.status === 'APPROVED' ? 'APPROVED' : 'FAILED',
    },
  });

  // Update subscription state
  if (evt.data.status === 'APPROVED') {
    const ahora = new Date();
    const vencimiento = new Date(ahora);
    vencimiento.setMonth(vencimiento.getMonth() + 1);

    await db.suscripciones.update({
      where: { id: subscription.id },
      data: {
        estado: 'PAYMENT_APPROVED',
        fecha_inicio: ahora,
        fecha_fin: vencimiento,
      },
    });

    // Activate immediately
    await db.suscripciones.update({
      where: { id: subscription.id },
      data: { estado: 'ACTIVE' },
    });

    // Send notification to user
    await notificationService.send({
      usuario_id: subscription.sponsor_id,
      tipo: 'EMAIL',
      asunto: '¡Pago recibido!',
      contenido: 'Tu suscripción está activa.',
    });
  } else if (evt.data.status === 'FAILED') {
    // Keep subscription in PAYMENT_PENDING
    // User can retry

    // Send notification
    await notificationService.send({
      usuario_id: subscription.sponsor_id,
      tipo: 'EMAIL',
      asunto: 'Error en el pago',
      contenido: 'El pago no fue procesado. Por favor intenta de nuevo.',
    });
  }
}
```

---

## Testing Webhooks Locally

### Using Wompi Test Account

1. **Get test keys:**
   - Wompi Dashboard → Settings → API Keys
   - Use `pub_test_...` and `priv_test_...`

2. **Test card numbers:**
   ```
   4111111111111111 (Success)
   4011111111111111 (Failure)
   ```

3. **Simulate webhook locally:**

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Send test webhook
curl -X POST http://localhost:3000/api/webhooks/wompi \
  -H "Content-Type: application/json" \
  -H "x-wompi-signature: YOUR_TEST_SIGNATURE" \
  -d '{
    "id": "evt_test_123",
    "event": "PAYMENT.APPROVED",
    "timestamp": "2026-09-07T02:00:00Z",
    "data": {
      "id": "prod_test_123",
      "reference": "pago_test_123",
      "amount_in_cents": 16000000,
      "status": "APPROVED",
      "status_message": "Pago aprobado",
      "merchant": { "id": "mch_test" }
    }
  }'
```

### Generate Test Signature

```typescript
import crypto from 'crypto';

const body = JSON.stringify({
  id: 'evt_test_123',
  // ... rest of payload
});

const secret = 'your_wompi_secret_test';
const signature = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

console.log(`Header: x-wompi-signature: ${signature}`);
```

---

## Production Checklist

- [ ] Use `WOMPI_PRIVATE_KEY` and `WOMPI_EVENTS_SECRET` (not test keys)
- [ ] Webhook endpoint at `/api/webhooks/wompi` is public (no auth)
- [ ] Signature validation is ALWAYS enabled
- [ ] Idempotency check always runs first
- [ ] Payment reference is UNIQUE per transaction
- [ ] Audit logs capture all payment events
- [ ] Email notifications working
- [ ] Test end-to-end with staging Wompi account
- [ ] Vercel Environment Variables set correctly
- [ ] Monitor webhook processing latency
- [ ] Alerts set up for payment failures

---

## Troubleshooting

### "Invalid signature"

**Cause:** Wrong secret or body was modified

**Fix:**
1. Verify `WOMPI_EVENTS_SECRET` in .env
2. Ensure body is NOT parsed before signature validation
3. Check Wompi dashboard → Webhooks → Secret matches

### Payment approved but subscription not activated

**Cause:** Webhook not received or failed during processing

**Fix:**
1. Check `webhook_events` table for the event
2. Check `audit_logs` for errors
3. Manually trigger retry if needed
4. Verify Vercel logs

### Duplicate charges

**Cause:** Idempotency not working

**Fix:**
1. Verify `webhook_events` table exists
2. Ensure UNIQUE constraint on `(proveedor, evento_id_externo)`
3. Check if processed flag is being set

### User redirected to success but payment still pending

**Cause:** Redirect happens before webhook processed

**Fix:**
- Frontend polls `/api/familia/suscripcion/{id}` every 2s
- Or uses realtime subscription to watch payment status
- Display "Processing..." until webhook confirms

---

## References

- [Wompi API Docs](https://docs.wompi.co)
- [Wompi Test Environment](https://docs.wompi.co/testing)
- [HMAC Validation](https://docs.wompi.co/reference/webhooks)
- [Payment Best Practices](https://stripe.com/docs/payments/payment-intents)
