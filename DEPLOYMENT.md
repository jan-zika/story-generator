# Deployment Guide - Hybrid Local + Vercel

## 🎯 Architecture Overview

This project is now configured for **hybrid deployment**:

- **Local Development:** Uses `server.js` with Express
- **Production (Vercel):** Uses serverless functions in `/api` folder

Both environments use the **same handler code**, ensuring consistency.

## 📁 Project Structure

```
story-generator/
├── api/                          # Serverless functions (Vercel)
│   ├── generate-story.js         # Story generation endpoint
│   ├── generate-audio.js         # Audio generation endpoint
│   └── health.js                 # Health check endpoint
├── public/                       # Static assets
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── server.js                     # Local development server only
├── package.json                  # ESM modules enabled
├── vercel.json                   # Vercel configuration
├── .env                          # Environment variables (local)
└── .gitignore
```

## 🚀 Local Development

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   OPENAI_API_KEY=your_openai_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_key_here
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:**
   ```
   http://localhost:3001
   ```

### How It Works

- `server.js` imports the serverless handlers from `/api`
- Express routes forward requests to these handlers
- Same code runs locally and on Vercel
- Hot reload: restart server after code changes

### API Endpoints (Local)

- `POST http://localhost:3001/api/generate-story`
- `POST http://localhost:3001/api/generate-audio`
- `GET http://localhost:3001/api/health`

## ☁️ Vercel Deployment

### Initial Setup

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Hybrid refactor for local + Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects the configuration

3. **Set Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add:
     - `OPENAI_API_KEY` = your OpenAI key
     - `ELEVENLABS_API_KEY` = your ElevenLabs key
   - Apply to: Production, Preview, Development

4. **Deploy:**
   - Vercel automatically deploys on push to main
   - Or click "Deploy" in dashboard

### How It Works

- Vercel reads `vercel.json` configuration
- Each file in `/api` becomes a serverless function
- Static files in `/public` are served via CDN
- Environment variables injected at runtime
- `server.js` is ignored (only for local dev)

### API Endpoints (Production)

- `POST https://your-app.vercel.app/api/generate-story`
- `POST https://your-app.vercel.app/api/generate-audio`
- `GET https://your-app.vercel.app/api/health`

### Automatic Deployments

Every push to `main` branch triggers:
1. Vercel detects changes
2. Builds serverless functions
3. Deploys to production
4. Updates live URL

## 🔧 Configuration Files

### package.json

```json
{
  "type": "module",              // Enable ESM modules
  "dependencies": {
    "openai": "^4.20.1",         // Required for Vercel
    "@elevenlabs/elevenlabs-js": "latest"
  },
  "devDependencies": {
    "express": "^4.18.2",        // Only for local dev
    "dotenv": "^16.3.1"          // Only for local dev
  }
}
```

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",      // Build serverless functions
      "use": "@vercel/node"
    },
    {
      "src": "public/**",        // Serve static files
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",        // API routes
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",            // Static files
      "dest": "/public/$1"
    }
  ]
}
```

## 📝 Serverless Function Format

Each function in `/api` follows this pattern:

```javascript
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Handle OPTIONS for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Your logic here
  res.status(200).json({ data: 'response' });
}
```

## 🔐 Environment Variables

### Local (.env file)

```env
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
```

### Vercel (Dashboard)

Set in: Project Settings → Environment Variables

- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`

**Important:** Never commit `.env` to Git!

## 🧪 Testing

### Test Local Server

```bash
npm run dev
```

Visit: `http://localhost:3001`

### Test Vercel Deployment

1. **Check health endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Test story generation:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/generate-story \
     -H "Content-Type: application/json" \
     -d '{"idea":"A robot learning to paint"}'
   ```

3. **Test in browser:**
   ```
   https://your-app.vercel.app
   ```

## 🐛 Troubleshooting

### Local Development Issues

**Error: Cannot find module**
- Run `npm install`
- Check `package.json` has `"type": "module"`

**Error: Port already in use**
- Stop existing server: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess`
- Or use different port: `PORT=3002 npm run dev`

**Error: Missing environment variables**
- Check `.env` file exists
- Verify keys are correct
- Restart server after changing `.env`

### Vercel Deployment Issues

**Build Failed**
- Check Vercel build logs
- Verify `package.json` dependencies
- Ensure all imports use ESM syntax

**Function Timeout**
- Vercel free tier: 10s timeout
- Optimize API calls
- Consider upgrading plan

**Environment Variables Not Working**
- Check spelling in Vercel dashboard
- Ensure applied to correct environment
- Redeploy after adding variables

**CORS Errors**
- Check CORS headers in function
- Verify OPTIONS method handled
- Test with browser dev tools

## 📊 Performance

### Local Development
- **Cold start:** ~100ms
- **Response time:** Depends on API calls
- **Memory:** ~50MB

### Vercel Production
- **Cold start:** ~500ms (first request)
- **Warm response:** ~100ms
- **Memory limit:** 1024MB (free tier)
- **Timeout:** 10s (free tier)

## 🔄 Continuous Deployment

### Workflow

```
1. Make code changes locally
   ↓
2. Test with `npm run dev`
   ↓
3. Commit changes
   ↓
4. Push to GitHub main branch
   ↓
5. Vercel auto-deploys
   ↓
6. Live in ~30 seconds
```

### Branch Deployments

- **main branch** → Production deployment
- **other branches** → Preview deployments
- Each preview gets unique URL

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)

## ✅ Checklist

### Before Deploying

- [ ] Code tested locally with `npm run dev`
- [ ] Environment variables set in Vercel dashboard
- [ ] `.env` file in `.gitignore`
- [ ] All imports use ESM syntax
- [ ] `package.json` has `"type": "module"`
- [ ] CORS headers added to all functions
- [ ] Error handling implemented

### After Deploying

- [ ] Test health endpoint
- [ ] Test story generation
- [ ] Test audio generation
- [ ] Check Vercel function logs
- [ ] Verify environment variables loaded
- [ ] Test error scenarios

## 🎉 Success!

Your app is now deployed in hybrid mode:
- ✅ Local development with Express
- ✅ Production serverless on Vercel
- ✅ Same code, different environments
- ✅ Automatic deployments on push
- ✅ Scalable and cost-effective
