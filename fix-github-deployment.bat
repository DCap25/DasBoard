@echo off
echo ==========================================
echo   UPDATE GITHUB FOR CORRECT DEPLOYMENT
echo ==========================================
echo.

cd /d "E:\WebProjects\dasboard"

echo Current directory: %CD%
echo.

echo Step 1: Check current Git repository...
git remote -v
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git not initialized or no remote
    echo.
    echo Setting up Git repository...
    git init
    echo Enter your GitHub repository URL for the dashboard:
    set /p repo_url="GitHub URL (should be DasBoard repository): "
    git remote add origin %repo_url%
) else (
    echo ✅ Git repository found
)

echo.
echo Step 2: Push dashboard code to GitHub...
git add .
git status

echo.
echo Current files to commit:
git diff --name-only --cached

echo.
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg="Update dashboard for Netlify deployment"

git commit -m "%commit_msg%"

echo.
echo Pushing to GitHub...
git push origin master
if %ERRORLEVEL% NEQ 0 (
    echo Trying 'main' branch...
    git push origin main
)

echo.
echo ==========================================
echo   NETLIFY CONFIGURATION NEEDED
echo ==========================================
echo.
echo Now you need to update Netlify to use the correct repository:
echo.
echo 1. Go to: https://app.netlify.com/sites/d967da04-9e37-4c8e-ab88-4fb29c3276b0
echo 2. Click "Site settings"
echo 3. Go to "Build & deploy"
echo 4. In "Repository" section, click "Link to a different repository"
echo 5. Select your DasBoard repository (NOT das-board-marketing)
echo 6. Set build settings:
echo    - Build command: npm run build
echo    - Publish directory: dist
echo    - Branch: master (or main)
echo.
echo OR update existing repository link:
echo 1. In "Build settings" section
echo 2. Edit settings:
echo    - Build command: npm run build  
echo    - Publish directory: dist
echo    - Branch: master (or main)
echo.
echo Opening Netlify site settings...
start https://app.netlify.com/sites/d967da04-9e37-4c8e-ab88-4fb29c3276b0/settings/deploys

echo.
echo ==========================================
echo   GITHUB UPDATE COMPLETE
echo ==========================================
echo.
echo After updating Netlify settings:
echo 1. Trigger a new deployment
echo 2. thedasboard.com should show the dashboard app
echo 3. No more 404 errors!
echo.
pause 