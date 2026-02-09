import { createServerClient } from '@/lib/supabase-server';

export interface HomeAnalysis {
  homeValue: number;
  mortgageBalance: number;
  equity: number;
  sellingCosts: number;
  netProceeds: number;
  currentLtv: number;
}

export interface MetroTrend {
  regionId: number;
  regionName: string;
  currentValue: number;
  value6MonthsAgo: number;
  value12MonthsAgo: number;
  momChange: number;
  yoyChange: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  annualizedGrowth: number;
}

export interface ScenarioAnalysis {
  homeAnalysis: HomeAnalysis;
  currentMetro: MetroTrend | null;
  targetMetro: MetroTrend | null;
  projectedHomeValue: {
    '6months': number;
    '12months': number;
  };
  targetHomePrice: number;
  recommendation: 'SELL_NOW' | 'WAIT' | 'HOLD' | 'RELOCATE';
  confidence: 'high' | 'medium' | 'low';
  reasoning: string[];
  financials: {
    cashFromSale: number;
    downPaymentNeeded: number;
    remainingAfterDownPayment: number;
    canAffordMove: boolean;
  };
}

// Calculate current equity
export function calculateEquity(homeValue: number, mortgageBalance: number): number {
  return homeValue - mortgageBalance;
}

// Calculate selling costs (6% realtor + 2% closing costs)
export function calculateSellingCosts(homeValue: number): number {
  return homeValue * 0.08;
}

// Calculate net proceeds from sale
export function calculateNetProceeds(homeValue: number, mortgageBalance: number): number {
  const sellingCosts = calculateSellingCosts(homeValue);
  const equity = calculateEquity(homeValue, mortgageBalance);
  return equity - sellingCosts;
}

// Calculate loan-to-value ratio
export function calculateLTV(mortgageBalance: number, homeValue: number): number {
  return (mortgageBalance / homeValue) * 100;
}

// Project home value based on metro trend
export function projectHomeValue(
  currentValue: number,
  annualizedGrowthRate: number,
  months: number
): number {
  const monthlyRate = annualizedGrowthRate / 12;
  return currentValue * Math.pow(1 + monthlyRate / 100, months);
}

// Get metro trend data
interface MetroData {
  home_value: number;
  date: string;
}

export async function getMetroTrend(
  supabase: ReturnType<typeof createServerClient>,
  regionId: number
): Promise<MetroTrend | null> {
  // Get current value
  const { data: current } = await supabase
    .from('metro_zhvi')
    .select('home_value, date')
    .eq('region_id', regionId)
    .order('date', { ascending: false })
    .limit(1)
    .single() as { data: MetroData | null };

  if (!current) return null;

  // Get 6 months ago
  const sixMonthsAgo = new Date(current.date);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const { data: data6mo } = await supabase
    .from('metro_zhvi')
    .select('home_value')
    .eq('region_id', regionId)
    .lte('date', sixMonthsAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(1)
    .single() as { data: { home_value: number } | null };

  // Get 12 months ago
  const twelveMonthsAgo = new Date(current.date);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const { data: data12mo } = await supabase
    .from('metro_zhvi')
    .select('home_value')
    .eq('region_id', regionId)
    .lte('date', twelveMonthsAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(1)
    .single() as { data: { home_value: number } | null };

  const currentValue = current.home_value;
  const value6MonthsAgo = data6mo?.home_value || currentValue;
  const value12MonthsAgo = data12mo?.home_value || currentValue;

  // Calculate changes
  const momChange = ((currentValue - value6MonthsAgo) / value6MonthsAgo) * 100 / 6;
  const yoyChange = ((currentValue - value12MonthsAgo) / value12MonthsAgo) * 100;

  // Determine trend
  let trendDirection: 'rising' | 'falling' | 'stable';
  if (yoyChange > 3) trendDirection = 'rising';
  else if (yoyChange < -3) trendDirection = 'falling';
  else trendDirection = 'stable';

  return {
    regionId,
    regionName: '', // Will be filled in by caller
    currentValue,
    value6MonthsAgo,
    value12MonthsAgo,
    momChange,
    yoyChange,
    trendDirection,
    annualizedGrowth: yoyChange
  };
}

// Find metro by city name
export async function findMetroByCity(
  supabase: ReturnType<typeof createServerClient>,
  cityQuery: string
): Promise<{ region_id: number; region_name: string } | null> {
  const { data } = await supabase
    .from('metro_zhvi')
    .select('region_id, region_name')
    .ilike('region_name', `%${cityQuery}%`)
    .eq('region_type', 'msa')
    .limit(1)
    .single();

  return data;
}

// Main scenario analysis
interface HomeData {
  id: string;
  purchase_price: number | null;
  current_mortgage_balance: number | null;
  region_id: number | null;
  home_appraisals: {
    appraised_value: number;
    appraisal_date: string;
  }[];
}

export async function analyzeScenario(
  supabase: ReturnType<typeof createServerClient>,
  params: {
    homeId: string;
    targetCity: string;
    scenarioType: 'sell_and_buy' | 'rent_current_buy_new' | 'keep_and_buy';
  }
): Promise<ScenarioAnalysis> {
  const { homeId, targetCity, scenarioType } = params;

  // Get home details with latest appraisal
  const { data: home } = await supabase
    .from('user_homes')
    .select(`
      *,
      home_appraisals (
        appraised_value,
        appraisal_date
      )
    `)
    .eq('id', homeId)
    .order('appraisal_date', { referencedTable: 'home_appraisals', ascending: false })
    .limit(1)
    .single() as { data: HomeData | null };

  if (!home) {
    throw new Error('Home not found');
  }

  // Get latest appraisal value
  const latestAppraisal = home.home_appraisals?.[0]?.appraised_value || home.purchase_price || 0;
  const homeValue = latestAppraisal;
  const mortgageBalance = home.current_mortgage_balance || 0;

  // Calculate home analysis
  const homeAnalysis: HomeAnalysis = {
    homeValue,
    mortgageBalance,
    equity: calculateEquity(homeValue, mortgageBalance),
    sellingCosts: calculateSellingCosts(homeValue),
    netProceeds: calculateNetProceeds(homeValue, mortgageBalance),
    currentLtv: calculateLTV(mortgageBalance, homeValue)
  };

  // Get current metro trend
  let currentMetro: MetroTrend | null = null;
  if (home.region_id) {
    currentMetro = await getMetroTrend(supabase, home.region_id);
    if (currentMetro) {
      const { data: metroInfo } = await supabase
        .from('metro_zhvi')
        .select('region_name')
        .eq('region_id', home.region_id)
        .limit(1)
        .single() as { data: { region_name: string } | null };
      currentMetro.regionName = metroInfo?.region_name || 'Unknown';
    }
  }

  // Get target metro trend
  const targetMetroInfo = await findMetroByCity(supabase, targetCity);
  let targetMetro: MetroTrend | null = null;
  if (targetMetroInfo) {
    targetMetro = await getMetroTrend(supabase, targetMetroInfo.region_id);
    if (targetMetro) {
      targetMetro.regionName = targetMetroInfo.region_name;
    }
  }

  // Project home value
  const growthRate = currentMetro?.annualizedGrowth || 3;
  const projectedHomeValue = {
    '6months': projectHomeValue(homeValue, growthRate, 6),
    '12months': projectHomeValue(homeValue, growthRate, 12)
  };

  // Target home price (median for target metro)
  const targetHomePrice = targetMetro?.currentValue || homeValue;

  // Calculate financials for move
  const cashFromSale = homeAnalysis.netProceeds;
  const downPaymentNeeded = targetHomePrice * 0.20; // Assume 20% down
  const remainingAfterDownPayment = cashFromSale - downPaymentNeeded;
  const canAffordMove = remainingAfterDownPayment >= 0;

  // Generate recommendation
  let recommendation: ScenarioAnalysis['recommendation'];
  let confidence: ScenarioAnalysis['confidence'];
  const reasoning: string[] = [];

  // Logic for recommendation
  const currentRising = currentMetro?.trendDirection === 'rising';
  const currentFalling = currentMetro?.trendDirection === 'falling';
  const targetRising = targetMetro?.trendDirection === 'rising';
  const targetFalling = targetMetro?.trendDirection === 'falling';

  if (currentFalling && targetRising) {
    recommendation = 'RELOCATE';
    confidence = 'high';
    reasoning.push(`Your current market is declining (${currentMetro?.yoyChange.toFixed(1)}% YoY) while ${targetCity} is appreciating (${targetMetro?.yoyChange.toFixed(1)}% YoY)`);
    reasoning.push('Consider selling now before further depreciation');
  } else if (currentRising && targetFalling) {
    recommendation = 'HOLD';
    confidence = 'high';
    reasoning.push(`Your home is appreciating (${currentMetro?.yoyChange.toFixed(1)}% YoY) while ${targetCity} is declining (${targetMetro?.yoyChange.toFixed(1)}% YoY)`);
    reasoning.push('Stay put and let your equity grow before considering a move');
  } else if (growthRate > 8) {
    recommendation = 'WAIT';
    confidence = 'medium';
    reasoning.push(`Your market is appreciating rapidly (${growthRate.toFixed(1)}% annually)`);
    reasoning.push(`Waiting 6-12 months could add $${(projectedHomeValue['12months'] - homeValue).toLocaleString()} in equity`);
  } else if (canAffordMove) {
    recommendation = 'SELL_NOW';
    confidence = 'medium';
    reasoning.push(`You have sufficient equity for a move to ${targetCity}`);
    reasoning.push(`Net proceeds: $${cashFromSale.toLocaleString()} vs down payment needed: $${downPaymentNeeded.toLocaleString()}`);
  } else {
    recommendation = 'WAIT';
    confidence = 'low';
    reasoning.push('Insufficient equity for move to target market');
    reasoning.push(`Need $${downPaymentNeeded.toLocaleString()} for down payment, have $${cashFromSale.toLocaleString()}`);
  }

  return {
    homeAnalysis,
    currentMetro,
    targetMetro,
    projectedHomeValue,
    targetHomePrice,
    recommendation,
    confidence,
    reasoning,
    financials: {
      cashFromSale,
      downPaymentNeeded,
      remainingAfterDownPayment,
      canAffordMove
    }
  };
}
