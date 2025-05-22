const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Import routes
const appointmentRoutes = require('./routes/appointmentRoutes');
const customerRoutes = require('./routes/customerRoutes');
const staffRoutes = require('./routes/staffRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-frontend-url.com'] // Whitelist domains in production
    : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Production security (if needed)
if (process.env.NODE_ENV === 'production') {
  // Set secure headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
}

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Environment information route for verification tools
const environmentHandler = (req, res) => {
  res.status(200).json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      connected: global.dbConnected || false,
      name: process.env.DB_NAME || 'serene_flow_db'
    },
    deployment: {
      platform: process.env.VERCEL ? 'Vercel' : 'Local',
      region: process.env.VERCEL_REGION || 'local'
    }
  });
};

app.get('/api/environment', environmentHandler);
app.get('/environment', environmentHandler); // For Vercel serverless compatibility

// Database health check
app.get('/api/health/database', async (req, res) => {
  const { sequelize } = require('./config/database');
  
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'OK', 
      message: 'Database connection is healthy',
      connection: true
    });
  } catch (error) {
    res.status(200).json({ 
      status: 'WARNING', 
      message: 'Database connection failed: ' + error.message,
      connection: false
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Check if running as a standalone server or being imported
if (require.main === module) {
  // Start server when running directly
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Export a handler function for serverless environments
const handler = (req, res) => {
  // Remove any base path from the request URL
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  
  return app(req, res);
};

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express app for use in index.js
module.exports = app;