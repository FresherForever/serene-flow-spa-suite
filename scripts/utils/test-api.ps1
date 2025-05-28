# API Test Script for Serene Flow Spa Suite
# This PowerShell script tests all API endpoints in both local and Vercel environments

param (
    [switch]$Vercel,
    [string]$VercelUrl = $env:VERCEL_URL,
    [switch]$Detailed,
    [switch]$QuietMode,
    [string]$OutputFile
)

# Set colors for better readability
$infoColor = "Cyan"
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"
$titleColor = "Magenta"

# Print header
if (-not $QuietMode) {
    Write-Host "=======================================================" -ForegroundColor $titleColor
    Write-Host "SERENE FLOW SPA SUITE - API ENDPOINT TESTING" -ForegroundColor $titleColor
    Write-Host "=======================================================" -ForegroundColor $titleColor
    Write-Host ""
}

# Set up base URLs
if ($Vercel) {
    if ([string]::IsNullOrEmpty($VercelUrl)) {
        Write-Host "ERROR: No Vercel URL provided. Use -VercelUrl parameter or set VERCEL_URL environment variable." -ForegroundColor $errorColor
        exit 1
    }
    
    $baseUrl = $VercelUrl
    if (-not $baseUrl.StartsWith("http")) {
        $baseUrl = "https://$baseUrl"
    }
    
    $apiBaseUrl = "$baseUrl/api"
    Write-Host "Testing Vercel deployment API at: $baseUrl" -ForegroundColor $infoColor
} else {
    $baseUrl = "http://localhost:5173"
    $apiBaseUrl = "http://localhost:5000/api"
    Write-Host "Testing local development API" -ForegroundColor $infoColor
}

# List of endpoints to test
$endpoints = @(
    @{ Name = "API Health"; Path = "health"; Method = "GET"; ExpectedStatus = 200 },
    @{ Name = "Services List"; Path = "services"; Method = "GET"; ExpectedStatus = 200 },
    @{ Name = "Staff List"; Path = "staff"; Method = "GET"; ExpectedStatus = 200 },
    @{ Name = "Customers List"; Path = "customers"; Method = "GET"; ExpectedStatus = 200 },
    @{ Name = "Appointments List"; Path = "appointments"; Method = "GET"; ExpectedStatus = 200 }
)

if ($Vercel) {
    $endpoints += @{ Name = "Vercel Test"; Path = "test"; Method = "GET"; ExpectedStatus = 200 }
}

# Function to test an API endpoint
function Test-ApiEndpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "`n------------------------------------------------------" -ForegroundColor Gray
    Write-Host "Testing $Name endpoint: $Method $Url" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        $response = Invoke-WebRequest @params
        $statusColor = if ($response.StatusCode -eq $ExpectedStatus) { "Green" } else { "Red" }
        
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor $statusColor
        
        # Try to parse response as JSON
        try {
            $content = $response.Content | ConvertFrom-Json
            
            # Display content summary based on type
            if ($content -is [System.Array]) {
                Write-Host "Response: Array with $($content.Length) items" -ForegroundColor Cyan
                if ($content.Length -gt 0) {
                    Write-Host "Sample item:" -ForegroundColor Cyan
                    $content[0] | Format-List | Out-String | Write-Host
                }
            } else {
                Write-Host "Response:" -ForegroundColor Cyan
                $content | Format-List | Out-String | Write-Host
            }
        } catch {
            Write-Host "Response: (Not JSON or couldn't parse)" -ForegroundColor Red
            Write-Host $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
        }
        
        return @{
            Success = $response.StatusCode -eq $ExpectedStatus
            StatusCode = $response.StatusCode
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get status code from exception
        $statusCode = $null
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            Write-Host "Status code: $statusCode" -ForegroundColor Red
        }
        
        return @{
            Success = $false
            StatusCode = $statusCode
            Error = $_.Exception.Message
        }
    }
}

# Run all tests
$results = @()

foreach ($endpoint in $endpoints) {
    $url = "$apiBaseUrl/$($endpoint.Path)"
    $result = Test-ApiEndpoint -Name $endpoint.Name -Url $url -Method $endpoint.Method -ExpectedStatus $endpoint.ExpectedStatus
    
    $results += [PSCustomObject]@{
        Endpoint = $endpoint.Name
        Path = $endpoint.Path
        Success = $result.Success
        StatusCode = $result.StatusCode
        Error = $result.Error
    }
}

# Display results summary
Write-Host "`n`n=======================================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

$successCount = ($results | Where-Object { $_.Success -eq $true }).Count
$failCount = ($results | Where-Object { $_.Success -eq $false }).Count

Write-Host "Environment: $($Vercel ? "Vercel ($baseUrl)" : "Local Development")" -ForegroundColor White
Write-Host "Endpoints Tested: $($results.Count)" -ForegroundColor White
Write-Host "Successful: $successCount" -ForegroundColor $(if ($successCount -gt 0) { "Green" } else { "Gray" })
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })

if ($failCount -gt 0) {
    Write-Host "`nFailed Endpoints:" -ForegroundColor Yellow
    $results | Where-Object { $_.Success -eq $false } | Format-Table -Property Endpoint, Path, StatusCode, Error -AutoSize
}

Write-Host "`nDetailed Results:" -ForegroundColor Yellow
$results | Format-Table -Property Endpoint, Path, @{
    Label = "Status"; 
    Expression = { 
        if ($_.Success) { "✅ PASS" } else { "❌ FAIL" } 
    } 
}, StatusCode -AutoSize

# Exit with appropriate code
if ($failCount -gt 0) {
    exit 1
} else {
    exit 0
}
