# Security Policy — Tardes de Café, Mente & Saberes

## Principios de Seguridad

1. **Seguridad primero:** Toda decisión arquitectónica prioriza seguridad
2. **Defense in depth:** Múltiples capas de validación
3. **Least privilege:** Acceso mínimo necesario
4. **Auditabilidad:** Todas las acciones críticas quedan registradas
5. **Determinismo:** No hay magic numbers o estados implícitos

---

## Secret Management

### Prohibido SIEMPRE

```
NUNCA expongas estos valores al navegador:
- SUPABASE_SERVICE_ROLE_KEY
- WOMPI_PRIVATE_KEY
- WOMPI_EVENTS_SECRET
- DATABASE_URL
- JWT signing keys
```

### Nunca uses NEXT_PUBLIC_

```typescript
// ❌ INCORRECTO
NEXT_PUBLIC_WOMPI_PRIVATE_KEY=xyz

// ✅ CORRECTO
WOMPI_PRIVATE_KEY=xyz  (solo servidor)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=abc  (OK para navegador)
```

### Manejo de Secrets en Desarrollo

```bash
# .env.local (NUNCA en git)
cp .env.example .env.local
# editar con valores reales
```

### Manejo de Secrets en Producción

- Supabase: Project Settings → API Keys
- Wompi: Dashboard → API Keys
- Vercel: Settings → Environment Variables (marked as Sensitive)

---

## Authentication & Authorization

### Flujo de Autenticación

```
1. Usuario ingresa email
2. Sistema envía OTP (via Supabase Auth)
3. Usuario verifica OTP
4. Supabase Auth emite JWT
5. Middleware valida JWT en cada request
6. RLS en database complementa autorización
```

### Middleware

El middleware en `lib/supabase/middleware.ts` debe:

```typescript
// 1. Extraer session de cookies
// 2. Validar JWT
// 3. Rechazar requests sin autenticación a rutas protegidas
// 4. Registrar intentos fallidos (audit_logs)
```

### Rutas Protegidas

```
/familia           → Requiere autenticación
/dashboard         → Requiere autenticación
/api/familia/*     → Requiere autenticación + RLS
/api/webhooks/wompi → Requiere validación de firma
```

### Rutas Públicas

```
/                  → Landing
/auth/signin       → Login
/auth/verify-otp   → OTP verification
/inscribir/*       → Onboarding (parcialmente)
```

---

## Row Level Security (RLS)

### Principio

Un usuario NO puede consultar datos de otro usuario, incluso si conoce el ID.

### Implementación PostgreSQL

```sql
-- Crear tabla con owner
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  ...
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios solo ven su propio perfil
CREATE POLICY "Users see own profile"
  ON profiles
  FOR SELECT
  USING (id = auth.uid());

-- Policy: usuarios solo actualizan su perfil
CREATE POLICY "Users update own profile"
  ON profiles
  FOR UPDATE
  USING (id = auth.uid());
```

### Tablas que DEBEN tener RLS

- profiles
- participantes
- suscripciones
- pagos
- contratos
- firmas
- reportes_semanales
- audit_logs (especial: solo admin)

### Verificación

```sql
-- Verificar RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname='public';

-- Listar policies
SELECT tablename, policyname, permissive, roles 
FROM pg_policies;
```

---

## API Security

### Input Validation

TODAS las entradas deben validarse con **Zod**:

```typescript
import { z } from 'zod';

const PaymentWebhookSchema = z.object({
  id: z.string().uuid(),
  event: z.enum(['PAYMENT_APPROVED', 'PAYMENT_FAILED']),
  data: z.object({
    reference: z.string().min(1),
    amount_in_cents: z.number().int().positive(),
  }),
});

// En API route
const payload = PaymentWebhookSchema.parse(req.body);
```

### Webhook Signature Validation

Wompi envía headers con firma. Validar SIEMPRE:

```typescript
import crypto from 'crypto';

function validateWompiSignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

// En /api/webhooks/wompi
const signature = req.headers['x-wompi-signature'];
if (!validateWompiSignature(body, signature, WOMPI_EVENTS_SECRET)) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### Rate Limiting

```typescript
// Proteger endpoints públicos
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests per windowMs
});

app.post('/api/auth/signin', limiter, ...);
```

---

## Payment Security

### NUNCA Confiar en el Frontend

```typescript
// ❌ INCORRECTO: confiar en status del cliente
const subscription = await db.subscriptions.update({
  where: { id },
  data: { status: 'ACTIVE' }, // El cliente miente
});

// ✅ CORRECTO: esperar webhook
// El cliente inicia pago → Wompi → Webhook → Backend verifica → Activa
```

### Flujo Seguro de Pago

```
1. Frontend initiate checkout
   ↓
2. Backend crea Payment con status=PENDING
   ↓
3. Frontend abre modal Wompi
   ↓
4. Usuario paga en Wompi
   ↓
5. Wompi envía webhook a /api/webhooks/wompi
   ↓
6. Backend:
   - valida firma
   - verifica idempotencia
   - actualiza Payment status
   - activa Subscription
   - registra audit_log
   ↓
7. Frontend se entera por polling o socket
```

### Idempotencia

```typescript
// Tabla webhook_events previene duplicados
const existing = await db.webhook_events.findUnique({
  where: { external_id: wompi_event_id },
});

if (existing) {
  // Ya procesamos este evento
  return res.status(200).json({ message: 'Already processed' });
}

// Procesar por primera vez
await db.webhook_events.create({ ... });
```

---

## Database Security

### Contraseñas y Datos Sensibles

```sql
-- NUNCA almacenes passwords (Supabase Auth lo maneja)
-- NUNCA almacenes números de tarjeta (Wompi lo maneja)
-- NUNCA almacenes SSN/cédula sin encripción

-- Si necesitas encriptar:
CREATE EXTENSION pgcrypto;

INSERT INTO profiles (email, encrypted_data)
VALUES ('user@example.com', pgp_sym_encrypt('secret', 'password'));
```

### Backups y Recuperación

- Supabase hace backups automáticos
- Se pueden restaurar desde dashboard
- Verificar política de retención

### Acceso a Base de Datos

```
Development:
  - User: dev_user (limited privileges)
  - Password: desde .env.local
  
Production:
  - User: Supabase managed
  - Access: only via Service Role (backend) or Supabase Auth (client)
```

---

## Audit Logging

### Tabla audit_logs

```typescript
interface AuditLog {
  id: string;
  actor_id: string | null; // quien hizo la acción
  action: 'LOGIN' | 'LEGAL_ACCEPTED' | 'SIGNATURE_CREATED' | 'PAYMENT_CREATED' | 'PAYMENT_APPROVED' | ...
  resource_type: 'PROFILE' | 'SUSCRIPCION' | 'PAGO' | ...
  resource_id: string;
  metadata: {
    ip?: string;
    user_agent?: string;
    old_value?: any;
    new_value?: any;
  };
  created_at: timestamp;
}
```

### Acciones Críticas a Registrar

```
- LOGIN: usuario se autenticó
- LEGAL_ACCEPTED: usuario aceptó términos
- SIGNATURE_CREATED: usuario firmó contrato
- PAYMENT_CREATED: se creó un pago
- PAYMENT_APPROVED: pago fue aprobado
- PAYMENT_FAILED: pago falló
- SUBSCRIPTION_ACTIVATED: suscripción está activa
- SUBSCRIPTION_CANCELLED: suscripción fue cancelada
- DOCUMENT_ACCESSED: usuario accedió a documento privado
- ADMIN_ACTION: cambio administrativo
```

### Recuperar Auditoría

```typescript
// Obtener historial de usuario
const logs = await db.audit_logs.findMany({
  where: { actor_id: user_id },
  orderBy: { created_at: 'desc' },
});

// Obtener historial de un pago
const logs = await db.audit_logs.findMany({
  where: {
    resource_type: 'PAGO',
    resource_id: payment_id,
  },
});
```

---

## Legal & Contracts

### Versionamiento de Contratos

```typescript
interface Contrato {
  id: string;
  tipo: 'TERMINOS_SERVICIO' | 'POLITICA_PRIVACIDAD';
  version: string; // "1.0", "1.1", "2.0"
  storage_path: string; // /contratos/terminos_v1.0.pdf
  hash_documento: string; // SHA256
  created_at: timestamp;
}
```

### Firma y Aceptación

```typescript
interface Firma {
  id: string;
  contrato_id: string;
  usuario_id: string;
  version_documento: string; // qué versión se firmó
  hash_documento: string; // verificar que no cambió
  timestamp: timestamp;
  ip_address: string;
  user_agent: string;
  otp_verified: boolean; // se verificó OTP
  accepted: boolean; // true si aceptó
}
```

### Verificación de Integridad

```typescript
import crypto from 'crypto';

// Generar hash del documento
function documentHash(content: Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Al crear firma
const hash = documentHash(contractContent);
const firma = await db.firmas.create({
  data: {
    contrato_id,
    usuario_id,
    hash_documento: hash,
    // ...
  },
});

// Al verificar más tarde
const firma = await db.firmas.findUnique({ where: { id } });
const hashNow = documentHash(contractContentNow);
if (firma.hash_documento !== hashNow) {
  throw new Error('Contract has been modified');
}
```

---

## Incident Response

### En caso de leak

1. Alertar equipo de seguridad
2. Revocar credenciales comprometidas inmediatamente
3. Cambiar claves de Wompi
4. Auditar logs (¿cuándo se filtró?)
5. Notificar a usuarios afectados
6. Investigar causa raíz

### En caso de fallo de pago

1. Registrar en audit_logs
2. NO activar suscripción
3. Guardar webhook payload completo
4. Investigar con Wompi
5. Usuario puede reintentar

---

## Checklist de Seguridad

- [ ] Todos los secretos en .env, no en código
- [ ] NUNCA NEXT_PUBLIC_ para secrets
- [ ] RLS habilitado en todas las tablas sensibles
- [ ] Middleware valida autenticación
- [ ] Zod valida todas las entradas
- [ ] Webhooks verifican firma
- [ ] Webhooks son idempotentes
- [ ] Audit logs registran acciones críticas
- [ ] HTTPS en producción (Vercel por defecto)
- [ ] Backups configurados
- [ ] No hay números mágicos (todo en config)
- [ ] Contratos versionados y hashados
- [ ] Firmas registran quién, cuándo, cómo
- [ ] Pagos NO se activan sin webhook
- [ ] Service Role Key solo en backend

---

## Referencias

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Next.js Security: https://nextjs.org/docs/going-to-production/security
- Supabase Security: https://supabase.com/docs/guides/auth
- Wompi Webhooks: https://docs.wompi.co/webhooks
