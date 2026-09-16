# ⚡ QA RÁPIDO - 30 MIN
**Admin Dashboard MVP - Testing Final**

---

## 🎬 EMPEZAR AHORA

```bash
npm run dev
# Abre: http://localhost:3000/admin/login
```

---

## ✅ 7 TESTS (5 min cada uno)

### TEST 1: Login ✅
```
Input: email="promesaobca@gmail.com", password="[tu_password]"
Expected: Redirige a /admin/dashboard
❌ Si falla: revisa credenciales
```

### TEST 2: Dashboard ✅
```
Debes ver:
- Título "Bienvenida Elena 👋"
- Sidebar con 4 links
- 3 KPI cards
- 3 botones acciones

Expected: TODO visible y clickeable
```

### TEST 3: Crear Actividad ✅
```
Click: Actividades → Nueva Actividad
Input:
  Título: "Yoga Test"
  Condominio: "Generación Silver"
  Fecha: Mañana (auto completa)
  Hora inicio: 14:00
  Hora fin: 15:00
Click: "Crear Actividad"

Expected: ✅ "Actividad creada exitosamente"
Expected: Aparece en tabla abajo
```

### TEST 4: Listar Usuarios ✅
```
Click: Usuarios
Search: "Elena"

Expected: Tabla carga con usuarios
Expected: Búsqueda filtra nombres
```

### TEST 5: Marcar Asistencias ✅
```
Click: Asistencias
Select: "Yoga Test" (la que creaste)

Expected: Carga participantes en checkboxes
Expected: Click checkbox = toggle
Expected: Contador actualiza

Marca 2-3 participantes
Click: "Guardar Asistencias"

Expected: ✅ "X asistencias registradas"
```

### TEST 6: Logout ✅
```
Sidebar: Click "Logout"

Expected: Redirige a /admin/login
Expected: localStorage borrado
```

### TEST 7: Seguridad ✅
```
Abre incógnita
Accede a: localhost:3000/admin/dashboard

Expected: ❌ Redirige a /admin/login (sin permiso)
```

---

## 📱 MOBILE RÁPIDO (5 min)

```
Chrome DevTools → F12 → Toggle device toolbar

Tests:
☐ Desktop (1200px) → buttons clickeables
☐ Tablet (768px) → responsive
☐ Mobile (375px) → no scroll horizontal (excepto tablas)
```

---

## 📋 RESULTADO

```
✅ SI TODOS 7 TESTS PASAN:

1. Abre terminal
2. git status → clean
3. git log --oneline | head -3
   Debería mostrar:
   - 0d94bf9 feat: Admin dashboard Phase 3
   - bab2c5c feat: Admin dashboard Phase 2
   - a6f423c feat: Admin dashboard Phase 1

4. Avísame: "QA APROBADO ✅"

Entonces haré:
→ git push origin main
→ Deploy staging
→ Deploy production

5. LANZAMIENTO 22 SEPT ✅
```

---

## 🆘 SI ALGO FALLA

```
Error en login:
  → Verifica email/password
  → Revisa console (F12)
  
Error al crear actividad:
  → Verifica BD tiene tabla asistencias
  → Revisa endpoint /api/admin/actividades

Error al marcar asistencias:
  → Verifica que participantes existen en BD
  → Revisa endpoint GET /api/admin/asistencias/marcar

Cualquier error:
  → Avísame con screenshot + error en console
```

---

## ⏱️ TIMELINE

```
17 Sept 14:30 - Testing starts
17 Sept 15:00 - QA completo (Elena)
17 Sept 15:30 - git push + Deploy
17 Sept 16:00 - Production live
```

---

**¿EMPEZAMOS?** 👇
