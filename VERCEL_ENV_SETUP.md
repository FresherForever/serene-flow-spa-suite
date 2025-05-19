# Setting Up Vercel Environment Variables

This guide explains how to set up the required environment variables for deploying your Serene Flow Spa Suite application to Vercel.

## DATABASE_URL

The `DATABASE_URL` variable is used to connect to your PostgreSQL database. You can set this up in two ways:

### Option 1: Using Vercel Postgres (Recommended)

1. In your Vercel dashboard, go to the "Storage" tab
2. Click "Create" and select "Postgres"
3. Name your database (e.g., "serene-flow-spa-db")
4. Choose a region closest to your target users
5. Once created, go to the "Configuration" tab of your Postgres database
6. Copy the `.env.local` connection string
7. This will look something like:
   ```
   postgres://default:password@endpoint:port/verceldb
   ```

### Option 2: Using Your Own PostgreSQL Instance

If you're using an external PostgreSQL provider like AWS RDS, DigitalOcean, Railway, etc.:

1. Format your connection string in this format:
   ```
   postgresql://username:password@hostname:5432/database_name
   ```

2. Replace:
   - `username`: Your database username
   - `password`: Your database password
   - `hostname`: Your database host address
   - `database_name`: Your database name

3. Make sure your database server allows connections from Vercel's IP ranges

## AUTH_SECRET

The `AUTH_SECRET` is a secure random string used for authentication and session management.

### Generating a Secure AUTH_SECRET

1. Open your terminal and run this command to generate a secure random string:
   ```bash
   openssl rand -base64 32
   ```

2. Copy the output string - this will be your `AUTH_SECRET`

3. Example output:
   ```
   3EK6FD+o0+c7tzBNVfjpMkNDi2yARAAKzQlk8O2IKoxQu4nF7EdAh8s3TwpHwrdWT6R
   ```

## Setting Environment Variables in Vercel

1. In your Vercel project dashboard, click on "Settings"
2. Select "Environment Variables"
3. Add these variables:
   - Name: `DATABASE_URL` - Value: your connection string
   - Name: `AUTH_SECRET` - Value: your generated secret
   - Name: `NODE_ENV` - Value: `production`
   - Name: `JWT_SECRET` - Value: same as your AUTH_SECRET or another secure value
   - Name: `JWT_EXPIRES_IN` - Value: `24h`

4. Choose which environments these apply to (Production, Preview, Development)
5. Click "Save"

## Testing Your Configuration

After deployment, verify your setup by:

1. Checking Vercel deployment logs for any database connection errors
2. Testing API endpoints to confirm database connectivity
3. Ensuring authentication flows work properly

If you encounter issues, check your PostgreSQL server logs and Vercel function logs for error details.
