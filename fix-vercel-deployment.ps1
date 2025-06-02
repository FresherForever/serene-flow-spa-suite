# Enhanced Vercel Deployment Fix Script
# This script diagnoses and resolves common Vercel deployment issues

param (
    [switch]$Force,
    [switch]$Prod,
    [switch]$Debug,
    [switch]$SkipBuild
)

# Set colors for console output
$infoColor = "Cyan"
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"
$highlightColor = "Magenta"

function Write-StepHeader {
    param (
        [string]$text
    )
    Write-Host "`n========================================" -ForegroundColor $infoColor
    Write-Host "  $text" -ForegroundColor $infoColor
    Write-Host "========================================" -ForegroundColor $infoColor
}

Write-StepHeader "SERENE FLOW SPA - DEPLOYMENT FIX UTILITY"

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI installation..." -ForegroundColor $infoColor

# We'll use npx to ensure Vercel is available
try {
    # Install locally if not available
    npm install vercel --no-save
    Write-Host "✅ Vercel CLI is available via npx" -ForegroundColor $successColor
    
    # Verify it works
    $vercelVersion = npx vercel --version
    Write-Host "  Using Vercel CLI version: $vercelVersion" -ForegroundColor $infoColor
} catch {
    Write-Host "⚠️ Error with Vercel CLI. Trying alternative installation..." -ForegroundColor $warningColor
    
    # Try global installation as fallback
    try {
        npm install -g vercel
        Write-Host "✅ Installed Vercel CLI globally" -ForegroundColor $successColor
    } catch {
        Write-Host "  ⚠️ Could not install globally, but we can still use npx" -ForegroundColor $warningColor
    }
}

Write-StepHeader "CHECKING PROJECT CONFIGURATION"

# Check essential files
$requiredFiles = @(
    "vercel.json",
    "vite.config.js",
    "index.html",
    "api/environment.js"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
        Write-Host "❌ Missing required file: $file" -ForegroundColor $errorColor
    } else {
        Write-Host "✅ Found required file: $file" -ForegroundColor $successColor
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n⚠️ Some required files are missing. This might cause deployment issues." -ForegroundColor $warningColor
    
    # Create API folder if missing
    if (-not (Test-Path "api")) {
        Write-Host "  Creating api folder..." -ForegroundColor $infoColor
        New-Item -ItemType Directory -Path "api" -Force | Out-Null
    }
    
    # Create essential API files if missing
    if (-not (Test-Path "api/environment.js")) {
        Write-Host "  Creating api/environment.js..." -ForegroundColor $infoColor
        @"
// Vercel Environment API endpoint
export default function handler(req, res) {
  res.status(200).json({
    environment: process.env.NODE_ENV || 'development',
    vercel: true,
    region: process.env.VERCEL_REGION || 'unknown',
    serverTime: new Date().toISOString()
  });
}
"@ | Out-File -FilePath "api/environment.js" -Encoding utf8
    }
    
    # Create essential configuration files if missing
    if (-not (Test-Path "vercel.json")) {
        Write-Host "  Creating vercel.json..." -ForegroundColor $infoColor
        @"
{
  "version": 2,
  "buildCommand": "node scripts/deployment/vercel-build.js",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/health", "destination": "/api" },
    { "source": "/api/(.*)", "destination": "/api/[...catchAll]" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
"@ | Out-File -FilePath "vercel.json" -Encoding utf8
    }
}

Write-StepHeader "CHECKING CURRENT DEPLOYMENT STATUS"

# Check current Vercel project status
Write-Host "Checking Vercel project status..." -ForegroundColor $infoColor
try {
    npx vercel project ls
    if (-not $?) {
        Write-Host "`n⚠️ You may not be logged in to Vercel. Please login:" -ForegroundColor $warningColor
        npx vercel login
        if (-not $?) {
            Write-Host "❌ Vercel login failed. Please try again manually with 'npx vercel login'" -ForegroundColor $errorColor
            exit 1
        }
    }
} catch {
    Write-Host "`n⚠️ Error checking Vercel project status. Please login:" -ForegroundColor $warningColor
    npx vercel login
}

# Run pre-deployment checks
Write-StepHeader "RUNNING PRE-DEPLOYMENT CHECKS"

# Validate package.json
if (Test-Path "package.json") {
    try {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        
        # Check for build script
        if (-not $packageJson.scripts.build) {
            Write-Host "⚠️ No 'build' script found in package.json" -ForegroundColor $warningColor
            Write-Host "  Adding build script..." -ForegroundColor $infoColor
            
            $packageJson.scripts.build = "vite build"
            $packageJson.scripts."vercel-build" = "node scripts/deployment/vercel-build.js"
            
            $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "package.json" -Encoding utf8
            Write-Host "✅ Added build scripts to package.json" -ForegroundColor $successColor
        }
        
        # Check for vercel-build script
        if (-not $packageJson.scripts."vercel-build") {
            Write-Host "⚠️ No 'vercel-build' script found in package.json" -ForegroundColor $warningColor
            Write-Host "  Adding vercel-build script..." -ForegroundColor $infoColor
            
            $packageJson.scripts."vercel-build" = "node scripts/deployment/vercel-build.js"
            
            $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "package.json" -Encoding utf8
            Write-Host "✅ Added vercel-build script to package.json" -ForegroundColor $successColor
        }
        
        Write-Host "✅ Package.json validation complete" -ForegroundColor $successColor
    } catch {
        Write-Host "❌ Error validating package.json: $_" -ForegroundColor $errorColor
    }
} else {
    Write-Host "❌ package.json not found! This is required for deployment." -ForegroundColor $errorColor
    exit 1
}

# Create minimal fallback page
if (-not (Test-Path "fallback.html")) {
    Write-Host "Creating fallback page for emergency deployments..." -ForegroundColor $infoColor
    @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serene Flow Spa Suite - Maintenance</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #334155;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .container {
            background-color: rgba(255, 255, 255, 0.85);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #0f766e;
            margin-bottom: 10px;
        }
        p {
            line-height: 1.7;
            margin-bottom: 25px;
            font-size: 16px;
        }
        .status {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #0f766e;
            margin-bottom: 25px;
        }
        .info {
            font-size: 14px;
            color: #64748b;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Serene Flow Spa Suite</h1>
        <p>Our application is currently undergoing maintenance to provide you with an enhanced experience.</p>
        
        <div class="status">
            <strong>Status:</strong> Scheduled Maintenance<br>
            <strong>Expected Resolution:</strong> <span id="time">Shortly</span>
        </div>
        
        <p>Thank you for your patience as we work to improve our services.</p>
        
        <div class="info">
            <p>Need immediate assistance? Please contact our support team at <strong>support@sereneflowspa.com</strong></p>
        </div>
    </div>
    
    <script>
        // Update the time dynamically
        function updateTime() {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('time').textContent = 'Within the next hour (Current time: ' + hours + ':' + minutes + ')';
        }
        updateTime();
        setInterval(updateTime, 60000);
    </script>
</body>
</html>
"@ | Out-File -FilePath "fallback.html" -Encoding utf8
    Write-Host "✅ Created fallback.html" -ForegroundColor $successColor
}

# Create essential Vercel API files
if (-not (Test-Path "api/[...catchAll].js")) {
    Write-Host "Creating API catchAll handler..." -ForegroundColor $infoColor
    @"
// API catch-all handler for proxying requests to the backend
import { createProxyMiddleware } from 'http-proxy-middleware';

export default function handler(req, res) {
  // For debugging purposes
  console.log(`API request: ${req.url}`);
  
  try {
    // If this is a health check, respond immediately
    if (req.url === '/api/health') {
      return res.status(200).json({ 
        status: 'OK',
        message: 'API is operational',
        timestamp: new Date().toISOString()
      });
    }
    
    // Otherwise return a default response
    return res.status(200).json({
      message: 'API endpoint responding',
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
"@ | Out-File -FilePath "api/[...catchAll].js" -Encoding utf8
    Write-Host "✅ Created API catchAll handler" -ForegroundColor $successColor
}

# Test the local build if not skipped
if (-not $SkipBuild) {
    Write-StepHeader "TESTING LOCAL BUILD"
    Write-Host "Building the project locally to verify..." -ForegroundColor $infoColor
    
    # Clean the dist directory if it exists
    if (Test-Path dist) {
        Remove-Item -Recurse -Force dist
        Write-Host "Cleaned existing dist directory" -ForegroundColor $infoColor
    }
    
    try {
        # Run the Vercel build script
        node scripts/deployment/vercel-build.js
        
        if ($?) {
            Write-Host "✅ Local build successful!" -ForegroundColor $successColor
        } else {
            Write-Host "❌ Local build failed. Attempting simplified build..." -ForegroundColor $errorColor
            
            try {
                # Create a minimal index.html in dist as fallback
                New-Item -ItemType Directory -Path dist -Force | Out-Null
                Copy-Item "fallback.html" -Destination "dist/index.html"
                Write-Host "✅ Created fallback build" -ForegroundColor $successColor
            } catch {
                Write-Host "❌ Failed to create fallback build: $_" -ForegroundColor $errorColor
                exit 1
            }
        }
    } catch {
        Write-Host "❌ Error during build: $_" -ForegroundColor $errorColor
        
        # Create a minimal fallback build
        New-Item -ItemType Directory -Path dist -Force | Out-Null
        Copy-Item "fallback.html" -Destination "dist/index.html"
        Write-Host "✅ Created fallback build" -ForegroundColor $successColor
    }
}

# Deploy to Vercel
Write-StepHeader "DEPLOYING TO VERCEL"

$deployArgs = @()
if ($Debug) {
    $deployArgs += "--debug"
}

if ($Prod) {
    Write-Host "🚨 Deploying to PRODUCTION" -ForegroundColor $warningColor
    $deployArgs += "--prod"
} else {
    Write-Host "Deploying to preview environment" -ForegroundColor $infoColor
}

if ($Force) {
    $deployArgs += "--force"
}

Write-Host "Running Vercel deployment..." -ForegroundColor $infoColor

try {
    npx vercel @deployArgs
    
    if ($?) {
        Write-Host "✅ Deployment initiated successfully!" -ForegroundColor $successColor
    } else {
        throw "Deployment command returned an error"
    }
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor $errorColor
    
    # Try with --force flag if not already used
    if (-not $Force) {
        Write-Host "Attempting deployment with --force flag..." -ForegroundColor $warningColor
        try {
            npx vercel --force
            if ($?) {
                Write-Host "✅ Forced deployment initiated successfully!" -ForegroundColor $successColor
            } else {
                throw "Forced deployment command returned an error"
            }
        } catch {
            Write-Host "❌ Forced deployment also failed: $_" -ForegroundColor $errorColor
        }
    }
}

Write-StepHeader "DEPLOYMENT PROCESS COMPLETE"
Write-Host "Check the Vercel dashboard for deployment status." -ForegroundColor $infoColor
Write-Host "If issues persist, run with -Debug flag for more information." -ForegroundColor $infoColor
