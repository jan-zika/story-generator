/**
 * Serverless Function: Generate Story
 * 
 * Purpose: Generate creative stories using OpenAI GPT-3.5
 * Runtime: Vercel Serverless (production) | Express (local dev)
 * 
 * Environment Variables Required:
 * - OPENAI_API_KEY: OpenAI API key
 */

import OpenAI from 'openai';

/**
 * Serverless function to generate a story using OpenAI
 * @param {Request} req - HTTP request
 * @param {Response} res - HTTP response
 */
export default async function handler(req, res) {
  // Log runtime environment
  const isVercel = process.env.VERCEL === '1';
  console.log(`[generate-story] Running in: ${isVercel ? 'Vercel' : 'Local'}`);
  
  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('[generate-story] ERROR: OPENAI_API_KEY is missing');
    return res.status(500).json({ 
      error: 'Server configuration error: OpenAI API key not configured',
      details: 'Please set OPENAI_API_KEY in Vercel environment variables'
    });
  }
  
  // Initialize OpenAI client inside handler
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: 'Story idea is required' });
    }

    console.log('Generating story for idea:', idea);

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
    console.log('Story generated successfully');

    res.status(200).json({ story });
  } catch (error) {
    console.error('Error generating story:', error.message);
    res.status(500).json({ error: 'Failed to generate story: ' + error.message });
  }
}
