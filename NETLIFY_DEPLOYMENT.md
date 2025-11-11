# Netlify Deployment Guide - Complete Refactor

## 🎯 Project Refactored for Netlify

Your story-generator project has been successfully refactored from Express/Vercel to **Netlify serverless functions**.

---

## 📁 New Project Structure

```
story-generator/
├── netlify/                      # Netlify serverless functions
│   └── functions/
│       ├── generate-story.js     # Story generation endpoint
│       ├── generate-audio.js     # Audio generation endpoint
│       └── health.js             # Health check endpoint
├── public/                       # Static files (served from root)
│   ├── index.html                # Main HTML file
│   ├── app.js                    # Frontend JavaScript
│   └── styles.css                # Styles
├── server.js                     # Local dev server (Express) - NOT used by Netlify
├── netlify.toml                  # Netlify configuration
├── package.json                  # Updated with Netlify scripts
├── .gitignore                    # Updated for Netlify
└── .env                          # Local environment variables
```

---

## 🔄 What Changed - Detailed Breakdown

### 1. **Serverless Functions Created**

**Before (Vercel/Express):**
- All API logic in `server.js` using Express routes
- Functions at `/api/generate-story`, `/api/generate-audio`, `/api/health`

**After (Netlify):**
- Three separate serverless functions in `netlify/functions/`
- Each function is a standalone module with Netlify handler signature

**Key Differences:**

| Aspect | Vercel Format | Netlify Format |
|--------|---------------|----------------|
| **Location** | `/api/*.js` | `/netlify/functions/*.js` |
| **Handler** | `export default async function handler(req, res)` | `exports.handler = async (event, context)` |
| **Request Body** | `req.body` | `JSON.parse(event.body)` |
| **HTTP Method** | `req.method` | `event.httpMethod` |
| **Response** | `res.status(200).json({...})` | `return { statusCode: 200, headers: {...}, body: JSON.stringify({...}) }` |
| **Module Type** | ES Modules | CommonJS |

### 2. **Function Handler Signature**

**Netlify Function Template:**
```javascript
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Parse request body
  const data = JSON.parse(event.body || '{}');

  // Return response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ result: 'success' })
  };
};
```

### 3. **netlify.toml Configuration**

Created comprehensive configuration file:

```toml
[build]
  publish = "public"              # Static files directory
  command = "echo 'No build'"     # No build needed
  functions = "netlify/functions" # Functions directory

[build.environment]
  NODE_VERSION = "20"             # Node.js version

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

# API redirects for compatibility
[[redirects]]
  from = "/api/generate-story"
  to = "/.netlify/functions/generate-story"
  status = 200
```

**Why These Redirects?**
- Netlify serves functions at `/.netlify/functions/[name]`
- Redirects make them available at `/api/[name]` (matches your frontend code)
- No need to change frontend API calls!

### 4. **package.json Updates**

**Changes Made:**
```json
{
  "version": "2.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "netlify:dev": "netlify dev",
    "netlify:deploy": "netlify deploy",
    "netlify:deploy:prod": "netlify deploy --prod"
  },
  "dependencies": {
    "openai": "^4.67.0",
    "@elevenlabs/elevenlabs-js": "^0.8.2"
  },
  "devDependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "netlify-cli": "^17.0.0"
  }
}
```

**Key Changes:**
- ✅ Added `engines` field for Node.js version
- ✅ Added Netlify-specific scripts
- ✅ Moved Express/CORS to `devDependencies` (only for local dev)
- ✅ Added `netlify-cli` for local testing
- ✅ Pinned dependency versions for stability

### 5. **Module System**

**Important:** Netlify functions use **CommonJS** (not ES modules)

- Use `require()` instead of `import`
- Use `module.exports` or `exports.handler`
- No `"type": "module"` in package.json needed

---

## 🚀 Deployment Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- OpenAI SDK
- ElevenLabs SDK
- Netlify CLI (for local testing and deployment)
- Express (for local dev server)

### Step 2: Test Locally with Netlify Dev

```bash
npm run netlify:dev
```

Or directly:
```bash
netlify dev
```

**What This Does:**
- Starts Netlify's local development server
- Serves static files from `/public`
- Runs serverless functions locally
- Simulates Netlify's production environment
- Available at: `http://localhost:8888`

**Test Endpoints:**
- Frontend: `http://localhost:8888/`
- Health: `http://localhost:8888/api/health`
- Story: `POST http://localhost:8888/api/generate-story`
- Audio: `POST http://localhost:8888/api/generate-audio`

### Step 3: Set Environment Variables Locally

Create `.env` file in project root:

```env
OPENAI_API_KEY=sk-your-openai-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
```

Netlify CLI will automatically load these for local testing.

### Step 4: Deploy to Netlify

**Option A: Deploy via CLI (Recommended for first deployment)**

```bash
# Login to Netlify
netlify login

# Initialize Netlify site (first time only)
netlify init

# Deploy to preview
npm run netlify:deploy

# Deploy to production
npm run netlify:deploy:prod
```

**Option B: Deploy via Git (Continuous Deployment)**

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Refactor for Netlify deployment"
   git push origin main
   ```

2. Connect repository in Netlify dashboard:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Netlify will auto-detect `netlify.toml` configuration
   - Click "Deploy site"

### Step 5: Set Environment Variables in Netlify

**In Netlify Dashboard:**

1. Go to: **Site settings → Environment variables**
2. Add these variables:

   **Variable 1:**
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (starts with `sk-`)
   - **Scopes:** All scopes (Production, Deploy Previews, Branch deploys)

   **Variable 2:**
   - **Key:** `ELEVENLABS_API_KEY`
   - **Value:** Your ElevenLabs API key
   - **Scopes:** All scopes

3. Click "Save"
4. Trigger a new deployment (or it will auto-deploy on next push)

---

## 🧪 Testing Your Deployment

### Test Health Endpoint

```bash
curl https://your-site.netlify.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "environment": "netlify",
  "timestamp": "2025-10-19T...",
  "envVarsConfigured": {
    "openai": true,
    "elevenlabs": true
  }
}
```

### Test Story Generation

```bash
curl -X POST https://your-site.netlify.app/api/generate-story \
  -H "Content-Type: application/json" \
  -d '{"idea":"A robot learning to paint"}'
```

### Test Audio Generation

```bash
curl -X POST https://your-site.netlify.app/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}'
```

### Test Frontend

Visit: `https://your-site.netlify.app/`

---

## 🔍 How It Works

### Request Flow

1. **User visits site:**
   - `https://your-site.netlify.app/` → Serves `/public/index.html`
   - Static assets loaded from `/public`

2. **User generates story:**
   - Frontend calls: `POST /api/generate-story`
   - Netlify redirects to: `/.netlify/functions/generate-story`
   - Function executes on AWS Lambda
   - Response returned to frontend

3. **User generates audio:**
   - Frontend calls: `POST /api/generate-audio`
   - Netlify redirects to: `/.netlify/functions/generate-audio`
   - Function executes on AWS Lambda
   - Response returned to frontend

### Netlify Functions Runtime

- **Platform:** AWS Lambda (managed by Netlify)
- **Runtime:** Node.js 20.x
- **Timeout:** 10 seconds (free tier), 26 seconds (Pro)
- **Memory:** 1024 MB default
- **Cold Start:** ~500ms first request
- **Warm Start:** ~100ms subsequent requests

---

## 📊 Comparison: Before vs After

| Feature | Before (Express) | After (Netlify) |
|---------|------------------|-----------------|
| **Deployment** | Manual server setup | Automatic via Git |
| **Scaling** | Manual | Automatic |
| **Server** | Always running | Serverless (on-demand) |
| **Cost** | Fixed (VPS/hosting) | Pay-per-use (free tier available) |
| **Maintenance** | Manual updates | Managed by Netlify |
| **HTTPS** | Manual setup | Automatic |
| **CDN** | Optional | Built-in global CDN |
| **Functions** | Express routes | AWS Lambda functions |

---

## 🐛 Troubleshooting

### Issue: Functions Not Found (404)

**Solution:**
- Check `netlify.toml` has correct `functions` directory
- Verify files are in `netlify/functions/`
- Check function file names match redirect rules
- Redeploy: `netlify deploy --prod`

### Issue: Environment Variables Not Working

**Solution:**
- Verify variables are set in Netlify dashboard
- Check spelling (case-sensitive)
- Ensure applied to all scopes
- Redeploy after adding variables
- Test with health endpoint first

### Issue: Function Timeout

**Solution:**
- Netlify free tier: 10s timeout
- Check API response times
- Optimize API calls
- Consider upgrading to Pro plan (26s timeout)

### Issue: CORS Errors

**Solution:**
- CORS headers are in each function's response
- Check browser console for specific error
- Verify `Access-Control-Allow-Origin: *` in response
- Test with curl first (bypasses CORS)

### Issue: Module Not Found

**Solution:**
- Ensure dependencies are in `dependencies` (not `devDependencies`)
- Run `npm install` before deploying
- Check `netlify.toml` has `included_files = ["node_modules/**"]`

### Issue: Local Dev Server Not Working

**Solution:**
- Install Netlify CLI: `npm install -g netlify-cli`
- Or use local version: `npm run netlify:dev`
- Check `.env` file exists with API keys
- Verify port 8888 is not in use

---

## 📝 Local Development Workflow

### Option 1: Netlify Dev (Recommended)

```bash
npm run netlify:dev
```

**Pros:**
- Simulates Netlify production environment
- Tests serverless functions locally
- Automatic environment variable loading
- Hot reload for functions

**Cons:**
- Slightly slower than Express
- Requires Netlify CLI

### Option 2: Express Server (Legacy)

```bash
npm run dev
# or
npm start
```

**Pros:**
- Faster startup
- Familiar Express workflow
- No additional tools needed

**Cons:**
- Doesn't test Netlify-specific features
- Different from production environment

**Note:** `server.js` is kept for local development convenience but is **NOT used** by Netlify in production.

---

## ✅ Deployment Checklist

### Before Deploying:

- [x] Netlify functions created in `netlify/functions/`
- [x] `netlify.toml` configuration file created
- [x] `package.json` updated with Netlify scripts
- [x] `.gitignore` updated for Netlify
- [x] Tested locally with `netlify dev`
- [x] Environment variables ready (API keys)

### After Deploying:

- [ ] Site deployed successfully
- [ ] Custom domain configured (optional)
- [ ] Environment variables set in Netlify dashboard
- [ ] Health endpoint returns 200 OK
- [ ] Story generation works
- [ ] Audio generation works
- [ ] No errors in function logs
- [ ] Frontend loads correctly
- [ ] All features functional

---

## 🎉 Success!

Your project is now fully configured for Netlify deployment with:

- ✅ **Serverless functions** running on AWS Lambda
- ✅ **Static site** served from global CDN
- ✅ **Automatic deployments** on Git push
- ✅ **Environment variables** managed in Netlify dashboard
- ✅ **HTTPS** and custom domains supported
- ✅ **Free tier** available with generous limits

---

## 📚 Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Configuration](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)

---

## 🆘 Need Help?

- [Netlify Support](https://www.netlify.com/support/)
- [Netlify Community](https://answers.netlify.com/)
- [Netlify Status](https://www.netlifystatus.com/)

---

**Ready to deploy!** Run `netlify dev` to test locally, then `netlify deploy --prod` to go live. 🚀
