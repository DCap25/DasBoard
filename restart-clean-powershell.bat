@echo off
echo ==========================================
echo    RESTARTING CLEAN POWERSHELL
echo ==========================================
echo.
echo The current PowerShell has console buffer issues.
echo Starting a fresh PowerShell session...
echo.

echo Killing all PowerShell processes...
taskkill /IM powershell.exe /F 2>nul
taskkill /IM pwsh.exe /F 2>nul

echo.
echo Starting new PowerShell with clean environment...
echo.

start powershell -NoProfile -ExecutionPolicy Bypass -Command "& { Clear-Host; Write-Host 'CLEAN POWERSHELL SESSION' -ForegroundColor Green; Write-Host 'Console buffer reset' -ForegroundColor Yellow; Set-Location 'E:\WebProjects\dasboard'; Write-Host 'Location: E:\WebProjects\dasboard' -ForegroundColor Cyan; Write-Host 'Ready for commands!' -ForegroundColor Green }"

echo.
echo ✅ New PowerShell window should have opened
echo ✅ The new session should work properly
echo.
echo If that doesn't work, try:
echo 1. Close ALL PowerShell windows
echo 2. Restart your computer
echo 3. Use Command Prompt instead
echo.
pause 