# Database Schema — Tardes de Café, Mente & Saberes

## Overview

PostgreSQL database hosted on **Supabase** with complete schema, Row Level Security (RLS), and audit logging.

**Key principles:**
- All tables have RLS enabled
- Users can only access their own data
- Service Role Key (backend) bypasses RLS for admin operations
- All sensitive operations are audited
- Webhook events store full payload for debugging

---

## Database Structure

### Core Tables

#### `profiles`
- Mirrors Supabase `auth.users`
- Contains user metadata (email, phone, name, avatar)
- Foreign key to `auth.users.id`

```
profiles
├── id (UUID, PK, FK auth.users)
├── email (UNIQUE)
├── phone
├── full_name
├── avatar_url
├── created_at
└── updated_at
```

#### `condominios`
- Locations where activities happen
- Stores admin contact info for coordination

```
condominios
├── id (UUID, PK)
├── nombre
├── ubicacion
├── ciudad
├── contacto_admin_*
├── activo
└── timestamps
```

#### `family_relationships`
- Links sponsors (who pay) to participantes (elderly)
- Tracks relationship type (hijo, nieto, etc.)

```
family_relationships
├── id (UUID, PK)
├── sponsor_id (FK profiles)
├── participante_id (FK profiles)
├── parentesco
├── es_pagador (boolean)
└── timestamps
```

#### `participantes`
- Adult participants (target audience)
- Must have autonomía motriz (motor autonomy)
- Links to condominio

```
participantes
├── id (UUID, PK, FK profiles)
├── condominio_id (FK)
├── nombre
├── edad (50-120)
├── genero
├── tiene_autonomia_motriz (required!)
├── notas
├── activo
└── timestamps
```

#### `planes`
- Pricing plans (monthly, quarterly, annual)
- Current: COP $160,000/month

```
planes
├── id (UUID, PK)
├── nombre (UNIQUE)
├── descripcion
├── precio_cop (in cents)
├── frecuencia (mensual|trimestral|anual)
├── duracion_dias
├── activo
└── timestamps
```

#### `suscripciones` (STATE MACHINE)
- Subscription lifecycle
- Tracks state transitions

```
suscripciones
├── id (UUID, PK)
├── participante_id (FK)
├── plan_id (FK)
├── sponsor_id (FK, who pays)
├── estado (STARTED → ACTIVE → CANCELLED)
├── fecha_inicio
├── fecha_fin
├── fecha_cancelacion
├── razon_cancelacion
└── timestamps
```

**States:**
```
STARTED
  ↓ (user completes data)
DATA_COMPLETED
  ↓ (user accepts terms)
LEGAL_ACCEPTED
  ↓ (user initiates payment)
PAYMENT_PENDING
  ├→ PAYMENT_APPROVED (webhook OK)
  │    ↓ (automatic)
  │    ACTIVE
  └→ PAYMENT_FAILED (webhook error)
       ↓ (user can retry)
       PAYMENT_PENDING
```

#### `pagos`
- Payment transactions via Wompi
- Stores full Wompi response in metadata

```
pagos
├── id (UUID, PK)
├── suscripcion_id (FK)
├── monto_cop
├── referencia_wompi (UNIQUE)
├── estado (PENDING|APPROVED|FAILED|REFUNDED)
├── metadata_wompi (JSONB)
├── intento_numero
├── created_at
├── updated_at
└── processed_at (when webhook was processed)
```

#### `contratos` (VERSIONED)
- Legal documents stored in Supabase Storage
- Versions are tracked (1.0, 1.1, 2.0)

```
contratos
├── id (UUID, PK)
├── tipo (TERMINOS_SERVICIO|POLITICA_PRIVACIDAD|AUTORIZACION_DATOS)
├── version (e.g., "1.0")
├── titulo
├── descripcion
├── storage_path (private bucket)
├── hash_documento (SHA256)
├── activo
└── timestamps
```

#### `firmas` (AUDITABLE)
- User acceptance of contracts
- Records IP, user agent, OTP verification
- Stores document hash to detect tampering

```
firmas
├── id (UUID, PK)
├── contrato_id (FK)
├── usuario_id (FK)
├── version_documento (what version was signed)
├── hash_documento (integrity check)
├── timestamp
├── ip_address
├── user_agent
├── otp_verificado
├── aceptado (true if accepted)
└── created_at
```

#### `actividades`
- Weekly activities/sessions for participants
- Tracks facilitator, module, timing

```
actividades
├── id (UUID, PK)
├── condominio_id (FK)
├── titulo
├── descripcion
├── fecha (date)
├── hora_inicio (time)
├── hora_fin (time)
├── facilitador_id (FK, optional)
├── modulo (e.g., "mentoría_plateada")
└── timestamps
```

#### `asistencias`
- Attendance tracking per activity
- Links participante to actividad

```
asistencias
├── id (UUID, PK)
├── actividad_id (FK)
├── participante_id (FK)
├── asistio (boolean)
├── observaciones
└── created_at
```

#### `reportes_semanales`
- Weekly summary reports
- AI-generated summaries possible

```
reportes_semanales
├── id (UUID, PK)
├── participante_id (FK)
├── semana_inicio (Monday)
├── semana_fin (Sunday)
├── actividades_realizadas
├── asistencias
├── inasistencias
├── observaciones
├── calificacion_general (1-5)
├── resumen (text)
└── created_at
```

#### `notificaciones`
- Abstracted notification system
- Supports email, SMS, WhatsApp, push, in-app

```
notificaciones
├── id (UUID, PK)
├── usuario_id (FK)
├── tipo (EMAIL|SMS|WHATSAPP|PUSH|IN_APP)
├── asunto
├── contenido
├── leida
├── enviada
├── fecha_envio
└── created_at
```

#### `webhook_events` (IDEMPOTENCY)
- Stores every webhook received
- Prevents duplicate processing

```
webhook_events
├── id (UUID, PK)
├── proveedor (wompi|...)
├── evento_id_externo (UNIQUE, external event ID)
├── evento_tipo (e.g., PAYMENT.APPROVED)
├── payload (JSONB, full payload)
├── procesado
├── resultado
├── error
├── intento_numero
├── fecha_procesamiento
└── created_at
```

#### `audit_logs`
- Complete audit trail of all critical actions
- Immutable (append-only)

```
audit_logs
├── id (UUID, PK)
├── actor_id (FK, who did it)
├── accion (LOGIN|PAYMENT_CREATED|etc)
├── resource_type (PROFILE|PAGO|etc)
├── resource_id
├── metadata (JSONB, arbitrary data)
└── created_at
```

---

## Row Level Security (RLS)

### Principle

Users can **only** access data they own or are related to. Even if they know an ID, they cannot query it.

### Current Policies

#### `profiles`
- **SELECT:** Users see only their own profile
- **UPDATE:** Users update only their own profile
- **Service Role:** Can read/write all profiles

#### `suscripciones`
- **SELECT:** Sponsors see subscriptions they own
- **SELECT:** Participantes see their own subscriptions
- Non-owners: blocked

#### `pagos`
- **SELECT:** Users see payments for their subscriptions
- Non-owners: blocked

#### `firmas`
- **SELECT:** Users see only their own signatures
- Non-owners: blocked

#### `audit_logs`
- **SELECT:** Users see only logs about themselves
- **Service Role:** Admin can see all logs

#### `notificaciones`
- **SELECT:** Users see only their own notifications
- **UPDATE:** Users mark only their own as read
- Non-owners: blocked

#### `webhook_events`
- **SELECT:** No policy (not accessible from client)
- **Service Role:** Backend only

### Verification

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname='public'
ORDER BY tablename;

-- List all policies
SELECT tablename, policyname, permissive, roles 
FROM pg_policies
ORDER BY tablename, policyname;

-- Test a policy (as authenticated user)
SELECT * FROM suscripciones 
WHERE id = 'known-id-but-not-mine';
-- Result: () empty - RLS blocked it
```

---

## Migrations

### Running Migrations

#### In Supabase Dashboard

1. Go to SQL Editor
2. Copy entire content from `supabase/migrations/001_init_schema.sql`
3. Execute
4. Verify in Table Editor that tables are created

#### Via Supabase CLI (future)

```bash
supabase db push
```

### Migration Workflow

1. Create new file: `supabase/migrations/002_feature_name.sql`
2. Write migration SQL
3. Test locally (if using `supabase start`)
4. Deploy to production via dashboard
5. Document changes in this file

---

## Seeding Sample Data

After running migrations, optionally insert sample data:

```sql
-- Sample condominio
INSERT INTO condominios (nombre, ubicacion, ciudad, contacto_admin_nombre, contacto_admin_email, contacto_admin_phone)
VALUES ('Conjunto Sabanero', 'Calle 1 #2-3', 'Cajicá', 'Juan Pérez', 'juan@ejemplo.com', '+573001234567');

-- Sample planes (already in migration)

-- Sample profiles (require auth.users entry first)
-- This is normally done via Supabase Auth flows

-- Sample actividad
INSERT INTO actividades (condominio_id, titulo, descripcion, fecha, hora_inicio, hora_fin, modulo)
SELECT id, 'Tardes de Café Inaugural', 'Primera sesión del programa', CURRENT_DATE + INTERVAL '5 days', '14:00', '18:00', 'general'
FROM condominios LIMIT 1;
```

---

## Indexes

Key indexes for performance:

```
condominios
  - ciudad (frequent filter)
  - activo (status filter)

family_relationships
  - sponsor_id (find sponsors)
  - participante_id (find participantes)

participantes
  - condominio_id (filter by location)
  - activo (status)

suscripciones
  - participante_id (find subscriptions)
  - sponsor_id (find who pays)
  - estado (state machine tracking)

pagos
  - suscripcion_id (find payments)
  - referencia_wompi (webhook lookup)
  - estado (track approvals)

firmas
  - usuario_id (user's signatures)
  - contrato_id (contract versions)

actividades
  - condominio_id (location filter)
  - fecha (date range queries)

webhook_events
  - evento_id_externo (idempotency check)
  - procesado (retry logic)

audit_logs
  - actor_id (user activity)
  - resource_type + resource_id (what changed)
  - accion (event type)
  - created_at (time range)
```

---

## Backup & Recovery

Supabase handles backups automatically.

### Backup Schedule
- Hourly backups (24 hours retention)
- Daily backups (30 days retention)
- Monthly backups (365 days retention)

### Restore from Backup
1. Go to Supabase Project Settings
2. Backups → Restore
3. Select date
4. Confirm (creates new database, requires data migration)

### Manual Export

```bash
# Export via Supabase CLI
supabase db pull

# Or via pg_dump
pg_dump "postgresql://user:pass@project.supabase.co:5432/postgres" > backup.sql
```

---

## Production Considerations

### Pre-Launch Checklist

- [ ] RLS policies verified and tested
- [ ] All indexes created
- [ ] Audit logging in place
- [ ] Backup schedule confirmed
- [ ] No test data in production
- [ ] Service Role Key secured (Vercel env vars)
- [ ] Database connection string uses minimal privileges
- [ ] HTTPS only (Supabase enforces)

### Monitoring

Monitor from Supabase Dashboard:
- Query performance
- Disk usage
- Connection count
- Slow queries

### Scaling

If performance degrades:
1. Review slow query logs
2. Add indexes on WHERE clauses
3. Partition large tables (audit_logs, notifications)
4. Consider read replicas for reporting

---

## Common Queries

### Find all subscriptions for a sponsor

```sql
SELECT s.* 
FROM suscripciones s
WHERE s.sponsor_id = 'user-uuid'
ORDER BY s.created_at DESC;
```

### Get payment history

```sql
SELECT p.*, s.participante_id
FROM pagos p
JOIN suscripciones s ON p.suscripcion_id = s.id
WHERE s.sponsor_id = 'user-uuid'
ORDER BY p.created_at DESC;
```

### Check webhook idempotency

```sql
SELECT * FROM webhook_events
WHERE evento_id_externo = 'wompi-event-id';
-- If exists: already processed
-- If not: process new webhook
```

### Generate weekly reports

```sql
INSERT INTO reportes_semanales (participante_id, semana_inicio, semana_fin, actividades_realizadas, asistencias)
SELECT 
  p.id,
  DATE_TRUNC('week', a.fecha)::DATE,
  DATE_TRUNC('week', a.fecha)::DATE + INTERVAL '6 days',
  COUNT(DISTINCT a.id),
  SUM(CASE WHEN ast.asistio THEN 1 ELSE 0 END)
FROM participantes p
LEFT JOIN actividades a ON a.condominio_id = p.condominio_id AND a.fecha >= CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN asistencias ast ON ast.actividad_id = a.id AND ast.participante_id = p.id
GROUP BY p.id, DATE_TRUNC('week', a.fecha)
ON CONFLICT (participante_id, semana_inicio) DO UPDATE
SET actividades_realizadas = EXCLUDED.actividades_realizadas,
    asistencias = EXCLUDED.asistencias;
```

### Audit trail for a user

```sql
SELECT * FROM audit_logs
WHERE actor_id = 'user-uuid'
ORDER BY created_at DESC
LIMIT 50;
```

---

## References

- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Backup & Recovery](https://supabase.com/docs/guides/platform/backups)
- PostgreSQL: https://www.postgresql.org/docs/
