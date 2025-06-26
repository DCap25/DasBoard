@echo off
echo ==========================================
echo       TERMINAL FIX + DEPLOYMENT
echo ==========================================
echo.
echo The PowerShell terminal has console buffer issues.
echo This script will use CMD instead.
echo.

echo Checking Netlify CLI...
netlify --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Netlify CLI not found
    echo Installing Netlify CLI...
    npm install -g netlify-cli
)

echo.
echo Opening new Command Prompt for deployment...
echo (This bypasses PowerShell issues)
echo.

start cmd /k "echo ===== CLEAN COMMAND PROMPT ===== && cd /d E:\WebProjects\das-board-marketing && echo Current directory: %CD% && echo Files to deploy: && dir out && echo. && echo Deploying... && netlify deploy --prod --dir=out --site=d967da04-9e37-4c8e-ab88-4fb29c3276b0"

echo.
echo ✅ New terminal opened
echo The deployment should run in the new window
echo.
pause 