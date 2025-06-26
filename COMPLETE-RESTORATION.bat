@echo off
title COMPLETE SITE RESTORATION - MARKETING + DASHBOARD

echo ==========================================
echo     COMPLETE SITE RESTORATION
echo ==========================================
echo.
echo This will restore BOTH:
echo 1. Marketing site (thedasboard.com)
echo 2. Dashboard app (working location)
echo.
pause

echo.
echo ==========================================
echo   STEP 1: RESTORE MARKETING SITE
echo ==========================================
echo.

cd /d "E:\WebProjects\das-board-marketing"

echo Preparing marketing site files...
if not exist "out" mkdir out
copy emergency.html out\index.html
echo /*    /index.html   200 > out\_redirects

echo Files ready:
dir out
echo.

echo Deploying marketing site to thedasboard.com...
netlify deploy --prod --dir=out --site=d967da04-9e37-4c8e-ab88-4fb29c3276b0

if %ERRORLEVEL% == 0 (
    echo ✅ Marketing site deployed successfully
) else (
    echo ❌ Marketing site deployment failed
    echo Manual upload required at https://app.netlify.com
)

echo.
echo ==========================================
echo   STEP 2: REBUILD DASHBOARD APP
echo ==========================================
echo.

cd /d "E:\WebProjects\dasboard"

echo Building dashboard app...
npm run build

if %ERRORLEVEL% == 0 (
    echo ✅ Dashboard build successful
    
    echo.
    echo Creating new Netlify site for dashboard...
    netlify sites:create --name dasboard-app-main
    
    echo Deploying dashboard to new site...
    netlify deploy --prod --dir=dist
    
) else (
    echo ❌ Dashboard build failed
    echo Try: npm install, then npm run build
)

echo.
echo ==========================================
echo     RESTORATION COMPLETE
echo ==========================================
echo.
echo Expected results:
echo 🌐 thedasboard.com - Marketing site
echo 🎛️ New Netlify URL - Dashboard app
echo.
echo If any step failed, check the error messages above
echo.
pause 