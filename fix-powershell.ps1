# Fix PowerShell Console Buffer Issues
Write-Host "=== FIXING POWERSHELL TERMINAL ===" -ForegroundColor Green

# Clear console history that's causing buffer overflow
Clear-Host

# Reset PSReadLine settings
try {
    Remove-Module PSReadLine -Force -ErrorAction SilentlyContinue
    Import-Module PSReadLine -Force
    
    # Set safe PSReadLine options
    Set-PSReadLineOption -PredictionSource None
    Set-PSReadLineOption -HistoryNoDuplicates:$true
    Set-PSReadLineOption -MaximumHistoryCount 1000
    
    Write-Host "✅ PSReadLine module reset successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ PSReadLine reset failed, but continuing..." -ForegroundColor Yellow
}

# Clear console buffer
Clear-Host

# Reset console window size
try {
    $Host.UI.RawUI.WindowSize = New-Object System.Management.Automation.Host.Size(120, 30)
    $Host.UI.RawUI.BufferSize = New-Object System.Management.Automation.Host.Size(120, 3000)
    Write-Host "✅ Console buffer reset successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Console buffer reset failed, but continuing..." -ForegroundColor Yellow
}

Write-Host "`n=== TERMINAL SHOULD BE FIXED ===" -ForegroundColor Green
Write-Host "If you still have issues, restart PowerShell completely." -ForegroundColor Yellow

# Test the terminal
Write-Host "`nTesting terminal..." -ForegroundColor Cyan
Get-Location
Write-Host "✅ Terminal test complete" -ForegroundColor Green 