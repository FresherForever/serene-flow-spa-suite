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

1. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up with your GitHub account

2. **Import your project**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect your React/Vite configuration

3. **Configure environment variables**
   - Add the following environment variable:
     - `VITE_API_URL`: URL of your deployed backend API (e.g., `https://your-backend.onrender.com/api`)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

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

### Option 1: Supabase (Recommended)

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

### Option 2: DigitalOcean Managed Database

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

If you encounter issues during deployment:

1. **Check logs** on the respective platform
2. **Verify environment variables** are correctly set
3. **Ensure database connection** is working properly
4. **Check CORS settings** if frontend can't communicate with backend

For specific error troubleshooting, consult the documentation of the respective platform.