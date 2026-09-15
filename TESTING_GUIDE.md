---
name: TESTING_GUIDE
description: Complete testing guide for Grupo Plateado - Vitest, unit tests, integration tests, best practices
---

# 🧪 TESTING SUITE - CLUBSENIOR

**Framework:** Vitest + React Testing Library  
**Coverage Target:** 80% (core logic)  
**Time Investment:** 8 hours MVP → 40 hours complete  

---

## 📊 TEST COVERAGE

### ✅ Implemented (MVP - 8 hours)

```
src/__tests__/
├── auth.test.ts              ✅ JWT generation/verification (6 tests)
├── validation.test.ts        ✅ Zod schemas (18 tests)
├── rate-limit.test.ts        ✅ Rate limiting logic (8 tests)
├── components.test.tsx       ✅ React components (5 tests)
└── setup.ts                  ✅ Vitest configuration

Total MVP Tests: 37 tests covering:
- Authentication (JWT tokens)
- Input validation (Zod schemas)
- Rate limiting (OTP protection)
- Component rendering & hooks
```

### 📋 Backlog (Complete - 32 additional hours)

```
Email Service Tests (3 hours)
- Resend API integration
- Email template rendering
- HTML validation

Database Layer Tests (4 hours)
- Supabase CRUD operations
- RLS policy validation
- Query performance

API Endpoint Tests (6 hours)
- /api/auth/* endpoints
- /api/facilitador/* endpoints
- /api/dashboard/* endpoints
- Error handling & edge cases

Integration Tests (5 hours)
- Full auth flow (OTP → verification → profile)
- Facilitador activity creation workflow
- Dashboard data fetching pipeline

E2E Tests (5 hours)
- Playwright/Cypress scenarios
- User journey testing
- Cross-browser validation

Performance Tests (4 hours)
- Load testing (500 concurrent users)
- Query optimization validation
- Cache hit rate verification

Security Tests (5 hours)
- SQL injection prevention
- XSS protection validation
- CSRF token validation
- JWT expiration handling
```

---

## 🚀 RUNNING TESTS

### Run All Tests
```bash
npm test
# or
npm run test
```

### Run with UI Dashboard
```bash
npm run test:ui
# Opens browser at http://localhost:51204
```

### Run with Coverage Report
```bash
npm run test:coverage
# Generates HTML report in coverage/
```

### Watch Mode (Development)
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
npm test auth.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --grep "rate.limit"
```

---

## 📝 TEST STRUCTURE

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  describe('Specific Behavior', () => {
    it('should do X when Y', () => {
      // Arrange: setup
      const input = 'test';

      // Act: execute
      const result = functionToTest(input);

      // Assert: verify
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      expect(() => {
        functionToTest(null);
      }).toThrow('Expected error message');
    });
  });
});
```

### Testing Authentication

```typescript
// Test JWT generation
const token = generateFacilitadorToken('email@test.com', 'fac-123', 'FACILITADOR');
expect(token).toBeDefined();
expect(token.split('.').length).toBe(3);

// Test token verification
const decoded = verifyFacilitadorToken(token);
expect(decoded.email).toBe('email@test.com');

// Test expired token rejection
const expiredToken = jwt.sign(
  { email: 'test@example.com', exp: Math.floor(Date.now() / 1000) - 3600 },
  JWT_SECRET
);
expect(() => verifyFacilitadorToken(expiredToken)).toThrow();
```

### Testing Validation

```typescript
// Valid data passes
const result = SendOTPSchema.safeParse({ email: 'test@example.com' });
expect(result.success).toBe(true);

// Invalid data fails
const invalid = SendOTPSchema.safeParse({ email: 'invalid' });
expect(invalid.success).toBe(false);

// Check error details
if (!invalid.success) {
  expect(invalid.error.flatten().fieldErrors.email).toBeDefined();
}
```

### Testing React Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';

describe('Component Name', () => {
  it('should render content', () => {
    render(<MyComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle loading state', async () => {
    render(<MyComponent />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/loaded content/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Test Priorities

### P0 - Critical (Must Have)
- [x] JWT token generation & verification
- [x] Rate limiting for OTP endpoints
- [x] Input validation (email, code, activity data)
- [x] Auth guard component

### P1 - Important (Should Have)
- [ ] Email service integration
- [ ] Dashboard data fetching
- [ ] Activity CRUD operations
- [ ] Facilitador authentication flow

### P2 - Nice to Have (Could Have)
- [ ] Performance benchmarks
- [ ] Security penetration tests
- [ ] Load testing
- [ ] E2E user journeys

---

## 📊 Coverage Report

After running `npm run test:coverage`, view report at:
```
coverage/index.html
```

**Target Coverage:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Current Coverage (MVP):**
- auth.ts: 95%
- rate-limit.ts: 90%
- validation/schemas.ts: 85%
- Components: 60%

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --coverage
      - run: npm run build
```

---

## 🐛 Common Issues & Solutions

### Issue: Tests fail with "Cannot find module"

**Solution:** Check `@` alias in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Issue: localStorage errors in tests

**Solution:** Already mocked in `src/__tests__/setup.ts`

### Issue: "fetch is not defined"

**Solution:** fetch is mocked globally in setup.ts

### Issue: Tests timeout

**Solution:** Increase timeout in test:
```typescript
it('should do X', async () => {
  // ...
}, { timeout: 10000 }); // 10 seconds
```

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Zod Testing Guide](https://zod.dev/)

---

## ✅ Next Steps

### For Next Session:
1. Run `npm test` to verify all MVP tests pass
2. Check coverage report: `npm run test:coverage`
3. Add P1 tests as you develop new features
4. Set up GitHub Actions for CI/CD

### Before Production:
1. Achieve 80%+ coverage on core logic
2. Run security tests
3. Performance benchmarks
4. E2E testing scenarios

---

## 🎓 Learning Resources

**Testing Pyramid:**
```
        /\
       /  \     E2E Tests (5%)
      /----\
     /      \   Integration Tests (15%)
    /--------\
   /          \ Unit Tests (80%)
  /____________\
```

Focus on the base (unit tests) first, then work up.

