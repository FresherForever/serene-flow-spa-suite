// Root API handler for Vercel serverless functions
// This file handles requests to the /api endpoint

// Import your actual server implementation using dynamic import
// We'll need to use dynamic import since we're in an ES module
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serverHandler = require('../backend/src/server');

// Export handler for Vercel serverless function
export default function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Check if this is a health check request
  if (req.url === '/api' || req.url === '/api/') {
    return res.status(200).json({ 
      status: 'OK',
      message: 'API is running',
      environment: process.env.NODE_ENV || 'development'
    });
  }
  
  // Forward other requests to your backend handler
  try {
    return serverHandler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
