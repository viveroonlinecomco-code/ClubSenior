# 🔍 **SECURITY AUDIT & IMPLEMENTATION PLAN**

**Date:** September 12, 2026  
**Status:** Critical Issues Found + Action Plan Ready  
**Priority:** HIGH (Security + Features)  

---

# 🚨 **SECURITY AUDIT FINDINGS**

## Issue #1: UUID Exposed in UI (CRITICAL)

### What
```
User dashboard shows:
┌─────────────────────────────────┐
│ USUARIO                         │
│ 57f09f82-9733-4173-8e3c-93e... │
│ iveroonline.com.co@gmail.co     │
└─────────────────────────────────┘
```

### Risk
```
Severity: MEDIUM
Impact: User enumeration, targeted attacks
Visibility: Public in UI

OWASP: A07:2021 – Identification and Authentication Failures
CWE-200: Exposure of Sensitive Information to an Unauthorized Actor
```

### Why It's Bad
```
1. UUID is unique identifier for user
   - Attacker can enumerate all users: 0, 1, 2, ... N
   - Build list of users on the platform

2. Used for targeting attacks
   - Direct user identification
   - Privacy violation
   - GDPR/Privacy concerns

3. No need to expose it
   - Client doesn't need UUID
   - Only server needs it (in JWT claims)
   - Can be removed safely
```

### Fix (5 minutes)

**File:** `src/app/familia/layout.tsx` or component that shows USUARIO

**Before:**
```typescript
export default function FamiliaLayout({ children }) {
  const user = useAuth(); // Gets JWT decoded data

  return (
    <div>
      <aside>
        <div className="user-card">
          <p className="user-id">{user.id}</p> {/* ❌ UUID exposed */}
          <p className="user-email">{user.email}</p>
        </div>
      </aside>
      {children}
    </div>
  );
}
```

**After:**
```typescript
export default function FamiliaLayout({ children }) {
  const user = useAuth(); // Gets JWT decoded data

  return (
    <div>
      <aside>
        <div className="user-card">
          {/* ✅ Show name instead of UUID */}
          <p className="user-name">{user.nombre || user.email.split('@')[0]}</p>
          <p className="user-email">{user.email}</p>
        </div>
      </aside>
      {children}
    </div>
  );
}
```

**Deploy:**
```bash
git add src/app/familia/layout.tsx
git commit -m "Security: Remove UUID exposure from user sidebar"
git push origin main
# Auto-deployed to Vercel in 2-5 min
```

---

## Issue #2: Missing Content Security Policy (MEDIUM)

### Status
```
❌ NOT implemented yet
Risk: XSS attacks could inject malicious scripts
```

### Fix
Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

**Time:** 10 minutes  
**Priority:** Medium (good practice)

---

## Issue #3: CSRF Protection Missing (MEDIUM)

### Status
```
❌ NOT implemented yet
Risk: Cross-site request forgery on POST endpoints
```

### Quick Fix
```typescript
// src/app/api/auth/send-otp/route.ts
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
  // Verify Origin header matches deployment
  const origin = headers().get('origin')
  const allowedOrigins = [
    'https://club-senior.vercel.app',
    process.env.NEXT_PUBLIC_APP_URL,
    // Add preview URLs during development
  ]
  
  if (!allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 403 }
    )
  }

  // Rest of endpoint...
}
```

**Time:** 20 minutes (add to all POST endpoints)  
**Priority:** Medium (important for production)

---

## Issue #4: Rate Limiting Not on All Endpoints (LOW-MEDIUM)

### Current
```
✅ Applied to: send-otp, verify-otp
❌ Missing from: create-activity, create-report, etc
```

### Recommendation
```
Apply rate limiting to:
- All POST endpoints (creation)
- All PUT/DELETE endpoints (modification)
- Dashboard data endpoint (read-heavy)

Pattern: 100 requests/hour per user
Rationale: Prevent abuse, DoS protection
```

**Time:** 1 hour  
**Priority:** Medium (good practice)

---

## Summary: Security Issues

```
🔴 CRITICAL (Fix immediately):
   1. UUID exposed - 5 min to fix

🟡 MEDIUM (Fix before full launch):
   2. CSP headers - 10 min
   3. CSRF protection - 20 min
   4. Rate limiting on all endpoints - 1 hour

🟢 LOW (Good to have):
   - Sentry error tracking
   - Security headers audit tool
```

---

# 📋 **IMPLEMENTATION PLAN: ACTIVITIES MODULE**

## Current State
```
✅ Database: Actividades table exists
✅ API: /api/facilitador/actividades endpoint ready
❌ UI: Not fully connected to activities (Cronograma manual)
❌ Features: Can't create/view activities from /familia dashboard
```

## Cronograma (From your document)

```
SEMANA I:
  - Movimiento Vital (física, 30 min)
  - Mente Activa (cognitiva, 90 min)

SEMANA II:
  - Equilibrio & Energía (física, 30 min)
  - Pintando Recuerdos (creativa, 90 min)

SEMANA III:
  - Actívate (física, 30 min)
  - Club de Amigos (social, 90 min)

SEMANA IV:
  - Baile & Movimiento (física, 30 min)
  - Creando Experiencias (recreativa, 90 min)
```

## Implementation Steps

### Step 1: Seed Initial Activities (30 minutes)

Create file: `src/scripts/seed-activities.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ACTIVITIES = [
  {
    nombre: 'Movimiento Vital',
    descripcion: 'Actividad física: Calentamiento, movilidad articular, flexibilidad, y vuelta a la calma.',
    tipo: 'Física',
    duracion_minutos: 30,
    objetivo: 'Movilidad, coordinación, resistencia, equilibrio, ánimo e independencia funcional.',
    implementos: 'Sillas, agua, colchonetas opcionales.',
    semana: 1,
    dia: 'Lunes', // You can adjust
  },
  // ... resto de actividades
]

async function seed() {
  for (const activity of ACTIVITIES) {
    const { error } = await supabase
      .from('actividades')
      .insert(activity)
    
    if (error) console.error('Error:', error)
    else console.log('✅ Created:', activity.nombre)
  }
}

seed()
```

Run:
```bash
npx ts-node src/scripts/seed-activities.ts
```

### Step 2: Update Activities Table Schema (15 minutes)

Add missing columns to Supabase `actividades` table:

```sql
-- Add to existing actividades table
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS objetivo TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS implementos TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS semana INTEGER;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS dia TEXT;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER;
```

### Step 3: Create Activities Display Component (45 minutes)

File: `src/app/familia/actividades/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ActividadesPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .order('semana', { ascending: true })
        .order('duracion_minutos', { ascending: true })

      if (error) {
        console.error('Error:', error)
      } else {
        setActivities(data || [])
      }
      setLoading(false)
    }

    fetchActivities()
  }, [])

  if (loading) return <div>Cargando actividades...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Nuestras Actividades</h1>

      {activities.map((activity) => (
        <div key={activity.id} className="border rounded-lg p-6 hover:shadow-lg transition">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-green-600">{activity.nombre}</h2>
              <p className="text-gray-600 mt-2">{activity.descripcion}</p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-semibold text-sm text-gray-500">TIPO</p>
                  <p className="text-lg">{activity.tipo}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-500">DURACIÓN</p>
                  <p className="text-lg">{activity.duracion_minutos} minutos</p>
                </div>
                <div className="col-span-2">
                  <p className="font-semibold text-sm text-gray-500">OBJETIVO</p>
                  <p className="text-lg">{activity.objetivo}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="font-semibold text-sm text-gray-500">IMPLEMENTOS</p>
                <p className="text-sm">{activity.implementos}</p>
              </div>
            </div>
            <button className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Inscribirse
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Step 4: Add Navigation Link (5 minutes)

File: `src/app/familia/layout.tsx`

Add to navigation menu:
```typescript
<Link href="/familia/actividades" className="nav-link">
  📅 Actividades
</Link>
```

---

# 🎯 **OBJECTIVES**

## What We're Building
```
Platform Goal:
  "Conectar facilitadores con adultos mayores para actividades significativas"

User Goals:
  Facilitador:
    ✓ Crear y gestionar actividades
    ✓ Registrar asistencia
    ✓ Ver reportes de participación

  Residente:
    ✓ Ver actividades disponibles
    ✓ Inscribirse a actividades
    ✓ Ver su historia de participación
    ✓ Conectar con otros adultos mayores

Business Goals:
  Elena:
    ✓ Monetizar (Wompi - next)
    ✓ Crecer a 100+ facilitadores
    ✓ Impactar 1000+ adultos mayores
```

## Measurable Metrics
```
Usage:
  - Active facilitadores per week
  - Activities created per week
  - Registrations per activity
  - Attendance rate

Engagement:
  - Users who complete full profile: 80%+
  - Users who join activity: 60%+
  - Repeat participation: 70%+

Business:
  - Monthly recurring revenue: $X
  - Customer acquisition cost: < $50
  - Lifetime value: > $500
```

---

# 📊 **ACTION PLAN (Next 7 Days)**

## Day 1 (Today) - Security Fixes
```
⏰ Time: 1 hour
Tasks:
  ✅ Remove UUID from UI
  ✅ Add CSP headers
  ✅ Add CSRF protection (at least to auth endpoints)
  ✅ Test all changes
  ✅ Deploy

Result: Security hardened, UUID issue fixed
```

## Day 2-3 - Activities Implementation
```
⏰ Time: 3-4 hours total
Day 2 (2 hours):
  □ Add schema columns to Supabase
  □ Create seed script
  □ Run seed to populate cronograma activities
  □ Verify in Supabase dashboard

Day 3 (1-2 hours):
  □ Build Activities display page
  □ Add navigation link
  □ Test with real data
  □ Deploy
  □ Test in production

Result: Residents can see all activities
```

## Day 4-5 - Facilitate Admin Panel Completion
```
⏰ Time: 4-5 hours
Activities:
  □ Finish "Crear Actividad" form (validation)
  □ Build "Registrar Asistencia" page
  □ Build "Ver Reportes" page
  □ Add bulk CSV upload for attendance

Result: Facilitators have full admin portal
```

## Day 6 - Testing & Bug Fixes
```
⏰ Time: 3-4 hours
Testing:
  □ End-to-end flow: Facilitator creates activity
  □ End-to-end flow: Resident joins activity
  □ End-to-end flow: Facilitator marks attendance
  □ End-to-end flow: View attendance report
  □ Security testing (OWASP Top 10)

Bug fixes:
  □ Fix any issues found
  □ Deploy
  □ Verify in production
```

## Day 7 - Beta Ready
```
⏰ Time: 2-3 hours
Final:
  □ Create user guide (simple PDF)
  □ Setup contact/support page
  □ Prepare 5-10 beta testers
  □ Send onboarding emails
  □ Monitor for issues

Result: System ready for beta testing
```

---

# 📈 **Implementation Timeline**

```
┌─────────────────────────────────────────────────────────────┐
│ WEEK 1: Security + Activities                               │
├─────────────────────────────────────────────────────────────┤
│ Day 1: Security fixes (UUID, CSP, CSRF)         ✓ 1 hour   │
│ Day 2: DB Schema + Seed activities               ✓ 2 hours │
│ Day 3: Build activities page                     ✓ 2 hours │
│ Day 4: Facilitator admin completion              ✓ 4 hours │
│ Day 5: Testing + Bug fixes                       ✓ 3 hours │
│ Day 6: Beta onboarding prep                      ✓ 2 hours │
│                                    TOTAL:        ~14 hours │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WEEK 2: Monetization (Wompi Payments)            ~3-4 hours │
│ WEEK 3: Monitoring + Advanced Features           ~4-5 hours │
│ WEEK 4+: Scale based on user feedback                       │
└─────────────────────────────────────────────────────────────┘
```

---

# ✅ **COMPLETION CHECKLIST**

### Security Audit
- [ ] UUID removed from UI
- [ ] CSP headers added
- [ ] CSRF protection implemented
- [ ] All endpoints rate-limited
- [ ] Security headers tested

### Activities Module
- [ ] Database schema updated
- [ ] Seed script created and run
- [ ] Activities display page built
- [ ] Navigation added
- [ ] Tested with real data

### Facilitator Features
- [ ] Create activity form (full validation)
- [ ] Attend marking page (bulk upload ready)
- [ ] Reports page (aggregation working)
- [ ] All features tested end-to-end

### Testing & Deployment
- [ ] Security testing (OWASP)
- [ ] Performance testing (load)
- [ ] Browser testing (Chrome, Safari, Firefox)
- [ ] Mobile testing (responsive)
- [ ] Deployed to production
- [ ] Health check passing

### Beta Ready
- [ ] User guide created
- [ ] Support contact visible
- [ ] 5-10 beta testers identified
- [ ] Onboarding emails drafted
- [ ] Monitoring setup (logs, errors)

---

# 🚀 **SUCCESS CRITERIA**

```
When complete, the system should be:

✅ SECURE
   - No sensitive data exposed
   - OWASP Top 10 mitigated
   - Production-ready security

✅ FUNCTIONAL
   - Residents can browse activities
   - Facilitators can manage activities
   - Attendance tracking working
   - Reports generating

✅ PERFORMANT
   - Activities page loads < 1s
   - Admin panel < 1.5s
   - No N+1 queries (RPC used)

✅ DEPLOYABLE
   - Zero build errors
   - All tests passing
   - Health check ✅
   - Auto-deploy working

✅ BETA-READY
   - User guide available
   - Support ready
   - Monitoring active
   - Early testers onboarded
```

---

# 📝 **NOTES**

## Security First
Every feature added must be secure by default. No exceptions.

## Measure Progress
Update this plan daily as you implement. Cross off tasks as complete.

## Testing is Not Optional
Every feature needs to be tested before deploying.

## User Feedback Loop
After beta starts, collect feedback daily and prioritize based on impact.

---

**Status:** Ready for implementation  
**Estimated Total Time:** 14-18 hours over 7 days  
**Owner:** Elena  
**Next Review:** September 19, 2026

