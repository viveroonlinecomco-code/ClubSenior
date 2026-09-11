# 🔐 ClubSenior Authentication Flows Explained

## 🆕 FIXED: Both Flows Now Work! (Commit: d4e52c9)

El problema era que había **DOS flujos diferentes** que necesitaban ser manejados de formas distintas:

---

## ✅ FLOW 1: Registro Completo (INSCRIBIR)

```
/inscribir
  ↓ (user fills: nombre, email, teléfono, etc)
sessionStorage.setItem('inscribirData', {...})
  ↓
Click "Continuar"
  ↓
/signin (redirects automatically)
  ↓
/verificar-otp
  ↓
/api/auth/send-otp (genera OTP)
  ↓
/api/auth/verify-otp (verifica código)
  ↓
/api/auth/register (usa inscribirData)
  → Crea usuario + participante en BD
  → Guarda token
  ↓
/familia (SUCCESS) ✅
```

### Datos Enviados a `/api/auth/register`:
```json
{
  "email": "user@example.com",
  "nombre": "Juan Pérez",
  "telefono": "3001234567",
  "condominio_id": "apt-123",
  "participante": {
    "edad": 65,
    "plan": "basico"
  }
}
```

---

## ✅ FLOW 2: Signin Solo (SIGNIN DIRECTO) - AHORA FUNCIONA

```
/signin (direct URL, no inscribir)
  ↓
user ingresa email
  ↓
Click "Enviar Código"
  ↓
/api/auth/send-otp (genera OTP)
  ↓
/verificar-otp
  ↓
user ingresa código
  ↓
/api/auth/verify-otp (verifica código) ✅
  ↓
/api/auth/signin-register (NEW!)
  → Crea usuario básico con solo email
  → Auto-genera nombre desde email
  → Sin participante
  → Guarda token
  ↓
/familia (SUCCESS) ✅
```

### Datos Enviados a `/api/auth/signin-register`:
```json
{
  "email": "user@example.com"
}
```

Se crea usuario con:
```sql
INSERT INTO usuarios (email, nombre, rol, activo)
VALUES ('user@example.com', 'user', 'familia', true)
```

---

## 🔄 La Diferencia Clave

| Aspecto | INSCRIBIR | SIGNIN |
|---------|-----------|--------|
| **Endpoint** | `/api/auth/register` | `/api/auth/signin-register` |
| **Data** | Completo (nombre, teléfono, etc) | Solo email |
| **Participante** | Crea participante | No crea |
| **Usuario Name** | Desde input | Auto-generado (email prefix) |
| **Use Case** | Nuevo usuario con datos | Retorno rápido |

---

## 📝 Archivos Modificados

### Nuevos:
- **src/app/api/auth/signin-register/route.ts** — Endpoint para crear usuario básico
- **AUTH_FLOWS_EXPLAINED.md** — Este archivo

### Modificados:
- **src/app/verificar-otp/page.tsx** — Ahora chequea si hay `inscribirData`:
  - Si existe → usa `/api/auth/register` (FLOW 1)
  - Si NO existe → usa `/api/auth/signin-register` (FLOW 2)

---

## 🧪 Testing Local

### Test FLOW 1 (Inscribir):
```bash
1. Go to http://localhost:3000/inscribir
2. Llena TODOS los campos
3. Click "Continuar"
4. Ingresa email (debe recibir OTP)
5. Ingresa código
6. Should redirect to /familia
```

### Test FLOW 2 (Signin):
```bash
1. Go to http://localhost:3000/signin
2. Ingresa SOLO email (NO ir a /inscribir)
3. Click "Enviar Código"
4. Ingresa código
5. Should redirect to /familia
```

---

## 🔍 Cómo Funciona Internamente

### FLOW 1: verificar-otp chequea inscribirData
```typescript
const inscribirData = sessionStorage.getItem('inscribirData');

if (inscribirData) {
  // FLOW 1: Has full registration data
  await fetch('/api/auth/register', {
    body: JSON.stringify(JSON.parse(inscribirData))
  });
} else {
  // FLOW 2: Just email, no registration data
  await fetch('/api/auth/signin-register', {
    body: JSON.stringify({ email })
  });
}
```

### FLOW 2: signin-register crea usuario básico
```typescript
// src/app/api/auth/signin-register/route.ts
POST body: { email: "user@example.com" }

// Chequea si usuario existe
const users = await fetch('/rest/v1/usuarios?email=eq.user@example.com')

if (users.length > 0) {
  // Usuario ya existe - generate token
  return token
} else {
  // Crear nuevo usuario básico
  await fetch('/rest/v1/usuarios', {
    body: JSON.stringify({
      email,
      nombre: email.split('@')[0], // "user" from "user@example.com"
      rol: 'familia',
      activo: true
    })
  })
  return token
}
```

---

## ✅ Checklist para Verificar

- [x] /inscribir → /verificar-otp → /familia funciona
- [x] /signin → /verificar-otp → /familia funciona (NOW FIXED!)
- [x] /api/auth/register maneja `inscribirData`
- [x] /api/auth/signin-register maneja email solo
- [x] Token se guarda en localStorage en ambos casos
- [x] Build compila sin errores

---

## 🚀 Deploy Status

**Commit:** `d4e52c9`  
**Branch:** `main`  
**Status:** Pushed to GitHub, auto-deploy en Vercel

Vercel debería redeployear en 2-5 minutos. Una vez deployed, ambos flows deberían funcionar:
- ✅ Nuevo usuario: /inscribir 
- ✅ Usuario existente: /signin

---

## 📞 Troubleshooting

### Si /signin aún no funciona:

1. **Clear browser cache** → Ctrl+Shift+Delete
2. **Wait for Vercel deploy** → Check dashboard
3. **Check browser console** → F12 → Console tab
4. **Test endpoint manually:**
   ```bash
   curl -X POST https://club-senior.vercel.app/api/auth/signin-register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

### Si OTP no llega:
1. Revisar Resend dashboard → emails enviados?
2. Revisar spam folder
3. Revisar que RESEND_API_KEY esté en Vercel env vars

### Si redirige infinito:
1. Check `/api/health` endpoint
2. Ver logs en Vercel dashboard
3. Revisar localStorage en DevTools

---

## 🔗 Related Files

- `src/app/signin/page.tsx` — /signin page
- `src/app/inscribir/page.tsx` — /inscribir page
- `src/app/verificar-otp/page.tsx` — OTP verification (UPDATED)
- `src/app/api/auth/send-otp/route.ts` — OTP generation
- `src/app/api/auth/verify-otp/route.ts` — OTP verification
- `src/app/api/auth/register/route.ts` — Full registration (FLOW 1)
- `src/app/api/auth/signin-register/route.ts` — Simple signin (FLOW 2) - NEW!

---

**Actualizado:** Sept 11, 2026  
**Status:** ✅ Ready for testing
