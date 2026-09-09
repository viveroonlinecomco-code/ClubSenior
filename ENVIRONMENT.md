# Environment Configuration

## Overview

All configuration is managed through environment variables. Different values for development, staging, and production.

**Security principle:** Secrets NEVER go in code. Always use environment variables.

---

## Variable Categories

### PUBLIC (Safe for Browser)
```
NEXT_PUBLIC_*
```
These are exposed to the browser, so they must NOT contain secrets.

### SERVER ONLY (Secret)
```
No prefix
```
These are server-side only and NEVER exposed to the browser.

---

## Required Variables

### Supabase (Database & Auth)

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Public:** Yes (safe for browser)
- **Type:** URL
- **Example:** `https://project-name.supabase.co`
- **Where to find:** Supabase Project Settings → API
- **Required:** Yes

#### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Public:** Yes (safe for browser)
- **Type:** JWT (looks like `eyJh...`)
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Project Settings → API → Project API Keys (anon key)
- **Required:** Yes
- **Security:** This key is limited by RLS policies

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Public:** NO — Secret only!
- **Type:** JWT (looks like `eyJh...`)
- **Where to find:** Supabase Project Settings → API → Project API Keys (service_role key)
- **Required:** Yes (server-side only)
- **⚠️ WARNING:** This key has FULL database access. NEVER expose to browser or commit to git.
- **Storage:**
  - Development: `.env.local` (local machine only)
  - Production: Vercel Environment Variables (marked as Sensitive)

### Wompi Payments

#### `NEXT_PUBLIC_WOMPI_PUBLIC_KEY`
- **Public:** Yes (safe for browser)
- **Type:** String
- **Example:** `pub_test_abc123...`
- **Where to find:** Wompi Dashboard → API Keys → Public Key
- **Required:** Yes
- **Used for:** Frontend payment checkout modal

#### `WOMPI_PRIVATE_KEY`
- **Public:** NO — Secret only!
- **Type:** String
- **Where to find:** Wompi Dashboard → API Keys → Private Key
- **Required:** Yes (server-side only)
- **⚠️ WARNING:** NEVER expose to browser
- **Used for:** Backend payment processing, verifying webhooks
- **Storage:**
  - Development: `.env.local`
  - Production: Vercel Environment Variables (marked as Sensitive)

#### `WOMPI_EVENTS_SECRET`
- **Public:** NO — Secret only!
- **Type:** String
- **Where to find:** Wompi Dashboard → Webhooks → Secret
- **Required:** Yes (server-side only)
- **⚠️ WARNING:** NEVER expose to browser
- **Used for:** Validating webhook signatures from Wompi
- **Storage:**
  - Development: `.env.local`
  - Production: Vercel Environment Variables (marked as Sensitive)

### Application

#### `NEXT_PUBLIC_APP_URL`
- **Public:** Yes
- **Type:** URL
- **Development:** `http://localhost:3000`
- **Production:** `https://viveroonline.com.co` (or domain)
- **Required:** Yes
- **Used for:** Callback URLs, email links, etc

#### `NODE_ENV`
- **Public:** No (though it's not secret)
- **Type:** Enum
- **Values:** `development`, `production`, `test`
- **Required:** No (default: `production`)

---

## Setup Instructions

### Step 1: Copy Template

```bash
cp .env.example .env.local
```

### Step 2: Get Credentials

**Supabase:**
1. Go to https://supabase.com → Login to project
2. Click "Settings" (bottom left)
3. Click "API"
4. Copy `Project URL` and `anon public key`
5. Scroll down, click "Reveal" next to `service_role` secret, copy it

**Wompi:**
1. Go to https://www.wompi.co/es/dashboard → Login
2. Click "Settings" → "API Keys"
3. Copy `Public key` and `Private key`
4. Click "Webhooks" → Copy `Secret`

### Step 3: Populate `.env.local`

```bash
# .env.local (NEVER commit this file)

# Supabase — PUBLIC
NEXT_PUBLIC_SUPABASE_URL=https://xyz123.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase — SECRET (server only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Wompi — PUBLIC
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_abc123...

# Wompi — SECRET (server only)
WOMPI_PRIVATE_KEY=priv_test_xyz789...
WOMPI_EVENTS_SECRET=secret_webhook_12345...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Verify

```bash
# Check that .env.local is created
ls -la .env.local

# Test that Supabase connects
npm run dev
# Look for: "✓ compiled client and server successfully"

# Check in browser console:
# Should see no errors about missing environment variables
```

---

## Environment-Specific Values

### Development (`NODE_ENV=development`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_...
WOMPI_PRIVATE_KEY=priv_test_...
WOMPI_EVENTS_SECRET=secret_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Staging/Preview (`NODE_ENV=production`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_staging_...
WOMPI_PRIVATE_KEY=priv_staging_...
WOMPI_EVENTS_SECRET=secret_staging_...
NEXT_PUBLIC_APP_URL=https://staging.viveroonline.com.co
NODE_ENV=production
```

### Production (`NODE_ENV=production`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_prod_...
WOMPI_PRIVATE_KEY=priv_prod_...
WOMPI_EVENTS_SECRET=secret_prod_...
NEXT_PUBLIC_APP_URL=https://viveroonline.com.co
NODE_ENV=production
```

---

## Vercel Deployment

### Setting Variables in Vercel

1. Go to Vercel Project Settings
2. Click "Environment Variables"
3. Add each variable:
   - **Name:** Exact name (e.g., `SUPABASE_SERVICE_ROLE_KEY`)
   - **Value:** Actual value
   - **Environments:** Check which branches/environments apply
   - **Sensitive:** Toggle ON for secrets (SUPABASE_SERVICE_ROLE_KEY, WOMPI_PRIVATE_KEY, WOMPI_EVENTS_SECRET)

### Typical Setup

```
Environment Variables in Vercel:

NEXT_PUBLIC_SUPABASE_URL
  ├── Development: https://dev.supabase.co
  ├── Preview: https://staging.supabase.co
  └── Production: https://prod.supabase.co

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ├── Development: dev_anon_key...
  ├── Preview: staging_anon_key...
  └── Production: prod_anon_key... (Sensitive)

SUPABASE_SERVICE_ROLE_KEY (Sensitive)
  ├── Development: dev_service_role_key...
  ├── Preview: staging_service_role_key...
  └── Production: prod_service_role_key...

WOMPI_PRIVATE_KEY (Sensitive)
  ├── Development: priv_test_...
  ├── Preview: priv_staging_...
  └── Production: priv_prod_...

WOMPI_EVENTS_SECRET (Sensitive)
  ├── Development: secret_test_...
  ├── Preview: secret_staging_...
  └── Production: secret_prod_...

NEXT_PUBLIC_APP_URL
  ├── Development: http://localhost:3000
  ├── Preview: https://branch-preview.vercel.app
  └── Production: https://viveroonline.com.co

NODE_ENV
  ├── Development: development
  ├── Preview: production
  └── Production: production
```

---

## Security Best Practices

### DO ✓

- ✓ Store secrets in `.env.local` (development)
- ✓ Store secrets in Vercel (production)
- ✓ Use `NEXT_PUBLIC_` ONLY for non-secrets
- ✓ Mark sensitive vars as "Sensitive" in Vercel
- ✓ Rotate keys periodically
- ✓ Use separate Supabase projects (dev, staging, prod)
- ✓ Use separate Wompi accounts (test, production)
- ✓ Review `.env.example` for all required variables

### DON'T ✗

- ✗ Commit `.env.local` to git
- ✗ Use `NEXT_PUBLIC_` for secrets (passwords, API keys)
- ✗ Share credentials in Slack/email
- ✗ Hardcode secrets in code
- ✗ Use test keys in production
- ✗ Use production keys in development
- ✗ Push secrets to GitHub (use secrets scanning)

---

## Checking Environment at Runtime

```typescript
// src/lib/env.ts - Validate environment at startup

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WOMPI_PRIVATE_KEY',
  'WOMPI_EVENTS_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

console.log('✓ All environment variables configured');
```

---

## Troubleshooting

### "Missing environment variable: SUPABASE_SERVICE_ROLE_KEY"

**Cause:** `.env.local` not found or variable not set

**Fix:**
```bash
cp .env.example .env.local
# Then populate with real values
```

### "Invalid token" when connecting to Supabase

**Cause:** Wrong/expired API key

**Fix:**
1. Go to Supabase Project Settings
2. Verify the key is the `anon` key (not `service_role`)
3. If expired, regenerate from dashboard
4. Update `.env.local`

### "Webhook signature validation failed"

**Cause:** Wrong `WOMPI_EVENTS_SECRET`

**Fix:**
1. Go to Wompi Dashboard → Webhooks
2. Copy the secret again
3. Update `.env.local`
4. Redeploy

### Different behavior in dev vs production

**Cause:** Environment variables are different

**Fix:**
```bash
# List current environment
echo $NODE_ENV
echo $NEXT_PUBLIC_SUPABASE_URL

# Verify they match expected environment
# (dev vs prod should be different!)
```

---

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/auth#signing-up)
- [Wompi API Keys](https://docs.wompi.co/reference/api-tokens)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
