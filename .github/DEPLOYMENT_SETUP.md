# GitHub Actions Deployment Setup

This project uses GitHub Actions to deploy to Cloudflare Pages because:
- The OpenNextJS Cloudflare adapter requires Worker deployment (not just static files)
- Windows has symlink permission issues with the build process
- GitHub Actions runs on Linux, avoiding these issues

## Setup Steps

### 1. Get Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit Cloudflare Workers** template
4. Add these permissions:
   - **Account** → **Cloudflare Pages** → **Edit**
   - **Account** → **Workers Scripts** → **Edit**
5. Set **Account Resources** → Include → Your account
6. Click **Continue to summary** → **Create Token**
7. **Copy the token** (you won't see it again!)

### 2. Get Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on **Workers & Pages**
3. Your Account ID is shown in the right sidebar
4. Copy it

### 3. Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: (paste your API token)
4. Click **Add secret**
5. Click **New repository secret** again:
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: (paste your account ID)
6. Click **Add secret**

### 4. Configure Environment Variables in Cloudflare

You still need to set your app's environment variables in Cloudflare:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** → **sunshine** project
3. **Settings** → **Environment variables**
4. Add these variables (for Production environment):

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `CRON_SECRET` | Generate with `openssl rand -base64 32` |
| `OPENWEATHERMAP_API_KEY` | Your OpenWeatherMap API key |
| `POSTGRES_URL` | Your Neon PostgreSQL URL |
| `POSTGRES_PRISMA_URL` | Your Neon pooled URL |
| `POSTGRES_URL_NON_POOLING` | Your Neon direct URL |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Your Mapbox token (starts with `pk.`) |

### 5. Deploy

Once secrets are configured:

```bash
git add .
git commit -m "feat: add GitHub Actions deployment"
git push origin main
```

The GitHub Action will automatically:
1. Build your app on Linux (no symlink issues!)
2. Deploy to Cloudflare using `opennextjs-cloudflare deploy`
3. Your site will be live at `https://sunshine.pages.dev` (or your custom domain)

### 6. Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the deployment progress
4. Check for any errors in the logs

### Troubleshooting

**If deployment fails:**
- Check that both secrets are set correctly in GitHub
- Verify environment variables are set in Cloudflare Dashboard
- Check the GitHub Actions logs for specific error messages
- Ensure your Cloudflare API token has correct permissions

**API Token Permissions Checklist:**
- ✅ Account → Cloudflare Pages → Edit
- ✅ Account → Workers Scripts → Edit
- ✅ Account Resources → Include → Your account

### Manual Deployment (Alternative)

If you need to deploy manually from a Linux/Mac machine or WSL:

```bash
pnpm install
pnpm run deploy
```

This will prompt you for Cloudflare authentication if needed.
