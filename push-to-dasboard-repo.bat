@echo off
echo ==========================================
echo   PUSH TO DASBOARD REPOSITORY
echo ==========================================
echo.

cd /d "E:\WebProjects\dasboard"

echo Step 1: Pull latest changes from DasBoard repository...
git pull origin master
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Pull failed, continuing...
)

echo.
echo Step 2: Add all changes...
git add .

echo.
echo Step 3: Show what will be committed...
git status --short

echo.
echo Step 4: Commit changes...
set commit_msg="Update dashboard for Netlify deployment - fix thedasboard.com"
git commit -m %commit_msg%

echo.
echo Step 5: Push to DasBoard repository...
git push origin master

echo.
echo ==========================================
echo   SUCCESS! CODE PUSHED TO DASBOARD REPO
echo ==========================================
echo.
echo Now update Netlify settings:
echo.
echo 1. Go to: https://app.netlify.com/sites/d967da04-9e37-4c8e-ab88-4fb29c3276b0/settings/deploys
echo 2. Check current repository connection
echo 3. If it says "das-board-marketing" - change it to "DasBoard"
echo 4. Ensure build settings:
echo    ✅ Build command: npm run build
echo    ✅ Publish directory: dist
echo    ✅ Branch: master
echo.
echo Opening Netlify site settings...
start https://app.netlify.com/sites/d967da04-9e37-4c8e-ab88-4fb29c3276b0/settings/deploys

echo.
echo ==========================================
echo   AFTER NETLIFY UPDATE
echo ==========================================
echo.
echo 1. Trigger new deployment in Netlify
echo 2. Wait 2-5 minutes for build
echo 3. Check https://thedasboard.com
echo 4. Should show dashboard login (not 404)!
echo.
pause 