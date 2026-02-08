// Daily FRED Data Sync Script
// Run this daily to pull fresh data from FRED API into Supabase
// Can be run via: node --loader ts-node/esm scripts/sync-fred-data.ts
// Or scheduled via cron: 0 9 * * * cd /path/to/project && npm run sync-data

import { createClient } from '@supabase/supabase-js';
import { fetchAllHousingMetrics, fetchRegionalData, calculateAffordabilityMetrics } from '../src/lib/fred-api.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
