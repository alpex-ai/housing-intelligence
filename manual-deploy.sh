#!/bin/bash
# Manual deployment script using Vercel CLI

echo "🚀 Manual Vercel Deployment"
echo "============================"
echo ""

cd /Users/joey/.openclaw/workspace/projects/alpex-housing

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo ""
echo "🔧 Setting environment variables..."

# Export env vars for Vercel
export NEXT_PUBLIC_SUPABASE_URL="https://lmmpvvtkzlnblvlflhpk.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NTA2MDYsImV4cCI6MjA4NTMyNjYwNn0.Sf7l8RvG9Ou90s-7XJnYpDhtGd6m0MJ2rbVdIxbfc1k"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM"
export FRED_API_KEY="4bf29c1eba04aa0ca396ea6653ea0199"
export CRON_SECRET="alpex-housing-cron-secret-2026"
export VERCEL_TOKEN="PnCmukTR7g3zOQEcP2NKEkkj"

echo ""
echo "🚀 Deploying to production..."
echo ""

# Deploy using token
vercel --prod --token "$VERCEL_TOKEN" --scope alpex-ai --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next: Run ./sync-data.sh to import FRED data"
