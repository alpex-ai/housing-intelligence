export type HousingMetric = {
  id: string;
  date: string;
  median_home_value: number | null;
  median_new_home_sale_price: number | null;
  mortgage_rate: number | null;
  fed_funds_rate: number | null;
  treasury_yield_10y: number | null;
  core_inflation: number | null;
  affordability_index: number | null;
  median_household_income: number | null;
  total_inventory: number | null;
  new_construction_inventory: number | null;
  building_permits: number | null;
};

export type RegionalAffordability = {
  id: string;
  date: string;
  region: string;
  median_home_price: number | null;
  median_qualifying_income: number | null;
  median_family_income: number | null;
  median_mortgage_payment: number | null;
  affordability_score: number | null;
};

export type BuilderExpense = {
  id: string;
  date: string;
  material_name: string;
  current_price: number | null;
  start_price: number | null;
  percent_change: number | null;
  total_change: number | null;
  status: string | null;
};

export type HouseholdExpense = {
  id: string;
  date: string;
  category: string;
  item_name: string;
  current_price: number | null;
  start_price: number | null;
  percent_change: number | null;
};

export type CrashIndicator = {
  id: string;
  date: string;
  variable_name: string;
  category: string;
  current_value: number | null;
  points: number | null;
  risk_tier: string | null;
};

export type EconomicIndex = {
  id: string;
  date: string;
  index_value: number | null;
  mom_change: number | null;
  mom_percent: number | null;
  yoy_change: number | null;
  yoy_percent: number | null;
};

// Metro data
export type MetroData = {
  id: string;
  region_id: number;
  size_rank: number | null;
  region_name: string;
  region_type: string;
  state_name: string | null;
  date: string;
  home_value: number | null;
};

// User types
export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  current_city: string | null;
  current_city_region_id: number | null;
  created_at: string;
  updated_at: string;
};

export type UserHome = {
  id: string;
  user_id: string;
  nickname: string | null;
  address: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  region_id: number | null;
  purchase_price: number | null;
  purchase_date: string | null;
  current_mortgage_balance: number | null;
  property_type: string | null;
  created_at: string;
  updated_at: string;
};

export type HomeAppraisal = {
  id: string;
  home_id: string;
  appraisal_date: string;
  appraised_value: number;
  appraisal_source: string | null;
  notes: string | null;
  created_at: string;
};

export type UserScenario = {
  id: string;
  user_id: string;
  name: string;
  home_id: string | null;
  target_city: string;
  target_region_id: number | null;
  scenario_type: string;
  analysis_results: any | null;
  created_at: string;
  updated_at: string;
};
