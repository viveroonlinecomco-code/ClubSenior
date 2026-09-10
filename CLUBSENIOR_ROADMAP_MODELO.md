# 🎯 CLUBSENIOR - ROADMAP DEL MODELO CORRECTO

**Objetivo:** Familia se registra → Agrega abuelos → Ve sesiones → Registra asistencia → Lee reportes

---

## FASE 1: USUARIOS + SUSCRIPCIONES (ACTUAL)

```
✅ /inscribir (Datos familia)
✅ /planes (Elige plan)
✅ /familia (Dashboard básico)
✅ /api/suscripcion/create
✅ /api/suscripcion/cancel
```

**Modelo BD:**
```
USUARIOS (familia)
  └─ SUSCRIPCIONES (plan comprado)
```

---

## FASE 2: AGREGAR PARTICIPANTES (PRÓXIMO - 30 MIN)

```
✅ POST /api/participantes/create
   └─ Vincula ABUELOS a USUARIO

✅ GET /api/participantes/list
   └─ Lista abuelos del usuario

✅ Nueva ruta: /participantes
   └─ Form para agregar abuelo
   └─ Mostrar lista de abuelos
```

**Modelo BD:**
```
USUARIOS (familia)
  ├─ SUSCRIPCIONES (plan)
  └─ PARTICIPANTES (abuelos)
```

---

## FASE 3: ACTIVIDADES + ASISTENCIA (1 HORA)

```
✅ GET /api/actividades/proximas
   └─ Lista sesiones semanales

✅ POST /api/asistencias/registrar
   └─ Marca participante asistió

✅ Nueva sección en /familia
   └─ "Próximas Sesiones"
   └─ "Asistencia" tab
```

**Modelo BD:**
```
USUARIOS (familia)
  ├─ SUSCRIPCIONES
  ├─ PARTICIPANTES
  │  └─ ASISTENCIAS (a ACTIVIDADES)
  └─ ACTIVIDADES (sesiones)
```

---

## FASE 4: REPORTES SEMANALES (1.5 HORAS)

```
✅ POST /api/reportes/crear
   └─ Facilitador reporta semana

✅ GET /api/reportes/lista
   └─ Familia ve reportes del abuelo

✅ Nueva sección en /familia
   └─ "Reportes Semanales" tab
   └─ Expandible con feedback
```

**Modelo BD COMPLETO:**
```
USUARIOS (familia)
  ├─ SUSCRIPCIONES
  ├─ PARTICIPANTES
  │  ├─ ASISTENCIAS
  │  └─ REPORTES_SEMANALES
  └─ ACTIVIDADES (sesiones)
```

---

## FASE 5: PAGOS REALES - WOMPI (3 HORAS)

```
✅ POST /api/pagos/crear
   └─ Envía a Wompi

✅ /api/webhooks/wompi
   └─ Recibe confirmación

✅ Cambiar estado SUSCRIPCIÓN
   └─ PAYMENT_PENDING → ACTIVE
```

---

## SQL PARA EJECUTAR AHORA

Elena, ejecuta esto en Supabase para preparar TODA la estructura:

```sql
-- PLANES
DELETE FROM planes WHERE true;
INSERT INTO planes (nombre, descripcion, precio_cop, frecuencia, duracion_dias, activo) VALUES
('Plan Mensual - 4 Sesiones', '4 sesiones de 2 horas. Válido 6 semanas.', 150000, 'mensual', 42, true),
('Pago por Sesión', 'Paga $40k por sesión de 2 horas.', 40000, 'mensual', 1, true);

-- CONDOMINIOS (Donde viven abuelos)
INSERT INTO condominios (nombre, direccion, ciudad, activo) VALUES
('Condominio Central', 'Cra 1 #1-1', 'Bogotá', true)
ON CONFLICT DO NOTHING;

-- LIMPIAR OTRAS TABLAS
DELETE FROM suscripciones WHERE true;
DELETE FROM participantes WHERE true;
DELETE FROM actividades WHERE true;
DELETE FROM asistencias WHERE true;
DELETE FROM reportes_semanales WHERE true;

-- VERIFICAR
SELECT 
  (SELECT COUNT(*) FROM planes) as planes,
  (SELECT COUNT(*) FROM condominios) as condominios,
  (SELECT COUNT(*) FROM usuarios) as usuarios;
```

**Resultado esperado:**
```
planes: 2
condominios: 1
usuarios: 1
```

---

## CÓDIGO QUE VOY A CREAR AHORA

**Nuevas rutas:**

1. `/participantes` - Agregar/ver abuelos
2. `/api/participantes/create` - Crear participante
3. `/api/participantes/list` - Listar participantes del usuario
4. `/api/actividades/proximas` - Próximas sesiones
5. `/api/asistencias/registrar` - Marcar asistencia
6. `/api/reportes/lista` - Ver reportes semanales

**Dashboard actualizado:**

- Tab "Participantes" - Listar abuelos
- Tab "Sesiones" - Próximas actividades + asistencia
- Tab "Reportes" - Feedback semanal del facilitador

---

## FLUJO COMPLETO DEL USUARIO FINAL

```
1. Familia ingresa: /inscribir
2. Verifica OTP
3. Ve dashboard /familia
4. Haz clic "Agregar Participante"
5. Llena: Nombre, edad, género del abuelo
6. Elige plan: "Plan Mensual"
7. Confirm pago (Wompi) ← Próximo
8. Dashboard muestra:
   - Suscripción activa ✅
   - Participantes (abuelos) ✅
   - Próximas sesiones ← Próximo
   - Asistencia ← Próximo
   - Reportes del facilitador ← Próximo
```

---

## CRONOGRAMA

- **HOY:** Estructura BD + SQL (30 min) ✅
- **Ahora:** Agregar /participantes routes (30 min)
- **Después:** Actividades + Asistencia (1 hora)
- **Luego:** Reportes (1.5 horas)
- **Finalmente:** Wompi Payments (3 horas)

---

**¿Ejecuto el SQL y creo las rutas de PARTICIPANTES?** 🚀
