require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize ElevenLabs
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY
});
const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Sarah)

// Generate story endpoint
app.post('/api/generate-story', async (req, res) => {
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

    res.json({ story });
  } catch (error) {
    console.error('Error generating story:', error.message);
    res.status(500).json({ error: 'Failed to generate story: ' + error.message });
  }
});

// Generate audio endpoint
app.post('/api/generate-audio', async (req, res) => {
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
    res.json({ audio: audioBase64 });
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
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Story Generator Server running on http://localhost:${PORT}`);
  console.log(`📝 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🎙️  ElevenLabs API Key: ${process.env.ELEVENLABS_API_KEY ? '✓ Loaded' : '✗ Missing'}\n`);
});
