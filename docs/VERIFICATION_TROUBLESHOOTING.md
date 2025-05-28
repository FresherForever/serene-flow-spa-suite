# Verification Troubleshooting Guide

This document provides solutions for common verification failures when deploying the Serene Flow Spa Suite application to Vercel.

## Common Verification Issues

### 1. Missing Dependencies Error

**Error Message:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'X' imported from ...
```

**Solution:**
```bash
# Install all verification dependencies at once
npm run setup:verify

# Or install individual dependencies
npm install dotenv node-fetch chalk
```

### 2. API Endpoint Failures

**Error Message:**
```
❌ API Environment: Failed with status 404
```

**Solution:**

1. Check that both API paths are properly configured:
   - `/api/environment`
   - `/environment`

2. Verify the server.js has both routes:
   ```javascript
   app.get('/api/environment', environmentHandler);
   app.get('/environment', environmentHandler); // For Vercel compatibility
   ```

3. Make sure the API handler is properly exported in `api/[...catchAll].js`

### 3. Frontend Verification Failures

**Error Message:**
```
❌ Main HTML page: Failed with status 404
```

**Solution:**

1. Ensure your Vercel configuration has the correct output directory:
   ```json
   {
     "outputDirectory": "dist",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

2. Check that the build process completed successfully by examining `dist/index.html`

### 4. Health Endpoint Issues

**Error Message:**
```
❌ API Health: Failed with status 404
```

**Solution:**

1. Verify the health endpoint exists in your server.js:
   ```javascript
   app.get('/api/health', (req, res) => {
     res.status(200).json({ status: 'OK', message: 'Server is running' });
   });
   ```

2. Check Vercel routing configuration:
   ```json
   {
     "rewrites": [
       { "source": "/api/health", "destination": "/api" }
     ]
   }
   ```

## Running Verification

### Local Verification

Test your application locally:

```bash
# Start your development server first
npm run dev

# In another terminal
npm run verify:local
```

### Deployment Verification

Verify a deployed version:

```bash
# Verify latest Vercel deployment
npm run verify:deployed

# With verbose output
npm run verify:deployed -- --verbose

# Specify a custom URL
npm run verify:deployed -- --url=https://your-custom-url.vercel.app
```

## Fixing API Endpoint Issues

If you're experiencing issues with API endpoints, make sure:

1. Your server is properly exporting a handler function:
   ```javascript
   export default function handler(req, res) {
     // Your handler code
   }
   ```

2. The API routes are properly configured in `vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/[...catchAll]" }
     ]
   }
   ```

3. The CORS headers are correctly set for Vercel environment

## Complete Reset

If all else fails, try a clean reinstall:

```bash
# Remove dependencies and reinstall
rm -rf node_modules
npm install

# Install verification dependencies
npm run setup:verify

# Try verification again
npm run verify:local
```

## Getting Help

If you continue experiencing issues, check the detailed logs in your Vercel dashboard or contact the development team.
