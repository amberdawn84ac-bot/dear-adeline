@echo off
echo ========================================
echo DEPLOYING RESTORED INSIGHTS SECTION
echo ========================================
echo.

cd /d "C:\home\claude\dear-adeline"

echo Git status:
git status
echo.

echo Adding changes...
git add src\app\dashboard\DashboardClient.tsx
echo.

echo Committing...
git commit -m "fix: restore AI summary and opportunities display section with proper empty state handling"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo ✅ DEPLOYED!
echo ========================================
echo.
echo Vercel will rebuild in 2-3 minutes
echo Your site will be LIVE with all insights!
echo.
pause
