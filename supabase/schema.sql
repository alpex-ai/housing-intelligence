-- Supabase Schema for Alpex Housing Dashboard

-- Main housing metrics table (from FRED_HISTORY)
create table housing_metrics (
  id uuid default gen_random_uuid() primary key,
  date date not null,
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date)
);

-- Regional affordability data
create table regional_affordability (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  region text not null, -- 'Northeast', 'Midwest', 'South', 'West'
  median_home_price decimal(12,2),
  median_qualifying_income decimal(10,2),
  median_family_income decimal(10,2),
  median_mortgage_payment decimal(8,2),
  affordability_score decimal(6,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date, region)
);

-- Builder expenses tracking
create table builder_expenses (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  material_name text not null,
  current_price decimal(8,2),
  start_price decimal(8,2),
  percent_change decimal(5,2),
  total_change decimal(8,2),
  status text, -- 'Drop', 'Rise', 'MAJOR Rise', 'MAJOR Drop', 'Stable'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date, material_name)
);

-- Household expenses tracking
create table household_expenses (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  category text not null,
  item_name text not null,
  current_price decimal(8,2),
  start_price decimal(8,2),
  percent_change decimal(5,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date, item_name)
);

-- Housing crash indicators
create table crash_indicators (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  variable_name text not null,
  category text not null, -- 'Critical', 'Major', 'Minor'
  current_value decimal(8,2),
  points decimal(4,2),
  risk_tier text, -- 'Low Risk', 'Moderate Risk', 'Elevated Risk'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date, variable_name)
);

-- Economic index (weighted cost comparison)
create table economic_index (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  index_value decimal(8,2),
  mom_change decimal(6,2),
  mom_percent decimal(5,2),
  yoy_change decimal(6,2),
  yoy_percent decimal(5,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date)
);

-- Indexes for performance
create index idx_housing_metrics_date on housing_metrics(date desc);
create index idx_regional_date_region on regional_affordability(date desc, region);
create index idx_builder_date on builder_expenses(date desc);
create index idx_household_date on household_expenses(date desc);
create index idx_crash_date on crash_indicators(date desc);
create index idx_economic_date on economic_index(date desc);

-- Metro-level Zillow ZHVI data
-- Note: Supabase auth.users table is created automatically

-- Metro ZHVI data (downloaded from Zillow Research)
create table metro_zhvi (
  id uuid default gen_random_uuid() primary key,
  region_id integer not null,
  size_rank integer,
  region_name text not null, -- e.g., "Austin, TX"
  region_type text not null, -- 'msa', 'city', 'state', 'country'
  state_name text,
  date date not null,
  home_value decimal(12,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(region_id, date)
);

-- User profiles (extends auth.users)
create table user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  current_city text,
  current_city_region_id integer references metro_zhvi(region_id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User's saved homes/properties
-- Note: Each home can have multiple appraisal history entries
-- To get current home value, order by appraisal_date desc and take first
create table user_homes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  nickname text, -- e.g., "Primary Residence", "Rental Property"
  address text,
  city text not null,
  state text not null,
  zip_code text,
  region_id integer references metro_zhvi(region_id),
  purchase_price decimal(12,2),
  purchase_date date,
  current_mortgage_balance decimal(12,2),
  property_type text, -- 'single_family', 'condo', 'townhouse'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appraisal history for homes
-- Current value = most recent appraisal for the home
create table home_appraisals (
  id uuid default gen_random_uuid() primary key,
  home_id uuid references user_homes on delete cascade not null,
  appraisal_date date not null,
  appraised_value decimal(12,2) not null,
  appraisal_source text, -- 'zillow', 'professional', 'user_estimate'
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved scenarios (comparisons)
create table user_scenarios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null, -- e.g., "Move to Denver"
  home_id uuid references user_homes on delete set null,
  target_city text not null,
  target_region_id integer references metro_zhvi(region_id),
  scenario_type text not null, -- 'sell_and_buy', 'rent_current_buy_new', 'keep_and_buy'
  analysis_results jsonb, -- store computed results
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_metro_zhvi_region_date on metro_zhvi(region_id, date desc);
create index idx_metro_zhvi_name on metro_zhvi(region_name);
create index idx_user_homes_user on user_homes(user_id);
create index idx_home_appraisals_home on home_appraisals(home_id, appraisal_date desc);
create index idx_user_scenarios_user on user_scenarios(user_id);

-- Row Level Security (RLS) policies
alter table housing_metrics enable row level security;
alter table regional_affordability enable row level security;
alter table builder_expenses enable row level security;
alter table household_expenses enable row level security;
alter table crash_indicators enable row level security;
alter table economic_index enable row level security;
alter table metro_zhvi enable row level security;
alter table user_profiles enable row level security;
alter table user_homes enable row level security;
alter table home_appraisals enable row level security;
alter table user_scenarios enable row level security;

-- Public tables (read access for all)
create policy "Allow public read access" on housing_metrics
  for select using (true);
create policy "Allow public read access" on regional_affordability
  for select using (true);
create policy "Allow public read access" on builder_expenses
  for select using (true);
create policy "Allow public read access" on household_expenses
  for select using (true);
create policy "Allow public read access" on crash_indicators
  for select using (true);
create policy "Allow public read access" on economic_index
  for select using (true);
create policy "Allow public read access" on metro_zhvi
  for select using (true);

-- User-specific tables (users can only access their own data)
create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on user_profiles
  for insert with check (auth.uid() = id);

create policy "Users can view own homes" on user_homes
  for select using (auth.uid() = user_id);
create policy "Users can manage own homes" on user_homes
  for all using (auth.uid() = user_id);

create policy "Users can view home appraisals for own homes" on home_appraisals
  for select using (
    home_id in (select id from user_homes where user_id = auth.uid())
  );
create policy "Users can manage home appraisals for own homes" on home_appraisals
  for all using (
    home_id in (select id from user_homes where user_id = auth.uid())
  );

create policy "Users can view own scenarios" on user_scenarios
  for select using (auth.uid() = user_id);
create policy "Users can manage own scenarios" on user_scenarios
  for all using (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger update_user_homes_updated_at
  before update on user_homes
  for each row execute function update_updated_at_column();

create trigger update_user_scenarios_updated_at
  before update on user_scenarios
  for each row execute function update_updated_at_column();
