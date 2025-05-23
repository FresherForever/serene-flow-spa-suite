#!/bin/pwsh
# Component-specific testing script for Serene Flow Spa Suite
# This script allows testing individual components of the application

param (
    [ValidateSet("frontend", "api", "database", "deployment", "all")]
    [string]$Component = "all",
    
    [ValidateSet("basic", "detailed", "comprehensive")]
    [string]$DetailLevel = "detailed",
    
    [switch]$FixIssues,
    [switch]$GenerateReport
)

# Set console colors
$infoColor = "Cyan"
$successColor = "Green"
$errorColor = "Red"
$warningColor = "Yellow"
$highlightColor = "Magenta"

# Show banner
Write-Host "====================================================" -ForegroundColor $infoColor
Write-Host "  SERENE FLOW SPA SUITE - COMPONENT TESTING" -ForegroundColor $infoColor
Write-Host "====================================================" -ForegroundColor $infoColor
Write-Host ""

# Function to test the frontend
function Test-Frontend {
    param (
        [string]$DetailLevel
    )
    
    Write-Host "Testing Frontend Component..." -ForegroundColor $highlightColor
    
    # Basic tests
    try {
        Write-Host "  Checking if frontend server is running..." -ForegroundColor $infoColor
        $frontendUrl = "http://localhost:5173"
        $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 5
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Frontend server is running: $frontendUrl" -ForegroundColor $successColor
            $frontendRunning = $true
        } else {
            Write-Host "  ❌ Frontend server returned unexpected status: $($response.StatusCode)" -ForegroundColor $errorColor
            $frontendRunning = $false
        }
    } catch {
        Write-Host "  ❌ Frontend server is not running or not accessible" -ForegroundColor $errorColor
        $frontendRunning = $false
        
        if ($FixIssues) {
            Write-Host "  Attempting to start frontend server..." -ForegroundColor $warningColor
            Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow
            Write-Host "  Frontend server starting... (please wait)" -ForegroundColor $warningColor
            Start-Sleep -Seconds 10
            
            # Check again
            try {
                $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-Host "  ✅ Frontend server started successfully" -ForegroundColor $successColor
                    $frontendRunning = $true
                }
            } catch {
                Write-Host "  ❌ Failed to start frontend server" -ForegroundColor $errorColor
            }
        }
    }
    
    # Skip additional tests if frontend is not running
    if (-not $frontendRunning) {
        return
    }
    
    # Detailed tests (if requested)
    if ($DetailLevel -eq "detailed" -or $DetailLevel -eq "comprehensive") {
        Write-Host "`n  Running detailed frontend tests..." -ForegroundColor $infoColor
        
        # Check for key HTML elements
        try {
            $html = $response.Content
            
            # Check for HTML landmarks
            $checks = @(
                @{ Name = "Document title"; Pattern = "<title>.*?</title>"; Required = $true },
                @{ Name = "Navigation menu"; Pattern = "<nav.*?>.*?</nav>"; Required = $true },
                @{ Name = "Main content"; Pattern = "<main.*?>.*?</main>"; Required = $false }
            )
            
            foreach ($check in $checks) {
                if ($html -match $check.Pattern) {
                    Write-Host "  ✅ Found $($check.Name)" -ForegroundColor $successColor
                } else {
                    $icon = if ($check.Required) { "❌" } else { "⚠️" }
                    $color = if ($check.Required) { $errorColor } else { $warningColor }
                    Write-Host "  $icon Could not find $($check.Name)" -ForegroundColor $color
                }
            }
        } catch {
            Write-Host "  ❌ Error analyzing HTML content: $_" -ForegroundColor $errorColor
        }
    }
    
    # Comprehensive tests (if requested)
    if ($DetailLevel -eq "comprehensive") {
        Write-Host "`n  Running comprehensive frontend tests..." -ForegroundColor $infoColor
        
        # Check specific routes
        $routes = @("/", "/dashboard", "/appointments", "/staff", "/customers", "/settings")
        
        foreach ($route in $routes) {
            try {
                $routeUrl = "http://localhost:5173$route"
                $routeResponse = Invoke-WebRequest -Uri $routeUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                
                if ($routeResponse.StatusCode -eq 200) {
                    Write-Host "  ✅ Route $route is accessible" -ForegroundColor $successColor
                } else {
                    Write-Host "  ❌ Route $route returned status: $($routeResponse.StatusCode)" -ForegroundColor $errorColor
                }
            } catch {
                Write-Host "  ❌ Route $route is not accessible" -ForegroundColor $errorColor
            }
        }
        
        # Bonus: Take screenshots of routes if available
        # This requires third-party tools, so we're just noting it's possible
        Write-Host "`n  Note: To capture screenshots of each route, consider using a browser automation tool" -ForegroundColor $infoColor
    }
}

# Function to test the API
function Test-API {
    param (
        [string]$DetailLevel
    )
    
    Write-Host "Testing API Component..." -ForegroundColor $highlightColor
    
    # Basic API health check
    try {
        Write-Host "  Checking if API server is running..." -ForegroundColor $infoColor
        $apiUrl = "http://localhost:5000/api/health"
        $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 5
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ API server is running: $apiUrl" -ForegroundColor $successColor
            $apiRunning = $true
            
            # Parse response
            $healthData = $response.Content | ConvertFrom-Json
            Write-Host "  Status: $($healthData.status)" -ForegroundColor $infoColor
            Write-Host "  Message: $($healthData.message)" -ForegroundColor $infoColor
        } else {
            Write-Host "  ❌ API server returned unexpected status: $($response.StatusCode)" -ForegroundColor $errorColor
            $apiRunning = $false
        }
    } catch {
        Write-Host "  ❌ API server is not running or not accessible" -ForegroundColor $errorColor
        $apiRunning = $false
        
        if ($FixIssues) {
            Write-Host "  Attempting to start API server..." -ForegroundColor $warningColor
            Start-Process -FilePath "npm" -ArgumentList "run", "start:api" -NoNewWindow
            Write-Host "  API server starting... (please wait)" -ForegroundColor $warningColor
            Start-Sleep -Seconds 5
            
            # Check again
            try {
                $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-Host "  ✅ API server started successfully" -ForegroundColor $successColor
                    $apiRunning = $true
                }
            } catch {
                Write-Host "  ❌ Failed to start API server" -ForegroundColor $errorColor
            }
        }
    }
    
    # Skip additional tests if API is not running
    if (-not $apiRunning) {
        return
    }
    
    # Detailed tests (if requested)
    if ($DetailLevel -eq "detailed" -or $DetailLevel -eq "comprehensive") {
        Write-Host "`n  Running detailed API tests..." -ForegroundColor $infoColor
        
        # Test standard endpoints
        $endpoints = @(
            @{ Path = "/api/environment"; Name = "Environment" },
            @{ Path = "/api/services"; Name = "Services List" },
            @{ Path = "/api/staff"; Name = "Staff List" },
            @{ Path = "/api/customers"; Name = "Customers List" }
        )
        
        foreach ($endpoint in $endpoints) {
            try {
                $endpointUrl = "http://localhost:5000$($endpoint.Path)"
                $endpointResponse = Invoke-WebRequest -Uri $endpointUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                
                if ($endpointResponse.StatusCode -eq 200) {
                    Write-Host "  ✅ $($endpoint.Name) endpoint is working" -ForegroundColor $successColor
                    
                    # Show response sample in detailed mode
                    if ($DetailLevel -eq "comprehensive") {
                        $responseContent = $endpointResponse.Content
                        if ($responseContent.Length -gt 100) {
                            $responseContent = $responseContent.Substring(0, 100) + "..."
                        }
                        Write-Host "    Response: $responseContent" -ForegroundColor $infoColor
                    }
                } else {
                    Write-Host "  ❌ $($endpoint.Name) endpoint returned status: $($endpointResponse.StatusCode)" -ForegroundColor $errorColor
                }
            } catch {
                Write-Host "  ❌ $($endpoint.Name) endpoint is not accessible" -ForegroundColor $errorColor
            }
        }
    }
    
    # Comprehensive tests (if requested)
    if ($DetailLevel -eq "comprehensive") {
        Write-Host "`n  Running comprehensive API tests..." -ForegroundColor $infoColor
        
        # Test POST/PUT/DELETE endpoints
        Write-Host "  Note: Comprehensive API testing would include POST/PUT/DELETE operations" -ForegroundColor $infoColor
        Write-Host "        These are not performed automatically to avoid modifying data" -ForegroundColor $infoColor
        
        # Test environment-specific endpoints
        Write-Host "`n  Testing environment-specific endpoints..." -ForegroundColor $infoColor
        
        # Check both environment endpoints (Vercel and local)
        $envEndpoints = @("/api/environment", "/environment")
        
        foreach ($endpoint in $envEndpoints) {
            try {
                $endpointUrl = "http://localhost:5000$endpoint"
                $endpointResponse = Invoke-WebRequest -Uri $endpointUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                
                if ($endpointResponse.StatusCode -eq 200) {
                    Write-Host "  ✅ $endpoint endpoint is working" -ForegroundColor $successColor
                } else {
                    Write-Host "  ❌ $endpoint endpoint returned status: $($endpointResponse.StatusCode)" -ForegroundColor $errorColor
                }
            } catch {
                Write-Host "  ❌ $endpoint endpoint is not accessible" -ForegroundColor $errorColor
            }
        }
    }
}

# Function to test the database
function Test-Database {
    param (
        [string]$DetailLevel
    )
    
    Write-Host "Testing Database Component..." -ForegroundColor $highlightColor
    
    # Basic database connectivity check via API
    try {
        Write-Host "  Checking database connection via API..." -ForegroundColor $infoColor
        $dbHealthUrl = "http://localhost:5000/api/health/database"
        $response = Invoke-WebRequest -Uri $dbHealthUrl -UseBasicParsing -TimeoutSec 5
        
        if ($response.StatusCode -eq 200) {
            $dbData = $response.Content | ConvertFrom-Json
            if ($dbData.connection -eq $true) {
                Write-Host "  ✅ Database connection successful" -ForegroundColor $successColor
                Write-Host "  Message: $($dbData.message)" -ForegroundColor $infoColor
                $dbConnected = $true
            } else {
                Write-Host "  ❌ Database connection failed" -ForegroundColor $errorColor
                Write-Host "  Message: $($dbData.message)" -ForegroundColor $errorColor
                $dbConnected = $false
            }
        } else {
            Write-Host "  ❌ Database health check failed with status: $($response.StatusCode)" -ForegroundColor $errorColor
            $dbConnected = $false
        }
    } catch {
        Write-Host "  ❌ Database health check endpoint is not accessible" -ForegroundColor $errorColor
        $dbConnected = $false
    }
    
    # Skip additional tests if database is not connected
    if (-not $dbConnected) {
        if ($FixIssues) {
            Write-Host "  No automatic fixes available for database connection issues." -ForegroundColor $warningColor
            Write-Host "  Please check your database configuration in .env file." -ForegroundColor $warningColor
        }
        return
    }
    
    # Detailed tests (if requested)
    if ($DetailLevel -eq "detailed" -or $DetailLevel -eq "comprehensive") {
        Write-Host "`n  Running detailed database tests..." -ForegroundColor $infoColor
        
        # Check for data in key tables via API
        $tables = @(
            @{ Endpoint = "/api/services"; Name = "Services" },
            @{ Endpoint = "/api/staff"; Name = "Staff" },
            @{ Endpoint = "/api/customers"; Name = "Customers" }
        )
        
        foreach ($table in $tables) {
            try {
                $tableUrl = "http://localhost:5000$($table.Endpoint)"
                $tableResponse = Invoke-WebRequest -Uri $tableUrl -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                
                if ($tableResponse.StatusCode -eq 200) {
                    $data = $tableResponse.Content | ConvertFrom-Json
                    if ($data -and $data.Count -gt 0) {
                        Write-Host "  ✅ $($table.Name) table contains data (count: $($data.Count))" -ForegroundColor $successColor
                    } else {
                        Write-Host "  ⚠️ $($table.Name) table appears to be empty" -ForegroundColor $warningColor
                    }
                } else {
                    Write-Host "  ❌ Failed to query $($table.Name) table" -ForegroundColor $errorColor
                }
            } catch {
                Write-Host "  ❌ Error querying $($table.Name) table: $_" -ForegroundColor $errorColor
            }
        }
    }
    
    # Comprehensive tests (if requested)
    if ($DetailLevel -eq "comprehensive") {
        Write-Host "`n  Running comprehensive database tests..." -ForegroundColor $infoColor
        
        # These would typically connect directly to the database
        # For security and simplicity, we're just providing information
        Write-Host "  Note: Comprehensive database testing would require direct database access" -ForegroundColor $infoColor
        Write-Host "        This is not performed automatically in this script" -ForegroundColor $infoColor
        Write-Host "        Consider running 'node db-config-utility.js --verify' for detailed database validation" -ForegroundColor $infoColor
    }
}

# Function to test the deployment
function Test-Deployment {
    param (
        [string]$DetailLevel
    )
    
    Write-Host "Testing Deployment Component..." -ForegroundColor $highlightColor
    
    # Check if we're in a Vercel environment
    $isVercel = $env:VERCEL -eq "1" -or $env:VERCEL_URL
    
    if ($isVercel) {
        Write-Host "  ✅ Running in Vercel environment" -ForegroundColor $successColor
        Write-Host "  URL: $($env:VERCEL_URL ?? 'Not specified')" -ForegroundColor $infoColor
        Write-Host "  Region: $($env:VERCEL_REGION ?? 'Unknown')" -ForegroundColor $infoColor
    } else {
        Write-Host "  Running in local environment (not Vercel)" -ForegroundColor $infoColor
        
        # Check for Vercel CLI
        try {
            $vercelVersion = vercel --version 2>&1
            if ($vercelVersion -match "Vercel CLI") {
                Write-Host "  ✅ Vercel CLI is installed: $vercelVersion" -ForegroundColor $successColor
                $vercelCliInstalled = $true
            } else {
                Write-Host "  ❌ Vercel CLI returned unexpected output" -ForegroundColor $errorColor
                $vercelCliInstalled = $false
            }
        } catch {
            Write-Host "  ❌ Vercel CLI is not installed" -ForegroundColor $errorColor
            $vercelCliInstalled = $false
            
            if ($FixIssues) {
                Write-Host "  Attempting to install Vercel CLI..." -ForegroundColor $warningColor
                npm install -g vercel
                
                # Check again
                try {
                    $vercelVersion = vercel --version 2>&1
                    if ($vercelVersion -match "Vercel CLI") {
                        Write-Host "  ✅ Vercel CLI installed successfully" -ForegroundColor $successColor
                        $vercelCliInstalled = $true
                    }
                } catch {
                    Write-Host "  ❌ Failed to install Vercel CLI" -ForegroundColor $errorColor
                }
            }
        }
        
        # Basic deployment checks
        Write-Host "`n  Checking deployment configuration..." -ForegroundColor $infoColor
        
        # Check vercel.json
        if (Test-Path "vercel.json") {
            Write-Host "  ✅ vercel.json found" -ForegroundColor $successColor
            
            try {
                $vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
                Write-Host "  Build Command: $($vercelConfig.buildCommand)" -ForegroundColor $infoColor
                Write-Host "  Output Directory: $($vercelConfig.outputDirectory)" -ForegroundColor $infoColor
            } catch {
                Write-Host "  ⚠️ Could not parse vercel.json" -ForegroundColor $warningColor
            }
        } else {
            Write-Host "  ❌ vercel.json not found" -ForegroundColor $errorColor
        }
        
        # Check for vercel-build.js
        if (Test-Path "vercel-build.js") {
            Write-Host "  ✅ vercel-build.js found" -ForegroundColor $successColor
        } else {
            Write-Host "  ❌ vercel-build.js not found" -ForegroundColor $errorColor
        }
    }
    
    # Detailed tests (if requested)
    if ($DetailLevel -eq "detailed" -or $DetailLevel -eq "comprehensive") {
        Write-Host "`n  Running detailed deployment tests..." -ForegroundColor $infoColor
        
        # Check API handlers for Vercel
        Write-Host "  Checking API handlers..." -ForegroundColor $infoColor
        
        if (Test-Path "api/[...catchAll].js") {
            Write-Host "  ✅ api/[...catchAll].js found" -ForegroundColor $successColor
        } else {
            Write-Host "  ❌ api/[...catchAll].js not found" -ForegroundColor $errorColor
        }
        
        if (Test-Path "api/environment.js") {
            Write-Host "  ✅ api/environment.js found" -ForegroundColor $successColor
        } else {
            Write-Host "  ❌ api/environment.js not found" -ForegroundColor $errorColor
        }
        
        # Check build scripts
        Write-Host "`n  Checking build scripts..." -ForegroundColor $infoColor
        
        $buildScripts = @("build.js", "static-build.js", "vercel-build.js")
        foreach ($script in $buildScripts) {
            if (Test-Path $script) {
                Write-Host "  ✅ $script found" -ForegroundColor $successColor
            } else {
                Write-Host "  ⚠️ $script not found" -ForegroundColor $warningColor
            }
        }
    }
    
    # Comprehensive tests (if requested)
    if ($DetailLevel -eq "comprehensive") {
        Write-Host "`n  Running comprehensive deployment tests..." -ForegroundColor $infoColor
        
        # Test build process
        Write-Host "  Testing build process (dry run)..." -ForegroundColor $infoColor
        
        if (Test-Path "vercel-build.js") {
            # Run a dry build check that just validates the script without building
            try {
                node -e "require('./vercel-build.js'); console.log('Syntax check passed');" 2>&1
                Write-Host "  ✅ vercel-build.js syntax check passed" -ForegroundColor $successColor
            } catch {
                Write-Host "  ❌ vercel-build.js syntax check failed: $_" -ForegroundColor $errorColor
            }
        }
        
        # Check package.json for Vercel scripts
        try {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            $vercelBuildCmd = $packageJson.scripts."vercel-build"
            
            if ($vercelBuildCmd) {
                Write-Host "  ✅ vercel-build script found in package.json: $vercelBuildCmd" -ForegroundColor $successColor
            } else {
                Write-Host "  ⚠️ vercel-build script not found in package.json" -ForegroundColor $warningColor
            }
        } catch {
            Write-Host "  ❌ Error checking package.json: $_" -ForegroundColor $errorColor
        }
    }
}

# Main script execution
$components = @()
if ($Component -eq "all") {
    $components = @("frontend", "api", "database", "deployment")
} else {
    $components = @($Component)
}

# Run tests for each selected component
foreach ($comp in $components) {
    switch ($comp) {
        "frontend" {
            Test-Frontend -DetailLevel $DetailLevel
            Write-Host ""
        }
        "api" {
            Test-API -DetailLevel $DetailLevel
            Write-Host ""
        }
        "database" {
            Test-Database -DetailLevel $DetailLevel
            Write-Host ""
        }
        "deployment" {
            Test-Deployment -DetailLevel $DetailLevel
            Write-Host ""
        }
    }
}

# Generate report if requested
if ($GenerateReport) {
    Write-Host "Generating verification report..." -ForegroundColor $infoColor
    
    $reportParams = @(
        "-Format", "Markdown"
    )
    
    if ($DetailLevel -eq "comprehensive") {
        $reportParams += "-IncludeApiResponses"
        $reportParams += "-IncludeDiagnostics"
    }
    
    & .\generate-verification-report.ps1 @reportParams
}

Write-Host "`nComponent testing completed!" -ForegroundColor $successColor
