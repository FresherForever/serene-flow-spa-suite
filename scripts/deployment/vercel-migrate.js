// Vercel-specific migration script
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('Error loading dotenv, continuing without it:', error.message);
}

console.log('Starting Vercel database migration...');

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
const vercelEnv = process.env.VERCEL_ENV || 'development';
console.log(`Running in Vercel environment: ${isVercel ? 'Yes' : 'No'} (${vercelEnv})`);

try {
  // Import models to create tables - adjust path as needed for production structure
  const { sequelize, models } = require('../backend/src/models');
  
  // Sync database (create tables if they don't exist)
  (async () => {
    try {
      // Force: false means it won't drop tables if they exist
      await sequelize.sync({ force: false });
      console.log('Database synchronized successfully on Vercel');
      
      // Add any production-specific seed data here if needed
      console.log('Vercel migration completed successfully');
    } catch (error) {
      console.error('Error synchronizing database on Vercel:', error);
      process.exit(1);
    }
  })();
} catch (error) {
  console.error('Vercel migration script error:', error);
  process.exit(1);
}
