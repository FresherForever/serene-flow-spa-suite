// Database connection utility for Vercel deployment
// This script ensures the application correctly connects to either a local or Vercel PostgreSQL database

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting database connection setup...');

// Check if we're running in Vercel
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_URL;
console.log(`Running in Vercel environment: ${isVercel ? 'Yes' : 'No'}`);

const setupDatabaseConnection = () => {
  if (isVercel) {
    console.log('Configuring for Vercel deployment...');
    
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      console.error('ERROR: DATABASE_URL environment variable not found!');
      console.error('Please add the PostgreSQL connection string to your Vercel environment variables.');
      // Don't exit with error as this might be a staging environment
      console.log('Will attempt to continue without database configuration.');
      return;
    }
    
    console.log('Database URL found in environment variables');
    
    // For Vercel, we don't need to create an .env file as environment variables are injected directly
    console.log('Using Vercel environment variables for database connection');
  } else {
    // For local development
    console.log('Configuring for local development...');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.log('.env file not found, creating from .env.example...');
      
      // Check if .env.example exists
      const exampleEnvPath = path.join(__dirname, '.env.example');
      if (fs.existsSync(exampleEnvPath)) {
        // Copy .env.example to .env
        fs.copyFileSync(exampleEnvPath, envPath);
        console.log('.env file created successfully');
      } else {
        console.error('ERROR: .env.example file not found!');
        console.log('Creating basic .env file...');
        
        // Create a basic .env file
        const basicEnvContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=serene_flow_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
`;
        
        fs.writeFileSync(envPath, basicEnvContent);
        console.log('Basic .env file created successfully');
      }
    } else {
      console.log('.env file already exists');
    }
  }
  
  console.log('Database connection setup completed');
};

// Execute setup
setupDatabaseConnection();

export default setupDatabaseConnection;
