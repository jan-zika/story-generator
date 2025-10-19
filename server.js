/**
 * Local Development Server
 * 
 * ⚠️  IMPORTANT: This file is ONLY for local development
 * 
 * Purpose: Provides Express server for local testing
 * Usage: npm run dev
 * 
 * Vercel Deployment:
 * - Vercel IGNORES this file (see .vercelignore)
 * - Vercel uses /api serverless functions directly
 * - This ensures environment variables work correctly in production
 * 
 * How it works:
 * - Imports the same handler functions from /api
 * - Attaches them to Express routes
 * - Allows testing at http://localhost:3001/api/...
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
  console.log(`\n🚀 Story Generator - Local Development Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📝 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`🎙️  ElevenLabs API Key: ${process.env.ELEVENLABS_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`💡 Mode: LOCAL DEVELOPMENT`);
  console.log(`📦 Using serverless handlers from /api`);
  console.log(`⚠️  Note: Vercel ignores this file in production\n`);
});
