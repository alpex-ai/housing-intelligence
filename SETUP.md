# Alpex Housing Intelligence Dashboard

A comprehensive housing affordability tracker with real-time data visualization.

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  FRED APIs      │────▶│  Supabase    │────▶│  Next.js    │
│  (Data Source)  │     │  (Postgres)  │     │  Dashboard   │
└─────────────────┘     └──────────────┘     └─────────────┘
                               ▲                     │
                               └─────────────────────┘
                                    (Server Actions)
```

## 📦 Project Structure

```
alpex-housing/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home dashboard
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── HealthIndexCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── PriceChart.tsx
│   │   ├── AffordabilityChart.tsx
│   │   └── RegionalTable.tsx
│   └── lib/
│       ├── supabase.ts      # Supabase client
│       ├── data.ts          # Data fetching
│       ├── types.ts         # TypeScript types
│       ├── utils.ts         # Utility functions
│       └── database.types.ts # Supabase types
├── scripts/
│   └── import-data.ts       # Data import script
├── supabase/
│   └── schema.sql           # Database schema
└── [config files]
```

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
cd ~/projects/alpex-housing
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for data import)

### 3. Database Setup

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Run the contents of `supabase/schema.sql`

### 4. Import Initial Data

```bash
npm run import-data
```

Or use the gog CLI to extract from your spreadsheet:

```bash
# Export from Google Sheets to CSV
gog sheets get SPREADSHEET_ID "FRED_HISTORY!A1:L50" --json > data/fred_history.json

# Then transform and import
npx ts-node scripts/import-data.ts
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🎨 Features

### MVP (Current)
- ✅ Housing Health Index with visual status
- ✅ Key metrics cards (prices, rates, affordability)
- ✅ Interactive price trend charts
- ✅ Affordability over time visualization
- ✅ Regional breakdown table

### Roadmap
- [ ] Builder expenses tracker
- [ ] Household cost of living index
- [ ] Housing crash indicators
- [ ] Economic index visualization
- [ ] Data API endpoints
- [ ] Email alerts for threshold changes
- [ ] Metro-level drill-down
- [ ] Forecasting models

## 📊 Data Sources

- **FRED (Federal Reserve Economic Data)**: Mortgage rates, home prices, inventory
- **Census Bureau**: Household income, construction data
- **BLS (Bureau of Labor Statistics)**: Inflation, cost of living

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- Project Settings > Environment Variables

### Custom Server

```bash
npm run build
npm start
```

## 💰 Monetization Strategy

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic dashboard, current data, regional view |
| **Pro** | $19/mo | Historical charts, API access, email alerts, CSV export |
| **Enterprise** | Custom | White-label, custom data feeds, dedicated support |

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Hosting**: Vercel

## 📝 License

Copyright © 2026 Alpex AI. All rights reserved.
