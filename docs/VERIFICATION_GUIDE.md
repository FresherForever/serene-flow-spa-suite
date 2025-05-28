# Deployment Verification Guide

This guide provides step-by-step instructions for verifying the Serene Flow Spa Suite application in both local development and Vercel deployment environments.

## Table of Contents

1. [Local Environment Verification](#local-environment-verification)
2. [Vercel Environment Verification](#vercel-environment-verification)
3. [Common Issues and Solutions](#common-issues-and-solutions)
4. [Verification Tools](#verification-tools)

## Local Environment Verification

### Step 1: Start the Development Environment

First, make sure both the frontend and backend servers are running:

```powershell
# Start the backend server
cd c:\Workspace\Spa\serene-flow-spa-suite\backend
npm run dev

# In another terminal, start the frontend development server
cd c:\Workspace\Spa\serene-flow-spa-suite
npm run dev
```

Or use the combined command:

```powershell
npm run start:full
```

### Step 2: Run the Verification Script

```powershell
# Verify the local environment
./verify-deployment.ps1
```

### Step 3: Manual Verification

1. **Frontend**:
   - Open your browser and navigate to: `http://localhost:5173`
   - Verify that the application loads correctly
   - Check that the environment indicator in the bottom-left corner shows "Development (Local)"
   - Verify that navigation works between different pages

2. **API**:
   - Open your browser and navigate to: `http://localhost:5000/api/health`
   - You should see a JSON response with `"status": "OK"`
   - Test another endpoint: `http://localhost:5000/api/services`

3. **Database**:
   - Create a new appointment or customer record
   - Verify that the data is saved and can be retrieved

## Vercel Environment Verification

### Step 1: Deploy to Vercel

Make sure your changes are pushed to GitHub and deployed to Vercel:

```powershell
# Commit and push your changes
git add .
git commit -m "Update application with environment verification"
git push

# Deploy using the PowerShell script
./push-vercel-changes.ps1
```

### Step 2: Run the Verification Script

```powershell
# Set your Vercel URL as an environment variable
$env:VERCEL_URL = "https://your-app.vercel.app"

# Verify the Vercel environment
./verify-deployment.ps1 --vercel
```

### Step 3: Manual Verification

1. **Frontend**:
   - Open your browser and navigate to your Vercel URL
   - Verify that the application loads correctly
   - Check that the environment indicator shows "Production (Vercel)"
   - Verify that navigation works between different pages

2. **API**:
   - Test the API health endpoint: `https://your-app.vercel.app/api/health`
   - Test the Vercel-specific test endpoint: `https://your-app.vercel.app/api/test`
   - Test another endpoint: `https://your-app.vercel.app/api/services`

3. **Database**:
   - Create a new appointment or customer record
   - Verify that the data is saved and can be retrieved
   - Check that data created in the Vercel environment doesn't appear in your local environment (separate databases)

## Common Issues and Solutions

### Frontend Issues

| Issue | Possible Solution |
|-------|-------------------|
| White screen / blank page | Check browser console for JavaScript errors |
| CORS errors | Verify API URL configuration and CORS headers |
| Environment indicator shows wrong environment | Check URL and hostname detection logic |
| Unable to navigate between pages | Check React Router configuration |

### API Issues

| Issue | Possible Solution |
|-------|-------------------|
| API health endpoint returns 404 | Check Vercel rewrites in vercel.json |
| API returns 500 errors | Check server logs for detailed error messages |
| CORS errors | Verify CORS configuration in server.js |
| API functions locally but not in Vercel | Check serverless function configuration |

### Database Issues

| Issue | Possible Solution |
|-------|-------------------|
| Unable to connect to database | Verify DATABASE_URL in environment variables |
| Missing tables | Make sure migration script ran correctly |
| SSL/TLS errors | Check SSL configuration in database.js |
| Data not persisting | Verify database write permissions |

## Verification Tools

### Automated Verification

The application includes two verification tools:

1. **PowerShell Verification Script** (`verify-deployment.ps1`):
   - Tests API endpoints
   - Checks frontend accessibility
   - Provides summary of results

2. **In-App Environment Indicator** (`EnvironmentInfo` component):
   - Shows current environment (Development/Production)
   - Displays API and database connection status
   - Updates in real-time

### Manual Verification

Use these browser-based tools for additional manual verification:

1. **Browser Developer Tools**:
   - Network tab: Check API requests and responses
   - Console: Look for JavaScript errors
   - Application tab: Examine local storage and cookies

2. **API Testing**:
   - Use browser or tools like Postman to test API endpoints
   - Verify response formats and status codes

3. **Database Verification**:
   - For local: Use PostgreSQL tools to directly check database
   - For Vercel: Use Vercel Dashboard > Storage to examine database

## Conclusion

After completing these verification steps, you should have confidence that your application is working correctly in both local development and Vercel production environments. If you encounter any issues, refer to the [Common Issues and Solutions](#common-issues-and-solutions) section or the detailed troubleshooting guides in VERCEL_TROUBLESHOOTING.md.
