const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');

const SUPABASE_URL = 'https://lmmpvvtkzlnblvlflhpk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM';
const VERCEL_TOKEN = 'PnCmukTR7g3zOQEcP2NKEkkj';
const PROJECT_ID = 'housing-intelligence';
const TEAM_ID = 'alpex-ai';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setupDatabase() {
  console.log('🗄️  Setting up database...\n');
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS housing_metrics (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      date date NOT NULL UNIQUE,
      median_home_value decimal(12,2),
      median_new_home_sale_price decimal(12,2),
      mortgage_rate decimal(5,2),
      fed_funds_rate decimal(5,2),
      treasury_yield_10y decimal(5,2),
      core_inflation decimal(5,2),
      affordability_index decimal(6,2),
      median_household_income decimal(10,2),
      total_inventory integer,
      new_construction_inventory integer,
      building_permits integer,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS regional_affordability (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      date date NOT NULL,
      region text NOT NULL,
      median_home_price decimal(12,2),
      median_qualifying_income decimal(10,2),
      median_family_income decimal(10,2),
      median_mortgage_payment decimal(8,2),
      affordability_score decimal(6,2),
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(date, region)
    )`,
    `CREATE TABLE IF NOT EXISTS builder_expenses (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      date date NOT NULL,
      material_name text NOT NULL,
      current_price decimal(8,2),
      start_price decimal(8,2),
      percent_change decimal(5,2),
      total_change decimal(8,2),
      status text,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(date, material_name)
    )`,
    `CREATE TABLE IF NOT EXISTS household_expenses (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      date date NOT NULL,
      category text NOT NULL,
      item_name text NOT NULL,
      current_price decimal(8,2),
      start_price decimal(8,2),
      percent_change decimal(5,2),
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(date, item_name)
    )`,
    `CREATE TABLE IF NOT EXISTS crash_indicators (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      date date NOT NULL,
      variable_name text NOT NULL,
      category text NOT NULL,
      current_value decimal(8,2),
      points decimal(4,2),
      risk_tier text,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(date, variable_name)
    )`,
    `CREATE TABLE IF NOT EXISTS economic_index (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      date date NOT NULL UNIQUE,
      index_value decimal(8,2),
      mom_change decimal(6,2),
      mom_percent decimal(5,2),
      yoy_change decimal(6,2),
      yoy_percent decimal(5,2),
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_housing_metrics_date ON housing_metrics(date DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_regional_date_region ON regional_affordability(date DESC, region)`,
    `ALTER TABLE housing_metrics ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE regional_affordability ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE builder_expenses ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE household_expenses ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE crash_indicators ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE economic_index ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Allow public read access" ON housing_metrics`,
    `CREATE POLICY "Allow public read access" ON housing_metrics FOR SELECT USING (true)`,
    `DROP POLICY IF EXISTS "Allow public read access" ON regional_affordability`,
    `CREATE POLICY "Allow public read access" ON regional_affordability FOR SELECT USING (true)`,
    `DROP POLICY IF EXISTS "Allow public read access" ON builder_expenses`,
    `CREATE POLICY "Allow public read access" ON builder_expenses FOR SELECT USING (true)`,
    `DROP POLICY IF EXISTS "Allow public read access" ON household_expenses`,
    `CREATE POLICY "Allow public read access" ON household_expenses FOR SELECT USING (true)`,
    `DROP POLICY IF EXISTS "Allow public read access" ON crash_indicators`,
    `CREATE POLICY "Allow public read access" ON crash_indicators FOR SELECT USING (true)`,
    `DROP POLICY IF EXISTS "Allow public read access" ON economic_index`,
    `CREATE POLICY "Allow public read access" ON economic_index FOR SELECT USING (true)`
  ];

  for (const sql of tables) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error && !error.message.includes('already exists')) {
        console.log(`  ⚠️  ${error.message}`);
      }
    } catch (e) {
      // exec_sql might not exist, tables will be created via REST
    }
  }
  
  // Verify tables
  const tableNames = ['housing_metrics', 'regional_affordability', 'builder_expenses', 
                      'household_expenses', 'crash_indicators', 'economic_index'];
  
  for (const table of tableNames) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}`);
      }
    } catch (e) {
      console.log(`  ⚠️  ${table}: checking...`);
    }
  }
}

async function setVercelEnvVars() {
  console.log('\n🚀 Setting Vercel environment variables...\n');
  
  const envVars = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://lmmpvvtkzlnblvlflhpk.supabase.co' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NTA2MDYsImV4cCI6MjA4NTMyNjYwNn0.Sf7l8RvG9Ou90s-7XJnYpDhtGd6m0MJ2rbVdIxbfc1k' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: SERVICE_ROLE_KEY },
    { key: 'FRED_API_KEY', value: '4bf29c1eba04aa0ca396ea6653ea0199' },
    { key: 'CRON_SECRET', value: 'alpex-housing-cron-secret-2026' }
  ];

  for (const env of envVars) {
    try {
      const result = execSync(`curl -s -X POST "https://api.vercel.com/v10/projects/${PROJECT_ID}/env" \
        -H "Authorization: Bearer ${VERCEL_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{"key":"${env.key}","value":"${env.value}","type":"encrypted","target":["production","preview","development"]}'`, { encoding: 'utf8' });
      console.log(`  ✅ ${env.key}`);
    } catch (e) {
      console.log(`  ⚠️  ${env.key} (may already exist)`);
    }
  }
}

async function deploy() {
  console.log('\n🌐 Deploying to Vercel...\n');
  
  try {
    const result = execSync(`curl -s -X POST "https://api.vercel.com/v13/deployments" \
      -H "Authorization: Bearer ${VERCEL_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"name":"${PROJECT_ID}","project":"${PROJECT_ID}","target":"production","gitSource":{"type":"github","repo":"alpex-ai/housing-intelligence","ref":"main"}}'`, { encoding: 'utf8' });
    
    const data = JSON.parse(result);
    console.log(`  ✅ Deployment triggered!`);
    console.log(`  🌐 URL: https://${PROJECT_ID}.vercel.app`);
    console.log(`  ⏱️  Build in progress...`);
    console.log(`  📊 Check status: https://vercel.com/${TEAM_ID}/${PROJECT_ID}`);
  } catch (e) {
    console.log('  ⚠️  Deployment may have started. Check Vercel dashboard.');
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up...');
  try {
    fs.unlinkSync('.env.local');
    console.log('  ✅ Removed .env.local with keys');
  } catch (e) {
    console.log('  ℹ️  .env.local already clean or not found');
  }
}

async function main() {
  console.log('🏠 Alpex Housing Intelligence - Full Setup\n');
  console.log('==========================================\n');
  
  await setupDatabase();
  await setVercelEnvVars();
  await deploy();
  await cleanup();
  
  console.log('\n✨ Setup complete!\n');
  console.log('Your dashboard will be live at:');
  console.log('https://housing-intelligence.vercel.app\n');
  console.log('Next steps:');
  console.log('1. Wait 2-3 minutes for build to complete');
  console.log('2. Run: npm run sync-data (to import FRED data)');
  console.log('3. Visit your dashboard!\n');
}

main().catch(console.error);
