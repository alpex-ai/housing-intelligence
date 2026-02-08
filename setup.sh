#!/bin/bash
# Setup script for Alpex Housing Intelligence
# Run this to set up the database and deploy

echo "🚀 Alpex Housing Intelligence Setup"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

echo ""
echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🗄️  Step 2: Setting up database..."
echo "Please run the SQL in Supabase SQL Editor:"
echo "https://supabase.com/dashboard/project/lmmpvvtkzlnblvlflhpk/sql/new"
echo ""
echo "Copy and paste the contents of supabase/setup.sql"
echo ""
read -p "Press Enter once you've run the SQL..."

echo ""
echo "📊 Step 3: Syncing initial data from FRED..."
npm run sync-data

echo ""
echo "🌐 Step 4: Setting up Vercel..."
echo "Please add these environment variables in Vercel:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://lmmpvvtkzlnblvlflhpk.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5ODI1MjAsImV4cCI6MjA1NDU1ODUyMH0.jXtXHQAhJ8qClmNRADB4vNSO9Lh0kYhj6HPV3xE8d8k"
echo "SUPABASE_SERVICE_ROLE_KEY=[your_service_role_key]"
echo "FRED_API_KEY=4bf29c1eba04aa0ca396ea6653ea0199"
echo "CRON_SECRET=alpex-housing-cron-secret-2026"
echo ""
read -p "Press Enter once you've added the env vars..."

echo ""
echo "🚀 Step 5: Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Setup complete!"
echo "Your dashboard should be live shortly."
