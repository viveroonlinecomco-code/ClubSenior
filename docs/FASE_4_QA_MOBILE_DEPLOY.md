# FASE 4 - QA + MOBILE RESPONSIVE + DEPLOY
**ClubSenior Admin Dashboard MVP**  
**17 Septiembre 2026 - 14:00 PM**

---

## 🧪 QA TESTING COMPLETO

### 1. LOGIN FLOW ✅

```
Test: /admin/login → Dashboard

☐ Acceder a http://localhost:3000/admin/login
  └─ Form visible: email + password + botón
  
☐ Test credenciales inválidas
  Input: email="test@test.com", password="wrong"
  Output: ❌ "Credenciales inválidas"
  
☐ Test email incorrecto (no Elena)
  Input: email="otro@test.com", password="cualquiera"
  Output: ❌ "No tienes acceso admin"
  
☐ Test credenciales correctas
  Input: email="promesaobca@gmail.com", password="[tu_password]"
  Output: ✅ Redirige a /admin/dashboard
  
☐ Verificar token guardado
  localStorage.admin_token → debe existir
  localStorage.admin_email → debe ser promesaobca@gmail.com

☐ Refresh page → no pierde estado
  F5 → debe estar en /admin/dashboard
  
☐ Logout
  Click botón "Logout" en sidebar
  Output: ✅ Redirige a /admin/login
  Token borrado de localStorage

☐ Seguridad: Sin login → /admin/dashboard
  Incógnita → ir a /admin/dashboard directo
  Output: ❌ Redirige a /admin/login
```

### 2. DASHBOARD OVERVIEW ✅

```
Test: /admin/dashboard

☐ Sidebar visible
  - Logo "🎯 Admin"
  - 4 links: Dashboard, Actividades, Asistencias, Usuarios
  - Botón Logout rojo
  
☐ Navbar visible
  - Hamburger menu (toggle sidebar)
  - Título "Admin Dashboard"
  - Nombre usuario "Elena"
  
☐ Content area
  - Título "Bienvenida Elena 👋"
  - 3 KPI cards visibles (usuarios, actividades, asistencias)
  - Botones acciones rápidas (clickeables)

☐ Navegación funciona
  Click en cada link → navega sin error
  - /admin/dashboard ✅
  - /admin/actividades ✅
  - /admin/asistencias ✅
  - /admin/usuarios ✅
```

### 3. CREAR ACTIVIDADES ✅

```
Test: /admin/actividades → POST crear actividad

☐ Form visible
  - Input: Título *
  - Select: Condominio *
  - Textarea: Descripción
  - Input: Fecha *
  - Input: Hora Inicio *
  - Input: Hora Fin *
  - Select: Módulo
  - Botón: ✅ Crear Actividad

☐ Validaciones: Campo obligatorio vacío
  Click "Crear" sin llenar
  Output: ❌ "Campos requeridos"

☐ Validación: Fecha pasada
  Input: fecha = "2026-09-10" (ayer)
  Output: ❌ "La fecha no puede ser en el pasado"

☐ Validación: Hora fin <= hora inicio
  Input: hora_inicio="15:00", hora_fin="14:00"
  Output: ❌ "La hora final debe ser posterior"

☐ Crear exitosa
  Input:
    Título: "Yoga Mañanero"
    Condominio: "Generación Silver"
    Fecha: "2026-09-18"
    Hora inicio: "14:00"
    Hora fin: "15:00"
    Módulo: "Física"
  Output: ✅ "Actividad creada exitosamente"
  
☐ Aparece en tabla
  Tabla abajo → "Yoga Mañanero" debe aparecer
  - Fecha: 18/09/2026
  - Condominio: Generación Silver
  - Hora: 14:00 - 15:00
  - Módulo: Física

☐ Form se limpia después
  Todos los inputs vacíos (excepto valores por defecto)

☐ Crear segunda actividad
  Repetir proceso
  Output: ✅ Tabla actualiza con 2 actividades
```

### 4. LISTAR USUARIOS ✅

```
Test: /admin/usuarios

☐ Tabla carga automáticamente
  Usuarios visibles con columnas:
  - Nombre
  - Email
  - Condominio
  - EPS
  - Registrado

☐ Búsqueda por nombre
  Input: q="Elena"
  Output: Filtra usuarios con "Elena" en nombre
  
☐ Búsqueda por email
  Input: q="rosseobca@hotmail.com"
  Output: Encuentra usuario específico

☐ Filtro por condominio
  Select: "Generación Silver"
  Output: Muestra solo usuarios de ese condominio

☐ Combinación búsqueda + filtro
  Input: q="Maria", condominio="Central"
  Output: Usuarios con "Maria" EN "Central"

☐ Sin resultados
  Input: q="XXXXX_NO_EXISTE"
  Output: "No se encontraron usuarios" (0 usuarios)

☐ Contador actualiza
  "📊 Resultados: X usuarios"
  Debe cambiar al filtrar
```

### 5. MARCAR ASISTENCIAS ✅

```
Test: /admin/asistencias

☐ Dropdown carga actividades
  Dropdown visible con lista actividades futuras
  Cada opción: "Yoga - 18/09/2026 (14:00)"

☐ Seleccionar actividad → carga participantes
  Click actividad → carga participantes
  Card info muestra:
  - 🎯 Yoga
  - 📍 Generación Silver
  - 📅 18/09/2026 a 14:00

☐ Grid de participantes
  Tarjetas con:
  - ☐ Checkbox
  - Nombre (bold)
  - Edad • Género (gris)

☐ Toggle checkbox
  Click en checkbox → marcar/desmarcar
  Click en card → toggle
  (2 formas de marcar)

☐ Contador actualiza
  "Asistentes: X/Total"
  Debe actualizar en tiempo real

☐ Color feedback
  Card sin asistencia: gris
  Card con asistencia: azul

☐ Guardar asistencias
  Marcar 3 de 5 participantes
  Click "✅ Guardar Asistencias"
  Output: ✅ "3 asistencias registradas"

☐ Guardar multiple times
  Cambiar estado de participantes
  Guardar de nuevo
  Output: ✅ Actualiza correctamente (upsert)

☐ Botón limpiar
  Click "Limpiar"
  Output: Limpia selección, vuelve a dropdown vacío
```

### 6. SEGURIDAD ✅

```
☐ JWT Token validation
  Modificar localStorage.admin_token
  Refresh → redirige a /admin/login

☐ RLS policies
  Endpoint responde solo con JWT válido
  
☐ Solo Elena puede acceder
  Cambiar email en código → error auth
  
☐ No roles complejos (Fase 2+)
  ✓ Confirmado en arquitectura

☐ Middleware funciona
  Sin token → redirige a /admin/login
  Con token expirado → error/redirige
```

---

## 📱 MOBILE RESPONSIVE

### Breakpoints de prueba

```
Desktop (1200px+)
├─ Sidebar visible
├─ Tablas full width
├─ Grid 3 columnas

Tablet (768px)
├─ Sidebar hamburger
├─ Tablas scroll horizontal
├─ Grid 2 columnas

Mobile (375px)
├─ Sidebar hamburger (drawer)
├─ Tablas scroll horizontal
├─ Grid 1 columna
├─ Buttons full width
```

### Checklist Mobile

```
☐ Login page
  - Form centrado
  - Botones clickeables (48px min)
  - Sin scroll horizontal
  
☐ Dashboard
  - Hamburger funcional
  - KPI cards stack vertical
  - Botones accesibles

☐ Actividades
  - Dropdown full width
  - Form inputs full width
  - Tabla scrollable horizontal
  - Buttons full width

☐ Usuarios
  - Filtros stack vertical en móvil
  - Tabla scrollable
  - Datos legibles

☐ Asistencias
  - Dropdown full width
  - Grid checkboxes 1 columna
  - Botones full width
  - Info card responsive

☐ Sidebar
  - Hamburger menu en <768px
  - Click fuera → cierra
  - Linkables 44px height min

☐ No scroll horizontal en body
  - Solo en tablas (permitido)
  - Todo el resto responsive
```

---

## 🚀 DEPLOY CHECKLIST

```
PRE-BUILD
─────────
☐ git status → clean
☐ npm run lint (si aplica)
☐ npm run build → sin errores

STAGING
───────
☐ npm run build ✅
☐ Verificar output
☐ Deploy a staging (Vercel)
☐ Test en staging:
  - /admin/login funciona
  - /admin/dashboard accesible
  - Endpoints responden
  - No errores en console

PRODUCTION
──────────
☐ git log --oneline
  Verificar 6 commits presentes:
  1. Fase 1: Login + Layout
  2. Fase 2: Actividades + Usuarios
  3. Fase 3: Asistencias
  4. Fase 4: Mobile + Adjustments (si hay)
  
☐ git push origin main
  ⚠️ SOLO DESPUÉS DE QA COMPLETO

☐ Deploy production
  - Vercel production
  - Monitor logs
  - Test endpoints vivos

☐ Post-launch monitoring (1h)
  - Errores de servidor
  - Performance
  - User flows completos
```

---

## 📋 ESTADO FINAL

```
BUILD: ✅
TESTING: ⏳ (en progreso)
MOBILE: ⏳ (en progreso)
DEPLOY: ⏳ (pending)

Timeline actual: 11h + 3h = 14h total
vs 16h plan = 2h AHORRO (87.5% efficiency)
```

---

## ✅ FIRMA FASE 4

**Estado**: LISTO PARA QA
**Commits pendientes**: 0 (todo ya commiteado, no pusheado)
**Merge**: ⛔ NO HACER HASTA TERMINAR FASE 4
**Fecha target**: 22 Septiembre 2026
