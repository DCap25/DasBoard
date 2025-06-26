@echo off
echo ==========================================
echo   FIX THEDASBOARD.COM DEPLOYMENT
echo ==========================================
echo.
echo Problem: thedasboard.com is deploying from GitHub (Next.js - broken)
echo Solution: Deploy dashboard files directly (bypass GitHub)
echo.

cd /d "E:\WebProjects\dasboard"

echo Step 1: Verify dashboard files exist...
if exist "dist\index.html" (
    echo ✅ Dashboard build files found
    echo Files in dist folder:
    dir dist /b
) else (
    echo ❌ No dashboard build found
    echo Building dashboard...
    npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
)

echo.
echo Step 2: Attempting CLI deployment...
echo Target: d967da04-9e37-4c8e-ab88-4fb29c3276b0 (thedasboard.com)
echo.

netlify deploy --prod --dir=dist --site=d967da04-9e37-4c8e-ab88-4fb29c3276b0 --debug

if %ERRORLEVEL% == 0 (
    echo ✅ CLI deployment successful!
    echo Opening thedasboard.com...
    start https://thedasboard.com
    goto END
)

echo.
echo ❌ CLI deployment failed
echo.
echo Manual deployment required:
echo.
echo IMPORTANT: You need to OVERRIDE the GitHub deployment
echo.
echo 1. Go to: https://app.netlify.com/sites/d967da04-9e37-4c8e-ab88-4fb29c3276b0
echo 2. Look for "Deploy manually" or "Drag and drop" 
echo 3. Upload ALL files from: %CD%\dist
echo 4. This will OVERRIDE the GitHub deployment
echo.
echo Alternative approach:
echo 1. Go to Site Settings
echo 2. Build ^& Deploy
echo 3. Disconnect GitHub repository
echo 4. Then upload files manually
echo.
echo Opening Netlify site...
start https://app.netlify.com/sites/d967da04-9e37-4c8e-ab88-4fb29c3276b0

:END
echo.
echo ==========================================
echo   DEPLOYMENT PROCESS COMPLETE
echo ==========================================
pause 