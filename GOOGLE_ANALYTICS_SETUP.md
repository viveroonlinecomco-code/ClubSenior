# 📊 Google Analytics 4 Setup

## Paso 1: Crear cuenta de Google Analytics

1. Ir a https://analytics.google.com
2. Crear cuenta nueva (o usar existente)
3. Crear propiedad "Grupo Plateado"
4. Seleccionar "Web"
5. Completar datos:
   - Nombre del sitio: Grupo Plateado
   - URL: https://clubsenior.com.co
6. Copiar el **Measurement ID** (empieza con `G-`)

---

## Paso 2: Configurar en Next.js

### Opción A: Usando script nativo de Google (simple)

Editar `src/app/layout.tsx`:

```typescript
// src/app/layout.tsx

import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

  return (
    <html lang="es">
      <head>
        {/* Google Analytics */}
        {MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### Opción B: Usando librería (más control)

```bash
npm install --save @react-ga/hooks
```

```typescript
// src/app/layout.tsx

import { useEffect } from 'react';
import ReactGA from 'react-ga4';

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export default function RootLayout({ children }) {
  useEffect(() => {
    if (MEASUREMENT_ID) {
      ReactGA.initialize(MEASUREMENT_ID);
    }
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

---

## Paso 3: Agregar variables de entorno

### `.env.local`

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Vercel Environment Variables

1. Ir a Vercel → Project Settings → Environment Variables
2. Agregar `NEXT_PUBLIC_GA_ID` con valor del Measurement ID

---

## Paso 4: Trackear eventos importantes

Crear utility para eventos:

```typescript
// src/lib/analytics.ts

declare let gtag: Function;

export const analytics = {
  // Page view (auto en Next.js, pero útil para rutas custom)
  pageView: (page: string, title: string) => {
    gtag('event', 'page_view', {
      page_title: title,
      page_path: page,
    });
  },

  // Plan selection
  planSelected: (planName: string, price: number) => {
    gtag('event', 'select_item', {
      items: [
        {
          item_id: planName,
          item_name: planName,
          price: price,
        },
      ],
    });
  },

  // Sign up
  signup: (method: string) => {
    gtag('event', 'sign_up', {
      method: method, // 'email', 'google', etc
    });
  },

  // Login
  login: (method: string) => {
    gtag('event', 'login', {
      method: method,
    });
  },

  // Purchase
  purchase: (
    transactionId: string,
    value: number,
    currency: string = 'COP',
    items?: any[]
  ) => {
    gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    });
  },

  // Exception (errors)
  exception: (message: string, fatal: boolean = false) => {
    gtag('event', 'exception', {
      description: message,
      fatal: fatal,
    });
  },

  // Custom event
  event: (eventName: string, params?: any) => {
    gtag('event', eventName, params);
  },
};
```

---

## Paso 5: Usar en componentes

### Registro (Sign Up)

```typescript
// src/app/inscribir/page.tsx

'use client';

import { analytics } from '@/lib/analytics';

export default function Inscribir() {
  const handleSubmit = async (email: string) => {
    analytics.signup('email');
    // resto del código
  };

  return (
    // JSX
  );
}
```

### Selección de plan

```typescript
// src/app/planes/page.tsx

'use client';

import { analytics } from '@/lib/analytics';

export default function Planes() {
  const handleSelectPlan = (plan: string) => {
    analytics.planSelected(plan, 150000);
    // resto del código
  };

  return (
    // JSX
  );
}
```

### Compra/Pago

```typescript
// src/app/api/webhooks/wompi/route.ts

import { analytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  // Cuando pago es exitoso:
  
  analytics.purchase(
    transactionId, // ID de la transacción
    amountPaid,    // Monto
    'COP',         // Moneda
    [{
      item_id: planId,
      item_name: planName,
      price: planPrice,
      quantity: 1,
    }]
  );
}
```

---

## Paso 6: Configurar metas/conversiones

En Google Analytics:

1. Ir a "Admin" → "Conversions"
2. Crear metas:
   - **Signup**: Event name = "sign_up"
   - **Purchase**: Event name = "purchase"
   - **Plan selection**: Event name = "select_item"
3. Configurar valor de conversión (en COP)

---

## Paso 7: Test en desarrollo

```bash
# 1. Iniciar app
npm run dev

# 2. Abrir en navegador
http://localhost:3000

# 3. Abrir DevTools → Network
# 4. Buscar requests a "www.google-analytics.com"
# 5. Deberías ver eventos siendo enviados

# 6. En Google Analytics (puede tomar 1-2 minutos):
# Ir a Realtime → Eventos
# Deberías ver los eventos que generes
```

---

## Paso 8: Deploy

```bash
git add .
git commit -m "feat: Google Analytics integration"
git push
```

Vercel auto-deploy. Los eventos empezarán a ser trackrados automáticamente.

---

## 📊 Métricas importantes a revisar

### Dashboard principal

- **Active Users**: Usuarios activos ahora
- **Sessions**: Sesiones totales
- **Engagement Rate**: % de sesiones con 30+ segundos
- **Bounce Rate**: % de sesiones de una sola página

### Adquisición

- **Traffic Source**: Dónde vienen los usuarios
- **User Acquisition**: Nuevos usuarios por canal
- **Sessions by Device**: Mobile vs Desktop

### Conversión

- **Conversion Rate**: % de sesiones que convierten
- **Purchase Value**: Valor promedio de compra
- **Revenue**: Ingresos totales

### Retención

- **Returning Users**: % de usuarios que vuelven
- **User Lifetime Value**: Valor promedio del usuario

---

## 🎯 Goals recomendados

```
1. Signup Rate: % de visitantes que se registran
2. Purchase Rate: % de usuarios registrados que compran
3. Average Session Duration: Tiempo promedio en app
4. Bounce Rate: % de sesiones que rebotan (ideal < 40%)
5. Return User Rate: % de usuarios que vuelven
```

---

## 📚 Documentación

- https://developers.google.com/analytics/devguides/collection/ga4
- https://support.google.com/analytics
- https://nextjs.org/docs/app/building-your-application/optimizing/scripts

---

## 🚀 Próximos pasos

1. Configurar metas de conversión
2. Crear alertas para caída de tráfico
3. Revisar reportes semanales
4. Optimizar basado en datos

---

**Tiempo setup:** ~15 minutos  
**Impacto:** 🟨 IMPORTANTE para entender usuarios y comportamiento
