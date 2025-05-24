# Das Board Dealership1 Setup Script
Write-Host "=== Das Board Dealership1 Setup Script ===" -ForegroundColor Cyan

# Check for Node.js
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found. Please install Node.js and try again." -ForegroundColor Red
    exit 1
}

# Check for npm
try {
    $npmVersion = npm -v
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm not found. Please install npm and try again." -ForegroundColor Red
    exit 1
}

# Create .env file with Dealership1 configuration
Write-Host "Creating .env file with Dealership1 configuration..." -ForegroundColor Yellow
$envContent = @"
# Das Board Master (Main project)
VITE_SUPABASE_URL=https://iugjtokydvbcvmrpeziv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1Z2p0b2t5ZHZiY3ZtcnBleml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTk3NjUsImV4cCI6MjA2MTI5NTc2NX0.iP4Z25K1Lv5AMOb8A35H9O967LfAcGdaKH82k05Q-iE

# Dealership1 (Secondary test project)
VITE_DEALERSHIP1_SUPABASE_URL=https://dijulexxrgfmaiewtavb.supabase.co  
VITE_DEALERSHIP1_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpanVsZXh4cmdmbWFpZXd0YXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MjI4MTUsImV4cCI6MjA2MTI5ODgxNX0.8wHE8CliPJooMvp4qqg7HAqqZ7vSX8wSWacjgp4M9sA

# API configuration
VITE_API_URL=http://localhost:3000
"@

Set-Content -Path ".env" -Value $envContent
Write-Host ".env file created successfully." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Create a new terminal to run the test script
Write-Host "Running Dealership1 test script..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command node src/scripts/test-dealership1.js"

# Start development server
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "You can now test the application with Dealership1 users:" -ForegroundColor Green
Write-Host "- Admin: testadmin@example.com" -ForegroundColor Cyan
Write-Host "- Sales: testsales@example.com" -ForegroundColor Cyan
Write-Host "- Finance: testfinance@example.com" -ForegroundColor Cyan
Write-Host "- Manager: testmanager@example.com" -ForegroundColor Cyan
Write-Host "- GM: testgm@example.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to start the development server or Ctrl+C to exit..."
$null = Read-Host
npm run dev 