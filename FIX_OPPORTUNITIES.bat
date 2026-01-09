@echo off
cd /d "C:\home\claude\dear-adeline"

echo Fixing the aiSummary reference in opportunities page...

powershell -Command "(Get-Content 'src\app\opportunities\page.tsx') -replace '{!loading && opportunities\.length === 0 && !aiSummary && \(', '{!loading && opportunities.length === 0 && (' | Set-Content 'src\app\opportunities\page.tsx'"

echo.
echo ✅ FIXED! Removed undefined aiSummary reference.
echo.
echo Now run: pnpm run build
echo.
pause
