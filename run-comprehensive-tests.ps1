# Comprehensive Testing Script for Dasboard Application
# This script will test all modules and features of the application
# And log the results to a test-results.log file

# Start logging
$logFile = "test-results.log"
$testDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Function to write to log and console
function Write-Log {
    param (
        [string]$message,
        [string]$color = "White"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    
    # Write to console
    Write-Host $logMessage -ForegroundColor $color
    
    # Write to log file
    Add-Content -Path $logFile -Value $logMessage
}

# Initialize log file
Set-Content -Path $logFile -Value "=== Dasboard Application Test Results ==="
Add-Content -Path $logFile -Value "Test Date: $testDate"
Add-Content -Path $logFile -Value "======================================"
Add-Content -Path $logFile -Value ""

# Function to run a test and log result
function Run-Test {
    param (
        [string]$testName,
        [scriptblock]$testScript
    )
    
    Write-Log "RUNNING TEST: $testName" "Cyan"
    
    try {
        $result = & $testScript
        
        if ($result -eq $true) {
            Write-Log "✅ PASSED: $testName" "Green"
            return $true
        } else {
            Write-Log "❌ FAILED: $testName" "Red"
            return $false
        }
    } catch {
        Write-Log "❌ ERROR: $testName - $_" "Red"
        return $false
    }
}

# Function to check if a service is running on a port
function Test-ServiceRunning {
    param (
        [int]$port,
        [string]$serviceName
    )
    
    $connections = netstat -ano | findstr ":$port "
    
    if ($connections.Length -gt 0) {
        Write-Log "✅ $serviceName is running on port $port" "Green"
        return $true
    } else {
        Write-Log "❌ $serviceName is NOT running on port $port" "Red"
        return $false
    }
}

# Function to test npm build
function Test-Build {
    Write-Log "Building the application..." "Yellow"
    $output = npm run build 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Build successful" "Green"
        return $true
    } else {
        Write-Log "❌ Build failed with exit code $LASTEXITCODE" "Red"
        Write-Log "Build output: $output" "Red"
        return $false
    }
}

# Function to test npm tests
function Test-NpmTests {
    Write-Log "Running npm tests..." "Yellow"
    $output = npm run test 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Tests passed" "Green"
        return $true
    } else {
        Write-Log "❌ Tests failed with exit code $LASTEXITCODE" "Red"
        Write-Log "Test output: $output" "Red"
        return $false
    }
}

# Function to test for ESLint warnings
function Test-Lint {
    Write-Log "Running ESLint..." "Yellow"
    $output = npm run lint 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        if ($output -match "warning") {
            Write-Log "⚠️ ESLint passed with warnings" "Yellow"
            Write-Log "Lint output: $output" "Yellow"
            return $true
        } else {
            Write-Log "✅ ESLint passed with no warnings" "Green"
            return $true
        }
    } else {
        Write-Log "❌ ESLint failed with exit code $LASTEXITCODE" "Red"
        Write-Log "Lint output: $output" "Red"
        return $false
    }
}

# ----- Start actual test execution -----

Write-Log "Starting comprehensive testing of Dasboard Application" "Magenta"
Write-Log "==================================================" "Magenta"

# Test 1: Check if services are running
$apiRunning = Run-Test "Check if Sales API is running" {
    Test-ServiceRunning -port 3001 -serviceName "Sales API"
}

$dashboardRunning = Run-Test "Check if Dashboard is running" {
    Test-ServiceRunning -port 5173 -serviceName "Dashboard"
}

# If services are not running, start them
if (-not $apiRunning -or -not $dashboardRunning) {
    Write-Log "Starting services with start-services.ps1..." "Yellow"
    & "$PSScriptRoot\start-services.ps1"
    
    # Wait for services to start
    Start-Sleep -Seconds 10
    
    # Verify services are running now
    $apiRunning = Run-Test "Re-check if Sales API is running" {
        Test-ServiceRunning -port 3001 -serviceName "Sales API"
    }
    
    $dashboardRunning = Run-Test "Re-check if Dashboard is running" {
        Test-ServiceRunning -port 5173 -serviceName "Dashboard"
    }
    
    if (-not $apiRunning -or -not $dashboardRunning) {
        Write-Log "❌ CRITICAL: Could not start required services. Testing aborted." "Red"
        exit 1
    }
}

# Test 2: Run automated tests
$testsPass = Run-Test "Run npm tests" {
    Test-NpmTests
}

# Test 3: Check for ESLint warnings
$lintPass = Run-Test "Check for ESLint warnings" {
    Test-Lint
}

# Test 4: Test build process
$buildPass = Run-Test "Test build process" {
    Test-Build
}

# Test 5: Test file access
$fileAccessPass = Run-Test "Test file access" {
    $files = @(
        "./package.json",
        "./src/lib/apiService.ts",
        "./src/context/AuthContext.tsx",
        "./src/pages/Dashboard.tsx"
    )
    
    $allFilesAccessible = $true
    foreach ($file in $files) {
        if (-not (Test-Path $file)) {
            Write-Log "❌ Could not access file: $file" "Red"
            $allFilesAccessible = $false
        }
    }
    
    return $allFilesAccessible
}

# Summary of test results
Write-Log "" "White"
Write-Log "==================================================" "Magenta"
Write-Log "TEST SUMMARY" "Magenta"
Write-Log "==================================================" "Magenta"

# Count the actual tests we ran
$allTests = @($apiRunning, $dashboardRunning, $testsPass, $lintPass, $buildPass, $fileAccessPass)
$totalTests = $allTests.Count
$passedTests = ($allTests | Where-Object { $_ -eq $true }).Count
$failedTests = $totalTests - $passedTests

Write-Log "Total tests: $totalTests" "White"
Write-Log "Passed tests: $passedTests" "White"
Write-Log "Failed tests: $failedTests" "White"

if ($passedTests -eq $totalTests) {
    Write-Log "🎉 All tests passed! The application is ready for manual testing." "Green"
} else {
    $passPercent = [math]::Round(($passedTests / $totalTests) * 100)
    Write-Log "⚠️ Some tests failed. $passPercent% of tests passed." "Yellow"
}

Write-Log "" "White"
Write-Log "Manual Testing Instructions:" "Cyan"
Write-Log "1. Access the application at http://localhost:5173/" "White"
Write-Log "2. Test login with each user type:" "White"
Write-Log "   - Salesperson: testsales@example.com / password" "White"
Write-Log "   - Finance Manager: testfinance@example.com / password" "White"
Write-Log "   - Sales Manager: testmanager@example.com / password" "White"
Write-Log "   - General Manager: testgm@example.com / password" "White"
Write-Log "   - Admin: testadmin@example.com / password" "White"
Write-Log "3. Verify role-specific features for each user type" "White"
Write-Log "4. Test multi-tenant isolation by ensuring data is scoped to dealership-1" "White"
Write-Log "5. Verify UI consistency (dark/light mode toggle, color schemes)" "White"
Write-Log "" "White"

Write-Log "See test-results.log for detailed test results." "White" 