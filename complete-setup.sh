#!/bin/bash
# Complete setup and verification script

set -e

cd /Users/joey/.openclaw/workspace/projects/alpex-housing

echo "🔧 Alpex Housing Intelligence - Complete Setup & Test"
echo "======================================================"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://lmmpvvtkzlnblvlflhpk.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM"
export FRED_API_KEY="4bf29c1eba04aa0ca396ea6653ea0199"

echo "🗄️  Syncing FRED data to Supabase..."
npm run sync-data

echo ""
echo "🌐 Checking Vercel deployment..."
VERCEL_TOKEN="PnCmukTR7g3zOQEcP2NKEkkj"

# Get latest deployment
DEPLOY_INFO=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?projectId=housing-intelligence&teamId=alpex-ai&limit=1")

DEPLOY_URL=$(echo "$DEPLOY_INFO" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
DEPLOY_STATE=$(echo "$DEPLOY_INFO" | grep -o '"state":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "  Deployment URL: $DEPLOY_URL"
echo "  Status: $DEPLOY_STATE"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Your dashboard: https://housing-intelligence.vercel.app"
echo ""
echo "If deployment shows 'ERROR' or 'CANCELED', trigger a redeploy:"
echo "  vercel --prod --token $VERCEL_TOKEN"
