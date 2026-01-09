@echo off
echo ========================================
echo FIXING BUILD ERROR
echo ========================================
echo.
echo Making the fix now...
echo.

cd /d "C:\home\claude\dear-adeline"

REM Use PowerShell to do the find and replace
powershell -Command "(Get-Content 'src\app\dashboard\DashboardClient.tsx') -replace '\(selectedStudent \|\| profile\)\?\.display_name', 'selectedStudent?.display_name ?? profile?.display_name' -replace '\(selectedStudent \|\| profile\)\?\.grade_level', 'selectedStudent?.grade_level ?? profile?.grade_level' | Set-Content 'src\app\dashboard\DashboardClient.tsx'"

echo.
echo ✅ Fix applied!
echo.
echo Now committing and pushing...
echo.

git add src\app\dashboard\DashboardClient.tsx
git commit -m "fix: syntax error in DashboardClient - replace || with ?? for nullish coalescing"
git push origin main

echo.
echo ========================================
echo ✅ DONE! 
echo ========================================
echo.
echo Check Vercel in 2-3 minutes for successful build!
echo.
pause
