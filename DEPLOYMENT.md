# Serene Flow Spa Suite - Deployment Guide

This document provides comprehensive instructions for deploying Serene Flow Spa Suite to Vercel and troubleshooting common issues.

## Deployment Options

### Option 1: Automated Deployment (Recommended)

The easiest way to deploy is using our automated deployment script:

```powershell
npm run deploy
```

This script will:
1. Check for uncommitted changes
2. Test the build process locally
3. Verify the build output
4. Deploy to Vercel
5. Verify the deployed application

### Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

1. Build the application for production:
   ```
   npm run build:vercel
   ```

2. Verify the build locally:
   ```
   npm run verify:local
   ```

3. Deploy to Vercel:
   ```
   vercel --prod
   ```
   
4. Verify the deployed application:
   ```
   npm run verify:deployed
   ```

## Vercel Configuration

The application is configured to work with Vercel's serverless functions. Key configuration files:

- `vercel.json`: Defines build settings, routes and environment variables
- `scripts/deployment/vercel-build.js`: Custom build script optimized for Vercel
- `api/*.js`: Serverless function handlers

## Environment Variables

Ensure the following environment variables are set in your Vercel project:

| Variable | Description | Required |
|----------|-------------|----------|
| NODE_ENV | Environment (production, development) | Yes |
| DB_NAME | Database name | Yes |
| DB_USER | Database user | Yes |
| DB_PASSWORD | Database password | Yes |
| DB_HOST | Database host | Yes |
| FRONTEND_URL | URL of the frontend application | No |

## Fallback Page

If the build fails for any reason, a fallback page will be automatically generated that:

1. Matches the look and feel of the actual application
2. Shows deployment error information
3. Tests API connectivity
4. Provides environment information

## Troubleshooting

### API Endpoint Issues

If API endpoints are not working:

1. Check both `/api/environment` and `/environment` endpoints
2. Verify CORS settings in `vercel.json` and API handlers
3. Check server logs for any errors

### Build Failures

If the build fails:

1. Try running `npm run build:vercel` locally to reproduce the issue
2. Check for any dependencies that might be causing problems
3. Use the minimal build configuration as a fallback: `vite.minimal.config.js`

### Verification Issues

If verification fails:

1. Run `npm run verify:deployed --verbose` to see detailed error messages
2. Check browser console for any frontend errors
3. Verify all environment variables are set correctly

## Support

For additional help:
- Check the `VERCEL_TROUBLESHOOTING_UPDATED.md` file
- Review the `VERIFICATION_GUIDE.md` for testing procedures
- Contact the development team