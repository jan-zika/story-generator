/**
 * Netlify Serverless Function: Generate Story
 * 
 * Purpose: Generate creative stories using OpenAI GPT-3.5
 * Runtime: Netlify Functions (AWS Lambda)
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: OpenAI API key
 */

const OpenAI = require('openai');

/**
 * Netlify serverless function handler
 * @param {Object} event - Netlify event object
 * @param {Object} context - Netlify context object
 * @returns {Object} Response with statusCode, headers, and body
 */
exports.handler = async (event, context) => {
  // Log runtime environment
  console.log('[generate-story] Netlify function invoked');
  console.log('[generate-story] Method:', event.httpMethod);
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('[generate-story] ERROR: OPENAI_API_KEY is missing');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error: OpenAI API key not configured',
        details: 'Please set OPENAI_API_KEY in Netlify environment variables'
      })
    };
  }

  try {
    // Parse request body
    const { idea } = JSON.parse(event.body || '{}');

    if (!idea) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Story idea is required' })
      };
    }

    console.log('[generate-story] Generating story for idea:', idea);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Generate story
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a creative storyteller. Write engaging short stories (200-300 words) based on the user\'s idea. Make them vivid, entertaining, and complete with a beginning, middle, and end.'
        },
        {
          role: 'user',
          content: `Write a short story based on this idea: ${idea}`
        }
      ],
      max_tokens: 500,
      temperature: 0.8
    });

    const story = completion.choices[0].message.content;
    console.log('[generate-story] Story generated successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ story })
    };
  } catch (error) {
    console.error('[generate-story] Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate story: ' + error.message
      })
    };
  }
};
