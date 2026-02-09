const SUPABASE_URL = 'https://lmmpvvtkzlnblvlflhpk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM';

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runMigration() {
  console.log('Running SQL migration...');
  
  const sql = `
-- Metro-level Zillow ZHVI data
CREATE TABLE IF NOT EXISTS metro_zhvi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id INTEGER NOT NULL,
  size_rank INTEGER,
  region_name TEXT NOT NULL,
  region_type TEXT NOT NULL,
  state_name TEXT,
  date DATE NOT NULL,
  home_value DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(region_id, date)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  current_city TEXT,
  current_city_region_id INTEGER REFERENCES metro_zhvi(region_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_homes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  nickname TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  region_id INTEGER REFERENCES metro_zhvi(region_id),
  purchase_price DECIMAL(12,2),
  purchase_date DATE,
  current_mortgage_balance DECIMAL(12,2),
  property_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS home_appraisals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  home_id UUID REFERENCES user_homes ON DELETE CASCADE NOT NULL,
  appraisal_date DATE NOT NULL,
  appraised_value DECIMAL(12,2) NOT NULL,
  appraisal_source TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  home_id UUID REFERENCES user_homes ON DELETE SET NULL,
  target_city TEXT NOT NULL,
  target_region_id INTEGER REFERENCES metro_zhvi(region_id),
  scenario_type TEXT NOT NULL,
  analysis_results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metro_zhvi_region_date ON metro_zhvi(region_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_metro_zhvi_name ON metro_zhvi(region_name);
CREATE INDEX IF NOT EXISTS idx_user_homes_user ON user_homes(user_id);
CREATE INDEX IF NOT EXISTS idx_home_appraisals_home ON home_appraisals(home_id, appraisal_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_scenarios_user ON user_scenarios(user_id);

-- RLS Policies
ALTER TABLE metro_zhvi ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scenarios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow public read access" ON metro_zhvi;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own homes" ON user_homes;
DROP POLICY IF EXISTS "Users can manage own homes" ON user_homes;
DROP POLICY IF EXISTS "Users can view home appraisals for own homes" ON home_appraisals;
DROP POLICY IF EXISTS "Users can manage home appraisals for own homes" ON home_appraisals;
DROP POLICY IF EXISTS "Users can view own scenarios" ON user_scenarios;
DROP POLICY IF EXISTS "Users can manage own scenarios" ON user_scenarios;

CREATE POLICY "Allow public read access" ON metro_zhvi FOR SELECT USING (true);
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view own homes" ON user_homes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own homes" ON user_homes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view home appraisals for own homes" ON home_appraisals FOR SELECT USING (home_id IN (SELECT id FROM user_homes WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage home appraisals for own homes" ON home_appraisals FOR ALL USING (home_id IN (SELECT id FROM user_homes WHERE user_id = auth.uid()));
CREATE POLICY "Users can view own scenarios" ON user_scenarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scenarios" ON user_scenarios FOR ALL USING (auth.uid() = user_id);
`;
  
  const { error } = await supabase.rpc('exec_sql', { sql });
  
  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } else {
    console.log('Migration completed successfully');
  }
}

runMigration();
