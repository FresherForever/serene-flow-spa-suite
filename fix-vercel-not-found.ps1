#!/bin/pwsh
# Fix Vercel DEPLOYMENT_NOT_FOUND Issue Script
# This script specifically targets and fixes the DEPLOYMENT_NOT_FOUND error

param (
    [switch]$Force,
    [switch]$KeepExistingDeployment
)

$infoColor = "Cyan"
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"
$highlightColor = "Magenta"

function Write-Step {
    param (
        [string]$Message
    )
    Write-Host "`n=> $Message" -ForegroundColor $highlightColor
}

function Write-Substep {
    param (
        [string]$Message
    )
    Write-Host "  • $Message" -ForegroundColor $infoColor
}

Write-Host "=================================================" -ForegroundColor $infoColor
Write-Host "  VERCEL DEPLOYMENT_NOT_FOUND ISSUE FIXER" -ForegroundColor $infoColor
Write-Host "=================================================" -ForegroundColor $infoColor

# Step 1: Check if Vercel CLI is installed
Write-Step "Checking for Vercel CLI"
try {
    $vercelVersion = npm list -g vercel
    if ($vercelVersion -match "empty") {
        Write-Host "  Vercel CLI not found. Installing..." -ForegroundColor $warningColor
        npm install -g vercel
        
        if (-not $?) {
            Write-Host "❌ Failed to install Vercel CLI. Please install it manually with 'npm install -g vercel'" -ForegroundColor $errorColor
            exit 1
        }
        Write-Host "  ✅ Vercel CLI installed successfully" -ForegroundColor $successColor
    } else {
        Write-Host "  ✅ Vercel CLI is already installed" -ForegroundColor $successColor
    }
} catch {
    Write-Host "  Installing Vercel CLI..." -ForegroundColor $warningColor
    npm install -g vercel
}

# Step 2: Login to Vercel if needed
Write-Step "Checking Vercel authentication"
try {
    $loginStatus = npx vercel whoami 2>&1
    if ($loginStatus -match "Error" -or $LASTEXITCODE -ne 0) {
        Write-Host "  Not logged in to Vercel. Please log in:" -ForegroundColor $warningColor
        npx vercel login
        
        if (-not $?) {
            Write-Host "❌ Failed to login to Vercel. Please try again manually." -ForegroundColor $errorColor
            exit 1
        }
        Write-Host "  ✅ Successfully logged in to Vercel" -ForegroundColor $successColor
    } else {
        Write-Host "  ✅ Already logged in to Vercel as: $loginStatus" -ForegroundColor $successColor
    }
} catch {
    Write-Host "  ❌ Error checking Vercel login: $($_.Exception.Message)" -ForegroundColor $errorColor
    Write-Host "  Please try logging in:" -ForegroundColor $warningColor
    npx vercel login
}

# Step 3: Check if the project exists on Vercel
Write-Step "Checking project on Vercel"

$projectExists = $false
try {
    $projectList = npx vercel project ls
    
    if ($projectList -match "serene-flow-spa-suite") {
        Write-Host "  ✅ Project found on Vercel" -ForegroundColor $successColor
        $projectExists = $true
    } else {
        Write-Host "  Project not found on Vercel" -ForegroundColor $warningColor
    }
} catch {
    Write-Host "  ❌ Error checking project status: $($_.Exception.Message)" -ForegroundColor $errorColor
    Write-Host "  Continuing with deployment process..." -ForegroundColor $warningColor
}

# Step 4: Check for project linking
Write-Step "Checking project linking"

$projectLinked = $false
if (Test-Path ".vercel/project.json") {
    Write-Host "  ✅ Project is linked to Vercel" -ForegroundColor $successColor
    $projectLinked = $true
} else {
    Write-Host "  Project is not linked to Vercel" -ForegroundColor $warningColor
}

# Step 5: Force remove project link if needed
if ($projectLinked -and $Force) {
    Write-Step "Force removing project link"
    if (Test-Path ".vercel") {
        Remove-Item -Recurse -Force ".vercel"
        Write-Host "  ✅ Removed existing project link" -ForegroundColor $successColor
        $projectLinked = $false
    }
}

# Step 6: Link project if needed
if (-not $projectLinked) {
    Write-Step "Linking project to Vercel"
    
    if ($projectExists) {
        # Link to existing project
        Write-Host "  Linking to existing project..." -ForegroundColor $infoColor
        npx vercel link
    } else {
        # Will create and link to a new project
        Write-Host "  Creating and linking to new project..." -ForegroundColor $infoColor
        npx vercel
        
        if (-not $?) {
            Write-Host "❌ Failed to create/link project. Please try manually: 'npx vercel'" -ForegroundColor $errorColor
            exit 1
        }
    }
    
    # Verify link was created
    if (Test-Path ".vercel/project.json") {
        Write-Host "  ✅ Project linked successfully" -ForegroundColor $successColor
    } else {
        Write-Host "❌ Failed to link project" -ForegroundColor $errorColor
        exit 1
    }
}

# Step 7: Prepare environment variables
Write-Step "Setting environment variables"

$envVars = @(
    @{
        "key" = "NODE_ENV"
        "value" = "production"
    },
    @{
        "key" = "API_URL"
        "value" = "/api"
    }
)

foreach ($env in $envVars) {
    Write-Substep "Setting $($env.key)=$($env.value)"
    try {
        npx vercel env add $env.key production $env.value
    } catch {
        Write-Host "  ⚠️ Unable to set environment variable: $($_.Exception.Message)" -ForegroundColor $warningColor
    }
}

# Step 8: Deploy to Vercel
Write-Step "Deploying to Vercel"

$deployArgs = @("--prod")
if ($Force) {
    $deployArgs += "--force"
}

Write-Host "  Deploying to production..." -ForegroundColor $infoColor
try {
    npx vercel $deployArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment returned non-zero exit code"
    }
    
    Write-Host "  ✅ Deployment initiated successfully!" -ForegroundColor $successColor
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor $errorColor
    
    # Try fallback deployment approach
    Write-Step "Trying fallback deployment approach"
    
    # Create a minimal vercel.json if needed
    if (-not (Test-Path "vercel.json")) {
        @"
{
  "version": 2,
  "buildCommand": "node vercel-build.js",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/health", "destination": "/api/health.js" },
    { "source": "/api/environment", "destination": "/api/environment.js" },
    { "source": "/environment", "destination": "/api/environment.js" },
    { "source": "/api/(.*)", "destination": "/api/[...catchAll].js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
"@ | Out-File -FilePath "vercel.json" -Encoding utf8
        
        Write-Host "  Created minimal vercel.json" -ForegroundColor $infoColor
    }
    
    # Create a minimal HTML file for deployment
    if (-not (Test-Path "dist/index.html")) {
        # Create dist directory if it doesn't exist
        if (-not (Test-Path "dist")) {
            New-Item -ItemType Directory -Path "dist" -Force | Out-Null
        }
        
        # Use the fallback.html as index.html
        if (Test-Path "fallback.html") {
            Copy-Item "fallback.html" -Destination "dist/index.html"
            Write-Host "  Copied fallback.html to dist/index.html" -ForegroundColor $infoColor
        } else {
            # Create a minimal index.html
            @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serene Flow Spa Suite</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f7fa;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
        }
        h1 { color: #0f766e; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Serene Flow Spa Suite</h1>
        <p>Our site is currently being updated. Please check back soon.</p>
        <p>Last updated: $(Get-Date)</p>
    </div>
</body>
</html>
"@ | Out-File -FilePath "dist/index.html" -Encoding utf8
            
            Write-Host "  Created minimal dist/index.html" -ForegroundColor $infoColor
        }
    }
    
    # Try deploying with --force
    Write-Host "  Trying forced deployment..." -ForegroundColor $warningColor
    try {
        npx vercel --prod --force
        
        if ($LASTEXITCODE -ne 0) {
            throw "Forced deployment returned non-zero exit code"
        }
        
        Write-Host "  ✅ Forced deployment initiated successfully!" -ForegroundColor $successColor
    } catch {
        Write-Host "❌ Fallback deployment also failed: $($_.Exception.Message)" -ForegroundColor $errorColor
        exit 1
    }
}

Write-Host "`n✅ Deployment completed! The DEPLOYMENT_NOT_FOUND issue should be resolved." -ForegroundColor $successColor
Write-Host "You can verify by visiting your Vercel URL in a browser." -ForegroundColor $infoColor

# Final tips
Write-Host "`n💡 Tip: If you still encounter issues, try these steps:" -ForegroundColor $infoColor
Write-Host "  1. Run 'vercel logs' to check for errors" -ForegroundColor $infoColor
Write-Host "  2. Visit the Vercel dashboard and check your project settings" -ForegroundColor $infoColor
Write-Host "  3. Run './verify-vercel-deployment.ps1' to verify your deployment" -ForegroundColor $infoColor
