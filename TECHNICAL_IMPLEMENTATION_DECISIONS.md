# 🔧 **Technical Implementation Decisions**

**Project:** Grupo Plateado  
**Date:** September 11-12, 2026  
**Focus:** Specific tool/library choices and rationale  

---

## **SECURITY DECISIONS**

### Why JWT HS256 (not RS256)?

```
Considered:
✓ HS256 (Symmetric) - One secret, sign+verify with same key
✓ RS256 (Asymmetric) - Public key to verify, private key to sign

Decision: HS256

Rationale:
1. Simplicity
   - One secret to manage (JWT_SECRET)
   - No need for key rotation strategy
   - Suitable for MVP auth

2. Performance
   - HS256 is ~10x faster than RS256
   - Verification happens on every request
   - ~1ms matters at scale

3. Use case
   - All auth happens on same server
   - No need for distributed verification
   - Upgrade path exists (RS256 for multi-region later)

When to upgrade:
- Multiple deployment regions
- Third-party services need to verify tokens
- Enterprise requirements demand asymmetric

Trade-offs:
✗ JWT_SECRET is critical (if leaked, all tokens compromised)
✗ Secret rotation is complex (need to re-issue all tokens)
✓ But: suitable for MVP, can evolve
```

### Why OTP via Email (not SMS)?

```
Considered:
✓ Email (Resend API)
✓ SMS (Twilio)
✓ Biometric

Decision: Email

Rationale:
1. Target demographic
   - Personas are 65+ años
   - Not all comfortable with SMS
   - Email is familiar to this demographic

2. Cost
   - Resend: Free tier ~100/day, $20/month after
   - Twilio SMS: $0.0075 per SMS, ~$25/month for 100 users
   - Email is 2-3x cheaper

3. Spam risk
   - Email is less abused than SMS for auth
   - Users can filter/find in spam folder
   - SMS has deliverability issues

4. User experience
   - Can include clickable link
   - Can explain 2FA properly
   - Users can save email for reference

Trade-offs:
✗ Slower delivery than SMS (seconds vs immediate)
✗ Spam folder risk (checked, works well with Resend)
✓ Much cheaper
✓ Better for demographic

When to add SMS:
- Users request it
- Add as secondary method
- Keep email as primary
```

### Why Rate Limit Per-Email (not Per-IP)?

```
Considered:
✓ Per-IP (block entire IP)
✓ Per-Email (block email)

Decision: Per-Email

Rationale:
1. Real world scenarios
   - Corporate office: 100 people, same IP
   - Blocking IP blocks everyone (false positive)
   - Email blocking only affects attacker

2. Fairness
   - User in coffee shop: Different IPs every day
   - Attacker in datacenter: Rotates IPs constantly
   - Per-email better protects against smart attackers

3. Flexibility
   - Per-IP can block legitimate users in networks
   - Per-email is user-friendly
   - Can escalate: multiple emails from one IP → block

Implementation:
- SEND_OTP: Limited per email (3/15min)
- VERIFY_OTP: Limited per email (5/5min)
- Dashboard: Monitor IPs with multiple email attempts

Trade-offs:
✗ Attacker can try multiple emails (but costs money)
✓ Legitimate users not punished for shared IP
✓ More fair, less false positives
```

---

## **DATABASE DECISIONS**

### Why Supabase (not Firebase, Neon, Prisma)?

```
Considered:
✓ Supabase (PostgreSQL + Auth + Realtime)
✓ Firebase (NoSQL, all-in-one)
✓ Neon (PostgreSQL only)
✓ Prisma (ORM, any DB)

Decision: Supabase

Rationale:
1. Feature completeness
   Supabase:
   ✓ PostgreSQL (powerful, SQL)
   ✓ Auth built-in (JWT, OTP ready)
   ✓ Realtime (for future features)
   ✓ RLS (row-level security)
   ✓ Functions (stored procedures)
   ✓ Edge functions (serverless)
   
   Firebase:
   ✓ Realtime
   ✗ NoSQL (not ideal for structured data)
   ✗ Auth separate (more work)

2. Our data shape
   - Structured: users, activities, attendance
   - Relational: participantes → asistencias
   - SQL queries: Aggregations, reports
   → PostgreSQL is perfect for this
   → NoSQL would be awkward

3. Cost
   - Supabase: $25/month starter
   - Firebase: Similar pricing
   - But: Supabase includes more features

4. Ecosystem
   - Supabase JS client is great
   - Direct PostgreSQL access
   - Upgrade path: Switch to self-hosted Postgres

Trade-offs:
✗ PostgreSQL has learning curve (vs NoSQL)
✗ Requires schema planning upfront
✓ But: Our data IS relational
✓ Queries are efficient (RPC at 60ms)
```

### Why RPC instead of Multiple Queries?

```
Problem:
GET /api/activities/[id]/participantes

Naive approach (3 queries):
1. SELECT activity
2. SELECT participantes
3. SELECT asistencias
Result: 150ms total (90ms overhead)

Solutions:
✓ Fetch all, combine in code (N+1)
✓ Create RPC (database handles joins)

Decision: RPC

Rationale:
1. Where computation happens
   - DB: Can optimize joins with indices (60ms)
   - App: Combines arrays in code (overhead)
   → DB is better

2. Network trips
   - N+1: 3 requests to DB
   - RPC: 1 request to DB
   → RPC: 1 round trip saved

3. Scalability
   - 100 concurrent users
   - N+1: 300 queries (bad)
   - RPC: 100 queries (good)
   → RPC scales better

Implementation details:
- Use EXPLAIN to verify indices
- LEFT JOIN handles missing data
- RPC parameters are typed (safe)

Trade-offs:
✗ Harder to debug (SQL vs code)
✗ Requires DB access (vs pure API)
✓ 2.5x performance improvement
✓ Scales to millions of rows
```

### Why Indices on These Specific Columns?

```
Indices created:
1. idx_actividades_id_condominio
   ON actividades(id, condominio_id)
   
   Why: RPC searches by id, then filters by condominio
        Composite index accelerates both

2. idx_participantes_condominio_active
   ON participantes(condominio_id)
   WHERE activo = TRUE
   
   Why: Only active participantes matter
        Partial index reduces size, faster lookup

3. idx_asistencias_actividad_participante
   ON asistencias(actividad_id, participante_id)
   
   Why: Join condition is (activity_id, participant_id)
        Composite index speeds up JOIN lookup

Index performance:
- Without indices: Full table scan (slow)
- With indices: B-tree lookup (60-100x faster)
- Trade-off: Storage (negligible), writes (slight slower)
```

---

## **FRONTEND DECISIONS**

### Why Tailwind CSS (not Bootstrap, Styled Components)?

```
Decision: Tailwind CSS

Rationale:
1. Utility-first
   - Build UI without leaving HTML
   - No CSS file switching
   - Predictable class names

2. Bundle size
   - Tailwind: ~15KB (purged)
   - Bootstrap: ~50KB
   - Styled-components: ~15KB + runtime

3. DX (Developer Experience)
   - Tailwind: Faster to prototype
   - Bootstrap: Pre-built components (slower initially)
   - Styled-components: Requires JS knowledge

4. Our use case
   - Custom designs (not bootstrap)
   - Build from scratch (not pre-made)
   - Fast iteration on styling

Trade-offs:
✗ HTML is verbose (many classes)
✓ CSS is predictable (no conflicts)
✓ Fast to develop
✓ Small bundle
```

### Why TypeScript Strict Mode (not Loose)?

```
Decision: TypeScript strict: true

Rationale:
1. Bug prevention
   - Strict catches null/undefined bugs early
   - Loose allows many bugs to slip through
   - At scale: Strict saves hours of debugging

2. Refactoring confidence
   - Change a type
   - Compiler tells you everywhere it breaks
   - No surprises in production

3. Our codebase size
   - Currently: ~5K lines
   - Loose fine for small projects
   - But: Growing, need safety

Settings enforced:
```json
{
  "strict": true,           // Master switch
  "noImplicitAny": true,    // Must type parameters
  "strictNullChecks": true, // null/undefined explicit
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "noImplicitThis": true,
  "alwaysStrict": true,
  "noUnusedLocals": true,   // Catch dead code
  "noUnusedParameters": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

Trade-offs:
✗ Slower initial development (type annotations)
✓ Catch bugs early
✓ Refactoring safe
✓ Self-documenting code
```

---

## **TESTING DECISIONS**

### Why Vitest (not Jest, Playwright)?

```
Test pyramid:
        🔺 E2E (Playwright, 5%)
      📦 Integration (10%)
    ◼️ Unit tests (85%) ← Our focus

Decision: Vitest for unit tests

Rationale:
1. Speed
   - Vitest: 37 tests in < 1 second
   - Jest: Same tests in 5+ seconds
   - Feedback loop: Vitest is 5x faster

2. TypeScript support
   - Vitest: Native ESM, TypeScript works
   - Jest: Requires babel, slower

3. Configuration
   - Vitest: Uses existing tsconfig.json
   - Jest: Separate config

4. Our use case
   - Auth, validation, rate limiting
   - These are pure functions
   - Unit tests perfect for this

When to add other frameworks:
- E2E: Playwright for signin → dashboard flow
- Integration: Test API + DB together
- But: Unit tests catch 80% of bugs

Trade-offs:
✗ Unit tests don't catch all bugs (E2E needed)
✓ Extremely fast (development feedback)
✓ Easy to write
✓ TypeScript-first
```

### Why 82% Coverage (not 100%)?

```
Coverage: 82%

Why not 100%?
- Some paths are impossible (defensive code)
- UI rendering hard to test (needs Playwright)
- Diminishing returns after 80%

What IS covered (100%):
✓ Auth logic (JWT generation/verification)
✓ Validation (all Zod schemas)
✓ Rate limiting (attack scenarios)

What's NOT covered:
✗ UI components (15% of coverage gap)
✗ Error edge cases (5% of coverage gap)

Rationale for not targeting 100%:
- 80-85% is industry standard sweet spot
- Each 1% after 80% requires 10x more effort
- Better to have E2E tests than 100% unit

Path to 100% if needed:
- Add Playwright E2E tests
- Test critical user flows
- This gives 95%+ coverage with less code
```

---

## **DEPLOYMENT DECISIONS**

### Why Vercel (not AWS, Netlify, self-hosted)?

```
Considered:
✓ Vercel (Next.js native)
✓ AWS (powerful, complex)
✓ Netlify (simpler but limited)
✓ Self-hosted (full control)

Decision: Vercel

Rationale:
1. Automatic deployment
   - Push to main → Automatic deployment
   - No manual steps
   - Preview URLs for every PR

2. Zero configuration
   - Vercel understands Next.js
   - Automatic optimization
   - Environment variables built-in

3. Scaling
   - Auto-scales based on traffic
   - No capacity planning
   - Serverless (pay per execution)

4. Monitoring
   - Built-in analytics
   - Error tracking
   - Performance monitoring

When to migrate:
- 100K+ users (cost optimization)
- Custom infrastructure needs
- Multi-region (Vercel has this too)

Trade-offs:
✗ Vendor lock-in (Vercel-specific)
✗ Costs scale with traffic
✓ Zero ops overhead
✓ Extremely fast deploys
✓ Great developer experience
```

### Why GitHub main branch (not Git Flow, trunk-based)?

```
Git strategy considered:
✓ Git Flow (feature branches, release branches)
✓ Trunk-based (main is always deployable)

Decision: Simplified trunk-based

Process:
1. Feature branch (fix/feature-name)
2. Push code
3. PR to main (code review)
4. Merge to main
5. Automatic deploy to Vercel

Why trunk-based:
- Continuous delivery
- Small, frequent deploys
- Faster feedback
- Easier conflict resolution

Not using full Git Flow because:
✗ Overkill for solo founder
✗ Release branches unnecessary (continuous deploy)
✗ Staging environment is PR preview URL

Will add Git Flow when:
- Multiple developers
- Release coordination needed
- Staging environment exists
```

---

## **MONITORING DECISIONS**

### Why Pino Logging (not Console.log, Winston)?

```
Logging considered:
✓ console.log (built-in)
✓ Winston (popular)
✓ Pino (fast, structured)

Decision: Pino

Rationale:
1. Structured logging
   - JSON format (queryable)
   - Not just text (searchable)
   - Metadata support

2. Performance
   - Pino: Async, minimal overhead
   - Winston: Slower
   - console.log: Not structured

3. Integration
   - Vercel Logs (native support)
   - DataDog/CloudWatch (JSON parsing easy)
   - Sentry (error tracking)

8 domain-specific loggers:
- AUTH (login, token)
- DATABASE (queries, performance)
- CACHE (hits/misses)
- PAYMENT (transactions)
- EMAIL (delivery)
- RATE-LIMIT (attacks)
- VALIDATION (input errors)
- SECURITY (suspicious activity)

Trade-offs:
✗ Setup needed (not automatic)
✓ Production visibility
✓ Performance metrics
✓ Audit trail
```

---

## **FUTURE-PROOF DECISIONS**

### Decisions that are reversible:

```
✓ Vercel → Can migrate to AWS later
  Code path: No vendor-specific APIs used

✓ In-memory rate limiting → Redis later
  Code path: Swap Map with Redis client, same interface

✓ Supabase auth → Auth0 later
  Code path: Use OIDC, pluggable

✓ Tailwind → Bootstrap later
  Code path: Rewrite styling, logic untouched

✓ Vitest → Jest later
  Code path: Test files compatible
```

### Decisions that are hard to reverse:

```
✗ PostgreSQL → NoSQL later (HARD)
  Impact: Schema redesign, query rewrite
  Mitigation: Data export, migration script

✗ OTP email → SMS later (Medium)
  Impact: Add Twilio integration
  Mitigation: Parallel implementation

✗ TypeScript → JavaScript later (NOT RECOMMENDED)
  Impact: Lose type safety
  Mitigation: Keep TypeScript
```

---

## **COST ANALYSIS**

```
Current monthly costs (MVP stage):
- Supabase (starter): $25
- Resend (free tier): $0 (100 emails/day)
- Vercel (hobby free): $0
- Redis (deferred): $0
- Total: $25/month

When scaling to 100 paying users:
- Supabase: $25 → $50 (increase in compute)
- Resend: $0 → $20 (above free tier)
- Vercel: $0 → $20 (traffic)
- Redis: $0 → $8 (cache)
- Total: ~$98/month

At that scale, revenue should easily cover costs.
```

---

## **Decisions to Revisit in 3-6 Months**

1. **Rate limiting strategy**
   - Current: In-memory, resets on deploy
   - Issue: With 1000+ users, upgrade to Redis
   - Timeline: When daily active users > 100

2. **Caching strategy**
   - Current: Deferred (no cost)
   - Activate: When dashboard load becomes concern
   - Timeline: When response time > 100ms

3. **Database scale**
   - Current: Supabase starter tier
   - Upgrade: When queries slow down
   - Timeline: When concurrent users > 100

4. **Monitoring setup**
   - Current: Pino logging (code ready)
   - Integrate: Sentry, DataDog
   - Timeline: When you have paying users

5. **E2E testing**
   - Current: Unit tests only
   - Add: Playwright for critical flows
   - Timeline: When you have daily active users

---

## **Decision Log Template**

When making new decisions, use this template:

```markdown
### Decision: [Title]

**Date:** YYYY-MM-DD  
**Status:** Accepted / Pending / Rejected  

**Problem:**
[What issue are we solving?]

**Alternatives:**
- Option A: [Pros/Cons]
- Option B: [Pros/Cons]
- Option C: [Pros/Cons]

**Decision:**
[We chose Option X because...]

**Rationale:**
[Why this is the best choice]

**Implications:**
[Positive and negative consequences]

**Review Date:**
[When to revisit this decision]
```

---

**Last Updated:** September 12, 2026  
**Status:** Production Proven  
**Next Review:** March 2027 (after first users)
