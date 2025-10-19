/**
 * Serverless Function: Generate Audio
 * 
 * Purpose: Convert text to speech using ElevenLabs
 * Runtime: Vercel Serverless (production) | Express (local dev)
 * 
 * Environment Variables Required:
 * - ELEVENLABS_API_KEY: ElevenLabs API key
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Sarah)

/**
 * Serverless function to generate audio using ElevenLabs
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response
 */
export default async function handler(req, res) {
  // Log runtime environment
  const isVercel = process.env.VERCEL === '1';
  console.log(`[generate-audio] Running in: ${isVercel ? 'Vercel' : 'Local'}`);
  
  // Validate environment variables
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('[generate-audio] ERROR: ELEVENLABS_API_KEY is missing');
    return res.status(500).json({ 
      error: 'Server configuration error: ElevenLabs API key not configured',
      details: 'Please set ELEVENLABS_API_KEY in Vercel environment variables',
      errorType: 'configuration'
    });
  }
  
  // Initialize ElevenLabs client inside handler
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY
  });
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ 
        error: 'Text is required',
        errorType: 'validation'
      });
    }

    console.log('Generating audio for text length:', text.length);
    console.log('ElevenLabs API Key present:', !!process.env.ELEVENLABS_API_KEY);

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
    console.log('Audio generated successfully, size:', audioBuffer.length);

    // Send audio as base64
    const audioBase64 = audioBuffer.toString('base64');
    res.status(200).json({ audio: audioBase64 });
  } catch (error) {
    console.error('Error generating audio:', error.message);
    
    // Parse error details from ElevenLabs API
    let errorType = 'network';
    let errorMessage = 'Failed to generate audio';
    let statusCode = 500;

    if (error.body) {
      console.error('Error body:', JSON.stringify(error.body));
      
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

    res.status(statusCode).json({ 
      error: errorMessage,
      errorType: errorType,
      details: error.message
    });
  }
}
