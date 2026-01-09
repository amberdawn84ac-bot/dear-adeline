@echo off
cd /d "C:\home\claude\dear-adeline"

echo ========================================
echo CHECKING WHAT VERCEL IS BUILDING
echo ========================================
echo.

echo === Checking line 259 in the file ===
powershell -Command "(Get-Content 'src\app\dashboard\DashboardClient.tsx')[258]"
echo.

echo === Searching for 'card p-20 text-center' ===
findstr /n "card p-20 text-center" src\app\dashboard\DashboardClient.tsx
echo.

echo === Searching for all aiSummary references ===
findstr /n "aiSummary" src\app\dashboard\DashboardClient.tsx
echo.

pause
