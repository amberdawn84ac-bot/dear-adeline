@echo off
cls
echo.
echo ════════════════════════════════════════════════════════════════
echo                    COMMITTING TO GITHUB
echo ════════════════════════════════════════════════════════════════
echo.

cd /d "C:\home\claude\dear-adeline"

echo Step 1: Pulling latest changes...
git pull origin main
echo.

echo Step 2: Checking what changed...
git status
echo.

echo Step 3: Adding all changes...
git add -A
echo.

echo Step 4: Committing...
git commit -m "fix: repair template literal syntax error in sidebar className"
echo.

echo Step 5: Pushing to GitHub...
git push origin main
echo.

echo ════════════════════════════════════════════════════════════════
echo ✅ DONE! Changes pushed to GitHub
echo ════════════════════════════════════════════════════════════════
echo.
echo Vercel will automatically rebuild your site in 2-3 minutes.
echo Check https://dear-adeline.vercel.app
echo.

pause
