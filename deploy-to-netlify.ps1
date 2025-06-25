# DAS Board Netlify Deployment Script
# Run this script to prepare for deployment

param(
    [switch]$Build,
    [switch]$Deploy,
    [switch]$Preview,
    [switch]$Help
)

function Write-Step {
    param($Message)
    Write-Host "`n🔹 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

if ($Help) {
    Write-Host @"
DAS Board Netlify Deployment Script

Usage:
    .\deploy-to-netlify.ps1 -Build      # Build the project for production
    .\deploy-to-netlify.ps1 -Preview    # Preview the production build locally
    .\deploy-to-netlify.ps1 -Deploy     # Deploy to Netlify (requires Netlify CLI)
    .\deploy-to-netlify.ps1 -Help       # Show this help

Examples:
    .\deploy-to-netlify.ps1 -Build -Preview    # Build and preview
    .\deploy-to-netlify.ps1 -Deploy            # Deploy to Netlify

Prerequisites:
- Node.js 18+ installed
- npm dependencies installed (npm install)
- Netlify CLI installed (npm install -g netlify-cli) for direct deployment
"@
    exit 0
}

Write-Host @"
🚀 DAS Board Netlify Deployment Preparation
============================================
"@ -ForegroundColor Magenta

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

# Check Node version
Write-Step "Checking Node.js version..."
$nodeVersion = node --version
Write-Info "Node.js version: $nodeVersion"

if ($nodeVersion -match "v(\d+)") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -lt 18) {
        Write-Error "Node.js 18+ is required. Current version: $nodeVersion"
        exit 1
    }
}
Write-Success "Node.js version is compatible"

# Install dependencies
Write-Step "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}
Write-Success "Dependencies installed"

if ($Build -or $Preview -or $Deploy) {
    # Build the project
    Write-Step "Building the project for production..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }
    Write-Success "Build completed successfully"
    
    # Show build statistics
    if (Test-Path "dist") {
        $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
        $distSizeMB = [math]::Round($distSize / 1MB, 2)
        Write-Info "Build size: $distSizeMB MB"
    }
}

if ($Preview) {
    Write-Step "Starting preview server..."
    Write-Info "Preview will be available at http://localhost:4173"
    Write-Info "Press Ctrl+C to stop the preview server"
    npm run preview
}

if ($Deploy) {
    # Check if Netlify CLI is installed
    Write-Step "Checking Netlify CLI..."
    try {
        netlify --version | Out-Null
        Write-Success "Netlify CLI is installed"
    } catch {
        Write-Error "Netlify CLI is not installed. Install it with: npm install -g netlify-cli"
        exit 1
    }
    
    Write-Step "Deploying to Netlify..."
    Write-Info "Make sure you've logged in to Netlify CLI with: netlify login"
    
    # Deploy to production
    netlify deploy --prod --dir=dist
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deployment completed successfully!"
    } else {
        Write-Error "Deployment failed"
        exit 1
    }
}

if (!$Build -and !$Preview -and !$Deploy) {
    Write-Host @"

🎯 Ready for Deployment!

Next Steps:
1. Manual Netlify Deployment:
   - Go to https://netlify.com
   - Create new site from Git
   - Connect your GitHub repository
   - Set build settings:
     * Build command: npm run build
     * Publish directory: dist
     * Node version: 18

2. Set Environment Variables (copy from netlify-env-template.txt):
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_SUPABASE_PROJECT_ID
   - VITE_APP_URL
   - USE_MOCK_SUPABASE=false
   - NODE_VERSION=18
   - NPM_FLAGS=--legacy-peer-deps

3. Configure Custom Domain:
   - Add your domain in Netlify dashboard
   - Update DNS records as instructed
   - SSL will be automatically enabled

4. Test the deployment:
   - Verify authentication works
   - Test all dashboard routes
   - Check mobile responsiveness

📚 Documentation:
   - NETLIFY_DEPLOYMENT_GUIDE.md - Complete guide
   - DEPLOYMENT_SUMMARY.md - Quick overview
   - netlify-env-template.txt - Environment variables

🔧 Quick Commands:
   .\deploy-to-netlify.ps1 -Build      # Build for production
   .\deploy-to-netlify.ps1 -Preview    # Test build locally
   .\deploy-to-netlify.ps1 -Deploy     # Deploy with Netlify CLI

"@ -ForegroundColor White
} 