@echo off
cls
echo.
echo ════════════════════════════════════════════════════════════════
echo   FINDING GOOD VERSION IN GIT HISTORY
echo ════════════════════════════════════════════════════════════════
echo.

cd /d "C:\home\claude\dear-adeline"

echo Recent commits:
git log --oneline -20 -- src\app\dashboard\DashboardClient.tsx
echo.
echo.

echo ════════════════════════════════════════════════════════════════
echo We need to restore from a commit BEFORE the truncation.
echo Looking at the commits above, find one that says something like:
echo   - "working dashboard"
echo   - "fix dashboard"  
echo   - Or any commit before the recent "fix: repair" commits
echo.
echo Let me try restoring from 5 commits ago...
echo ════════════════════════════════════════════════════════════════
echo.

git checkout HEAD~5 -- src\app\dashboard\DashboardClient.tsx

echo.
echo Checking file size...
powershell -Command "Write-Host 'File now has' (Get-Content 'src\app\dashboard\DashboardClient.tsx').Count 'lines'"
echo.

pause
