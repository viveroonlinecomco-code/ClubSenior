# 🚀 Instrucciones para Pushear Cambios Globales

## ✅ Cambios Realizados

### Branding Global
- **Cambio 1**: ClubSenior → **Grupo Plateado** (154 ocurrencias en 51 archivos)
- **Cambio 2**: promesaobca@gmail.com → **servicioalcliente@tardesdelcafe.com** (13 ocurrencias)

### Commit Details
```
commit 3321704aaee8acde807810bbe48db0260bf4e34d
Author: Elena Jardinero <elena@tardesdelcafe.com>

refactor: Global branding update - ClubSenior → Grupo Plateado, 
promesaobca@gmail.com → servicioalcliente@tardesdelcafe.com

51 files changed, 162 insertions(+), 162 deletions(-)
```

---

## 📋 Archivos Modificados Principales

### Landing Page & Familia
- ✅ `src/app/page.tsx` - Landing page con "Grupo Plateado"
- ✅ `src/app/familia/page.tsx` - Dashboard con nuevo correo
- ✅ `src/components/marketing/hero-section.tsx` - Hero con "Grupo Plateado"
- ✅ `src/components/auth/signin-form.tsx` - Auth form updated

### Pages de Información
- ✅ `src/app/terminos/page.tsx` - Términos con nuevo correo
- ✅ `src/app/privacidad/page.tsx` - Privacidad con nuevo correo
- ✅ `src/app/planes/page.tsx` - Planes con branding actualizado

### Formularios & Contratos
- ✅ `src/app/inscribir/components/step2b-contratos-form.tsx` - Contratos con nuevo correo
- ✅ `src/app/inscribir/components/step2-form.tsx` - Formulario con nuevo branding

### Email & Servicios
- ✅ `src/lib/email/index.ts` - Templates de email con nuevo branding
- ✅ `src/services/payments-simple.ts` - Notificaciones de pago
- ✅ `src/app/api/auth/send-otp/route.ts` - OTP emails

### Documentación
- ✅ 29 archivos `.md` actualizados (README, SETUP, etc)
- ✅ Todos los documentos ahora usan "Grupo Plateado"

---

## 🔧 Cómo Pushear

### Opción 1: Desde Terminal (Recomendado)
```bash
cd /ruta/a/ClubSenior

# El commit ya está hecho localmente
# Solo pushea:
git push origin main

# Si pide credenciales:
# - Username: tu_usuario_github
# - Password: tu_personal_access_token (no la password de GitHub)
```

### Opción 2: GitHub CLI (Si tienes instalado)
```bash
cd /ruta/a/ClubSenior
gh auth login  # Si no estás autenticado
git push origin main
```

### Opción 3: GitHub Desktop
1. Abre GitHub Desktop
2. Selecciona "ClubSenior" en "Current Repository"
3. Haz clic en "Push origin" (botón arriba a la derecha)

---

## ✨ Verificar Cambios

### Ver el commit en GitHub
1. Abre: https://github.com/viveroonlinecomco-code/ClubSenior
2. Ve a la pestaña "Commits"
3. Busca: "Global branding update"

### Ver cambios específicos
```bash
# Ver diff del commit
git show 3321704aaee8acde807810bbe48db0260bf4e34d

# Ver cambios en archivo específico
git show 3321704:src/app/page.tsx | grep "Grupo Plateado"
```

### Verificar en Landing Page
Una vez pushed:
1. Vercel re-deployará automáticamente
2. Abre: https://tardesdelcafe.com (o tu dominio)
3. Verifica que:
   - Título diga "Grupo Plateado"
   - Correo sea "servicioalcliente@tardesdelcafe.com"
   - Formularios e emails reflejen los cambios

---

## 📞 Contacto & Soporte

Si necesitas ayuda:
- Email de contacto actualizado: **servicioalcliente@tardesdelcafe.com**
- Marca: **Grupo Plateado**

---

## 📝 Notas Importantes

- **No hay cambios en código funcional**, solo strings
- **Todas las tablas y APIs funcionan igual**
- **Vercel auto-redeploy** cuando pushees a main
- **DNS debe apuntar a tardesdelcafe.com** para producción

---

Commit: 3321704
Date: 15 de Septiembre 2026
Branch: main
