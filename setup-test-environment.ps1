# Das Board Test Environment Setup Script
# This script will set up the test environment for Das Board application testing

# Configuration
$workspacePath = $PWD
$apiPath = Join-Path -Path $workspacePath -ChildPath "sales-api-new"
$dashboardPath = $workspacePath
$apiPort = 3000
$dashboardPort = 5173
$logFile = Join-Path -Path $workspacePath -ChildPath "test-env-setup.log"

# Clear log file
if (Test-Path $logFile) {
    Remove-Item $logFile -Force
}

# Function to log messages
function Write-Log {
    param (
        [string]$message,
        [string]$level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$level] $message"
    
    # Output to console
    if ($level -eq "ERROR") {
        Write-Host $logMessage -ForegroundColor Red
    } elseif ($level -eq "WARNING") {
        Write-Host $logMessage -ForegroundColor Yellow
    } else {
        Write-Host $logMessage -ForegroundColor Green
    }
    
    # Write to log file
    Add-Content -Path $logFile -Value $logMessage
}

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$port
    )
    
    $connections = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $port -and $_.State -eq "Listen" }
    return ($null -ne $connections)
}

# Function to kill process using a specific port
function Stop-ProcessUsingPort {
    param (
        [int]$port
    )
    
    $process = Get-Process -Id (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Log "Stopping process using port $port: $($process.ProcessName) (ID: $($process.Id))" "WARNING"
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        return $true
    }
    
    return $false
}

# Function to check Node.js and npm
function Test-NodeEnvironment {
    try {
        $nodeVersion = node -v
        $npmVersion = npm -v
        
        Write-Log "Node.js version: $nodeVersion"
        Write-Log "npm version: $npmVersion"
        
        return $true
    } catch {
        Write-Log "Node.js or npm is not installed or not in PATH" "ERROR"
        return $false
    }
}

# Function to install dependencies
function Install-Dependencies {
    param (
        [string]$path,
        [string]$name
    )
    
    Push-Location $path
    
    Write-Log "Installing dependencies for $name..."
    
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to install dependencies for $name" "ERROR"
            Pop-Location
            return $false
        }
        
        Write-Log "Successfully installed dependencies for $name"
        Pop-Location
        return $true
    } catch {
        Write-Log "Error installing dependencies for $name: $($_.Exception.Message)" "ERROR"
        Pop-Location
        return $false
    }
}

# Function to start the API service
function Start-ApiService {
    if (Test-PortInUse -port $apiPort) {
        Write-Log "Port $apiPort is already in use" "WARNING"
        Stop-ProcessUsingPort -port $apiPort
    }
    
    Push-Location $apiPath
    
    Write-Log "Starting API service on port $apiPort..."
    
    try {
        # Start as a background job
        $job = Start-Job -ScriptBlock {
            param($path)
            Set-Location $path
            node index.js
        } -ArgumentList $apiPath
        
        # Wait for API to start
        Start-Sleep -Seconds 5
        
        if (Test-PortInUse -port $apiPort) {
            Write-Log "API service started successfully on port $apiPort"
            Pop-Location
            return $true
        } else {
            Write-Log "Failed to start API service on port $apiPort" "ERROR"
            Pop-Location
            return $false
        }
    } catch {
        Write-Log "Error starting API service: $($_.Exception.Message)" "ERROR"
        Pop-Location
        return $false
    }
}

# Function to start the Dashboard
function Start-DashboardService {
    if (Test-PortInUse -port $dashboardPort) {
        Write-Log "Port $dashboardPort is already in use" "WARNING"
        Stop-ProcessUsingPort -port $dashboardPort
    }
    
    Push-Location $dashboardPath
    
    Write-Log "Starting Dashboard service on port $dashboardPort..."
    
    try {
        # Start as a background job
        $job = Start-Job -ScriptBlock {
            param($path)
            Set-Location $path
            npm run dev
        } -ArgumentList $dashboardPath
        
        # Wait for Dashboard to start
        Start-Sleep -Seconds 10
        
        if (Test-PortInUse -port $dashboardPort) {
            Write-Log "Dashboard service started successfully on port $dashboardPort"
            Pop-Location
            return $true
        } else {
            Write-Log "Failed to start Dashboard service on port $dashboardPort" "ERROR"
            Pop-Location
            return $false
        }
    } catch {
        Write-Log "Error starting Dashboard service: $($_.Exception.Message)" "ERROR"
        Pop-Location
        return $false
    }
}

# Function to verify test user accounts
function Test-UserAccounts {
    Write-Log "Verifying test user accounts..."
    
    # Test users from the API
    $testUsers = @(
        @{
            Email = "salesperson@example.com"
            Password = "password123"
            Role = "salesperson"
            Dealership = 1
        },
        @{
            Email = "finance@example.com"
            Password = "password123"
            Role = "finance_manager"
            Dealership = 1
        },
        @{
            Email = "sales_manager@example.com"
            Password = "password123"
            Role = "sales_manager"
            Dealership = 1
        },
        @{
            Email = "gm@example.com"
            Password = "password123"
            Role = "general_manager"
            Dealership = 1
        },
        @{
            Email = "admin@example.com"
            Password = "password123"
            Role = "admin"
            Dealership = null
        },
        @{
            Email = "salesperson2@example.com"
            Password = "password123"
            Role = "salesperson"
            Dealership = 2
        }
    )
    
    Write-Log "Available test users:"
    foreach ($user in $testUsers) {
        Write-Log "  - Email: $($user.Email), Role: $($user.Role), Dealership: $($user.Dealership)"
    }
    
    return $true
}

# Main execution flow
Write-Log "=== Starting Das Board Test Environment Setup ==="

# Check Node environment
if (-not (Test-NodeEnvironment)) {
    Write-Log "Node.js environment check failed. Please install Node.js and npm." "ERROR"
    exit 1
}

# Install dependencies
Write-Log "=== Installing Dependencies ==="
if (Test-Path $apiPath) {
    if (-not (Install-Dependencies -path $apiPath -name "API Service")) {
        Write-Log "Failed to install API dependencies" "ERROR"
        exit 1
    }
} else {
    Write-Log "API path not found: $apiPath" "ERROR"
    exit 1
}

if (-not (Install-Dependencies -path $dashboardPath -name "Dashboard")) {
    Write-Log "Failed to install Dashboard dependencies" "ERROR"
    exit 1
}

# Start services
Write-Log "=== Starting Services ==="
if (-not (Start-ApiService)) {
    Write-Log "Failed to start API service" "ERROR"
    exit 1
}

if (-not (Start-DashboardService)) {
    Write-Log "Failed to start Dashboard service" "ERROR"
    exit 1
}

# Verify test user accounts
if (-not (Test-UserAccounts)) {
    Write-Log "Failed to verify test user accounts" "ERROR"
    exit 1
}

# Setup complete
Write-Log "=== Test Environment Setup Complete ==="
Write-Log "API running on: http://localhost:$apiPort"
Write-Log "Dashboard running on: http://localhost:$dashboardPort"
Write-Log "Use the test user accounts listed above for testing"
Write-Log "Test Report Template available at: $workspacePath\test-report-template.md"
Write-Log "Log file available at: $logFile" 