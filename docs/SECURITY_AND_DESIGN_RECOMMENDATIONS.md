# Security and Design Recommendations for Banking Onboarding Application

## Executive Summary

This document outlines critical security vulnerabilities and design improvements identified in the banking onboarding application. The application currently has several high-severity security issues that must be addressed before production deployment.

## 🚨 Critical Security Vulnerabilities

### 1. Authentication and Authorization

**Current State:** No authentication or authorization implemented.

**Vulnerabilities:**
- All API endpoints are publicly accessible
- No user session management
- No role-based access control
- Anyone can submit applications or access configuration

**Recommendations:**
```typescript
// Implement JWT-based authentication
import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'

// Middleware for protected routes
const authMiddleware = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
})

// Apply to sensitive endpoints
app.post('/api/applications', authMiddleware, submitApplication)
app.post('/api/credit-check', authMiddleware, performCreditCheck)
```

### 2. Path Traversal Vulnerability

**Location:** `server/index.ts` - `loadConfigWithFallback` function

**Vulnerability:** Unsanitized `bankSlug` parameter used in file path construction.

**Fix:**
```typescript
const sanitizedBankSlug = bankSlug.replace(/[^a-zA-Z0-9-]/g, '')
const bankConfigPath = path.join(configDir, sanitizedBankSlug, `${configName}.json`)
```

### 3. CORS Configuration

**Current State:** `app.use(cors())` - Allows all origins

**Fix:**
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### 4. Sensitive Data Exposure

**Issues:**
- SSN logged to console (even partially)
- Bad SSNs list exposed via API
- No encryption for sensitive data
- Applications stored as plain JSON files

**Recommendations:**
- Remove all SSN logging
- Move bad SSN validation to server-only
- Implement field-level encryption
- Use encrypted database storage

### 5. Input Validation

**Current State:** No backend validation on POST requests

**Fix:**
```typescript
import { z } from 'zod'

const creditCheckSchema = z.object({
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/)
})

app.post('/api/credit-check', validateRequest(creditCheckSchema), async (req, res) => {
  // Validated data in req.body
})
```

### 6. Rate Limiting

**Current State:** No rate limiting implemented

**Fix:**
```typescript
import rateLimit from 'express-rate-limit'

const creditCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 credit checks per IP
  message: 'Too many credit check requests'
})

app.post('/api/credit-check', creditCheckLimiter, ...)
```

## 🏗️ Architectural Improvements

### 1. Data Persistence Layer

**Current Issues:**
- File-based storage not scalable
- No database transactions
- No data integrity guarantees
- No backup strategy

**Recommended Architecture:**

```typescript
// PostgreSQL with Prisma ORM
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id                String   @id @default(uuid())
  email            String   @unique
  phone            String
  ssn              String   // Encrypted
  dateOfBirth      DateTime
  applications     Application[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Application {
  id               String   @id @default(uuid())
  customerId       String
  customer         Customer @relation(fields: [customerId], references: [id])
  products         Json
  status           ApplicationStatus
  creditCheckResult Json?
  submittedAt      DateTime @default(now())
  
  @@index([customerId])
  @@index([status])
}

enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
  PROCESSING
}
```

### 2. Session Management

**Implementation with Redis:**

```typescript
import session from 'express-session'
import RedisStore from 'connect-redis'
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL
})

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true,
    maxAge: 1000 * 60 * 30 // 30 minutes
  }
}))
```

### 3. Background Job Processing

**BullMQ Implementation:**

```typescript
import { Queue, Worker } from 'bullmq'

// Queue definitions
const emailQueue = new Queue('emails', { connection: redisConnection })
const creditCheckQueue = new Queue('credit-checks', { connection: redisConnection })

// Email worker
new Worker('emails', async job => {
  const { to, subject, template, data } = job.data
  await sendEmail(to, subject, template, data)
}, { connection: redisConnection })

// Credit check worker with retry
new Worker('credit-checks', async job => {
  const { ssn, applicationId } = job.data
  const result = await performCreditCheck(ssn)
  await updateApplication(applicationId, result)
}, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
})
```

### 4. API Versioning and Documentation

**Structure:**
```
/api/v1/
  /config/*
  /applications
  /credit-check
/api/v2/
  /config/*
  /applications
  /credit-check
  /customers
```

**OpenAPI Documentation:**
```typescript
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Banking Onboarding API',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.ts'],
}

const specs = swaggerJsdoc(options)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
```

### 5. Monitoring and Logging

**Structured Logging:**
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'onboarding-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

// Add request logging
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip
  })
  next()
})
```

**Metrics Collection:**
```typescript
import promClient from 'prom-client'

const register = new promClient.Registry()

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
})

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})
```

## 🛡️ Security Enhancements

### 1. Content Security Policy

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))
```

### 2. CSRF Protection

```typescript
import csrf from 'csurf'

const csrfProtection = csrf({ cookie: true })

app.use(csrfProtection)

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})
```

### 3. Encryption for Sensitive Data

```typescript
import crypto from 'crypto'

class EncryptionService {
  private algorithm = 'aes-256-gcm'
  private key: Buffer
  
  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  }
  
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }
  
  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}
```

## 📋 Code Quality Improvements

### 1. Error Handling Middleware

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }
  
  logger.error('Unexpected error', { error: err })
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
}

app.use(errorHandler)
```

### 2. Testing Strategy

**Unit Tests:**
- Test all validation schemas
- Test encryption/decryption
- Test business logic in isolation

**Integration Tests:**
- Test API endpoints with database
- Test authentication flows
- Test error scenarios

**E2E Tests:**
```typescript
// playwright/onboarding.spec.ts
import { test, expect } from '@playwright/test'

test('complete onboarding flow', async ({ page }) => {
  await page.goto('/onboarding')
  
  // Product selection
  await page.click('[data-testid="product-checking"]')
  await page.click('[data-testid="continue-button"]')
  
  // Customer info
  await page.fill('[data-testid="email-input"]', 'test@example.com')
  await page.fill('[data-testid="phone-input"]', '555-123-4567')
  
  // ... continue through all steps
  
  await expect(page).toHaveURL('/onboarding/confirmation')
})
```

### 3. Performance Optimization

**Database Queries:**
```typescript
// Use database indexes
await prisma.application.findMany({
  where: {
    status: 'PENDING',
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  },
  include: {
    customer: true
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

**Caching Strategy:**
```typescript
import NodeCache from 'node-cache'

const configCache = new NodeCache({ stdTTL: 300 }) // 5 minute cache

async function getConfiguration(key: string) {
  const cached = configCache.get(key)
  if (cached) return cached
  
  const config = await loadFromDatabase(key)
  configCache.set(key, config)
  return config
}
```

## 🔧 Implementation Roadmap

### Phase 1: Critical Security (Week 1-2)
- [ ] Fix CORS configuration
- [ ] Add authentication middleware
- [ ] Sanitize all inputs
- [ ] Fix path traversal vulnerability
- [ ] Remove sensitive data logging
- [ ] Implement rate limiting

### Phase 2: Data Layer (Week 3-4)
- [ ] Set up PostgreSQL database
- [ ] Implement Prisma ORM
- [ ] Migrate from file storage
- [ ] Set up Redis for sessions
- [ ] Implement data encryption
- [ ] Add database backups

### Phase 3: Infrastructure (Week 5-6)
- [ ] Implement structured logging
- [ ] Set up monitoring with Prometheus
- [ ] Add error tracking (Sentry)
- [ ] Implement BullMQ for jobs
- [ ] Add health check endpoints
- [ ] Set up CI/CD security scans

### Phase 4: Polish (Week 7-8)
- [ ] Complete test coverage
- [ ] Add API documentation
- [ ] Implement feature flags
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

## 🎯 Success Criteria

- All critical security vulnerabilities resolved
- 90%+ test coverage
- Sub-200ms API response times
- Zero high/critical findings in security scan
- Successful penetration testing
- Compliance with banking regulations

## 📝 Notes

This document should be treated as a living document and updated as new vulnerabilities are discovered or requirements change. Regular security audits should be conducted to ensure ongoing compliance and security.