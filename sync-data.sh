#!/bin/bash
# Sync FRED data to Supabase

echo "📊 Syncing FRED Data"
echo "===================="
echo ""

cd /Users/joey/.openclaw/workspace/projects/alpex-housing

# Set env vars
export NEXT_PUBLIC_SUPABASE_URL="https://lmmpvvtkzlnblvlflhpk.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM"
export FRED_API_KEY="4bf29c1eba04aa0ca396ea6653ea0199"

echo "🔄 Fetching data from FRED API..."
echo ""

# Run the sync
npm run sync-data

echo ""
echo "✅ Data sync complete!"
