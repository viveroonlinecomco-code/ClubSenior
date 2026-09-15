# 🔐 CRITICAL TASK #2: Configure Vercel Environment Variables

## ⏱️ Time Required: 5-10 minutes

---

## 🎯 What's Missing

Three environment variables are needed for full functionality:

| Variable | Current | Needed | Impact |
|----------|---------|--------|--------|
| `JWT_SECRET` | ❌ MISSING | ✅ 32+ hex chars | JWT tokens won't verify |
| `KV_REST_API_URL` | ❌ MISSING | ✅ Vercel KV URL | Caching won't work |
| `KV_REST_API_TOKEN` | ❌ MISSING | ✅ Vercel KV token | Caching won't work |

**Impact:** Without these, JWT auth and caching are disabled.

---

## 🔧 How to Configure (Step by Step)

### Step 1: Generate JWT_SECRET

Open terminal on your Mac and run:

```bash
openssl rand -hex 32
```

This generates a secure 64-character hexadecimal string. Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

**Copy this value - you'll need it in a moment.**

---

### Step 2: Set Up Vercel KV (Redis)

Go to **Vercel Dashboard**:

1. **Open:** https://vercel.com/dashboard
2. **Select:** Grupo Plateado project
3. **Go to:** Storage → Create Database → KV Store
4. **Click:** Create database → Name it: "clubsenior-cache"
5. **Accept** the terms
6. **Wait** for creation (1-2 minutes)

After creation, you'll see:
```
✅ Database created
📋 REST API: Copy this URL
🔑 Token: Copy this token
```

**Save these values:**
- `KV_REST_API_URL` = The URL shown
- `KV_REST_API_TOKEN` = The token shown

---

### Step 3: Add Environment Variables to Vercel

**Go to Vercel Project Settings:**

1. **Open:** https://vercel.com/dashboard
2. **Select:** Grupo Plateado project
3. **Click:** Settings → Environment Variables
4. **You should see the existing ones:**
   ```
   ✅ NEXT_PUBLIC_SUPABASE_URL
   ✅ SUPABASE_SERVICE_ROLE_KEY
   ✅ RESEND_API_KEY
   ✅ JWT_SECRET (currently empty)
   ✅ KV_REST_API_URL (currently empty)
   ✅ KV_REST_API_TOKEN (currently empty)
   ```

---

### Step 4: Update Each Variable

#### Update JWT_SECRET
```
1. Click on: JWT_SECRET
2. Clear any existing value
3. Paste: The hex string from Step 1
4. Click: Save
```

Expected value format:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
```

#### Update KV_REST_API_URL
```
1. Click on: KV_REST_API_URL
2. Paste: The URL from Step 2
3. Click: Save
```

Expected value format:
```
https://[your-kv-domain].kv.vercel-storage.com
```

#### Update KV_REST_API_TOKEN
```
1. Click on: KV_REST_API_TOKEN
2. Paste: The token from Step 2
3. Click: Save
```

Expected value format:
```
AeyJ...very_long_string...XQo
```

---

## ✅ Verification Checklist

After adding all three variables, verify:

```
✅ JWT_SECRET: Not empty (64 hex chars)
✅ KV_REST_API_URL: Starts with https://
✅ KV_REST_API_TOKEN: Very long string
✅ All saved (no orange "unsaved" indicators)
```

---

## 🚀 Auto-Deploy After Env Vars

**Important:** After setting env vars, Vercel will automatically:
1. Redeploy the application
2. Make new variables available
3. Restart all functions

This usually takes **2-5 minutes**. You'll see:
```
Deployment in progress...
✅ Deployment completed
```

---

## 🧪 Test After Deployment

Once Vercel finishes deploying:

### Test 1: Check Health Endpoint
```bash
curl https://club-senior.vercel.app/api/health
```

Should return:
```json
{
  "api": "ok",
  "env": {
    "supabaseUrl": true,
    "supabaseKey": true,
    "resendKey": true
  }
}
```

### Test 2: Test Sign-In Flow
1. Go to: https://club-senior.vercel.app/signin
2. Enter your email
3. Click "Enviar Código"
4. You should receive an OTP email
5. Enter the code and verify it works

---

## 🔍 If Something Goes Wrong

### Variables aren't showing up after deploy
**Solution:** 
1. Wait 5 more minutes for deploy to complete
2. Refresh the page
3. Check Vercel Deployments tab

### JWT errors in console
**Solution:**
1. Verify JWT_SECRET is exactly 64 characters
2. Re-deploy: Vercel Dashboard → Deployments → Redeploy

### KV Cache not working
**Solution:**
1. Verify both KV variables are set
2. Check Vercel Storage dashboard to ensure database is active
3. Restart deployment

### "403 Unauthorized" on KV
**Solution:**
1. Re-generate KV database token
2. Update KV_REST_API_TOKEN in Vercel
3. Redeploy

---

## 📋 Complete Checklist

- [ ] Generated JWT_SECRET (64 hex chars)
- [ ] Created Vercel KV database
- [ ] Added JWT_SECRET to Vercel env vars
- [ ] Added KV_REST_API_URL to Vercel env vars
- [ ] Added KV_REST_API_TOKEN to Vercel env vars
- [ ] All variables show as saved (no orange indicators)
- [ ] Waited for auto-deploy to complete (2-5 min)
- [ ] Tested /api/health endpoint
- [ ] Tested signin flow

---

## 📞 If You're Stuck

### Where to find things:
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Grupo Plateado Project:** Select from list
- **Environment Variables:** Settings → Environment Variables
- **KV Database:** Storage → (your database)
- **Deployments:** Deployments tab

### What to check:
1. Are all 3 new variables set (not empty)?
2. Has Vercel finished deploying?
3. Are there any error messages in deployment log?

---

## 🎯 After This Task

Once completed:
1. ✅ Supabase migration executed
2. ✅ Vercel env vars configured
3. ⏭️ Ready for auth testing

**Then we can:**
- Test complete authentication flow
- Integrate logging (2-3 hours)
- Set up monitoring
- Deploy to production

---

**Status:** Ready to configure  
**Estimated Time:** 5 minutes  
**Risk Level:** Very Low (env vars, easily reversible)
