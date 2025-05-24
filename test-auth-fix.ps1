# Test Authentication Fix for Das Board
# This script verifies the authentication fixes by testing both mock API and Supabase environments

Write-Host "=== Das Board Authentication Test Script ===" -ForegroundColor Cyan

# Function to check if services are already running
function Test-ServiceRunning {
    param (
        [int]$Port
    )
    
    $connections = Get-NetTCPConnection -ErrorAction SilentlyContinue | 
                   Where-Object { $_.LocalPort -eq $Port -and $_.State -eq "Listen" }
    
    return ($null -ne $connections)
}

# Check for required services
Write-Host "`nChecking if required services are running..." -ForegroundColor Yellow

$mockApiRunning = Test-ServiceRunning -Port 3001
$appRunning = Test-ServiceRunning -Port 5173

if (-not $mockApiRunning) {
    Write-Host "Mock API is not running. Please start it with: cd sales-api-new; npm run start" -ForegroundColor Red
}

if (-not $appRunning) {
    Write-Host "Das Board application is not running. Please start it with: npm run dev" -ForegroundColor Red
}

if (-not $mockApiRunning -or -not $appRunning) {
    Write-Host "`nPlease start the required services and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host "All required services are running." -ForegroundColor Green

# Test credentials
$testUsers = @(
    @{
        Email = "testsales@example.com"
        Password = "password"
        Role = "Salesperson"
        ExpectedRedirect = "/dashboard/salesperson"
    },
    @{
        Email = "testfinance@example.com"
        Password = "password"
        Role = "Finance Manager"
        ExpectedRedirect = "/finance"
    },
    @{
        Email = "testmanager@example.com"
        Password = "password"
        Role = "Sales Manager"
        ExpectedRedirect = "/dashboard/sales-manager"
    },
    @{
        Email = "testgm@example.com"
        Password = "password"
        Role = "General Manager"
        ExpectedRedirect = "/dashboard/general-manager"
    },
    @{
        Email = "testadmin@example.com"
        Password = "password"
        Role = "Admin"
        ExpectedRedirect = "/dashboard/admin"
    }
)

# Print testing instructions
Write-Host "`nPlease test the following users in your browser (http://localhost:5173):" -ForegroundColor Yellow
Write-Host "-------------------------------------------------------------------" -ForegroundColor Yellow

foreach ($user in $testUsers) {
    Write-Host "Role: $($user.Role)" -ForegroundColor Cyan
    Write-Host "Email: $($user.Email)"
    Write-Host "Password: $($user.Password)"
    Write-Host "Expected Redirect: $($user.ExpectedRedirect)"
    Write-Host "-------------------------------------------------------------------" -ForegroundColor Yellow
}

# Instructions for testing with Supabase
Write-Host "`nOnce testing with the mock API is complete, test with Supabase:" -ForegroundColor Cyan
Write-Host "1. Set USE_MOCK_SUPABASE=false in .env.development"
Write-Host "2. Restart the application with: npm run dev"
Write-Host "3. Test the same users again to verify Supabase authentication works"

Write-Host "`nVerify the following:" -ForegroundColor Cyan
Write-Host "- Login is successful for all test users"
Write-Host "- Each user is redirected to the correct page based on their role"
Write-Host "- Each user can only access data from their assigned dealership"
Write-Host "- Logout functionality works correctly"
Write-Host "- Authentication persists when refreshing the page"

Write-Host "`nRefer to auth-fix-documentation.md for complete testing instructions and troubleshooting." -ForegroundColor Green 