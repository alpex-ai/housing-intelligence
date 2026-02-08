import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';

// This script imports data from the Google Sheets into Supabase
// Run with: npx ts-node scripts/import-data.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Sample data from the FRED_HISTORY tab (you would import from the actual sheet)
const housingMetricsData = [
  {
    date: '2025-01-31',
    median_home_value: 393400,
    median_new_home_sale_price: 429600,
    mortgage_rate: 6.95,
    fed_funds_rate: 4.33,
    treasury_yield_10y: 4.58,
    core_inflation: 3.63,
    affordability_index: 101.6,
    median_household_income: 80610,
    total_inventory: 829376,
    new_construction_inventory: 496000,
    building_permits: 1460000,
  },
  {
    date: '2025-02-28',
    median_home_value: 396800,
    median_new_home_sale_price: 415100,
    mortgage_rate: 6.76,
    fed_funds_rate: 4.33,
    treasury_yield_10y: 4.24,
    core_inflation: 3.52,
    affordability_index: 102.5,
    median_household_income: 80610,
    total_inventory: 847825,
    new_construction_inventory: 499000,
    building_permits: 1454000,
  },
  // ... more data
];

async function importData() {
  console.log('Importing housing metrics...');
  
  for (const metric of housingMetricsData) {
    const { error } = await supabase
      .from('housing_metrics')
      .upsert(metric, { onConflict: 'date' });
    
    if (error) {
      console.error('Error importing metric:', error);
    } else {
      console.log(`Imported data for ${metric.date}`);
    }
  }
  
  console.log('Import complete!');
}

importData().catch(console.error);
