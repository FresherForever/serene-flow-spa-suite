// This script runs database migrations during Vercel deployment
import 'dotenv/config';
import { syncDatabase, sequelize } from '../../backend/src/models/index.js';

const isVercel = process.env.VERCEL === '1';
console.log(`Running in Vercel environment: ${isVercel ? 'Yes' : 'No'}`);

(async () => {
  try {
    console.log('Starting database migration...');
    await syncDatabase(false); // force: false means do not drop tables
    console.log('Database synchronized successfully');
    // Add any seed data here if needed
    console.log('Migration completed successfully');
    await sequelize.close();
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
})();
