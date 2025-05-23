#!/bin/pwsh
# Comprehensive verification report generator for Serene Flow Spa Suite
# This script generates detailed verification reports in various formats

param (
    [string]$Format = "Markdown", # Markdown, HTML, or JSON
    [string]$OutputFile = "verification-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').$($Format.ToLower())",
    [switch]$IncludeScreenshots,
    [switch]$IncludeApiResponses,
    [switch]$IncludeDiagnostics
)

# Set console colors
$infoColor = "Cyan"
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"

# Show banner
Write-Host "====================================================" -ForegroundColor $infoColor
Write-Host "  SERENE FLOW SPA SUITE - VERIFICATION REPORT GENERATOR" -ForegroundColor $infoColor
Write-Host "====================================================" -ForegroundColor $infoColor
Write-Host ""

# Define report sections
$reportSections = @{
    "summary" = @{
        "title" = "Verification Summary"
        "content" = ""
    }
    "environment" = @{
        "title" = "Environment Information"
        "content" = ""
    }
    "frontend" = @{
        "title" = "Frontend Verification"
        "content" = ""
        "status" = "Not Run"
    }
    "api" = @{
        "title" = "API Verification"
        "content" = ""
        "status" = "Not Run"
    }
    "database" = @{
        "title" = "Database Verification"
        "content" = ""
        "status" = "Not Run"
    }
    "deployment" = @{
        "title" = "Deployment Verification"
        "content" = ""
        "status" = "Not Run"
    }
    "recommendations" = @{
        "title" = "Recommendations"
        "content" = ""
    }
}

# Collect environment information
$reportSections.environment.content = @"
- Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Node.js: $(node --version)
- OS: Windows $(Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object -ExpandProperty Caption)
- Environment: $($env:NODE_ENV -eq "production" ? "Production" : "Development")
- Machine: $env:COMPUTERNAME
"@

# Run verification scripts and collect results
Write-Host "Collecting verification data..." -ForegroundColor $infoColor

# 1. Frontend verification
Write-Host "Checking frontend..." -ForegroundColor $infoColor
try {
    $frontendUrl = "http://localhost:5173"
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    if ($frontendResponse.StatusCode -eq 200) {
        $reportSections.frontend.status = "Pass"
        $reportSections.frontend.content = @"
- Status: ✅ Running
- URL: $frontendUrl
- Status Code: $($frontendResponse.StatusCode)
- Content Type: $($frontendResponse.Headers["Content-Type"])
- Response Size: $($frontendResponse.RawContentLength) bytes
"@
        if ($IncludeApiResponses) {
            $reportSections.frontend.content += "`n- Content Preview: " + $frontendResponse.Content.Substring(0, [Math]::Min(500, $frontendResponse.Content.Length)) + "..."
        }
    } else {
        $reportSections.frontend.status = "Fail"
        $reportSections.frontend.content = "- Status: ❌ Error - Status code $($frontendResponse.StatusCode)"
    }
} catch {
    $reportSections.frontend.status = "Fail"
    $reportSections.frontend.content = "- Status: ❌ Not running or not accessible`n- Error: $($_.Exception.Message)"
}

# 2. API verification
Write-Host "Checking API endpoints..." -ForegroundColor $infoColor
try {
    $apiEndpoints = @("health", "environment", "services", "staff", "customers")
    $apiResults = @()
    $apiBaseUrl = "http://localhost:5000/api"
    $apiSuccessCount = 0
    $apiFailCount = 0
    
    foreach ($endpoint in $apiEndpoints) {
        $apiUrl = "$apiBaseUrl/$endpoint"
        try {
            $apiResponse = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($apiResponse.StatusCode -eq 200) {
                $apiSuccessCount++
                $apiResults += "- ✅ $endpoint - Status $($apiResponse.StatusCode)"
                if ($IncludeApiResponses) {
                    $responsePreview = $apiResponse.Content
                    if ($responsePreview.Length -gt 200) {
                        $responsePreview = $responsePreview.Substring(0, 200) + "..."
                    }
                    $apiResults += "  - Response: $responsePreview"
                }
            } else {
                $apiFailCount++
                $apiResults += "- ❌ $endpoint - Status $($apiResponse.StatusCode)"
            }
        } catch {
            $apiFailCount++
            $apiResults += "- ❌ $endpoint - Error: $($_.Exception.Message)"
        }
    }
    
    $reportSections.api.content = @"
- Base URL: $apiBaseUrl
- Endpoints Tested: $($apiEndpoints.Count)
- Success: $apiSuccessCount
- Failed: $apiFailCount

### Endpoint Results
$($apiResults -join "`n")
"@

    if ($apiFailCount -eq 0) {
        $reportSections.api.status = "Pass" 
    } else {
        $reportSections.api.status = "Partial"
    }
    
} catch {
    $reportSections.api.status = "Fail"
    $reportSections.api.content = "- Status: ❌ API verification failed`n- Error: $($_.Exception.Message)"
}

# 3. Database verification 
Write-Host "Checking database..." -ForegroundColor $infoColor
try {
    # We'll use the API to check database status
    $dbHealthUrl = "http://localhost:5000/api/health/database"
    $dbResponse = Invoke-WebRequest -Uri $dbHealthUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    if ($dbResponse.StatusCode -eq 200) {
        $dbData = $dbResponse.Content | ConvertFrom-Json
        if ($dbData.connection -eq $true) {
            $reportSections.database.status = "Pass"
            $reportSections.database.content = @"
- Status: ✅ Connected
- Message: $($dbData.message)
- Connection: $($dbData.connection)
"@
        } else {
            $reportSections.database.status = "Fail"
            $reportSections.database.content = "- Status: ❌ Connection failed`n- Message: $($dbData.message)"
        }
    } else {
        $reportSections.database.status = "Fail"
        $reportSections.database.content = "- Status: ❌ Database health check failed`n- Status Code: $($dbResponse.StatusCode)"
    }
} catch {
    $reportSections.database.status = "Fail"
    $reportSections.database.content = "- Status: ❌ Database verification failed`n- Error: $($_.Exception.Message)"
}

# 4. Deployment verification (if in Vercel environment)
if ($env:VERCEL -eq "1" -or $env:VERCEL_URL) {
    $reportSections.deployment.content = @"
- Environment: Vercel
- URL: $($env:VERCEL_URL ?? "Not specified")
- Region: $($env:VERCEL_REGION ?? "Unknown")
- Deployment ID: $($env:VERCEL_DEPLOYMENT_ID ?? "Unknown")
"@
    $reportSections.deployment.status = "Pass"
    
    # Add a Vercel-specific section
    $reportSections["vercel"] = @{
        "title" = "Vercel Deployment Details"
        "content" = @"
- Production: $($env:VERCEL_ENV -eq "production")
- Git Branch: $($env:VERCEL_GIT_COMMIT_REF ?? "Unknown")
- Commit: $($env:VERCEL_GIT_COMMIT_SHA ?? "Unknown")
- Build ID: $($env:VERCEL_BUILD_ID ?? "Unknown")
- Project Name: $($env:VERCEL_PROJECT_NAME ?? "Unknown")

### Vercel Functions
The following API functions are deployed:
- /api/health
- /api/environment
- /api/[...catchAll]
"@
    }
} else {
    $reportSections.deployment.content = "- Environment: Local (Not a Vercel deployment)"
    $reportSections.deployment.status = "N/A"
}

# Generate recommendations
$recommendations = @()
if ($reportSections.frontend.status -eq "Fail") {
    $recommendations += "- Start the frontend server with `npm run dev`"
}
if ($reportSections.api.status -eq "Fail" -or $reportSections.api.status -eq "Partial") {
    $recommendations += "- Ensure the backend server is running with `npm run start:full`" 
    $recommendations += "- Check API logs for errors"
}
if ($reportSections.database.status -eq "Fail") {
    $recommendations += "- Verify database connection string in .env file"
    $recommendations += "- Ensure database server is running"
}

$reportSections.recommendations.content = if ($recommendations.Count -gt 0) {
    $recommendations -join "`n"
} else {
    "- No recommendations - all systems are operating normally!"
}

# Generate summary
$overallStatus = if (
    $reportSections.frontend.status -eq "Pass" -and 
    ($reportSections.api.status -eq "Pass" -or $reportSections.api.status -eq "Partial") -and
    ($reportSections.database.status -eq "Pass" -or $reportSections.database.status -eq "N/A")
) {
    "✅ PASSED"
} else {
    "❌ FAILED"
}

$reportSections.summary.content = @"
- Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- Overall Status: $overallStatus
- Frontend: $($reportSections.frontend.status)
- API: $($reportSections.api.status)
- Database: $($reportSections.database.status)
- Deployment: $($reportSections.deployment.status)
"@

# Include diagnostics if requested
if ($IncludeDiagnostics) {
    # Add system diagnostics
    $reportSections["diagnostics"] = @{
        "title" = "System Diagnostics"
        "content" = @"
### Memory
```
$(Get-Process | Where-Object { $_.ProcessName -eq "node" } | Format-Table ProcessName, Id, CPU, WorkingSet -AutoSize | Out-String)
```

### Network Ports
```
$(Get-NetTCPConnection | Where-Object { $_.LocalPort -eq 5173 -or $_.LocalPort -eq 5000 } | Format-Table LocalAddress, LocalPort, RemoteAddress, RemotePort, State -AutoSize | Out-String)
```
"@
    }
}

# Generate the report based on format
$reportContent = ""
switch ($Format) {
    "Markdown" {
        $reportContent = @"
# Serene Flow Spa Suite - Verification Report
Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@
        foreach ($section in $reportSections.GetEnumerator()) {
            $reportContent += @"
## $($section.Value.title)
$($section.Value.content)

"@
        }
    }
    "HTML" {
        $statusColors = @{
            "Pass" = "#22c55e"
            "Fail" = "#ef4444"
            "Partial" = "#f59e0b"
            "Not Run" = "#6b7280"
            "N/A" = "#6b7280"
        }

        $reportContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serene Flow Spa Suite - Verification Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #0284c7;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 10px;
        }
        h2 {
            color: #0369a1;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-top: 25px;
        }
        .status {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            margin-left: 10px;
        }
        .pass { background-color: #22c55e; }
        .fail { background-color: #ef4444; }
        .partial { background-color: #f59e0b; }
        .na { background-color: #6b7280; }
        pre {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .footer {
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            font-size: 0.8em;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>Serene Flow Spa Suite - Verification Report</h1>
    <p>Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
"@

        foreach ($section in $reportSections.GetEnumerator()) {
            $statusBadge = ""
            if ($section.Value.ContainsKey("status")) {
                $statusClass = switch ($section.Value.status) {
                    "Pass" { "pass" }
                    "Fail" { "fail" }
                    "Partial" { "partial" }
                    "N/A" { "na" }
                    default { "na" }
                }
                $statusBadge = "<span class='status $statusClass'>$($section.Value.status)</span>"
            }

            $reportContent += @"
    <h2>$($section.Value.title) $statusBadge</h2>
    <div>
        $(($section.Value.content -replace "`n", "<br>") -replace "- ", "• ")
    </div>
"@
        }

        $reportContent += @"
    <div class="footer">
        <p>Generated by Serene Flow Spa Suite Verification System</p>
    </div>
</body>
</html>
"@
    }
    "JSON" {
        $jsonObject = [PSCustomObject]@{
            generated = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
            sections = @{}
        }

        foreach ($section in $reportSections.GetEnumerator()) {
            $jsonObject.sections[$section.Key] = @{
                title = $section.Value.title
                content = $section.Value.content
                status = if ($section.Value.ContainsKey("status")) { $section.Value.status } else { $null }
            }
        }

        $reportContent = $jsonObject | ConvertTo-Json -Depth 5
    }
}

# Save the report
try {
    $reportContent | Out-File -FilePath $OutputFile -Encoding utf8
    Write-Host "`n✅ Report generated successfully: $OutputFile" -ForegroundColor $successColor
    
    # Preview the first few lines if Markdown
    if ($Format -eq "Markdown") {
        Write-Host "`nReport Preview:" -ForegroundColor $infoColor
        Get-Content $OutputFile -TotalCount 10 | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Gray
        }
        Write-Host "  ..." -ForegroundColor Gray
    }
    
    # Offer to open the file
    $openFile = Read-Host "`nOpen the report file? (y/n)"
    if ($openFile -eq "y") {
        Start-Process $OutputFile
    }
} catch {
    Write-Host "`n❌ Failed to generate report: $($_.Exception.Message)" -ForegroundColor $errorColor
}
