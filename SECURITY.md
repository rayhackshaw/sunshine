# Security Guide

This document outlines the security measures implemented in the Sunshine application and best practices for deployment.

## Security Features Implemented

### 1. API Authentication

**tRPC Mutations:**
- All database mutations require API key authentication via `Authorization: Bearer <CRON_SECRET>` header
- `updatePoints` mutation is protected with `protectedProcedure` middleware
- Unauthorized requests receive a `401 UNAUTHORIZED` response

**Cron Endpoints:**
- `/api/cron/isohel` - Protected with Bearer token authentication
- `/api/cron/awake` - Protected with Bearer token authentication
- Both endpoints validate `CRON_SECRET` environment variable

### 2. Input Validation

**Zod Schemas:**
- All tRPC inputs are validated using Zod schemas
- `updatePoints` only accepts valid city names from predefined list
- Sunlight values must be non-negative integers
- Invalid inputs are rejected before reaching the database

### 3. Environment Variable Security

**Validation:**
- All required environment variables are validated at build time
- Missing or invalid variables cause build failures (fail-fast approach)
- Validation schema in `src/env.mjs`

**Required Secrets:**
- `CRON_SECRET` - Minimum 32 characters required
- `OPENWEATHERMAP_API_KEY` - Required for weather API calls
- Database credentials - All validated as proper URLs/strings

### 4. Error Handling

**Error Sanitization:**
- Raw errors are never exposed to clients
- Internal errors are logged server-side only
- Clients receive generic error messages
- Stack traces and sensitive data are hidden

**Example:**
```typescript
catch (error) {
  console.error("Error updating sunlight data:", error); // Logged server-side
  res.status(500).json({
    success: false,
    error: "Failed to update sunlight data" // Generic client message
  });
}
```

### 5. Type Safety

**TypeScript Enforcement:**
- ESLint rules re-enabled for unsafe type operations (as warnings)
- Build-time TypeScript checking enabled
- No `any` types in new code
- Proper type guards and assertions

### 6. Database Security

**Connection Security:**
- SSL/TLS connections to PostgreSQL (via Neon)
- Connection pooling with PgBouncer
- Credentials stored as environment variables
- No hardcoded connection strings

**Query Security:**
- Prisma ORM prevents SQL injection
- Parameterized queries only
- Input validation before database operations

## Security Best Practices

### Deployment Checklist

Before deploying to production:

- [ ] Generate a strong `CRON_SECRET` (min 32 chars): `openssl rand -base64 32`
- [ ] Obtain `OPENWEATHERMAP_API_KEY` from https://openweathermap.org/api
- [ ] Set all environment variables in Cloudflare Dashboard
- [ ] Verify environment variables are set: Check logs for validation errors
- [ ] Test cron endpoints with authentication
- [ ] Confirm TypeScript build passes: `npm run build`
- [ ] Review ESLint warnings: `npm run lint`
- [ ] Test API endpoints in production environment

### Secret Rotation

**CRON_SECRET Rotation:**
1. Generate new secret: `openssl rand -base64 32`
2. Update in Cloudflare environment variables
3. Update in your cron scheduler/worker
4. Test all cron endpoints
5. Remove old secret after confirming everything works

**API Key Rotation:**
1. Generate new API key from provider (OpenWeatherMap, Mapbox)
2. Update in Cloudflare environment variables
3. Test affected endpoints
4. Revoke old key after confirming everything works

### Monitoring & Logging

**What to Monitor:**
- Failed authentication attempts (401 responses)
- API rate limit hits
- Database connection errors
- Cron job failures
- Unusual traffic patterns

**Cloudflare Logging:**
- Enable observability in `wrangler.jsonc`
- Use Cloudflare Workers Logpush for centralized logs
- Set up alerts for error rate spikes

**Recommended Alerts:**
- 5xx error rate > 1%
- 401 error rate > 10 requests/hour
- Cron job failure
- Database connection timeouts

### API Rate Limiting

**Current Status:**
- No rate limiting implemented (relies on Cloudflare's DDoS protection)

**Recommended Implementation:**
Add rate limiting middleware to tRPC procedures:
```typescript
import { TRPCError } from "@trpc/server";

const rateLimiter = t.middleware(async ({ ctx, next }) => {
  // Implement rate limiting logic
  // Example: Redis-based rate limiter
  const key = ctx.req.headers['cf-connecting-ip'];
  // Check rate limit...

  return next();
});
```

### Database Best Practices

**Connection Pooling:**
- Use `POSTGRES_PRISMA_URL` (with PgBouncer) for application queries
- Use `POSTGRES_URL_NON_POOLING` for migrations only
- Monitor connection pool usage

**Backups:**
- Neon provides automatic backups
- Test restore procedure regularly
- Consider point-in-time recovery setup

### Content Security

**Headers Recommendations:**

Add to `next.config.mjs`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ];
}
```

## Vulnerability Reporting

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email the maintainer directly (see repository owner)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)

## Security Updates

**Dependencies:**
- Regularly update dependencies: `npm update`
- Check for security vulnerabilities: `npm audit`
- Review Dependabot alerts (if enabled)

**Update Schedule:**
- Critical security patches: Immediate
- High severity: Within 7 days
- Medium/Low severity: Monthly review

## Compliance Considerations

**Data Privacy:**
- No user authentication = no user data stored
- City sunlight data is public information
- Database contains only aggregated weather data
- No PII (Personally Identifiable Information) collected

**API Terms of Service:**
- OpenWeatherMap: Review usage limits and terms
- Mapbox: Ensure token is properly scoped
- Comply with all third-party API terms

## Security Audit History

| Date | Type | Findings | Status |
|------|------|----------|--------|
| 2024-03-30 | Manual Review | Hardcoded API key removed | ✅ Fixed |
| 2024-03-30 | Manual Review | Unauthenticated mutations | ✅ Fixed |
| 2024-03-30 | Manual Review | Missing env validation | ✅ Fixed |
| 2024-03-30 | Manual Review | Error exposure | ✅ Fixed |
| 2024-03-30 | Manual Review | TypeScript safety disabled | ✅ Fixed |

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Cloudflare Security Best Practices](https://developers.cloudflare.com/fundamentals/basic-tasks/protect-your-origin-server/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/guides/database/advanced-database-tasks/sql-injection)
