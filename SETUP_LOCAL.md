# SETUP LOCAL — Grupo Plateado

**Repositorio:** https://github.com/viveroonlinecomco-code/Grupo Plateado  
**Token GitHub:** `ghp_11CAJBQKI0LvQYRTDn91bz_LNPsopgHczNmnXMb8z6QdejXzkhlJoqWEiwTCQ0Y6kBIH67QA5IdCzdCDSH`

---

## PASO 1: Clonar el repositorio en tu máquina

```bash
# Abre Terminal/PowerShell en tu máquina

# Opción A: Con HTTPS + token (más simple)
git clone https://oauth2:ghp_11CAJBQKI0LvQYRTDn91bz_LNPsopgHczNmnXMb8z6QdejXzkhlJoqWEiwTCQ0Y6kBIH67QA5IdCzdCDSH@github.com/viveroonlinecomco-code/Grupo Plateado.git

# Opción B: Con SSH (más seguro, requiere configuración)
git clone git@github.com:viveroonlinecomco-code/Grupo Plateado.git
```

**Resultado esperado:**
```
Cloning into 'Grupo Plateado'...
remote: Enumerating objects: 45, done.
remote: Counting objects: 100% (45/45), done.
...
```

---

## PASO 2: Instalar dependencias

```bash
cd Grupo Plateado

# Instalar npm packages
npm install

# Verificar que todo está OK
npm run typecheck
npm run lint
npm run build
```

**Resultado esperado:**
```
✓ Compiled successfully
✓ All environment variables configured
```

---

## PASO 3: Configurar Supabase (CRÍTICO)

### Crear proyecto Supabase

1. Go to https://supabase.com
2. Sign in / Create account
3. New project:
   - **Name:** Grupo Plateado-Dev
   - **Database password:** [genera contraseña fuerte]
   - **Region:** closest to you (or us-east-1)
4. **Wait for project creation** (2-3 minutos)

### Obtener credenciales

1. Go to Project Settings → API
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Click "Reveal" on service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

### Crear `.env.local`

```bash
# En la carpeta Grupo Plateado, crea .env.local
cp .env.example .env.local

# Edita .env.local con tus valores:
# NEXT_PUBLIC_SUPABASE_URL=https://xyz123.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
# WOMPI_PRIVATE_KEY=priv_test_...
# WOMPI_EVENTS_SECRET=secret_test_...
```

### Ejecutar migraciones

1. Go to Supabase → SQL Editor
2. Click "New query"
3. Paste contenido de `supabase/migrations/001_init_schema.sql`
4. Click "Run"
5. **Verify:** Go to "Tables" → Should see 14 tables (profiles, participantes, etc.)

---

## PASO 4: Ejecutar en desarrollo

```bash
# En carpeta Grupo Plateado
npm run dev

# Open browser
# http://localhost:3000

# Should see:
# "Tardes de Café, Mente & Saberes"
# "En construcción — Checkpoint 1"
```

---

## PASO 5: Verificar rama develop

```bash
# Traer rama develop
git fetch origin develop

# Cambiar a develop
git checkout develop

# Verificar que estás en develop
git branch
# * develop
#   main
```

---

## PASO 6: Crear rama para Checkpoint 3

```bash
# Crear rama feature desde develop
git checkout develop
git pull origin develop

git checkout -b feature/checkpoint-3-auth

# Hacer cambios... (CHECKPOINT 3)

# Push cuando termines
git push origin feature/checkpoint-3-auth

# Crear Pull Request en GitHub
# → Merge a develop
# → Deploy a staging (Vercel preview)
```

---

## ESTRUCTURA DEL PROYECTO

```
Grupo Plateado/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (marketing)/  # Landing page (CHECKPOINT 3)
│   │   ├── (auth)/       # Authentication (CHECKPOINT 3)
│   │   ├── (onboarding)/ # Signup flow (CHECKPOINT 3)
│   │   ├── (dashboard)/  # Family dashboard (CHECKPOINT 5)
│   │   └── api/webhooks/ # Wompi webhooks (CHECKPOINT 4)
│   ├── components/       # React components
│   ├── lib/              # Utilities (Supabase, Auth, Payments)
│   ├── services/         # Business logic
│   ├── schemas/          # Zod validation
│   ├── types/            # TypeScript types
│   ├── hooks/            # Custom hooks
│   └── utils/            # Helpers
├── supabase/
│   └── migrations/       # Database migrations
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
├── DATABASE.md           # Database schema docs
├── ARCHITECTURE.md       # Technical architecture
├── SECURITY.md          # Security policies
├── ENVIRONMENT.md       # Environment setup
├── PAYMENTS.md          # Payment integration
└── README.md            # Quick start

```

---

## CHECKPOINTS

### ✅ CHECKPOINT 1 — DONE
- Next.js 16 + TypeScript
- Tailwind CSS + Shadcn/UI
- ESLint + Vitest
- GitHub Actions CI/CD

**Files:** ~500 lines code

### ✅ CHECKPOINT 2 — DONE
- PostgreSQL schema (14 tables)
- Row Level Security (RLS)
- TypeScript types (339 lines)
- Zod schemas (214 lines)
- Supabase clients + middleware
- Complete documentation

**Files:** ~2,400 lines code

### → CHECKPOINT 3 — NEXT (2-3 horas)
- Landing page (/marketing)
- Email OTP authentication
- Onboarding 3-step form
- Legal document acceptance

**Files:** ~1,500 lines code

### → CHECKPOINT 4 — PENDING
- Wompi payment integration
- Webhook processing
- Signature validation
- Idempotency

### → CHECKPOINT 5 — PENDING
- Family dashboard
- Reports + Activities
- Attendance tracking

### → CHECKPOINT 6 — PENDING
- Security review
- Performance optimization
- Production deployment

---

## COMPILACIÓN & TESTING

```bash
# Lint
npm run lint
# ESLint

# Type check
npm run typecheck
# TypeScript

# Test
npm run test
# Vitest

# Build
npm run build
# Next.js production build

# Dev
npm run dev
# http://localhost:3000
```

---

## GIT WORKFLOW

```bash
# Crear rama feature
git checkout develop
git pull origin develop
git checkout -b feature/feature-name

# Hacer cambios
git add src/...
git commit -m "Description"

# Push
git push origin feature/feature-name

# En GitHub: Create Pull Request
# Review + merge to develop

# Promote a main (cuando esté listo)
git checkout main
git pull origin main
git merge develop
git push origin main
```

---

## COMANDOS ÚTILES

```bash
# Ver branches locales
git branch

# Ver branches en GitHub
git branch -r

# Ver cambios sin stagear
git diff

# Ver historial
git log --oneline | head -20

# Ver estado
git status

# Undo cambios locales
git checkout -- src/file.ts

# Limpiar branches locales
git branch -D feature/old-branch
```

---

## TROUBLESHOOTING

### "Module not found"

```bash
npm install
npm run build
```

### "Supabase connection error"

```
Check .env.local has:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
```

### "TypeScript errors"

```bash
npm run typecheck
# Fix errors shown
npm run lint --fix
```

### "Git conflict"

```bash
git status
# Edit conflicted files
git add .
git commit -m "Resolve conflicts"
git push origin feature/branch
```

---

## PRÓXIMO PASO: CHECKPOINT 3

Cuando estés listo, ejecuta:

```bash
git checkout -b feature/checkpoint-3-auth
```

Entonces:
1. Landing page en `src/app/(marketing)/page.tsx`
2. Auth flow en `src/app/(auth)/signin.tsx`
3. Onboarding en `src/app/(onboarding)/`
4. Legal acceptance en `src/app/(onboarding)/step-2.tsx`

---

**¿Preguntas?** Revisa:
- README.md — Quick start
- ARCHITECTURE.md — Design decisions
- DATABASE.md — Schema details
- SECURITY.md — Safety policies

**¡Listo para comenzar!** 🚀
