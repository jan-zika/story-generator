# Vercel Deployment Setup Guide

## ✅ Code Changes Complete

All code has been refactored and pushed to GitHub main branch.

## 🚀 Next Steps: Deploy to Vercel

### Step 1: Import Project to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Repository:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `jan-zika/story-generator`
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Other (Vercel auto-detects)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** Leave empty (no build needed)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

### Step 2: Set Environment Variables

**CRITICAL:** Add these environment variables before deploying:

1. In Vercel dashboard, go to: **Settings → Environment Variables**

2. Add the following variables:

   **Variable 1:**
   - **Name:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key (starts with `sk-`)
   - **Environment:** Production, Preview, Development (select all)

   **Variable 2:**
   - **Name:** `ELEVENLABS_API_KEY`
   - **Value:** Your ElevenLabs API key
   - **Environment:** Production, Preview, Development (select all)

3. Click "Save" for each variable

### Step 3: Deploy

1. **Initial Deployment:**
   - Click "Deploy" button
   - Wait ~30-60 seconds for deployment
   - Vercel will build and deploy your serverless functions

2. **Get Your URL:**
   - After deployment, you'll get a URL like:
   - `https://story-generator-xxx.vercel.app`

3. **Test Your Deployment:**
   - Visit your Vercel URL
   - Test story generation
   - Test audio generation
   - Check browser console for errors

### Step 4: Verify Deployment

**Test Health Endpoint:**
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "vercel",
  "timestamp": "2025-10-19T..."
}
```

**Test Story Generation:**
```bash
curl -X POST https://your-app.vercel.app/api/generate-story \
  -H "Content-Type: application/json" \
  -d '{"idea":"A robot learning to paint"}'
```

**Test Audio Generation:**
```bash
curl -X POST https://your-app.vercel.app/api/generate-audio \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world"}'
```

## 🔧 Configuration Details

### Vercel Automatically Detects:

- ✅ `vercel.json` configuration
- ✅ Serverless functions in `/api`
- ✅ Static files in `/public`
- ✅ Node.js runtime
- ✅ ESM modules

### What Happens on Deploy:

1. Vercel reads `vercel.json`
2. Builds each function in `/api`
3. Deploys functions as serverless endpoints
4. Serves static files from `/public` via CDN
5. Injects environment variables
6. Generates production URL

## 📊 Expected Results

### Deployment Success:

```
✓ Serverless Functions deployed:
  - /api/generate-story
  - /api/generate-audio
  - /api/health

✓ Static files deployed:
  - /index.html
  - /app.js
  - /styles.css

✓ Environment variables loaded:
  - OPENAI_API_KEY
  - ELEVENLABS_API_KEY

✓ Production URL: https://story-generator-xxx.vercel.app
```

### Function Logs:

View logs in Vercel dashboard:
- Go to: **Deployments → [Your Deployment] → Functions**
- Click on any function to see logs
- Monitor requests and errors

## 🐛 Troubleshooting

### Issue: Build Failed

**Solution:**
- Check Vercel build logs
- Verify `package.json` syntax
- Ensure all imports use ESM syntax
- Check for missing dependencies

### Issue: Environment Variables Not Working

**Solution:**
- Verify variables are set in Vercel dashboard
- Check spelling (case-sensitive)
- Ensure applied to all environments
- Redeploy after adding variables

### Issue: Function Timeout

**Solution:**
- Vercel free tier has 10s timeout
- Check API response times
- Optimize API calls
- Consider upgrading plan if needed

### Issue: CORS Errors

**Solution:**
- Verify CORS headers in functions
- Check browser console for specific error
- Ensure OPTIONS method handled
- Test with curl first (bypasses CORS)

### Issue: 404 Not Found

**Solution:**
- Check function file names match routes
- Verify `vercel.json` routes configuration
- Ensure files are in `/api` folder
- Check deployment logs

## 🔄 Automatic Deployments

### How It Works:

Every push to GitHub `main` branch:
1. Vercel detects commit
2. Automatically starts deployment
3. Builds and deploys changes
4. Updates production URL
5. Sends notification

### Deployment Status:

- Check status in Vercel dashboard
- View real-time build logs
- Get deployment notifications
- Rollback if needed

## 📱 Custom Domain (Optional)

### Add Custom Domain:

1. Go to: **Settings → Domains**
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (~24 hours)

## 🎯 Post-Deployment Checklist

- [ ] Deployment successful
- [ ] Health endpoint returns 200
- [ ] Story generation works
- [ ] Audio generation works
- [ ] Environment variables loaded
- [ ] No errors in function logs
- [ ] Frontend loads correctly
- [ ] All features functional
- [ ] Error handling works
- [ ] CORS configured properly

## 📈 Monitoring

### View Analytics:

- Go to: **Analytics** tab
- Monitor request counts
- Track response times
- View error rates
- Check bandwidth usage

### Function Logs:

- Go to: **Functions** tab
- View real-time logs
- Filter by function
- Search for errors
- Download logs

## 🎉 Success!

Once deployed, your app will be:
- ✅ Live at your Vercel URL
- ✅ Auto-scaling based on traffic
- ✅ Globally distributed via CDN
- ✅ Automatically deployed on push
- ✅ Free tier available

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

## 🆘 Need Help?

- [Vercel Support](https://vercel.com/support)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Project Documentation](./DEPLOYMENT.md)

---

**Ready to deploy!** Follow the steps above to get your app live on Vercel. 🚀
