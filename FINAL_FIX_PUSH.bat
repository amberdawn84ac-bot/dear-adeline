@echo off
echo ========================================
echo COMMITTING FINAL FIX
echo ========================================
echo.

cd /d "C:\home\claude\dear-adeline"

echo Current git status:
git status
echo.

echo Adding fixed file...
git add src\app\dashboard\DashboardClient.tsx

echo.
echo Committing...
git commit -m "fix: remove duplicate code block causing build error"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo ✅ ALL DONE! 
echo ========================================
echo.
echo Vercel will rebuild in 2-3 minutes.
echo Your site will be LIVE!
echo.
pause
