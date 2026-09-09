# Architecture — Tardes de Café, Mente & Saberes

## Overview

"Tardes de Café, Mente & Saberes" es una plataforma web B2C/B2B2C diseñada para conectar adultos mayores con actividades de acompañamiento y tranquilidad para sus familias.

**Stack técnico obligatorio:**
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn/UI
- Backend/BaaS: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- Pagos: Wompi
- Hosting: Vercel
- VCS: GitHub + GitHub Actions

---

## Project Structure

```
src/
├── app/
│   ├── (marketing)/         # Ruta pública: landing, hero, valor
│   ├── (auth)/              # Ruta: login, registro, OTP
│   ├── (onboarding)/        # Ruta: 3 steps de inscripción
│   ├── (dashboard)/         # Ruta: /familia - datos protegidos
│   └── api/
│       └── webhooks/wompi/  # POST /api/webhooks/wompi
│
├── components/
│   ├── ui/                  # Shadcn/UI components
│   ├── marketing/           # Componentes landing
│   ├── onboarding/          # Componentes inscripción
│   └── dashboard/           # Componentes dashboard
│
├── lib/
│   ├── supabase/            # client.ts, server.ts, middleware.ts
│   ├── payments/            # Lógica de pagos Wompi
│   ├── auth/                # Autenticación (passwordless)
│   ├── legal/               # Manejo de contratos y firmas
│   └── validations/         # Esquemas Zod
│
├── services/
│   ├── subscriptions/       # Máquina de estados suscripción
│   ├── payments/            # Procesamiento de pagos
│   ├── reports/             # Reportes semanales
│   └── notifications/       # Abstracción de notificaciones
│
├── schemas/                 # Esquemas Zod tipados
├── types/                   # TypeScript interfaces compartidas
├── hooks/                   # React hooks personalizados
└── utils/                   # Funciones de utilidad

```

---

## Technology Decisions

### Server Components por defecto

Utilizamos **Next.js Server Components** por defecto. Client Components solo cuando sea necesario para:
- Interacción del usuario (botones, formularios)
- Estado local
- APIs del navegador

**Razón:** Reducción de JavaScript en navegador, mejor seguridad (secretos no expuestos).

### Validación en capas

1. **Frontend (Zod + React Hook Form):** UX inmediata
2. **Backend (Zod):** Validación autoritativa
3. **Database (constraints):** Última línea de defensa

**Nunca** confiar únicamente en validación del frontend.

### Row Level Security (RLS)

PostgreSQL RLS debe estar activado en TODAS las tablas sensibles:
- perfiles
- participantes
- suscripciones
- pagos
- contratos
- reportes

Un usuario no puede consultar datos de otro usuario, incluso si tiene el ID.

### Passwordless Authentication

Flujo inicial (OTP vía email/SMS):
```
Usuario → Email → OTP → Supabase Auth → Session → Dashboard
```

No implementar múltiples proveedores simultáneamente en MVP.

### Payment Idempotency

Wompi webhooks pueden llegar múltiples veces.

Cada webhook event tiene un ID único. Si llega dos veces:
- Primera: procesar
- Segunda: reconocer, no duplicar

---

## Security Principles

### Secrets Management

**NUNCA expongas:**
```
SUPABASE_SERVICE_ROLE_KEY
WOMPI_PRIVATE_KEY
WOMPI_EVENTS_SECRET
```

**NUNCA uses `NEXT_PUBLIC_` para secretos.**

Secrets del servidor van en:
```
.env.local (development)
Vercel Environment Variables (production)
```

### API Security

- Valida firmas de webhook Wompi
- Valida estructuras de payload con Zod
- Logs de auditoría para acciones críticas
- Nunca actualices suscripciones sin webhook verificado

### Database Security

- RLS activo
- Service Role Key solo en servidor
- Migraciones versionadas
- Backups automáticos en Supabase

---

## Data Model (PostgreSQL)

### Tablas críticas (MVP)

```
profiles
├── id (UUID, PK)
├── email
├── phone
├── created_at
├── updated_at

condominios
├── id (UUID, PK)
├── nombre
├── ubicacion
├── contacto_admin

family_relationships
├── id (UUID, PK)
├── sponsor_id (FK profiles)
├── participante_id (FK profiles)
├── parentesco

participantes
├── id (UUID, PK)
├── condominio_id (FK condominios)
├── nombre
├── edad
├── created_at

suscripciones
├── id (UUID, PK)
├── participante_id (FK participantes)
├── plan_id (FK planes)
├── estado (STARTED | DATA_COMPLETED | LEGAL_ACCEPTED | PAYMENT_PENDING | PAYMENT_APPROVED | ACTIVE | PAYMENT_FAILED | CANCELLED)
├── fecha_inicio
├── fecha_fin

pagos
├── id (UUID, PK)
├── suscripcion_id (FK suscripciones)
├── monto
├── referencia_wompi
├── estado (PENDING | APPROVED | FAILED)
├── created_at

contratos
├── id (UUID, PK)
├── tipo (TERMINOS_SERVICIO | POLITICA_PRIVACIDAD)
├── version
├── storage_path
├── hash_documento
├── created_at

firmas
├── id (UUID, PK)
├── contrato_id (FK contratos)
├── usuario_id (FK profiles)
├── hash_documento
├── timestamp
├── ip_address
├── user_agent
├── otp_verified
├── accepted

audit_logs
├── id (UUID, PK)
├── actor_id (FK profiles, nullable)
├── action
├── resource_type
├── resource_id
├── metadata (JSONB)
├── created_at

webhook_events
├── id (UUID, PK)
├── evento_id_externo (único)
├── proveedor (wompi)
├── payload (JSONB)
├── procesado
├── created_at
```

---

## State Machine: Onboarding

```
STARTED
  ↓ (usuario completa datos básicos)
DATA_COMPLETED
  ↓ (usuario acepta términos + OTP)
LEGAL_ACCEPTED
  ↓ (usuario inicia pago)
PAYMENT_PENDING
  ├→ PAYMENT_APPROVED (webhook OK)
  │    ↓ (automático)
  │    ACTIVE
  └→ PAYMENT_FAILED (webhook fallido)
       ↓ (usuario puede reintentar)
       PAYMENT_PENDING

CANCELLED (usuario cancela antes de completar)
EXPIRED (timeout)
SUSPENDED (administrativo)
```

---

## API Routes

### Authentication
- `POST /api/auth/signin` — Iniciar login
- `POST /api/auth/verify-otp` — Verificar OTP
- `POST /api/auth/logout` — Logout

### Pagos (Wompi)
- `POST /api/webhooks/wompi` — Recibir eventos de pago

### Protegidas (requieren autenticación)
- `GET /api/familia/perfil` — Datos del usuario
- `GET /api/familia/participante` — Datos del participante
- `GET /api/familia/suscripcion` — Estado de suscripción
- `GET /api/familia/reporte` — Reporte semanal

---

## Performance Considerations

### Optimizations

- Server Components por defecto
- Image optimization con `next/image`
- Lazy loading de componentes
- Database indexes en campos frecuentes (email, participante_id)
- Caching de queries en borde (Vercel Edge)

### Monitoring

- Logs estructurados
- Error reporting
- Performance metrics
- Audit trail completo

---

## Testing Strategy

### Unidad (Vitest)

- Validadores Zod
- Servicios de negocio
- Utilidades

### Integración

- Flujos de pago
- Máquina de estados
- RLS policies

### E2E (futuro)

- Flujo completo onboarding
- Pago completo
- Dashboard

---

## Deployment Pipeline

```
Git Push (feature branch)
  ↓
GitHub Actions CI (lint, typecheck, test, build)
  ↓
If passed, create PR
  ↓
Manual review
  ↓
Merge to develop
  ↓
Deploy to preview (Vercel)
  ↓
Manual QA
  ↓
Merge to main
  ↓
Deploy to production (Vercel)
```

### Ambientes

- **Development:** localhost
- **Preview:** Vercel preview (cada PR)
- **Production:** vercel + Supabase prod

---

## Checkpoints & Milestones

### ✓ CHECKPOINT 1 (CURRENT)
- [x] Bootstrap Next.js
- [x] TypeScript + ESLint
- [x] Tailwind + Shadcn/UI
- [x] Vitest setup
- [x] Git + CI/CD
- [x] Environment variables

### CHECKPOINT 2
- [ ] Supabase configurado
- [ ] Schema PostgreSQL
- [ ] RLS policies
- [ ] Auth middleware

### CHECKPOINT 3
- [ ] Landing page
- [ ] Auth flow
- [ ] Onboarding (3 steps)
- [ ] Legal acceptance

### CHECKPOINT 4
- [ ] Wompi integration
- [ ] Payment webhook
- [ ] Subscription activation
- [ ] Idempotency

### CHECKPOINT 5
- [ ] Family dashboard
- [ ] Reports
- [ ] Activities
- [ ] Attendance tracking

### CHECKPOINT 6
- [ ] Security review
- [ ] Performance review
- [ ] Production deployment
- [ ] Monitoring

---

## References

- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com
- Shadcn/UI: https://ui.shadcn.com
- Wompi: https://docs.wompi.co
- Zod: https://zod.dev
