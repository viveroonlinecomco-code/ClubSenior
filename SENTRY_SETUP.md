# 🚨 Sentry Setup - Error Tracking

## Paso 1: Crear cuenta en Sentry

1. Ir a https://sentry.io
2. Crear cuenta (o login si ya tienes)
3. Crear nuevo proyecto
4. Seleccionar "Next.js"
5. Copiar el `SENTRY_DSN`

---

## Paso 2: Agregar variables de entorno

### En `.env.local` (desarrollo)

```bash
NEXT_PUBLIC_SENTRY_DSN=https://XXX@XXX.ingest.sentry.io/XXX
SENTRY_AUTH_TOKEN=sntrys_XXXX (opcional, para source maps)
```

### En Vercel Environment Variables (producción)

1. Ir a Vercel → Project Settings → Environment Variables
2. Agregar:
   - `NEXT_PUBLIC_SENTRY_DSN` → valor de Sentry
   - `SENTRY_AUTH_TOKEN` (opcional)

---

## Paso 3: Instalar paquetes

```bash
npm install --save @sentry/nextjs
```

---

## Paso 4: Crear `sentry.client.config.js`

```javascript
// sentry.client.config.js

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  // Integrations
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Sampling
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Release
  release: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
});
```

---

## Paso 5: Crear `sentry.server.config.js`

```javascript
// sentry.server.config.js

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  release: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
});
```

---

## Paso 6: Crear `sentry.edge.config.js`

```javascript
// sentry.edge.config.js

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  tracesSampleRate: 1.0,
  release: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
});
```

---

## Paso 7: Crear `next.config.js` (actualizado)

```javascript
// next.config.js

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // tu config aquí
};

export default withSentryConfig(
  nextConfig,
  {
    org: "your-org", // Tu organización en Sentry
    project: "clubsenior", // Tu proyecto en Sentry
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: true,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
  }
);
```

---

## Paso 8: Usar en endpoints

### En endpoints API

```typescript
// src/app/api/ejemplo/route.ts

import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  try {
    // Tu código aquí
    
  } catch (error) {
    Sentry.captureException(error, {
      contexts: {
        request: {
          method: request.method,
          url: request.url,
        },
      },
    });
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### En componentes React

```typescript
// src/app/components/ejemplo.tsx

"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Example() {
  useEffect(() => {
    try {
      // Tu código aquí
      
    } catch (error) {
      Sentry.captureException(error);
    }
  }, []);

  return <div>...</div>;
}
```

---

## Paso 9: Test en desarrollo

```bash
# Generar error de prueba

curl -X POST http://localhost:3000/api/test-error
```

Deberías verlo aparecer en Sentry dashboard en unos segundos.

---

## Paso 10: Deploy a Vercel

```bash
git add .
git commit -m "feat: Sentry error tracking integration"
git push

# Vercel auto-deploy
```

---

## ✅ Verificación

1. Ir a https://sentry.io → Tu proyecto
2. Esperar eventos
3. Deberías ver errores cuando sucedan

---

## 🎯 Monitoreo en Producción

### Métricas importantes

- **Error Rate**: % de requests que fallan
- **P95 Response Time**: 95% de requests más lentos
- **User Feedback**: Errores reportados por usuarios

### Alertas recomendadas

1. Quando error rate > 5% en 5 minutos
2. Cuando crash > 10 en 10 minutos
3. Cuando P95 response time > 3s

---

## 📚 Documentación

- https://docs.sentry.io/platforms/javascript/guides/nextjs/
- https://docs.sentry.io/product/alerts/create-alerts/

---

## 🚀 Próximos pasos

Una vez configurado Sentry:
1. Monitorear errores en producción
2. Crear alerts para valores críticos
3. Revisar sesiones de usuario donde falla
4. Optimizar basado en datos

---

**Tiempo setup:** ~15 minutos  
**Impacto:** 🟥 CRÍTICO para debugging en producción
