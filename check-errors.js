// Check Vercel deployment errors
const https = require('https');

const VERCEL_TOKEN = 'PnCmukTR7g3zOQEcP2NKEkkj';

const options = {
  hostname: 'api.vercel.com',
  path: '/v6/deployments?projectId=housing-intelligence&teamId=alpex-ai&limit=1',
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
      if (parsed.deployments && parsed.deployments[0]) {
        const deploy = parsed.deployments[0];
        console.log('Deployment ID:', deploy.id);
        console.log('State:', deploy.state);
        console.log('URL:', deploy.url);
        console.log('Created:', deploy.created);
        
        if (deploy.error) {
          console.log('\n❌ Error:', deploy.error.message);
          console.log('Code:', deploy.error.code);
        }
        
        // Get build logs
        if (deploy.state === 'ERROR') {
          getBuildLogs(deploy.id);
        }
      }
    } catch (e) {
      console.log('Error:', e.message);
      console.log('Raw:', data);
    }
  });
});

req.on('error', (e) => console.log('Request error:', e.message));
req.end();

function getBuildLogs(deploymentId) {
  console.log('\n📋 Fetching build logs...\n');
  
  const logOptions = {
    hostname: 'api.vercel.com',
    path: `/v2/deployments/${deploymentId}/events`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`
    }
  };
  
  const logReq = https.request(logOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.events) {
          parsed.events.slice(-10).forEach(event => {
            if (event.text) console.log(event.text);
          });
        }
      } catch (e) {
        console.log('Could not parse logs:', e.message);
      }
    });
  });
  
  logReq.on('error', (e) => console.log('Log request error:', e.message));
  logReq.end();
}
