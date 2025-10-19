/**
 * Serverless Function: Health Check
 * 
 * Purpose: Verify API is running and environment is configured
 * Runtime: Vercel Serverless (production) | Express (local dev)
 */

/**
 * Serverless function for health check
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response
 */
export default async function handler(req, res) {
  // Log runtime environment
  const isVercel = process.env.VERCEL === '1';
  console.log(`[health] Running in: ${isVercel ? 'Vercel' : 'Local'}`);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({ 
    status: 'ok',
    environment: isVercel ? 'vercel' : 'local',
    timestamp: new Date().toISOString(),
    envVarsConfigured: {
      openai: !!process.env.OPENAI_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY
    }
  });
}
