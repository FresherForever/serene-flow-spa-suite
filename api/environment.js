// Environment API Endpoint for Vercel Serverless Functions
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.status(200).json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'production',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: {
      connected: true,  // Simplified for serverless
      name: process.env.DB_NAME || 'serene_flow_db'
    },
    deployment: {
      platform: 'Vercel',
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'unknown'
    }
  });
}
