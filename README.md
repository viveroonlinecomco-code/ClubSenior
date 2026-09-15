# 🎯 Grupo Plateado - Tardes de Café, Mente & Saberes

Plataforma web B2C para gestión de programas de bienestar para adultos mayores en condominios.

**Status:** MVP Funcional - CP5 Fase 6 Completa  
**Live Demo:** https://club-senior.vercel.app  
**GitHub:** https://github.com/viveroonlinecomco-code/Grupo Plateado

---

## 🚀 Características

### ✅ Completadas

- **Autenticación Real** - OTP email via Supabase
- **Onboarding 3 Pasos** - Registro completo de usuarios
- **Dashboard Familiar** - Vista real-time de suscripciones
- **Base de Datos** - PostgreSQL Supabase con RLS
- **Seed Data** - Datos de prueba realistas
- **Facilitadores** - CRUD para gestores
- **Actividades** - Calendario de eventos
- **Email Notifications** - Integración Resend

### 📋 Por Hacer (CP5 Fase 5+)

- [ ] Pagos Wompi (integración real)
- [ ] Admin Panel
- [ ] Mejoras UX/UI
- [ ] Tests automáticos

---

## 🛠️ Stack Técnico

```
Frontend:   Next.js 16 + React 19 + TypeScript + Tailwind CSS + Shadcn/UI
Backend:    Next.js API Routes + Supabase Edge Functions
Database:   PostgreSQL (Supabase) + RLS + Real-time subscriptions
Auth:       Supabase Auth (OTP Email) + JWT
Payments:   Wompi (pendiente integración)
Email:      Resend API
Deploy:     Vercel
Git:        GitHub + GitHub Actions CI/CD
```

---

## 📦 Instalación

### Requisitos

- Node.js 18+
- npm o yarn
- Cuenta Supabase
- Cuenta Vercel (opcional, para deploy)

### Setup Local

```bash
# 1. Clonar repositorio
git clone https://github.com/viveroonlinecomco-code/Grupo Plateado.git
cd Grupo Plateado

# 2. Instalar dependencias
npm install --legacy-peer-deps

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Llenar variables en .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 5. Ejecutar desarrollo
npm run dev

# 6. Abrir navegador
# http://localhost:3000
```

---

## 🗄️ Base de Datos

### Setup Supabase

1. Ir a https://app.supabase.com
2. Crear proyecto nuevo
3. En SQL Editor, ejecutar:

```bash
# Copiar contenido de supabase/migrations/001_init_schema.sql
# Ejecutar en SQL Editor de Supabase
```

4. Luego ejecutar seed data (opcional):

```bash
# En SQL Editor:
# Copiar contenido de scripts/seed-complete.sql
# Ejecutar para cargar datos de prueba
```

### Tablas Principales

```
profiles          → Usuarios
participantes     → Adultos mayores
suscripciones     → Membresías
planes            → Tipos de suscripción
actividades       → Eventos semanales
asistencias       → Registro de presencia
reportes_semanales → Reportes quincenales
pagos             → Historial de transacciones
```

---

## 🔑 Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App
NEXT_PUBLIC_APP_URL=https://club-senior.vercel.app
NODE_ENV=production

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Payments (Wompi)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_xxx
WOMPI_PRIVATE_KEY=priv_test_xxx
WOMPI_EVENTS_SECRET=test_xxx
```

---

## 📄 API Endpoints

### Autenticación

```
POST /api/auth/create-profile
  Input:  { nombreAbuelo, apellidoAbuelo, email, telefono, fechaNacimiento, ciudad }
  Output: { success, profile, participante, condominio }
```

### Suscripciones

```
POST /api/subscriptions/create
  Input:  { planNombre }
  Output: { success, suscripcion, plan }
```

### Dashboard

```
GET /api/dashboard/data
  Output: { user, suscripcion, reportes, asistencias, pagos }
```

### Webhooks

```
POST /api/webhooks/wompi
  Webhook para confirmación de pagos Wompi
```

---

## 🧩 Componentes Clave

### Páginas

- `/` → Landing page
- `/signin` → Login OTP
- `/inscribir` → Onboarding (3 pasos)
- `/verificar-otp` → Verificación de email
- `/familia` → Dashboard familiar

### Hooks Personalizados

```typescript
useAuth()              // Contexto de autenticación
useDashboardData()     // Datos dashboard en tiempo real
```

### Funciones Server

```typescript
// Authentication
createUserProfile()
createParticipante()

// Subscriptions
createSuscripcion()
getSuscripcionForSponsor()
updateSuscripcionStatus()

// Facilitators
createFacilitador()
createActividad()
recordAsistencia()
generateWeeklyReport()

// Email
sendWelcomeEmail()
sendPaymentConfirmationEmail()
sendWeeklyReportEmail()
```

---

## 🔐 Seguridad

### RLS Policies

Todas las tablas tienen Row Level Security:

```sql
-- Usuarios ven solo su perfil
SELECT: id = auth.uid()

-- Sponsors ven solo sus suscripciones
SELECT: sponsor_id = auth.uid()

-- Service Role bypasses RLS (API routes)
```

### Keys

- **Anon Key** (frontend) - Cliente, lectura limitada
- **Service Role Key** (backend) - Admin, acceso completo
- **JWT Tokens** - Sesiones seguras

---

## 📊 Datos de Prueba

### Seed Data Disponible

Ejecutar en SQL Editor Supabase:

```bash
# Archivo: scripts/seed-complete.sql

Crea automáticamente:
- 5 condominios
- 4 facilitadores
- 8 actividades
- 5 participantes
- 5 suscripciones activas
- Reportes y pagos de muestra
```

### Credenciales Test

```
Email:    juan.perez@example.com
Nombre:   Juan Pedro Pérez
Edad:     72 años
Plan:     Individual ($160,000 COP)
Estado:   ACTIVE
```

---

## 🚀 Deployment

### En Vercel

```bash
# 1. Conectar repositorio GitHub
#    https://vercel.com/new

# 2. Configurar variables de entorno
#    Project Settings → Environment Variables

# 3. Deploy automático en cada push a main
#    o manual: npm run build && npm start
```

### Build & Test Local

```bash
# Build
npm run build

# Test
npm run dev

# Linting
npm run lint

# Type check
npm run typecheck
```

---

## 📝 Roadmap

### CP5 Fase 5: Pagos (PRÓXIMO)
- [ ] Integración Wompi real
- [ ] Checkout seguro
- [ ] Confirmación de pago
- [ ] Email de recibo

### B1: Admin Panel
- [ ] Dashboard ejecutivo
- [ ] CRUD usuarios
- [ ] Reportes globales
- [ ] Analytics

### B5: UX/UI Polish
- [ ] Mobile optimization
- [ ] Dark mode
- [ ] Animaciones
- [ ] Accesibilidad (a11y)

### CP6: Producción
- [ ] Dominio real
- [ ] Monitoring
- [ ] Backups diarios
- [ ] Support 24/7

---

## 🤝 Contribuir

```bash
# 1. Fork el repositorio
# 2. Crear rama feature
git checkout -b feature/nombre

# 3. Commits descriptivos
git commit -m "Add: descripción clara"

# 4. Push y crear PR
git push origin feature/nombre
```

---

## 📞 Soporte

- **Email:** soporte@clubsenior.co
- **GitHub Issues:** https://github.com/viveroonlinecomco-code/Grupo Plateado/issues
- **Documentación:** https://docs.clubsenior.co (próximamente)

---

## 📄 Licencia

Propiedad intelectual de Grupo Plateado. Todos los derechos reservados.

---

## 👥 Team

- **Product:** Elena (Founder & CEO)
- **Tech:** Claude (Technical Partner)
- **Launch:** Septiembre 2026

---

**Última actualización:** 10 Septiembre 2026  
**Version:** 0.5.0-beta  
**Next Release:** CP5 Fase 5 (Wompi Payments)
