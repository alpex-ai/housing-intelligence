# Quick Database Setup

Since the automated setup requires Supabase RPC functions, run this SQL manually:

## Step 1: Create Tables

1. Go to: https://supabase.com/dashboard/project/lmmpvvtkzlnblvlflhpk/sql/new
2. Copy and paste the contents of `supabase/setup.sql`
3. Click "Run"

This will create all 6 tables with indexes and RLS policies.

## Step 2: Verify

Run this query to verify:
```sql
select tablename from pg_tables where schemaname = 'public';
```

You should see:
- housing_metrics
- regional_affordability
- builder_expenses
- household_expenses
- crash_indicators
- economic_index

## Step 3: Import Initial Data

Once tables are created, run:
```bash
cd ~/.openclaw/workspace/projects/alpex-housing
npm run sync-data
```

This will pull the last 2 years of data from FRED API.
