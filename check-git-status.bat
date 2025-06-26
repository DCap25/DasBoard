@echo off
echo ==========================================
echo   CHECKING GIT REPOSITORY STATUS
echo ==========================================
echo.

cd /d "E:\WebProjects\dasboard"
echo Current directory: %CD%
echo.

echo Checking git remote...
git remote -v
echo.

echo Checking git status...
git status
echo.

echo ==========================================
echo   REPOSITORY ANALYSIS
echo ==========================================
echo.
echo The dashboard project (E:\WebProjects\dasboard) should be connected to:
echo ✅ DasBoard repository (GitHub)
echo.
echo If it shows das-board-marketing or no remote, we need to fix it.
echo.
echo Next steps:
echo 1. If no remote: Add DasBoard repository as origin
echo 2. If wrong remote: Update to point to DasBoard repository  
echo 3. Push latest code to DasBoard repository
echo 4. Update Netlify to use DasBoard repository (not das-board-marketing)
echo.
pause 