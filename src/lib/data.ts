import { supabase } from './supabase';
import { HousingMetric, RegionalAffordability, BuilderExpense, HouseholdExpense, CrashIndicator, EconomicIndex } from './types';

export async function getLatestHousingMetrics(): Promise<HousingMetric | null> {
  const { data, error } = await supabase
    .from('housing_metrics')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching housing metrics:', error);
    return null;
  }
  
  return data;
}

export async function getHousingMetricsHistory(limit: number = 24): Promise<HousingMetric[]> {
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
}

export async function getRegionalAffordability(date?: string): Promise<RegionalAffordability[]> {
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
  
  return data || [];
}

export async function getBuilderExpenses(date?: string): Promise<BuilderExpense[]> {
  let query = supabase
    .from('builder_expenses')
    .select('*');
  
  if (date) {
    query = query.eq('date', date);
  } else {
    query = query.order('date', { ascending: false }).limit(10);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching builder expenses:', error);
    return [];
  }
  
  return data || [];
}

export async function getHouseholdExpenses(date?: string): Promise<HouseholdExpense[]> {
  let query = supabase
    .from('household_expenses')
    .select('*');
  
  if (date) {
    query = query.eq('date', date);
  } else {
    query = query.order('date', { ascending: false }).limit(30);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching household expenses:', error);
    return [];
  }
  
  return data || [];
}

export async function getCrashIndicators(date?: string): Promise<CrashIndicator[]> {
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
    return [];
  }
  
  return data || [];
}

export async function getEconomicIndexHistory(limit: number = 24): Promise<EconomicIndex[]> {
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
}

// Calculate Housing Health Index (custom formula based on the spreadsheet)
export function calculateHousingHealthIndex(metrics: HousingMetric): number {
  // This is a simplified version - the actual spreadsheet has a weighted formula
  // based on supply, affordability, and crash likelihood scores
  const affordabilityWeight = 0.4;
  const supplyWeight = 0.3;
  const crashRiskWeight = 0.3;
  
  // Normalize affordability index (100 = baseline)
  const affordabilityScore = Math.min(100, (metrics.affordability_index / 125) * 100);
  
  // Supply score based on inventory (higher is better, up to a point)
  const inventoryScore = Math.min(100, (metrics.total_inventory / 1500000) * 100);
  
  // Crash risk based on mortgage rate (lower is less risk) and delinquencies
  const crashScore = Math.max(0, 100 - (metrics.mortgage_rate * 10));
  
  return Math.round(
    affordabilityScore * affordabilityWeight +
    inventoryScore * supplyWeight +
    crashScore * crashRiskWeight
  );
}
