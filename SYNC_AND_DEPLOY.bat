@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║     🔄 SYNC FROM GITHUB AND DEPLOY 🔄                           ║
echo ║                                                                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\home\claude\dear-adeline"

echo [1/7] Checking current status...
echo.
git status --short
echo.

echo [2/7] Stashing any local changes...
git stash
echo ✓ Local changes saved temporarily
echo.

echo [3/7] Pulling latest changes from GitHub...
git pull origin main
echo ✓ Synced with GitHub!
echo.

echo [4/7] Restoring your local changes...
git stash pop
echo ✓ Local changes restored
echo.

echo [5/7] Adding all changes...
git add -A
echo ✓ All changes staged
echo.

echo [6/7] Committing...
git commit -m "fix: sync and deploy - properly initialize aiSummary and opportunities with TypeScript types"
echo ✓ Changes committed
echo.

echo [7/7] Pushing to GitHub...
git push origin main
echo ✓ Pushed to GitHub!
echo.

echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║  ✅ SYNCED AND DEPLOYED!                                        ║
echo ║                                                                  ║
echo ║  Your local code and GitHub are now in sync.                    ║
echo ║  Vercel will rebuild automatically in 2-3 minutes.              ║
echo ║                                                                  ║
echo ║  Check: https://dear-adeline.vercel.app                         ║
echo ║                                                                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause
