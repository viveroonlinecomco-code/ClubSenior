# 👀 GUÍA VISUAL PASO A PASO

## PASO 1: Clonar el proyecto

```bash
git clone https://github.com/viveroonlinecomco-code/Grupo Plateado.git
cd Grupo Plateado
```

---

## PASO 2: Instalar npm packages

```bash
npm install
```

Espera a que termine (~2 minutos)

---

## PASO 3: Obtener credenciales de Supabase

### ➡️ Abre esta URL en tu navegador:

```
https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/settings/api
```

### 🔍 Busca y copia estos 3 valores:

#### Valor 1️⃣: Project URL

```
Ubícalo en: Settings → API → Project URL
Copia: https://popgpdhtyhckvkjmiknq.supabase.co
```

#### Valor 2️⃣: Publishable Key (anon key)

```
Ubícalo en: Settings → API → Project API keys → anon public
Copia: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx...
```

#### Valor 3️⃣: Service Role Key

```
Ubícalo en: Settings → API → Project API keys → service_role
Copia: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyy...

⚠️ CUIDADO: Esta key es secreta - no la compartas!
```

---

## PASO 4: Completar `.env.local`

### 📝 Abre el archivo:

```bash
# En tu editor favorito:
# Grupo Plateado/.env.local
```

### ✏️ Reemplaza estos valores:

```env
# ANTES (placeholders):
NEXT_PUBLIC_SUPABASE_URL=https://popgpdhtyhckvkjmiknq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY_HERE_REPLACE_ME
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE_REPLACE_ME

# DESPUÉS (con tus valores reales):
NEXT_PUBLIC_SUPABASE_URL=https://popgpdhtyhckvkjmiknq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyy...
```

### 💾 Guarda el archivo

---

## PASO 5: Ejecutar migraciones de BD

### ➡️ Abre esta URL:

```
https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/sql
```

### ➕ Click en: `+ New Query`

### 📋 Copia TODO el contenido de:

```
Tu proyecto Grupo Plateado → supabase/migrations/001_init_schema.sql
```

### ▶️ Click en: `RUN` (esquina superior derecha)

Espera a que termine (30-60 segundos)

---

## PASO 6 (OPCIONAL): Cargar datos de ejemplo

### ➡️ En la misma página SQL (https://supabase.com/dashboard/.../sql)

### ➕ Click en: `+ New Query` (nueva query)

### 📋 Copia TODO el contenido de:

```
Tu proyecto Grupo Plateado → supabase/seed.sql
```

### ▶️ Click en: `RUN`

Esto crea:
- 3 condominios de ejemplo
- 3 planes de precios
- 5 actividades de ejemplo

---

## PASO 7: Verificar que funciona

```bash
# En terminal, dentro de Grupo Plateado/

# Verificar tipos TypeScript
npm run typecheck

# Verificar linter
npm run lint

# Construir para producción
npm run build
```

Todo debe estar en verde ✅

---

## PASO 8: Iniciar servidor de desarrollo

```bash
npm run dev
```

Verás algo como:

```
> club-saberes-web@0.1.0 dev
> next dev

  ▲ Next.js 16.3.4
  - Local:        http://localhost:3000
```

---

## PASO 9: Abrir en navegador

### 🌐 Abre esta URL:

```
http://localhost:3000
```

Deberías ver la **Landing Page** con:
- Hero section (título grande)
- Features (3 columnas)
- Pricing (planes)
- Button "Comenzar"

---

## PASO 10: Probar flujo completo

### 1. Landing Page
```
http://localhost:3000
```
✅ Ves el contenido principal

### 2. Click "Comenzar"
```
→ Te redirige a http://localhost:3000/auth/signin
```

### 3. Ingresa tu email
```
Ejemplo: tu@email.com
```
✅ Ves "Enviar código"

### 4. Recibe OTP
```
⚠️ En desarrollo, el código aparece en la consola del navegador:
- Abre DevTools (F12)
- Ve a Console
- Busca: "OTP:"
```

### 5. Ingresa el código
```
Verás algo como: OTP: 123456
Cópialo y pega en el form
```

### 6. Click "Verificar"
```
✅ Te redirige a http://localhost:3000/inscribir
```

### 7. Onboarding - Step 1
```
Rellena:
- Nombre: Tu nombre
- Email: tu@email.com
- Teléfono: 3001234567
- Nombre participante: Abuelo/a
- Edad: 75
- Género: Masculino
- Autonomía: Independiente
- Condominio: Hacienda Oasis
- Parentesco: Nieto

Click "Siguiente"
```

### 8. Onboarding - Step 2
```
✅ Lee términos (scroll down)
✅ Click checkbox "Acepto"
Click "Siguiente"
```

### 9. Onboarding - Step 3
```
Selecciona un plan:
- Mensual: $160.000
- Trimestral: $450.000

Click "Proceder al pago"
```

### 10. Success Page
```
✅ Ves confirmación con referencia de pago
✅ En desarrollo, el pago NO se procesa realmente
```

---

## ✅ ÉXITO!

Si llegaste hasta aquí, **TODO FUNCIONA** ✨

---

## 🔗 URLs Útiles

| Función | URL |
|---------|-----|
| Dashboard Supabase | https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq |
| API Settings | https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/settings/api |
| SQL Editor | https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/sql |
| GitHub Repo | https://github.com/viveroonlinecomco-code/Grupo Plateado |
| App Local | http://localhost:3000 |

---

## 🆘 Si algo no funciona

### Error: "Cannot read properties of null"

```bash
# Solución:
# 1. Verifica que .env.local tiene valores reales (no placeholders)
# 2. Reinicia: npm run dev
# 3. Borra cache: rm -rf .next && npm run build
```

### Error: "RLS policies"

```bash
# Solución:
# 1. Verifica que ejecutaste la migración SQL
# 2. Ve a: https://supabase.com/dashboard/.../sql
# 3. Ejecuta nuevamente: supabase/migrations/001_init_schema.sql
```

### Email OTP no aparece en console

```bash
# En el navegador:
# 1. Abre DevTools (F12)
# 2. Ve a tab "Console"
# 3. Deberías ver mensajes de log
# 4. Si no aparecen, busca errores rojos
```

---

## 📚 Documentación Completa

Una vez que todo funcione, revisa:

- `SETUP_COMPLETE.md` - Setup detallado
- `README.md` - Descripción general
- `ARCHITECTURE.md` - Cómo está construido
- `WOMPI_TESTING.md` - Testing de pagos

---

## 🚀 ¡Ahora sí, a desarrollar!

Siguiente checkpoint: **CHECKPOINT 5 - Dashboard**

¿Preguntas? Revisa la documentación en el repo. 💪
