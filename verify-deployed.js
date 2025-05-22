// Enhanced verification script for Vercel deployment
import fetch from 'node-fetch';
import { setTimeout } from 'timers/promises';

// Get command line arguments
const args = process.argv.slice(2);
const isVercel = args.includes('--vercel');
const verbose = args.includes('--verbose');
const targetUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 
  (isVercel ? process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://serene-flow-spa-suite.vercel.app' : 'http://localhost:5173');

console.log(`🔍 Verifying deployment at: ${targetUrl}`);
console.log(`📋 Environment: ${isVercel ? 'Vercel' : 'Local'}`);

async function checkEndpoint(endpoint, name, expectedStatus = 200) {
  const url = `${targetUrl}${endpoint}`;
  try {
    console.log(`🔄 Checking ${name}...`);
    const startTime = Date.now();
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const endTime = Date.now();
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: OK (${endTime - startTime}ms)`);
      if (verbose) {
        try {
          const data = await response.json();
          console.log(JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('Response is not JSON');
        }
      }
      return true;
    } else {
      console.error(`❌ ${name}: Failed with status ${response.status}`);
      if (verbose) {
        try {
          const text = await response.text();
          console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
        } catch (e) {
          console.log('Could not read response');
        }
      }
      return false;
    }
  } catch (error) {
    console.error(`❌ ${name}: Error - ${error.message}`);
    return false;
  }
}

async function runVerification() {
  console.log('\n🚀 Starting verification...\n');
  
  // Wait a moment to ensure deployment is ready
  if (isVercel) {
    console.log('⏳ Waiting for Vercel deployment to stabilize...');
    await setTimeout(3000);
  }
  
  // Check main HTML
  let mainHtml = await checkEndpoint('/', 'Main HTML page');
  
  // Check API endpoints with retries
  let apiSuccess = false;
  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      console.log(`⏳ Retrying API check (attempt ${i+1}/3)...`);
      await setTimeout(2000);
    }
    
    // Try both environment endpoints
    const environmentCheck = await checkEndpoint('/api/environment', 'API Environment') || 
                            await checkEndpoint('/environment', 'API Environment (alt path)');
    
    if (environmentCheck) {
      apiSuccess = true;
      break;
    }
  }
  
  // Check health endpoint
  const healthCheck = await checkEndpoint('/api/health', 'API Health');
  
  // Summary
  console.log('\n📊 Verification Summary:');
  console.log(`🌐 Frontend: ${mainHtml ? '✅ Working' : '❌ Issues detected'}`);
  console.log(`🔌 API: ${apiSuccess ? '✅ Working' : '❌ Issues detected'}`);
  console.log(`🩺 Health: ${healthCheck ? '✅ Working' : '❌ Issues detected'}`);
  
  // Overall result
  const overallSuccess = mainHtml && apiSuccess;
  console.log(`\n${overallSuccess ? '✅ DEPLOYMENT VERIFIED' : '⚠️ VERIFICATION FAILED'}`);
  console.log(`🔗 URL: ${targetUrl}`);
  
  return overallSuccess ? 0 : 1;
}

// Run the verification
runVerification()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Verification script error:', error);
    process.exit(1);
  });
