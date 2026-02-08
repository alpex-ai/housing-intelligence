import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const FRED_API_KEY = process.env.FRED_API_KEY;

// FRED Series IDs
const FRED_SERIES = {
  MEDIAN_HOME_PRICE: 'MSPUS',
  MEDIAN_NEW_HOME_PRICE: 'MSPNHSUS',
  MORTGAGE_RATE_30Y: 'MORTGAGE30US',
  FED_FUNDS_RATE: 'FEDFUNDS',
  TREASURY_10Y: 'GS10',
  CORE_INFLATION: 'CPILFESL',
  AFFORDABILITY_INDEX: 'FIXHAI',
  MEDIAN_HOUSEHOLD_INCOME: 'MEHOINUSA672N',
  TOTAL_INVENTORY: 'ACTLISCOU',
  NEW_CONSTRUCTION_INVENTORY: 'NINV',
  BUILDING_PERMITS: 'PERMIT',
};

async function fetchFredSeries(seriesId: string, limit: number = 1) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=${limit}&sort_order=desc`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FRED API error for ${seriesId}: ${response.status}`);
  }
  
  const data = await response.json();
  return data.observations?.[0];
}

export async function syncData() {
  if (!FRED_API_KEY) {
    throw new Error('FRED_API_KEY not configured');
  }

  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Fetch all required series
    const [
      medianHomePrice,
      medianNewHomePrice,
      mortgageRate,
      fedFundsRate,
      treasury10Y,
      coreInflation,
      affordabilityIndex,
      medianHouseholdIncome,
      totalInventory,
      newConstructionInventory,
      buildingPermits,
    ] = await Promise.all([
      fetchFredSeries(FRED_SERIES.MEDIAN_HOME_PRICE),
      fetchFredSeries(FRED_SERIES.MEDIAN_NEW_HOME_PRICE),
      fetchFredSeries(FRED_SERIES.MORTGAGE_RATE_30Y),
      fetchFredSeries(FRED_SERIES.FED_FUNDS_RATE),
      fetchFredSeries(FRED_SERIES.TREASURY_10Y),
      fetchFredSeries(FRED_SERIES.CORE_INFLATION),
      fetchFredSeries(FRED_SERIES.AFFORDABILITY_INDEX),
      fetchFredSeries(FRED_SERIES.MEDIAN_HOUSEHOLD_INCOME),
      fetchFredSeries(FRED_SERIES.TOTAL_INVENTORY),
      fetchFredSeries(FRED_SERIES.NEW_CONSTRUCTION_INVENTORY),
      fetchFredSeries(FRED_SERIES.BUILDING_PERMITS),
    ]);

    // Insert into database
    const data = {
      date: today,
      median_home_value: parseFloat(medianHomePrice?.value || '0'),
      median_new_home_sale_price: parseFloat(medianNewHomePrice?.value || '0'),
      mortgage_rate: parseFloat(mortgageRate?.value || '0'),
      fed_funds_rate: parseFloat(fedFundsRate?.value || '0'),
      treasury_yield_10y: parseFloat(treasury10Y?.value || '0'),
      core_inflation: parseFloat(coreInflation?.value || '0'),
      affordability_index: parseFloat(affordabilityIndex?.value || '0'),
      median_household_income: parseFloat(medianHouseholdIncome?.value || '0'),
      total_inventory: parseFloat(totalInventory?.value || '0'),
      new_construction_inventory: parseFloat(newConstructionInventory?.value || '0'),
      building_permits: parseFloat(buildingPermits?.value || '0'),
    };

    const { error } = await supabase
      .from('housing_metrics')
      .upsert(data as any, { onConflict: 'date' });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Data sync completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}
