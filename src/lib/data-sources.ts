// Comprehensive data sources for housing intelligence

export const DATA_SOURCES = {
  // FRED Series IDs
  fred: {
    // Core Housing Metrics
    MEDIAN_HOME_PRICE: 'MSPUS',
    MEDIAN_NEW_HOME_PRICE: 'MSPNHSUS',
    MORTGAGE_RATE_30Y: 'MORTGAGE30US',
    MORTGAGE_RATE_15Y: 'MORTGAGE15US',
    FED_FUNDS_RATE: 'FEDFUNDS',
    TREASURY_10Y: 'GS10',
    TREASURY_2Y: 'GS2',
    
    // Inflation & Economy
    CPI_ALL: 'CPIAUCSL',
    CORE_INFLATION: 'CPILFESL',
    PCE_PRICE_INDEX: 'PCEPI',
    
    // Housing Supply
    HOUSING_STARTS: 'HOUST',
    HOUSING_COMPLETIONS: 'COMPUTSA',
    BUILDING_PERMITS: 'PERMIT',
    NEW_HOME_SALES: 'HSN1F',
    EXISTING_HOME_SALES: 'EXHOSLUSM495S',
    HOMEOWNERSHIP_RATE: 'RSAHORUSQ156S',
    
    // Affordability
    AFFORDABILITY_INDEX: 'FIXHAI',
    MEDIAN_HOUSEHOLD_INCOME: 'MEHOINUSA672N',
    REAL_MEDIAN_HOUSEHOLD_INCOME: 'MEHOINUSA672N',
    
    // Regional Prices
    MEDIAN_HOME_PRICE_NORTHEAST: 'MEDDAYONAA',
    MEDIAN_HOME_PRICE_MIDWEST: 'MEDDAYONAM',
    MEDIAN_HOME_PRICE_SOUTH: 'MEDDAYONAS',
    MEDIAN_HOME_PRICE_WEST: 'MEDDAYONAW',
    
    // Risk Indicators
    MORTGAGE_DELINQUENCY: 'DRSFRMACBS',
    CREDIT_STANDARDS: 'DRTSCILM',
    HOME_PRICE_INDEX: 'CSUSHPISA',
  },
  
  // BLS CPI Categories for Household Expenses
  bls: {
    CPI_ALL_ITEMS: 'CUUR0000SA0',
    CPI_FOOD: 'CUUR0000SAF',
    CPI_FOOD_AT_HOME: 'CUUR0000SAF11',
    CPI_FOOD_AWAY: 'CUUR0000SEFV',
    CPI_HOUSING: 'CUUR0000SAH',
    CPI_RENT: 'CUUR0000SEHA',
    CPI_OWNERS_EQUIVALENT_RENT: 'CUUR0000SEHC',
    CPI_UTILITIES: 'CUUR0000SAH21',
    CPI_ELECTRICITY: 'APU000072610',
    CPI_NATURAL_GAS: 'APU000072610',
    CPI_TRANSPORTATION: 'CUUR0000SAT',
    CPI_GASOLINE: 'CUUR0000SETB01',
    CPI_VEHICLES: 'CUUR0000SETA01',
    CPI_MEDICAL: 'CUUR0000SAM',
    CPI_HEALTH_INSURANCE: 'CUUR0000SEMC',
    CPI_EDUCATION: 'CUUR0000SAE',
    CPI_ENTERTAINMENT: 'CUUR0000SAR',
    CPI_APPAREL: 'CUUR0000SAA',
  },
  
  // Builder Cost Categories (BLS PPI)
  builderCosts: {
    LUMBER: 'WPU081',
    STEEL: 'WPU101',
    COPPER: 'WPU102105',
    ALUMINUM: 'WPU1023',
    CEMENT: 'WPU1322',
    CONCRETE: 'WPU1333',
    GYPSUM: 'WPU1362',
    INSULATION: 'WPU1364',
    WINDOWS: 'WPU1371',
    PLUMBING: 'WPU1374',
    ELECTRICAL: 'WPU1382',
    HVAC: 'WPU1383',
    PAINT: 'WPU141',
    FLOORING: 'WPU142',
    ROOFING: 'WPU143',
    CONSTRUCTION_LABOR: 'PCU236220236220',
  }
};

// Material categories for builder expenses
export const BUILDER_MATERIALS = [
  { id: 'lumber', name: 'Lumber & Wood Products', series: 'WPU081', unit: 'Index' },
  { id: 'steel', name: 'Steel Mill Products', series: 'WPU101', unit: 'Index' },
  { id: 'copper', name: 'Copper & Brass', series: 'WPU102105', unit: 'Index' },
  { id: 'aluminum', name: 'Aluminum Mill Shapes', series: 'WPU1023', unit: 'Index' },
  { id: 'cement', name: 'Cement', series: 'WPU1322', unit: 'Index' },
  { id: 'concrete', name: 'Concrete Products', series: 'WPU1333', unit: 'Index' },
  { id: 'gypsum', name: 'Gypsum Products', series: 'WPU1362', unit: 'Index' },
  { id: 'insulation', name: 'Insulation Materials', series: 'WPU1364', unit: 'Index' },
  { id: 'windows', name: 'Windows & Doors', series: 'WPU1371', unit: 'Index' },
  { id: 'plumbing', name: 'Plumbing Fixtures', series: 'WPU1374', unit: 'Index' },
  { id: 'electrical', name: 'Electrical Equipment', series: 'WPU1382', unit: 'Index' },
  { id: 'hvac', name: 'HVAC Equipment', series: 'WPU1383', unit: 'Index' },
  { id: 'paint', name: 'Paint & Coatings', series: 'WPU141', unit: 'Index' },
  { id: 'flooring', name: 'Flooring Materials', series: 'WPU142', unit: 'Index' },
  { id: 'roofing', name: 'Roofing Materials', series: 'WPU143', unit: 'Index' },
];

// Household expense categories
export const HOUSEHOLD_CATEGORIES = {
  housing: [
    { item: 'Rent', cpiCode: 'CUUR0000SEHA' },
    { item: 'Owners Equivalent Rent', cpiCode: 'CUUR0000SEHC' },
    { item: 'Household Insurance', cpiCode: 'CUUR0000SEMC' },
    { item: 'Property Tax', cpiCode: 'CUUR0000SEHB' },
    { item: 'Maintenance & Repairs', cpiCode: 'CUUR0000SEHG01' },
  ],
  utilities: [
    { item: 'Electricity', cpiCode: 'APU000072610' },
    { item: 'Natural Gas', cpiCode: 'APU000072610' },
    { item: 'Water & Sewer', cpiCode: 'CUUR0000SEHB02' },
    { item: 'Trash Collection', cpiCode: 'CUUR0000SEHB03' },
    { item: 'Phone Service', cpiCode: 'CUUR0000SERAC' },
    { item: 'Internet', cpiCode: 'CUUR0000SERAC01' },
  ],
  food: [
    { item: 'Cereals & Bakery', cpiCode: 'CUUR0000SAF111' },
    { item: 'Meats', cpiCode: 'CUUR0000SAF112' },
    { item: 'Dairy', cpiCode: 'CUUR0000SAF113' },
    { item: 'Fruits & Vegetables', cpiCode: 'CUUR0000SAF114' },
    { item: 'Nonalcoholic Beverages', cpiCode: 'CUUR0000SAF115' },
    { item: 'Other Food at Home', cpiCode: 'CUUR0000SAF116' },
    { item: 'Food Away from Home', cpiCode: 'CUUR0000SEFV' },
  ],
  transportation: [
    { item: 'Gasoline', cpiCode: 'CUUR0000SETB01' },
    { item: 'New Vehicles', cpiCode: 'CUUR0000SETA01' },
    { item: 'Used Vehicles', cpiCode: 'CUUR0000SETA02' },
    { item: 'Vehicle Insurance', cpiCode: 'CUUR0000SETD' },
    { item: 'Maintenance & Repairs', cpiCode: 'CUUR0000SETC' },
    { item: 'Public Transportation', cpiCode: 'CUUR0000SETG' },
  ],
  healthcare: [
    { item: 'Medical Care', cpiCode: 'CUUR0000SAM' },
    { item: 'Prescription Drugs', cpiCode: 'CUUR0000SAM002' },
    { item: 'Health Insurance', cpiCode: 'CUUR0000SEMC01' },
    { item: 'Hospital Services', cpiCode: 'CUUR0000SAM003' },
    { item: 'Physician Services', cpiCode: 'CUUR0000SAM001' },
  ],
  other: [
    { item: 'Apparel', cpiCode: 'CUUR0000SAA' },
    { item: 'Education', cpiCode: 'CUUR0000SAE' },
    { item: 'Entertainment', cpiCode: 'CUUR0000SAR' },
    { item: 'Personal Care', cpiCode: 'CUUR0000SEMC02' },
    { item: 'Household Furnishings', cpiCode: 'CUUR0000SAH3' },
  ],
};

// Crash indicator variables and thresholds
export const CRASH_INDICATORS = [
  {
    variable: 'Mortgage Rate Spike',
    category: 'Critical',
    threshold: 1.5, // 1.5% increase in 6 months
    points: 15,
    fredSeries: 'MORTGAGE30US',
  },
  {
    variable: 'Price-to-Income Ratio',
    category: 'Critical',
    threshold: 5.5, // Median home price / median income
    points: 12,
    fredSeries: null, // Calculated
  },
  {
    variable: 'Inventory Buildup',
    category: 'Major',
    threshold: 6, // Months of supply > 6
    points: 10,
    fredSeries: 'ACTLISCOU',
  },
  {
    variable: 'Mortgage Delinquency',
    category: 'Major',
    threshold: 3.0, // > 3% delinquency rate
    points: 10,
    fredSeries: 'DRSFRMACBS',
  },
  {
    variable: 'Credit Standards',
    category: 'Major',
    threshold: 0, // Tightening standards
    points: 8,
    fredSeries: 'DRTSCILM',
  },
  {
    variable: 'New Home Sales Drop',
    category: 'Major',
    threshold: -20, // > 20% YoY decline
    points: 8,
    fredSeries: 'HSN1F',
  },
  {
    variable: 'Construction Layoffs',
    category: 'Minor',
    threshold: -5, // > 5% decline in construction employment
    points: 5,
    fredSeries: 'USPBS',
  },
  {
    variable: 'Affordability Index',
    category: 'Minor',
    threshold: 100, // Below 100
    points: 5,
    fredSeries: 'FIXHAI',
  },
];

// Regional definitions
export const REGIONS = [
  { name: 'Northeast', states: ['CT', 'MA', 'ME', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT'] },
  { name: 'Midwest', states: ['IA', 'IL', 'IN', 'KS', 'MI', 'MN', 'MO', 'ND', 'NE', 'OH', 'SD', 'WI'] },
  { name: 'South', states: ['AL', 'AR', 'DE', 'FL', 'GA', 'KY', 'LA', 'MD', 'MS', 'NC', 'OK', 'SC', 'TN', 'TX', 'VA', 'WV', 'DC'] },
  { name: 'West', states: ['AK', 'AZ', 'CA', 'CO', 'HI', 'ID', 'MT', 'NM', 'NV', 'OR', 'UT', 'WA', 'WY'] },
];
