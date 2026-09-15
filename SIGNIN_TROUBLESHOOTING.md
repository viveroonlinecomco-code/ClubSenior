# 🔧 Grupo Plateado Sign-In Troubleshooting

## ✅ Fix Implemented (Sept 11, 2026)

**Problem:** Sign-in page was stuck in a redirect loop → `/signin` → no loading → `/signin`

**Root Cause:** The `useAuth()` hook had a race condition with the `AuthProvider` initialization

**Solution:** Removed dependency on `useAuth()` hook from `/signin` page and used direct API calls instead

---

## 🧪 Testing the Fix

### Step 1: Check Backend Health
```bash
# Test that the backend is responding
curl https://club-senior.vercel.app/api/health
```

Expected response:
```json
{
  "api": "ok",
  "env": {
    "supabaseUrl": true,
    "supabaseKey": true,
    "resendKey": true
  },
  "timestamp": "2026-09-11T..."
}
```

### Step 2: Test OTP Sending
```bash
curl -X POST https://club-senior.vercel.app/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Código enviado exitosamente a your-email@example.com",
  "email": "your-email@example.com"
}
```

### Step 3: Try Sign-In Page
1. Go to: `https://club-senior.vercel.app/signin`
2. Enter your email
3. Click "Enviar Código"
4. You should see debug info showing:
   - `📤 Enviando OTP...`
   - `✅ Redirigiendo en 2 segundos...`
5. You should be redirected to `/verificar-otp`

---

## 🚨 If Sign-In Still Doesn't Work

### Check Vercel Environment Variables

Go to **Vercel Dashboard** → **Grupo Plateado Project** → **Settings** → **Environment Variables**

Required variables:
- ✅ `NEXT_PUBLIC_SUPABASE_URL` → `https://popgpdhtyhckvkjmiknq.supabase.co`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` → Should be 40+ characters
- ✅ `RESEND_API_KEY` → Should start with `re_`
- ✅ `JWT_SECRET` → Should be 32+ characters (generated with `openssl rand -hex 32`)
- ✅ `NEXT_PUBLIC_APP_URL` → `https://club-senior.vercel.app` (or preview URL)

### Debug Browser Console

1. Open **Developer Tools** (F12)
2. Go to **Console** tab
3. Enter your email and submit
4. Look for:
   - `📤 Enviando OTP...` (blue box)
   - If OTP fails, check the error message

### Check Supabase Status

1. Go to **Supabase Dashboard** → **popgpdhtyhckvkjmiknq**
2. Check **SQL Editor** for the `otp_codes` table:
   ```sql
   SELECT * FROM otp_codes ORDER BY created_at DESC LIMIT 5;
   ```
3. Verify that codes are being created

### Check Resend Email Delivery

1. Go to **Resend Dashboard** → **Overview**
2. Look for recent email events
3. Check if emails are in spam folder

---

## 📋 Changes Made in Commit `3a1d1aa`

### Files Changed:
1. **src/app/signin/page.tsx**
   - Removed `useAuth()` hook
   - Added direct `fetch()` to `/api/auth/send-otp`
   - Added `debugInfo` state to show real-time status
   - Removed race condition with AuthProvider

2. **src/app/api/health/route.ts** (NEW)
   - Health check endpoint to verify backend connectivity
   - Shows env var status

### Before (Broken):
```typescript
// ❌ This caused race conditions
const { signInWithEmail } = useAuth();
const result = await signInWithEmail(email);
```

### After (Fixed):
```typescript
// ✅ Direct API call, no race conditions
const response = await fetch('/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});
```

---

## 🔗 Related Files

- **Sign-In Page:** `src/app/signin/page.tsx`
- **OTP Endpoint:** `src/app/api/auth/send-otp/route.ts`
- **OTP Verify:** `src/app/api/auth/verify-otp/route.ts`
- **Health Check:** `src/app/api/health/route.ts`
- **Auth Provider:** `src/providers/auth-provider.tsx`
- **Auth Guard:** `src/components/auth-guard.tsx`

---

## 📞 Next Steps

1. **Wait for Vercel auto-deploy** (usually 2-5 minutes from push)
2. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
3. **Try signing in again:** https://club-senior.vercel.app/signin
4. **If still broken:** Check the debug messages in the browser console

---

**Deployed:** Commit `3a1d1aa` pushed to `main`  
**Status:** Ready for testing on Vercel preview
