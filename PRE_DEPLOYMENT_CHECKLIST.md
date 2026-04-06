# Pre-Deployment Checklist

Complete this checklist before deploying to Cloudflare Pages.

## 1. Environment Variables Setup

### Generate Secrets

```bash
# Generate CRON_SECRET (minimum 32 characters)
openssl rand -base64 32
```

Save this value - you'll need it for both Cloudflare and your cron scheduler.

### Obtain API Keys

- [ ] **OpenWeatherMap API Key**
  - Sign up: https://openweathermap.org/api
  - Create API key
  - Wait 10 minutes for activation
  - Test: `curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY"`

- [ ] **Mapbox Access Token**
  - Sign up: https://account.mapbox.com/
  - Create public access token
  - Copy token starting with `pk.`

### Database Connection

- [ ] **Neon PostgreSQL**
  - Create project: https://console.neon.tech/
  - Copy connection strings:
    - `POSTGRES_URL`
    - `POSTGRES_PRISMA_URL`
    - `POSTGRES_URL_NON_POOLING`

## 2. Local Configuration

### Create .env file

```bash
cp .env.example .env
```

Edit `.env` and fill in ALL values:

```env
NODE_ENV="development"
POSTGRES_URL="<from Neon>"
POSTGRES_PRISMA_URL="<from Neon>"
POSTGRES_URL_NON_POOLING="<from Neon>"
CRON_SECRET="<from openssl command>"
OPENWEATHERMAP_API_KEY="<from OpenWeatherMap>"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="<from Mapbox>"
```

### Verify .env file

- [ ] All variables are set (no empty strings)
- [ ] `CRON_SECRET` is at least 32 characters
- [ ] Database URLs start with `postgresql://`
- [ ] Mapbox token starts with `pk.`
- [ ] No quotes around values (unless part of the value)

## 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Open Prisma Studio to verify
pnpm prisma studio
```

### Verify Database

- [ ] `sunlight` table exists
- [ ] Has columns for all 28 cities
- [ ] Can manually insert a test row (id: 1)

## 4. Local Testing

### Install Dependencies

```bash
pnpm install
```

### Type Check

```bash
pnpm type-check
```

**Expected:** No errors (some warnings are OK if from dependencies)

### Lint Check

```bash
pnpm lint
```

**Expected:** No critical errors (warnings are acceptable)

### Build Test

```bash
pnpm build
```

**Expected:** Build completes successfully

### Run Locally

```bash
pnpm dev
```

Visit `http://localhost:3000` and verify:

- [ ] Homepage loads without errors
- [ ] Map displays correctly
- [ ] No console errors in browser
- [ ] Network requests succeed

### Test API Endpoints

```bash
# Test public endpoint
curl http://localhost:3000/api/trpc/isohel.getAllData

# Should return sunlight data or null (if no data yet)

# Test authenticated cron endpoint
curl -X POST http://localhost:3000/api/cron/isohel \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Should return: {"success":true,"sunlights":[...]}

# Test unauthenticated request (should fail)
curl -X POST http://localhost:3000/api/cron/isohel

# Should return: {"success":false}
```

## 5. Git Preparation

### Check Git Status

```bash
git status
```

### Verify .gitignore

Ensure these are ignored:

- [ ] `.env` (should not be tracked)
- [ ] `.dev.vars` (should not be tracked)
- [ ] `node_modules/`
- [ ] `.next/`

### Commit Changes

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: secure API and Cloudflare deployment ready"

# Push to GitHub
git push origin main
```

## 6. Cloudflare Setup

### Authenticate Wrangler

```bash
wrangler login
```

Browser will open for authentication.

### Set Environment Variables in Cloudflare

Choose method:

**Method A: Dashboard (Recommended)**
1. Go to Cloudflare Dashboard > Pages
2. If project exists: Settings > Environment Variables
3. Add all variables from your `.env` file
4. Set for both Production and Preview environments

**Method B: CLI**
```bash
wrangler pages secret put CRON_SECRET --project-name=sunshine
wrangler pages secret put OPENWEATHERMAP_API_KEY --project-name=sunshine
wrangler pages secret put POSTGRES_URL --project-name=sunshine
wrangler pages secret put POSTGRES_PRISMA_URL --project-name=sunshine
wrangler pages secret put POSTGRES_URL_NON_POOLING --project-name=sunshine
wrangler pages secret put NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN --project-name=sunshine
wrangler pages secret put NODE_ENV --project-name=sunshine
```

### Verify Variables are Set

In Cloudflare Dashboard:
- [ ] All 7 variables show as "Set"
- [ ] No variables show empty values
- [ ] Variables are set for Production environment

## 7. Deploy

### Option A: GitHub Integration

1. Connect repository to Cloudflare Pages
2. Configure build settings:
   - Build command: `npm run build`
   - Build output: `.next`
   - Node version: `18`
3. Click "Save and Deploy"
4. Wait for build (3-5 minutes)

### Option B: CLI Deployment

```bash
# Build project
pnpm build

# Deploy to Cloudflare
pnpm deploy
```

## 8. Post-Deployment Verification

### Get Your Cloudflare Pages URL

From Cloudflare Dashboard or deployment output.

Example: `https://sunshine-abc.pages.dev`

### Test Production Endpoints

```bash
# Test homepage
curl https://sunshine-abc.pages.dev

# Should return HTML

# Test public API
curl https://sunshine-abc.pages.dev/api/trpc/isohel.getAllData

# Should return JSON data

# Test authenticated cron endpoint
curl -X POST https://sunshine-abc.pages.dev/api/cron/isohel \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Should return: {"success":true,"sunlights":[...]}
```

### Browser Testing

Visit your production URL and verify:

- [ ] Homepage loads
- [ ] Map displays correctly
- [ ] Sunlight data shows
- [ ] No console errors
- [ ] No 404 errors in Network tab

## 9. Set Up Cron Jobs

Choose one method:

### Method A: Cloudflare Worker (Recommended)

See [DEPLOYMENT.md](DEPLOYMENT.md#3-configure-cron-jobs) for complete instructions.

**Summary:**
1. Create new Worker
2. Add scheduled event handler
3. Configure cron triggers:
   - `0 0 * * *` (daily updates)
   - `0 */4 * * *` (database wake)
4. Set Worker environment variables

### Method B: External Service

Use cron-job.org, GitHub Actions, or similar.

**Endpoints to call:**
- `POST https://your-domain.pages.dev/api/cron/isohel` (daily)
- `POST https://your-domain.pages.dev/api/cron/awake` (every 4 hours)

**Headers:**
```
Authorization: Bearer YOUR_CRON_SECRET
```

### Verify Cron Setup

After first scheduled run:

- [ ] Check Cloudflare logs for successful requests
- [ ] Verify database updated with new sunlight values
- [ ] Confirm no error responses

## 10. Monitoring Setup

### Enable Cloudflare Analytics

1. Go to Pages > sunshine > Analytics
2. Review metrics dashboard
3. Set up alerts (optional)

### External Monitoring (Optional)

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up log aggregation (Logflare)

### Create Alerts

Recommended alerts:

- [ ] Site down (5xx errors > 5 in 5 minutes)
- [ ] Cron job failures
- [ ] Database connection errors
- [ ] High error rate (>1% of requests)

## 11. Documentation Review

### Read These Files

- [ ] [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [ ] [SECURITY.md](SECURITY.md) - Security best practices
- [ ] [CLOUDFLARE_MIGRATION.md](CLOUDFLARE_MIGRATION.md) - Migration details
- [ ] [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - Changes made

### Bookmark Resources

- [ ] Cloudflare Dashboard: https://dash.cloudflare.com/
- [ ] Neon Console: https://console.neon.tech/
- [ ] OpenWeatherMap Dashboard: https://home.openweathermap.org/
- [ ] Mapbox Account: https://account.mapbox.com/

## 12. Security Final Checks

### Secrets Security

- [ ] `CRON_SECRET` is at least 32 characters
- [ ] All secrets are stored in Cloudflare (not in code)
- [ ] `.env` and `.dev.vars` are in `.gitignore`
- [ ] No secrets in Git history

### API Security

- [ ] Cron endpoints require authentication
- [ ] tRPC mutations require authentication
- [ ] Error messages don't leak internal details
- [ ] Input validation is enabled

### Type Safety

- [ ] TypeScript builds without errors
- [ ] ESLint warnings reviewed
- [ ] No `any` types in new code

## 13. Rollback Plan

### Before Going Live

- [ ] Document current Vercel deployment (if applicable)
- [ ] Keep old deployment active during testing
- [ ] Have database backup

### If Issues Occur

1. Cloudflare Dashboard > Pages > Deployments
2. Find last working deployment
3. Click "Rollback to this deployment"

Or revert Git commit and redeploy:
```bash
git revert HEAD
git push origin main
```

## 14. Team Handoff (If Applicable)

### Share Access

- [ ] Cloudflare account access
- [ ] GitHub repository access
- [ ] Database credentials (securely)
- [ ] API keys (securely)

### Share Documentation

- [ ] All `.md` files in repository
- [ ] Deployment credentials (use password manager)
- [ ] Cron scheduler access

### Training

- [ ] How to deploy updates
- [ ] How to check logs
- [ ] How to rollback
- [ ] How to rotate secrets

## Completion

When all items are checked:

- ✅ Application is secure
- ✅ Environment is properly configured
- ✅ Testing is complete
- ✅ Deployment is successful
- ✅ Monitoring is set up
- ✅ Documentation is in place

**Status:** Ready for Production Use 🚀

## Quick Reference

### Important Commands

```bash
# Local development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm type-check         # Check TypeScript
pnpm lint               # Lint code

# Database
pnpm prisma generate    # Generate Prisma client
pnpm prisma db push     # Push schema
pnpm prisma studio      # Open database GUI

# Deployment
pnpm deploy             # Deploy to Cloudflare

# Wrangler
wrangler login          # Authenticate
wrangler pages deploy   # Deploy via CLI
```

### Important URLs

- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Neon Console:** https://console.neon.tech/
- **OpenWeatherMap:** https://openweathermap.org/
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler/

### Need Help?

- Check [TROUBLESHOOTING.md](DEPLOYMENT.md#troubleshooting)
- Review Cloudflare logs
- Check database connectivity
- Verify environment variables
- Test API endpoints manually
