@echo off
echo ==========================================
echo     FINDING WORKING CHECKPOINT
echo ==========================================
echo.

cd /d "E:\WebProjects\dasboard"

echo Current location: %CD%
echo.

echo Recent commits:
git log --oneline -15

echo.
echo Looking for checkpoint commit (48db1b1a)...
git show --stat 48db1b1a 2>nul
if %ERRORLEVEL% == 0 (
    echo ✅ Found checkpoint commit: 48db1b1a
    echo.
    echo This commit message:
    git log -1 --pretty=format:"%%s" 48db1b1a
    echo.
    echo.
    set /p restore="Restore to this checkpoint? (y/n): "
    if /i "%restore%"=="y" (
        echo.
        echo Restoring to checkpoint 48db1b1a...
        git reset --hard 48db1b1a
        
        if %ERRORLEVEL% == 0 (
            echo ✅ Successfully restored to checkpoint
            echo.
            echo Testing build...
            npm run build
            
            if %ERRORLEVEL% == 0 (
                echo ✅ Build successful - checkpoint is working!
            ) else (
                echo ❌ Build failed - may need different approach
            )
        ) else (
            echo ❌ Failed to restore checkpoint
        )
    )
) else (
    echo ❌ Checkpoint 48db1b1a not found
    echo.
    echo Available commits:
    git log --oneline -20
    echo.
    set /p manual="Enter commit hash to restore to (or press Enter to skip): "
    if not "%manual%"=="" (
        git reset --hard %manual%
        echo Restored to: %manual%
    )
)

echo.
echo ==========================================
echo      CHECKPOINT RESTORATION DONE
echo ==========================================
pause 