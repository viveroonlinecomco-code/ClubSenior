# 🚀 **7-DAY ACTION PLAN - EXECUTION GUIDE**

**Start Date:** September 12, 2026  
**Owner:** Elena  
**Goal:** Security fixes + Activities module live  

---

# 📋 **OVERVIEW**

```
Day 1 (Today):   Security fixes (UUID, CSP, CSRF)         ~ 1 hour
Day 2-3:         Activities implementation                 ~ 4 hours
Day 4-5:         Facilitator admin panel completion        ~ 4 hours
Day 6:           Testing & bug fixes                       ~ 4 hours
Day 7:           Beta onboarding prep                      ~ 2 hours
                                                    TOTAL: ~15 hours
```

---

# 🔴 **DAY 1: SECURITY FIXES (TODAY)**

**Time:** 1 hour  
**Priority:** CRITICAL  

## Task 1.1: Fix UUID Exposure (5 minutes)

**Issue:** User sidebar shows UUID (57f09f82-9733-4173...)

**File to edit:** `src/app/familia/layout.tsx` (or whichever shows user card)

**Before:**
```typescript
<div className="user-card">
  <p className="text-sm text-gray-500">USUARIO</p>
  <p className="font-mono text-xs">{user.id}</p>  {/* ❌ UUID exposed */}
  <p>{user.email}</p>
</div>
```

**After:**
```typescript
<div className="user-card">
  <p className="text-sm text-gray-500">USUARIO</p>
  <p className="font-medium">{user.nombre || user.email.split('@')[0]}</p>  {/* ✅ Name only */}
  <p className="text-sm text-gray-600">{user.email}</p>
</div>
```

**Execute:**
```bash
cd /tmp/ClubSenior
# Edit the file using str_replace or manually
# Then commit:
git add src/app/familia/layout.tsx
git commit -m "Security: Remove UUID from user sidebar - CRITICAL FIX"
git push origin main
```

✅ **Done:** Deploy automatically to Vercel (2-5 min)

---

## Task 1.2: Add CSP Headers (10 minutes)

**Issue:** No Content Security Policy

**File to edit:** `next.config.js`

**Add this:**
```javascript
// next.config.js - Add to module.exports

const nextConfig = {
  // ... existing config ...
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

**Execute:**
```bash
cd /tmp/ClubSenior
git add next.config.js
git commit -m "Security: Add Content Security Policy headers"
git push origin main
```

✅ **Done:** Vercel deploys automatically

---

## Task 1.3: Add CSRF Protection to Auth Endpoints (20 minutes)

**Issue:** POST endpoints vulnerable to CSRF

**File to create:** `src/lib/middleware/csrf.ts`

```typescript
// src/lib/middleware/csrf.ts

import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function validateCSRFToken(req: NextRequest) {
  const origin = headers().get('origin')
  const referer = headers().get('referer')

  const allowedOrigins = [
    'https://club-senior.vercel.app',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ]

  // Only validate on POST/PUT/DELETE from browser (not API clients)
  const contentType = headers().get('content-type')
  if (!contentType?.includes('application/json')) {
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'CSRF validation failed: Invalid origin' },
        { status: 403 }
      )
    }
  }

  return null // CSRF valid
}

// Usage in endpoints:
// const csrfError = await validateCSRFToken(req)
// if (csrfError) return csrfError
```

**File to edit:** `src/app/api/auth/send-otp/route.ts`

```typescript
import { validateCSRFToken } from '@/lib/middleware/csrf'

export async function POST(req: NextRequest) {
  // Add this line at start of function
  const csrfError = await validateCSRFToken(req)
  if (csrfError) return csrfError

  // Rest of endpoint...
}
```

**Apply to these endpoints:**
- `/api/auth/send-otp`
- `/api/auth/verify-otp`
- `/api/auth/register`
- `/api/auth/signin-register`

**Execute:**
```bash
cd /tmp/ClubSenior
git add src/lib/middleware/csrf.ts
# Edit the 4 auth endpoints to add validateCSRFToken call
git add src/app/api/auth/*/route.ts
git commit -m "Security: Add CSRF protection to auth endpoints"
git push origin main
```

✅ **Done:** Vercel auto-deploys

---

## Verification (5 minutes)

```bash
# 1. Check health endpoint
curl https://club-senior.vercel.app/api/health

# 2. Check CSP headers present
curl -I https://club-senior.vercel.app | grep Content-Security-Policy

# 3. Manual test: Login flow works
# - Open /signin
# - Enter email
# - Verify OTP send works
# - Verify verify-otp works
```

✅ **DAY 1 COMPLETE**

---

# 🟢 **DAY 2: DATABASE SETUP**

**Time:** 2 hours  
**Focus:** Database schema + seed data  

## Task 2.1: Update Supabase Schema (15 minutes)

**Execute SQL in Supabase Dashboard** (SQL Editor):

```sql
-- Add missing columns to actividades table
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS objetivo TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS implementos TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS semana INTEGER;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS dia TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_actividades_semana 
ON actividades(semana, dia);
```

✅ **Done:** Columns added

---

## Task 2.2: Create Seed Script (45 minutes)

**File to create:** `src/scripts/seed-activities.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const ACTIVITIES = [
  {
    nombre: 'Movimiento Vital',
    descripcion: 'Actividad física: Calentamiento, movilidad articular, flexibilidad, y vuelta a la calma.',
    tipo: 'Física',
    duracion_minutos: 30,
    objetivo: 'Movilidad, coordinación, resistencia, equilibrio, ánimo e independencia funcional.',
    implementos: 'Sillas, agua, colchonetas opcionales.',
    semana: 1,
    dia: 'Lunes',
  },
  {
    nombre: 'Mente Activa',
    descripcion: 'Actividad cognitiva: Juegos de memoria, trivia, refranes, canciones, fotografías y tertulia sobre recuerdos y experiencias.',
    tipo: 'Cognitiva',
    duracion_minutos: 90,
    objetivo: 'Atención, memoria, lenguaje, evocación, conversación y participación social.',
    implementos: 'Tarjetas, fotografías, música, pantalla/TV, pizarra, juegos de memoria',
    semana: 1,
    dia: 'Miércoles',
  },
  {
    nombre: 'Equilibrio & Energía',
    descripcion: 'Actividad física: Caminata, equilibrio, actividad aeróbica moderada y relajación.',
    tipo: 'Física',
    duracion_minutos: 30,
    objetivo: 'Equilibrio, coordinación, movilidad y apoyo a la autonomía.',
    implementos: 'Sillas, Parlante, conos, colchonetas, agua',
    semana: 2,
    dia: 'Miércoles',
  },
  {
    nombre: 'Pintando Recuerdos',
    descripcion: 'Actividad creativa: Pintura guiada, temas elegidos por el grupo; sobre recuerdos, lugares, naturaleza o conversación libre mientras crean.',
    tipo: 'Creativa',
    duracion_minutos: 90,
    objetivo: 'Creatividad, concentración, expresión personal, autoestima y socialización.',
    implementos: 'Lienzos pequeños, pinturas acrílicas, pinceles, vasos para agua, servilletas, delantales',
    semana: 2,
    dia: 'Viernes',
  },
  {
    nombre: 'Actívate',
    descripcion: 'Actividad física: Coordinación pelota, fuerza funcional adaptada.',
    tipo: 'Física',
    duracion_minutos: 30,
    objetivo: 'Condición física, coordinación, fuerza, movilidad y bienestar.',
    implementos: 'Pelotas suaves, bandas, sillas, parlante, agua',
    semana: 3,
    dia: 'Lunes',
  },
  {
    nombre: 'Club de Amigos',
    descripcion: 'Actividad social: Juegos de mesa y conversación dirigida; cierre con café, té o snack para favorecer vínculos.',
    tipo: 'Social',
    duracion_minutos: 90,
    objetivo: 'Nuevas amistades, pertenencia, conversación, estimulación mental y reducción del aislamiento social.',
    implementos: 'Dominó, cartas, ajedrez, parqués, juegos de estrategia, mesas y sillas',
    semana: 3,
    dia: 'Viernes',
  },
  {
    nombre: 'Baile & Movimiento',
    descripcion: 'Actividad física: Calentamiento, baile de bajo impacto, coreografías sencillas, coordinación y estiramiento.',
    tipo: 'Física',
    duracion_minutos: 30,
    objetivo: 'Coordinación, movilidad, resistencia, equilibrio, diversión y estado de ánimo.',
    implementos: 'Parlante, música, sillas, agua',
    semana: 4,
    dia: 'Jueves',
  },
  {
    nombre: 'Creando Experiencias',
    descripcion: 'Actividad recreativa: Actividad diferente cada mes: karaoke, tarde musical, cine-foro, baile social, invitado especial, fotografía, arte, jardineria o gastronomía.',
    tipo: 'Recreativa',
    duracion_minutos: 90,
    objetivo: 'Diversión, creatividad, conexión social, motivación y nuevas experiencias.',
    implementos: 'Según actividad: parlante, pantalla, micrófono, materiales de taller, etc.',
    semana: 4,
    dia: 'Viernes',
  },
]

async function seed() {
  console.log('🌱 Seeding activities...')

  for (const activity of ACTIVITIES) {
    // Check if activity already exists
    const { data: existing } = await supabase
      .from('actividades')
      .select('id')
      .eq('nombre', activity.nombre)
      .single()

    if (!existing) {
      const { data, error } = await supabase
        .from('actividades')
        .insert([activity])

      if (error) {
        console.error(`❌ Error creating ${activity.nombre}:`, error)
      } else {
        console.log(`✅ Created: ${activity.nombre}`)
      }
    } else {
      console.log(`⏭️  Already exists: ${activity.nombre}`)
    }
  }

  console.log('✨ Seeding complete!')
}

seed().catch(console.error)
```

**Execute:**
```bash
cd /tmp/ClubSenior
npx ts-node src/scripts/seed-activities.ts
```

✅ **Done:** Activities in database

---

## Task 2.3: Verify in Supabase

1. Go to Supabase Dashboard
2. Select ClubSenior project
3. Click "actividades" table
4. Verify 8 activities are there
5. Check columns: nombre, tipo, objetivo, implementos, semana, dia, duracion_minutos

✅ **DAY 2 COMPLETE**

---

# 🟢 **DAY 3: BUILD ACTIVITIES PAGE**

**Time:** 2 hours  
**Focus:** Frontend implementation  

## Task 3.1: Create Activities Page (1 hour)

**File to create:** `src/app/familia/actividades/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Activity {
  id: string
  nombre: string
  descripcion: string
  tipo: string
  duracion_minutos: number
  objetivo: string
  implementos: string
  semana: number
  dia: string
}

const TYPE_COLORS: Record<string, string> = {
  Física: 'bg-red-100 text-red-800',
  Cognitiva: 'bg-blue-100 text-blue-800',
  Creativa: 'bg-purple-100 text-purple-800',
  Social: 'bg-green-100 text-green-800',
  Recreativa: 'bg-yellow-100 text-yellow-800',
}

export default function ActividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('actividades')
          .select('*')
          .order('semana')
          .order('dia')

        if (error) throw error
        setActivities(data || [])
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const filteredActivities = filter
    ? activities.filter((a) => a.tipo === filter)
    : activities

  const groupedByWeek = filteredActivities.reduce((acc, activity) => {
    if (!acc[activity.semana]) {
      acc[activity.semana] = []
    }
    acc[activity.semana].push(activity)
    return acc
  }, {} as Record<number, Activity[]>)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Nuestras Actividades</h1>
          <p className="text-gray-600 mt-2">
            Escolle entre múltiples actividades diseñadas para tu bienestar
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                !filter
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            {['Física', 'Cognitiva', 'Creativa', 'Social', 'Recreativa'].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    filter === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Activities by Week */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {Object.entries(groupedByWeek).map(([week, weekActivities]) => (
          <div key={week} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Semana {week}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weekActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition p-6"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {activity.nombre}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        TYPE_COLORS[activity.tipo] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activity.tipo}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{activity.descripcion}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-700">📅 Día:</span>
                      <span className="text-gray-600">{activity.dia}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-700">⏱️ Duración:</span>
                      <span className="text-gray-600">{activity.duracion_minutos} min</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-semibold text-sm text-blue-900 mb-1">
                      Objetivos:
                    </p>
                    <p className="text-sm text-blue-800">{activity.objetivo}</p>
                  </div>

                  <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-semibold text-sm text-green-900 mb-1">
                      Implementos:
                    </p>
                    <p className="text-sm text-green-800">{activity.implementos}</p>
                  </div>

                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
                    Inscribirse
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Execute:**
```bash
cd /tmp/ClubSenior
git add src/app/familia/actividades/page.tsx
git commit -m "Feature: Add activities browsing page with filters"
git push origin main
```

✅ **Activities page live**

---

## Task 3.2: Add Navigation Link (30 minutes)

**File to edit:** `src/app/familia/layout.tsx`

Find the navigation/sidebar section and add:

```typescript
<Link
  href="/familia/actividades"
  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-100 transition"
>
  📅 Actividades
</Link>
```

**Execute:**
```bash
cd /tmp/ClubSenior
git add src/app/familia/layout.tsx
git commit -m "Feature: Add actividades link to familia navigation"
git push origin main
```

✅ **Navigation updated**

---

## Task 3.3: Manual Testing (30 minutes)

```bash
# 1. Visit app in browser
# Open https://club-senior.vercel.app/familia/actividades

# 2. Test filters
# - Click "Física" filter → show only 4 physical activities
# - Click "Cognitiva" → show only 1
# - Click "Todas" → show all 8

# 3. Test data display
# - Verify activity names correct
# - Verify descriptions shown
# - Verify objectives displayed
# - Verify implementos listed

# 4. Check responsive design
# - Desktop view (2 columns)
# - Tablet view (should stack nicely)
# - Mobile view (1 column)

# 5. Performance check
# - Page should load in < 1 second
# - No console errors
```

✅ **DAY 3 COMPLETE**

---

# 🟡 **DAY 4-5: FACILITADOR ADMIN COMPLETION** (Optional, can defer)

**Time:** 4-5 hours  
**Focus:** Facilitator panel features

## Quick Summary
- Finish "Create Activity" form validation
- Build "Mark Attendance" page
- Build "View Reports" page
- Add CSV bulk upload option

## Implementation Notes
```
/facilitador/dashboard  → Stats overview (DONE)
/facilitador/actividades → List + CRUD (needs finish)
/facilitador/asistencia → Mark attendance (NEW)
/facilitador/reportes → View reports (NEW)
```

**Defer if behind schedule** - Core MVP works without this.

---

# 🟡 **DAY 6: TESTING & BUG FIXES**

**Time:** 4 hours  
**Focus:** Quality assurance

## Testing Checklist

### Security Testing
- [ ] No UUIDs exposed in UI
- [ ] CSP headers present (check with curl)
- [ ] CSRF protection working (try POST from different origin)
- [ ] Rate limiting working (try 5+ OTP requests)

### Functional Testing
- [ ] Signin flow works
- [ ] Inscribir flow works
- [ ] Actividades page loads
- [ ] Filters work
- [ ] Facilitador auth works

### Performance Testing
- [ ] Page load < 1.5s
- [ ] No N+1 queries
- [ ] Health check passes
- [ ] No console errors

### Browser Testing
- Chrome ✓
- Safari ✓
- Firefox ✓
- Mobile Safari ✓
- Chrome Mobile ✓

### Edge Cases
- [ ] Invalid email → proper error
- [ ] Wrong OTP code → proper error
- [ ] Rate limit exceeded → proper error
- [ ] Missing env vars → graceful fallback
- [ ] Network error → proper error

---

# 🟢 **DAY 7: BETA READY**

**Time:** 2-3 hours  
**Focus:** Onboarding prep

## Final Checklist

- [ ] User guide created (simple PDF)
- [ ] Support page visible (contact info)
- [ ] FAQ documented
- [ ] 5-10 beta testers identified
- [ ] Onboarding emails drafted
- [ ] Health check final verification
- [ ] All docs updated in GitHub

## Ready for Beta!

```
✅ Security hardened
✅ Activities module live
✅ Fully tested
✅ Documentation complete
✅ Beta users identified

→ Send invitations → Collect feedback → Iterate
```

---

# 🎯 **SUCCESS METRICS**

After 7 days:

```
Security:
  ✅ 0 UUID exposures
  ✅ CSP headers active
  ✅ CSRF protection enabled

Features:
  ✅ 8 activities displayed
  ✅ Filterable by type
  ✅ Full activity details shown
  ✅ Navigation working

Performance:
  ✅ < 1.5s page load
  ✅ No N+1 queries
  ✅ Health check passing

Quality:
  ✅ 0 build errors
  ✅ All tests passing
  ✅ No console errors
  ✅ Fully tested

Readiness:
  ✅ Beta users ready
  ✅ Documentation complete
  ✅ Support process defined
```

---

# 📝 **NOTES**

- If you get stuck, reference the SECURITY_AUDIT_AND_ACTION_PLAN.md
- Check GitHub for latest code/examples
- Use Vercel Dashboard to debug if needed
- Update this plan daily as you complete tasks

---

**Status:** Ready for execution  
**Start:** Today (September 12, 2026)  
**Target Completion:** September 18, 2026  
**Next Phase:** Beta testing + Wompi monetization  

Let's go! 🚀
