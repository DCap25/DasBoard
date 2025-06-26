@echo off
echo ==========================================
echo    FIX CLI AND DEPLOY DASHBOARD
echo ==========================================
echo.

cd /d "E:\WebProjects\dasboard"

echo Step 1: Check Node.js and npm...
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

npm --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm not found
    echo Node.js installation may be corrupted
    pause
    exit /b 1
)

echo ✅ Node.js and npm are working

echo.
echo Step 2: Install Netlify CLI...
npm install -g netlify-cli
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install Netlify CLI
    echo Trying alternative installation...
    npx netlify-cli --version
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Alternative installation failed
        goto MANUAL_DEPLOY
    )
    echo ✅ Using npx instead of global install
    set NETLIFY_CMD=npx netlify-cli
) else (
    echo ✅ Netlify CLI installed successfully
    set NETLIFY_CMD=netlify
)

echo.
echo Step 3: Check authentication...
%NETLIFY_CMD% status
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Not authenticated
    echo Logging in to Netlify...
    %NETLIFY_CMD% login
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Login failed
        goto MANUAL_DEPLOY
    )
)

echo ✅ Authenticated successfully

echo.
echo Step 4: Deploy dashboard to thedasboard.com...
echo Site ID: d967da04-9e37-4c8e-ab88-4fb29c3276b0
echo Directory: dist
echo.

%NETLIFY_CMD% deploy --prod --dir=dist --site=d967da04-9e37-4c8e-ab88-4fb29c3276b0

if %ERRORLEVEL% == 0 (
    echo.
    echo ✅ SUCCESS! Dashboard deployed to thedasboard.com
    echo Opening site...
    start https://thedasboard.com
    goto END
)

:MANUAL_DEPLOY
echo.
echo ==========================================
echo    MANUAL DEPLOYMENT REQUIRED
echo ==========================================
echo.
echo CLI deployment failed. Here's how to deploy manually:
echo.
echo 1. Go to: https://app.netlify.com/sites/d967da04-9e37-4c8e-ab88-4fb29c3276b0
echo 2. Click on "Deploys" tab
echo 3. Look for "Deploy manually" or "Drag and drop"
echo 4. Upload ALL files from: %CD%\dist
echo.
echo Alternative: Look for these options in Netlify:
echo - "Deploy site" button
echo - "Drag and drop" area
echo - "Browse to choose" link
echo.
echo Opening Netlify site directly...
start https://app.netlify.com/sites/d967da04-9e37-4c8e-ab88-4fb29c3276b0

:END
echo.
pause 