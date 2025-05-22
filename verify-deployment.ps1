# Verification Script for Serene Flow Spa Suite
# This PowerShell script helps verify both localhost and Vercel deployments

Write-Host "======================================================="
Write-Host "Serene Flow Spa Suite - Deployment Verification Script"
Write-Host "======================================================="

# Check command line arguments
$vercel = $args[0] -eq "--vercel"
if ($vercel) {
    $baseUrl = $env:VERCEL_URL -or "https://your-vercel-app-url.vercel.app"
    $apiBaseUrl = "$baseUrl/api"
    Write-Host "Verifying Vercel deployment at: $baseUrl"
} else {
    $baseUrl = "http://localhost:5173"
    $apiBaseUrl = "http://localhost:5000/api"
    Write-Host "Verifying localhost deployment"
}

Write-Host "`nEnvironment Information:"
Write-Host "- Frontend URL: $baseUrl"
Write-Host "- API URL: $apiBaseUrl"
Write-Host "- Environment: $($vercel ? 'Vercel (Production)' : 'Localhost (Development)')"

# Function to test an endpoint
function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "`nTesting $Name endpoint: $Url"
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ SUCCESS: Status $($response.StatusCode)"
        
        # Try to parse response as JSON
        try {
            $content = $response.Content | ConvertFrom-Json
            if ($content.status) {
                Write-Host "  Status: $($content.status)"
            }
            if ($content.environment) {
                Write-Host "  Environment: $($content.environment)"
            }
            if ($content.database) {
                Write-Host "  Database: $($content.database)"
            }
            if ($content.length -gt 0) {
                Write-Host "  Items: $($content.length)"
            }
        } catch {
            # Not JSON or couldn't parse
            Write-Host "  Content length: $($response.Content.Length) characters"
        }
        
        return $true
    } catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)"
        return $false
    }
}

# Test API health endpoint
$healthSuccess = Test-Endpoint -Name "API Health" -Url "$apiBaseUrl/health"

# Test services endpoint
$servicesSuccess = Test-Endpoint -Name "Services API" -Url "$apiBaseUrl/services" 

# Test frontend URL
$frontendSuccess = Test-Endpoint -Name "Frontend" -Url $baseUrl

# Test Vercel-specific endpoint if applicable
$vercelTestSuccess = $true
if ($vercel) {
    $vercelTestSuccess = Test-Endpoint -Name "Vercel Test" -Url "$apiBaseUrl/test"
}

# Summary
Write-Host "`n======================================================="
Write-Host "Verification Summary"
Write-Host "======================================================="
Write-Host "API Health Check: $($healthSuccess ? 'PASSED ✅' : 'FAILED ❌')"
Write-Host "Services API Check: $($servicesSuccess ? 'PASSED ✅' : 'FAILED ❌')"
Write-Host "Frontend Check: $($frontendSuccess ? 'PASSED ✅' : 'FAILED ❌')"
if ($vercel) {
    Write-Host "Vercel Test Check: $($vercelTestSuccess ? 'PASSED ✅' : 'FAILED ❌')"
}

# Overall result
$overallSuccess = $healthSuccess -and $servicesSuccess -and $frontendSuccess -and $vercelTestSuccess
Write-Host "`nOVERALL STATUS: $($overallSuccess ? 'PASSED ✅' : 'FAILED ❌')"

# Provide troubleshooting tips if failures
if (-not $overallSuccess) {
    Write-Host "`nTroubleshooting Tips:"
    
    if (-not $healthSuccess -or -not $servicesSuccess) {
        Write-Host "- Make sure the backend API is running"
        Write-Host "- Check database connection in backend"
        Write-Host "- Verify API endpoints are configured correctly"
    }
    
    if (-not $frontendSuccess) {
        Write-Host "- Make sure the frontend server is running"
        Write-Host "- Check for build errors"
    }
    
    if ($vercel -and -not $vercelTestSuccess) {
        Write-Host "- Verify Vercel environment variables are set correctly"
        Write-Host "- Check Vercel deployment logs for errors"
        Write-Host "- Make sure API routes are configured properly in vercel.json"
    }
}

Write-Host "`nFor more detailed troubleshooting, see VERCEL_TROUBLESHOOTING.md"
