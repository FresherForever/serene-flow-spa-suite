#!/usr/bin/env node
// business-verify-deployment.js
// Business deployment verification tool for Serene Flow Spa Suite

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const { execSync } = require('child_process');

// Configuration
const config = {
  timeout: 10000, // 10 seconds
  retryCount: 3,
  criticalEndpoints: [
    '/api/health',
    '/api/environment',
    '/'
  ],
  businessEndpoints: [
    '/appointments',
    '/customers',
    '/staff',
    '/settings'
  ]
};

// Parse command line arguments
const args = process.argv.slice(2);
let targetUrl = '';
let options = {
  verbose: args.includes('--verbose'),
  quick: args.includes('--quick'),
  apiOnly: args.includes('--api-only'),
  uiOnly: args.includes('--ui-only')
};

// Get URL from command args or from Vercel
if (args.includes('--url')) {
  const urlIndex = args.indexOf('--url');
  if (urlIndex > -1 && args[urlIndex + 1]) {
    targetUrl = args[urlIndex + 1];
  }
}

// Logger function
function log(message, type = 'info', indent = 0) {
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',  // Red
    warning: '\x1b[33m', // Yellow
    highlight: '\x1b[35m', // Magenta
    reset: '\x1b[0m'    // Reset
  };
  
  const indentation = ' '.repeat(indent);
  const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
  
  if (type === 'info' && !options.verbose) {
    // Skip regular info messages when not in verbose mode
    return;
  }
  
  console.log(`${colors[type]}${indentation}[${timestamp}] ${message}${colors.reset}`);
}

// Function to make HTTP requests
async function checkEndpoint(url, endpoint) {
  return new Promise((resolve, reject) => {
    const fullUrl = url + endpoint;
    log(`Checking endpoint: ${fullUrl}`, 'info', 2);
    
    const protocol = fullUrl.startsWith('https') ? https : http;
    const req = protocol.get(fullUrl, {
      timeout: config.timeout,
      headers: {
        'User-Agent': 'Serene-Flow-Business-Verifier/1.0'
      }
    }, (res) => {
      const { statusCode } = res;
      
      // Collect response data
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      
      // Process response
      res.on('end', () => {
        if (statusCode >= 200 && statusCode < 300) {
          resolve({
            success: true,
            statusCode,
            endpoint,
            data: rawData
          });
        } else {
          resolve({
            success: false,
            statusCode,
            endpoint,
            error: `HTTP status ${statusCode}`
          });
        }
      });
    });
    
    // Handle errors
    req.on('error', (error) => {
      resolve({
        success: false,
        endpoint,
        error: error.message
      });
    });
    
    // Handle timeout
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        endpoint,
        error: 'Request timed out'
      });
    });
  });
}

// Function to retry failed requests
async function checkEndpointWithRetry(url, endpoint) {
  for (let attempt = 1; attempt <= config.retryCount; attempt++) {
    const result = await checkEndpoint(url, endpoint);
    
    if (result.success) {
      return result;
    } else if (attempt < config.retryCount) {
      log(`Attempt ${attempt} failed for ${endpoint}, retrying...`, 'warning', 2);
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    } else {
      return result;
    }
  }
}

// Check if the Vercel deployment is ready
async function getVercelDeploymentUrl() {
  try {
    log('Getting latest Vercel deployment URL...', 'info');
    
    // Execute the Vercel CLI command to get the latest deployment
    const deploymentOutput = execSync('npx vercel list --limit 1').toString();
    const deploymentLines = deploymentOutput.split('\n');
    
    // Find the line with the URL (simplified approach)
    if (deploymentLines.length >= 4) {
      // Extract the URL from the last line that should contain it
      const urlMatch = deploymentLines[deploymentLines.length - 2].match(/(https:\/\/[^\s]+)/);
      
      if (urlMatch && urlMatch[1]) {
        const url = urlMatch[1].trim();
        log(`Found deployment URL: ${url}`, 'success');
        return url;
      }
    }
    
    log('Could not find a deployment URL', 'error');
    return null;
  } catch (error) {
    log(`Error getting deployment URL: ${error.message}`, 'error');
    return null;
  }
}

// Generate a report of the verification results
async function generateVerificationReport(results) {
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  const successRate = ((successCount / results.length) * 100).toFixed(1);
  
  const report = {
    timestamp: new Date().toISOString(),
    targetUrl,
    summary: {
      total: results.length,
      success: successCount,
      failed: failureCount,
      successRate: `${successRate}%`
    },
    status: successRate >= 80 ? 'PASS' : 'FAIL',
    details: results
  };
  
  // Create a formatted report
  let reportText = `
=========================================================
  BUSINESS DEPLOYMENT VERIFICATION REPORT
  Date: ${new Date().toLocaleString()}
  Target: ${targetUrl}
=========================================================

SUMMARY:
  Total endpoints checked: ${report.summary.total}
  Successful endpoints:    ${report.summary.success}
  Failed endpoints:        ${report.summary.failed}
  Success rate:            ${report.summary.successRate}
  
OVERALL STATUS: ${report.status}

DETAILS:`;

  // Add details for each endpoint
  results.forEach(result => {
    reportText += `
  ${result.endpoint}:
    Status: ${result.success ? 'SUCCESS' : 'FAILED'}
    ${result.statusCode ? `HTTP Status: ${result.statusCode}` : ''}
    ${result.error ? `Error: ${result.error}` : ''}`;
  });

  reportText += `
  
=========================================================
  End of Report
=========================================================`;

  // Save the report to a file
  const filename = `business-verification-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
  try {
    await fs.mkdir('deployment-reports', { recursive: true });
    await fs.writeFile(`deployment-reports/${filename}`, reportText);
    log(`Report saved to deployment-reports/${filename}`, 'success');
  } catch (error) {
    log(`Error saving report: ${error.message}`, 'error');
  }

  return report;
}

// Main verification function
async function verifyDeployment() {
  log('BUSINESS DEPLOYMENT VERIFICATION', 'highlight');
  log('===================================', 'highlight');
  
  // Get the target URL if not provided
  if (!targetUrl) {
    targetUrl = await getVercelDeploymentUrl();
    if (!targetUrl) {
      log('No deployment URL found or provided. Exiting.', 'error');
      process.exit(1);
    }
  }
  
  // Normalize the URL
  if (targetUrl.endsWith('/')) {
    targetUrl = targetUrl.slice(0, -1);
  }
  
  log(`Starting verification for ${targetUrl}`, 'highlight');
  
  // Determine which endpoints to check
  let endpointsToCheck = [...config.criticalEndpoints];
  
  if (!options.quick) {
    if (!options.apiOnly) {
      endpointsToCheck = [...endpointsToCheck, ...config.businessEndpoints];
    }
    
    // Add more comprehensive checks for thorough verification
    if (!options.uiOnly) {
      // Check additional API endpoints if not UI only
      endpointsToCheck.push('/api/environment?format=json');
    }
  }
  
  // Check all the endpoints
  log('Checking endpoints...', 'info');
  const results = [];
  
  for (const endpoint of endpointsToCheck) {
    const result = await checkEndpointWithRetry(targetUrl, endpoint);
    
    if (result.success) {
      log(`✓ ${endpoint} - OK (${result.statusCode})`, 'success');
    } else {
      log(`✗ ${endpoint} - FAILED: ${result.error}`, 'error');
    }
    
    results.push(result);
  }
  
  // Generate and display report
  const report = await generateVerificationReport(results);
  
  // Final output
  log('\nVERIFICATION SUMMARY:', 'highlight');
  log(`Total endpoints checked: ${report.summary.total}`, 'info');
  log(`Successful: ${report.summary.success}`, 'info');
  log(`Failed: ${report.summary.failed}`, 'info'); 
  log(`Success rate: ${report.summary.successRate}`, 'info');
  log(`Overall status: ${report.status}`, report.status === 'PASS' ? 'success' : 'error');
  
  // Exit with appropriate code
  if (report.status === 'PASS') {
    log('Verification completed successfully!', 'success');
    process.exit(0);
  } else {
    log('Verification completed with failures!', 'error');
    process.exit(1);
  }
}

// Start the verification process
verifyDeployment().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
});
