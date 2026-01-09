@echo off
echo ========================================
echo DEPLOYING SIMPLIFIED EMPTY STATE FIX
echo ========================================
echo.

cd /d "C:\home\claude\dear-adeline"

echo Current changes:
git diff --stat
echo.

echo Adding all changes...
git add -A
echo.

echo Committing...
git commit -m "fix: simplify empty state to avoid undefined variable errors"
echo.

echo Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo ✅ DEPLOYED!
echo ========================================
echo.
echo Vercel will rebuild automatically
echo Check https://dear-adeline.vercel.app in 2-3 min
echo.
pause
