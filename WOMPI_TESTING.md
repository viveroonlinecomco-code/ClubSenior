# Wompi Webhook Testing Guide

## Local Testing Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
WOMPI_EVENTS_SECRET=test_secret_key_for_local_testing
WOMPI_PRIVATE_KEY=priv_test_xxx
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_xxx
```

### 2. Webhook Endpoint

**URL:** `POST http://localhost:3000/api/webhooks/wompi`

**Headers:**
```
Content-Type: application/json
X-Wompi-Signature: <HMAC-SHA256 signature>
```

### 3. Testing with cURL

#### Generate a test signature

```bash
# Create payload
PAYLOAD='{"id":"evt_123","event":"PAYMENT.APPROVED","timestamp":"2026-09-07T10:00:00Z","data":{"id":"payment_123","status":"APPROVED","reference":"pago_1234567890_abc","amount_in_cents":16000000}}'

# Generate HMAC-SHA256 signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "test_secret_key_for_local_testing" -hex | cut -d' ' -f2)

# Send webhook
curl -X POST http://localhost:3000/api/webhooks/wompi \
  -H "Content-Type: application/json" \
  -H "X-Wompi-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

#### Test approved payment

```bash
curl -X POST http://localhost:3000/api/webhooks/wompi \
  -H "Content-Type: application/json" \
  -H "X-Wompi-Signature: <signature>" \
  -d '{
    "id": "evt_approved_1",
    "event": "PAYMENT.APPROVED",
    "timestamp": "2026-09-07T10:00:00Z",
    "data": {
      "id": "payment_1",
      "status": "APPROVED",
      "reference": "pago_test_approved",
      "amount_in_cents": 16000000,
      "currency": "COP"
    }
  }'
```

#### Test failed payment

```bash
curl -X POST http://localhost:3000/api/webhooks/wompi \
  -H "Content-Type: application/json" \
  -H "X-Wompi-Signature: <signature>" \
  -d '{
    "id": "evt_failed_1",
    "event": "PAYMENT.FAILED",
    "timestamp": "2026-09-07T10:00:00Z",
    "data": {
      "id": "payment_2",
      "status": "FAILED",
      "reference": "pago_test_failed",
      "amount_in_cents": 16000000,
      "currency": "COP"
    }
  }'
```

### 4. Expected Responses

**Success (200 OK):**
```json
{
  "received": true,
  "event_id": "evt_123",
  "status": "APPROVED",
  "subscription_id": "sub_xxx"
}
```

**Bad Signature (401):**
```json
{
  "error": "Invalid signature"
}
```

**Missing Signature (401):**
```json
{
  "error": "Missing signature"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

## Production Setup

### 1. Wompi Dashboard Configuration

1. Go to https://dashboard.wompi.co
2. Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/webhooks/wompi`
4. Select events:
   - PAYMENT.APPROVED
   - PAYMENT.FAILED
   - PAYMENT.REFUNDED
5. Copy the event secret to `WOMPI_EVENTS_SECRET`

### 2. Database Verification

Check webhook processing:

```sql
-- View webhook events
SELECT 
  evento_id_externo, 
  tipo, 
  procesado, 
  created_at 
FROM webhook_events 
ORDER BY created_at DESC 
LIMIT 10;

-- View payment state transitions
SELECT 
  p.id,
  p.estado,
  p.referencia_wompi,
  s.estado as suscripcion_estado,
  s.fecha_inicio,
  p.updated_at
FROM pagos p
JOIN suscripciones s ON p.suscripcion_id = s.id
ORDER BY p.created_at DESC
LIMIT 10;

-- View audit logs
SELECT 
  usuario_id,
  accion,
  entidad_tipo,
  entidad_id,
  datos,
  created_at
FROM audit_logs
WHERE accion LIKE '%PAYMENT%'
ORDER BY created_at DESC
LIMIT 20;
```

## State Machine Transitions

### Valid Transitions

```
STARTED 
  → DATA_COMPLETED 
    → LEGAL_ACCEPTED 
      → PAYMENT_PENDING
        → PAYMENT_APPROVED → ACTIVE ✓
        → PAYMENT_FAILED → (retry or CANCELLED)
        
ACTIVE
  → SUSPENDED (payment issue)
  → EXPIRED (end of plan)
  → CANCELLED (user request)
```

### Payment Processing Logic

1. **Webhook Received** → Validate signature
2. **Idempotency Check** → Check webhook_events table
3. **Payment Lookup** → Find payment by reference
4. **State Validation** → Ensure PAYMENT_PENDING state
5. **Process Payment** → Update payment + subscription
6. **Send Email** → Confirmation or failure notification
7. **Mark as Processed** → Mark webhook_events as done

## Debugging

### Check webhook logs

```bash
# View real-time logs (if using Vercel)
vercel logs

# Or check database audit logs
```

### Common Issues

**Signature Mismatch:**
- Verify `WOMPI_EVENTS_SECRET` matches Wompi dashboard
- Ensure payload is raw text (not parsed JSON)
- Use timing-safe comparison (already implemented)

**Duplicate Processing:**
- Check `webhook_events.evento_id_externo`
- Verify idempotency logic is working
- Look for duplicate payments in `pagos` table

**Missing Emails:**
- Verify `RESEND_API_KEY` is set (or check console logs in dev mode)
- Check email in `profiles` table
- Review audit logs for email send events

**Subscription State Error:**
- Verify subscription is in PAYMENT_PENDING state
- Check audit logs for state history
- Ensure participant_id and sponsor_id exist

## Monitoring

### Health Check

```bash
curl http://localhost:3000/api/webhooks/wompi
# Returns: {"status": "ready"} if configured
```

### Webhook Retry Logic

Wompi retries webhooks on:
- Non-200 response
- Timeout (>30s)
- Server errors (5xx)

Maximum retries: ~6 times over 24 hours

## Security Checklist

- [ ] HMAC-SHA256 signature validation enabled
- [ ] Timing-safe comparison used
- [ ] Raw body used for signature (not parsed JSON)
- [ ] Webhook events table for idempotency
- [ ] Service Role Key NOT exposed in webhook code
- [ ] Audit logs recording all payments
- [ ] Email notifications sent on state changes
- [ ] RLS policies protect subscription data
- [ ] Error handling doesn't leak sensitive data

## Testing Checklist

- [ ] Test approved payment → Subscription ACTIVE
- [ ] Test failed payment → Subscription PAYMENT_PENDING
- [ ] Test duplicate webhook → No double-processing
- [ ] Test missing reference → Returns 500 (Wompi retries)
- [ ] Test invalid signature → Returns 401
- [ ] Test missing signature → Returns 401
- [ ] Test health endpoint → Returns 200
- [ ] Test email notifications → Sent on success/failure
- [ ] Test audit logs → All events recorded
- [ ] Test RLS policies → Data properly protected
