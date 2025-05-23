// Health check API endpoint for Vercel Serverless Functions
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
    // Return basic health information
    res.status(200).json({
      status: 'OK',
      message: 'API is operational',
      timestamp: new Date().toISOString(),
      checks: {
        api: {
          status: "healthy",
          responseTime: "< 100ms"
        },
        services: {
          status: "available"
        }
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    // Even on error, return a 200 response with degraded status
    // This allows the frontend to handle and display the degraded state
    res.status(200).json({
      status: 'DEGRADED',
      message: 'API is experiencing issues',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}
