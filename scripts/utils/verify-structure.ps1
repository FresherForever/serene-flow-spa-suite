# Verify Project Structure
# This script checks if the reorganized project structure is correct

Write-Host "Verifying project structure..." -ForegroundColor Cyan

$requiredDirs = @(
    "scripts/database",
    "scripts/deployment",
    "scripts/verification",
    "scripts/utils",
    "config/docker",
    "docs"
)

$requiredFiles = @(
    "scripts/database/migrate-database.js",
    "scripts/database/migrate-database.cjs",
    "scripts/database/sql/initial_schema_reference.sql",
    "docs/PROJECT_STRUCTURE.md",
    ".env.example"
)

$allValid = $true

# Check directories
Write-Host "Checking required directories..." -ForegroundColor Yellow
foreach ($dir in $requiredDirs) {
    $path = Join-Path -Path "c:\Workspace\Spa\serene-flow-spa-suite" -ChildPath $dir
    $exists = Test-Path -Path $path -PathType Container
    
    if ($exists) {
        Write-Host "  ✓ $dir exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $dir does not exist" -ForegroundColor Red
        $allValid = $false
    }
}

# Check files
Write-Host "`nChecking required files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    $path = Join-Path -Path "c:\Workspace\Spa\serene-flow-spa-suite" -ChildPath $file
    $exists = Test-Path -Path $path -PathType Leaf
    
    if ($exists) {
        Write-Host "  ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file does not exist" -ForegroundColor Red
        $allValid = $false
    }
}

# Check package.json scripts
Write-Host "`nVerifying package.json scripts..." -ForegroundColor Yellow
$packageJson = Get-Content -Path "c:\Workspace\Spa\serene-flow-spa-suite\package.json" -Raw | ConvertFrom-Json

$scriptPaths = @(
    "scripts/database/migrate-database.js",
    "scripts/deployment/vercel-build.js",
    "scripts/verification/verify-wrapper.js"
)

foreach ($scriptPath in $scriptPaths) {
    $found = $false
    
    foreach ($script in $packageJson.scripts.PSObject.Properties) {
        if ($script.Value -match [regex]::Escape($scriptPath)) {
            Write-Host "  ✓ Found script using $scriptPath" -ForegroundColor Green
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        Write-Host "  ✗ No script using $scriptPath" -ForegroundColor Red
        $allValid = $false
    }
}

# Final result
Write-Host "`nVerification complete!" -ForegroundColor Cyan
if ($allValid) {
    Write-Host "Project structure is valid." -ForegroundColor Green
} else {
    Write-Host "Project structure has issues that need to be fixed." -ForegroundColor Red
}
