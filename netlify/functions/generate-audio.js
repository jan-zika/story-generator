/**
 * Netlify Serverless Function: Generate Audio
 * 
 * Purpose: Convert text to speech using ElevenLabs
 * Runtime: Netlify Functions (AWS Lambda)
 * 
 * Environment Variables Required:
 * - ELEVENLABS_API_KEY: ElevenLabs API key
 */

const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Sarah)

/**
 * Netlify serverless function handler
 * @param {Object} event - Netlify event object
 * @param {Object} context - Netlify context object
 * @returns {Object} Response with statusCode, headers, and body
 */
exports.handler = async (event, context) => {
  // Log runtime environment
  console.log('[generate-audio] Netlify function invoked');
  console.log('[generate-audio] Method:', event.httpMethod);
  
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
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('[generate-audio] ERROR: ELEVENLABS_API_KEY is missing');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server configuration error: ElevenLabs API key not configured',
        details: 'Please set ELEVENLABS_API_KEY in Netlify environment variables',
        errorType: 'configuration'
      })
    };
  }

  try {
    // Parse request body
    const { text } = JSON.parse(event.body || '{}');

    if (!text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Text is required',
          errorType: 'validation'
        })
      };
    }

    console.log('[generate-audio] Generating audio for text length:', text.length);
    console.log('[generate-audio] ElevenLabs API Key present:', !!process.env.ELEVENLABS_API_KEY);

    // Initialize ElevenLabs client
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Generate audio using ElevenLabs SDK
    const audio = await elevenlabs.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    });

    // Collect audio chunks
    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    console.log('[generate-audio] Audio generated successfully, size:', audioBuffer.length);

    // Send audio as base64
    const audioBase64 = audioBuffer.toString('base64');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ audio: audioBase64 })
    };
  } catch (error) {
    console.error('[generate-audio] Error:', error.message);
    
    // Parse error details from ElevenLabs API
    let errorType = 'network';
    let errorMessage = 'Failed to generate audio';
    let statusCode = 500;

    if (error.body) {
      console.error('[generate-audio] Error body:', JSON.stringify(error.body));
      
      // Check for quota exceeded error
      if (error.body.detail) {
        const detail = error.body.detail;
        
        if (detail.status === 'quota_exceeded' || 
            detail.message?.toLowerCase().includes('quota') ||
            detail.message?.toLowerCase().includes('credit') ||
            detail.message?.toLowerCase().includes('token')) {
          errorType = 'quota_exceeded';
          errorMessage = 'Voice generation temporarily unavailable: you\'ve exceeded your token or credit limit.';
          statusCode = 429; // Too Many Requests
        } else {
          errorMessage = detail.message || errorMessage;
        }
      }
    }

    // Check for authentication errors
    if (error.statusCode === 401 || error.message?.includes('401')) {
      errorType = 'auth_error';
      errorMessage = 'Authentication failed. Please check your API key.';
      statusCode = 401;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        errorType: errorType,
        details: error.message
      })
    };
  }
};
