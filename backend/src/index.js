const app = require('./server');
const { syncDatabase } = require('./models');
const { initDatabase } = require('./config/database');

// Initialize database
const initApp = async () => {
  try {
    console.log('Initializing database...');
    // Initialize database connection
    await initDatabase();
    
    // Sync all models with database
    // Set force: true to drop tables and recreate them (development only)
    // In production, use force: false or implement migrations
    await syncDatabase(false);
    
    return true;
  } catch (error) {
    console.error('Error initializing application:', error);
    console.log('Application will continue with limited functionality.');
    return false;
  }
};

// Start application with improved error handling
const startServer = () => {
  try {
    // Get port from server configuration
    const PORT = process.env.PORT || 5000;
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`API health check: http://localhost:${PORT}/api/health`);
      console.log(`API environment: http://localhost:${PORT}/api/environment`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Initialize app with better error handling
try {
  initApp()
    .then((dbInitialized) => {
      if (dbInitialized) {
        console.log('✅ Database initialized successfully');
      } else {
        console.log('⚠️ Database initialization failed, continuing with limited functionality');
      }
      
      // Start the server regardless of database state
      startServer();
    })
    .catch(err => {
      console.error('⚠️ Database initialization error:', err.message);
      console.log('Continuing with limited functionality...');
      
      // Start server even if database initialization fails
      startServer();
    });
} catch (err) {
  console.error('Critical application error:', err);
  console.log('Attempting to start server with minimal functionality...');
  
  // Last resort - try to start the server anyway
  startServer();
}