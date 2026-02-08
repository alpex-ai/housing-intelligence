// Fix deployment - use simpler approach
const { execSync } = require('child_process');

const VERCEL_TOKEN = 'PnCmukTR7g3zOQEcP2NKEkkj';

console.log('🚀 Deploying to Vercel...\n');

try {
  // Simple approach using curl without gitSource
  const result = execSync(`curl -s -X POST "https://api.vercel.com/v13/deployments" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"name":"housing-intelligence","project":"housing-intelligence","target":"production"}'`, { encoding: 'utf8', timeout: 30000 });
  
  console.log('Response:', result);
  
  const data = JSON.parse(result);
  if (data.id) {
    console.log(`✅ Deployment triggered: ${data.id}`);
    console.log(`🌐 URL: https://${data.url}`);
  } else if (data.error) {
    console.log(`❌ Error: ${data.error.message}`);
    console.log('\nTrying alternative approach...\n');
    
    // Try with teamId
    const result2 = execSync(`curl -s -X POST "https://api.vercel.com/v13/deployments?teamId=alpex-ai" \
      -H "Authorization: Bearer ${VERCEL_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{"name":"housing-intelligence","project":"housing-intelligence","target":"production"}'`, { encoding: 'utf8', timeout: 30000 });
    
    console.log('Response:', result2);
  }
} catch (e) {
  console.log('❌ Error:', e.message);
}
