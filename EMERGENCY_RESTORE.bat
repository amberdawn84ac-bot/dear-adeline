@echo off
cls
echo.
echo ════════════════════════════════════════════════════════════════
echo   EMERGENCY FILE RESTORE
echo ════════════════════════════════════════════════════════════════
echo.

cd /d "C:\home\claude\dear-adeline"

echo Step 1: Discarding ALL local changes to DashboardClient.tsx...
git checkout -- src\app\dashboard\DashboardClient.tsx
echo.

echo Step 2: Pulling the latest from GitHub...
git pull origin main
echo.

echo Step 3: Verifying the file is complete...
powershell -Command "Write-Host 'File has' (Get-Content 'src\app\dashboard\DashboardClient.tsx').Count 'lines'"
echo.

echo ════════════════════════════════════════════════════════════════
echo ✅ FILE SHOULD NOW BE RESTORED
echo ════════════════════════════════════════════════════════════════
echo.
echo If the file has around 900+ lines, it's good!
echo If it only has ~370 lines, something went wrong.
echo.

pause
