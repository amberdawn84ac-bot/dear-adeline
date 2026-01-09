@echo off
cd /d "C:\home\claude\dear-adeline"

echo ========================================
echo CHECKING GIT STATUS
echo ========================================
echo.

echo Files changed:
git status --short
echo.

echo Recent commits:
git log --oneline -5
echo.

echo ========================================
echo CHECKING FOR UNCOMMITTED CHANGES
echo ========================================
echo.

git diff --name-only
echo.

pause
