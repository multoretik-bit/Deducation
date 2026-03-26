@echo off
echo --- D-Education Manual GitHub Sync ---
echo Status: Checking for changes...
git status --short

echo.
echo Staging changes...
git add .

echo.
echo Committing...
git commit -m "Manual sync: Finance 2026 Curriculum (510 lessons integrated)"

echo.
echo Pushing to GitHub...
git push

echo.
echo --- SUCCESS: Sync Complete! ---
echo Press any key to close this window.
pause > nul
