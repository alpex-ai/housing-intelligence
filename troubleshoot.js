// Debug and Fix Script for Alpex Housing Intelligence

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const VERCEL_TOKEN = 'PnCmukTR7g3zOQEcP2NKEkkj';
const PROJECT_ID = 'housing-intelligence';
const TEAM_ID = 'alpex-ai';
const SUPABASE_URL = 'https://lmmpvvtkzlnblvlflhpk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbXB2dnRremxuYmx2bGZsaHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc1MDYwNiwiZXhwIjoyMDg1MzI2NjA2fQ.BlomgWsoVJXsxfF713kO3jTlBXmJnvWZv6EX3ial0FM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkVercelDeployment() {
  console.log('\n🔍 Checking Vercel Deployment Status...\n');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: `/v6/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}&limit=3`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.deployments && parsed.deployments.length > 0) {
            const latest = parsed.deployments[0];
            console.log(`  📦 Deployment ID: ${latest.id}`);
            console.log(`  🌐 URL: ${latest.url}`);
            console.log(`  📊 State: ${latest.state}`);
            console.log(`  🎯 Target: ${latest.target}`);
            console.log(`  ⏰ Created: ${latest.created}`);
            
            if (latest.error) {
              console.log(`  ❌ Error: ${latest.error.message}`);
            }
            
            resolve(latest);
          } else {
            console.log('  ⚠️  No deployments found');
            resolve(null);
          }
        } catch (e) {
          console.log('  ❌ Error parsing response:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('  ❌ Request error:', e.message);
      resolve(null);
    });

    req.end();
  });
}

async function checkDatabase() {
  console.log('\n🗄️  Checking Database Tables...\n');
  
  const tables = ['housing_metrics', 'regional_affordability', 'builder_expenses', 
                  'household_expenses', 'crash_indicators', 'economic_index'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: ${data.length} rows`);
      }
    } catch (e) {
      console.log(`  ❌ ${table}: ${e.message}`);
    }
  }
}

async function testFREDAPI() {
  console.log('\n📡 Testing FRED API...\n');
  
  const FRED_API_KEY = '4bf29c1eba04aa0ca396ea6653ea0199';
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.stlouisfed.org',
      path: `/fred/series/observations?series_id=MORTGAGE30US&api_key=${FRED_API_KEY}&file_type=json&limit=1`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.observations && parsed.observations.length > 0) {
            console.log('  ✅ FRED API working');
            console.log(`  📊 Latest mortgage rate: ${parsed.observations[0].value}%`);
            resolve(true);
          } else {
            console.log('  ⚠️  FRED API returned no data');
            resolve(false);
          }
        } catch (e) {
          console.log('  ❌ FRED API error:', e.message);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log('  ❌ FRED API request failed:', e.message);
      resolve(false);
    });

    req.end();
  });
}

async function fixDeployment() {
  console.log('\n🚀 Triggering New Deployment...\n');
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      name: PROJECT_ID,
      project: PROJECT_ID,
      target: 'production',
      gitSource: {
        type: 'github',
        repo: 'alpex-ai/housing-intelligence',
        ref: 'main'
      }
    });

    const options = {
      hostname: 'api.vercel.com',
      path: '/v13/deployments',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.id) {
            console.log(`  ✅ New deployment triggered: ${parsed.id}`);
            console.log(`  🌐 URL: ${parsed.url}`);
            resolve(parsed);
          } else if (parsed.error) {
            console.log(`  ❌ Error: ${parsed.error.message}`);
            resolve(null);
          } else {
            console.log('  ⚠️  Unexpected response');
            resolve(null);
          }
        } catch (e) {
          console.log('  ❌ Error parsing response:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log('  ❌ Request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🔧 Alpex Housing Intelligence - Troubleshooting\n');
  console.log('================================================\n');
  
  // Check current deployment
  const deployment = await checkVercelDeployment();
  
  // Check database
  await checkDatabase();
  
  // Test FRED API
  const fredWorking = await testFREDAPI();
  
  // Summary
  console.log('\n📋 Summary\n');
  console.log('==========\n');
  
  if (!deployment || deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
    console.log('❌ Deployment issue detected');
    console.log('   Triggering new deployment...\n');
    await fixDeployment();
  } else if (deployment.state === 'READY') {
    console.log('✅ Deployment is ready');
    console.log(`   URL: https://${deployment.url}\n`);
  } else {
    console.log(`⏳ Deployment is ${deployment.state}`);
    console.log('   Check again in 2-3 minutes\n');
  }
  
  if (fredWorking) {
    console.log('✅ FRED API is working');
    console.log('   Run: npm run sync-data\n');
  }
  
  console.log('🎯 Next Steps:\n');
  console.log('1. Check deployment status above');
  console.log('2. If deployment shows ERROR, run: vercel --prod');
  console.log('3. Once deployed, run: npm run sync-data');
  console.log('4. Visit: https://housing-intelligence.vercel.app\n');
}

main().catch(console.error);
