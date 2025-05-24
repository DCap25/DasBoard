# Finance Manager Promotion Deployment Script
# This script applies the database migrations and updates the UI for the Finance Manager promotion

Write-Host "==============================================" -ForegroundColor Green
Write-Host "Das Board Finance Manager Promotion Deployment" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

# Ensure we have required environment variables
$env:SUPABASE_URL = "https://iugjtokydvbcvmrpeziv.supabase.co"

# Check if service key is set
if (-not $env:SUPABASE_SERVICE_KEY) {
    Write-Host "⚠️ SUPABASE_SERVICE_KEY environment variable is not set!" -ForegroundColor Yellow
    $serviceKey = Read-Host "Please enter your Supabase service key"
    $env:SUPABASE_SERVICE_KEY = $serviceKey
}

# Step 1: Apply database migrations
Write-Host "Applying promotion database migrations..." -ForegroundColor Cyan
try {
    node scripts/apply_promotion_migrations.js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Migration application failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Database migrations applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error applying migrations: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Build the application
Write-Host "Building the application with promotion updates..." -ForegroundColor Cyan
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Application built successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error building application: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Restart the services
Write-Host "Restarting services..." -ForegroundColor Cyan
try {
    # Kill existing processes if needed
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match "vite|next" } | Stop-Process -Force
    
    # Start the development server in the background
    Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow
    
    Write-Host "✅ Development server started successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error restarting services: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "✨ Finance Manager Promotion Deployed Successfully! ✨" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Testing Instructions:" -ForegroundColor Yellow
Write-Host "1. Visit the homepage to verify the promotion banner and CTA section" -ForegroundColor Yellow
Write-Host "2. Test the signup flow for the Finance Manager tier" -ForegroundColor Yellow
Write-Host "3. Verify that the signup is tracked in the promotions_usage table" -ForegroundColor Yellow
Write-Host ""
Write-Host "The application should be running at: http://localhost:5173" -ForegroundColor Cyan 