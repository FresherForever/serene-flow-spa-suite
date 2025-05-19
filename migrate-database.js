// This script runs database migrations during Vercel deployment
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('Error loading dotenv, continuing without it:', error.message);
}

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
console.log(`Running in Vercel environment: ${isVercel ? 'Yes' : 'No'}`);

try {
  console.log('Starting database migration...');
  
  // Check if running in Vercel production environment
  if (process.env.VERCEL_ENV === 'production') {
    console.log('Running in production mode');
    
    // Import models to create tables
    const { sequelize, models } = require('./backend/src/models');
    
    // Sync database (create tables if they don't exist)
    (async () => {
      try {
        // Force: false means it won't drop tables if they exist
        await sequelize.sync({ force: false });
        console.log('Database synchronized successfully');
        
        // Add any seed data here if needed
        console.log('Migration completed successfully');
      } catch (error) {
        console.error('Error synchronizing database:', error);
        process.exit(1);
      }
    })();
  } else {
    console.log('Not running in production - skipping migrations');
  }
} catch (error) {
  console.error('Migration script error:', error);
  process.exit(1);
}
