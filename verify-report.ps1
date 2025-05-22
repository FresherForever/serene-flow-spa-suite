# Full Deployment Verification Report Generator
# This script generates a comprehensive HTML report comparing local and Vercel deployments

param (
    [switch]$GenerateReport,
    [string]$VercelUrl = $env:VERCEL_URL,
    [string]$OutputFile = "deployment-verification-report.html"
)

# Set console colors
$titleColor = "Cyan"
$successColor = "Green"
$errorColor = "Red"
$infoColor = "Yellow"

# Print header
Write-Host "=======================================================" -ForegroundColor $titleColor
Write-Host "SERENE FLOW SPA SUITE - DEPLOYMENT VERIFICATION REPORT" -ForegroundColor $titleColor
Write-Host "=======================================================" -ForegroundColor $titleColor

# Check if Vercel URL is provided when needed
if (-not $VercelUrl) {
    Write-Host "Note: No Vercel URL provided. Set with -VercelUrl parameter or VERCEL_URL environment variable." -ForegroundColor $infoColor
    Write-Host "Only local environment will be verified." -ForegroundColor $infoColor
}

$reportData = @{
    LocalApi = @{}
    VercelApi = @{}
    GeneratedAt = Get-Date
}

# Function to test an endpoint
function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET"
    )
    
    $result = @{
        Name = $Name
        Url = $Url
        Success = $false
        StatusCode = $null
        ResponseTime = $null
        ResponseSize = $null
        Data = $null
        Error = $null
    }
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -Method $Method -UseBasicParsing -ErrorAction Stop -TimeoutSec 10
        $stopwatch.Stop()
        
        $result.Success = $true
        $result.StatusCode = $response.StatusCode
        $result.ResponseTime = $stopwatch.ElapsedMilliseconds
        $result.ResponseSize = $response.Content.Length
        
        # Try to parse response as JSON
        try {
            $result.Data = $response.Content | ConvertFrom-Json
        } catch {
            $result.Data = $response.Content
        }
        
        return $result
    } catch {
        $stopwatch.Stop()
        
        $result.Success = $false
        $result.Error = $_.Exception.Message
        
        if ($_.Exception.Response) {
            $result.StatusCode = [int]$_.Exception.Response.StatusCode
        }
        
        return $result
    }
}

# Test local environment
Write-Host "`nTesting Local Environment..." -ForegroundColor $titleColor

$localBaseUrl = "http://localhost:5000/api"
$localEndpoints = @(
    @{ Name = "Health Check"; Path = "health" },
    @{ Name = "Services"; Path = "services" },
    @{ Name = "Staff"; Path = "staff" },
    @{ Name = "Customers"; Path = "customers" },
    @{ Name = "Appointments"; Path = "appointments" }
)

$localResults = @{}
foreach ($endpoint in $localEndpoints) {
    $url = "$localBaseUrl/$($endpoint.Path)"
    Write-Host "  Testing $($endpoint.Name) endpoint: $url" -ForegroundColor $infoColor
    
    $result = Test-Endpoint -Name $endpoint.Name -Url $url
    $localResults[$endpoint.Path] = $result
    
    if ($result.Success) {
        Write-Host "    ✅ Success (${$result.StatusCode}) - ${$result.ResponseTime}ms" -ForegroundColor $successColor
    } else {
        Write-Host "    ❌ Failed: $($result.Error)" -ForegroundColor $errorColor
    }
}

$reportData.LocalApi = $localResults

# Test Vercel environment if URL is provided
if ($VercelUrl) {
    Write-Host "`nTesting Vercel Environment..." -ForegroundColor $titleColor
    
    # Normalize the URL
    if (-not $VercelUrl.StartsWith("http")) {
        $VercelUrl = "https://$VercelUrl"
    }
    
    $vercelBaseUrl = "$VercelUrl/api"
    $vercelEndpoints = @(
        @{ Name = "Health Check"; Path = "health" },
        @{ Name = "Vercel Test"; Path = "test" },
        @{ Name = "Services"; Path = "services" },
        @{ Name = "Staff"; Path = "staff" },
        @{ Name = "Customers"; Path = "customers" },
        @{ Name = "Appointments"; Path = "appointments" }
    )
    
    $vercelResults = @{}
    foreach ($endpoint in $vercelEndpoints) {
        $url = "$vercelBaseUrl/$($endpoint.Path)"
        Write-Host "  Testing $($endpoint.Name) endpoint: $url" -ForegroundColor $infoColor
        
        $result = Test-Endpoint -Name $endpoint.Name -Url $url
        $vercelResults[$endpoint.Path] = $result
        
        if ($result.Success) {
            Write-Host "    ✅ Success (${$result.StatusCode}) - ${$result.ResponseTime}ms" -ForegroundColor $successColor
        } else {
            Write-Host "    ❌ Failed: $($result.Error)" -ForegroundColor $errorColor
        }
    }
    
    $reportData.VercelApi = $vercelResults
}

# Print summary
Write-Host "`n=======================================================" -ForegroundColor $titleColor
Write-Host "VERIFICATION SUMMARY" -ForegroundColor $titleColor
Write-Host "=======================================================" -ForegroundColor $titleColor

# Local summary
$localSuccessCount = ($localResults.Values | Where-Object { $_.Success -eq $true }).Count
$localTotal = $localResults.Count
Write-Host "`nLocal Environment: $localSuccessCount/$localTotal endpoints available" -ForegroundColor $(if ($localSuccessCount -eq $localTotal) { $successColor } else { $errorColor })

# Vercel summary
if ($VercelUrl) {
    $vercelSuccessCount = ($vercelResults.Values | Where-Object { $_.Success -eq $true }).Count
    $vercelTotal = $vercelResults.Count
    Write-Host "Vercel Environment: $vercelSuccessCount/$vercelTotal endpoints available" -ForegroundColor $(if ($vercelSuccessCount -eq $vercelTotal) { $successColor } else { $errorColor })
}

# Generate HTML report if requested
if ($GenerateReport) {
    Write-Host "`nGenerating HTML report..." -ForegroundColor $infoColor
    
    $htmlReport = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serene Flow Spa Suite - Deployment Verification Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #4a5568;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        h2 {
            color: #4a5568;
            margin-top: 30px;
        }
        .report-meta {
            background-color: #f7fafc;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 30px;
        }
        .environment {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .environment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .badge {
            font-size: 14px;
            font-weight: 500;
            padding: 4px 12px;
            border-radius: 9999px;
        }
        .badge-success {
            background-color: #c6f6d5;
            color: #22543d;
        }
        .badge-error {
            background-color: #fed7d7;
            color: #822727;
        }
        .badge-info {
            background-color: #e6fffa;
            color: #234e52;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        th {
            background-color: #f7fafc;
            font-weight: 600;
        }
        tr:hover {
            background-color: #f7fafc;
        }
        .success {
            color: #2f855a;
        }
        .error {
            color: #c53030;
        }
        .response-data {
            max-height: 300px;
            overflow: auto;
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 12px;
            white-space: pre-wrap;
            margin-top: 10px;
        }
        .comparison {
            margin-top: 40px;
        }
        .comparison table {
            table-layout: fixed;
        }
        .comparison th, .comparison td {
            width: 50%;
        }
    </style>
</head>
<body>
    <h1>Serene Flow Spa Suite - Deployment Verification Report</h1>
    
    <div class="report-meta">
        <p><strong>Generated:</strong> $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
        <p><strong>Local URL:</strong> http://localhost:5173</p>
        <p><strong>Vercel URL:</strong> $($VercelUrl ? $VercelUrl : "Not provided")</p>
    </div>
"@

    # Local Environment Section
    $localSuccessRate = [math]::Round(($localSuccessCount / $localTotal) * 100)
    $localStatusBadge = if ($localSuccessCount -eq $localTotal) { "badge-success" } else { "badge-error" }
    
    $htmlReport += @"
    <div class="environment">
        <div class="environment-header">
            <h2>Local Environment</h2>
            <span class="badge $localStatusBadge">$localSuccessCount/$localTotal endpoints available ($localSuccessRate%)</span>
        </div>
        
        <table>
            <tr>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Details</th>
            </tr>
"@

    foreach ($key in $localResults.Keys) {
        $result = $localResults[$key]
        $statusClass = if ($result.Success) { "success" } else { "error" }
        $statusText = if ($result.Success) { "✅ Success ($($result.StatusCode))" } else { "❌ Failed" }
        $responseTime = if ($result.ResponseTime) { "$($result.ResponseTime) ms" } else { "N/A" }
        $details = if ($result.Success) { 
            "Response Size: $($result.ResponseSize) bytes" 
        } else { 
            $result.Error 
        }
        
        $htmlReport += @"
            <tr>
                <td>$($result.Name)<br><small>$($result.Url)</small></td>
                <td class="$statusClass">$statusText</td>
                <td>$responseTime</td>
                <td>$details</td>
            </tr>
"@
    }

    $htmlReport += @"
        </table>
"@

    # Add response data sections for local environment
    foreach ($key in $localResults.Keys) {
        $result = $localResults[$key]
        if ($result.Success -and $result.Data) {
            $jsonData = ConvertTo-Json $result.Data -Depth 4
            $htmlReport += @"
        <details>
            <summary><strong>$($result.Name) Response Data</strong></summary>
            <div class="response-data">$jsonData</div>
        </details>
"@
        }
    }

    $htmlReport += @"
    </div>
"@

    # Vercel Environment Section (if available)
    if ($VercelUrl) {
        $vercelSuccessRate = [math]::Round(($vercelSuccessCount / $vercelTotal) * 100)
        $vercelStatusBadge = if ($vercelSuccessCount -eq $vercelTotal) { "badge-success" } else { "badge-error" }
        
        $htmlReport += @"
    <div class="environment">
        <div class="environment-header">
            <h2>Vercel Environment</h2>
            <span class="badge $vercelStatusBadge">$vercelSuccessCount/$vercelTotal endpoints available ($vercelSuccessRate%)</span>
        </div>
        
        <table>
            <tr>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Details</th>
            </tr>
"@

        foreach ($key in $vercelResults.Keys) {
            $result = $vercelResults[$key]
            $statusClass = if ($result.Success) { "success" } else { "error" }
            $statusText = if ($result.Success) { "✅ Success ($($result.StatusCode))" } else { "❌ Failed" }
            $responseTime = if ($result.ResponseTime) { "$($result.ResponseTime) ms" } else { "N/A" }
            $details = if ($result.Success) { 
                "Response Size: $($result.ResponseSize) bytes" 
            } else { 
                $result.Error 
            }
            
            $htmlReport += @"
            <tr>
                <td>$($result.Name)<br><small>$($result.Url)</small></td>
                <td class="$statusClass">$statusText</td>
                <td>$responseTime</td>
                <td>$details</td>
            </tr>
"@
        }

        $htmlReport += @"
        </table>
"@

        # Add response data sections for Vercel environment
        foreach ($key in $vercelResults.Keys) {
            $result = $vercelResults[$key]
            if ($result.Success -and $result.Data) {
                $jsonData = ConvertTo-Json $result.Data -Depth 4
                $htmlReport += @"
        <details>
            <summary><strong>$($result.Name) Response Data</strong></summary>
            <div class="response-data">$jsonData</div>
        </details>
"@
            }
        }

        $htmlReport += @"
    </div>
"@

        # Add environment comparison
        if ($VercelUrl) {
            $htmlReport += @"
    <div class="comparison">
        <h2>Environment Comparison</h2>
        
        <table>
            <tr>
                <th>Feature</th>
                <th>Local Environment</th>
                <th>Vercel Environment</th>
            </tr>
"@

            # Compare health endpoint
            $localHealth = $localResults["health"]
            $vercelHealth = $vercelResults["health"]
            
            $htmlReport += @"
            <tr>
                <td>API Status</td>
                <td class="$($localHealth.Success ? 'success' : 'error')">$($localHealth.Success ? '✅ Online' : '❌ Offline')</td>
                <td class="$($vercelHealth.Success ? 'success' : 'error')">$($vercelHealth.Success ? '✅ Online' : '❌ Offline')</td>
            </tr>
"@

            # Compare response times
            $localAvgTime = if ($localResults.Values.ResponseTime) { 
                [math]::Round(($localResults.Values | Where-Object { $_.ResponseTime } | Measure-Object -Property ResponseTime -Average).Average) 
            } else { 0 }
            
            $vercelAvgTime = if ($vercelResults.Values.ResponseTime) { 
                [math]::Round(($vercelResults.Values | Where-Object { $_.ResponseTime } | Measure-Object -Property ResponseTime -Average).Average) 
            } else { 0 }
            
            $htmlReport += @"
            <tr>
                <td>Average Response Time</td>
                <td>$localAvgTime ms</td>
                <td>$vercelAvgTime ms</td>
            </tr>
"@

            # Compare database status
            $localDbStatus = if ($localHealth.Success -and $localHealth.Data.status -eq "OK") { "Connected" } else { "Not Connected" }
            $vercelDbStatus = if ($vercelResults.ContainsKey("test") -and $vercelResults["test"].Success) {
                if ($vercelResults["test"].Data.database -eq "configured") { "Connected" } else { "Not Connected" }
            } else {
                "Unknown"
            }
            
            $htmlReport += @"
            <tr>
                <td>Database Status</td>
                <td class="$($localDbStatus -eq 'Connected' ? 'success' : 'error')">$($localDbStatus -eq 'Connected' ? '✅' : '❌') $localDbStatus</td>
                <td class="$($vercelDbStatus -eq 'Connected' ? 'success' : ($vercelDbStatus -eq 'Unknown' ? '' : 'error'))">$($vercelDbStatus -eq 'Connected' ? '✅' : ($vercelDbStatus -eq 'Unknown' ? '❓' : '❌')) $vercelDbStatus</td>
            </tr>
"@

            # Compare environment information
            $localEnv = if ($localHealth.Success -and $localHealth.Data.environment) { $localHealth.Data.environment } else { "unknown" }
            $vercelEnv = if ($vercelResults.ContainsKey("test") -and $vercelResults["test"].Success -and $vercelResults["test"].Data.environment) { 
                $vercelResults["test"].Data.environment 
            } else { "unknown" }
            
            $htmlReport += @"
            <tr>
                <td>Environment</td>
                <td>$localEnv</td>
                <td>$vercelEnv</td>
            </tr>
"@

            $htmlReport += @"
        </table>
    </div>
"@
        }
    }

    $htmlReport += @"
    <div class="report-meta">
        <p><strong>Next Steps:</strong></p>
        <ul>
            <li>For detailed verification instructions, see <a href="file:///$pwd/VERIFICATION_GUIDE.md">VERIFICATION_GUIDE.md</a></li>
            <li>For environment comparison information, see <a href="file:///$pwd/ENVIRONMENT_COMPARISON.md">ENVIRONMENT_COMPARISON.md</a></li>
            <li>For troubleshooting deployment issues, see <a href="file:///$pwd/VERCEL_TROUBLESHOOTING_UPDATED.md">VERCEL_TROUBLESHOOTING_UPDATED.md</a></li>
        </ul>
    </div>
</body>
</html>
"@

    # Save the report
    $htmlReport | Out-File -FilePath $OutputFile -Encoding utf8
    Write-Host "Report saved to: $OutputFile" -ForegroundColor $successColor
    
    # Open the report in the default browser
    try {
        Start-Process $OutputFile
        Write-Host "Report opened in your default browser" -ForegroundColor $infoColor
    } catch {
        Write-Host "Could not open the report automatically. Please open it manually." -ForegroundColor $infoColor
    }
}

# Final message with next steps
Write-Host "`nVerification complete. For additional tests and verification:"
Write-Host "  1. Run './verify-database.ps1' to test database connectivity"
Write-Host "  2. Run './test-api.ps1' for detailed API endpoint testing"
Write-Host "  3. Open the application in a browser to check for visual indicators"
Write-Host "  4. Generate a full HTML report with './verify-report.ps1 -GenerateReport'"
Write-Host ""
if (-not $VercelUrl) {
    Write-Host "To verify Vercel deployment, rerun with:"
    Write-Host "  ./verify-report.ps1 -Vercel -VercelUrl 'https://your-app.vercel.app' -GenerateReport"
}
Write-Host ""
