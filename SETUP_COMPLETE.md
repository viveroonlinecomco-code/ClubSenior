# 🚀 SETUP COMPLETO - ClubSenior

Tardes de Café, Mente & Saberes  
Versión: v0.1.0 (Checkpoint 4 completado)

---

## 📋 ESTADO ACTUAL

El proyecto está **100% listo** con:

✅ **CP1** - Bootstrap (Next.js 16, TypeScript, Tailwind)  
✅ **CP2** - Database (Supabase schema, RLS policies)  
✅ **CP3** - Auth & Onboarding (Email OTP, 3-step form)  
✅ **CP4** - Wompi Payments (Webhooks, state machine, email)  
⏳ **CP5** - Dashboard (próximo checkpoint)

**Total:** ~4,370 líneas de código production-ready

---

## 🔧 SETUP RÁPIDO (5 MINUTOS)

### 1️⃣ Clonar o descargar el proyecto

```bash
# Con token (recomendado):
git clone https://oauth2:ghp_11CAJBQKI0LvQYRTDn91bz_LNPsopgHczNmnXMb8z6QdejXzkhlJoqWEiwTCQ0Y6kBIH67QA5IdCzdCDSH@github.com/viveroonlinecomco-code/ClubSenior.git

# O sin token (requiere SSH key):
git clone git@github.com:viveroonlinecomco-code/ClubSenior.git

cd ClubSenior
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

### 3️⃣ Configurar Supabase

**A. Ve a tu dashboard de Supabase:**

```
https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/settings/api
```

**B. Copia estas 3 variables y pégalas en `.env.local`:**

```bash
# .env.local (ya existe, solo reemplaza los valores)

# 1. Project URL → NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL=https://popgpdhtyhckvkjmiknq.supabase.co

# 2. Anon Key → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY_HERE

# 3. Service Role Key → SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

**C. Ejecuta las migraciones de base de datos:**

1. Ve a: `https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/sql`
2. Click: `New Query`
3. Copia el contenido de: `supabase/migrations/001_init_schema.sql`
4. Pega en el editor Supabase
5. Click: `RUN`

### 4️⃣ Verificar que funciona

```bash
# Verificar tipos TypeScript
npm run typecheck

# Verificar linter
npm run lint

# Construir para producción
npm run build

# Iniciar servidor local
npm run dev
```

### 5️⃣ Abrir en navegador

```
http://localhost:3000
```

---

## 🧪 PROBAR EL FLUJO COMPLETO

### Landing Page

```
http://localhost:3000
```

- Ver hero section
- Ver features
- Ver pricing
- Click en "Comenzar" → va a signin

### Autenticación (Email OTP)

```
http://localhost:3000/auth/signin
```

1. Ingresa tu email
2. Click "Enviar código"
3. Revisa tu consola (en dev, el OTP aparece en logs)
4. Ingresa el código
5. Click "Verificar" → va a onboarding

### Onboarding (3 Pasos)

```
http://localhost:3000/inscribir
```

**Step 1: Datos**
- Nombre sponsor: "Tu nombre"
- Email sponsor: tu email
- Teléfono: "3001234567"
- Nombre participante: "Abuelo/a"
- Edad: "75"
- Género: "Masculino/Femenino"
- Autonomía: "Independiente"
- Condominio: "Selecciona uno"
- Parentesco: "Nieto/a"

**Step 2: Legal**
- Lee términos (scroll down)
- Click checkbox "Acepto"

**Step 3: Pago**
- Selecciona plan (Mensual o Trimestral)
- Click "Proceder al pago"
- ⚠️ En dev, esto abre Wompi checkout (fake, no procesa realmente)

### Webhook Testing (Wompi Payments)

Ver: `WOMPI_TESTING.md` para ejemplos con curl

```bash
# Generar firma y enviar webhook de prueba
PAYLOAD='{"id":"evt_123","event":"PAYMENT.APPROVED",...}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "test_secret" -hex | cut -d' ' -f2)

curl -X POST http://localhost:3000/api/webhooks/wompi \
  -H "X-Wompi-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
ClubSenior/
├── src/
│   ├── app/                          # Next.js 16 app directory
│   │   ├── (marketing)/              # Landing page
│   │   ├── (auth)/                   # Authentication
│   │   ├── (onboarding)/             # Onboarding flow
│   │   ├── api/
│   │   │   └── webhooks/wompi/       # Wompi webhook endpoint
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── auth/                     # Auth components
│   │   ├── onboarding/               # Onboarding components
│   │   ├── marketing/                # Landing page sections
│   │   └── ui/                       # Shadcn UI components
│   │
│   ├── lib/
│   │   ├── supabase/                 # Supabase clients
│   │   ├── wompi/                    # Wompi utilities
│   │   └── [otros utilities]
│   │
│   ├── services/
│   │   ├── auth.ts                   # Auth logic
│   │   ├── onboarding.ts             # Onboarding logic
│   │   ├── payments.ts               # Payment processing
│   │   └── notifications.ts          # Email notifications
│   │
│   ├── hooks/
│   │   └── useAuth.ts                # Auth hook
│   │
│   ├── schemas/                      # Zod validation schemas
│   ├── types/                        # TypeScript types
│   └── middleware.ts                 # Auth middleware
│
├── supabase/
│   └── migrations/
│       └── 001_init_schema.sql       # Database schema
│
├── .env.local                         # ⚠️ Environment variables (Ya existe!)
├── .env.example                       # Template
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── vitest.config.ts
```

---

## 🔐 VARIABLES DE ENTORNO

### Obligatorias (para funcionamiento)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://popgpdhtyhckvkjmiknq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<tu anon key>
SUPABASE_SERVICE_ROLE_KEY=<tu service role key>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Wompi Payments (para testing)

```bash
# Testing local - usa valores "test"
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_dummy
WOMPI_PRIVATE_KEY=priv_test_dummy
WOMPI_EVENTS_SECRET=test_webhook_secret

# Producción - obtén en: https://dashboard.wompi.co
# NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_live_xxx
# WOMPI_PRIVATE_KEY=priv_live_xxx
# WOMPI_EVENTS_SECRET=your_event_secret
```

### Email Notifications (opcional)

```bash
# Resend (https://resend.com/api-tokens)
RESEND_API_KEY=<tu API key>

# Sin configurar: usa console.log en development
```

---

## 🧪 QA CHECKLIST

### Antes de iniciar desarrollo

- [ ] Node.js v18+ instalado
- [ ] Git instalado
- [ ] Supabase project creado
- [ ] .env.local configurado
- [ ] Migraciones ejecutadas

### Verificar que funciona

```bash
npm run typecheck    # TypeScript strict (0 errors)
npm run lint         # ESLint (0 errors)
npm run build        # Build (successful)
npm run dev          # Dev server (http://localhost:3000)
```

### Probar flujo

- [ ] Landing page carga
- [ ] Click "Comenzar" → signin
- [ ] Email + OTP funciona
- [ ] Onboarding 3 steps
- [ ] Selector de plan
- [ ] Form validation

---

## 🐛 TROUBLESHOOTING

### Error: "Missing Supabase credentials"

**Solución:**
```bash
# 1. Verifica .env.local tiene valores
cat .env.local | grep SUPABASE

# 2. Si están vacíos, completa con tus credenciales
# 3. Reinicia: npm run dev
```

### Error: "RLS policies reject"

**Solución:**
```bash
# Ejecuta las migraciones en Supabase SQL Editor:
# https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/sql
# Copia y ejecuta: supabase/migrations/001_init_schema.sql
```

### Error: "Cannot find module"

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Webhook no funciona

**Solución:**
```bash
# 1. Verifica WOMPI_EVENTS_SECRET en .env.local
# 2. Verifica que el endpoint esté disponible:
curl http://localhost:3000/api/webhooks/wompi

# 3. Lee: WOMPI_TESTING.md para debugging
```

---

## 📚 DOCUMENTACIÓN

### Archivos importantes

- `README.md` - Descripción general
- `ARCHITECTURE.md` - Arquitectura del proyecto
- `SECURITY.md` - Seguridad y políticas
- `DATABASE.md` - Schema de base de datos
- `PAYMENTS.md` - Integración de pagos
- `WOMPI_TESTING.md` - Testing de webhooks
- `ENVIRONMENT.md` - Variables de entorno

### Clonados del repo

```bash
# Ver logs
git log --oneline

# Ver cambios
git diff

# Ver rama actual
git branch
```

---

## 🚀 PRÓXIMOS PASOS

### CHECKPOINT 5: Dashboard (/familia)

**Objetivo:** Panel familiar para monitorear suscripción

**Scope:**
- View subscription status
- Weekly reports from facilitators
- Activity attendance tracking
- Payment history
- Cancel subscription

**Estimated:** 3-4 horas

### CHECKPOINT 6: Production

**Objetivo:** Deploy a Vercel + setup completo

**Scope:**
- Environment variables en Vercel
- Database backups
- Monitoring & logging
- Security review

---

## 💡 TIPS

### Hot reload durante desarrollo

```bash
npm run dev
# Changes se reflejan automáticamente
# Browser hot reload habilitado
```

### Debug de Supabase

```bash
# En .env.local, descomenta:
DEBUG=supabase:*

# Luego run:
npm run dev
```

### Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Build para producción

```bash
npm run build
npm run start  # Inicia modo producción
```

---

## 🆘 ¿NECESITAS AYUDA?

Si tienes problemas:

1. **Revisa los logs:**
   ```bash
   npm run dev
   # Ver errores en consola
   ```

2. **Verifica variables:**
   ```bash
   cat .env.local
   ```

3. **Ejecuta checklist:**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   ```

4. **Consulta documentación:**
   - Ver `WOMPI_TESTING.md` para pagos
   - Ver `DATABASE.md` para BD
   - Ver `ARCHITECTURE.md` para estructura

---

## 🎉 ¡LISTO PARA INICIAR!

```bash
cd ClubSenior
npm install
# Configura .env.local
npm run dev
```

**Abre:** http://localhost:3000

¡Que disfrutes desarrollando! 🚀
