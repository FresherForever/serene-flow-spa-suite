#!/usr/bin/env pwsh
# deploy-business-app.ps1
# Professional deployment script for Serene Flow Spa Suite Business Application
# Created: May 23, 2025

param (
    [ValidateSet("production", "staging", "development")]
    [string]$Environment = "production",
    
    [switch]$Force,
    
    [switch]$SkipVerification,
    
    [switch]$SkipBackup,
    
    [string]$LogLevel = "info"
)

# Configuration
$config = @{
    ProjectName = "Serene Flow Spa Suite"
    LogFile = "deployment-logs/$(Get-Date -Format 'yyyyMMdd-HHmmss')-deploy.log"
    BackupDir = "deployment-backups/$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    DatabaseHost = $env:DB_HOST  # Use environment variable if set, or default in the script
    DatabaseUser = $env:DB_USER  # Use environment variable if set, or default in the script
    SyncDatabase = $true  # Whether to sync database during deployment
}

# Set color scheme for output
$Colors = @{
    Info = "Cyan"
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Highlight = "Magenta"
    Normal = "White"
}

# Ensure log directory exists
if (-not (Test-Path "deployment-logs")) {
    New-Item -ItemType Directory -Path "deployment-logs" -Force | Out-Null
}

# Function to log messages
function Write-DeployLog {
    param (
        [string]$Message,
        [string]$Level = "info"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # Display with appropriate color
    switch ($Level.ToLower()) {
        "info" { $color = $Colors.Info }
        "success" { $color = $Colors.Success }
        "error" { $color = $Colors.Error }
        "warning" { $color = $Colors.Warning }
        default { $color = $Colors.Normal }
    }
    
    # Only print to console if log level is appropriate
    if (($LogLevel -eq "debug") -or ($Level -ne "debug")) {
        Write-Host $logMessage -ForegroundColor $color
    }
    
    # Always write to log file
    Add-Content -Path $config.LogFile -Value $logMessage
}

# Function to display section headers
function Write-SectionHeader {
    param (
        [string]$Title
    )
    
    $line = "=" * 60
    Write-DeployLog ""
    Write-DeployLog $line
    Write-DeployLog "  $Title" -Level "info"
    Write-DeployLog $line
    Write-DeployLog ""
}

# Display banner
$banner = @"
===============================================================
  SERENE FLOW SPA SUITE - BUSINESS DEPLOYMENT
  Environment: $Environment
  Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
===============================================================
"@
Write-Host $banner -ForegroundColor $Colors.Highlight
Write-DeployLog $banner -Level "info"

# Step 1: Check for Vercel CLI and login if needed
Write-SectionHeader "Checking Deployment Prerequisites"

try {
    # Check Vercel CLI
    Write-DeployLog "Verifying Vercel CLI installation..." -Level "info"
    $vercelVersion = npx vercel --version
    
    if ($LASTEXITCODE -ne 0) {
        Write-DeployLog "Vercel CLI not found. Installing..." -Level "warning"
        npm install -g vercel
        
        if ($LASTEXITCODE -ne 0) {
            Write-DeployLog "Failed to install Vercel CLI. Please install manually with 'npm install -g vercel'" -Level "error"
            exit 1
        }
        
        Write-DeployLog "Vercel CLI installed successfully" -Level "success"
    } else {
        Write-DeployLog "Vercel CLI is installed: $vercelVersion" -Level "success"
    }
    
    # Check login status
    Write-DeployLog "Checking authentication status..." -Level "info"
    $loginStatus = npx vercel whoami 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-DeployLog "Not logged in to Vercel. Initiating login process..." -Level "warning"
        npx vercel login
        
        if ($LASTEXITCODE -ne 0) {
            Write-DeployLog "Failed to log in to Vercel. Please try manually." -Level "error"
            exit 1
        }
        
        Write-DeployLog "Successfully logged in to Vercel" -Level "success"
    } else {
        Write-DeployLog "Already authenticated as: $loginStatus" -Level "success"
    }
} catch {
    Write-DeployLog "Error during prerequisite check: $($_.Exception.Message)" -Level "error"
    exit 1
}

# Step 2: Project verification
if (-not $SkipVerification) {
    Write-SectionHeader "Verifying Project"
    
    Write-DeployLog "Running health checks..." -Level "info"
    try {
        if (Test-Path "verify-all.ps1") {
            & .\verify-all.ps1 -QuickMode
            
            if ($LASTEXITCODE -ne 0) {
                Write-DeployLog "Verification failed. See verification log for details." -Level "warning"
                $continue = Read-Host "Verification failed. Continue anyway? (y/N)"
                
                if ($continue -ne "y") {
                    Write-DeployLog "Deployment aborted by user after verification failure" -Level "error"
                    exit 1
                }
                
                Write-DeployLog "Proceeding with deployment despite verification failure" -Level "warning"
            } else {
                Write-DeployLog "Project verification passed" -Level "success"
            }
        } else {
            Write-DeployLog "Verification script not found. Skipping verification." -Level "warning"
        }
    } catch {
        Write-DeployLog "Error during verification: $($_.Exception.Message)" -Level "error"
        $continue = Read-Host "Verification error. Continue anyway? (y/N)"
        
        if ($continue -ne "y") {
            Write-DeployLog "Deployment aborted by user after verification error" -Level "error"
            exit 1
        }
    }
}

# Step 3: Backup current state
if (-not $SkipBackup) {
    Write-SectionHeader "Creating Deployment Backup"
    
    try {
        # Ensure backup directory exists
        if (-not (Test-Path $config.BackupDir)) {
            New-Item -ItemType Directory -Path $config.BackupDir -Force | Out-Null
        }
        
        # Create a backup of important files
        Write-DeployLog "Creating backup of configuration files..." -Level "info"
        
        # Create backup of vercel.json
        if (Test-Path "vercel.json") {
            Copy-Item "vercel.json" -Destination "$($config.BackupDir)/vercel.json.backup"
        }
        
        # Create backup of .env files (if they exist)
        if (Test-Path ".env") {
            Copy-Item ".env" -Destination "$($config.BackupDir)/.env.backup"
        }
        
        # Back up .vercel directory
        if (Test-Path ".vercel") {
            Copy-Item ".vercel" -Destination "$($config.BackupDir)/.vercel" -Recurse
        }
        
        Write-DeployLog "Backup created in $($config.BackupDir)" -Level "success"
    } catch {
        Write-DeployLog "Error during backup: $($_.Exception.Message)" -Level "error"
        $continue = Read-Host "Backup failed. Continue anyway? (y/N)"
        
        if ($continue -ne "y") {
            exit 1
        }
    }
}

# Step 4: Environment-specific configuration
Write-SectionHeader "Configuring for $Environment Environment"

# Set environment variables
$envVars = @(
    @{
        "key" = "NODE_ENV"
        "value" = $Environment
    },
    @{
        "key" = "API_URL"
        "value" = "/api"
    }
)

if ($Environment -eq "production") {
    $envVars += @{
        "key" = "ENABLE_FALLBACK"
        "value" = "true"
    }
}

foreach ($env in $envVars) {
    Write-DeployLog "Setting $($env.key)=$($env.value)" -Level "info"
    try {
        npx vercel env add $env.key $Environment $env.value
    } catch {
        Write-DeployLog "Unable to set environment variable $($env.key): $($_.Exception.Message)" -Level "warning"
    }
}

# Step 5: Deploy to Vercel
Write-SectionHeader "Deploying Application to Vercel"

$deployArgs = @()

if ($Environment -eq "production") {
    $deployArgs += "--prod"
}

if ($Force) {
    $deployArgs += "--force"
}

Write-DeployLog "Starting deployment to $Environment..." -Level "info"

try {
    npx vercel $deployArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-DeployLog "Deployment returned non-zero exit code" -Level "error"
        exit 1
    }
    
    Write-DeployLog "Deployment initiated successfully" -Level "success"
} catch {
    Write-DeployLog "Deployment failed: $($_.Exception.Message)" -Level "error"
    
    # Try with fallback approach if production
    if ($Environment -eq "production") {
        Write-DeployLog "Attempting fallback deployment approach..." -Level "warning"
        
        try {
            npx vercel --prod --force
            
            if ($LASTEXITCODE -ne 0) {
                Write-DeployLog "Fallback deployment also failed" -Level "error"
                exit 1
            }
            
            Write-DeployLog "Fallback deployment succeeded" -Level "success"
        } catch {
            Write-DeployLog "Fallback deployment failed: $($_.Exception.Message)" -Level "error"
            exit 1
        }
    }
}

# Step 6: Post-deployment verification
Write-SectionHeader "Post-Deployment Verification"

try {
    # Get deployment URL
    Write-DeployLog "Getting deployment information..." -Level "info"
    $deployInfo = npx vercel list --limit 1
    
    # Extract URL from deployment info (this is a simplified approach)
    $deployUrl = ($deployInfo -split "`n" | Select-Object -Last 1).Trim()
    
    Write-DeployLog "Deployment URL: $deployUrl" -Level "info"
    
    # Verify the deployment is accessible
    if (Test-Path "verify-deployed.js") {
        Write-DeployLog "Running post-deployment verification..." -Level "info"
        node verify-deployed.js --url $deployUrl
        
        if ($LASTEXITCODE -eq 0) {
            Write-DeployLog "Post-deployment verification successful" -Level "success"
        } else {
            Write-DeployLog "Post-deployment verification failed" -Level "warning"
        }
    }
} catch {
    Write-DeployLog "Error during post-deployment verification: $($_.Exception.Message)" -Level "error"
}

# Step 7: Deployment summary
$deploymentTime = [math]::Round(((Get-Date) - (Get-Date $config.LogFile.Split('/')[1].Split('-')[0])).TotalMinutes, 2)

Write-SectionHeader "Deployment Summary"
Write-DeployLog "Environment: $Environment" -Level "info"
Write-DeployLog "Deployment time: $deploymentTime minutes" -Level "info"
Write-DeployLog "Log file: $($config.LogFile)" -Level "info"
Write-DeployLog "Backup location: $($config.BackupDir)" -Level "info"

Write-SectionHeader "Next Steps"
Write-DeployLog "1. Verify that the application is working correctly in the browser" -Level "info"
Write-DeployLog "2. Check that API endpoints are responding properly" -Level "info"
Write-DeployLog "3. Review the deployment logs for any warnings or errors" -Level "info"

# Final success message
$completeBanner = @"
===============================================================
  DEPLOYMENT COMPLETED SUCCESSFULLY
  Environment: $Environment
  Completed: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
===============================================================
"@
Write-Host $completeBanner -ForegroundColor $Colors.Success
Write-DeployLog $completeBanner -Level "success"
