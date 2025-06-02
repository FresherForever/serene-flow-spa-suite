// Wrapper script for verification that handles common issues
// This script ensures all dependencies are installed before running verification

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to check if a package is installed
function isPackageInstalled(packageName) {
  try {
    // For ES modules we need to use dynamic import check 
    // This is a simple existence check for the node_modules folder
    const modulePath = join(__dirname, 'node_modules', packageName);
    return existsSync(modulePath);
  } catch (e) {
    return false;
  }
}

// Function to install a package if it's not already installed
function ensurePackage(packageName) {
  if (!isPackageInstalled(packageName)) {
    console.log(`📦 Installing required package: ${packageName}`);
    execSync(`npm install --no-save ${packageName}`, { stdio: 'inherit' });
    return true;
  }
  return false;
}

// Main function
async function runVerification() {
  console.log('🔍 Serene Flow Spa Suite Verification Utility');
  console.log('============================================');
  
  // Check for required dependencies
  const requiredPackages = ['dotenv', 'node-fetch', 'chalk'];
  let packagesInstalled = false;
  
  for (const pkg of requiredPackages) {
    if (ensurePackage(pkg)) {
      packagesInstalled = true;
    }
  }
  
  if (packagesInstalled) {
    console.log('✅ All required packages installed');
    
    // We need to use dynamic import after installing packages
    try {
      console.log('\n🔄 Importing verification module...');
      const verifyModule = await import('./scripts/verification/verify-deployment.js');
      console.log('✅ Module imported successfully\n');
    } catch (error) {
      console.error('❌ Failed to import verification module:', error.message);
      console.error('   Please check the error message above and fix the issue.');
      process.exit(1);
    }
  } else {
    console.log('✅ All required dependencies are already installed');
  }
  
  // Get command line arguments
  const args = process.argv.slice(2);
  
  // Determine which verification script to run
  const scriptName = args.includes('--deployed') ? './scripts/verification/verify-deployed.js' : './scripts/verification/verify-deployment.js';

  console.log(`\n🚀 Running ${scriptName}...\n`);
  try {
    // Forward all arguments except for our own flags
    const filteredArgs = args.filter(arg => arg !== '--deployed');
    execSync(`node ${scriptName} ${filteredArgs.join(' ')}`, { stdio: 'inherit', cwd: __dirname });
    console.log('\n✅ Verification completed');
  } catch (error) {
    console.error('\n❌ Verification failed');
    console.error('   See error details above');
    console.error('\n📖 For troubleshooting help, please refer to:');
    console.error('   VERIFICATION_TROUBLESHOOTING.md');
    process.exit(1);
  }
}

// Run the verification
runVerification().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
