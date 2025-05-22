#!/bin/pwsh
# Comprehensive verification script that launches all verification tools

param (
    [switch]$Vercel,
    [string]$VercelUrl = $env:VERCEL_URL,
    [switch]$GenerateReport,
    [switch]$SkipServerCheck,
    [switch]$QuickCheck
)

# Set console colors and styles
$titleColor = "Cyan"
$sectionColor = "Yellow"
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Gray"
$warningColor = "Yellow"

# Helper function to print section headers
function Write-SectionHeader {
    param (
        [string]$Title,
        [switch]$Major
    )
      $length = $Title.Length + 4
    $separator = if ($Major) { "=" * $length } else { "-" * $length }
    
    Write-Host ""
    Write-Host $separator -ForegroundColor $titleColor
    Write-Host "  $Title  " -ForegroundColor $(if ($Major) { $titleColor } else { $sectionColor })
    Write-Host $separator -ForegroundColor $titleColor
}

# Display script header
Write-SectionHeader "SERENE FLOW SPA SUITE VERIFICATION" -Major

# Determine which environment to test
$targetEnv = if ($Vercel) { "Vercel deployment" } else { "localhost development" }
Write-Host "Target environment: $targetEnv" -ForegroundColor $infoColor

if ($Vercel) {
    if ([string]::IsNullOrEmpty($VercelUrl)) {
        Write-Host "ERROR: No Vercel URL provided. Use -VercelUrl parameter or set VERCEL_URL environment variable." -ForegroundColor $errorColor
        exit 1
    }
    
    Write-Host "Vercel URL: $VercelUrl" -ForegroundColor $infoColor
}

# Step 1: Run the deployment verification script
Write-SectionHeader "Step 1: Basic Deployment Verification"

try {
    $vercelParam = if ($Vercel) { "--vercel" } else { "" }
    & .\verify-deployment.ps1 $vercelParam
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Basic verification failed with exit code $LASTEXITCODE" -ForegroundColor $errorColor
    }
} catch {
    Write-Host "Error running basic verification: $_" -ForegroundColor $errorColor
}

# Step 2: Run API tests
Write-SectionHeader "Step 2: API Endpoint Tests"

try {
    $params = @{}
    if ($Vercel) {
        $params.Vercel = $true
        $params.VercelUrl = $VercelUrl
    }
    
    & .\test-api.ps1 @params
    if ($LASTEXITCODE -ne 0) {
        Write-Host "API tests failed with exit code $LASTEXITCODE" -ForegroundColor $errorColor
    }
} catch {
    Write-Host "Error running API tests: $_" -ForegroundColor $errorColor
}

# Step 3: Check database connectivity
Write-SectionHeader "Step 3: Database Connectivity Check"

$dbUrl = if ($Vercel) { "$VercelUrl/api/test" } else { "http://localhost:5000/api/health" }
try {
    Write-Host "Testing database connection via API..." -ForegroundColor $infoColor
    $response = Invoke-RestMethod -Uri $dbUrl -Method Get -ErrorAction Stop
    
    if ($response.database -eq "configured" -or $response.status -eq "OK") {
        Write-Host "✅ Database connection successful" -ForegroundColor $successColor
    } else {
        Write-Host "⚠️ Database status unclear. Response: $($response | ConvertTo-Json)" -ForegroundColor "Yellow"
    }
} catch {
    Write-Host "❌ Failed to check database connection: $_" -ForegroundColor $errorColor
}

# Step 4: Open application in browser for manual testing
Write-SectionHeader "Step 4: Manual Verification"

$appUrl = if ($Vercel) { $VercelUrl } else { "http://localhost:5173" }
Write-Host "Opening application in browser for manual testing: $appUrl"
try {
    Start-Process $appUrl
} catch {
    Write-Host "Couldn't open browser automatically. Please open this URL manually: $appUrl" -ForegroundColor "Yellow"
}

# Step 5: Next steps
Write-SectionHeader "Step 5: Next Steps"

Write-Host "Manual verification steps:" -ForegroundColor $sectionColor
Write-Host " 1. Check the environment indicator in the bottom-left corner of the sidebar"
Write-Host " 2. Verify that you can navigate between different pages"
Write-Host " 3. Test creating a new appointment or customer"
Write-Host " 4. Verify that API endpoints return expected data"
Write-Host ""
Write-Host "See VERIFICATION_GUIDE.md for detailed verification instructions."

# Final summary
Write-SectionHeader "VERIFICATION COMPLETE" -Major
Write-Host "Refer to the output above for detailed results."
