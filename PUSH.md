# Push Instructions

Since exec commands are pending approval, run these manually:

## 1. Navigate to Project

```bash
cd ~/.openclaw/workspace/projects/alpex-housing
```

## 2. Initialize Git

```bash
git init
git remote add origin https://github.com/alpex-ai/housing-intelligence.git
```

## 3. Add All Files

```bash
git add .
```

## 4. Commit

```bash
git commit -m "Initial commit: Alpex Housing Intelligence Dashboard

- Complete Next.js app with TypeScript
- FRED API integration for daily data sync
- Dashboard with Housing Health Index
- Builder costs, household expenses, crash indicators pages
- Supabase schema and data sync scripts
- Dark theme UI with Tailwind CSS
- Responsive design with Recharts visualizations"
```

## 5. Push

```bash
git push -u origin main --force
```

## 6. Install Dependencies

```bash
npm install
```

## 7. Set Up Environment

```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

## 8. Run Dev Server

```bash
npm run dev
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

## Supabase Setup

1. Go to https://supabase.com/dashboard/project/lmmpvvtkzlnblvlflhpk
2. Open SQL Editor
3. Run the contents of `supabase/schema.sql`

## Get FRED API Key

1. Visit: https://fredaccount.stlouisfed.org/apikeys
2. Request API key (free)
3. Add to .env.local and Vercel dashboard

## Verify Daily Sync

The cron job is configured in vercel.json to run at 9 AM UTC daily.

To test manually:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://housing.alpex.ai/api/cron/sync-fred
```

## Questions?

Check DEPLOYMENT.md for detailed instructions.
