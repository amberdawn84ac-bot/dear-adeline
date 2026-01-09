@echo off
echo ========================================
echo COMMITTING AND PUSHING FIX
echo ========================================
echo.

cd /d "C:\home\claude\dear-adeline"

echo Current status:
git status
echo.

echo Adding changes...
git add src\app\dashboard\DashboardClient.tsx
echo.

echo Committing...
git commit -m "fix: replace || with ?? for proper nullish coalescing syntax"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo ✅ DONE! Check Vercel in 2-3 minutes
echo ========================================
echo.
echo Your site will be LIVE soon!
echo.
pause
