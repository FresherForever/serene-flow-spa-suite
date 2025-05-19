#!/bin/pwsh

Write-Host "Committing and pushing Vercel deployment changes to GitHub"

# Add all modified files
git add .

# Commit changes with a descriptive message
git commit -m "Update Vercel deployment configuration with improved build process, database migration, and API handlers"

# Push changes to GitHub
git push

Write-Host "Changes pushed successfully! Now you can deploy in Vercel."
Write-Host "Next steps:"
Write-Host "1. Go to your Vercel dashboard"
Write-Host "2. Import or update your project"
Write-Host "3. Set up environment variables as described in DEPLOYMENT_UPDATED.md"
Write-Host "4. Create a PostgreSQL database in Vercel"
Write-Host "5. Trigger a deployment"
