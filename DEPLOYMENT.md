# Deployment Guide

This guide provides step-by-step instructions for deploying the Serene Flow Spa Suite application to various hosting platforms.

## Prerequisites

- GitHub account
- Access to your domain registrar (if using a custom domain)
- Database credentials (for a PostgreSQL instance)

## Deployment Options

Choose the deployment option that best fits your needs:

- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Database Deployment](#database-deployment)

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Full-Stack Deployment with Vercel PostgreSQL

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up with your GitHub account

2. **Import your project**
   - Click "Add New..." > "Project"
   - Import your GitHub repository
   - Vercel will automatically detect your React/Vite configuration

3. **Configure project settings**
   - **Framework Preset**: Select "Vite"
   - **Root Directory**: Leave as `.` (dot)
   - **Build Command**: Use `npm run vercel-build` (this includes database migration)
   - **Output Directory**: `dist`

4. **Configure environment variables**
   - Add the following environment variables:
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: Generate a secure random string (use PowerShell command below)
     - `JWT_EXPIRES_IN`: `24h`

   ```powershell
   # PowerShell command to generate secure JWT_SECRET
   [System.Convert]::ToBase64String((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))
   ```

5. **Deploy your project** (it may fail without a database, which is expected)
   - Click "Deploy"

6. **Create PostgreSQL database**
   - After initial deployment, go to the "Storage" tab
   - Click "Create" and select "Postgres"
   - Configure your database:
     - Name: `serene-flow-spa-db`
     - Region: Choose the closest to your users
     - Add to Project: Select your project
     - Environment: Select all environments

7. **Get database connection string**
   - After database creation, find the connection details
   - Copy the connection string provided by Vercel

8. **Add database environment variable**
   - Go to your project settings > Environment Variables
   - Add a new variable:
     - Name: `DATABASE_URL`
     - Value: Paste the connection string
     - Environment: Select all environments

9. **Redeploy your application**
   - Go to the "Deployments" tab
   - Click "Redeploy" on your latest deployment

10. **Verify deployment**
   - Once deployment completes, click the generated URL
   - Test all functionality in your application

### Option 2: Netlify

1. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com) and sign up with your GitHub account

2. **Import your project**
   - Click "New site from Git"
   - Connect to your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Configure environment variables**
   - Go to Site settings > Build & deploy > Environment
   - Add the same environment variables as in the Vercel option

## Backend Deployment

### Option 1: Render (Recommended)

1. **Sign up for Render**
   - Go to [render.com](https://render.com) and sign up

2. **Create a new Web Service**
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy

3. **Configure your service**
   - Set a name for your service (e.g., `serene-flow-backend`)
   - Set the Root Directory to `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Configure environment variables**
   - Add all the environment variables from `.env.production.example`
   - Make sure to update them with your actual production values
   - Set `NODE_ENV` to `production`
   - Set `FRONTEND_URL` to your deployed frontend URL

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your backend

### Option 2: Heroku

1. **Sign up for Heroku**
   - Go to [heroku.com](https://heroku.com) and sign up

2. **Install Heroku CLI**
   - Download and install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

3. **Create a new app**
   ```bash
   cd backend
   heroku login
   heroku create serene-flow-backend
   ```

4. **Configure environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-url.com
   # Set all other variables from .env.production.example
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

## Database Deployment

### Option 1: Vercel PostgreSQL (Recommended)

1. **Create Vercel PostgreSQL database**
   - In your Vercel dashboard, go to the "Storage" tab
   - Click "Create" and select "Postgres"
   - Configure your database:
     - Name: `serene-flow-spa-db`
     - Region: Choose the region closest to your users
     - Add to Project: Select your project
     - Environment: Select which environments to connect (Production, Preview, Development)

2. **Get connection information**
   - After database creation, click on your new database
   - Find the "Connect" tab with connection details
   - Copy the connection string that looks like:
     ```
     postgres://default:password@endpoint:port/verceldb
     ```

3. **Configure environment variables**
   - Go to your Vercel project settings > Environment Variables
   - Add `DATABASE_URL` with the connection string
   - This will automatically be used by the backend code

4. **Migrations and schema setup**
   - The updated `migrate-database.js` script will automatically:
     - Connect to the database
     - Create tables based on your Sequelize models
     - Run when the project is built using the `vercel-build` command

5. **Database management**
   - Use the Vercel dashboard to:
     - Monitor database usage
     - View query insights
     - Manage backups
     - Reset your database if needed during development

### Option 2: Supabase

1. **Sign up for Supabase**
   - Go to [supabase.com](https://supabase.com) and sign up

2. **Create a new project**
   - Create a new project with a name (e.g., `serene-flow`)
   - Set a secure password
   - Select a region close to your users

3. **Get connection information**
   - Go to Settings > Database
   - Copy the connection string
   - Extract the required parameters for your backend:
     - Host
     - Database name
     - User
     - Password
     - Port

4. **Setup database tables**
   - You can either:
     - Use the SQL Editor to run the migrations
     - Let Sequelize sync your models (using first backend deployment)

### Option 3: DigitalOcean Managed Database

1. **Sign up for DigitalOcean**
   - Go to [digitalocean.com](https://digitalocean.com) and sign up

2. **Create a new database cluster**
   - Go to Databases > Create Cluster
   - Select PostgreSQL
   - Choose a plan ($15/month is the minimum)
   - Select a region

3. **Configure database**
   - Create a new database named `serene_flow_db`
   - Get connection details and update your backend environment variables

## Setting Up a Custom Domain

### For Vercel/Netlify (Frontend)

1. **Add domain in Vercel/Netlify**
   - Go to your project's domains settings
   - Add your custom domain

2. **Configure DNS**
   - Go to your domain registrar
   - Add the DNS records provided by Vercel/Netlify

### For Render/Heroku (Backend)

1. **Add domain in Render/Heroku**
   - Go to your service's settings
   - Add your custom domain (e.g., `api.yourdomain.com`)

2. **Configure DNS**
   - Add the required DNS records at your domain registrar

## Continuous Deployment

All the platforms mentioned above support continuous deployment from GitHub. Once set up, your application will automatically redeploy whenever you push changes to your repository.

## Troubleshooting

### General Issues

If you encounter issues during deployment:

1. **Check logs** on the respective platform
2. **Verify environment variables** are correctly set
3. **Ensure database connection** is working properly
4. **Check CORS settings** if frontend can't communicate with backend

### Vercel-Specific Troubleshooting

#### Database Connection Issues

If you see database connection errors:

1. **Check DATABASE_URL environment variable**
   - Ensure it's correctly set in your Vercel project settings
   - Verify it's being applied to the correct environments (Production, Preview, Development)

2. **SSL Connection Issues**
   - Vercel PostgreSQL requires SSL. Make sure your database configuration includes:
   ```javascript
   dialectOptions: {
     ssl: {
       require: true,
       rejectUnauthorized: false
     }
   }
   ```

3. **Connection Timeout**
   - If connections time out during serverless cold starts:
   - Ensure your connection pooling is properly configured
   - Consider using connection pooling services like PgBouncer

#### Build Failures

1. **Migration Failures**
   - Check the build logs for database migration errors
   - Verify that `migrate-database.js` is executing correctly
   - Try running migrations manually via Vercel CLI

2. **Environment Variable Issues**
   - Ensure all required environment variables are set
   - Check for typos in variable names
   - Verify that variables are set for the correct deployment environment

#### API Route Issues

1. **404 Errors on API Routes**
   - Check your `vercel.json` configuration
   - Ensure rewrites are correctly configured for API paths
   - Verify the backend server is properly handling the routes

2. **Serverless Function Size Limits**
   - If you hit the 50MB limit for serverless functions:
   - Consider splitting your backend into multiple smaller functions
   - Remove unnecessary dependencies
   - Use dynamic imports where possible

For specific error troubleshooting, consult the [Vercel documentation](https://vercel.com/docs) or [Vercel Support](https://vercel.com/help).