@echo off
echo ==========================================
echo   MOVING DASHBOARD TO THEDASBOARD.COM
echo ==========================================
echo.

cd /d "E:\WebProjects\dasboard"

echo Current location: %CD%
echo.

echo Checking if build exists...
if exist "dist\index.html" (
    echo ✅ Build files found in dist folder
) else (
    echo ❌ No build files found - running build first...
    npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Build failed
        pause
        exit /b 1
    )
)

echo.
echo Attempting to deploy to thedasboard.com...
echo Site ID: d967da04-9e37-4c8e-ab88-4fb29c3276b0
echo.

netlify deploy --prod --dir=dist --site=d967da04-9e37-4c8e-ab88-4fb29c3276b0

if %ERRORLEVEL% == 0 (
    echo.
    echo ✅ SUCCESS! Dashboard deployed to thedasboard.com
    echo.
    echo Opening site...
    start https://thedasboard.com
) else (
    echo.
    echo ❌ CLI deployment failed - using manual approach
    echo.
    echo Manual deployment steps:
    echo 1. Go to https://app.netlify.com
    echo 2. Find site: d967da04-9e37-4c8e-ab88-4fb29c3276b0
    echo 3. Click "Deploy manually"
    echo 4. Upload ALL files from: %CD%\dist
    echo.
    echo Opening Netlify dashboard...
    start https://app.netlify.com
)

echo.
pause 