# GitHub Sync Spirit Script for D-Education
# Version: 1.0 (Finance 2026 Release)

Write-Host "--- D-Education GitHub Sync Start ---" -ForegroundColor Cyan

# 1. Check for changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "No changes detected. Repository is up to date." -ForegroundColor Yellow
    exit
}

# 2. Add all changes
Write-Host "Staging changes..." -ForegroundColor Gray
git add .

# 3. Commit
$commitMsg = "[Finance 2026] Integrated 25-block curriculum and resolved data rendering issues"
Write-Host "Committing with message: '$commitMsg'" -ForegroundColor Gray
git commit -m "$commitMsg"

# 4. Push
Write-Host "Pushing to GitHub..." -ForegroundColor Magenta
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host "--- SUCCESS: Finance 2026 integrated and synced! ---" -ForegroundColor Green
} else {
    Write-Host "--- ERROR: Git push failed. Please check your credentials or connection. ---" -ForegroundColor Red
}

pause
