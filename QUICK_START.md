# ⚡ QUICK START - 5 MINUTOS

## 1️⃣ Clonar repositorio

```bash
git clone https://github.com/viveroonlinecomco-code/ClubSenior.git
cd ClubSenior
```

## 2️⃣ Instalar & verificar

```bash
npm install
npm run build      # Verifica que todo está OK
```

## 3️⃣ Configurar Supabase

### Opción A: Automática (Recomendado)

```bash
# 1. Abre: https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/settings/api

# 2. Copia Project URL y pégalo aquí (replace YOUR_...):
nano .env.local

# 3. Guarda archivo

# 4. Ejecuta setup
bash scripts/setup-supabase.sh
```

### Opción B: Manual

```bash
# 1. .env.local ya existe - solo reemplaza estos valores:
NEXT_PUBLIC_SUPABASE_URL=https://popgpdhtyhckvkjmiknq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<tu anon key>
SUPABASE_SERVICE_ROLE_KEY=<tu service role key>

# 2. Ve a Supabase SQL Editor
# 3. Ejecuta contenido de: supabase/migrations/001_init_schema.sql
# 4. (Opcional) Ejecuta: supabase/seed.sql para datos de ejemplo
```

## 4️⃣ Iniciar servidor

```bash
npm run dev
```

Abre: `http://localhost:3000`

## 5️⃣ Probar flujo

1. **Landing:** http://localhost:3000
2. **Login:** Click "Comenzar"
3. **Ingresa email** → recibe OTP en console logs
4. **Onboarding:** 3 pasos (datos → legal → plan)
5. **Pago:** En dev, Wompi no procesa realmente

---

## 📚 Documentación

- `SETUP_COMPLETE.md` - Setup detallado
- `README.md` - Visión general
- `ARCHITECTURE.md` - Arquitectura
- `DATABASE.md` - Schema de BD
- `WOMPI_TESTING.md` - Testing de pagos

---

## 🆘 Problema común

**"Missing Supabase credentials"**

```bash
# Verifica que .env.local tiene valores (no placeholders):
grep SUPABASE_URL .env.local

# Debe mostrar: NEXT_PUBLIC_SUPABASE_URL=https://popgpdhtyhckvkjmiknq.supabase.co
# NO: NEXT_PUBLIC_SUPABASE_URL=YOUR_VALUE_HERE
```

---

## ✅ Listo!

Ya puedes empezar a desarrollar. Siguiente checkpoint: Dashboard `/familia`

¡Que disfrutes! 🚀
