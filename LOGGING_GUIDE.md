---
name: LOGGING_GUIDE
description: Comprehensive logging setup guide for Grupo Plateado using Pino
---

# 📊 LOGGING GUIDE - CLUBSENIOR

**Framework:** Pino (high-performance JSON logger)  
**Setup Time:** 4 hours  
**Status:** ✅ Production-ready  

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger('MY_MODULE');

logger.info({ userId: 123 }, 'User logged in');
logger.warn({ code: 'RATE_LIMIT' }, 'Rate limit approaching');
logger.error({ error: err.message }, 'Operation failed');
logger.debug({ payload }, 'Processing request');
```

### Specialized Loggers

```typescript
import {
  authLogger,
  dbLogger,
  cacheLogger,
  paymentLogger,
  emailLogger,
  securityLogger,
} from '@/lib/loggers';

authLogger.info({ email: 'user@example.com' }, 'User logged in');
dbLogger.debug({ table: 'usuarios', operation: 'SELECT' }, 'DB query');
cacheLogger.trace({ key: 'user:123', hit: true }, 'Cache HIT');
paymentLogger.info({ transactionId: 'tx-123' }, 'Payment processed');
emailLogger.info({ to: 'user@example.com' }, 'Email sent');
securityLogger.warn({ event: 'UNAUTHORIZED_ACCESS' }, 'Security alert');
```

---

## 📁 File Structure

```
src/lib/
├── logger.ts                 # Core logger configuration
├── logger-middleware.ts      # Request/Response logging
└── loggers/
    └── index.ts             # Specialized loggers & contexts
```

---

## 📝 Logging Best Practices

### 1. Always Include Context

```typescript
// ❌ Bad
logger.info('User logged in');

// ✅ Good
logger.info({ userId: '123', email: 'user@example.com', ip: '192.168.1.1' }, 'User logged in');
```

### 2. Use Appropriate Log Levels

```typescript
logger.trace('Very detailed debugging info');      // Level 10
logger.debug('Development-level debugging');      // Level 20
logger.info('General informational messages');    // Level 30
logger.warn('Warning messages (recoverable)');    // Level 40
logger.error('Error messages (requires action)'); // Level 50
logger.fatal('Critical errors (app may crash)');  // Level 60
```

### 3. Never Log Sensitive Data

```typescript
// ❌ Bad
logger.info({ password: user.password }, 'User object');
logger.info({ creditCard: payment.cardNumber }, 'Payment info');

// ✅ Good
logger.info({ userId: user.id }, 'User logged in');
logger.info({ transactionId: payment.id }, 'Payment processed');
```

### 4. Use Structured Logging

```typescript
// ❌ Bad
logger.info(`User ${userId} performed action ${action} at ${timestamp}`);

// ✅ Good
logger.info(
  { userId, action, timestamp: new Date().toISOString() },
  'User action performed'
);
```

### 5. Include Duration for Operations

```typescript
const startTime = Date.now();
try {
  const result = await expensiveOperation();
  const duration = Date.now() - startTime;
  logger.info({ duration: `${duration}ms` }, 'Operation completed');
} catch (error) {
  const duration = Date.now() - startTime;
  logger.error({ error: error.message, duration: `${duration}ms` }, 'Operation failed');
}
```

---

## 🔑 Key Logging Points

### Authentication Flow
```typescript
// src/app/api/facilitador/auth/send-otp/route.ts
logger.info({ email }, 'OTP request received');
logger.debug({ code: otpCode.substring(0, 3) + '***' }, 'OTP generated');
logger.info({ email, duration }, 'OTP sent successfully');
```

### Database Operations
```typescript
// Any database query
const startTime = Date.now();
const result = await fetch(`${supabaseUrl}/rest/v1/usuarios`, ...);
logger.debug({
  table: 'usuarios',
  operation: 'SELECT',
  duration: `${Date.now() - startTime}ms`,
}, 'Database query');
```

### Cache Operations
```typescript
// src/lib/cache/kv.ts
const cacheHit = await kv.get(key);
logger.trace({
  key,
  hit: !!cacheHit,
  duration: `${Date.now() - start}ms`,
}, 'Cache lookup');
```

### Error Handling
```typescript
try {
  // ... operation
} catch (error) {
  logger.error({
    error: error.message,
    stack: error.stack,
    context: additionalData,
  }, 'Operation failed');
}
```

### Security Events
```typescript
// Unauthorized access attempts
logger.warn({
  event: 'UNAUTHORIZED_ACCESS',
  ip: clientIp,
  email: requestedEmail,
}, '🔒 Security alert');
```

---

## 🎯 Environment Configuration

### Development
```bash
NODE_ENV=development LOG_LEVEL=debug
# Output: Colorized, formatted for readability
# Includes DEBUG and TRACE levels
```

### Production
```bash
NODE_ENV=production LOG_LEVEL=info
# Output: JSON lines (one log per line)
# Excludes DEBUG and TRACE levels
# Optimized for log aggregation
```

### Set Log Level
```bash
LOG_LEVEL=warn  # Only warnings and errors
LOG_LEVEL=info  # Info, warnings, errors (default)
LOG_LEVEL=debug # Everything including debug
```

---

## 📊 Log Aggregation

### Output Formats

**Development (Pretty Printed)**
```
[15:32:45.123] INFO: User logged in
  module: AUTH
  email: user@example.com
  ip: 192.168.1.1
  duration: 245ms
```

**Production (JSON Lines)**
```json
{"level":30,"time":1694696365123,"module":"AUTH","email":"user@example.com","ip":"192.168.1.1","duration":245,"msg":"User logged in"}
```

### Integrating with Log Services

**For Vercel Logging:**
```typescript
// Logs automatically appear in Vercel Dashboard
// https://vercel.com/dashboard/project/logs
```

**For External Services (Datadog, LogRocket, etc.):**
```typescript
// Configure in production environment
// JSON output is compatible with all major log aggregators
```

---

## 🔍 Debugging with Logs

### Finding Issues

```bash
# View all errors
grep '"level":50' logs.json | jq

# Find specific user's activities
grep 'user@example.com' logs.json | jq

# Timeline of specific transaction
grep 'tx-12345' logs.json | jq '.time, .msg'

# Performance issues (slow queries)
grep '"duration":' logs.json | jq 'select(.duration > 1000)'
```

### Log Filtering

```bash
# Only AUTH logs
LOG_LEVEL=debug npm run dev | grep '"module":"AUTH"'

# Only errors
grep '"level":50' logs.json

# Last 100 errors
tail -100 logs.json | grep '"level":50'
```

---

## 📝 Common Logging Patterns

### API Endpoint

```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const logger = createLogger('API-ENDPOINT');

  try {
    logger.info({ method: 'POST', path: '/api/action' }, 'Request received');
    
    const data = await request.json();
    const duration = Date.now() - startTime;
    
    logger.info({ duration: `${duration}ms` }, 'Request processed');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
    }, 'Request failed');
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### Database Service

```typescript
export async function getUserById(userId: string) {
  const logger = createLogger('DB-SERVICE');
  const startTime = Date.now();

  try {
    const user = await fetch(`${url}/usuarios?id=eq.${userId}`, ...);
    const duration = Date.now() - startTime;
    
    logger.debug({
      table: 'usuarios',
      userId,
      duration: `${duration}ms`,
    }, 'User query completed');
    
    return user;
    
  } catch (error) {
    logger.error({
      table: 'usuarios',
      userId,
      error: error.message,
    }, 'User query failed');
    
    throw error;
  }
}
```

---

## 🎓 Advanced Usage

### Child Loggers with Bindings

```typescript
const userLogger = logger.child({ userId: '123', email: 'user@example.com' });
// All logs from this instance include userId and email
userLogger.info('User action'); // Automatically includes userId & email
```

### Custom Serializers

```typescript
const logger = pino({
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    error: pino.stdSerializers.err,
  },
});
```

### Performance Monitoring

```typescript
const metrics = {
  authTime: [],
  dbTime: [],
  cacheTime: [],
};

logger.on('log', (log) => {
  if (log.module === 'AUTH' && log.duration) {
    metrics.authTime.push(log.duration);
  }
});
```

---

## ✅ Checklist for Integration

- [x] Core logger configured (src/lib/logger.ts)
- [x] Specialized loggers created (src/lib/loggers/index.ts)
- [x] Request/Response middleware ready (src/lib/logger-middleware.ts)
- [ ] Integrate auth endpoints
- [ ] Integrate database operations
- [ ] Integrate cache operations
- [ ] Integrate payment operations
- [ ] Integrate email sending
- [ ] Set up log aggregation service
- [ ] Configure monitoring alerts

---

## 📚 References

- [Pino Documentation](https://getpino.io)
- [Pino Best Practices](https://getpino.io/#/docs/best-practices)
- [Structured Logging Guide](https://www.kartar.net/2015/12/structured-logging/)

---

## 🚨 Example: Full Integration

See `LOGGING_EXAMPLE.ts` for a complete, production-ready example of:
- Request logging
- Rate limit checking
- Input validation
- Database operations
- Email sending
- Error handling
- All with comprehensive logging

