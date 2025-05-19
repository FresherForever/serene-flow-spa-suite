# Serene Flow Spa Suite - Deployment Guide

This guide provides comprehensive instructions for deploying the Serene Flow Spa Suite application to Vercel with PostgreSQL integration.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient for testing)
- Git installed on your local machine

## Deployment Process

### Step 1: Push Your Code to GitHub

1. **Create a GitHub repository** (if you don't have one already)

2. **Initialize Git and push your code**:

```powershell
# Navigate to your project directory
cd c:\Workspace\Spa\serene-flow-spa-suite

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for Vercel deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/serene-flow-spa-suite.git

# Push to GitHub
git push -u origin main
```

### Step 2: Set Up Vercel Project

1. **Sign up for Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up with your GitHub account

2. **Import your project**:
   - Click "Add New..." > "Project"
   - Select your GitHub repository
   - Vercel will automatically detect it as a Vite project

3. **Configure project settings**:
   - **Framework Preset**: Select "Vite"
   - **Root Directory**: Leave as `.` (dot)
   - **Build Command**: Use `npm run build` (uses our custom build script)
   - **Output Directory**: `dist`

### Step 3: Set Up PostgreSQL Database

1. **Create a PostgreSQL database**:
   - After initial deployment, go to the "Storage" tab
   - Click "Create" and select "Postgres"
   - Configure your database:
     - Name: `serene-flow-db`
     - Region: Choose the closest to your users
     - Add to Project: Select your project
     - Environment: Select all environments

2. **Connect database to your project**:
   - After creating the database, you'll get a `DATABASE_URL`
   - Go to your project's "Settings" > "Environment Variables"
   - Add the following environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string (from the previous step)
     - `NODE_ENV`: `production`
     - `FRONTEND_URL`: Your deployment URL (e.g., `https://your-app.vercel.app`)
     - `JWT_SECRET`: Generate a secure random string using the command below
     - `JWT_EXPIRES_IN`: `24h`

   ```powershell
   # PowerShell command to generate secure JWT_SECRET
   [System.Convert]::ToBase64String((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))
   ```

### Step 4: Deploy Your Application

1. **Trigger a deployment**:
   - After setting up the environment variables, go to the "Deployments" tab
   - Click "Redeploy" on your latest deployment
   - This will rebuild your application with the correct environment variables

2. **Verify the deployment**:
   - Once deployment is complete, click on the provided URL
   - You should see your application running
   - Test the API endpoints by navigating to `/api/health`

### Step 5: Database Migration and Seeding

The deployment process includes automatic database migration and seeding through our `vercel-migrate.js` script, which:

1. Creates necessary tables based on Sequelize models
2. Seeds initial data (services and staff) if the database is empty

You can verify the migration was successful by checking:
- The deployment logs for "Database synchronized successfully" message
- Your application's functionality that relies on database access

### Troubleshooting

If you encounter any issues during deployment, check the following:

1. **Build failures**:
   - Check the build logs for specific errors
   - Ensure all dependencies are correctly installed
   - Make sure the database connection is properly configured

2. **API errors**:
   - Test the API endpoint directly: `https://your-app.vercel.app/api/health`
   - Check Vercel logs for any server-side errors
   - Make sure environment variables are set correctly

3. **Database connection issues**:
   - Verify the `DATABASE_URL` is set correctly
   - Ensure PostgreSQL SSL settings are properly configured
   - Check if IP restrictions are preventing connections

For more detailed troubleshooting information, see the `VERCEL_TROUBLESHOOTING.md` file.

## Production Considerations

For a production deployment, consider the following additional steps:

1. **Custom domain setup**:
   - In Vercel, go to "Settings" > "Domains"
   - Add your custom domain and follow the verification process

2. **Security enhancements**:
   - Set up rate limiting for API endpoints
   - Configure proper CORS settings for your production domain
   - Regularly rotate the JWT_SECRET

3. **Monitoring and analytics**:
   - Set up Vercel Analytics to monitor performance
   - Add error tracking (e.g., Sentry) to catch and report issues

4. **CI/CD pipeline**:
   - Set up GitHub Actions for automated testing before deployment
   - Configure branch previews for testing changes before merging

## Regular Maintenance

To keep your deployment running smoothly:

1. **Database backups**:
   - Set up regular backups of your PostgreSQL database
   - Test restoration procedures occasionally

2. **Dependency updates**:
   - Regularly check for and apply updates to dependencies
   - Test thoroughly after updating critical packages

3. **Performance optimization**:
   - Monitor API response times and optimize slow endpoints
   - Use Vercel's Edge functions for performance-critical routes
