/**
 * Local Development Server
 * This file is used ONLY for local development with `npm run dev`
 * Vercel will use the serverless functions in /api folder
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import serverless handlers
import generateStoryHandler from './api/generate-story.js';
import generateAudioHandler from './api/generate-audio.js';
import healthHandler from './api/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes - use the same handlers as Vercel
app.post('/api/generate-story', (req, res) => generateStoryHandler(req, res));
app.post('/api/generate-audio', (req, res) => generateAudioHandler(req, res));
app.get('/api/health', (req, res) => healthHandler(req, res));

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Story Generator Server running on http://localhost:${PORT}`);
  console.log(`📝 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🎙️  ElevenLabs API Key: ${process.env.ELEVENLABS_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`\n💡 Local development mode - using serverless handlers from /api\n`);
});
