#!/usr/bin/env pwsh
# db-sync.ps1
# Database synchronization script for Serene Flow Spa Suite
# This script synchronizes your local database with your production database
# Created: May 23, 2025

param (
    [ValidateSet("push", "pull", "schema-only", "data-only")]
    [string]$Direction = "push",
    
    [string]$RemoteHost = "",
    
    [string]$RemotePort = "5432",
    
    [string]$RemoteDbName = "serene_flow_db",
    
    [string]$RemoteUser = "spa_admin",
    
    [string]$LocalDbName = "serene_flow_db",
    
    [string]$LocalUser = "postgres",
    
    [switch]$Force,
    
    [switch]$BackupFirst = $true
)

# Configuration
$config = @{
    BackupDir = "db-backups/$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    LogFile = "db-logs/$(Get-Date -Format 'yyyyMMdd-HHmmss')-db-sync.log"
}

# Create directories if they don't exist
New-Item -ItemType Directory -Path "db-backups" -Force | Out-Null
New-Item -ItemType Directory -Path "db-logs" -Force | Out-Null

function Write-Log {
    param (
        [string]$Message,
        [ValidateSet("Info", "Success", "Warning", "Error")]
        [string]$Level = "Info"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    # Choose color based on level
    $color = switch ($Level) {
        "Info" { "Cyan" }
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        default { "White" }
    }
    
    # Write to console with color
    Write-Host $logMessage -ForegroundColor $color
    
    # Write to log file
    Add-Content -Path $config.LogFile -Value $logMessage
}

function Backup-Database {
    param (
        [string]$DbName,
        [string]$User = "postgres",
        [string]$Host = "localhost"
    )
    
    try {
        Write-Log "Creating backup of database $DbName..." "Info"
        
        # Create backup directory if it doesn't exist
        if (-not (Test-Path $config.BackupDir)) {
            New-Item -ItemType Directory -Path $config.BackupDir -Force | Out-Null
        }
        
        # Use pg_dump to create a backup
        $backupFile = Join-Path $config.BackupDir "$DbName-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
        $env:PGPASSWORD = if ($Host -eq "localhost" -or $Host -eq "") { "postgres" } else { Read-Host "Enter password for $User@$Host" -AsSecureString }
        
        $dumpCommand = "pg_dump -h $Host -U $User -d $DbName -F c -b -v -f `"$backupFile`""
        
        # Execute pg_dump
        $result = Invoke-Expression $dumpCommand
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Backup created successfully at $backupFile" "Success"
            return $backupFile
        } else {
            Write-Log "Backup failed with exit code $LASTEXITCODE" "Error"
            return $null
        }
    }
    catch {
        Write-Log "Error during backup: $_" "Error"
        return $null
    }
}

function Push-Database {
    param (
        [string]$LocalDb,
        [string]$RemoteDb,
        [string]$RemoteHost,
        [string]$RemoteUser,
        [string]$SchemaOnly = $false
    )
    
    try {
        Write-Log "Pushing database from local to remote ($LocalDb → $RemoteDb@$RemoteHost)..." "Info"
        
        # Backup both databases first if specified
        if ($BackupFirst) {
            $localBackup = Backup-Database -DbName $LocalDb
            if ($null -eq $localBackup) {
                Write-Log "Failed to backup local database. Aborting push." "Error"
                return $false
            }
            
            $remoteBackup = Backup-Database -DbName $RemoteDb -Host $RemoteHost -User $RemoteUser
            if ($null -eq $remoteBackup) {
                Write-Log "Failed to backup remote database. Aborting push." "Error"
                return $false
            }
        }
        
        # Create a temporary dump file
        $tempFile = Join-Path $env:TEMP "temp_dump_$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
        
        # Dump the local database
        $dumpOptions = if ($SchemaOnly) { "--schema-only" } else { "" }
        $dumpCommand = "pg_dump -h localhost -U $LocalUser -d $LocalDb $dumpOptions -f `"$tempFile`""
        
        Write-Log "Dumping local database with command: $dumpCommand" "Info"
        Invoke-Expression $dumpCommand
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to dump local database. Exit code: $LASTEXITCODE" "Error"
            return $false
        }
        
        # Ask for the remote password securely
        $securePassword = Read-Host "Enter password for $RemoteUser@$RemoteHost" -AsSecureString
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $remotePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        
        # Set environment variable for psql
        $env:PGPASSWORD = $remotePassword
        
        # Apply the dump to the remote database
        $restoreCommand = "psql -h $RemoteHost -U $RemoteUser -d $RemoteDb -f `"$tempFile`""
        
        Write-Log "Applying dump to remote database..." "Info"
        Invoke-Expression $restoreCommand
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to apply dump to remote database. Exit code: $LASTEXITCODE" "Error"
            return $false
        }
        
        # Clean up temporary file
        Remove-Item -Path $tempFile -Force
        
        Write-Log "Database push completed successfully" "Success"
        return $true
    }
    catch {
        Write-Log "Error during database push: $_" "Error"
        return $false
    }
    finally {
        # Clear password from environment
        $env:PGPASSWORD = ""
    }
}

function Pull-Database {
    param (
        [string]$RemoteDb,
        [string]$LocalDb,
        [string]$RemoteHost,
        [string]$RemoteUser,
        [string]$SchemaOnly = $false
    )
    
    try {
        Write-Log "Pulling database from remote to local ($RemoteDb@$RemoteHost → $LocalDb)..." "Info"
        
        # Backup both databases first if specified
        if ($BackupFirst) {
            $localBackup = Backup-Database -DbName $LocalDb
            if ($null -eq $localBackup) {
                Write-Log "Failed to backup local database. Aborting pull." "Error"
                return $false
            }
            
            $remoteBackup = Backup-Database -DbName $RemoteDb -Host $RemoteHost -User $RemoteUser
            if ($null -eq $remoteBackup) {
                Write-Log "Failed to backup remote database. Aborting pull." "Error"
                return $false
            }
        }
        
        # Ask for the remote password securely
        $securePassword = Read-Host "Enter password for $RemoteUser@$RemoteHost" -AsSecureString
        $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        $remotePassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
        [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        
        # Set environment variable for pg_dump
        $env:PGPASSWORD = $remotePassword
        
        # Create a temporary dump file
        $tempFile = Join-Path $env:TEMP "temp_dump_$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
        
        # Dump the remote database
        $dumpOptions = if ($SchemaOnly) { "--schema-only" } else { "" }
        $dumpCommand = "pg_dump -h $RemoteHost -U $RemoteUser -d $RemoteDb $dumpOptions -f `"$tempFile`""
        
        Write-Log "Dumping remote database with command: $dumpCommand" "Info"
        Invoke-Expression $dumpCommand
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to dump remote database. Exit code: $LASTEXITCODE" "Error"
            return $false
        }
        
        # Clear remote password and set local password
        $env:PGPASSWORD = "postgres"  # Default local password
        
        # Apply the dump to the local database
        $restoreCommand = "psql -h localhost -U $LocalUser -d $LocalDb -f `"$tempFile`""
        
        Write-Log "Applying dump to local database..." "Info"
        Invoke-Expression $restoreCommand
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to apply dump to local database. Exit code: $LASTEXITCODE" "Error"
            return $false
        }
        
        # Clean up temporary file
        Remove-Item -Path $tempFile -Force
        
        Write-Log "Database pull completed successfully" "Success"
        return $true
    }
    catch {
        Write-Log "Error during database pull: $_" "Error"
        return $false
    }
    finally {
        # Clear password from environment
        $env:PGPASSWORD = ""
    }
}

# Validate parameters
if ([string]::IsNullOrEmpty($RemoteHost)) {
    Write-Log "RemoteHost parameter is required" "Error"
    exit 1
}

# Main execution
Write-Log "Starting database synchronization: $Direction" "Info"

# Perform action based on direction
switch ($Direction) {
    "push" {
        if (Push-Database -LocalDb $LocalDbName -RemoteDb $RemoteDbName -RemoteHost $RemoteHost -RemoteUser $RemoteUser) {
            Write-Log "Database push completed successfully" "Success"
        } else {
            Write-Log "Database push failed" "Error"
            exit 1
        }
    }
    "pull" {
        if (Pull-Database -RemoteDb $RemoteDbName -LocalDb $LocalDbName -RemoteHost $RemoteHost -RemoteUser $RemoteUser) {
            Write-Log "Database pull completed successfully" "Success"
        } else {
            Write-Log "Database pull failed" "Error"
            exit 1
        }
    }
    "schema-only" {
        if (Push-Database -LocalDb $LocalDbName -RemoteDb $RemoteDbName -RemoteHost $RemoteHost -RemoteUser $RemoteUser -SchemaOnly $true) {
            Write-Log "Schema push completed successfully" "Success"
        } else {
            Write-Log "Schema push failed" "Error"
            exit 1
        }
    }
    "data-only" {
        Write-Log "Data-only synchronization is not yet implemented" "Error"
        exit 1
    }
}

Write-Log "Database synchronization completed" "Info"
