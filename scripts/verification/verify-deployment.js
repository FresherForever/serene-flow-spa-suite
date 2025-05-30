// Environment Verification Script for Serene Flow Spa Suite
// This script checks if the application is running correctly 
// in both local and Vercel environments

// Import required libraries
import fetch from 'node-fetch';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the environment type from command line arguments
const args = process.argv.slice(2);
const isVercel = args.includes('--vercel');

// Determine frontend port from environment or fallback
const frontendPort = process.env.VITE_PORT || process.env.FRONTEND_PORT || '5173';
const baseUrl = isVercel 
  ? (process.env.VERCEL_URL || 'https://your-vercel-app-url.vercel.app') 
  : `http://localhost:${frontendPort}`;
const apiBaseUrl = isVercel 
  ? `${baseUrl}/api` 
  : 'http://localhost:5000/api';

console.log(chalk.blue('='.repeat(50)));
console.log(chalk.blue(`Verification for ${chalk.yellow(isVercel ? 'Vercel Deployment' : 'Localhost')}`));
console.log(chalk.blue('='.repeat(50)));
if (!isVercel) {
  console.log(chalk.cyan(`Frontend verification will use port: ${frontendPort}`));
}

// Helper to find the first open frontend port
async function findFrontendPort() {
  const portsToTry = [3000];
  for (let port = 5173; port <= 5199; port++) portsToTry.push(port);
  for (const port of portsToTry) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.ok) return port;
    } catch (e) {
      // Ignore connection errors
    }
  }
  return null;
}

// Function to verify the API endpoints
async function verifyApi() {
  console.log(chalk.cyan('\n◆ API Verification:'));
  
  try {
    // Test API health endpoint
    console.log('  Testing API health endpoint...');
    const healthResponse = await fetch(`${apiBaseUrl}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log(chalk.green('  ✓ API health check passed'));
      console.log(`    Status: ${healthData.status}`);
      console.log(`    Environment: ${healthData.environment || 'not specified'}`);
    } else {
      console.log(chalk.red('  ✗ API health check failed'));
      console.log(chalk.red(`    Status: ${healthResponse.status}`));
      console.log(chalk.red(`    Message: ${healthData.message || 'No message'}`));
    }

    // Test services endpoint
    console.log('\n  Testing services endpoint...');
    const servicesResponse = await fetch(`${apiBaseUrl}/services`);
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      console.log(chalk.green('  ✓ Services endpoint working'));
      console.log(`    Retrieved ${servicesData.length || 0} services`);
    } else {
      console.log(chalk.red('  ✗ Services endpoint failed'));
      console.log(chalk.red(`    Status: ${servicesResponse.status}`));
    }

    // Test Vercel-specific test endpoint if in Vercel environment
    if (isVercel) {
      console.log('\n  Testing Vercel test endpoint...');
      const testResponse = await fetch(`${apiBaseUrl}/test`);
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log(chalk.green('  ✓ Vercel test endpoint working'));
        console.log(`    Node.js Version: ${testData.nodejs || 'unknown'}`);
        console.log(`    Database: ${testData.database || 'unknown'}`);
      } else {
        console.log(chalk.red('  ✗ Vercel test endpoint failed'));
        console.log(chalk.red(`    Status: ${testResponse.status}`));
      }
    }

  } catch (error) {
    console.log(chalk.red(`  ✗ API verification failed: ${error.message}`));
    console.log(chalk.yellow('    • Check if the API server is running'));
    console.log(chalk.yellow('    • Verify that CORS is properly configured'));
    console.log(chalk.yellow('    • Check network connectivity'));
  }
}

// Function to verify the frontend
async function verifyFrontend(url = baseUrl) {
  console.log(chalk.cyan('\n◆ Frontend Verification:'));
  try {
    console.log('  Checking frontend accessibility...');
    const response = await fetch(url);
    if (response.ok) {
      console.log(chalk.green('  ✓ Frontend is accessible'));
      console.log(`    Status: ${response.status}`);
    } else {
      console.log(chalk.red('  ✗ Frontend is not accessible'));
      console.log(chalk.red(`    Status: ${response.status}`));
    }
  } catch (error) {
    console.log(chalk.red(`  ✗ Frontend verification failed: ${error.message}`));
    console.log(chalk.yellow('    • Check if the frontend server is running'));
    console.log(chalk.yellow('    • Verify the URL is correct'));
    console.log(chalk.yellow('    • Check network connectivity'));
  }
}

// Function to print system information
function printSystemInfo() {
  console.log(chalk.cyan('\n◆ System Information:'));
  console.log(`  • Base URL: ${chalk.yellow(baseUrl)}`);
  console.log(`  • API URL: ${chalk.yellow(apiBaseUrl)}`);
  console.log(`  • Environment: ${chalk.yellow(isVercel ? 'Vercel' : 'Local')}`);
  console.log(`  • Node.js Version: ${chalk.yellow(process.version)}`);
}

// Main verification process
async function runVerification() {
  printSystemInfo();
  await verifyApi();

  // Auto-detect frontend port if not Vercel
  let frontendUrl = baseUrl;
  if (!isVercel) {
    const detectedPort = await findFrontendPort();
    if (detectedPort && detectedPort !== frontendPort) {
      frontendUrl = `http://localhost:${detectedPort}`;
      console.log(chalk.cyan(`Auto-detected running frontend on port: ${detectedPort}`));
    } else if (!detectedPort) {
      console.log(chalk.red('No running frontend detected on ports 3000, 5173-5199.'));
    }
  }
  await verifyFrontend(frontendUrl);

  console.log(chalk.blue('\n='.repeat(50)));
  console.log(chalk.blue('Verification Complete'));
  console.log(chalk.blue('='.repeat(50)));
}

// Run the verification
runVerification().catch(error => {
  console.error(chalk.red('Verification script error:'), error);
  process.exit(1);
});
