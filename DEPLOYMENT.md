# Deployment Guide

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Link Project
```bash
cd /path/to/alpex-housing
vercel link
# Select alpex-ai/housing-intelligence
```

### 4. Set Environment Variables
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add FRED_API_KEY
vercel env add CRON_SECRET
```

### 5. Deploy
```bash
vercel --prod
```

Or push to main branch for auto-deploy:
```bash
git push origin main
```

## Supabase Setup

### 1. Run Migrations
```bash
npx supabase link --project-ref lmmpvvtkzlnblvlflhpk
npx supabase db push
```

### 2. Verify Tables
- housing_metrics
- regional_affordability
- builder_expenses
- household_expenses
- crash_indicators
- economic_index

### 3. Set up Auto-Refresh
The Vercel cron job runs daily at 9 AM UTC.

## Getting FRED API Key

1. Go to https://fred.stlouisfed.org/
2. Create free account
3. Go to https://research.stlouisfed.org/useraccount/apikeys/
4. Generate new key
5. Add to Vercel env vars

## Custom Domain

1. Buy domain (e.g., housing.alpex.ai)
2. In Vercel: Settings → Domains
3. Add domain and follow DNS instructions
4. Wait for SSL certificate

## Monitoring

- Vercel Analytics: Built-in
- Supabase Dashboard: https://supabase.com/dashboard
- Uptime: https://uptime.alpex.ai (optional)

## Rollback

```bash
vercel rollback
```

Or revert in Git history and redeploy.
