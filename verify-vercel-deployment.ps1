#!/bin/pwsh
# Vercel Deployment Verification Script
# This script checks a deployed Vercel application for common issues

param (
    [string]$Url = "https://serene-flow-spa-suite.vercel.app",
    [switch]$Detailed,
    [switch]$Fix,
    [switch]$GenerateReport
)

# Set colors for console output
$infoColor = "Cyan"
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"
$highlightColor = "Magenta"

# Show banner
Write-Host "====================================================" -ForegroundColor $infoColor
Write-Host "  SERENE FLOW SPA SUITE - VERCEL VERIFICATION" -ForegroundColor $infoColor
Write-Host "====================================================" -ForegroundColor $infoColor
Write-Host "Target URL: $Url`n" -ForegroundColor $infoColor

# Initialize results collection for reporting
$results = @{
    "timestamp" = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "url" = $Url
    "checks" = @()
    "overallStatus" = "Unknown"
    "recommendations" = @()
}

function Add-CheckResult {
    param (
        [string]$Name,
        [string]$Status,  # Pass, Fail, Warning
        [string]$Message,
        [object]$Details = $null
    )
    
    $results.checks += @{
        "name" = $Name
        "status" = $Status
        "message" = $Message
        "details" = $Details
    }
      # Log to console with appropriate color
    $color = switch ($Status) {
        "Pass" { $successColor }
        "Fail" { $errorColor }
        "Warning" { $warningColor }
        default { $infoColor }
    }
    
    $icon = switch ($Status) {
        "Pass" { "✅" }
        "Fail" { "❌" }
        "Warning" { "⚠️" }
        default { "ℹ️" }
    }
    
    Write-Host "$icon $($Name): $Message" -ForegroundColor $color
}

# Check 1: Basic connectivity
Write-Host "Checking basic connectivity..." -ForegroundColor $infoColor
try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Add-CheckResult -Name "Basic Connectivity" -Status "Pass" -Message "Site is accessible. Status code: $($response.StatusCode)"
        $mainPageAccessible = $true
    } else {
        Add-CheckResult -Name "Basic Connectivity" -Status "Warning" -Message "Site returned unexpected status code: $($response.StatusCode)"
        $mainPageAccessible = $false
    }
} catch {
    Add-CheckResult -Name "Basic Connectivity" -Status "Fail" -Message "Failed to connect to site: $($_.Exception.Message)"
    $results.recommendations += "Verify that the Vercel deployment exists and the URL is correct."
    $results.recommendations += "Run 'fix-vercel-deployment.ps1' to recreate the deployment."
    $mainPageAccessible = $false
}

# Check 2: API Health Endpoint
Write-Host "Checking API health endpoint..." -ForegroundColor $infoColor
try {
    $apiHealthUrl = "$Url/api/health"
    $apiResponse = Invoke-WebRequest -Uri $apiHealthUrl -UseBasicParsing -TimeoutSec 5
    
    if ($apiResponse.StatusCode -eq 200) {
        Add-CheckResult -Name "API Health" -Status "Pass" -Message "API health endpoint is accessible. Status code: $($apiResponse.StatusCode)"
        
        try {
            $apiData = $apiResponse.Content | ConvertFrom-Json
            Add-CheckResult -Name "API Response" -Status "Pass" -Message "API returned valid JSON response." -Details $apiData
        } catch {
            Add-CheckResult -Name "API Response" -Status "Warning" -Message "API returned non-JSON response."
        }
    } else {
        Add-CheckResult -Name "API Health" -Status "Warning" -Message "API health endpoint returned unexpected status code: $($apiResponse.StatusCode)"
    }
} catch {
    Add-CheckResult -Name "API Health" -Status "Fail" -Message "Failed to connect to API health endpoint: $($_.Exception.Message)"
    $results.recommendations += "Check that the API serverless functions are properly deployed."
    $results.recommendations += "Verify that api/health.js exists in your project."
}

# Check 3: Environment Endpoint (both paths)
Write-Host "Checking environment endpoints..." -ForegroundColor $infoColor

# First check /api/environment
try {
    $envUrl = "$Url/api/environment"
    $envResponse = Invoke-WebRequest -Uri $envUrl -UseBasicParsing -TimeoutSec 5
    
    if ($envResponse.StatusCode -eq 200) {
        Add-CheckResult -Name "API Environment" -Status "Pass" -Message "API environment endpoint is accessible."
        
        try {
            $envData = $envResponse.Content | ConvertFrom-Json
            Add-CheckResult -Name "Environment Data" -Status "Pass" -Message "Environment info available." -Details $envData
            
            # Extract environment info
            $isVercelEnv = $envData.vercel -eq $true
            $envName = $envData.environment
            
            if ($isVercelEnv) {
                Add-CheckResult -Name "Vercel Environment" -Status "Pass" -Message "Confirmed running in Vercel ($envName)"
            } else {
                Add-CheckResult -Name "Vercel Environment" -Status "Warning" -Message "Not running in Vercel environment"
                $results.recommendations += "Check that environment variables are properly set in Vercel dashboard."
            }
        } catch {
            Add-CheckResult -Name "Environment Data" -Status "Warning" -Message "API returned non-JSON environment data."
        }
    } else {
        Add-CheckResult -Name "API Environment" -Status "Warning" -Message "API environment endpoint returned unexpected status: $($envResponse.StatusCode)"
    }
} catch {
    Add-CheckResult -Name "API Environment" -Status "Fail" -Message "Failed to connect to API environment endpoint: $($_.Exception.Message)"
}

# Then check alternate path /environment
try {
    $altEnvUrl = "$Url/environment"
    $altEnvResponse = Invoke-WebRequest -Uri $altEnvUrl -UseBasicParsing -TimeoutSec 5
    
    if ($altEnvResponse.StatusCode -eq 200) {
        Add-CheckResult -Name "Alternate Environment Path" -Status "Pass" -Message "Alternate environment endpoint is accessible."
    } else {
        Add-CheckResult -Name "Alternate Environment Path" -Status "Warning" -Message "Alternate environment endpoint returned unexpected status: $($altEnvResponse.StatusCode)"
        $results.recommendations += "Ensure vercel.json contains proper rewrites for the /environment path."
    }
} catch {
    Add-CheckResult -Name "Alternate Environment Path" -Status "Fail" -Message "Failed to connect to alternate environment endpoint: $($_.Exception.Message)"
    $results.recommendations += "Check that API rewrites in vercel.json are correctly configured."
}

# Check 4: Static Assets
if ($Detailed) {
    Write-Host "Checking static assets..." -ForegroundColor $infoColor
    $staticAssets = @("/assets", "/favicon.ico", "/index.html")
    
    foreach ($asset in $staticAssets) {
        try {
            $assetUrl = "$Url$asset"
            $assetResponse = Invoke-WebRequest -Uri $assetUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            
            if ($assetResponse.StatusCode -eq 200) {
                Add-CheckResult -Name "Static Asset ($asset)" -Status "Pass" -Message "Asset is accessible."
            } else {
                Add-CheckResult -Name "Static Asset ($asset)" -Status "Warning" -Message "Asset returned unexpected status: $($assetResponse.StatusCode)"
            }
        } catch {
            # Don't treat missing static assets as critical failures
            Add-CheckResult -Name "Static Asset ($asset)" -Status "Warning" -Message "Asset not accessible: $($_.Exception.Message)"
        }
    }
}

# Check 5: Analyze HTML for common issues (if site is accessible)
if ($mainPageAccessible) {
    Write-Host "Analyzing HTML content..." -ForegroundColor $infoColor
    $html = $response.Content
    
    # Check for "DEPLOYMENT_NOT_FOUND" error
    if ($html -match "DEPLOYMENT_NOT_FOUND") {
        Add-CheckResult -Name "Deployment Status" -Status "Fail" -Message "Found 'DEPLOYMENT_NOT_FOUND' error in HTML."
        $results.recommendations += "The Vercel deployment appears to be deleted or inaccessible."
        $results.recommendations += "Run 'fix-vercel-deployment.ps1' to recreate the deployment."
        
        # Extract deployment ID if available
        if ($html -match "ID:\s+`"([^`"]+)`"") {
            $deploymentId = $matches[1]
            Add-CheckResult -Name "Deployment ID" -Status "Info" -Message "Deployment ID: $deploymentId"
        }
    }
    
    # Check for other Vercel errors
    if ($html -match "NOT_FOUND") {
        Add-CheckResult -Name "Page Status" -Status "Fail" -Message "Found 'NOT_FOUND' error in HTML."
    }
    
    # Check for 404.html (Next.js style redirect)
    if ($html -match "404\.html" -or $response.BaseResponse.ResponseUri.AbsolutePath -eq "/404.html") {
        Add-CheckResult -Name "Page Status" -Status "Warning" -Message "Site redirected to 404.html."
        $results.recommendations += "Check that the 'outputDirectory' in vercel.json matches your build output directory."
    }
}

# Check 6: Analyze configuration files
if ($Fix) {
    Write-Host "`nAnalyzing and fixing configuration..." -ForegroundColor $highlightColor
    
    # Check Vercel CLI is installed
    try {
        $vercelVersion = vercel --version
        Add-CheckResult -Name "Vercel CLI" -Status "Pass" -Message "Vercel CLI is installed: $vercelVersion"
    } catch {
        Add-CheckResult -Name "Vercel CLI" -Status "Warning" -Message "Vercel CLI not installed or not in PATH."
        $results.recommendations += "Install Vercel CLI with 'npm install -g vercel'."
    }
}

# Set overall status
$failCount = ($results.checks | Where-Object { $_.status -eq "Fail" }).Count
$warningCount = ($results.checks | Where-Object { $_.status -eq "Warning" }).Count
$passCount = ($results.checks | Where-Object { $_.status -eq "Pass" }).Count

if ($failCount -gt 0) {
    $results.overallStatus = "Fail"
} elseif ($warningCount -gt 0) {
    $results.overallStatus = "Warning"
} else {
    $results.overallStatus = "Pass"
}

# Print summary
Write-Host "`n====================================================" -ForegroundColor $infoColor
Write-Host "  VERIFICATION SUMMARY" -ForegroundColor $infoColor
Write-Host "====================================================" -ForegroundColor $infoColor
Write-Host "Status: $($results.overallStatus)" -ForegroundColor $(if ($results.overallStatus -eq "Pass") { $successColor } elseif ($results.overallStatus -eq "Warning") { $warningColor } else { $errorColor })
Write-Host "Pass: $passCount | Warning: $warningCount | Fail: $failCount" -ForegroundColor $infoColor

# Show recommendations
if ($results.recommendations.Count -gt 0) {
    Write-Host "`nRecommendations:" -ForegroundColor $highlightColor
    foreach ($rec in $results.recommendations) {
        Write-Host "• $rec" -ForegroundColor $infoColor
    }
}

# Generate report if requested
if ($GenerateReport) {
    $reportFile = "vercel-verification-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
    
    $report = @"
# Vercel Deployment Verification Report
Generated on: $($results.timestamp)

## Overview
- **Target URL:** $($results.url)
- **Status:** $($results.overallStatus)
- **Pass:** $passCount | **Warning:** $warningCount | **Fail:** $failCount

## Checks

"@
    
    foreach ($check in $results.checks) {
        $icon = switch ($check.status) {
            "Pass" { "✅" }
            "Fail" { "❌" }
            "Warning" { "⚠️" }
            default { "ℹ️" }
        }
        
        $report += "$icon **$($check.name)**: $($check.message)`n"
        
        if ($check.details -and $Detailed) {
            $detailsText = ($check.details | ConvertTo-Json -Depth 3)
            $report += "   ```json`n   $detailsText`n   ````n"
        }
        
        $report += "`n"
    }
    
    if ($results.recommendations.Count -gt 0) {
        $report += "## Recommendations`n`n"
        foreach ($rec in $results.recommendations) {
            $report += "- $rec`n"
        }
    }
    
    # Add next steps section
    $report += @"

## Next Steps

Based on the verification results, consider taking the following actions:

1. ${fix}Run the fix script to address deployment issues: `./fix-vercel-deployment.ps1`
2. ${check}Verify API endpoints are correctly configured in Vercel
3. ${check}Ensure all environment variables are properly set in the Vercel dashboard
4. ${check}Confirm that your vercel.json configuration is correct
"@
    
    $report | Out-File -FilePath $reportFile -Encoding utf8
    
    Write-Host "`nReport generated: $reportFile" -ForegroundColor $successColor
}

# Final advice
if ($results.overallStatus -ne "Pass") {
    Write-Host "`nTo fix the deployment issues, run:" -ForegroundColor $highlightColor
    Write-Host "  ./fix-vercel-deployment.ps1 -Prod" -ForegroundColor $infoColor
}
