// migrate-database.cjs
// This script runs database migrations for the Serene Flow Spa Suite
const path = require('path');
const fs = require('fs');

// Load environment variables
try {
  require('dotenv').config();
} catch (error) {
  console.log('Error loading dotenv, continuing without it:', error.message);
}

console.log('Starting database migration...');

(async () => {
  try {
    // Import sequelize and models
    const { sequelize, models } = require('./backend/src/models');

    // Sync database (create tables if they do not exist)
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully');
    // Add any seed data here if needed
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
})();
