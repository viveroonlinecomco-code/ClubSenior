# GitHub Push Instructions — ClubSenior Repository

## Current Project Status

**Repository Location:** `/home/claude/club-saberes-web`

**Commits Ready:** 5 major commits
- CHECKPOINT 1: Bootstrap & Infrastructure
- Add documentation (Architecture, Security, README)
- CHECKPOINT 2: Database & Supabase
- PAYMENTS.md: Wompi integration

**Files:** 20 TypeScript files, 8 Markdown docs
**Size:** 1.5 MB (excluding node_modules)

---

## Push to GitHub

### Option A: If repository exists and is empty

```bash
# Configure remote (replace URL with correct one)
cd /home/claude/club-saberes-web
git remote remove origin
git remote add origin https://github.com/YOUR-ORG/ClubSenior.git

# Push
git branch -M main
git push -u origin main
```

### Option B: If using existing remote with token

```bash
git push -u origin master
```

### Option C: Setup new repository from scratch

```bash
# 1. Create repo on GitHub (viveroonlinecomco-code or Elena-ViveroOnline)
# 2. Copy HTTPS URL
# 3. Configure:

cd /home/claude/club-saberes-web
git remote remove origin
git remote add origin https://github.com/YOUR-ORG/ClubSenior.git
git branch -M main
git push -u origin main
```

---

## Branches

```
main          → Production (protected)
develop       → Pre-production (staging)
feature/*     → Feature branches
```

Initial push will be `main` only.

---

## GitHub Configuration Recommendations

### 1. Branch Protection (main)
- Require pull request reviews
- Require status checks pass
- Require branches to be up to date

### 2. Secrets (Settings → Secrets & variables)
- Add: NEXT_PUBLIC_SUPABASE_URL
- Add: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- Add: SUPABASE_SERVICE_ROLE_KEY
- Add: WOMPI_PRIVATE_KEY
- Add: WOMPI_EVENTS_SECRET

### 3. CI/CD (GitHub Actions)
- Already configured: `.github/workflows/ci.yml`
- Runs: lint, typecheck, test, build
- On: push to main/develop, PR to main

---

## Verification Commands

```bash
# Check what will be pushed
git log --oneline origin/master..master

# Verify remote
git remote -v

# Dry run
git push --dry-run -u origin main

# Actual push
git push -u origin main
```

---

## After Push

1. ✓ Verify all 5 commits appear on GitHub
2. ✓ Verify CI/CD pipeline runs (Actions tab)
3. ✓ Verify build passes
4. ✓ Create develop branch: `git push -u origin develop`
5. ✓ Configure branch protection on main
6. ✓ Add repository secrets (Supabase, Wompi)

---

## Next Steps

- [ ] Confirm correct GitHub URL
- [ ] Execute push command
- [ ] Verify on GitHub
- [ ] Proceed to CHECKPOINT 3 (Landing Page & Auth)

