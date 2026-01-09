@echo off
cd /d "C:\home\claude\dear-adeline"

echo Checking line 371 for syntax errors...
echo.

powershell -Command "$line = (Get-Content 'src\app\dashboard\DashboardClient.tsx')[370]; Write-Host 'Line 371:'; Write-Host $line"

echo.
echo.

echo Looking for template literal issues...
powershell -Command "Get-Content 'src\app\dashboard\DashboardClient.tsx' | Select-String -Pattern 'className=\{`' -Context 0,1 | Select-Object -First 10"

pause
