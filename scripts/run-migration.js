const SUPABASE_URL = 'https://lmmpvvtkzlnblvlflhpk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM';

const sql = `
-- Metro-level Zillow ZHVI data
create table if not exists metro_zhvi (
  id uuid default gen_random_uuid() primary key,
  region_id integer not null,
  size_rank integer,
  region_name text not null,
  region_type text not null,
  state_name text,
  date date not null,
  home_value decimal(12,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(region_id, date)
);

-- User profiles (extends auth.users)
create table if not exists user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  current_city text,
  current_city_region_id integer references metro_zhvi(region_id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User's saved homes/properties
create table if not exists user_homes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  nickname text,
  address text,
  city text not null,
  state text not null,
  zip_code text,
  region_id integer references metro_zhvi(region_id),
  purchase_price decimal(12,2),
  purchase_date date,
  current_mortgage_balance decimal(12,2),
  property_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appraisal history for homes
create table if not exists home_appraisals (
  id uuid default gen_random_uuid() primary key,
  home_id uuid references user_homes on delete cascade not null,
  appraisal_date date not null,
  appraised_value decimal(12,2) not null,
  appraisal_source text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved scenarios (comparisons)
create table if not exists user_scenarios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  home_id uuid references user_homes on delete set null,
  target_city text not null,
  target_region_id integer references metro_zhvi(region_id),
  scenario_type text not null,
  analysis_results jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_metro_zhvi_region_date on metro_zhvi(region_id, date desc);
create index if not exists idx_metro_zhvi_name on metro_zhvi(region_name);
create index if not exists idx_user_homes_user on user_homes(user_id);
create index if not exists idx_home_appraisals_home on home_appraisals(home_id, appraisal_date desc);
create index if not exists idx_user_scenarios_user on user_scenarios(user_id);

-- RLS Policies
alter table metro_zhvi enable row level security;
alter table user_profiles enable row level security;
alter table user_homes enable row level security;
alter table home_appraisals enable row level security;
alter table user_scenarios enable row level security;

create policy if not exists "Allow public read access" on metro_zhvi for select using (true);
create policy if not exists "Users can view own profile" on user_profiles for select using (auth.uid() = id);
create policy if not exists "Users can update own profile" on user_profiles for update using (auth.uid() = id);
create policy if not exists "Users can insert own profile" on user_profiles for insert with check (auth.uid() = id);
create policy if not exists "Users can view own homes" on user_homes for select using (auth.uid() = user_id);
create policy if not exists "Users can manage own homes" on user_homes for all using (auth.uid() = user_id);
create policy if not exists "Users can view home appraisals for own homes" on home_appraisals for select using (home_id in (select id from user_homes where user_id = auth.uid()));
create policy if not exists "Users can manage home appraisals for own homes" on home_appraisals for all using (home_id in (select id from user_homes where user_id = auth.uid()));
create policy if not exists "Users can view own scenarios" on user_scenarios for select using (auth.uid() = user_id);
create policy if not exists "Users can manage own scenarios" on user_scenarios for all using (auth.uid() = user_id);
`;

async function runMigration() {
  console.log('Running SQL migration...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (response.ok) {
    console.log('Migration completed successfully');
  } else {
    const error = await response.text();
    console.error('Migration failed:', error);
  }
}

runMigration();
