// FRED API Integration
// Documentation: https://fred.stlouisfed.org/docs/api/fred/

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// Key FRED Series IDs for Housing Data
export const FRED_SERIES = {
  // Home Prices
  MEDIAN_HOME_PRICE: 'MSPUS',                    // Median Sales Price of Houses Sold
  NEW_HOME_PRICE: 'MSPNHSUS',                    // Median Sales Price of New Houses Sold
  
  // Mortgage & Interest Rates
  MORTGAGE_RATE_30Y: 'MORTGAGE30US',             // 30-Year Fixed Rate Mortgage Average
  FED_FUNDS_RATE: 'FEDFUNDS',                    // Federal Funds Effective Rate
  TREASURY_10Y: 'GS10',                          // 10-Year Treasury Constant Maturity Rate
  
  // Inflation
  CORE_INFLATION: 'CORESTICKM159SFRBATL',        // Sticky Price Consumer Price Index
  CPI_HOUSING: 'CPIHOSNS',                       // CPI: Housing
  
  // Housing Supply & Construction
  HOUSING_INVENTORY: 'ACTLISCOU',                // Active Listing Count
  NEW_CONSTRUCTION_INVENTORY: 'NINVUSM156N',     // New Construction Inventory
  BUILDING_PERMITS: 'PERMIT',                    // New Private Housing Units Authorized
  HOUSING_STARTS: 'HOUST',                       // Housing Starts
  
  // Income & Employment
  MEDIAN_HOUSEHOLD_INCOME: 'MEHOINUSA672N',      // Real Median Household Income
  UNEMPLOYMENT_RATE: 'UNRATE',                   // Unemployment Rate
  
  // Affordability
  HOUSING_AFFORDABILITY: 'HAI',                  // Housing Affordability Index
  
  // Regional Data (by Census Region)
  MEDIAN_HOME_PRICE_NE: 'MEDLISPRIENT',         // Northeast
  MEDIAN_HOME_PRICE_MW: 'MEDLISPRIMWST',        // Midwest
  MEDIAN_HOME_PRICE_SO: 'MEDLISPRISOU',          // South
  MEDIAN_HOME_PRICE_WE: 'MEDLISPRIWST',          // West
} as const;

export interface FREDDataPoint {
  date: string;
  value: number;
}

export interface FREDResponse {
  series: {
    id: string;
    title: string;
    units: string;
    frequency: string;
    observations: Array<{
      date: string;
      value: string;
    }>;
  };
}

async function fetchFRED(seriesId: string, startDate?: string, endDate?: string): Promise<FREDDataPoint[]> {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: FRED_API_KEY || '',
    file_type: 'json',
    sort_order: 'asc',
  });
  
  if (startDate) params.append('observation_start', startDate);
  if (endDate) params.append('observation_end', endDate);
  
  const url = `${FRED_BASE_URL}/series/observations?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`FRED API error: ${response.status}`);
    
    const data: FREDResponse = await response.json();
    
    return data.series.observations
      .filter(obs => obs.value !== '.' && !isNaN(parseFloat(obs.value)))
      .map(obs => ({
        date: obs.date,
        value: parseFloat(obs.value),
      }));
  } catch (error) {
    console.error(`Error fetching ${seriesId}:`, error);
    return [];
  }
}

// Fetch all key housing metrics
export async function fetchAllHousingMetrics(startDate?: string, endDate?: string) {
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
export async function fetchRegionalData(startDate?: string, endDate?: string) {
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
export function calculateAffordabilityMetrics(
  homePrice: number,
  mortgageRate: number,
  householdIncome: number,
  downPaymentPercent: number = 10
): {
  monthlyPayment: number;
  qualifyingIncome: number;
  affordabilityScore: number;
} {
  const loanAmount = homePrice * (1 - downPaymentPercent / 100);
  const monthlyRate = mortgageRate / 100 / 12;
  const numPayments = 30 * 12; // 30-year mortgage
  
  // Monthly mortgage payment (P&I + estimated taxes/insurance)
  const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
  const monthlyTI = 400; // Estimated taxes and insurance
  const monthlyPayment = monthlyPI + monthlyTI;
  
  // Qualifying income (typically monthly payment shouldn't exceed 28% of gross income)
  const qualifyingIncome = (monthlyPayment / 0.28) * 12;
  
  // Affordability score (100 = perfectly affordable, <100 = less affordable)
  const affordabilityScore = (householdIncome / qualifyingIncome) * 100;
  
  return {
    monthlyPayment,
    qualifyingIncome,
    affordabilityScore,
  };
}
