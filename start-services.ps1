# Das Board Services Manager Script for Windows
# This script helps start and manage the services needed for the application

# Function to check if a port is in use
function Test-PortInUse {
    param(
        [int]$Port
    )
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient('localhost', $Port)
        if ($connection.Connected) {
            $connection.Close()
            return $true
        }
    }
    catch {
        return $false
    }
    
    return $false
}

# Function to kill process using a specific port
function Stop-ProcessUsingPort {
    param(
        [int]$Port
    )
    
    try {
        $processInfo = netstat -ano | Select-String -Pattern ".*:$Port.*LISTENING"
        if ($processInfo) {
            $processId = ($processInfo.Line -split ' ')[-1]
            Write-Host "Stopping process with ID $processId using port $Port"
            Stop-Process -Id $processId -Force
            Start-Sleep -Seconds 2
            return $true
        }
    }
    catch {
        Write-Host "Error stopping process on port $Port: $_"
        return $false
    }
    
    return $false
}

# Create a separate function to run commands since PowerShell doesn't support && syntax
function Run-Command {
    param(
        [string]$Command,
        [string]$WorkingDirectory = (Get-Location).Path,
        [string]$Description
    )
    
    Write-Host "Running: $Description..." -ForegroundColor Cyan
    
    try {
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "powershell.exe"
        $processInfo.Arguments = "-Command `"$Command`""
        $processInfo.WorkingDirectory = $WorkingDirectory
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.UseShellExecute = $false
        $processInfo.CreateNoWindow = $false
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        $process.Start() | Out-Null
        
        return $process
    }
    catch {
        Write-Host "Error starting $Description: $_" -ForegroundColor Red
        return $null
    }
}

# Ensure required ports are available
$mockApiPort = 3001
$applicationPort = 5173

# Check and free mock API port if needed
if (Test-PortInUse -Port $mockApiPort) {
    Write-Host "Port $mockApiPort is in use. Attempting to free it..." -ForegroundColor Yellow
    if (-not (Stop-ProcessUsingPort -Port $mockApiPort)) {
        Write-Host "Failed to free port $mockApiPort. Please close any applications using this port manually." -ForegroundColor Red
        exit 1
    }
}

# Check and free application port if needed
if (Test-PortInUse -Port $applicationPort) {
    Write-Host "Port $applicationPort is in use. Attempting to free it..." -ForegroundColor Yellow
    if (-not (Stop-ProcessUsingPort -Port $applicationPort)) {
        Write-Host "Failed to free port $applicationPort. Please close any applications using this port manually." -ForegroundColor Red
        exit 1
    }
}

# Start Mock API Server
$mockApiProcess = Run-Command -Command "node sales-api-new/index.js" -Description "Mock API Server"

if (-not $mockApiProcess) {
    Write-Host "Failed to start Mock API Server. Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host "Started Mock API Server. Waiting for it to initialize..." -ForegroundColor Green
Start-Sleep -Seconds 5

# Verify Mock API is running
if (-not (Test-PortInUse -Port $mockApiPort)) {
    Write-Host "Mock API Server failed to start properly on port $mockApiPort." -ForegroundColor Red
    Stop-Process -Id $mockApiProcess.Id -Force
    exit 1
}

Write-Host "Mock API Server running on port $mockApiPort" -ForegroundColor Green

# Start Das Board Application
$appProcess = Run-Command -Command "npm run dev" -Description "Das Board Application"

if (-not $appProcess) {
    Write-Host "Failed to start Das Board Application. Exiting..." -ForegroundColor Red
    Stop-Process -Id $mockApiProcess.Id -Force
    exit 1
}

Write-Host "Started Das Board Application. Waiting for it to initialize..." -ForegroundColor Green
Start-Sleep -Seconds 8

# Verify Application is running
if (-not (Test-PortInUse -Port $applicationPort)) {
    Write-Host "Das Board Application failed to start properly on port $applicationPort." -ForegroundColor Red
    Stop-Process -Id $mockApiProcess.Id -Force
    Stop-Process -Id $appProcess.Id -Force
    exit 1
}

Write-Host "Das Board Application running on port $applicationPort" -ForegroundColor Green

# Display test credentials
Write-Host "`nTest Credentials for Different Roles:" -ForegroundColor Cyan
Write-Host "Salesperson: testsales@example.com / password" -ForegroundColor White
Write-Host "Finance Manager: testfinance@example.com / password" -ForegroundColor White
Write-Host "Sales Manager: testmanager@example.com / password" -ForegroundColor White
Write-Host "General Manager: testgm@example.com / password" -ForegroundColor White
Write-Host "Admin: testadmin@example.com / password" -ForegroundColor White

Write-Host "`nBoth services are now running. Access the application at:" -ForegroundColor Green
Write-Host "http://localhost:$applicationPort" -ForegroundColor Cyan
Write-Host "`nRefer to test-instructions.md for comprehensive testing steps." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop all services when testing is complete." -ForegroundColor Yellow

# Wait for both processes to complete (or user to press Ctrl+C)
try {
    $mockApiProcess.WaitForExit()
    $appProcess.WaitForExit()
}
catch {
    # This will catch Ctrl+C
    Write-Host "`nStopping services..." -ForegroundColor Yellow
}
finally {
    # Clean up processes
    if (-not $mockApiProcess.HasExited) {
        Stop-Process -Id $mockApiProcess.Id -Force
    }
    if (-not $appProcess.HasExited) {
        Stop-Process -Id $appProcess.Id -Force
    }
    
    Write-Host "All services stopped." -ForegroundColor Green
} 