# 🎯 PLAN DE ACCIÓN EJECUTABLE
## Admin Dashboard ClubSenior
**Fecha:** 16 Septiembre 2026, 23:15 GMT-5  
**Estado:** Listo para ejecución mañana (17 Sept)  
**Riesgo:** BAJO (sin breaking changes)  
**Estimado:** 30-35 horas de desarrollo (distribuidas 17-21 Sept)

---

## RESUMEN EJECUTIVO

```
DECISIÓN: ✅ Usar OPCIÓN A (Admin Monolítico)
DISEÑO ELEGIDO: Diseño 1 (Notion/Figma) - mejor UX
TIMELINE: 17 Sept (Wompi) + 18-21 Sept (Admin) = Lanzamiento 22 Sept ✅
RIESGO: BAJO - todas las migrations son backward-compatible
```

---

## FASE 0: PREPARACIÓN (17 SEPT, 9:00-10:00)

### 0.1 Código & Estructura

```bash
# 1. Crear rama para admin dashboard
git checkout -b feat/admin-dashboard

# 2. Crear estructura de directorios
mkdir -p src/app/admin
mkdir -p src/app/api/admin
mkdir -p src/components/admin
mkdir -p src/hooks/admin
mkdir -p src/types/admin
mkdir -p src/middleware
mkdir -p src/lib/admin

# 3. Crear tabla admin_users (migration)
# (ver sección 0.2 SQL)

# 4. Update middleware auth
# (ver sección 0.3 Middleware)
```

### 0.2 SQL - Crear Tablas

**Ejecutar en Supabase Console:**

```sql
-- 1. ADMIN_USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  nombre VARCHAR NOT NULL,
  rol VARCHAR NOT NULL CHECK (rol IN ('super_admin', 'facilitador_admin', 'viewer')),
  condominios_asignados UUID[] NOT NULL DEFAULT ARRAY[]::uuid[],
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  fecha_ultimo_login TIMESTAMP,
  
  FOREIGN KEY (email) REFERENCES usuarios(email) ON DELETE CASCADE
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_rol ON admin_users(rol);

-- 2. FACILITADORES TABLE
CREATE TABLE IF NOT EXISTS facilitadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR NOT NULL,
  especialidad VARCHAR,
  email VARCHAR UNIQUE,
  telefono VARCHAR,
  activo BOOLEAN DEFAULT true,
  usuario_id UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_facilitadores_email ON facilitadores(email);
CREATE INDEX idx_facilitadores_usuario_id ON facilitadores(usuario_id);

-- 3. ASISTENCIAS TABLE
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  actividad_id UUID NOT NULL,
  fecha DATE NOT NULL,
  asistio BOOLEAN NOT NULL,
  observaciones TEXT,
  registrado_por UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES admin_users(id) ON DELETE SET NULL,
  
  UNIQUE(usuario_id, actividad_id, fecha)
);

CREATE INDEX idx_asistencias_usuario_id ON asistencias(usuario_id);
CREATE INDEX idx_asistencias_actividad_id ON asistencias(actividad_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);

-- 4. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  tabla_afectada VARCHAR NOT NULL,
  accion VARCHAR NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  id_registro_afectado UUID,
  cambios_antes JSONB,
  cambios_despues JSONB,
  created_at TIMESTAMP DEFAULT now(),
  ip_origen VARCHAR,
  user_agent TEXT,
  
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_tabla ON audit_logs(tabla_afectada);

-- 5. ACTUALIZAR ACTIVIDADES (si no existe facilitador_id)
ALTER TABLE actividades
ADD COLUMN IF NOT EXISTS facilitador_id UUID REFERENCES facilitadores(id) ON DELETE SET NULL;

-- 6. ACTUALIZAR SUSCRIPCIONES (si no existe usuario_id)
ALTER TABLE suscripciones
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE;

-- 7. SEED INICIAL - Elena como super_admin
INSERT INTO admin_users (email, nombre, rol, condominios_asignados, activo)
VALUES (
  'promesaobca@gmail.com',
  'Elena',
  'super_admin',
  (SELECT ARRAY_AGG(id) FROM condominios WHERE activo = true),
  true
)
ON CONFLICT (email) DO UPDATE SET
  rol = 'super_admin',
  condominios_asignados = (SELECT ARRAY_AGG(id) FROM condominios WHERE activo = true);

-- 8. SEED FACILITADORES
INSERT INTO facilitadores (nombre, especialidad, email, activo)
VALUES 
  ('María Rodríguez', 'Física', 'maria@tardesdelcafe.com', true),
  ('Carlos López', 'Cognitiva', 'carlos@tardesdelcafe.com', true),
  ('Ana García', 'Social', 'ana@tardesdelcafe.com', true),
  ('José Martínez', 'Cognitiva', 'jose@tardesdelcafe.com', true)
ON CONFLICT (email) DO NOTHING;
```

**Validación:**

```sql
-- Verificar tablas creadas
SELECT tablename FROM pg_tables WHERE tablename IN ('admin_users', 'facilitadores', 'asistencias', 'audit_logs');
-- Output: admin_users, facilitadores, asistencias, audit_logs ✅

-- Verificar Elena es super_admin
SELECT email, rol, activo FROM admin_users WHERE email = 'promesaobca@gmail.com';
-- Output: promesaobca@gmail.com | super_admin | true ✅
```

### 0.3 RLS Policies

**Ejecutar en Supabase Console:**

```sql
-- ENABLE RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilitadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ADMIN_USERS: Solo acceso propio o super_admin
CREATE POLICY "admin_users_own_record" ON admin_users
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()::uuid AND rol = 'super_admin')
  );

CREATE POLICY "admin_users_admin_only" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()::uuid AND rol = 'super_admin')
  );

-- FACILITADORES: Todos pueden ver
CREATE POLICY "facilitadores_read" ON facilitadores
  FOR SELECT USING (true);

-- ASISTENCIAS: Admin del condominio puede crear/editar
CREATE POLICY "asistencias_admin_access" ON asistencias
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN actividades act ON asistencias.actividad_id = act.id
      WHERE au.id = auth.uid()::uuid
      AND au.rol IN ('super_admin', 'facilitador_admin')
    )
  );

-- AUDIT_LOGS: Admin solo
CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()::uuid AND rol IN ('super_admin', 'facilitador_admin'))
  );
```

---

## FASE 1: AUTH ADMIN (17 SEPT, 10:00-14:00) - 4 horas

### 1.1 Contexto Auth Admin

```typescript
// src/types/admin.ts
export interface AdminUser {
  id: string;
  email: string;
  nombre: string;
  rol: 'super_admin' | 'facilitador_admin' | 'viewer';
  condominios_asignados: string[];
  activo: boolean;
}

export interface AdminSession {
  admin: AdminUser;
  token: string;
  expiresAt: number;
}
```

### 1.2 Endpoints Auth

#### POST /api/admin/login

```typescript
// src/app/api/admin/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // 1. Usar Supabase auth (email/password)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });
  
  // 2. Verificar que usuario está en admin_users
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (!adminUser) {
    return NextResponse.json({ error: 'No admin access' }, { status: 403 });
  }
  
  // 3. Registrar login en audit_logs
  await supabase.from('audit_logs').insert({
    admin_id: adminUser.id,
    tabla_afectada: 'admin_users',
    accion: 'LOGIN',
    created_at: new Date().toISOString(),
    ip_origen: request.ip,
    user_agent: request.headers.get('user-agent'),
  });
  
  // 4. Retornar sesión
  return NextResponse.json({
    success: true,
    data: {
      admin: adminUser,
      token: data.session.access_token,
      expiresAt: data.session.expires_at,
    },
  });
}
```

#### POST /api/admin/logout

```typescript
export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  
  // Supabase auth logout
  await supabase.auth.signOut();
  
  // Registrar logout
  const userId = request.headers.get('x-admin-id');
  await supabase.from('audit_logs').insert({
    admin_id: userId,
    tabla_afectada: 'admin_users',
    accion: 'LOGOUT',
  });
  
  return NextResponse.json({ success: true });
}
```

#### GET /api/admin/me

```typescript
export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  
  // 1. Verificar JWT válido
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 2. Traer datos admin
  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.email)
    .single();
  
  return NextResponse.json({ success: true, data: admin });
}
```

### 1.3 Middleware

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas de admin
  if (pathname.startsWith('/admin')) {
    // Si es /admin/login, permitir
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // Otras rutas admin requieren auth
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // TODO: validar token + rol
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### 1.4 Login UI Component

```typescript
// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('promesaobca@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      const { data } = await response.json();
      
      // Guardar token y admin info
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
      
      // Redirigir a dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <form onSubmit={handleLogin} style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>Admin Login</h1>
        
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
```

---

## FASE 2: DASHBOARD SHELL (18 SEPT, 10:00-16:00) - 6 horas

### 2.1 Layout Admin

```typescript
// src/app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminNavbar />
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 2.2 Componentes Sidebar & Navbar

```typescript
// src/components/admin/sidebar.tsx
export function AdminSidebar() {
  return (
    <aside style={{ width: '280px', background: '#1a1a1a', color: 'white', padding: '20px' }}>
      <h1 style={{ marginBottom: '40px' }}>🎯 Admin</h1>
      <nav>
        <a href="/admin/dashboard" style={{ display: 'block', padding: '12px', margin: '8px 0' }}>📊 Dashboard</a>
        <a href="/admin/actividades" style={{ display: 'block', padding: '12px', margin: '8px 0' }}>📅 Actividades</a>
        <a href="/admin/asistencias" style={{ display: 'block', padding: '12px', margin: '8px 0' }}>✅ Asistencias</a>
        <a href="/admin/usuarios" style={{ display: 'block', padding: '12px', margin: '8px 0' }}>👥 Usuarios</a>
        <a href="/admin/condominios" style={{ display: 'block', padding: '12px', margin: '8px 0' }}>🏢 Condominios</a>
      </nav>
    </aside>
  );
}

// src/components/admin/navbar.tsx
export function AdminNavbar() {
  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e0e0e0',
      padding: '16px 32px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button>🔔</button>
        <button>👤 Elena</button>
      </div>
    </nav>
  );
}
```

### 2.3 Dashboard Overview Page

```typescript
// src/app/admin/dashboard/page.tsx
export default async function AdminDashboard() {
  // TODO: Traer KPIs desde endpoints
  const kpis = {
    usuariosActivos: 127,
    actividades: 24,
    asistenciaPromedio: 78,
    condominios: 2,
  };

  return (
    <div>
      <h1>📊 Dashboard Administrativo</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
        <KPICard title="Usuarios Activos" value={kpis.usuariosActivos} icon="👥" />
        <KPICard title="Actividades" value={kpis.actividades} icon="📅" />
        <KPICard title="Asistencia Promedio" value={`${kpis.asistenciaPromedio}%`} icon="✅" />
        <KPICard title="Condominios" value={kpis.condominios} icon="🏢" />
      </div>
    </div>
  );
}

function KPICard({ title, value, icon }: { title: string; value: any; icon: string }) {
  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: '700' }}>{value}</div>
    </div>
  );
}
```

---

## FASE 3: USUARIOS CRUD (18-19 SEPT) - 3 horas

### 3.1 Endpoints

```typescript
// GET /api/admin/usuarios
// POST /api/admin/usuarios
// PUT /api/admin/usuarios/:id
// DELETE /api/admin/usuarios/:id
```

### 3.2 UI Usuarios Page

```typescript
// src/app/admin/usuarios/page.tsx
```

---

## FASE 4: ACTIVIDADES CRUD (19 SEPT) - 3 horas

### Endpoints

```typescript
// GET /api/admin/actividades
// POST /api/admin/actividades
// PUT /api/admin/actividades/:id
// DELETE /api/admin/actividades/:id
```

---

## FASE 5: ASISTENCIAS (19-20 SEPT) - 4 horas

### Endpoints

```typescript
// POST /api/admin/asistencias
// PUT /api/admin/asistencias/:id
// GET /api/admin/asistencias/reporte
```

---

## FASE 6: QA + ROLLOUT (21 SEPT) - 6 horas

```
- [ ] Test RLS policies en staging
- [ ] Test JWT expiry + refresh
- [ ] Test mobile responsiveness
- [ ] Audit logs funcionando
- [ ] Backup BD antes de production deploy
- [ ] Deploy a main + Vercel
```

---

## CHECKLIST DE DEPLOYMENT

### Pre-Launch (21 Sept, 18:00)

```
- [ ] Todas las tablas creadas ✅
- [ ] RLS policies activas ✅
- [ ] Seeds poblados ✅
- [ ] Endpoints probados en Postman ✅
- [ ] UI componentes en Storybook ✅
- [ ] Mobile responsive ✅
- [ ] Audit logs registrando ✅
- [ ] Backups configurados ✅
```

### Launch Day (22 Sept, 09:00)

```
- [ ] Health check endpoints
- [ ] Admin login funciona
- [ ] Actividades CRUD works
- [ ] Asistencias mark works
- [ ] Usuarios búsqueda works
- [ ] Export CSV works
- [ ] Navegación sin errores
- [ ] Performance OK (<2s load)
```

---

## METRICS DE ÉXITO

| Métrica | Antes | Después | ✅ |
|---------|-------|---------|-----|
| Admin time create activity | 5 min | 30 sec | ✅ |
| Admin time mark attendance (1 person) | 2-3 min | 5 sec | ✅ |
| Admin time mark attendance (bulk 20) | 40 min | 1 min | ✅ |
| Report generation | Manual excel | 1 click export | ✅ |
| Data integrity | Condominio text typos | Dropdown validated | ✅ |
| Audit trail | None | Full audit_logs | ✅ |

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| RLS policies rompen queries | 🟡 MEDIA | 🔴 ALTO | Test en staging antes deploy |
| JWT token expiry issues | 🟡 MEDIA | 🟡 MEDIO | Implementar refresh token flow |
| Audit_logs crece muy rápido | 🟢 BAJA | 🟡 MEDIO | Índices + partitioning después |
| Admin olvida contraseña | 🟢 BAJA | 🟡 MEDIO | Password reset endpoint día 2 |

---

## TIMELINE FINAL

```
17 SEPT (Día 1)
  09:00 - 10:00: Prep fase 0 (tablas, RLS)
  10:00 - 14:00: Auth admin login/logout/me ✅
  14:00 - 18:00: Wompi payment integration (separate track)

18 SEPT (Día 2)
  10:00 - 13:00: Dashboard shell + sidebar + navbar
  13:00 - 16:00: Dashboard overview page + KPIs

19 SEPT (Día 3)
  10:00 - 13:00: Usuarios CRUD + UI
  13:00 - 17:00: Actividades CRUD + UI

20 SEPT (Día 4)
  10:00 - 14:00: Asistencias endpoint + UI
  14:00 - 18:00: Condominios/Facilitadores CRUD

21 SEPT (Día 5)
  10:00 - 16:00: QA + mobile testing
  16:00 - 18:00: Deploy staging + final checks
  18:00 - 20:00: Production deployment

22 SEPT (LAUNCH DAY)
  08:00: Health checks
  09:00 - 12:00: Monitor en vivo
  12:00+: Operacional
```

---

## DECISIÓN FINAL RECOMENDADA

**✅ IMPLEMENTAR ADMIN DASHBOARD - FASE 1 COMPLETA**

**RAZÓN:**
- ✅ Realista con timeline (22 Sept)
- ✅ MVP funcional (no perfecto, pero completo)
- ✅ Sin breaking changes
- ✅ Rollback fácil
- ✅ Escalable después

**PRÓXIMOS PASOS:**
1. Elena aprueba diseño elegido (Diseño 1: Notion/Figma)
2. Mañana 17 Sept empezar Fase 0 en paralelo con Wompi
3. Daily standups 10:00-10:15 para tracking

**¿Listo para iniciar?**

