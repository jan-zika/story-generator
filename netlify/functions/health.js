/**
 * Netlify Serverless Function: Health Check
 * 
 * Purpose: Verify API is running and environment is configured
 * Runtime: Netlify Functions (AWS Lambda)
 */

/**
 * Netlify serverless function handler
 * @param {Object} event - Netlify event object
 * @param {Object} context - Netlify context object
 * @returns {Object} Response with statusCode, headers, and body
 */
exports.handler = async (event, context) => {
  // Log runtime environment
  console.log('[health] Netlify function invoked');
  console.log('[health] Method:', event.httpMethod);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Return health status
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: 'ok',
      environment: 'netlify',
      timestamp: new Date().toISOString(),
      envVarsConfigured: {
        openai: !!process.env.OPENAI_API_KEY,
        elevenlabs: !!process.env.ELEVENLABS_API_KEY
      }
    })
  };
};
