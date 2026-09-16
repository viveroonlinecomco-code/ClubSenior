# 🚀 PLAN MVP ADMIN DASHBOARD - 16 HORAS COSTO MÍNIMO
**ClubSenior / Tardes de Café**  
**17-21 Septiembre 2026**  
**Solo lo CRÍTICO. Nada más.**

---

## 📦 SCOPE MVP

### ✅ QUÉ ESTÁ INCLUIDO
```
✅ Login Elena (hardcode o verificación simple)
✅ Dashboard shell (sidebar + navbar Diseño 1 simplificado)
✅ Crear actividades (form básico: título, fecha, hora, condominio)
✅ Marcar asistencias BULK (checkboxes por persona)
✅ Listar usuarios (tabla simple, filtro búsqueda)
✅ RLS básico (Elena puede modificar/eliminar)
✅ Deploy 22 Sept ✅
```

### ❌ QUÉ NO ESTÁ (Fase 2)
```
❌ Audit logs detallados
❌ Roles complejos (facilitador_admin, viewer)
❌ Facilitadores CRUD
❌ Condominios CRUD (fijo: Generación Silver + Central)
❌ Charts/KPIs
❌ Export CSV/PDF
❌ Password reset
```

---

## 🗄️ BASE DE DATOS ULTRA SIMPLE

### SQL Minimalista

```sql
-- 1. ASISTENCIAS TABLE ONLY (lo más importante)
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  actividad_id UUID NOT NULL,
  asistio BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  
  UNIQUE(usuario_id, actividad_id)
);

CREATE INDEX idx_asistencias_actividad ON asistencias(actividad_id);

-- 2. ACTUALIZAR ACTIVIDADES (agregar facilitador_id si no existe)
ALTER TABLE actividades
ADD COLUMN IF NOT EXISTS facilitador_id UUID;

-- 3. RLS PERMISIVO (Elena puede todo)
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asistencias_elena_all" ON asistencias
  USING (true)  -- MVP: permitir todo para Elena
  WITH CHECK (true);

-- 4. SEED: Crear usuario dummy para testing (opcional)
-- No necesario, usar usuario existente
```

**ESO ES TODO.** Sin audit_logs, sin admin_users table, sin facilitadores.

---

## 🔌 ENDPOINTS (6 TOTAL)

### 1. Login Elena (POST)
```
POST /api/admin/login
{
  "email": "promesaobca@gmail.com",
  "password": "..."
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "admin": { "email": "...", "nombre": "Elena" }
}
```

**Código:**
```typescript
// src/app/api/admin/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Verificar credenciales vs Supabase auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error || email !== 'promesaobca@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({
    success: true,
    token: data.session.access_token,
    admin: { email, nombre: 'Elena' },
  });
}
```

### 2. Crear Actividad (POST)
```
POST /api/admin/actividades
{
  "titulo": "Yoga",
  "fecha": "2026-09-17",
  "hora_inicio": "14:00",
  "hora_fin": "15:00",
  "condominio_id": "uuid",
  "modulo": "fisica"
}
```

### 3. Listar Actividades (GET)
```
GET /api/admin/actividades
Response: [{ id, titulo, fecha, condominio_id, modulo, ... }]
```

### 4. Listar Usuarios (GET)
```
GET /api/admin/usuarios?q=maria
Response: [{ id, email, nombre_abuelo, condominio, ... }]
```

### 5. Marcar Asistencias (POST BULK)
```
POST /api/admin/asistencias/marcar
{
  "actividad_id": "uuid",
  "asistencias": [
    { "usuario_id": "uuid1", "asistio": true },
    { "usuario_id": "uuid2", "asistio": false },
    { "usuario_id": "uuid3", "asistio": true }
  ]
}
```

### 6. Logout (POST)
```
POST /api/admin/logout
Response: { "success": true }
```

---

## 🎨 UI DISEÑO 1 SIMPLIFICADO

### Estructura
```
/admin/login              ← Form simple email + password
/admin/dashboard          ← Main screen (Elena)
├── /admin/actividades    ← Crear + listar
├── /admin/asistencias    ← Marcar checkboxes bulk
└── /admin/usuarios       ← Buscar + ver lista
```

### Componentes
```
Layout:
  ├── Sidebar (4 links: Actividades, Asistencias, Usuarios, Logout)
  └── Main Content (todo en tablas + forms simples)

Colores:
  - Sidebar: #1a1a1a (dark)
  - Links: white
  - Botones primarios: #0066ff
  - Tables: white background

Fonts: -apple-system, Segoe UI (estándar)
```

---

## 📋 ARCHIVOS A CREAR

```
src/app/admin/
├── login/
│   └── page.tsx                    ← Form login Elena
├── dashboard/
│   └── page.tsx                    ← Dashboard overview (6 KPIs simples)
├── actividades/
│   ├── page.tsx                    ← Listar + crear
│   └── components/form.tsx         ← Form crear actividad
├── asistencias/
│   └── page.tsx                    ← Checkboxes bulk
├── usuarios/
│   └── page.tsx                    ← Buscar + listar
├── layout.tsx                      ← Sidebar + navbar
└── components/
    ├── sidebar.tsx
    ├── navbar.tsx
    └── protected-route.tsx

src/app/api/admin/
├── login/route.ts
├── logout/route.ts
├── actividades/route.ts            ← GET + POST
├── usuarios/route.ts               ← GET
└── asistencias/marcar/route.ts     ← POST bulk

src/middleware.ts                   ← Check JWT en /admin/*

src/lib/
└── admin-auth.ts                   ← Helpers JWT
```

---

## ⏱️ TIMELINE PRECISO (17-20 SEPT)

### 17 SEPT (Mañana, 9:00 AM) - 4 HORAS
```
09:00 - 09:30  SQL ejecutar (asistencias table + RLS)
09:30 - 10:30  Login endpoint + middleware
10:30 - 12:30  Login UI + protección rutas
12:30 - 13:30  Lunch + Wompi track aparte (si aplica)
```

### 18 SEPT - 5 HORAS
```
10:00 - 11:00  Dashboard shell (sidebar + navbar)
11:00 - 12:00  Crear actividades endpoint
12:00 - 13:00  Crear actividades UI (form)
13:00 - 14:00  Listar actividades UI (tabla)
14:00 - 15:00  Listar usuarios endpoint + UI
```

### 19 SEPT - 4 HORAS
```
10:00 - 12:00  Marcar asistencias endpoint BULK
12:00 - 14:00  Marcar asistencias UI (checkboxes)
14:00 - 15:00  Basic mobile responsive
15:00 - 16:00  QA + bug fixes
```

### 20 SEPT - 3 HORAS
```
10:00 - 11:00  Mobile final tweaks
11:00 - 12:00  Deploy staging + test
12:00 - 13:00  Production deploy ready
```

**TOTAL: 16 HORAS (distribuidas, no consecutivas)**

---

## 🚀 COMMITS ESPERADOS

```
17 SEPT
  ✅ feat: Add asistencias table + RLS
  ✅ feat: Admin login endpoint + middleware

18 SEPT
  ✅ feat: Admin dashboard shell (sidebar/navbar)
  ✅ feat: Create activities endpoint + UI
  ✅ feat: List usuarios endpoint + search UI

19 SEPT
  ✅ feat: Mark asistencias bulk endpoint
  ✅ feat: Asistencias checkboxes UI

20 SEPT
  ✅ chore: Mobile responsive + QA
  ✅ chore: Deploy staging → production ready
```

---

## 🔒 SEGURIDAD (MÍNIMA)

```
✅ JWT token validation en middleware
✅ RLS policy permite Elena todo
✅ NO roles complejos (Fase 2)
✅ NO audit logs (Fase 2)
✅ NO password reset (Fase 2)
✅ NO 2FA (Fase 2)
```

**Para MVP: "Confiar en Elena" es suficiente**

---

## ✅ VALIDACIÓN CHECKLIST (22 SEPT)

```
PRE-LAUNCH
- [ ] Elena puede hacer login
- [ ] Elena puede crear actividad
- [ ] Actividades aparecen en lista
- [ ] Elena puede marcar asistencias (checkboxes bulk)
- [ ] Usuarios búsqueda funciona
- [ ] Mobile: no se rompe
- [ ] Logout funciona
- [ ] Refresh page: no pierde estado (JWT)

DEPLOYMENT
- [ ] Staging ok
- [ ] Production deploy
- [ ] Monitoreo 1h
```

---

## 📊 COMPARATIVA: ANTES vs DESPUÉS

| Métrica | Antes | Después |
|---------|-------|---------|
| Crear actividad | 5 min (manual) | 1 min (form) |
| Marcar asistencia (20 personas) | 40 min | 2 min (bulk checkboxes) |
| Buscar usuario | Manual excel | 2 seg (search) |
| Data integrity | Low | Medium (RLS) |
| Admin UI | No existe | ✅ Profesional |
| Time investment | 35 horas | **16 horas** |

---

## 🎯 DECISIÓN FINAL

**✅ MVP MINIMALISTA SÍ/SÍ/SÍ**

Scope: Ultra reducido  
Tiempo: 16 horas  
Costo: MÍNIMO  
Riesgo: BAJO  
Lanzamiento: 22 Sept ✅

**¿EMPEZAMOS MAÑANA 9:00 AM?**

