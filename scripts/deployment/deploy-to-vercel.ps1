# Enhanced Vercel Deployment Script
# This script prepares, validates, and deploys your app to Vercel

Write-Host "🚀 Starting Vercel deployment process..." -ForegroundColor Cyan

# 1. Ensure we're on the right branch
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "⚠️ You are not on main/master branch. Current branch: $currentBranch" -ForegroundColor Yellow
    $confirm = Read-Host "Do you want to continue deployment from this branch? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "❌ Deployment canceled." -ForegroundColor Red
        exit 1
    }
}

# 2. Check for uncommitted changes
$hasChanges = git status --porcelain
if ($hasChanges) {
    Write-Host "⚠️ You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    $confirm = Read-Host "Do you want to commit these changes before deployment? (y/n)"
    if ($confirm -eq "y") {
        $commitMsg = Read-Host "Enter commit message"
        git add .
        git commit -m $commitMsg
        Write-Host "✅ Changes committed." -ForegroundColor Green
    } else {
        Write-Host "Continuing without committing changes..." -ForegroundColor Yellow
    }
}

# 3. Test the build process locally first
Write-Host "🏗️ Testing build process locally..." -ForegroundColor Cyan
try {
    # Clean the dist directory if it exists
    if (Test-Path dist) {
        Remove-Item -Recurse -Force dist
        Write-Host "Cleaned existing dist directory" -ForegroundColor Gray
    }
    
    # Run the vercel build script
    node scripts/deployment/vercel-build.js
    
    if (-not $?) {
        throw "Build failed"
    }
    
    Write-Host "✅ Local build test successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Local build test failed: $_" -ForegroundColor Red
    $confirm = Read-Host "Do you want to continue with deployment anyway? (y/n)"
    if ($confirm -ne "y") {
        exit 1
    }
}

# 4. Run verification tests on the build
Write-Host "🧪 Verifying build..." -ForegroundColor Cyan
try {
    node verify-deployment.js --local
    
    if (-not $?) {
        throw "Verification failed"
    }
    
    Write-Host "✅ Build verification successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Build verification has issues: $_" -ForegroundColor Yellow
    $confirm = Read-Host "Do you want to continue with deployment anyway? (y/n)"
    if ($confirm -ne "y") {
        exit 1
    }
}

# 5. Push to Vercel
Write-Host "☁️ Deploying to Vercel..." -ForegroundColor Cyan
try {
    # Check if vercel CLI is installed
    $vercelInstalled = $null -ne (Get-Command vercel -ErrorAction SilentlyContinue)
    
    if ($vercelInstalled) {
        # Deploy using Vercel CLI
        vercel --prod
    } else {
        # Use git push if Vercel CLI is not available
        Write-Host "Vercel CLI not found. Using git push for deployment." -ForegroundColor Yellow
        git push origin $currentBranch
    }
    
    Write-Host "✅ Deployment initiated!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}

# 6. Verify the deployed site after a delay
Write-Host "⏳ Waiting for deployment to complete..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

Write-Host "🔍 Verifying deployed site..." -ForegroundColor Cyan
node verify-deployed.js --vercel --verbose

Write-Host "📝 Deployment Summary:" -ForegroundColor Cyan
Write-Host "- Deployment initiated from branch: $currentBranch" -ForegroundColor White
Write-Host "- Time: $(Get-Date)" -ForegroundColor White
Write-Host "- Verification completed" -ForegroundColor White
Write-Host "- View deployment at: https://serene-flow-spa-suite.vercel.app" -ForegroundColor White

Write-Host "✨ Deployment process completed!" -ForegroundColor Green
