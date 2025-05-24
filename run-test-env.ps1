# Run Test Environment for Das Board
# This script handles starting both the mock API and the application for testing

# Function to check if a port is in use
function Test-PortInUse {
    param (
        [int]$port
    )
    
    $connections = Get-NetTCPConnection -ErrorAction SilentlyContinue | 
                   Where-Object { $_.LocalPort -eq $port -and $_.State -eq "Listen" }
    return ($null -ne $connections)
}

# Function to kill process using a specific port
function Stop-ProcessUsingPort {
    param (
        [int]$port
    )
    
    $processIds = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
    
    if ($processIds) {
        foreach ($processId in $processIds) {
            Write-Host "Stopping process using port $port (Process ID: $processId)" -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
        return $true
    }
    
    return $false
}

# Check and clear ports if needed
Write-Host "Checking ports for existing processes..." -ForegroundColor Cyan

if (Test-PortInUse -port 3001) {
    Write-Host "Port 3001 is in use. Attempting to free it..." -ForegroundColor Yellow
    Stop-ProcessUsingPort -port 3001
}

if (Test-PortInUse -port 5173) {
    Write-Host "Port 5173 is in use. Attempting to free it..." -ForegroundColor Yellow
    Stop-ProcessUsingPort -port 5173
}

# Start the Mock API server
Write-Host "Starting the mock API server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd 'E:\WebProjects\sales-api-new'; npm run start"

# Wait for the API to start
Write-Host "Waiting for API server to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Verify API is running
if (Test-PortInUse -port 3001) {
    Write-Host "Mock API server is running on port 3001" -ForegroundColor Green
} else {
    Write-Host "Failed to start Mock API server. Please check for errors and try again." -ForegroundColor Red
    exit 1
}

# Start the Das Board application
Write-Host "Starting the Das Board application..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd 'E:\WebProjects\dasboard'; npm run dev"

# Wait for the application to start
Write-Host "Waiting for application to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 8

# Verify application is running
if (Test-PortInUse -port 5173) {
    Write-Host "Das Board application is running on port 5173" -ForegroundColor Green
} else {
    Write-Host "Failed to start Das Board application. Please check for errors and try again." -ForegroundColor Red
    exit 1
}

# Display test instructions
Write-Host "`nTest Environment is ready!" -ForegroundColor Green
Write-Host "Mock API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Das Board: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nTest Credentials:" -ForegroundColor Yellow
Write-Host "- Salesperson: testsales@example.com / password" -ForegroundColor White
Write-Host "- Finance Manager: testfinance@example.com / password" -ForegroundColor White
Write-Host "- Sales Manager: testmanager@example.com / password" -ForegroundColor White
Write-Host "- General Manager: testgm@example.com / password" -ForegroundColor White
Write-Host "- Admin: testadmin@example.com / password" -ForegroundColor White

Write-Host "`nSee test-instructions.md for comprehensive testing steps." -ForegroundColor Yellow
Write-Host "Close the terminal windows to stop the services." -ForegroundColor Yellow 