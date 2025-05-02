const app = require('./server');
const { syncDatabase } = require('./models');

// Initialize database
const initApp = async () => {
  // Sync all models with database
  // Set force: true to drop tables and recreate them (development only)
  // In production, use force: false or implement migrations
  await syncDatabase(false);
};

// Start application
initApp()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch(err => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });