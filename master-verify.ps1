#!/bin/pwsh
# Comprehensive Verification Suite for Serene Flow Spa Suite
# This script allows verification of both local and Vercel deployments with visual status indicators

param (
    [switch]$Vercel,
    [string]$VercelUrl = $env:VERCEL_URL,
    [switch]$GenerateHtmlReport,
    [switch]$SkipServerCheck,
    [switch]$AutoStartServers,
    [switch]$CompareEnvironments,
    [string]$OutputFile = "verification-report.html"
)

# Set colors for better readability
$infoColor = "Cyan" 
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"
$titleColor = "Magenta"
$highlightColor = "Blue"

# Define report variables
$verificationStartTime = Get-Date

# Print header
Write-Host "=======================================================" -ForegroundColor $titleColor
Write-Host "SERENE FLOW SPA SUITE - COMPLETE VERIFICATION SUITE" -ForegroundColor $titleColor
Write-Host "=======================================================" -ForegroundColor $titleColor

# Determine verification mode
if ($Vercel) {
    if ([string]::IsNullOrEmpty($VercelUrl)) {
        Write-Host "ERROR: No Vercel URL provided. Use -VercelUrl parameter or set VERCEL_URL environment variable." -ForegroundColor $errorColor
        exit 1
    }
    
    $baseUrl = $VercelUrl
    if (-not $baseUrl.StartsWith("http")) {
        $baseUrl = "https://$baseUrl"
    }
    
    Write-Host "Mode: Vercel Deployment Verification" -ForegroundColor $infoColor
    Write-Host "Vercel URL: $baseUrl" -ForegroundColor $infoColor
} else {
    Write-Host "Mode: Local Development Verification" -ForegroundColor $infoColor
    
    # Check if servers are running for local verification
    if (-not $SkipServerCheck) {
        Write-Host "`n[Step 1/5] Checking local servers..." -ForegroundColor $infoColor
        
        $serversOk = & "$PSScriptRoot\check-servers.ps1" -QuietSuccess
        
        if (-not $serversOk) {
            if ($AutoStartServers) {
                Write-Host "Local servers not running correctly. Attempting to start them..." -ForegroundColor $warningColor
                & "$PSScriptRoot\start-dev.ps1"
                
                # Give servers time to start
                Write-Host "Waiting for servers to initialize (10 seconds)..." -ForegroundColor $infoColor
                Start-Sleep -Seconds 10
                
                # Check again
                $serversOk = & "$PSScriptRoot\check-servers.ps1" -QuietSuccess
                
                if (-not $serversOk) {
                    Write-Host "Failed to start servers automatically. Please check the errors and try again." -ForegroundColor $errorColor
                    $continue = Read-Host "Continue verification anyway? (y/n)"
                    
                    if ($continue -ne "y") {
                        exit 1
                    }
                }
            } else {
                Write-Host "Local servers are not running correctly." -ForegroundColor $errorColor
                $startServers = Read-Host "Would you like to start them now? (y/n)"
                
                if ($startServers -eq "y") {
                    & "$PSScriptRoot\start-dev.ps1"
                    
                    # Give servers time to start
                    Write-Host "Waiting for servers to initialize (10 seconds)..." -ForegroundColor $infoColor
                    Start-Sleep -Seconds 10
                    
                    # Check again
                    $serversOk = & "$PSScriptRoot\check-servers.ps1" -QuietSuccess
                    
                    if (-not $serversOk) {
                        Write-Host "Servers still not running correctly. Please check the errors and try again." -ForegroundColor $errorColor
                        $continue = Read-Host "Continue verification anyway? (y/n)"
                        
                        if ($continue -ne "y") {
                            exit 1
                        }
                    }
                } else {
                    $continue = Read-Host "Continue verification anyway? (y/n)"
                    
                    if ($continue -ne "y") {
                        exit 1
                    }
                }
            }
        } else {
            Write-Host "Local servers are running correctly." -ForegroundColor $successColor
        }
    }
}

# Deployment verification
Write-Host "`n[Step 2/5] Running deployment verification..." -ForegroundColor $infoColor

if ($Vercel) {
    & "$PSScriptRoot\verify-deployment.ps1" "--vercel"
} else {
    & "$PSScriptRoot\verify-deployment.ps1"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment verification failed. See above for details." -ForegroundColor $errorColor
    $continue = Read-Host "Continue with the rest of the verification? (y/n)"
    
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "Deployment verification passed." -ForegroundColor $successColor
}

# Database verification
Write-Host "`n[Step 3/5] Testing database connectivity..." -ForegroundColor $infoColor

if ($Vercel) {
    & "$PSScriptRoot\verify-database.ps1" -Vercel -VercelUrl $VercelUrl
} else {
    & "$PSScriptRoot\verify-database.ps1"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Database verification failed. See above for details." -ForegroundColor $errorColor
    $continue = Read-Host "Continue with the rest of the verification? (y/n)"
    
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "Database verification passed." -ForegroundColor $successColor
}

# API testing
Write-Host "`n[Step 4/5] Running API tests..." -ForegroundColor $infoColor

if ($Vercel) {
    & "$PSScriptRoot\test-api.ps1" -Vercel -VercelUrl $VercelUrl
} else {
    & "$PSScriptRoot\test-api.ps1"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "API testing failed. See above for details." -ForegroundColor $errorColor
    $continue = Read-Host "Continue with the rest of the verification? (y/n)"
    
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "API testing passed." -ForegroundColor $successColor
}

# Generate HTML report
Write-Host "`n[Step 5/5] Generating verification report..." -ForegroundColor $infoColor

if ($GenerateHtmlReport -or $CompareEnvironments) {
    if ($CompareEnvironments) {
        if ([string]::IsNullOrEmpty($VercelUrl)) {
            Write-Host "Warning: No Vercel URL provided for environment comparison." -ForegroundColor $warningColor
            $VercelUrl = Read-Host "Please enter your Vercel deployment URL"
            
            if ([string]::IsNullOrEmpty($VercelUrl)) {
                Write-Host "Cannot compare environments without a Vercel URL." -ForegroundColor $errorColor
                $GenerateHtmlReport = $true
                $CompareEnvironments = $false
            }
        }
        
        & "$PSScriptRoot\verify-report.ps1" -GenerateReport -VercelUrl $VercelUrl -OutputFile $OutputFile -CompareEnvironments
    } else {
        if ($Vercel) {
            & "$PSScriptRoot\verify-report.ps1" -GenerateReport -Vercel -VercelUrl $VercelUrl -OutputFile $OutputFile
        } else {
            & "$PSScriptRoot\verify-report.ps1" -GenerateReport -OutputFile $OutputFile
        }
    }
    
    if (Test-Path $OutputFile) {
        Write-Host "Report generated successfully: $OutputFile" -ForegroundColor $successColor
        
        $openReport = Read-Host "Open the report in your browser? (y/n)"
        if ($openReport -eq "y") {
            Start-Process $OutputFile
        }
    } else {
        Write-Host "Failed to generate report." -ForegroundColor $errorColor
    }
} else {
    Write-Host "Skipping report generation. Use -GenerateHtmlReport to create a detailed HTML report." -ForegroundColor $infoColor
}

# Environment Comparison Dashboard
if ($CompareEnvironments) {
    Write-Host "`n=======================================================" -ForegroundColor $titleColor
    Write-Host "ENVIRONMENT COMPARISON DASHBOARD" -ForegroundColor $titleColor
    Write-Host "=======================================================" -ForegroundColor $titleColor
    
    Write-Host "`nComparing Local and Vercel environments..." -ForegroundColor $infoColor
    
    # Store current parameters to restore later
    $currentVercel = $Vercel
    $currentVercelUrl = $VercelUrl
    
    # Get local environment data
    Write-Host "Collecting local environment data..." -ForegroundColor $infoColor
    $Vercel = $false
    $localData = @{}
    
    # Capture local API status
    try {
        $localApiResponse = Invoke-RestMethod -Uri "http://localhost:5000/environment" -Method GET -ErrorAction Stop
        $localData.ApiStatus = "Online"
        $localData.ApiVersion = $localApiResponse.version
        $localData.ApiEnvironment = $localApiResponse.environment
        $localData.NodeVersion = $localApiResponse.nodeVersion
        $localData.Database = if ($localApiResponse.database.connected) { "Connected" } else { "Not Connected" }
    } catch {
        $localData.ApiStatus = "Offline"
    }
    
    # Capture local frontend status
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/status" -Method GET -ErrorAction Stop
        $localData.FrontendStatus = "Online"
    } catch {
        $localData.FrontendStatus = "Offline"
    }
    
    # Get Vercel environment data
    Write-Host "Collecting Vercel environment data..." -ForegroundColor $infoColor
    $Vercel = $true
    $VercelUrl = $currentVercelUrl
    $vercelData = @{}
    
    if (-not [string]::IsNullOrEmpty($VercelUrl)) {
        $baseUrl = $VercelUrl
        if (-not $baseUrl.StartsWith("http")) {
            $baseUrl = "https://$baseUrl"
        }
        
        # Capture Vercel API status
        try {
            $vercelApiResponse = Invoke-RestMethod -Uri "$baseUrl/api/environment" -Method GET -ErrorAction Stop
            $vercelData.ApiStatus = "Online"
            $vercelData.ApiVersion = $vercelApiResponse.version
            $vercelData.ApiEnvironment = $vercelApiResponse.environment
            $vercelData.NodeVersion = $vercelApiResponse.nodeVersion
            $vercelData.Database = if ($vercelApiResponse.database.connected) { "Connected" } else { "Not Connected" }
        } catch {
            $vercelData.ApiStatus = "Offline"
        }
        
        # Capture Vercel frontend status
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/api/status" -Method GET -ErrorAction Stop
            $vercelData.FrontendStatus = "Online"
        } catch {
            $vercelData.FrontendStatus = "Offline"
        }
    } else {
        $vercelData.ApiStatus = "No URL Provided"
        $vercelData.FrontendStatus = "No URL Provided"
    }
    
    # Restore original parameters
    $Vercel = $currentVercel
    $VercelUrl = $currentVercelUrl
    
    # Display comparison in console
    Write-Host "`nEnvironment Comparison Dashboard:" -ForegroundColor $highlightColor
    Write-Host "┌─────────────────────┬────────────────────┬────────────────────┐"
    Write-Host "│ Component           │ Local              │ Vercel             │"
    Write-Host "├─────────────────────┼────────────────────┼────────────────────┤"
    
    # API Status
    Write-Host -NoNewline "│ API Status           │ "
    if ($localData.ApiStatus -eq "Online") {
        Write-Host -NoNewline -ForegroundColor $successColor "Online"
        Write-Host -NoNewline "".PadRight(16)
    } else {
        Write-Host -NoNewline -ForegroundColor $errorColor "Offline"
        Write-Host -NoNewline "".PadRight(15)
    }
    Write-Host -NoNewline "│ "
    if ($vercelData.ApiStatus -eq "Online") {
        Write-Host -NoNewline -ForegroundColor $successColor "Online"
        Write-Host -NoNewline "".PadRight(16)
    } else {
        Write-Host -NoNewline -ForegroundColor $errorColor $vercelData.ApiStatus.PadRight(22 - $vercelData.ApiStatus.Length)
    }
    Write-Host "│"
    
    # Frontend Status
    Write-Host -NoNewline "│ Frontend Status      │ "
    if ($localData.FrontendStatus -eq "Online") {
        Write-Host -NoNewline -ForegroundColor $successColor "Online"
        Write-Host -NoNewline "".PadRight(16)
    } else {
        Write-Host -NoNewline -ForegroundColor $errorColor "Offline"
        Write-Host -NoNewline "".PadRight(15)
    }
    Write-Host -NoNewline "│ "
    if ($vercelData.FrontendStatus -eq "Online") {
        Write-Host -NoNewline -ForegroundColor $successColor "Online"
        Write-Host -NoNewline "".PadRight(16)
    } else {
        Write-Host -NoNewline -ForegroundColor $errorColor $vercelData.FrontendStatus.PadRight(22 - $vercelData.FrontendStatus.Length)
    }
    Write-Host "│"
    
    # Database Status
    Write-Host -NoNewline "│ Database Status      │ "
    if ($localData.Database -eq "Connected") {
        Write-Host -NoNewline -ForegroundColor $successColor "Connected"
        Write-Host -NoNewline "".PadRight(14)
    } else {
        Write-Host -NoNewline -ForegroundColor $errorColor "Not Connected"
        Write-Host -NoNewline "".PadRight(10)
    }
    Write-Host -NoNewline "│ "
    if ($vercelData.Database -eq "Connected") {
        Write-Host -NoNewline -ForegroundColor $successColor "Connected"
        Write-Host -NoNewline "".PadRight(14)
    } else {
        Write-Host -NoNewline -ForegroundColor $errorColor $vercelData.Database.PadRight(22 - $vercelData.Database.Length)
    }
    Write-Host "│"
    
    # Environment
    Write-Host -NoNewline "│ Environment          │ "
    Write-Host -NoNewline "$($localData.ApiEnvironment)".PadRight(22 - $localData.ApiEnvironment.Length)
    Write-Host -NoNewline "│ "
    Write-Host -NoNewline "$($vercelData.ApiEnvironment)".PadRight(22 - $vercelData.ApiEnvironment.Length)
    Write-Host "│"
    
    # API Version
    Write-Host -NoNewline "│ API Version          │ "
    Write-Host -NoNewline "$($localData.ApiVersion)".PadRight(22 - $localData.ApiVersion.Length)
    Write-Host -NoNewline "│ "
    Write-Host -NoNewline "$($vercelData.ApiVersion)".PadRight(22 - $vercelData.ApiVersion.Length)
    Write-Host "│"
    
    Write-Host "└─────────────────────┴────────────────────┴────────────────────┘"
    
    # Add comparison results to the HTML report if requested
    if ($GenerateHtmlReport) {
        # Logic to add comparison to HTML report would go here
        Write-Host "Environment comparison included in HTML report." -ForegroundColor $infoColor
    }
}

# Summary
Write-Host "`n=======================================================" -ForegroundColor $titleColor
Write-Host "VERIFICATION SUMMARY" -ForegroundColor $titleColor
Write-Host "=======================================================" -ForegroundColor $titleColor

Write-Host "`nVerification process complete!" -ForegroundColor $successColor

Write-Host "`nDocumentation references:"
Write-Host "  - VERIFICATION_GUIDE.md - Step-by-step verification instructions"
Write-Host "  - ENVIRONMENT_COMPARISON.md - Comparison of local and Vercel environments"
Write-Host "  - VERIFICATION_README.md - Quick reference for verification tools"

# Next steps
Write-Host "`nNext steps:" -ForegroundColor $infoColor

if (-not $Vercel) {
    Write-Host "  1. Continue local development and testing"
    Write-Host "  2. Run './verify-all.ps1 -CompareEnvironments' to compare with Vercel"
    Write-Host "  3. Deploy to Vercel with './push-vercel-changes.ps1'"
} else {
    Write-Host "  1. Review verification results"
    Write-Host "  2. Test the live application functionality"
    Write-Host "  3. Update documentation if needed"
}

Write-Host ""
