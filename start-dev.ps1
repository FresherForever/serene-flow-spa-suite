#!/bin/pwsh
# Enhanced Script to start, monitor, and verify both frontend and backend servers

# Set colors for better readability
$infoColor = "Cyan" 
$successColor = "Green"
$warningColor = "Yellow"
$errorColor = "Red"

Write-Host "=======================================================" -ForegroundColor $infoColor
Write-Host "SERENE FLOW SPA SUITE - DEVELOPMENT ENVIRONMENT STARTER" -ForegroundColor $infoColor
Write-Host "=======================================================" -ForegroundColor $infoColor
Write-Host "Starting date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $infoColor
Write-Host "This script will start both frontend and backend servers for development"
Write-Host "If there are issues, you can check server status with ./scripts/utils/check-servers.ps1"

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int] $Port
    )
    
    $inUse = $false
    
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        $listener.Stop()
        return $false
    }
    catch {
        return $true
    }
}

# Function to kill a process using a specific port
function Stop-ProcessByPort {
    param (
        [int] $Port
    )
    
    try {
        $processInfo = netstat -ano | findstr ":$Port " | findstr "LISTENING" | Out-String
        if ($processInfo -match '(\d+)$') {
            $processId = $matches[1]
            Write-Host "  Found process using port $($Port): PID $($processId)" -ForegroundColor $infoColor
            
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  Stopping process: $($process.ProcessName) (PID: $processId)" -ForegroundColor $infoColor
                Stop-Process -Id $processId -Force
                Start-Sleep -Seconds 2
                return $true
            }
        }
        return $false    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Host "  Error stopping process on port $($Port): $errorMsg" -ForegroundColor $errorColor
        return $false
    }
}

# Function to check if NPM packages are installed
function Test-NpmPackages {
    param (
        [string] $Directory = "."
    )
    
    $nodeModulesPath = Join-Path -Path $Directory -ChildPath "node_modules"
    
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "  Node modules not found in $Directory. Installing packages..." -ForegroundColor $warningColor
        
        Push-Location $Directory
        npm install
        $result = $LASTEXITCODE -eq 0
        Pop-Location
        
        if ($result) {
            Write-Host "  ✅ Package installation successful" -ForegroundColor $successColor
        } else {
            Write-Host "  ❌ Package installation failed" -ForegroundColor $errorColor
        }
        
        return $result
    }
    
    return $true
}

# Function to wait for server to be responding
function Wait-ForServer {
    param (
        [string] $Url,
        [string] $Name,
        [int] $Timeout = 30
    )
    
    Write-Host "  Waiting for $Name to be ready at $Url..." -ForegroundColor $infoColor
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $success = $false
    
    while ($stopwatch.Elapsed.TotalSeconds -lt $Timeout) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $success = $true
                break
            }
        } catch {
            # Wait and try again
            Start-Sleep -Seconds 1
        }
    }
    
    $stopwatch.Stop()
    
    if ($success) {
        Write-Host "  ✅ $Name is ready after $([int]$stopwatch.Elapsed.TotalSeconds) seconds" -ForegroundColor $successColor
        return $true
    } else {
        Write-Host "  ❌ $Name failed to respond within $Timeout seconds" -ForegroundColor $errorColor
        return $false
    }
}

# Main script starts here
Write-Host "`n[1/3] Checking for dependencies and ports..." -ForegroundColor $infoColor

# Check for already running servers
$frontendPortInUse = Test-PortInUse -Port 5173
$backendPortInUse = Test-PortInUse -Port 5000

if ($frontendPortInUse) {
    Write-Host "  ℹ️ Port 5173 is in use. Attempting to free up the port..." -ForegroundColor $warningColor
    $frontendStopped = Stop-ProcessByPort -Port 5173
}

if ($backendPortInUse) {
    Write-Host "  ℹ️ Port 5000 is in use. Attempting to free up the port..." -ForegroundColor $warningColor
    $backendStopped = Stop-ProcessByPort -Port 5000
}

# Check and install NPM packages if needed
Write-Host "`n  Checking for required packages..." -ForegroundColor $infoColor
$frontendPackagesOk = Test-NpmPackages -Directory "."
$backendPackagesOk = Test-NpmPackages -Directory "backend"

if (-not ($frontendPackagesOk -and $backendPackagesOk)) {
    Write-Host "❌ Failed to install required packages. Please check the errors above." -ForegroundColor $errorColor
    exit 1
}

Write-Host "`n[2/3] Starting servers..." -ForegroundColor $infoColor

# Start frontend server with error handling
Write-Host "`n  Starting frontend server on port 5173..." -ForegroundColor $infoColor
try {
    $frontendProcess = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal -PassThru -ErrorAction Stop
    if ($frontendProcess) {
        Write-Host "  ✅ Frontend server process started (PID: $($frontendProcess.Id))" -ForegroundColor $successColor
    } else {
        Write-Host "  ⚠️ Frontend server process started but couldn't capture PID" -ForegroundColor $warningColor
    }
} catch {
    Write-Host "  ❌ Failed to start frontend server: $_" -ForegroundColor $errorColor
    Write-Host "  💡 Try running 'npm run dev' manually in a separate terminal window" -ForegroundColor $infoColor
}

# Wait a moment before starting backend
Start-Sleep -Seconds 3

# Start backend server with error handling
Write-Host "`n  Starting backend server on port 5000..." -ForegroundColor $infoColor
try {
    $backendProcess = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev" -WindowStyle Normal -PassThru -ErrorAction Stop
    if ($backendProcess) {
        Write-Host "  ✅ Backend server process started (PID: $($backendProcess.Id))" -ForegroundColor $successColor
    } else {
        Write-Host "  ⚠️ Backend server process started but couldn't capture PID" -ForegroundColor $warningColor
    }
} catch {
    Write-Host "  ❌ Failed to start backend server: $_" -ForegroundColor $errorColor
    Write-Host "  💡 Try running 'cd backend && npm run dev' manually in a separate terminal window" -ForegroundColor $infoColor
}

# Wait for servers to be ready
Write-Host "`n[3/3] Verifying server status..." -ForegroundColor $infoColor
$frontendReady = Wait-ForServer -Url "http://localhost:5173" -Name "Frontend" -Timeout 60
$backendReady = Wait-ForServer -Url "http://localhost:5000/api/health" -Name "Backend API" -Timeout 60

# Summary
Write-Host "`n=======================================================" -ForegroundColor $infoColor
Write-Host "DEVELOPMENT ENVIRONMENT STATUS" -ForegroundColor $infoColor
Write-Host "=======================================================" -ForegroundColor $infoColor

Write-Host "Frontend Server: " -NoNewline
if ($frontendReady) {
    Write-Host "RUNNING ✅" -ForegroundColor $successColor
    Write-Host "  URL: http://localhost:5173"
} else {
    Write-Host "NOT RESPONDING ❌" -ForegroundColor $errorColor
    Write-Host "  Check the terminal window for errors" -ForegroundColor $errorColor
}

Write-Host "Backend Server: " -NoNewline
if ($backendReady) {
    Write-Host "RUNNING ✅" -ForegroundColor $successColor
    Write-Host "  URL: http://localhost:5000/api"
} else {
    Write-Host "NOT RESPONDING ❌" -ForegroundColor $errorColor
    Write-Host "  Check the terminal window for errors" -ForegroundColor $errorColor
}

Write-Host "`nNext Steps:" -ForegroundColor $infoColor
Write-Host "  1. Run ./check-servers.ps1 to verify servers"
Write-Host "  2. Run ./verify-all.ps1 to run comprehensive verification"
Write-Host "  3. Open http://localhost:5173 in your browser"

Write-Host "`nDocumentation:" -ForegroundColor $infoColor
Write-Host "  - VERIFICATION_GUIDE.md - Step-by-step verification instructions"
Write-Host "  - ENVIRONMENT_COMPARISON.md - Local vs. Vercel environment comparison"
Write-Host ""

# Open the application in a browser if both services are running
if ($frontendReady -and $backendReady) {
    Write-Host "Opening application in browser..." -ForegroundColor $infoColor
    Start-Process "http://localhost:5173"
}
