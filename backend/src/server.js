import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';

// Load environment variables
dotenv.config();

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
  const { sequelize } = await import('./config/database.js');
  
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

export default app;