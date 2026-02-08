#!/bin/bash
# Deploy script for Alpex Housing Intelligence
# Uses Vercel API directly

set -e

echo "🚀 Alpex Housing Intelligence Deployment"
echo "========================================="

PROJECT_ID="housing-intelligence"
TEAM_ID="alpex-ai"
VERCEL_TOKEN="PnCmukTR7g3zOQEcP2NKEkkj"

echo ""
echo "📦 Step 1: Ensuring dependencies..."
npm install --silent

echo ""
echo "🗄️  Step 2: Setting up Vercel environment variables..."

# Set env vars via Vercel API
ENV_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL=https://lmmpvvtkzlnblvlflhpk.supabase.co"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NTA2MDYsImV4cCI6MjA4NTMyNjYwNn0.Sf7l8RvG9Ou90s-7XJnYpDhtGd6m0MJ2rbVdIxbfc1k"
  "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM"
  "FRED_API_KEY=4bf29c1eba04aa0ca396ea6653ea0199"
  "CRON_SECRET=alpex-housing-cron-secret-2026"
)

for env_var in "${ENV_VARS[@]}"; do
  key="${env_var%%=*}"
  value="${env_var#*=}"
  
  echo "  Setting $key..."
  curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"$key\",
      \"value\": \"$value\",
      \"type\": \"encrypted\",
      \"target\": [\"production\", \"preview\", \"development\"]
    }" > /dev/null
done

echo ""
echo "🚀 Step 3: Deploying to Vercel..."

# Trigger deployment
DEPLOY_RESPONSE=$(curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_ID\",
    \"project\": \"$PROJECT_ID\",
    \"teamId\": \"$TEAM_ID\",
    \"target\": \"production\",
    \"gitSource\": {
      \"type\": \"github\",
      \"repo\": \"alpex-ai/housing-intelligence\",
      \"ref\": \"main\"
    }
  }")

DEPLOY_URL=$(echo $DEPLOY_RESPONSE | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "✅ Deployment triggered!"
echo ""
echo "🌐 URL: https://$PROJECT_ID.vercel.app"
echo ""
echo "⏱️  Build in progress... Check Vercel dashboard for status."
echo "   https://vercel.com/$TEAM_ID/$PROJECT_ID"
echo ""
echo "📊 Next steps:"
echo "   1. Wait for build to complete (2-3 minutes)"
echo "   2. Run: npm run sync-data (to import initial FRED data)"
echo "   3. Visit your dashboard!"
