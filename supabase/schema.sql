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

-- Row Level Security (RLS) policies
alter table housing_metrics enable row level security;
alter table regional_affordability enable row level security;
alter table builder_expenses enable row level security;
alter table household_expenses enable row level security;
alter table crash_indicators enable row level security;
alter table economic_index enable row level security;

-- Allow read access to all (public dashboard)
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
