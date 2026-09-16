# 🏗️ AUDITORÍA SV-LEVEL: ADMIN DASHBOARD COMPLETO
## ClubSenior / Tardes de Café, Mente y Saberes
**Fecha:** 16 de Septiembre 2026, 23:00 GMT-5  
**Nivel:** Ingeniero SV con +10 años (Architecture, Security, Scalability)  
**Estado:** PRE-DISEÑO (sin código aún - auditoría de arquitectura)

---

## PARTE 1: AUDITORÍA DEL MODELO ACTUAL

### 1.1 Estado de la Base de Datos

```sql
TABLAS CRÍTICAS:
├── usuarios (id, email, nombre_abuelo, apellido_abuelo, condominio (VARCHAR), 
│            eps, emergencia_*, familiar_*, suscripcion_plan, suscripcion_estado, 
│            inscripcion_completada, phone, fecha_nacimiento, ciudad)
│
├── condominios (id, nombre (UNIQUE), ubicacion, ciudad, 
│               contacto_admin_nombre, contacto_admin_email, 
│               contacto_admin_phone, activo)
│
├── actividades (id, condominio_id (FK), titulo, descripcion, 
│               fecha, hora_inicio, hora_fin, modulo, facilitador_id, 
│               created_at, updated_at, deleted_at)
│
├── suscripciones (id, usuario_id (?), plan_type, estado, fecha_inicio, fecha_fin, ...)
│ 
└── (MISSING) asistencias - NO EXISTE YET
    └── Debería tener: (id, usuario_id, actividad_id, fecha, asistio (bool), observaciones)
```

### 1.2 Problemas Arquitectónicos Identificados

| # | Problema | Severidad | Impacto | Solución Recomendada |
|---|----------|-----------|--------|---------------------|
| 1 | `usuarios.condominio` es VARCHAR (texto), no FK | 🔴 CRÍTICO | Data integrity issues, duplicates | Agregar `usuarios.condominio_id (FK)` pero mantener VARCHAR como fallback |
| 2 | `suscripciones` tabla existe pero está VACÍA | 🔴 CRÍTICO | Dashboard no trae suscripción correcta | Poblar `suscripciones` durante registro O cambiar flujo |
| 3 | NO hay tabla `asistencias` | 🟡 MEDIA | No se puede trackear attendance | Crear tabla `asistencias` con RLS |
| 4 | NO hay tabla `admin_users` / roles | 🟡 MEDIA | Todos podrían ser "admin" sin auth | Crear tabla `admin_users` con role-based access |
| 5 | NO hay tabla `audit_logs` | 🟡 MEDIA | Sin trazabilidad de cambios admin | Crear tabla `audit_logs` con triggers |
| 6 | `facilitador_id` en actividades es NULL | 🟡 MEDIA | No se sabe quién facilita qué | Hacer FK a tabla `facilitadores` (crear) |
| 7 | `deleted_at` en actividades pero sin soft delete policy | 🟡 BAJA | Borrados pueden ser recuperados pero confuso | Implementar soft delete triggers |

### 1.3 Permisología Actual en Supabase

```
CURRENT STATE:
├── Public (anon) - ANYONE can read/write?
├── Authenticated - Users can see own data?
└── RLS Policies - ??? (NO HAY POLÍTICAS DEFINIDAS)

RISK: Database is open to manipulation. Anyone with Supabase key can:
  - Read all usuarios with datos sensibles (health info, emergency contacts)
  - Modify actividades (delete, change time, assign to wrong condominio)
  - Fake asistencias (mark people present who weren't)
```

---

## PARTE 2: INVESTIGACIÓN DE ADMIN DASHBOARDS EN PRODUCCIÓN

### 2.1 Patrones de SaaS Establecidos

#### Opción A: **Admin Monolítico** (Stripe, Shopify)
```
Admin dashboard = Next.js /admin/* routes
Pros:
  - Simple, everything in one codebase
  - Easy to share context (usuarios, condominios, activities)
  - Single auth layer
Cons:
  - Bundle size grows (admin + user code)
  - Can't separate deployment cycles
  - Risk: bug in admin = breaks whole app
```

#### Opción B: **Admin Separado** (Vercel, GitHub Admin)
```
Admin dashboard = Separate vercel app (admin.tardesdelcafe.com)
Pros:
  - Independent deployment
  - Can scale separately
  - Different permission model
  - Better for large teams
Cons:
  - More complex (2 codebases)
  - Cross-domain CORS/auth complexity
  - Longer development time
```

#### Opción C: **Embedded Admin** (Retool, Admin UI)
```
Use no-code admin builder (Retool, Budibase, etc)
Pros:
  - 0 code, instant admin
  - Built-in auth, permissions
  - Change schema → auto-update admin
Cons:
  - Vendor lock-in
  - Custom UX hard
  - Subscription cost ($20+/month)
```

#### Opción D: **GraphQL Admin** (Hasura, PostGraphile)
```
Auto-generate admin from GraphQL schema
Pros:
  - Schema → auto CRUD UI
  - Powerful filtering/sorting
  - Real-time subscriptions
Cons:
  - Learning curve
  - Setup complexity
  - Security model different
```

### 2.2 Recomendación para ClubSenior

**OPCIÓN A (Admin Monolítico)** ← MEJOR PARA MVP

**Razón:**
- 🎯 Simple: una codebase Next.js
- 🎯 Rápido: 2-3 días desarrollo vs 1-2 semanas separado
- 🎯 Lanzamiento 22 Sept: necesitamos MVP funcional
- 🎯 Escala pequeña: max 5 admins + 100 usuarios por ahora

**Estructura:**
```
src/app/
├── /familia          ← Usuario regular
├── /admin           ← Admin panel (NEW)
│  ├── /admin/dashboard
│  ├── /admin/usuarios
│  ├── /admin/actividades
│  ├── /admin/asistencias
│  ├── /admin/condominios
│  └── /admin/settings
├── /api
│  ├── /auth         ← User auth
│  ├── /admin        ← Admin endpoints (NEW)
│  │  ├── /usuarios
│  │  ├── /actividades
│  │  ├── /asistencias
│  │  └── /audit
│  └── /...
```

---

## PARTE 3: ARQUITECTURA ADMIN DASHBOARD PROPUESTA

### 3.1 Modelo de Datos Completo

```sql
-- 1. ADMIN USERS (NEW)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  nombre VARCHAR NOT NULL,
  rol VARCHAR NOT NULL,  -- 'super_admin', 'facilitador_admin', 'viewer'
  condominios_asignados UUID[] NOT NULL,  -- puede administrar qué condominios
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT now(),
  fecha_ultimo_login TIMESTAMP,
  
  -- RLS: solo super_admin puede ver todos, facilitador ve su condominio
  FOREIGN KEY (email) REFERENCES usuarios(email) ON DELETE CASCADE
);

-- 2. ASISTENCIAS (NEW)
CREATE TABLE asistencias (
  id UUID PRIMARY KEY,
  usuario_id UUID NOT NULL,
  actividad_id UUID NOT NULL,
  fecha DATE NOT NULL,
  asistio BOOLEAN NOT NULL,  -- true/false
  observaciones TEXT,
  registrado_por UUID,  -- admin_users.id que registró
  fecha_registro TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES admin_users(id) ON DELETE SET NULL,
  
  UNIQUE(usuario_id, actividad_id, fecha)
);

-- 3. FACILITADORES (NEW)
CREATE TABLE facilitadores (
  id UUID PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  especialidad VARCHAR,  -- 'física', 'cognitiva', 'social', etc
  email VARCHAR UNIQUE,
  telefono VARCHAR,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT now(),
  
  -- Link a usuarios opcionalmente
  usuario_id UUID,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 4. AUDIT LOGS (NEW)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  admin_id UUID NOT NULL,
  tabla_afectada VARCHAR NOT NULL,  -- 'actividades', 'usuarios', etc
  accion VARCHAR NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
  id_registro_afectado UUID,
  cambios_antes JSONB,  -- antes
  cambios_despues JSONB,  -- después
  fecha_accion TIMESTAMP DEFAULT now(),
  ip_origen VARCHAR,
  user_agent TEXT,
  
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
);

-- 5. ACTUALIZAR ACTIVIDADES
ALTER TABLE actividades ADD COLUMN facilitador_id UUID;
ALTER TABLE actividades ADD FOREIGN KEY (facilitador_id) REFERENCES facilitadores(id);

-- 6. ACTUALIZAR SUSCRIPCIONES
ALTER TABLE suscripciones ADD COLUMN usuario_id UUID;
ALTER TABLE suscripciones ADD FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
```

### 3.2 Row-Level Security (RLS) Policy

```sql
-- ADMIN_USERS: Solo su propio user
CREATE POLICY "admin_users_self" ON admin_users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_users_super_admin" ON admin_users
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.rol = 'super_admin'
    )
  );

-- ACTIVIDADES: visible a admin del condominio asignado
CREATE POLICY "actividades_admin_access" ON actividades
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.condominio_asignados @> ARRAY[condominio_id]
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.condominio_asignados @> ARRAY[condominio_id]
    )
  );

-- ASISTENCIAS: admin puede crear/editar solo en su condominio
CREATE POLICY "asistencias_admin_access" ON asistencias
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN actividades act ON asistencias.actividad_id = act.id
      WHERE au.id = auth.uid()
      AND au.condominio_asignados @> ARRAY[act.condominio_id]
    )
  );

-- USUARIOS: admin ve solo usuarios de su condominio
CREATE POLICY "usuarios_admin_access" ON usuarios
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid()
      AND au.condominio_asignados @> ARRAY[COALESCE(
        (SELECT id FROM condominios WHERE nombre = usuarios.condominio LIMIT 1),
        uuid_nil()
      )]
    )
  );
```

---

## PARTE 4: MÚLTIPLES DISEÑOS DE FRONTEND

### Diseño 1️⃣: **Admin Dashboard - Estilo Notion/Figma** (Recomendado)

```
CARACTERÍSTICAS:
- Sidebar navegación (collapse/expand)
- Data tables con inline editing
- Drag-drop para reorganizar
- Real-time updates (Supabase subscriptions)
- Dark mode opcional
- Mobile-first responsive

STACK:
- React Components (shadcn/ui o Headless UI)
- TanStack Table (tablas con sorting/filtering)
- Drag-and-drop (react-beautiful-dnd)
- Realtime (Supabase client)
```

**Wireframe ASCII:**
```
┌─ ADMIN ─────────────────────────────────────────────┐
│ 📊 DASHBOARD                  🔔 📧 👤 ⚙️         │
├──────────┬─────────────────────────────────────────┤
│ • Inicio │ 📅 Actividades    [+ Crear]           │
│ • Acti.. │ ┌───────────────────────────────────┐  │
│ • Asist  │ │ Fecha │ Título │ Condom │ Estado│  │
│ • Usuarios│ ├───────────────────────────────────┤  │
│ • Attend │ │ 17/9  │ Yoga   │ Central│ ✏️ ❌ │  │
│ • Factores│ │ 18/9  │ Mente  │ Silver │ ✏️ ❌ │  │
│ • Config │ └───────────────────────────────────┘  │
│          │ [← Anterior]         [Siguiente →]     │
└──────────┴─────────────────────────────────────────┘
```

### Diseño 2️⃣: **Admin Dashboard - Estilo Admin.io** (Minimalista)

```
Tabla gigante full-width, sin sidebars
Inline editing en celdas
Bulk actions (select multiple, delete, export)
Filter panel colapsable a la izquierda
```

### Diseño 3️⃣: **Admin Dashboard - Estilo Superadmin** (Enterprise)

```
Gráficos/dashboards arriba (KPIs)
Tablas abajo
Permisos granulares por role
Audit trail visible
Export a CSV/PDF
```

---

## PARTE 5: PLAN DE ROLLOUT SIN ROMPER NADA

### 5.1 Fases (Versionamiento Semántico)

```
v1.0 (HOY 16 SEPT)
  ✅ 3 Tareas P1 completadas (EPS, Dropdown, Actividades)
  ✅ Usuario de prueba rosseobca@hotmail.com funcional

v1.1 (MAÑANA 17 SEPT)  ← START HERE
  ✅ Wompi Payment Integration (P0)
  🟡 Admin login (new /admin/login)
  🟡 Crear tabla admin_users
  🟡 Primera página: Admin Dashboard simple (lista de usuarios)

v1.2 (18 SEPT)
  🟡 Página: Actividades (CRUD)
  🟡 Página: Asistencias (mark attendance)
  🟡 Crear tabla asistencias

v1.3 (19 SEPT)
  🟡 Condominios (CRUD)
  🟡 Facilitadores (CRUD)
  🟡 RLS policies (seguridad)

v2.0 (LANZAMIENTO 22 SEPT)
  ✅ Todo lo anterior + Wompi + OTP funcionando
  ✅ Admin completo
  ✅ QA móvil
  ✅ Producción en https://www.tardesdelcafe.com
```

### 5.2 Estrategia de Migración sin Breaking Changes

```sql
-- STEP 1: Agregar nuevas columnas (backward compatible)
ALTER TABLE usuarios ADD COLUMN condominio_id UUID;
ALTER TABLE actividades ADD COLUMN facilitador_id UUID;

-- STEP 2: Crear nuevas tablas en paralelo
CREATE TABLE admin_users (...);
CREATE TABLE asistencias (...);
CREATE TABLE facilitadores (...);
CREATE TABLE audit_logs (...);

-- STEP 3: Seed datos iniciales (sin deletear nada)
INSERT INTO admin_users (...) SELECT ... -- Elena como super_admin
INSERT INTO facilitadores (...) SELECT NULL, 'Facilitador 1', ..., NULL;

-- STEP 4: Enable RLS políticas (sin disable existing)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY ... ON usuarios ...

-- STEP 5: Datos históricos (copy-on-write)
-- Ejemplo: para cada usuario sin condominio_id, buscar condominio por nombre
UPDATE usuarios
SET condominio_id = (
  SELECT id FROM condominios WHERE nombre = usuarios.condominio LIMIT 1
)
WHERE condominio_id IS NULL AND condominio IS NOT NULL;

-- STEP 6: Deprecate viejo si todo funciona (mes 2)
-- ALTER TABLE usuarios DROP COLUMN condominio; -- SOLO DESPUÉS de validar
```

### 5.3 Rollback Plan

```
SI ALGO ROMPE:
  1. Git revert último commit
  2. Vercel auto-redeploy
  3. Supabase: NO DELETES, solo disable policies
  
PORQUE TODO TIENE MIGRATIONS:
  - Nueva columna? Está NULL, no rompe queries
  - Nueva tabla? Standalone, no afecta usuarios
  - Nueva política RLS? Disable, vuelve al estado anterior
```

---

## PARTE 6: ENDPOINTS ADMIN REQUERIDOS

### Authentication

```
POST   /api/admin/login
POST   /api/admin/logout
POST   /api/admin/refresh-token
GET    /api/admin/me                  -- whoami + permissions
```

### Admin Users Management

```
GET    /api/admin/usuarios             -- list all
GET    /api/admin/usuarios/:id         -- details
POST   /api/admin/usuarios             -- create
PUT    /api/admin/usuarios/:id         -- update
DELETE /api/admin/usuarios/:id         -- soft delete
POST   /api/admin/usuarios/bulk-action -- export, delete many
```

### Actividades Management

```
GET    /api/admin/actividades
POST   /api/admin/actividades
PUT    /api/admin/actividades/:id
DELETE /api/admin/actividades/:id
PATCH  /api/admin/actividades/:id/asignar-condominio
```

### Asistencias Management

```
GET    /api/admin/asistencias                  -- list con filters
POST   /api/admin/asistencias                  -- mark attendance
GET    /api/admin/asistencias/:usuario_id     -- usuario's attendance history
POST   /api/admin/asistencias/bulk             -- bulk mark (for activity)
GET    /api/admin/asistencias/reporte          -- attendance report
```

### Audit & Logs

```
GET    /api/admin/audit-logs           -- all actions
GET    /api/admin/audit-logs/filter    -- by tabla/accion/admin
```

---

## PARTE 7: SEGURIDAD CRÍTICA

### 7.1 Attack Vectors & Mitigaciones

| Ataque | Riesgo | Mitigación |
|--------|--------|-----------|
| Admin bruteforce password | 🔴 ALTO | Rate limit + captcha después de 5 intentos |
| JWT token robo | 🔴 ALTO | Refresh tokens con rotation, short expiry (15min) |
| CSRF en admin forms | 🔴 ALTO | SameSite=Strict, CSRF tokens |
| SQL injection | 🟡 MEDIO | Supabase prepared statements (automatico) |
| Admin deletes all data | 🟡 MEDIO | Soft deletes + audit logs + backups |
| RLS bypass | 🟡 MEDIO | Test políticas, code review |
| Privilege escalation | 🟡 MEDIO | Role-based access, never trust client |

### 7.2 Auth Flow Admin

```
1. POST /api/admin/login { email, password }
   → Supabase Auth
   → Verify user is in admin_users table
   → Return JWT + Refresh token

2. Cada request admin
   → Header: Authorization: Bearer <JWT>
   → RLS: Supabase verifica automaticamente

3. Token expira
   → POST /api/admin/refresh-token { refresh_token }
   → New JWT issued

4. Logout
   → POST /api/admin/logout
   → Blacklist token (Redis o tabla)
```

---

## PARTE 8: MÉTRICAS DE ÉXITO

### Antes (Ahora)
```
Admin: manual via Supabase console
Tiempo crear actividad: 5 min
Marcar asistencia: 2-3 min manual per persona
Reporte asistencia: excel manual
```

### Después (Post-Admin Dashboard)
```
Admin: UI intuitiva
Tiempo crear actividad: 30 seg
Marcar asistencia: 1 click bulk (10 personas = 5 sec)
Reporte asistencia: 1 click export
```

---

## PARTE 9: CHECKLIST IMPLEMENTACIÓN

### Fase 1: Setup (8 horas)
- [ ] Crear tablas (admin_users, asistencias, facilitadores, audit_logs)
- [ ] Migrar datos (condominios, facilitadores de prueba)
- [ ] Crear RLS policies
- [ ] Crear admin_users.email = promesaobca@gmail.com como super_admin

### Fase 2: Auth (4 horas)
- [ ] Endpoint /api/admin/login
- [ ] Endpoint /api/admin/logout
- [ ] Endpoint /api/admin/me
- [ ] Middleware verificar JWT en /admin/*

### Fase 3: UI Dashboard (6 horas)
- [ ] Diseño 1 (elegido)
- [ ] Componentes sidebar, navbar
- [ ] Layout responsivo

### Fase 4: Usuarios Crud (3 horas)
- [ ] GET /api/admin/usuarios
- [ ] Página /admin/usuarios con tabla
- [ ] Inline edit (nombre, condominio)

### Fase 5: Actividades (3 horas)
- [ ] GET/POST/PUT/DELETE /api/admin/actividades
- [ ] Página /admin/actividades
- [ ] Crear, editar, eliminar

### Fase 6: Asistencias (4 horas)
- [ ] Tabla asistencias populate
- [ ] POST /api/admin/asistencias bulk
- [ ] Página /admin/asistencias
- [ ] Mark attendance UI

### Fase 7: QA & Seguridad (6 horas)
- [ ] Test RLS policies
- [ ] Test JWT bypass attempts
- [ ] Mobile responsive
- [ ] Audit logs funcionando

**TOTAL: ~35 horas** (distribuidas 17-21 Sept)

---

## CONCLUSIÓN

Este admin dashboard es **MVP seguro y escalable**:

✅ **Simple** - Next.js monolítico, una codebase  
✅ **Seguro** - RLS policies, JWT rotation, audit logs  
✅ **Flexible** - Roles (super_admin, facilitador_admin, viewer)  
✅ **Sin breaking changes** - Migrations backward-compatible  
✅ **Rollback fácil** - Soft deletes, no data loss  
✅ **Lanzable 22 Sept** - Realista con timeline  

**RECOMENDACIÓN: Empezar Fase 1 el 17 Sept mañana después de Wompi.**

