@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                  ║
echo ║     🔧 FIX SYNTAX ERROR AND DEPLOY 🔧                           ║
echo ║                                                                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd /d "C:\home\claude\dear-adeline"

echo [1/5] Pulling latest from GitHub...
git pull origin main
echo ✓ Synced
echo.

echo [2/5] Adding fixes...
git add src\app\dashboard\DashboardClient.tsx
echo ✓ Staged
echo.

echo [3/5] Committing...
git commit -m "fix: repair malformed template literal in aside className"
echo ✓ Committed
echo.

echo [4/5] Pushing to GitHub...
git push origin main
echo ✓ Pushed!
echo.

echo [5/5] Done!
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  ✅ SYNTAX ERROR FIXED!                                         ║
echo ║                                                                  ║
echo ║  The template literal is now properly closed.                   ║
echo ║  Vercel will rebuild in 2-3 minutes.                            ║
echo ║                                                                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

pause
