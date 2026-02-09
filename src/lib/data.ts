import { supabase } from './supabase';
import { HousingMetric, RegionalAffordability, BuilderExpense, HouseholdExpense, CrashIndicator, EconomicIndex } from './types';
import { calculateHousingHealthIndex, calculateCrashRisk, calculateMarketMomentum } from './calculations';

// Get latest housing metrics with enhanced calculations
export async function getLatestHousingMetrics(): Promise<(HousingMetric & {
  healthIndex: {
    score: number;
    status: 'Healthy' | 'Caution' | 'Warning' | 'Critical';
    message: string;
  };
}) | null> {
  try {
    const { data, error } = await supabase
      .from('housing_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error || !data) {
      console.error('Error fetching housing metrics:', error);
      return null;
    }
    
    const healthIndex = calculateHousingHealthIndex(data);
    
    return {
      id: data.id,
      date: data.date,
      median_home_value: data.median_home_value ?? null,
      median_new_home_sale_price: data.median_new_home_sale_price ?? null,
      mortgage_rate: data.mortgage_rate ?? null,
      fed_funds_rate: data.fed_funds_rate ?? null,
      treasury_yield_10y: data.treasury_yield_10y ?? null,
      core_inflation: data.core_inflation ?? null,
      affordability_index: data.affordability_index ?? null,
      median_household_income: data.median_household_income ?? null,
      total_inventory: data.total_inventory ?? null,
      new_construction_inventory: data.new_construction_inventory ?? null,
      building_permits: data.building_permits ?? null,
      healthIndex,
    };
  } catch (e) {
    console.error('Exception fetching housing metrics:', e);
    return null;
  }
}

export async function getHousingMetricsHistory(limit: number = 24): Promise<HousingMetric[]> {
  try {
    const { data, error } = await supabase
      .from('housing_metrics')
      .select('*')
      .order('date', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching housing metrics history:', error);
      return [];
    }
    
    return (data || []).map((item: any) => ({
      id: item.id,
      date: item.date,
      median_home_value: item.median_home_value ?? null,
      median_new_home_sale_price: item.median_new_home_sale_price ?? null,
      mortgage_rate: item.mortgage_rate ?? null,
      fed_funds_rate: item.fed_funds_rate ?? null,
      treasury_yield_10y: item.treasury_yield_10y ?? null,
      core_inflation: item.core_inflation ?? null,
      affordability_index: item.affordability_index ?? null,
      median_household_income: item.median_household_income ?? null,
      total_inventory: item.total_inventory ?? null,
      new_construction_inventory: item.new_construction_inventory ?? null,
      building_permits: item.building_permits ?? null,
    }));
  } catch (e) {
    console.error('Exception fetching housing metrics history:', e);
    return [];
  }
}

// Get regional affordability with enhanced data
export async function getRegionalAffordability(date?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('regional_affordability')
      .select('*');
    
    if (date) {
      query = query.eq('date', date);
    } else {
      query = query.order('date', { ascending: false }).limit(4);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching regional affordability:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No regional affordability data found');
      return [];
    }
    
    console.log(`Fetched ${data.length} regional affordability records`);
    
    return data.map((region: any) => {
      const medianFamilyIncome = region.median_family_income ?? 1;
      const priceToIncomeRatio = medianFamilyIncome > 0 
        ? (region.median_home_price ?? 0) / medianFamilyIncome
        : 0;
      const monthlyPaymentToIncome = medianFamilyIncome > 0
        ? ((region.median_mortgage_payment ?? 0) / (medianFamilyIncome / 12)) * 100
        : 0;
      
      return {
        id: region.id,
        date: region.date,
        region: region.region,
        median_home_price: region.median_home_price ?? null,
        median_qualifying_income: region.median_qualifying_income ?? null,
        median_family_income: region.median_family_income ?? null,
        median_mortgage_payment: region.median_mortgage_payment ?? null,
        affordability_score: region.affordability_score ?? null,
        priceToIncomeRatio: Math.round(priceToIncomeRatio * 10) / 10,
        monthlyPaymentToIncome: Math.round(monthlyPaymentToIncome * 10) / 10,
      };
    });
  } catch (e) {
    console.error('Exception fetching regional affordability:', e);
    return [];
  }
}

// Get builder expenses with trend analysis
export async function getBuilderExpenses(date?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('builder_expenses')
      .select('*');
    
    if (date) {
      query = query.eq('date', date);
    } else {
      query = query.order('date', { ascending: false }).limit(15);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching builder expenses:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No builder expenses data found');
      return [];
    }
    
    console.log(`Fetched ${data.length} builder expenses`);
    
    return data.map((expense: any) => {
      const percentChange = expense.percent_change ?? 0;
      const trendDirection = percentChange > 1 ? 'up' : percentChange < -1 ? 'down' : 'stable';
      const trendStrength = Math.abs(percentChange) > 10 ? 'major' : 
                           Math.abs(percentChange) > 5 ? 'moderate' : 'minor';
      
      return {
        id: expense.id,
        date: expense.date,
        material_name: expense.material_name,
        current_price: expense.current_price ?? null,
        start_price: expense.start_price ?? null,
        percent_change: expense.percent_change ?? null,
        total_change: expense.total_change ?? null,
        status: expense.status ?? null,
        trendDirection,
        trendStrength,
      };
    });
  } catch (e) {
    console.error('Exception fetching builder expenses:', e);
    return [];
  }
}

// Get household expenses grouped by category
export async function getHouseholdExpenses(date?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('household_expenses')
      .select('*');
    
    if (date) {
      query = query.eq('date', date);
    } else {
      const { data: latestDate } = await supabase
        .from('household_expenses')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestDate) {
        query = query.eq('date', (latestDate as {date: string}).date);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching household expenses:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No household expenses data found');
      return [];
    }
    
    console.log(`Fetched ${data.length} household expenses`);
    
    // Group by category
    const grouped = data.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    
    return Object.entries(grouped).map(([category, items]) => {
      const itemsArray = items as any[];
      const categoryTotal = itemsArray.reduce((sum, item) => sum + (item.current_price ?? 0), 0);
      const categoryChange = itemsArray.reduce((sum, item) => sum + (item.percent_change ?? 0), 0) / itemsArray.length;

      return {
        category,
        items: itemsArray.map((item: any) => ({
          id: item.id,
          date: item.date,
          category: item.category,
          item_name: item.item_name,
          current_price: item.current_price ?? null,
          start_price: item.start_price ?? null,
          percent_change: item.percent_change ?? null,
        })),
        categoryTotal: Math.round(categoryTotal),
        categoryChange: Math.round(categoryChange * 10) / 10,
      };
    });
  } catch (e) {
    console.error('Exception fetching household expenses:', e);
    return [];
  }
}

// Get crash indicators with risk analysis
export async function getCrashIndicators(date?: string): Promise<any> {
  try {
    let query = supabase
      .from('crash_indicators')
      .select('*');
    
    if (date) {
      query = query.eq('date', date);
    } else {
      query = query.order('date', { ascending: false }).limit(20);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching crash indicators:', error);
      return { indicators: [], summary: { totalPoints: 0, maxPoints: 100, riskLevel: 'Low', riskPercent: 0, warnings: [] } };
    }
    
    // Enhance with severity
    const indicators = (data || []).map((ind: any) => ({
      id: ind.id,
      date: ind.date,
      variable_name: ind.variable_name,
      category: ind.category,
      current_value: ind.current_value ?? null,
      points: ind.points ?? 0,
      risk_tier: ind.risk_tier ?? null,
      severity: (ind.points ?? 0) > 10 ? 'high' : (ind.points ?? 0) > 5 ? 'medium' : 'low',
    }));
    
    // Calculate summary
    const maxPoints = 100;
    const totalPoints = indicators.reduce((sum, ind) => sum + (ind.points ?? 0), 0);
    const riskPercent = Math.round((totalPoints / maxPoints) * 100);
    
    let riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Critical';
    if (riskPercent < 20) riskLevel = 'Low';
    else if (riskPercent < 40) riskLevel = 'Moderate';
    else if (riskPercent < 60) riskLevel = 'Elevated';
    else if (riskPercent < 80) riskLevel = 'High';
    else riskLevel = 'Critical';
    
    // Generate warnings
    const warnings: string[] = [];
    indicators.forEach((ind: any) => {
      if (ind.severity === 'high') {
        warnings.push(`${ind.variable_name}: ${ind.risk_tier}`);
      }
    });
    
    return {
      indicators,
      summary: {
        totalPoints,
        maxPoints,
        riskLevel,
        riskPercent,
        warnings: warnings.slice(0, 5),
      },
    };
  } catch (e) {
    console.error('Exception fetching crash indicators:', e);
    return { indicators: [], summary: { totalPoints: 0, maxPoints: 100, riskLevel: 'Low', riskPercent: 0, warnings: [] } };
  }
}

// Get economic index history
export async function getEconomicIndexHistory(limit: number = 24): Promise<EconomicIndex[]> {
  try {
    const { data, error } = await supabase
      .from('economic_index')
      .select('*')
      .order('date', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching economic index:', error);
      return [];
    }
    
    return (data || []).map((item: any) => ({
      id: item.id,
      date: item.date,
      index_value: item.index_value ?? null,
      mom_change: item.mom_change ?? null,
      mom_percent: item.mom_percent ?? null,
      yoy_change: item.yoy_change ?? null,
      yoy_percent: item.yoy_percent ?? null,
    }));
  } catch (e) {
    console.error('Exception fetching economic index:', e);
    return [];
  }
}

// Get latest market momentum
export async function getMarketMomentum(): Promise<any | null> {
  try {
    const { data: current } = await supabase
      .from('housing_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    const { data: previousData } = await supabase
      .from('housing_metrics')
      .select('*')
      .order('date', { ascending: false })
      .range(1, 1)
      .maybeSingle();
    
    const previous = previousData;
    
    if (!current) return null;
    
    return calculateMarketMomentum(current, previous);
  } catch (e) {
    console.error('Exception fetching market momentum:', e);
    return null;
  }
}

// Get dashboard summary
export async function getDashboardSummary(): Promise<any> {
  const [
    latestWithHealth,
    momentum,
    crashData,
    regionalData,
    builderCosts,
  ] = await Promise.all([
    getLatestHousingMetrics(),
    getMarketMomentum(),
    getCrashIndicators(),
    getRegionalAffordability(),
    getBuilderExpenses(),
  ]);
  
  return {
    latestMetrics: latestWithHealth ? {
      id: latestWithHealth.id,
      date: latestWithHealth.date,
      median_home_value: latestWithHealth.median_home_value ?? null,
      median_new_home_sale_price: latestWithHealth.median_new_home_sale_price ?? null,
      mortgage_rate: latestWithHealth.mortgage_rate ?? null,
      fed_funds_rate: latestWithHealth.fed_funds_rate ?? null,
      treasury_yield_10y: latestWithHealth.treasury_yield_10y ?? null,
      core_inflation: latestWithHealth.core_inflation ?? null,
      affordability_index: latestWithHealth.affordability_index ?? null,
      median_household_income: latestWithHealth.median_household_income ?? null,
      total_inventory: latestWithHealth.total_inventory ?? null,
      new_construction_inventory: latestWithHealth.new_construction_inventory ?? null,
      building_permits: latestWithHealth.building_permits ?? null,
    } : null,
    healthIndex: latestWithHealth?.healthIndex || null,
    marketMomentum: momentum,
    crashRisk: crashData?.summary || null,
    regionalData,
    builderCosts,
  };
}
