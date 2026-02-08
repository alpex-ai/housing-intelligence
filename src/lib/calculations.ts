import { HousingMetric, RegionalAffordability, CrashIndicator } from './types';

// Housing Health Index Calculation
// Returns a score 0-100 with risk level
export function calculateHousingHealthIndex(metrics: HousingMetric): {
  score: number;
  status: 'Healthy' | 'Caution' | 'Warning' | 'Critical';
  message: string;
} {
  // Component weights
  const weights = {
    affordability: 0.35,
    supply: 0.25,
    risk: 0.25,
    momentum: 0.15,
  };

  // 1. Affordability Score (0-100)
  // Based on affordability index (125 = healthy baseline)
  const affordabilityScore = Math.min(100, Math.max(0, 
    (metrics.affordability_index / 125) * 100
  ));

  // 2. Supply Score (0-100)
  // Based on months of inventory (6 months = balanced market)
  const monthsOfSupply = metrics.total_inventory > 0 
    ? metrics.total_inventory / (metrics.building_permits * 12 || 1)
    : 0;
  const supplyScore = monthsOfSupply > 0
    ? Math.min(100, Math.max(0, 100 - Math.abs(monthsOfSupply - 6) * 10))
    : 50;

  // 3. Risk Score (0-100, inverted - higher is better)
  // Based on mortgage rate and economic indicators
  const riskScore = Math.min(100, Math.max(0,
    100 - (metrics.mortgage_rate - 4) * 10 - (metrics.core_inflation - 2) * 5
  ));

  // 4. Momentum Score (0-100)
  // Based on price trend stability
  // Would need historical data for full calculation
  const momentumScore = 75; // Placeholder

  // Calculate weighted total
  const totalScore = Math.round(
    affordabilityScore * weights.affordability +
    supplyScore * weights.supply +
    riskScore * weights.risk +
    momentumScore * weights.momentum
  );

  // Determine status
  let status: 'Healthy' | 'Caution' | 'Warning' | 'Critical';
  let message: string;

  if (totalScore >= 75) {
    status = 'Healthy';
    message = 'Market conditions are favorable';
  } else if (totalScore >= 50) {
    status = 'Caution';
    message = 'Some indicators warrant attention';
  } else if (totalScore >= 25) {
    status = 'Warning';
    message = 'Multiple risk factors present';
  } else {
    status = 'Critical';
    message = 'Significant market stress detected';
  }

  return { score: totalScore, status, message };
}

// Regional Affordability Calculation
export function calculateRegionalAffordability(
  medianHomePrice: number,
  medianIncome: number,
  mortgageRate: number
): {
  qualifyingIncome: number;
  monthlyPayment: number;
  affordabilityScore: number;
  status: 'Affordable' | 'Stretch' | 'Unaffordable' | 'Severely Unaffordable';
} {
  // Calculate monthly mortgage payment (30-year fixed, 20% down)
  const loanAmount = medianHomePrice * 0.8;
  const monthlyRate = mortgageRate / 100 / 12;
  const numPayments = 30 * 12;
  
  const monthlyPayment = monthlyRate > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments;

  // Calculate income needed (28% front-end ratio)
  const qualifyingIncome = (monthlyPayment / 0.28) * 12;

  // Affordability score (100 = median income equals qualifying income)
  const affordabilityScore = Math.round((medianIncome / qualifyingIncome) * 100);

  // Status
  let status: 'Affordable' | 'Stretch' | 'Unaffordable' | 'Severely Unaffordable';
  if (affordabilityScore >= 120) {
    status = 'Affordable';
  } else if (affordabilityScore >= 100) {
    status = 'Stretch';
  } else if (affordabilityScore >= 80) {
    status = 'Unaffordable';
  } else {
    status = 'Severely Unaffordable';
  }

  return {
    qualifyingIncome: Math.round(qualifyingIncome),
    monthlyPayment: Math.round(monthlyPayment),
    affordabilityScore,
    status,
  };
}

// Price-to-Income Ratio
export function calculatePriceToIncomeRatio(
  medianHomePrice: number,
  medianIncome: number
): {
  ratio: number;
  status: 'Affordable' | 'Moderate' | 'High' | 'Severe';
} {
  const ratio = medianHomePrice / medianIncome;
  
  let status: 'Affordable' | 'Moderate' | 'High' | 'Severe';
  if (ratio <= 3) {
    status = 'Affordable';
  } else if (ratio <= 4) {
    status = 'Moderate';
  } else if (ratio <= 5) {
    status = 'High';
  } else {
    status = 'Severe';
  }

  return { ratio: Math.round(ratio * 10) / 10, status };
}

// Mortgage Payment as % of Income
export function calculatePaymentToIncome(
  monthlyPayment: number,
  monthlyIncome: number
): {
  percentage: number;
  status: 'Affordable' | 'Manageable' | 'Burden' | 'Severe Burden';
} {
  const percentage = (monthlyPayment / monthlyIncome) * 100;

  let status: 'Affordable' | 'Manageable' | 'Burden' | 'Severe Burden';
  if (percentage <= 20) {
    status = 'Affordable';
  } else if (percentage <= 30) {
    status = 'Manageable';
  } else if (percentage <= 40) {
    status = 'Burden';
  } else {
    status = 'Severe Burden';
  }

  return { percentage: Math.round(percentage * 10) / 10, status };
}

// Calculate Crash Risk Score
export function calculateCrashRisk(
  indicators: CrashIndicator[],
  metrics: HousingMetric
): {
  totalPoints: number;
  maxPoints: number;
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Critical';
  riskPercent: number;
  warnings: string[];
} {
  const maxPoints = indicators.reduce((sum, ind) => sum + ind.points, 0);
  const totalPoints = indicators.reduce((sum, ind) => sum + (ind.points || 0), 0);
  
  const riskPercent = (totalPoints / maxPoints) * 100;

  let riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High' | 'Critical';
  if (riskPercent < 20) {
    riskLevel = 'Low';
  } else if (riskPercent < 40) {
    riskLevel = 'Moderate';
  } else if (riskPercent < 60) {
    riskLevel = 'Elevated';
  } else if (riskPercent < 80) {
    riskLevel = 'High';
  } else {
    riskLevel = 'Critical';
  }

  // Generate warnings based on metrics
  const warnings: string[] = [];
  
  if (metrics.mortgage_rate > 7) {
    warnings.push('High mortgage rates reducing affordability');
  }
  if (metrics.affordability_index < 100) {
    warnings.push('Affordability index below sustainable level');
  }
  if (metrics.core_inflation > 4) {
    warnings.push('Elevated inflation threatening purchasing power');
  }

  return {
    totalPoints,
    maxPoints,
    riskLevel,
    riskPercent: Math.round(riskPercent),
    warnings,
  };
}

// Builder Cost Trend Analysis
export function analyzeBuilderCostTrend(
  currentPrice: number,
  startPrice: number,
  months: number
): {
  percentChange: number;
  annualizedChange: number;
  status: 'MAJOR Drop' | 'Drop' | 'Stable' | 'Rise' | 'MAJOR Rise';
} {
  const percentChange = ((currentPrice - startPrice) / startPrice) * 100;
  const annualizedChange = (percentChange / months) * 12;

  let status: 'MAJOR Drop' | 'Drop' | 'Stable' | 'Rise' | 'MAJOR Rise';
  if (annualizedChange <= -10) {
    status = 'MAJOR Drop';
  } else if (annualizedChange <= -5) {
    status = 'Drop';
  } else if (annualizedChange <= 5) {
    status = 'Stable';
  } else if (annualizedChange <= 10) {
    status = 'Rise';
  } else {
    status = 'MAJOR Rise';
  }

  return {
    percentChange: Math.round(percentChange * 10) / 10,
    annualizedChange: Math.round(annualizedChange * 10) / 10,
    status,
  };
}

// Household Expense Impact
export function calculateHouseholdExpenseImpact(
  expenses: { category: string; currentPrice: number; percentChange: number }[],
  income: number
): {
  totalMonthlyImpact: number;
  percentOfIncome: number;
  status: 'Sustainable' | 'Manageable' | 'Strained' | 'Crisis';
  biggestIncreases: { category: string; impact: number }[];
} {
  // Assume average monthly spending per category (simplified)
  const categoryWeights: Record<string, number> = {
    'Housing': 0.35,
    'Utilities': 0.08,
    'Food': 0.12,
    'Transportation': 0.15,
    'Healthcare': 0.08,
    'Other': 0.22,
  };

  let totalMonthlyImpact = 0;
  const impacts: { category: string; impact: number }[] = [];

  for (const expense of expenses) {
    const weight = categoryWeights[expense.category] || 0.1;
    const baseSpend = income * weight;
    const impact = baseSpend * (expense.percentChange / 100);
    totalMonthlyImpact += impact;
    impacts.push({ category: expense.category, impact });
  }

  const percentOfIncome = (totalMonthlyImpact / (income / 12)) * 100;

  let status: 'Sustainable' | 'Manageable' | 'Strained' | 'Crisis';
  if (percentOfIncome <= 2) {
    status = 'Sustainable';
  } else if (percentOfIncome <= 5) {
    status = 'Manageable';
  } else if (percentOfIncome <= 10) {
    status = 'Strained';
  } else {
    status = 'Crisis';
  }

  const biggestIncreases = impacts
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);

  return {
    totalMonthlyImpact: Math.round(totalMonthlyImpact),
    percentOfIncome: Math.round(percentOfIncome * 10) / 10,
    status,
    biggestIncreases,
  };
}

// Market Momentum Score
export function calculateMarketMomentum(
  currentMetrics: HousingMetric,
  previousMetrics: HousingMetric | null
): {
  priceMomentum: number;
  inventoryMomentum: number;
  rateMomentum: number;
  overall: 'Accelerating' | 'Growing' | 'Stable' | 'Slowing' | 'Contracting';
} {
  if (!previousMetrics) {
    return {
      priceMomentum: 0,
      inventoryMomentum: 0,
      rateMomentum: 0,
      overall: 'Stable',
    };
  }

  const priceMomentum = ((currentMetrics.median_home_value - previousMetrics.median_home_value) 
    / previousMetrics.median_home_value) * 100;
  
  const inventoryMomentum = currentMetrics.total_inventory - previousMetrics.total_inventory;
  
  const rateMomentum = currentMetrics.mortgage_rate - previousMetrics.mortgage_rate;

  // Determine overall momentum
  let overall: 'Accelerating' | 'Growing' | 'Stable' | 'Slowing' | 'Contracting';
  
  const score = priceMomentum - (rateMomentum * 2) + (inventoryMomentum > 0 ? -1 : 1);
  
  if (score > 2) {
    overall = 'Accelerating';
  } else if (score > 0.5) {
    overall = 'Growing';
  } else if (score > -0.5) {
    overall = 'Stable';
  } else if (score > -2) {
    overall = 'Slowing';
  } else {
    overall = 'Contracting';
  }

  return {
    priceMomentum: Math.round(priceMomentum * 10) / 10,
    inventoryMomentum,
    rateMomentum: Math.round(rateMomentum * 100) / 100,
    overall,
  };
}
