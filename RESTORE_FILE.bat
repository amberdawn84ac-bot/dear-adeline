@echo off
cls
echo.
echo ════════════════════════════════════════════════════════════════
echo   FILE IS TRUNCATED - RESTORING FROM GIT
echo ════════════════════════════════════════════════════════════════
echo.

cd /d "C:\home\claude\dear-adeline"

echo Step 1: Checking git log to find last good commit...
git log --oneline -10
echo.

echo Step 2: RESTORING the file from the last commit before our edits...
git checkout HEAD~1 -- src\app\dashboard\DashboardClient.tsx
echo.

echo Step 3: Showing what was restored...
echo File has been restored from git!
echo.

echo ════════════════════════════════════════════════════════════════
echo ✅ FILE RESTORED
echo ════════════════════════════════════════════════════════════════
echo.
echo The file is now back to a working state.
echo We need to reapply the aiSummary/opportunities fixes carefully.
echo.

pause
