import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmmpvvtkzlnblvlflhpk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedMetroData() {
  console.log('Starting Zillow data seed...');
  
  const csvPath = './scripts/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath);
    process.exit(1);
  }
  
  console.log('Reading CSV...');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });
  
  console.log(`Found ${records.length} metro areas`);
  
  // Get date columns (format: YYYY-MM-DD)
  const dateColumns = Object.keys(records[0]).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));
  console.log(`Date range: ${dateColumns[0]} to ${dateColumns[dateColumns.length - 1]}`);
  
  // Process each metro
  let totalInserted = 0;
  const batchSize = 1000;
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const regionId = parseInt(record.RegionID);
    const sizeRank = parseInt(record.SizeRank) || null;
    const regionName = record.RegionName;
    const regionType = record.RegionType;
    const stateName = record.StateName || null;
    
    // Create entries for each date
    const entries = [];
    for (const date of dateColumns) {
      if (record[date] && record[date] !== '') {
        entries.push({
          region_id: regionId,
          size_rank: sizeRank,
          region_name: regionName,
          region_type: regionType,
          state_name: stateName,
          date: date,
          home_value: parseFloat(record[date])
        });
      }
    }
    
    if (entries.length === 0) continue;
    
    // Insert in batches
    for (let j = 0; j < entries.length; j += batchSize) {
      const batch = entries.slice(j, j + batchSize);
      
      const { error } = await supabase
        .from('metro_zhvi')
        .upsert(batch, { onConflict: 'region_id,date' });
      
      if (error) {
        console.error(`Error inserting ${regionName}:`, error.message);
      } else {
        totalInserted += batch.length;
      }
    }
    
    if ((i + 1) % 50 === 0) {
      console.log(`Processed ${i + 1}/${records.length} metros, ${totalInserted} total records`);
    }
  }
  
  console.log(`\n✅ Seeding complete! Total records: ${totalInserted}`);
}

seedMetroData().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
