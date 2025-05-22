#!/bin/pwsh
# Database Connection Verification Script

param (
    [switch]$Vercel,
    [string]$VercelUrl = $env:VERCEL_URL
)

Write-Host "======================================================="
Write-Host "DATABASE CONNECTION VERIFICATION"
Write-Host "======================================================="

# Determine which environment to test
if ($Vercel) {
    if ([string]::IsNullOrEmpty($VercelUrl)) {
        Write-Host "ERROR: No Vercel URL provided. Use -VercelUrl parameter or set VERCEL_URL environment variable." -ForegroundColor Red
        exit 1
    }
    
    $baseUrl = $VercelUrl
    if (-not $baseUrl.StartsWith("http")) {
        $baseUrl = "https://$baseUrl"
    }
    
    $apiBaseUrl = "$baseUrl/api"
    Write-Host "Testing Vercel deployment database at: $baseUrl" -ForegroundColor Cyan
} else {
    $apiBaseUrl = "http://localhost:5000/api"
    Write-Host "Testing local database connection" -ForegroundColor Cyan
}

# Test database connection through API
Write-Host "`nChecking database connection through API..." -ForegroundColor Yellow

try {
    # Use different endpoints based on environment
    $endpoint = if ($Vercel) { "$apiBaseUrl/test" } else { "$apiBaseUrl/health" }
    Write-Host "Endpoint: $endpoint"
    
    $response = Invoke-RestMethod -Uri $endpoint -Method Get -ErrorAction Stop
    
    if ($Vercel) {
        # For Vercel environment
        if ($response.database -eq "configured") {
            Write-Host "✅ Database is properly configured in Vercel" -ForegroundColor Green
            Write-Host "  Node.js Version: $($response.nodejs)" -ForegroundColor Gray
            Write-Host "  Environment: $($response.environment)" -ForegroundColor Gray
            Write-Host "  Timestamp: $($response.timestamp)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Database may not be properly configured in Vercel" -ForegroundColor Red
            Write-Host "  Database status: $($response.database)" -ForegroundColor Red
        }
    } else {
        # For local environment
        if ($response.status -eq "OK") {
            Write-Host "✅ Local database connection successful" -ForegroundColor Green
            Write-Host "  Status: $($response.status)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Local database connection may have issues" -ForegroundColor Red
            Write-Host "  Status: $($response.status)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Failed to check database connection" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Additional error information if available
    if ($_.ErrorDetails) {
        try {
            $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "  Details: $($errorObj.error)" -ForegroundColor Red
        } catch {
            Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    
    # Check if it might be a CORS issue
    if ($_.Exception.Message -like "*Cross-Origin*" -or $_.Exception.Message -like "*CORS*") {
        Write-Host "`nThis appears to be a CORS issue. Try these solutions:" -ForegroundColor Yellow
        Write-Host "  1. Check CORS configuration in server.js" -ForegroundColor Yellow
        Write-Host "  2. Make sure the allowed origins include your frontend URL" -ForegroundColor Yellow
        Write-Host "  3. Ensure CORS middleware is properly configured" -ForegroundColor Yellow
    }
    
    # Check if it might be a connection issue
    if ($_.Exception.Message -like "*Unable to connect*" -or $_.Exception.Message -like "*connection*") {
        Write-Host "`nThis appears to be a connection issue. Try these solutions:" -ForegroundColor Yellow
        Write-Host "  1. Make sure the database server is running" -ForegroundColor Yellow
        Write-Host "  2. Verify database credentials in .env file" -ForegroundColor Yellow
        Write-Host "  3. Check if DATABASE_URL is properly formatted" -ForegroundColor Yellow
    }
}

# Test database tables if connection succeeded
if ($response) {
    Write-Host "`nChecking database tables..." -ForegroundColor Yellow
    
    # Try to get services as a simple check for database tables
    try {
        $servicesEndpoint = "$apiBaseUrl/services"
        Write-Host "Endpoint: $servicesEndpoint"
        
        $services = Invoke-RestMethod -Uri $servicesEndpoint -Method Get -ErrorAction Stop
        
        if ($services -and $services.Count -gt 0) {
            Write-Host "✅ Database tables appear to be properly configured" -ForegroundColor Green
            Write-Host "  Retrieved $($services.Count) services from database" -ForegroundColor Gray
            
            # Show sample of the data
            if ($services.Count -gt 0) {
                Write-Host "`nSample Service:" -ForegroundColor Yellow
                $services[0] | Format-List | Out-String | Write-Host
            }
        } else {
            Write-Host "⚠️ Database tables exist but may be empty" -ForegroundColor Yellow
            Write-Host "  No services found in the database" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Failed to retrieve database tables" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Provide next steps
Write-Host "`n======================================================="
Write-Host "VERIFICATION COMPLETE"
Write-Host "======================================================="

if ($response) {
    if ($Vercel) {
        Write-Host "`nYour Vercel deployment appears to be" -NoNewline
        Write-Host " CONNECTED " -ForegroundColor Green -BackgroundColor Black -NoNewline
        Write-Host "to the database."
    } else {
        Write-Host "`nYour local environment appears to be" -NoNewline
        Write-Host " CONNECTED " -ForegroundColor Green -BackgroundColor Black -NoNewline
        Write-Host "to the database."
    }
} else {
    if ($Vercel) {
        Write-Host "`nYour Vercel deployment appears to be" -NoNewline
        Write-Host " NOT CONNECTED " -ForegroundColor Red -BackgroundColor Black -NoNewline
        Write-Host "to the database."
    } else {
        Write-Host "`nYour local environment appears to be" -NoNewline
        Write-Host " NOT CONNECTED " -ForegroundColor Red -BackgroundColor Black -NoNewline
        Write-Host "to the database."
    }
    
    Write-Host "`nTroubleshooting steps:"
    Write-Host "  1. Check database connection string"
    Write-Host "  2. Verify database service is running"
    Write-Host "  3. See VERCEL_TROUBLESHOOTING.md for more help"
}
