@echo off
echo ========================================
echo URGENT BUILD FIX
echo ========================================
echo.
echo This script will FIX the build error in DashboardClient.tsx
echo.
echo ERROR: Line 352 has syntax that Turbopack cannot parse
echo FIX: Replace || with ?? for nullish coalescing
echo.
pause
echo.
echo Opening file for manual edit...
echo FIND THESE LINES (around line 350-353):
echo.
echo     name: (selectedStudent ^|^| profile)?.display_name,
echo     gradeLevel: (selectedStudent ^|^| profile)?.grade_level,
echo.
echo CHANGE TO:
echo.
echo     name: selectedStudent?.display_name ?? profile?.display_name,
echo     gradeLevel: selectedStudent?.grade_level ?? profile?.grade_level,
echo.
echo.
echo Opening file now...
notepad "C:\home\claude\dear-adeline\src\app\dashboard\DashboardClient.tsx"
echo.
echo After fixing, press any key to commit and push...
pause
echo.
cd /d "C:\home\claude\dear-adeline"
git add src/app/dashboard/DashboardClient.tsx
git commit -m "fix: syntax error in DashboardClient line 352 - replace || with ??"
git push origin main
echo.
echo ========================================
echo FIX DEPLOYED! Check Vercel in 2-3 minutes
echo ========================================
pause
