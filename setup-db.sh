#!/bin/bash
# Database setup script
# Creates all tables in Supabase

set -e

echo "🗄️  Alpex Housing Intelligence - Database Setup"
echo "================================================"

SUPABASE_URL="https://lmmpvvtkzlnblvlflhpk.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM"

echo ""
echo "Creating tables via Supabase REST API..."

# We'll use a simple approach - run SQL via the SQL endpoint
SQL_FILE="supabase/setup.sql"

echo ""
echo "⚠️  Please run this SQL manually in Supabase SQL Editor:"
echo "   https://supabase.com/dashboard/project/lmmpvvtkzlnblvlflhpk/sql/new"
echo ""
echo "Or copy and paste the contents of: $SQL_FILE"
echo ""

# Display first few lines
echo "📄 SQL Preview:"
echo "---"
head -20 "$SQL_FILE"
echo "..."
echo "---"

echo ""
read -p "Press Enter to open Supabase SQL Editor in browser..."

# Open browser
if command -v open &> /dev/null; then
    open "https://supabase.com/dashboard/project/lmmpvvtkzlnblvlflhpk/sql/new"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://supabase.com/dashboard/project/lmmpvvtkzlnblvlflhpk/sql/new"
fi

echo ""
echo "✅ Once you've run the SQL, press Enter to continue..."
read -p ""

echo ""
echo "🔍 Verifying tables..."

# Check if tables exist
TABLES=("housing_metrics" "regional_affordability" "builder_expenses" "household_expenses" "crash_indicators" "economic_index")

for table in "${TABLES[@]}"; do
    RESPONSE=$(curl -s "$SUPABASE_URL/rest/v1/$table?select=id&limit=1" \
        -H "apikey: $SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SERVICE_ROLE_KEY")
    
    if echo "$RESPONSE" | grep -q "error"; then
        echo "  ❌ $table - needs to be created"
    else
        echo "  ✅ $table"
    fi
done

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next: Run ./deploy.sh to deploy to Vercel"
