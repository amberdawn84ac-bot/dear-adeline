@echo off
cd /d "C:\home\claude\dear-adeline"

echo Fixing the useState type on line 179...

powershell -Command "(Get-Content 'src\app\dashboard\DashboardClient.tsx') -replace 'const \[opportunities, setOpportunities\] = useState\(\[\]\);', 'const [opportunities, setOpportunities] = useState<any[]>([]);' | Set-Content 'src\app\dashboard\DashboardClient.tsx'"

echo.
echo ✅ FIXED! Type added to opportunities state.
echo.
echo Now run: pnpm run build
echo.
pause
