import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface ZillowRow {
  RegionID: string;
  SizeRank: string;
  RegionName: string;
  RegionType: string;
  StateName: string;
  [key: string]: string; // dynamic date columns
}

async function seedMetroData() {
  console.log('Reading Zillow metro data...');
  
  const csvPath = path.join(process.cwd(), 'data', 'zillow_metro_zhvi.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found. Download it from:');
    console.error('https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv');
    process.exit(1);
  }
  
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }) as ZillowRow[];
  
  console.log(`Found ${records.length} metro areas`);
  
  // Get date columns (everything after StateName)
  const dateColumns = Object.keys(records[0]).filter(key => 
    key.match(/^\d{4}-\d{2}-\d{2}$/)
  ).sort();
  
  console.log(`Date range: ${dateColumns[0]} to ${dateColumns[dateColumns.length - 1]}`);
  
  // Process in batches
  const batchSize = 500;
  let totalInserted = 0;
  
  for (const record of records) {
    const regionId = parseInt(record.RegionID);
    const sizeRank = parseInt(record.SizeRank) || null;
    const regionName = record.RegionName;
    const regionType = record.RegionType;
    const stateName = record.StateName || null;
    
    // Create entries for each date
    const entries = dateColumns
      .filter(date => record[date] && record[date] !== '')
      .map(date => ({
        region_id: regionId,
        size_rank: sizeRank,
        region_name: regionName,
        region_type: regionType,
        state_name: stateName,
        date: date,
        home_value: parseFloat(record[date])
      }));
    
    if (entries.length === 0) continue;
    
    // Insert in batches
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('metro_zhvi')
        .upsert(batch, {
          onConflict: 'region_id,date',
          ignoreDuplicates: true
        });
      
      if (error) {
        console.error(`Error inserting ${regionName}:`, error);
      } else {
        totalInserted += batch.length;
      }
    }
    
    console.log(`Inserted ${entries.length} records for ${regionName}`);
  }
  
  console.log(`\nTotal records inserted: ${totalInserted}`);
}

seedMetroData().catch(console.error);
