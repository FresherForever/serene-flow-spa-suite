# Serene Flow Spa Suite - Verification Tools

This directory contains tools and scripts to verify and compare your Serene Flow Spa Suite application in both local development and Vercel production environments.

## Quick Start

Run the comprehensive verification:

```powershell
# For local environment verification:
./verify-all.ps1

# For Vercel environment verification:
$env:VERCEL_URL = "https://your-app.vercel.app"
./verify-all.ps1 -Vercel
```

## Available Verification Tools

| Tool | Description | Usage |
|------|-------------|-------|
| `start-dev.ps1` | Starts both frontend and backend servers with error handling | `./start-dev.ps1` |
| `check-servers.ps1` | Checks if servers are running with detailed diagnostics | `./check-servers.ps1 [-StartIfNeeded] [-Detailed]` |
| `verify-all.ps1` | Comprehensive verification script that runs all checks | `./verify-all.ps1 [-Vercel] [-VercelUrl url]` |
| `verify-deployment.ps1` | Basic deployment verification | `./verify-deployment.ps1 [--vercel]` |
| `verify-database.ps1` | Database connection verification | `./verify-database.ps1 [-Vercel] [-VercelUrl url]` |
| `test-api.ps1` | API endpoint testing | `./test-api.ps1 [-Vercel] [-VercelUrl url]` |
| `verify-report.ps1` | Generates HTML report comparing environments | `./verify-report.ps1 [-GenerateReport] [-Vercel] [-VercelUrl url]` |
| `master-verify.ps1` | Complete verification suite with HTML reporting | `./master-verify.ps1 [-GenerateReport] [-StartServers]` |

## Visual Indicators

The application includes built-in visual indicators to help identify which environment you're using:

1. **Environment Indicator** in the sidebar (bottom-left)
2. **Deployment Status** card on the Dashboard page
3. **URL** in browser address bar (localhost vs vercel.app)

## Documentation

| Document | Description |
|----------|-------------|
| `VERIFICATION_GUIDE.md` | Detailed instructions for verifying both environments |
| `ENVIRONMENT_COMPARISON.md` | Side-by-side comparison of local and Vercel environments |
| `VERCEL_TROUBLESHOOTING_UPDATED.md` | Troubleshooting guide for common Vercel deployment issues |
| `DEPLOYMENT_UPDATED.md` | Complete deployment instructions for Vercel |

## Verification Process

### 1. Start the Application

```powershell
# Start both frontend and backend for local verification
./start-dev.ps1
# Or use npm script
npm run start:full
```

### 2. Check Server Status

```powershell
# Check if servers are running properly
./check-servers.ps1
# Start servers if not running
./check-servers.ps1 -StartIfNeeded
# Get detailed server diagnostics
./check-servers.ps1 -Detailed
# Enable automatic self-healing of server issues
./check-servers.ps1 -SelfHeal
# Force restart servers with healing capabilities
./check-servers.ps1 -ForceRestart -SelfHeal
```

### 3. Run Verification Scripts

```powershell
# Run comprehensive verification
./verify-all.ps1

# Generate HTML report
./verify-report.ps1 -GenerateReport

# Run the master verification with all options
./master-verify.ps1 -GenerateReport -StartServers
```

### 3. Manual Verification

1. Open the application in your browser
2. Check the environment indicator in the sidebar
3. Verify the Deployment Status card on the Dashboard
4. Test creating and retrieving data

## Common Issues and Solutions

See `VERCEL_TROUBLESHOOTING_UPDATED.md` for detailed troubleshooting information.

### Local Environment Issues

- **API unreachable**: Make sure the backend server is running on port 5000
  - Run `./check-servers.ps1 -StartIfNeeded` to check and start servers automatically
  - Check for syntax errors in backend code if server crashes
- **Database connection failed**: Verify PostgreSQL is running and credentials are correct in `.env`
  - The system will now continue with limited functionality even without a database connection
- **CORS errors**: Check CORS configuration in `backend/src/server.js`
- **Server crashes**: Run `./start-dev.ps1` which includes error handling and diagnostic information

### Vercel Environment Issues

- **API 404 errors**: Check `vercel.json` rewrites configuration
- **Database connection failed**: Verify `DATABASE_URL` in Vercel environment variables
- **Missing tables**: Check migration script execution in build logs

## Requirements for Verification Tools

- PowerShell 7.0 or higher
- Node.js 18.x or higher
- Web browser for viewing reports and the application

## Getting Help

If you encounter issues with the verification process:

1. Check the documentation mentioned above
2. Run `./verify-report.ps1 -GenerateReport` to generate a detailed report
3. Review the deployment logs in Vercel dashboard
