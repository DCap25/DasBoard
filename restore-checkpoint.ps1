# Restore from Checkpoint - Return to Working State
Write-Host "=== RESTORING FROM CHECKPOINT ===" -ForegroundColor Green

# Go to dashboard project
Set-Location "E:\WebProjects\dasboard"
Write-Host "Current location: $(Get-Location)" -ForegroundColor Yellow

# Show recent commits to find checkpoint
Write-Host "`nRecent commits:" -ForegroundColor Cyan
git log --oneline -10

Write-Host "`nLooking for checkpoint commit..." -ForegroundColor Cyan
$checkpointCommit = git log --oneline | Select-String "checkpoint|working|stable" | Select-Object -First 1

if ($checkpointCommit) {
    $commitHash = ($checkpointCommit -split " ")[0]
    Write-Host "Found checkpoint: $checkpointCommit" -ForegroundColor Green
    
    $confirm = Read-Host "`nRestore to this checkpoint? (y/n)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        Write-Host "Restoring to checkpoint: $commitHash" -ForegroundColor Green
        git reset --hard $commitHash
        Write-Host "✅ Restored to checkpoint" -ForegroundColor Green
        
        # Check if build works
        Write-Host "`nTesting build..." -ForegroundColor Cyan
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build successful - checkpoint is good!" -ForegroundColor Green
        } else {
            Write-Host "❌ Build failed - may need different checkpoint" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No obvious checkpoint found. Showing all commits:" -ForegroundColor Yellow
    git log --oneline -20
    
    $manualHash = Read-Host "`nEnter commit hash to restore to (or press Enter to skip)"
    if ($manualHash) {
        git reset --hard $manualHash
        Write-Host "✅ Restored to: $manualHash" -ForegroundColor Green
    }
}

Write-Host "`n=== CHECKPOINT RESTORATION COMPLETE ===" -ForegroundColor Green 