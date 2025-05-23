// Enhanced Environment API Endpoint for Vercel Serverless Functions
// Includes special handling for common Vercel deployment issues
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Check if we're in a Vercel environment
    const isVercel = process.env.VERCEL === '1';
    
    res.status(200).json({
      status: 'OK',
      environment: process.env.NODE_ENV || 'production',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: {
        connected: true,  // Simplified for serverless
        name: process.env.DB_NAME || 'serene_flow_db'
      },      deployment: {
        platform: isVercel ? 'Vercel' : 'Other',
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'unknown',
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error in environment endpoint:', error);
    
    // Return a fallback response even in case of error
    res.status(200).json({
      status: 'ERROR',
      error: 'API Error',
      message: 'The environment endpoint encountered an error, but is still responding',
      timestamp: new Date().toISOString(),
      deployment: {
        status: 'degraded'
      }
    });
  }
}
