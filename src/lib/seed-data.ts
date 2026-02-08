import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample builder materials with realistic price trends
const BUILDER_MATERIALS = [
  { name: 'Lumber & Wood Products', basePrice: 280, volatility: 0.15 },
  { name: 'Steel Mill Products', basePrice: 185, volatility: 0.12 },
  { name: 'Copper & Brass', basePrice: 420, volatility: 0.18 },
  { name: 'Aluminum Mill Shapes', basePrice: 165, volatility: 0.10 },
  { name: 'Cement', basePrice: 135, volatility: 0.08 },
  { name: 'Concrete Products', basePrice: 195, volatility: 0.09 },
  { name: 'Gypsum Products', basePrice: 245, volatility: 0.11 },
  { name: 'Insulation Materials', basePrice: 175, volatility: 0.13 },
  { name: 'Windows & Doors', basePrice: 155, volatility: 0.07 },
  { name: 'Plumbing Fixtures', basePrice: 225, volatility: 0.09 },
  { name: 'Electrical Equipment', basePrice: 185, volatility: 0.10 },
  { name: 'HVAC Equipment', basePrice: 265, volatility: 0.11 },
  { name: 'Paint & Coatings', basePrice: 145, volatility: 0.08 },
  { name: 'Flooring Materials', basePrice: 195, volatility: 0.09 },
  { name: 'Roofing Materials', basePrice: 215, volatility: 0.10 },
];

// Sample household expense categories
const HOUSEHOLD_CATEGORIES = {
  'Housing': [
    { name: 'Rent', basePrice: 1450 },
    { name: 'Owners Equivalent Rent', basePrice: 1650 },
    { name: 'Household Insurance', basePrice: 145 },
  ],
  'Utilities': [
    { name: 'Electricity', basePrice: 165 },
    { name: 'Natural Gas', basePrice: 85 },
    { name: 'Water & Sewer', basePrice: 65 },
    { name: 'Internet', basePrice: 75 },
  ],
  'Food': [
    { name: 'Food at Home', basePrice: 485 },
    { name: 'Food Away', basePrice: 325 },
  ],
  'Transportation': [
    { name: 'Gasoline', basePrice: 285, highVolatility: true },
    { name: 'New Vehicles', basePrice: 48500 },
  ],
  'Healthcare': [
    { name: 'Medical Care', basePrice: 485 },
    { name: 'Health Insurance', basePrice: 525 },
  ],
  'Other': [
    { name: 'Apparel', basePrice: 145 },
    { name: 'Entertainment', basePrice: 285 },
  ],
};

// Generate realistic price trend
function generatePriceTrend(basePrice: number, months: number, volatility: number = 0.05, highVolatility: boolean = false): number[] {
  const prices: number[] = [];
  let currentPrice = basePrice;
  const actualVolatility = highVolatility ? volatility * 2.5 : volatility;
  
  // Add some trend (generally upward with recent acceleration)
  const trend = 0.003; // 0.3% monthly trend
  
  for (let i = 0; i < months; i++) {
    // Random walk with trend
    const change = (Math.random() - 0.48) * actualVolatility + trend;
    
    // Add COVID spike effect for 2020-2021
    if (i > 12 && i < 24) {
      currentPrice *= (1 + change * 1.5);
    } 
    // Add inflation surge for 2022-2023
    else if (i >= 24 && i < 36) {
      currentPrice *= (1 + change * 1.8);
    }
    // Recent stabilization
    else {
      currentPrice *= (1 + change);
    }
    
    prices.push(Math.round(currentPrice * 100) / 100);
  }
  
  return prices;
}

// Seed builder expenses
async function seedBuilderExpenses() {
  console.log('Seeding builder expenses...');
  const today = new Date();
  const records: any[] = [];
  
  for (const material of BUILDER_MATERIALS) {
    const prices = generatePriceTrend(material.basePrice, 60, material.volatility);
    const startPrice = prices[0];
    
    // Create records for last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const currentPrice = prices[prices.length - 1 - i];
      const percentChange = ((currentPrice - startPrice) / startPrice) * 100;
      
      let status: string;
      if (percentChange <= -10) status = 'MAJOR Drop';
      else if (percentChange <= -5) status = 'Drop';
      else if (percentChange <= 5) status = 'Stable';
      else if (percentChange <= 10) status = 'Rise';
      else status = 'MAJOR Rise';
      
      records.push({
        date: dateStr,
        material_name: material.name,
        current_price: currentPrice,
        start_price: startPrice,
        percent_change: Math.round(percentChange * 10) / 10,
        total_change: Math.round((currentPrice - startPrice) * 100) / 100,
        status,
      });
    }
  }
  
  const { error } = await supabase.from('builder_expenses').upsert(records as any, {
    onConflict: 'date,material_name'
  });
  
  if (error) {
    console.error('Error seeding builder expenses:', error);
  } else {
    console.log(`Seeded ${records.length} builder expense records`);
  }
}

// Seed household expenses
async function seedHouseholdExpenses() {
  console.log('Seeding household expenses...');
  const today = new Date();
  const records: any[] = [];
  
  for (const [category, items] of Object.entries(HOUSEHOLD_CATEGORIES)) {
    for (const item of items) {
      const prices = generatePriceTrend(
        item.basePrice, 
        60, 
        0.04, 
        (item as any).highVolatility
      );
      const startPrice = prices[0];
      
      // Create records for last 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const currentPrice = prices[prices.length - 1 - i];
        const percentChange = ((currentPrice - startPrice) / startPrice) * 100;
        
        records.push({
          date: dateStr,
          category,
          item_name: item.name,
          current_price: currentPrice,
          start_price: startPrice,
          percent_change: Math.round(percentChange * 10) / 10,
        });
      }
    }
  }
  
  const { error } = await supabase.from('household_expenses').upsert(records as any, {
    onConflict: 'date,item_name'
  });
  
  if (error) {
    console.error('Error seeding household expenses:', error);
  } else {
    console.log(`Seeded ${records.length} household expense records`);
  }
}

// Seed crash indicators
async function seedCrashIndicators() {
  console.log('Seeding crash indicators...');
  const today = new Date();
  const records: any[] = [];
  
  const indicators = [
    { variable: 'Mortgage Rate Level', category: 'Critical', baseValue: 5.5, volatility: 0.3 },
    { variable: 'Price-to-Income Ratio', category: 'Critical', baseValue: 4.2, volatility: 0.1 },
    { variable: 'Affordability Index', category: 'Major', baseValue: 115, volatility: 3 },
    { variable: 'Mortgage Delinquency', category: 'Major', baseValue: 2.5, volatility: 0.2 },
    { variable: 'Inventory Months Supply', category: 'Major', baseValue: 4.5, volatility: 0.4 },
    { variable: 'Credit Standards', category: 'Minor', baseValue: 0, volatility: 0.5 },
    { variable: 'New Home Sales', category: 'Minor', baseValue: 650, volatility: 50 },
    { variable: 'Construction Employment', category: 'Minor', baseValue: 100, volatility: 2 },
  ];
  
  for (const indicator of indicators) {
    const values = generatePriceTrend(indicator.baseValue, 24, indicator.volatility / 100);
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const currentValue = values[values.length - 1 - i];
      
      // Calculate points and risk tier
      let points = 5;
      let riskTier = 'Low Risk';
      
      if (indicator.variable === 'Mortgage Rate Level') {
        if (currentValue > 7) { points = 15; riskTier = 'High Risk'; }
        else if (currentValue > 6) { points = 10; riskTier = 'Moderate Risk'; }
      } else if (indicator.variable === 'Price-to-Income Ratio') {
        if (currentValue > 5) { points = 12; riskTier = 'Elevated Risk'; }
        else if (currentValue > 4.5) { points = 8; riskTier = 'Moderate Risk'; }
      } else if (indicator.variable === 'Affordability Index') {
        if (currentValue < 100) { points = 8; riskTier = 'Elevated Risk'; }
        else if (currentValue < 110) { points = 5; riskTier = 'Moderate Risk'; }
      }
      
      records.push({
        date: dateStr,
        variable_name: indicator.variable,
        category: indicator.category,
        current_value: Math.round(currentValue * 100) / 100,
        points,
        risk_tier: riskTier,
      });
    }
  }
  
  const { error } = await supabase.from('crash_indicators').upsert(records as any, {
    onConflict: 'date,variable_name'
  });
  
  if (error) {
    console.error('Error seeding crash indicators:', error);
  } else {
    console.log(`Seeded ${records.length} crash indicator records`);
  }
}

// Seed regional affordability
async function seedRegionalAffordability() {
  console.log('Seeding regional affordability...');
  const today = new Date();
  const records: any[] = [];
  
  const regions = [
    { name: 'Northeast', basePrice: 485000, baseIncome: 92000 },
    { name: 'Midwest', basePrice: 285000, baseIncome: 72000 },
    { name: 'South', basePrice: 325000, baseIncome: 68000 },
    { name: 'West', basePrice: 585000, baseIncome: 85000 },
  ];
  
  for (const region of regions) {
    const prices = generatePriceTrend(region.basePrice, 24, 0.06);
    const incomes = generatePriceTrend(region.baseIncome, 24, 0.025);
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const medianPrice = prices[prices.length - 1 - i];
      const medianIncome = incomes[incomes.length - 1 - i];
      
      // Calculate mortgage payment (30-year, 6.5% rate, 20% down)
      const loanAmount = medianPrice * 0.8;
      const monthlyRate = 0.065 / 12;
      const numPayments = 30 * 12;
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
      
      const qualifyingIncome = (monthlyPayment / 0.28) * 12;
      const affordabilityScore = Math.round((medianIncome / qualifyingIncome) * 100);
      
      records.push({
        date: dateStr,
        region: region.name,
        median_home_price: Math.round(medianPrice),
        median_qualifying_income: Math.round(qualifyingIncome),
        median_family_income: Math.round(medianIncome),
        median_mortgage_payment: Math.round(monthlyPayment),
        affordability_score: affordabilityScore,
      });
    }
  }
  
  const { error } = await supabase.from('regional_affordability').upsert(records as any, {
    onConflict: 'date,region'
  });
  
  if (error) {
    console.error('Error seeding regional affordability:', error);
  } else {
    console.log(`Seeded ${records.length} regional affordability records`);
  }
}

// Seed economic index
async function seedEconomicIndex() {
  console.log('Seeding economic index...');
  const today = new Date();
  const records: any[] = [];
  
  // Generate realistic index values
  const baseValue = 100;
  const values = generatePriceTrend(baseValue, 24, 0.04);
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const indexValue = values[values.length - 1 - i];
    const prevValue = i < values.length - 1 ? values[values.length - 2 - i] : indexValue;
    
    const momChange = Math.round((indexValue - prevValue) * 10) / 10;
    const momPercent = prevValue !== 0 ? Math.round(((indexValue - prevValue) / prevValue) * 100 * 10) / 10 : 0;
    
    const yearAgoValue = i < values.length - 12 ? values[values.length - 13 - i] : indexValue;
    const yoyChange = Math.round((indexValue - yearAgoValue) * 10) / 10;
    const yoyPercent = yearAgoValue !== 0 ? Math.round(((indexValue - yearAgoValue) / yearAgoValue) * 100 * 10) / 10 : 0;
    
    records.push({
      date: dateStr,
      index_value: Math.round(indexValue * 10) / 10,
      mom_change: momChange,
      mom_percent: momPercent,
      yoy_change: yoyChange,
      yoy_percent: yoyPercent,
    });
  }
  
  const { error } = await supabase.from('economic_index').upsert(records as any, {
    onConflict: 'date'
  });
  
  if (error) {
    console.error('Error seeding economic index:', error);
  } else {
    console.log(`Seeded ${records.length} economic index records`);
  }
}

// Master seed function
export async function seedAllData() {
  console.log('Seeding all historical data...');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    await seedBuilderExpenses();
    await seedHouseholdExpenses();
    await seedCrashIndicators();
    await seedRegionalAffordability();
    await seedEconomicIndex();
    
    console.log('All data seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedAllData();
}
