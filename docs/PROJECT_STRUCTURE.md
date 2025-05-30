# Project Restructuring Guide

This document outlines the changes made to organize the project structure and explains where to find key files after restructuring.

## Changes Made

1. **Created Logical Folder Structure**
   - `/scripts/` - Contains all scripts organized by purpose
   - `/config/` - Contains configuration files
   - `/docs/` - Contains all documentation

2. **Reorganized Scripts**
   - Database scripts → `/scripts/database/`
   - Deployment scripts → `/scripts/deployment/`
   - Verification scripts → `/scripts/verification/`
   - Utility scripts → `/scripts/utils/`

3. **Preserved References**
   - Kept Supabase SQL schema as reference in `/scripts/database/sql/`
   - Updated package.json scripts to point to new file locations

## Where to Find Key Files

### Database
- Migration scripts: `/scripts/database/migrate-database.js`
- SQL schema reference: `/scripts/database/sql/initial_schema_reference.sql`

### Deployment
- Vercel deployment: `/scripts/deployment/vercel-build.js` and `/scripts/deployment/deploy-to-vercel.ps1`
- Vercel migration: `/scripts/deployment/vercel-migrate.js`

### Development
- Start development: `start-dev.ps1` (root directory)
- Check servers: `/scripts/utils/check-servers.ps1`

### Documentation
- All documentation moved to `/docs/` folder

## Running Common Tasks

The package.json scripts have been updated to work with the new structure:

- `npm run dev` - Start frontend development server
- `npm run build` - Build the application for production
- `npm run migrate` - Run database migrations
- `npm run db:check` - Verify database connection
- `npm run start:full` - Start both frontend and backend servers
- `npm run deploy` - Deploy to Vercel

## Docker Configuration

Docker configuration files are now located in `/config/docker/`:
- `docker-compose.yml`
- `Dockerfile.frontend`

> **Note:** If you do not see the `/config/` folder, it has now been created and the Docker files have been moved there for consistency with this documentation.
