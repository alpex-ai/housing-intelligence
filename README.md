# Alpex Housing Intelligence

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alpex-ai/housing-intelligence)

A comprehensive housing affordability tracker with real-time data visualization. Built with Next.js, Supabase, and FRED API.

![Dashboard Preview](public/dashboard-preview.png)

## Features

- **Housing Health Index**: Weighted score combining affordability, supply, and risk metrics
- **Interactive Charts**: Price trends, affordability over time, mortgage rate correlations
- **Regional Breakdowns**: Compare affordability across NE, Midwest, South, West
- **Builder Cost Tracker**: Material costs affecting new construction (lumber, steel, concrete, etc.)
- **Household Expense Monitor**: Cost of living index tracking 70+ items
- **Crash Indicators**: Early warning signals for market instability
- **Automated Data Sync**: Daily pulls from FRED API at 9 AM UTC

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Data Source**: FRED API (Federal Reserve Economic Data)
- **Hosting**: Vercel
- **Automation**: Vercel Cron Jobs

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/alpex-ai/housing-intelligence.git
cd housing-intelligence
npm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://lmmpvvtkzlnblvlflhpk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRED_API_KEY=your_fred_api_key
CRON_SECRET=your_random_secret_for_cron
```

Get FRED API key: https://fred.stlouisfed.org/docs/api/api_key.html

### 3. Database Setup

Run the schema in Supabase SQL Editor:

```sql
-- Copy contents of supabase/schema.sql
```

### 4. Sync Initial Data

```bash
npm run sync-data
```

### 5. Run Dev Server

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
alpex-housing/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Dashboard home
│   │   ├── builder-costs/      # Builder costs page
│   │   ├── household-expenses/ # Household expenses page
│   │   ├── crash-indicators/   # Crash indicators page
│   │   └── api/cron/sync-fred  # Daily sync endpoint
│   ├── components/             # React components
│   ├── lib/
│   │   ├── fred-api.ts         # FRED API integration
│   │   ├── data.ts             # Data fetching
│   │   └── types.ts            # TypeScript types
│   └── ...
├── scripts/
│   └── sync-fred-data.ts       # Daily sync script
├── supabase/
│   └── schema.sql              # Database schema
└── ...
```

## Data Sources

| Metric | FRED Series | Frequency |
|--------|-------------|-----------|
| Median Home Price | MSPUS | Quarterly |
| New Home Price | MSPNHSUS | Monthly |
| 30yr Mortgage Rate | MORTGAGE30US | Weekly |
| Fed Funds Rate | FEDFUNDS | Daily |
| Housing Inventory | ACTLISCOU | Weekly |
| Building Permits | PERMIT | Monthly |

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

The cron job for daily data sync is configured in `vercel.json`.

### Environment Variables on Vercel

Add these in Project Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRED_API_KEY`
- `CRON_SECRET`

## API Endpoints

### GET /api/cron/sync-fred

Triggers daily data sync from FRED. Protected by `CRON_SECRET`.

### Public Data API (Coming Soon)

```
GET /api/v1/metrics/latest
GET /api/v1/metrics/history?start=2024-01-01&end=2024-12-31
GET /api/v1/regional
GET /api/v1/indicators
```

## Roadmap

See [ROADMAP.md](public/ROADMAP.md) for planned features.

## License

Copyright © 2026 Alpex AI. All rights reserved.

## Support

For questions or issues, contact: andrew@thedyars.com
