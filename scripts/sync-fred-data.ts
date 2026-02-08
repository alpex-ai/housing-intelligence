// Daily FRED Data Sync Script
// Run this daily to pull fresh data from FRED API into Supabase
// Can be run via: node --loader ts-node/esm scripts/sync-fred-data.ts
// Or scheduled via cron: 0 9 * * * cd /path/to/project && npm run sync-data

import { createClient } from '@supabase/supabase-js';

// FRED API Configuration
const FRED_API_KEY = process.env.FRED_API_KEY || '4bf29c1eba04aa0ca396ea6653ea0199';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

const FRED_SERIES = {
  MEDIAN_HOME_PRICE: 'MSPUS',
  NEW_HOME_PRICE: 'MSPNHSUS',
  MORTGAGE_RATE_30Y: 'MORTGAGE30US',
  FED_FUNDS_RATE: 'FEDFUNDS',
  TREASURY_10Y: 'GS10',
  CORE_INFLATION: 'CORESTICKM159SFRBATL',
  HOUSING_INVENTORY: 'ACTLISCOU',
  NEW_CONSTRUCTION_INVENTORY: 'NINVUSM156N',
  BUILDING_PERMITS: 'PERMIT',
  HOUSING_AFFORDABILITY: 'HAI',
  MEDIAN_HOUSEHOLD_INCOME: 'MEHOINUSA672N',
  MEDIAN_HOME_PRICE_NE: 'MEDLISPRIENT',
  MEDIAN_HOME_PRICE_MW: 'MEDLISPRIMWST',
  MEDIAN_HOME_PRICE_SO: 'MEDLISPRISOU',
  MEDIAN_HOME_PRICE_WE: 'MEDLISPRIWST',
} as const;

interface FREDDataPoint {
  date: string;
  value: number;
}

async function fetchFRED(seriesId: string, startDate?: string, endDate?: string): Promise<FREDDataPoint[]> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: FRED_API_KEY,
    file_type: 'json',
    sort_order: 'asc',
  });
  
  if (startDate) params.append('observation_start', startDate);
  if (endDate) params.append('observation_end', endDate);
  
  const url = `${FRED_BASE_URL}/series/observations?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`FRED API error: ${response.status}`);
    
    const data = await response.json();
    
    return data.observations
      .filter((obs: any) => obs.value !== '.' && !isNaN(parseFloat(obs.value)))
      .map((obs: any) => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }));
  } catch (error) {
    console.error(`Error fetching ${seriesId}:`, error);
    return [];
  }
}

// Fetch all key housing metrics
async function fetchAllHousingMetrics(startDate?: string, endDate?: string) {
  const [
    homePrices,
    newHomePrices,
    mortgageRates,
    fedFunds,
    treasury10y,
    coreInflation,
    inventory,
    newConstructionInv,
    permits,
    affordability,
    income,
  ] = await Promise.all([
    fetchFRED(FRED_SERIES.MEDIAN_HOME_PRICE, startDate, endDate),
    fetchFRED(FRED_SERIES.NEW_HOME_PRICE, startDate, endDate),
    fetchFRED(FRED_SERIES.MORTGAGE_RATE_30Y, startDate, endDate),
    fetchFRED(FRED_SERIES.FED_FUNDS_RATE, startDate, endDate),
    fetchFRED(FRED_SERIES.TREASURY_10Y, startDate, endDate),
    fetchFRED(FRED_SERIES.CORE_INFLATION, startDate, endDate),
    fetchFRED(FRED_SERIES.HOUSING_INVENTORY, startDate, endDate),
    fetchFRED(FRED_SERIES.NEW_CONSTRUCTION_INVENTORY, startDate, endDate),
    fetchFRED(FRED_SERIES.BUILDING_PERMITS, startDate, endDate),
    fetchFRED(FRED_SERIES.HOUSING_AFFORDABILITY, startDate, endDate),
    fetchFRED(FRED_SERIES.MEDIAN_HOUSEHOLD_INCOME, startDate, endDate),
  ]);
  
  // Merge by date
  const allDates = new Set<string>();
  
  [homePrices, newHomePrices, mortgageRates, fedFunds, treasury10y, coreInflation, 
   inventory, newConstructionInv, permits, affordability, income].forEach(series => {
    series.forEach(point => allDates.add(point.date));
  });
  
  const sortedDates = Array.from(allDates).sort();
  
  return sortedDates.map(date => {
    const getValue = (series: FREDDataPoint[], defaultValue: number = 0) => {
      const point = series.find(p => p.date === date);
      return point ? point.value : defaultValue;
    };
    
    return {
      date,
      median_home_value: getValue(homePrices),
      median_new_home_sale_price: getValue(newHomePrices),
      mortgage_rate: getValue(mortgageRates),
      fed_funds_rate: getValue(fedFunds),
      treasury_yield_10y: getValue(treasury10y),
      core_inflation: getValue(coreInflation),
      total_inventory: getValue(inventory),
      new_construction_inventory: getValue(newConstructionInv),
      building_permits: getValue(permits),
      affordability_index: getValue(affordability, 100),
      median_household_income: getValue(income, 80610),
    };
  });
}

// Fetch regional home prices
async function fetchRegionalData(startDate?: string, endDate?: string) {
  const [ne, mw, so, we] = await Promise.all([
    fetchFRED(FRED_SERIES.MEDIAN_HOME_PRICE_NE, startDate, endDate),
    fetchFRED(FRED_SERIES.MEDIAN_HOME_PRICE_MW, startDate, endDate),
    fetchFRED(FRED_SERIES.MEDIAN_HOME_PRICE_SO, startDate, endDate),
    fetchFRED(FRED_SERIES.MEDIAN_HOME_PRICE_WE, startDate, endDate),
  ]);
  
  return {
    northeast: ne,
    midwest: mw,
    south: so,
    west: we,
  };
}

// Calculate affordability metrics
function calculateAffordabilityMetrics(
  homePrice: number,
  mortgageRate: number,
  householdIncome: number,
  downPaymentPercent: number = 10
) {
  const loanAmount = homePrice * (1 - downPaymentPercent / 100);
  const monthlyRate = mortgageRate / 100 / 12;
  const numPayments = 30 * 12;
  
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
  const monthlyTI = 400;
  const monthlyPayment = monthlyPI + monthlyTI;
  
  const qualifyingIncome = (monthlyPayment / 0.28) * 12;
  const affordabilityScore = (householdIncome / qualifyingIncome) * 100;
  
  return {
    monthlyPayment,
    qualifyingIncome,
    affordabilityScore,
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmmpvvtkzlnblvlflhpk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncData() {
  console.log('🔄 Starting FRED data sync...');
  console.log(`⏰ ${new Date().toISOString()}`);
  
  try {
    // Fetch last 2 years of data (or adjust as needed)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const startDate = twoYearsAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    console.log(`📊 Fetching data from ${startDate} to ${endDate}...`);
    
    // Fetch all housing metrics
    const metrics = await fetchAllHousingMetrics(startDate, endDate);
    console.log(`📈 Received ${metrics.length} data points`);
    
    // Insert/Update housing metrics
    for (const metric of metrics) {
      const { error } = await supabase
        .from('housing_metrics')
        .upsert({
          date: metric.date,
          median_home_value: metric.median_home_value,
          median_new_home_sale_price: metric.median_new_home_sale_price,
          mortgage_rate: metric.mortgage_rate,
          fed_funds_rate: metric.fed_funds_rate,
          treasury_yield_10y: metric.treasury_yield_10y,
          core_inflation: metric.core_inflation,
          affordability_index: metric.affordability_index,
          median_household_income: metric.median_household_income,
          total_inventory: metric.total_inventory,
          new_construction_inventory: metric.new_construction_inventory,
          building_permits: metric.building_permits,
        }, { onConflict: 'date' });
      
      if (error) {
        console.error(`❌ Error upserting ${metric.date}:`, error);
      } else {
        console.log(`✅ Updated ${metric.date}`);
      }
    }
    
    // Fetch regional data
    console.log('🗺️ Fetching regional data...');
    const regionalData = await fetchRegionalData(startDate, endDate);
    
    // Get latest household income for calculations
    const { data: latestMetrics } = await supabase
      .from('housing_metrics')
      .select('median_household_income')
      .order('date', { ascending: false })
      .limit(1);
    
    const householdIncome = latestMetrics?.[0]?.median_household_income || 80610;
    
    // Process each region
    for (const [region, data] of Object.entries(regionalData)) {
      for (const point of data) {
        const { monthlyPayment, qualifyingIncome, affordabilityScore } = calculateAffordabilityMetrics(
          point.value,
          6.11, // Current mortgage rate (should fetch actual)
          householdIncome
        );
        
        const { error } = await supabase
          .from('regional_affordability')
          .upsert({
            date: point.date,
            region: region.charAt(0).toUpperCase() + region.slice(1),
            median_home_price: point.value,
            median_qualifying_income: qualifyingIncome,
            median_family_income: householdIncome,
            median_mortgage_payment: monthlyPayment,
            affordability_score: affordabilityScore,
          }, { onConflict: 'date,region' });
        
        if (error) {
          console.error(`❌ Error upserting ${region} ${point.date}:`, error);
        }
      }
    }
    
    console.log('✅ Data sync complete!');
    
    // Update economic index
    await updateEconomicIndex();
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

async function updateEconomicIndex() {
  console.log('📊 Updating economic index...');
  
  // Get latest household expenses data (would come from BLS API in production)
  const { data: expenses } = await supabase
    .from('household_expenses')
    .select('*')
    .order('date', { ascending: false })
    .limit(100);
  
  if (!expenses || expenses.length === 0) {
    console.log('⚠️ No household expenses data to calculate index');
    return;
  }
  
  // Use Q1 2019 as baseline (100)
  const baselineDate = '2019-03-31';
  
  // Group by date and calculate weighted index
  const expensesByDate = expenses.reduce((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {} as Record<string, typeof expenses>);
  
  // Calculate index for each date
  for (const [date, items] of Object.entries(expensesByDate)) {
    // Skip if already exists
    const { data: existing } = await supabase
      .from('economic_index')
      .select('id')
      .eq('date', date)
      .single();
    
    if (existing) continue;
    
    // Calculate weighted average
    const totalWeight = items.reduce((sum, item) => {
      const weight = item.category === 'Essential' ? 1.5 : 1.0;
      return sum + weight;
    }, 0);
    
    const weightedSum = items.reduce((sum, item) => {
      const weight = item.category === 'Essential' ? 1.5 : 1.0;
      return sum + (item.current_price / item.start_price) * weight;
    }, 0);
    
    const indexValue = (weightedSum / totalWeight) * 100;
    
    // Calculate MoM and YoY changes
    const prevMonth = new Date(date);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toISOString().split('T')[0];
    
    const { data: prevIndex } = await supabase
      .from('economic_index')
      .select('index_value')
      .eq('date', prevMonthStr)
      .single();
    
    const momChange = prevIndex ? indexValue - prevIndex.index_value : 0;
    const momPercent = prevIndex ? (momChange / prevIndex.index_value) * 100 : 0;
    
    await supabase
      .from('economic_index')
      .upsert({
        date,
        index_value: indexValue,
        mom_change: momChange,
        mom_percent: momPercent,
        yoy_change: 0, // Calculate separately
        yoy_percent: 0,
      }, { onConflict: 'date' });
  }
  
  console.log('✅ Economic index updated');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncData().catch(console.error);
}

export { syncData };
