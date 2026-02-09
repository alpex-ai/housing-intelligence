const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lmmpvvtkzlnblvlflhpk.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedMetroData() {
  console.log('Reading Zillow metro data...');
  
  const csvPath = path.join(__dirname, 'Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    process.exit(1);
  }
  
  const csv = require('csv-parse/sync');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = csv.parse(fileContent, { columns: true, skip_empty_lines: true });
  
  console.log(`Found ${records.length} metro areas`);
  
  const dateColumns = Object.keys(records[0]).filter(key => /^\d{4}-\d{2}-\d{2}$/.test(key));
  console.log(`Date range: ${dateColumns[0]} to ${dateColumns[dateColumns.length - 1]}`);
  
  let totalInserted = 0;
  const batchSize = 500;
  
  for (let r = 0; r < records.length; r++) {
    const record = records[r];
    const regionId = parseInt(record.RegionID);
    const sizeRank = parseInt(record.SizeRank) || null;
    const regionName = record.RegionName;
    const regionType = record.RegionType;
    const stateName = record.StateName || null;
    
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
    
    try {
      const { error } = await supabase
        .from('metro_zhvi')
        .upsert(entries, { onConflict: 'region_id,date' });
      
      if (error) {
        console.error(`Error inserting ${regionName}:`, error.message);
      } else {
        totalInserted += entries.length;
      }
    } catch (err) {
      console.error(`Exception for ${regionName}:`, err.message);
    }
    
    if ((r + 1) % 100 === 0) {
      console.log(`Processed ${r + 1}/${records.length} metros, ${totalInserted} total records`);
    }
  }
  
  console.log(`\n✅ Seeding complete! Total records: ${totalInserted}`);
}

seedMetroData().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
