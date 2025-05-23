# Vercel Deployment Troubleshooting Guide

## Build Failures

### "vite: command not found" Error

If you encounter the error "sh: line 1: vite: command not found", try these solutions:

1. **Update your build command in vercel.json**:
   ```json
   {
     "buildCommand": "bash ./build.sh"
   }
   ```

2. **Ensure vite is installed locally**:
   - Make sure vite is in your dependencies (not just devDependencies)
   - Use `npx vite build` instead of `vite build` in your scripts

3. **Check your Node.js version**:
   - Vercel defaults to Node.js 18.x
   - If you need a different version, specify it in your settings or package.json

4. **Modify package.json**:
   - Use explicit paths to node_modules: 
   ```json
   {
     "scripts": {
       "build": "node ./node_modules/vite/bin/vite.js build"
     }
   }
   ```

### Database Migration Issues

If your database migration fails:

1. **Check environment variables**:
   - Ensure DATABASE_URL is properly set in your Vercel project
   - Verify format: `postgres://username:password@hostname:port/database`

2. **Simplify your migration**:
   - For initial deployment, use a simplified migration script
   - Add more complex migrations after successful deployment

3. **Check logs**:
   - Review Vercel build logs for specific error messages
   - Look for database connection issues or schema problems

### General Build Issues

1. **Clear Vercel cache**:
   - In your project settings, find the "Clear Cache" button
   - This can resolve issues with cached dependencies

2. **Use the Vercel CLI for local testing**:
   ```bash
   npm i -g vercel
   vercel login
   vercel build
   ```

3. **Check for conflicting or missing packages**:
   - Look for version conflicts in your dependencies
   - Ensure all required dependencies are included in package.json

## Deployment Steps After Fixing Build Issues

1. Push your changes to GitHub
2. Redeploy in the Vercel dashboard, or push a new commit to trigger automatic deployment
3. Monitor the build logs for any new issues
4. Test your deployed application thoroughly
