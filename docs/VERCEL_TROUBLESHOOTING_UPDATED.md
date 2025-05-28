# Vercel Deployment Troubleshooting Guide

This guide covers common issues you might encounter when deploying the Serene Flow Spa Suite application on Vercel, along with their solutions.

## Build Failures

### 1. "vite: command not found" Error

If you encounter the error "sh: line 1: vite: command not found":

**Solution:**
- Move `vite` from devDependencies to dependencies in package.json
- Use our custom build script that handles this issue:
  ```bash
  npm run build
  ```

### 2. Module Import/Require Errors

If you see errors related to ES modules vs CommonJS modules:

**Solution:**
- Our application uses a mixed module approach. The API handler in `api/index.js` includes a compatibility layer using `createRequire`.
- Double-check ES module syntax in any new files.
- For any new server files, ensure they export proper handler functions.

### 3. Database Connection Errors

If the build succeeds but the application can't connect to the database:

**Solution:**
- Verify `DATABASE_URL` is set correctly in Vercel environment variables
- Check that your database accepts connections from Vercel's IP ranges
- Ensure SSL settings match our configuration in `database.js`:
  ```javascript
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
  ```

### 4. API Routes Not Found

If the API endpoints return 404 errors:

**Solution:**
- Ensure the `vercel.json` rewrites are configured properly:
  ```json
  "rewrites": [
    { "source": "/api/health", "destination": "/api" },
    { "source": "/api/(.*)", "destination": "/api/[...catchAll]" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
  ```
- Test the /api/test endpoint which provides environment information
- Check that the API directory is properly structured

### 5. Missing or Empty Build Output

If Vercel complains about missing build output:

**Solution:**
- Our `build.js` script ensures a fallback `index.html` is always created
- Check build logs for any errors during the Vite build process
- If Vite is failing, try deploying just the test HTML temporarily:
  ```bash
  # Comment out the Vite build in build.js and use the test HTML deployment
  ```

## Runtime Errors

### 1. CORS Issues

If API calls from the frontend receive CORS errors:

**Solution:**
- Our API handlers include CORS headers by default
- Ensure your `FRONTEND_URL` environment variable is set correctly
- For custom domains, update the CORS configuration in `server.js`

### 2. Database Migration Failures

If the database migration fails:

**Solution:**
- Check the logs for specific SQL errors
- Try running the migration manually:
  ```bash
  node vercel-migrate.js
  ```
- If tables exist but need updating, modify the migration script to use `{alter: true}` instead of `{force: true}`

### 3. JWT Authentication Errors

If login/authentication fails:

**Solution:**
- Ensure `JWT_SECRET` is set in your Vercel environment variables
- Verify that frontend requests are including the JWT token correctly
- Check for token expiration issues (default is 24h)

## Deployment Debugging

### 1. Checking Logs

To view detailed logs:

1. Go to your project in the Vercel dashboard
2. Navigate to the "Deployments" tab
3. Select the deployment you want to inspect
4. Click "Functions" to see serverless function logs
5. Click "Build Logs" to see build-time issues

### 2. Testing API Endpoints

To test if your API is working:

1. Use the `/api/test` endpoint: `https://your-app.vercel.app/api/test`
2. Check the health endpoint: `https://your-app.vercel.app/api/health` 
3. Test specific endpoints with appropriate authentication

### 3. Preview Deployments

Use Vercel's preview deployments to test changes before pushing to production:

1. Create a new branch in your repository
2. Push changes to this branch
3. Vercel will automatically create a preview deployment
4. Test your changes in this isolated environment
5. When satisfied, merge to your main branch

## Getting Help

If you're still experiencing issues:

1. Check Vercel's official documentation: https://vercel.com/docs
2. Review our project-specific notes in `DEPLOYMENT.md`
3. Reach out to the development team for support
