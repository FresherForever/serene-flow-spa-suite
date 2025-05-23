#!/bin/pwsh
# Updated Script to commit verification tools to Git (May 22, 2025)
# This script handles all the enhanced verification tools

# Set console colors
$infoColor = "Cyan"
$successColor = "Green"
$errorColor = "Red"
$commandColor = "Yellow"
$highlightColor = "Magenta"

Write-Host "=====================================================" -ForegroundColor $infoColor
Write-Host "COMMITTING ENHANCED VERIFICATION TOOLS TO GIT" -ForegroundColor $infoColor
Write-Host "=====================================================" -ForegroundColor $infoColor

# Get date for commit message
$date = Get-Date -Format "yyyy-MM-dd"

# List new/modified files
Write-Host "`nVerification files to be committed:" -ForegroundColor $infoColor
Write-Host "  - verify-all.ps1" -ForegroundColor $highlightColor
Write-Host "  - verify-deployment.ps1"
Write-Host "  - verify-database.ps1"
Write-Host "  - verify-report.ps1"
Write-Host "  - test-api.ps1"
Write-Host "  - verify-deployment.js" -ForegroundColor $highlightColor
Write-Host "  - verify-deployed.js" -ForegroundColor $highlightColor
Write-Host "  - verify-wrapper.js" -ForegroundColor $highlightColor
Write-Host "  - VERIFICATION_GUIDE.md"
Write-Host "  - VERIFICATION_README.md"
Write-Host "  - ENVIRONMENT_COMPARISON.md"
Write-Host "  - VERIFICATION_TROUBLESHOOTING.md" -ForegroundColor $highlightColor
Write-Host "  - verification-tools-summary.md" -ForegroundColor $highlightColor
Write-Host "  - package.json (updated scripts)" -ForegroundColor $highlightColor
Write-Host "  - src/components/DeploymentStatus.tsx"
Write-Host "  - src/components/EnvironmentInfo.tsx"

# Confirm with user
$confirm = Read-Host "`nDo you want to commit these changes? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Operation cancelled." -ForegroundColor $errorColor
    exit
}

# Stage files
Write-Host "`nStaging files..." -ForegroundColor $commandColor
git add verify-all.ps1
git add verify-deployment.ps1
git add verify-database.ps1  
git add verify-report.ps1
git add test-api.ps1
git add verify-deployment.js
git add verify-deployed.js
git add verify-wrapper.js
git add VERIFICATION_GUIDE.md
git add VERIFICATION_README.md
git add VERIFICATION_TROUBLESHOOTING.md
git add ENVIRONMENT_COMPARISON.md
git add verification-tools-summary.md
git add package.json
git add src/components/DeploymentStatus.tsx
git add src/components/EnvironmentInfo.tsx

# Commit
Write-Host "`nCommitting changes..." -ForegroundColor $commandColor
git commit -m "Enhance verification system (May 22, 2025)

- Added dependency-aware verification wrapper
- Improved Vercel deployment verification
- Created comprehensive verification toolchain
- Added automatic error recovery features
- Enhanced deployment troubleshooting documentation
- Updated verification guide with new tools"

# Push (optional)
$push = Read-Host "`nDo you want to push these changes to remote? (y/n)"
if ($push -eq "y") {
    Write-Host "Pushing changes..." -ForegroundColor $commandColor
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nChanges pushed successfully!" -ForegroundColor $successColor
    } else {
        Write-Host "`nFailed to push changes. Please push manually." -ForegroundColor $errorColor
    }
} else {
    Write-Host "`nChanges committed but not pushed." -ForegroundColor $infoColor
    Write-Host "Run 'git push' when you're ready to push the changes." -ForegroundColor $infoColor
}

# Next steps
Write-Host "`n=====================================================" -ForegroundColor $infoColor
Write-Host "NEXT STEPS" -ForegroundColor $infoColor
Write-Host "=====================================================" -ForegroundColor $infoColor
Write-Host "1. Start local environment:    npm run start:full"
Write-Host "2. Run verification:           ./verify-all.ps1"
Write-Host "3. Generate report:            ./verify-report.ps1 -GenerateReport"
Write-Host "4. Deploy to Vercel:           ./push-vercel-changes.ps1"
Write-Host "5. Verify Vercel deployment:   ./verify-all.ps1 -Vercel"
Write-Host "`nSee VERIFICATION_README.md for detailed instructions."
