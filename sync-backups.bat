@echo off
echo ===== SYNCING BACKUP REPOSITORIES =====
echo.

echo Syncing Marketing Backup...
cd /d "E:\WebProjects\das-board-marketing-backup"
if exist ".git" (
    git add .
    git commit -m "Sync: Updated legal content with main marketing project - Privacy Policy and Terms of Service updated with dealership-specific content"
    git push
    echo Marketing backup synced successfully!
) else (
    echo Marketing backup is not a git repository or path not found.
)
echo.

echo Syncing App Backup...  
cd /d "E:\WebProjects\das-board-app-backup"
if exist ".git" (
    git add .
    git commit -m "Sync: Updated legal content with main dashboard project - Privacy Policy and Terms of Service updated with dealership-specific content"
    git push
    echo App backup synced successfully!
) else (
    echo App backup is not a git repository or path not found.
)
echo.

echo ===== BACKUP SYNC COMPLETE =====
pause 