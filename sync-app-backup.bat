@echo off
echo ===== SYNCING APP BACKUP =====
cd /d "E:\WebProjects\das-board-app-backup"
git add .
git commit -m "Sync: Updated legal content with main dashboard project - Privacy Policy and Terms of Service updated with dealership-specific content - Updated date to June 25, 2025 - Contact info changed to support@thedasboard.com"
git push
echo App backup synced successfully!
pause 