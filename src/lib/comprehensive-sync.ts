import { createClient } from '@supabase/supabase-js';
import { DATA_SOURCES, BUILDER_MATERIALS } from './data-sources';
import { analyzeBuilderCostTrend } from './calculations';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const FRED_API_KEY = process.env.FRED_API_KEY;

// Fetch data from FRED API
async function fetchFredSeries(seriesId: string, limit: number = 12): Promise<any[]> {
  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=${limit}&sort_order=desc`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`FRED API warning for ${seriesId}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data.observations || [];
  } catch (error) {
    console.warn(`Failed to fetch ${seriesId}:`, error);
    return [];
  }
}

// Sync builder expenses from FRED (PPI data)
export async function syncBuilderExpenses() {
  if (!FRED_API_KEY) {
    throw new Error('FRED_API_KEY not configured');
  }

  console.log('Syncing builder expenses...');
  const today = new Date().toISOString().split('T')[0];
  const startOfPeriod = '2020-01-01'; // Use Jan 2020 as baseline

  for (const material of BUILDER_MATERIALS) {
    try {
      const observations = await fetchFredSeries(material.series, 24);
      
      if (observations.length === 0) {
        console.warn(`No data for ${material.name}`);
        continue;
      }

      // Get latest and baseline (closest to Jan 2020)
      const latest = observations[0];
      const baseline = observations.find(obs => obs.date >= startOfPeriod) || observations[observations.length - 1];
      
      if (!latest || !baseline) continue;

      const currentPrice = parseFloat(latest.value);
      const startPrice = parseFloat(baseline.value);
      const trend = analyzeBuilderCostTrend(currentPrice, startPrice, 
        Math.max(1, observations.length));

      const data = {
        date: today,
        material_name: material.name,
        current_price: currentPrice,
        start_price: startPrice,
        percent_change: trend.percentChange,
        total_change: currentPrice - startPrice,
        status: trend.status,
      };

      const { error } = await supabase
        .from('builder_expenses')
        .upsert(data as any, { onConflict: 'date,material_name' });

      if (error) {
        console.error(`Error saving ${material.name}:`, error);
      } else {
        console.log(`Synced ${material.name}: ${trend.status}`);
      }
    } catch (error) {
      console.error(`Error processing ${material.name}:`, error);
    }
  }

  console.log('Builder expenses sync complete');
}

// Sync household expenses from FRED (CPI data)
export async function syncHouseholdExpenses() {
  if (!FRED_API_KEY) {
    throw new Error('FRED_API_KEY not configured');
  }

  console.log('Syncing household expenses...');
  const today = new Date().toISOString().split('T')[0];
  
  const categories = [
    { category: 'Housing', items: [
      { name: 'Rent', series: 'CUUR0000SEHA' },
      { name: 'Owners Equivalent Rent', series: 'CUUR0000SEHC' },
    ]},
    { category: 'Utilities', items: [
      { name: 'Electricity', series: 'APU000072610' },
      { name: 'Natural Gas', series: 'APU000072610' },
    ]},
    { category: 'Food', items: [
      { name: 'Food at Home', series: 'CUUR0000SAF11' },
      { name: 'Food Away', series: 'CUUR0000SEFV' },
    ]},
    { category: 'Transportation', items: [
      { name: 'Gasoline', series: 'CUUR0000SETB01' },
      { name: 'New Vehicles', series: 'CUUR0000SETA01' },
    ]},
    { category: 'Healthcare', items: [
      { name: 'Medical Care', series: 'CUUR0000SAM' },
      { name: 'Health Insurance', series: 'CUUR0000SEMC01' },
    ]},
    { category: 'Other', items: [
      { name: 'Apparel', series: 'CUUR0000SAA' },
      { name: 'Entertainment', series: 'CUUR0000SAR' },
    ]},
  ];

  for (const cat of categories) {
    for (const item of cat.items) {
      try {
        const observations = await fetchFredSeries(item.series, 24);
        
        if (observations.length < 2) {
          console.warn(`Insufficient data for ${item.name}`);
          continue;
        }

        const latest = observations[0];
        const yearAgo = observations.find(obs => {
          const obsDate = new Date(obs.date);
          const yearAgo = new Date();
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return obsDate <= yearAgo;
        }) || observations[observations.length - 1];

        const currentPrice = parseFloat(latest.value);
        const startPrice = parseFloat(yearAgo.value);
        const percentChange = ((currentPrice - startPrice) / startPrice) * 100;

        const data = {
          date: today,
          category: cat.category,
          item_name: item.name,
          current_price: currentPrice,
          start_price: startPrice,
          percent_change: Math.round(percentChange * 10) / 10,
        };

        const { error } = await supabase
          .from('household_expenses')
          .upsert(data as any, { onConflict: 'date,item_name' });

        if (error) {
          console.error(`Error saving ${item.name}:`, error);
        } else {
          console.log(`Synced ${item.name}: ${percentChange.toFixed(1)}%`);
        }
      } catch (error) {
        console.error(`Error processing ${item.name}:`, error);
      }
    }
  }

  console.log('Household expenses sync complete');
}

// Sync crash indicators
export async function syncCrashIndicators(metrics: {
  mortgage_rate: number;
  affordability_index: number;
  total_inventory: number;
  building_permits: number;
  median_home_value: number;
  median_household_income: number;
}) {
  if (!FRED_API_KEY) {
    throw new Error('FRED_API_KEY not configured');
  }

  console.log('Syncing crash indicators...');
  const today = new Date().toISOString().split('T')[0];

  const indicators = [
    {
      variable: 'Mortgage Rate Level',
      category: 'Critical',
      current_value: metrics.mortgage_rate,
      points: metrics.mortgage_rate > 7 ? 15 : metrics.mortgage_rate > 6 ? 10 : 5,
      risk_tier: metrics.mortgage_rate > 7 ? 'High Risk' : metrics.mortgage_rate > 5 ? 'Moderate Risk' : 'Low Risk',
    },
    {
      variable: 'Price-to-Income Ratio',
      category: 'Critical',
      current_value: metrics.median_household_income > 0 
        ? metrics.median_home_value / metrics.median_household_income 
        : 0,
      points: metrics.median_home_value / metrics.median_household_income > 5 ? 12 : 6,
      risk_tier: metrics.median_home_value / metrics.median_household_income > 5 ? 'Elevated Risk' : 'Low Risk',
    },
    {
      variable: 'Affordability Index',
      category: 'Major',
      current_value: metrics.affordability_index,
      points: metrics.affordability_index < 100 ? 8 : 3,
      risk_tier: metrics.affordability_index < 100 ? 'Elevated Risk' : 'Low Risk',
    },
    {
      variable: 'Building Permits Trend',
      category: 'Minor',
      current_value: metrics.building_permits,
      points: metrics.building_permits < 1000 ? 5 : 2,
      risk_tier: metrics.building_permits < 1000 ? 'Moderate Risk' : 'Low Risk',
    },
  ];

  for (const indicator of indicators) {
    try {
      const data = {
        date: today,
        variable_name: indicator.variable,
        category: indicator.category,
        current_value: Math.round(indicator.current_value * 100) / 100,
        points: indicator.points,
        risk_tier: indicator.risk_tier,
      };

      const { error } = await supabase
        .from('crash_indicators')
        .upsert(data as any, { onConflict: 'date,variable_name' });

      if (error) {
        console.error(`Error saving ${indicator.variable}:`, error);
      } else {
        console.log(`Synced ${indicator.variable}: ${indicator.risk_tier}`);
      }
    } catch (error) {
      console.error(`Error processing ${indicator.variable}:`, error);
    }
  }

  console.log('Crash indicators sync complete');
}

// Sync regional affordability data
export async function syncRegionalAffordability(metrics: {
  mortgage_rate: number;
}) {
  if (!FRED_API_KEY) {
    throw new Error('FRED_API_KEY not configured');
  }

  console.log('Syncing regional affordability...');
  const today = new Date().toISOString().split('T')[0];

  // Regional data from FRED
  const regions = [
    { name: 'Northeast', series: 'MEDDAYONAA' },
    { name: 'Midwest', series: 'MEDDAYONAM' },
    { name: 'South', series: 'MEDDAYONAS' },
    { name: 'West', series: 'MEDDAYONAW' },
  ];

  for (const region of regions) {
    try {
      const observations = await fetchFredSeries(region.series, 2);
      
      if (observations.length === 0) {
        console.warn(`No data for ${region.name}`);
        continue;
      }

      const latest = observations[0];
      const medianPrice = parseFloat(latest.value);
      
      // Estimate regional income (national * regional adjustment)
      const regionalIncomeAdjustments: Record<string, number> = {
        'Northeast': 1.15,
        'Midwest': 0.90,
        'South': 0.85,
        'West': 1.10,
      };
      
      const nationalIncome = 83730; // From FRED
      const medianIncome = nationalIncome * (regionalIncomeAdjustments[region.name] || 1);

      // Calculate mortgage payment (30-year, 20% down)
      const loanAmount = medianPrice * 0.8;
      const monthlyRate = metrics.mortgage_rate / 100 / 12;
      const numPayments = 30 * 12;
      const monthlyPayment = monthlyRate > 0
        ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
          (Math.pow(1 + monthlyRate, numPayments) - 1)
        : loanAmount / numPayments;

      const qualifyingIncome = (monthlyPayment / 0.28) * 12;
      const affordabilityScore = Math.round((medianIncome / qualifyingIncome) * 100);

      const data = {
        date: today,
        region: region.name,
        median_home_price: medianPrice,
        median_qualifying_income: Math.round(qualifyingIncome),
        median_family_income: Math.round(medianIncome),
        median_mortgage_payment: Math.round(monthlyPayment),
        affordability_score: affordabilityScore,
      };

      const { error } = await supabase
        .from('regional_affordability')
        .upsert(data as any, { onConflict: 'date,region' });

      if (error) {
        console.error(`Error saving ${region.name}:`, error);
      } else {
        console.log(`Synced ${region.name}: ${affordabilityScore}`);
      }
    } catch (error) {
      console.error(`Error processing ${region.name}:`, error);
    }
  }

  console.log('Regional affordability sync complete');
}

// Calculate and store economic index
export async function syncEconomicIndex(metrics: {
  median_home_value: number;
  mortgage_rate: number;
  core_inflation: number;
  affordability_index: number;
}) {
  console.log('Calculating economic index...');
  const today = new Date().toISOString().split('T')[0];

  // Get previous month for MoM calculation
  const { data: previousData } = await supabase
    .from('economic_index')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Composite index calculation (simplified)
  // Normalize each component to 100 baseline
  const homePriceComponent = (metrics.median_home_value / 400000) * 100;
  const mortgageComponent = ((7 - metrics.mortgage_rate) / 3) * 100; // Inverted - lower rates = higher score
  const inflationComponent = ((5 - metrics.core_inflation) / 3) * 100; // Inverted
  const affordabilityComponent = (metrics.affordability_index / 125) * 100;

  const indexValue = Math.round(
    (homePriceComponent * 0.3 + 
     mortgageComponent * 0.25 + 
     inflationComponent * 0.25 + 
     affordabilityComponent * 0.2) * 10
  ) / 10;

  const momChange = previousData 
    ? Math.round((indexValue - previousData.index_value) * 10) / 10 
    : 0;
  const momPercent = previousData && previousData.index_value !== 0
    ? Math.round(((indexValue - previousData.index_value) / previousData.index_value) * 100 * 10) / 10
    : 0;

  const data = {
    date: today,
    index_value: indexValue,
    mom_change: momChange,
    mom_percent: momPercent,
    yoy_change: 0, // Would need data from 1 year ago
    yoy_percent: 0,
  };

  const { error } = await supabase
    .from('economic_index')
    .upsert(data as any, { onConflict: 'date' });

  if (error) {
    console.error('Error saving economic index:', error);
  } else {
    console.log(`Economic index: ${indexValue} (${momChange > 0 ? '+' : ''}${momChange})`);
  }
}

// Master sync function
export async function syncAllData() {
  console.log('Starting comprehensive data sync...');
  console.log('Timestamp:', new Date().toISOString());

  try {
    // 1. Get latest housing metrics
    const { data: latestMetrics } = await supabase
      .from('housing_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestMetrics) {
      console.error('No housing metrics found. Run FRED sync first.');
      return;
    }

    console.log('Latest metrics:', latestMetrics.date);

    // 2. Sync all data sources in parallel
    await Promise.all([
      syncBuilderExpenses(),
      syncHouseholdExpenses(),
      syncRegionalAffordability({ mortgage_rate: latestMetrics.mortgage_rate }),
    ]);

    // 3. Sync calculated indicators
    await syncCrashIndicators({
      mortgage_rate: latestMetrics.mortgage_rate,
      affordability_index: latestMetrics.affordability_index,
      total_inventory: latestMetrics.total_inventory,
      building_permits: latestMetrics.building_permits,
      median_home_value: latestMetrics.median_home_value,
      median_household_income: latestMetrics.median_household_income,
    });

    // 4. Calculate economic index
    await syncEconomicIndex({
      median_home_value: latestMetrics.median_home_value,
      mortgage_rate: latestMetrics.mortgage_rate,
      core_inflation: latestMetrics.core_inflation,
      affordability_index: latestMetrics.affordability_index,
    });

    console.log('All data sync complete!');
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}
