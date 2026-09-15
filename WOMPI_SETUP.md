# 💳 Configuración de Wompi - Grupo Plateado

## Requisitos

1. Cuenta de Wompi Business
2. Aplicación creada en Wompi
3. Claves API configuradas en Vercel

---

## Paso 1: Crear Cuenta en Wompi

1. Ve a https://wompi.co
2. Crea una cuenta de negocio
3. Completa la verificación KYC
4. Accede al dashboard

---

## Paso 2: Obtener Credenciales

En el dashboard de Wompi:

1. Ve a **Configuración** → **Claves de API**
2. Copia tu **Clave Pública**
   - Usada en el cliente (NEXT_PUBLIC_WOMPI_PUBLIC_KEY)
   
3. Copia tu **Clave Privada**
   - Nunca la expongas públicamente

4. Ve a **Webhooks**
5. Copia el **Secreto de Eventos**
   - Usada para validar firmas de webhooks (WOMPI_EVENTS_SECRET)

---

## Paso 3: Configurar Variables en Vercel

En **Vercel → Project Settings → Environment Variables**:

```env
# Public (visibles en el cliente)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=tu_clave_publica_wompi

# Secret (solo servidor)
WOMPI_EVENTS_SECRET=tu_secreto_de_eventos_wompi
```

---

## Paso 4: Configurar Webhook en Wompi

En el dashboard de Wompi:

1. Ve a **Webhooks** → **Agregar Webhook**
2. Ingresa la URL:
   ```
   https://tu-dominio.vercel.app/api/webhooks/wompi
   ```
3. Selecciona eventos: **PAYMENT.APPROVED**, **PAYMENT.FAILED**
4. Guarda el webhook
5. Copia el **Secreto** que aparece (WOMPI_EVENTS_SECRET)

---

## Paso 5: Pruebas Locales (Desarrollo)

### Wompi Sandbox

Wompi proporciona ambiente de prueba:

1. Usa tarjeta de prueba Wompi
2. O solicita crédito de prueba

### Tarjetas de Prueba

- Aprobada: `4242 4242 4242 4242` + CVV aleatorio + fecha futura
- Rechazada: `5555 5555 5555 4444` + CVV aleatorio + fecha futura

### Testing sin Webhook

Para testing local sin webhooks reales:

1. Crea un pago: `POST /api/pagos/crear`
2. Verifica que registre en BD como PENDING
3. Simula webhook:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/wompi \
     -H "X-Wompi-Signature: tu_firma_hmac" \
     -H "Content-Type: application/json" \
     -d '{"event":"payment.approved","data":{...}}'
   ```

---

## Flujo Completo de Pago

### 1. Usuario Selecciona Plan
```
/planes → Elige "Plan Mensual - 4 Sesiones" ($150,000)
```

### 2. Crea Suscripción
```
POST /api/suscripcion/create
{
  "email": "usuario@example.com",
  "plan_id": "plan-id-uuid"
}
Retorna: suscripcion_id
```

### 3. Inicia Pago
```
GET /pagar?subscription_id=xxx
```

### 4. Crea Registro de Pago
```
POST /api/pagos/crear
{
  "suscripcion_id": "xxx"
}
Retorna:
{
  "referencia": "xxx-timestamp",
  "monto_cop": 150000,
  "wompi_checkout_url": "https://checkout.wompi.co/..."
}
```

### 5. Redirige a Wompi Checkout
```
Usuario ingresa datos de pago en Wompi
```

### 6. Wompi Envía Webhook
```
POST /api/webhooks/wompi
{
  "event": "payment.approved",
  "data": {
    "id": "wompi-pago-id",
    "reference": "xxx-timestamp",
    "amount_in_cents": 15000000,
    "status": "APPROVED"
  }
}
```

### 7. Webhook Procesa Pago
```
1. Valida firma HMAC-SHA256
2. Verifica que no sea duplicado
3. Crea registro en tabla pagos
4. Actualiza suscripción: PAYMENT_PENDING → ACTIVE
5. Envía email de confirmación
6. Retorna 200 OK
```

### 8. Usuario Redirigido al Dashboard
```
/familia → Ve suscripción ACTIVE
         → Puede agregar participantes
         → Accede a todas las features
```

---

## Variables de Entorno Completas

```env
# Wompi
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_xxx
WOMPI_EVENTS_SECRET=event_secret_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Resend (Email)
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```

---

## Troubleshooting

### "Invalid signature"
- Verifica que WOMPI_EVENTS_SECRET sea correcto
- Comprueba que sea exactamente igual al que está en Wompi
- Limpia y redeploya en Vercel

### "Reference not found"
- Verifica que POST /api/pagos/crear se haya ejecutado primero
- Comprueba que el reference tenga el formato correcto: `{suscripcion_id}-{timestamp}`

### Webhook no se ejecuta
- Verifica URL del webhook en Wompi: debe ser `https://...` (no http)
- Prueba webhook desde dashboard de Wompi
- Verifica logs en Vercel (función)

### Transacción stuck en PAYMENT_PENDING
- Puede ser timing issue
- Ejecuta manualmente: `PATCH /suscripciones SET estado='ACTIVE'`
- O espera al siguiente webhook retry de Wompi

---

## Seguridad

✅ **Implementado:**
- HMAC-SHA256 signature validation (timing-safe)
- Idempotency check (evita pagos duplicados)
- Service Role Key en servidor (nunca expuesto)
- Public Key solo para checkout (cliente)
- RLS policies en tablas Supabase
- Email confirmación para cada pago

⚠️ **Mantener seguro:**
- Nunca expongas WOMPI_EVENTS_SECRET en cliente
- Nunca expongas SUPABASE_SERVICE_ROLE_KEY
- Valida siempre firmas de webhook
- No confíes solo en referencia para idempotencia

---

## Monitoreo

### Verificar Pagos Aprobados
```sql
SELECT * FROM pagos WHERE estado = 'APPROVED' ORDER BY created_at DESC LIMIT 10;
```

### Verificar Suscripciones Activas
```sql
SELECT s.id, s.usuario_id, s.estado, p.monto_cop 
FROM suscripciones s
JOIN pagos p ON s.id = p.suscripcion_id
WHERE s.estado = 'ACTIVE'
ORDER BY s.created_at DESC;
```

### Verificar Fallos
```sql
SELECT * FROM pagos WHERE estado = 'FAILED' ORDER BY created_at DESC;
```

---

## Support

- Docs Wompi: https://docs.wompi.co
- API Reference: https://api.wompi.co/docs
- Dashboard: https://app.wompi.co

---

**Última actualización:** 10 Septiembre 2026
**Estado:** ✅ Producción Ready
