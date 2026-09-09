# Tardes de Café, Mente & Saberes

**Tranquilidad para el familiar + Actividad para el adulto mayor**

Plataforma web B2C/B2B2C para conectar adultos mayores en condominios de la Sabana de Bogotá con actividades de acompañamiento y experiencias, ofreciendo tranquilidad a sus familias.

---

## Stack Técnico

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend/BaaS:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Pagos:** Wompi
- **Hosting:** Vercel
- **Testing:** Vitest, Testing Library
- **VCS:** GitHub + GitHub Actions
- **Validation:** Zod, React Hook Form

---

## Getting Started

### Prerequisites

- Node.js 22.x
- npm 10.x+
- Git

### Installation

```bash
# Clone repository
git clone <repo-url>
cd club-saberes-web

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure .env.local with your values
# SUPABASE_URL, WOMPI_KEYS, etc.

# Run development server
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Development

### Scripts Disponibles

```bash
npm run dev         # Iniciar servidor de desarrollo
npm run build       # Compilar para producción
npm start           # Iniciar servidor de producción
npm run lint        # ESLint
npm run typecheck   # TypeScript type checking
npm run test        # Vitest (unit tests)
```

### Code Quality

Todos los commits deben pasar:

```bash
npm run lint      # ✓ Sin errores ESLint
npm run typecheck # ✓ Sin errores TypeScript
npm run build     # ✓ Build exitoso
```

### Git Workflow

```
Feature branch → Pull Request → CI/CD → Review → Merge to develop → Preview → QA → main → Production
```

- **Ramas:** `main` (producción), `develop` (pre-producción), `feature/*` (desarrollo)
- **Commits:** Descriptivos
- **PRs:** Requieren review antes de merge

---

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Diseño técnico, estructura, decisiones
- **[SECURITY.md](./SECURITY.md)** — Políticas de seguridad, RLS, webhooks
- **[ENVIRONMENT.md](./ENVIRONMENT.md)** — Variables de entorno
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Despliegue, ambientes
- **[PAYMENTS.md](./PAYMENTS.md)** — Integración Wompi
- **[DATABASE.md](./DATABASE.md)** — Schema PostgreSQL

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Utilidades y servicios
├── services/               # Business logic
├── schemas/                # Zod schemas
├── types/                  # TypeScript types
├── hooks/                  # React hooks
└── utils/                  # Helper functions
```

---

## Checkpoints

- **✓ CHECKPOINT 1** — Infraestructura (ACTUAL)
- **→ CHECKPOINT 2** — Base de datos y Supabase
- **→ CHECKPOINT 3** — Onboarding
- **→ CHECKPOINT 4** — Pagos Wompi
- **→ CHECKPOINT 5** — Dashboard
- **→ CHECKPOINT 6** — Producción

---

## Environment Variables

Ver `.env.example` y crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
WOMPI_PRIVATE_KEY=...
WOMPI_EVENTS_SECRET=...
```

---

## Security

Leer **[SECURITY.md](./SECURITY.md)** es obligatorio. Datos sensibles requieren:
- Row Level Security (RLS)
- Validación multi-capa
- Audit logging
- Secretos protegidos

---

## Testing

```bash
npm run test              # Ejecutar tests
npm run test -- --watch  # Watch mode
```

---

## Deployment

- **Preview:** Automático en Vercel (Pull Requests)
- **Staging:** Manual a `develop`
- **Production:** Manual a `main`

---

## Contributing

1. `git checkout -b feature/my-feature`
2. Hacer cambios
3. `git commit -m "Add feature"`
4. `git push origin feature/my-feature`
5. Crear Pull Request
6. Pasar CI/CD + review
7. Merge

---

## License

Uso interno — ViveroOnline

---

## Contact

Elena (@viveroonline) — Founder & CEO
