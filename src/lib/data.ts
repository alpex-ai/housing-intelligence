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
    
    // Calculate health index
    const healthIndex = calculateHousingHealthIndex(data);
    
    return {
      ...data,
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
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching housing metrics history:', e);
    return [];
  }
}

// Get regional affordability with enhanced data
export async function getRegionalAffordability(date?: string): Promise<(RegionalAffordability & {
  priceToIncomeRatio?: number;
  monthlyPaymentToIncome?: number;
})[]> {
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
    
    // Enhance with calculated fields
    return (data || []).map((region: any) => {
      const priceToIncomeRatio = region.median_family_income > 0 
        ? region.median_home_price / region.median_family_income 
        : 0;
      const monthlyPaymentToIncome = region.median_family_income > 0
        ? (region.median_mortgage_payment / (region.median_family_income / 12)) * 100
        : 0;
      
      return {
        id: region.id,
        date: region.date,
        region: region.region,
        median_home_price: region.median_home_price,
        median_qualifying_income: region.median_qualifying_income,
        median_family_income: region.median_family_income,
        median_mortgage_payment: region.median_mortgage_payment,
        affordability_score: region.affordability_score,
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
export async function getBuilderExpenses(date?: string): Promise<(BuilderExpense & {
  trendDirection: 'up' | 'down' | 'stable';
  trendStrength: 'major' | 'moderate' | 'minor';
})[]> {
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
    
    // Enhance with trend indicators
    return (data || []).map((expense: any) => {
      const trendDirection = expense.percent_change > 1 ? 'up' : expense.percent_change < -1 ? 'down' : 'stable';
      const trendStrength = Math.abs(expense.percent_change) > 10 ? 'major' : 
                           Math.abs(expense.percent_change) > 5 ? 'moderate' : 'minor';
      
      return {
        id: expense.id,
        date: expense.date,
        material_name: expense.material_name,
        current_price: expense.current_price,
        start_price: expense.start_price,
        percent_change: expense.percent_change,
        total_change: expense.total_change,
        status: expense.status,
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
export async function getHouseholdExpenses(date?: string): Promise<{
  category: string;
  items: HouseholdExpense[];
  categoryTotal: number;
  categoryChange: number;
}[]> {
  try {
    let query = supabase
      .from('household_expenses')
      .select('*');
    
    if (date) {
      query = query.eq('date', date);
    } else {
      // Get latest date
      const { data: latestDate } = await supabase
        .from('household_expenses')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestDate) {
        query = query.eq('date', latestDate.date);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching household expenses:', error);
      return [];
    }
    
    // Group by category
    const grouped = (data || []).reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, HouseholdExpense[]>);
    
    return Object.entries(grouped).map(([category, items]) => {
      const categoryTotal = items.reduce((sum, item) => sum + item.current_price, 0);
      const categoryChange = items.reduce((sum, item) => sum + item.percent_change, 0) / items.length;
      
      return {
        category,
        items,
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
export async function getCrashIndicators(date?: string): Promise<{
  indicators: (CrashIndicator & {
    severity: 'low' | 'medium' | 'high';
  })[];
  summary: {
    totalPoints: number;
    maxPoints: number;
    riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Critical';
    riskPercent: number;
    warnings: string[];
  };
}> {
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
      current_value: ind.current_value,
      points: ind.points,
      risk_tier: ind.risk_tier,
      severity: ind.points > 10 ? 'high' : ind.points > 5 ? 'medium' : 'low' as 'low' | 'medium' | 'high',
    }));
    
    // Calculate summary
    const maxPoints = 100;
    const totalPoints = indicators.reduce((sum, ind) => sum + ind.points, 0);
    const riskPercent = Math.round((totalPoints / maxPoints) * 100);
    
    let riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Critical';
    if (riskPercent < 20) riskLevel = 'Low';
    else if (riskPercent < 40) riskLevel = 'Moderate';
    else if (riskPercent < 60) riskLevel = 'Elevated';
    else if (riskPercent < 80) riskLevel = 'High';
    else riskLevel = 'Critical';
    
    // Generate warnings
    const warnings: string[] = [];
    indicators.forEach(ind => {
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
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching economic index:', e);
    return [];
  }
}

// Get latest market momentum
export async function getMarketMomentum(): Promise<{
  priceMomentum: number;
  inventoryMomentum: number;
  rateMomentum: number;
  overall: 'Accelerating' | 'Growing' | 'Stable' | 'Slowing' | 'Contracting';
} | null> {
  try {
    const { data: current } = await supabase
      .from('housing_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    const { data: previous } = await supabase
      .from('housing_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .offset(1)
      .maybeSingle();
    
    if (!current) return null;
    
    return calculateMarketMomentum(current, previous);
  } catch (e) {
    console.error('Exception fetching market momentum:', e);
    return null;
  }
}

// Get dashboard summary
export async function getDashboardSummary(): Promise<{
  latestMetrics: HousingMetric | null;
  healthIndex: {
    score: number;
    status: 'Healthy' | 'Caution' | 'Warning' | 'Critical';
    message: string;
  } | null;
  marketMomentum: {
    priceMomentum: number;
    inventoryMomentum: number;
    rateMomentum: number;
    overall: 'Accelerating' | 'Growing' | 'Stable' | 'Slowing' | 'Contracting';
  } | null;
  crashRisk: {
    totalPoints: number;
    maxPoints: number;
    riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Critical';
    riskPercent: number;
    warnings: string[];
  } | null;
  regionalData: RegionalAffordability[];
  builderCosts: BuilderExpense[];
}> {
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
    latestMetrics: latestWithHealth ? { ...latestWithHealth, healthIndex: undefined } as HousingMetric : null,
    healthIndex: latestWithHealth?.healthIndex || null,
    marketMomentum: momentum,
    crashRisk: crashData?.summary || null,
    regionalData,
    builderCosts,
  };
}
