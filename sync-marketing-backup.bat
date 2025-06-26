@echo off
echo ===== SYNCING MARKETING BACKUP =====
cd /d "E:\WebProjects\das-board-marketing-backup"
git add .
git commit -m "Sync: Updated legal content with main marketing project - Privacy Policy and Terms of Service updated with dealership-specific content - Updated date to June 25, 2025 - Contact info changed to support@thedasboard.com"
git push
echo Marketing backup synced successfully!
pause 