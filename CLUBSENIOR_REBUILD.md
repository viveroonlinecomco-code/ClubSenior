# 🔨 CLUBSENIOR - REESTRUCTURACIÓN COMPLETA (AUDIT + FIX)

**Fecha:** 10 Septiembre 2026  
**Estado:** READY TO EXECUTE  
**Tiempo:** 5 minutos

---

## 🔍 AUDITORÍA ENCONTRADA

### Tabla PLANES
```
❌ Tenía datos viejos: 
   - Mensual ViveroOnline - $160,000
   - Trimestral ViveroOnline - $450,000

✅ Debería tener:
   - Plan Mensual - 4 Sesiones - $150,000 (42 días)
   - Pago por Sesión - $40,000 (1 día)
```

### Tabla USUARIOS
```
✅ Estructura correcta
✅ 1 registro: viveroonline.com.co@gmail.com
✅ Campos: id, email, phone, created_at, updated_at
```

### Tabla PROFILES
```
✅ Estructura existe
❌ Probablemente vacía (vieja tabla de auth)
⚠️ Posible FK a auth.users (bloqueante)
```

### Tabla SUSCRIPCIONES
```
❓ Estructura desconocida (Elena no ejecutó query)
⚠️ Probablemente apunta a PROFILES en lugar de USUARIOS
🔧 SOLUCIÓN: Recriar con FK correctas a USUARIOS
```

---

## 🚀 PLAN DE ACCIÓN

### PASO 1: Ejecutar SQL en Supabase (5 min)

Ve a: **https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/sql**

**Copia y pega ESTO:**

```sql
-- LIMPIAR PLANES
DELETE FROM planes WHERE true;

-- INSERTAR NUEVOS PLANES
INSERT INTO planes (nombre, descripcion, precio_cop, frecuencia, duracion_dias, activo) VALUES
('Plan Mensual - 4 Sesiones',
 '4 sesiones de 2 horas cada una. Válido por 6 semanas. Si faltas, sin problema - tienes tiempo extra para usar tus sesiones.',
 150000,
 'mensual',
 42,
 true),
('Pago por Sesión',
 'Paga solo por lo que usas. $40,000 por sesión de 2 horas. Sin compromisos ni contratos.',
 40000,
 'mensual',
 1,
 true);

-- VERIFICAR
SELECT id, nombre, precio_cop, frecuencia, duracion_dias FROM planes;
```

**Resultado esperado:**
```
2 filas retornadas:
✅ Plan Mensual - 4 Sesiones | 150000 | mensual | 42
✅ Pago por Sesión | 40000 | mensual | 1
```

---

### PASO 2: Limpiar Suscripciones

```sql
-- Eliminar suscripciones viejas
DELETE FROM suscripciones WHERE true;

-- Verificar
SELECT COUNT(*) FROM suscripciones;
-- Resultado: 0
```

---

### PASO 3: Recrear tabla SUSCRIPCIONES (SI ES NECESARIO)

**Ejecuta PRIMERO esto para ver la estructura:**

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'suscripciones' 
ORDER BY ordinal_position;
```

**Si la estructura NO tiene estos campos, ejecuta:**

```sql
DROP TABLE IF EXISTS suscripciones CASCADE;

CREATE TABLE suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES planes(id),
  estado TEXT NOT NULL DEFAULT 'ACTIVE',
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  fecha_cancelacion TIMESTAMP,
  razon_cancelacion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suscripciones_all" ON suscripciones FOR ALL USING (true);
```

---

### PASO 4: Verificar TODO está OK

```sql
SELECT 
  (SELECT COUNT(*) FROM planes) as planes,
  (SELECT COUNT(*) FROM usuarios) as usuarios,
  (SELECT COUNT(*) FROM suscripciones) as suscripciones;
```

**Resultado esperado:**
```
planes: 2
usuarios: 1  
suscripciones: 0
```

---

## ✅ EL CÓDIGO ESTÁ LISTO

Los endpoints ya están correctamente implementados:

✅ `/api/suscripcion/create` - Usa usuario_id (correcto)  
✅ `/api/suscripcion/cancel` - Usa suscripcion_id (correcto)  
✅ `/api/dashboard/data` - Valida token (correcto)  

---

## 🎯 FLUJO COMPLETO DESPUÉS DE LA REESTRUCTURA

```
1. Usuario entra email en /inscribir
2. Recibe OTP por email
3. Verifica OTP en /verificar-otp
4. Se crea en tabla USUARIOS
5. Token guardado en localStorage
6. Redirige a /familia
7. Botón "Crear Suscripción" → /planes
8. Elige plan → API /api/suscripcion/create
9. Inserta en SUSCRIPCIONES (usuario_id → USUARIOS)
10. Redirige a /familia
11. Dashboard muestra suscripción activa ✅
```

---

## 📝 CHECKLIST

- [ ] Ejecutaste SQL de PLANES
- [ ] Ejecutaste SQL de SUSCRIPCIONES (si es necesario)
- [ ] Verificaste counts (planes: 2, usuarios: 1, suscripciones: 0)
- [ ] El app está en https://club-senior.vercel.app (listo)
- [ ] Probaste flujo completo desde /inscribir

---

## 🚀 PRÓXIMOS PASOS

1. **Wompi Payments** (3-4 horas)
   - Integración de pagos reales
   - Webhook de confirmación
   - Email de recepción

2. **Dashboard Datos Reales** (1-2 horas)
   - Mostrar suscripción del usuario
   - Mostrar participantes
   - Mostrar pagos

3. **Admin Panel** (4-5 horas)
   - Facilitadores ven participantes
   - Registran asistencia
   - Generan reportes

---

**¿Ejecutas los SQL ahora?** 🚀
