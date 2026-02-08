export type HousingMetric = {
  id: string;
  date: string;
  median_home_value: number;
  median_new_home_sale_price: number;
  mortgage_rate: number;
  fed_funds_rate: number;
  treasury_yield_10y: number;
  core_inflation: number;
  affordability_index: number;
  median_household_income: number;
  total_inventory: number;
  new_construction_inventory: number;
  building_permits: number;
};

export type RegionalAffordability = {
  id: string;
  date: string;
  region: string;
  median_home_price: number;
  median_qualifying_income: number;
  median_family_income: number;
  median_mortgage_payment: number;
  affordability_score: number;
};

export type BuilderExpense = {
  id: string;
  date: string;
  material_name: string;
  current_price: number;
  start_price: number;
  percent_change: number;
  total_change: number;
  status: string | null;
};

export type HouseholdExpense = {
  id: string;
  date: string;
  category: string;
  item_name: string;
  current_price: number;
  start_price: number;
  percent_change: number;
};

export type CrashIndicator = {
  id: string;
  date: string;
  variable_name: string;
  category: string;
  current_value: number;
  points: number;
  risk_tier: string | null;
};

export type EconomicIndex = {
  id: string;
  date: string;
  index_value: number;
  mom_change: number;
  mom_percent: number;
  yoy_change: number;
  yoy_percent: number;
};
