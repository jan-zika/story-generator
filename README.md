# 🎭 AI Story Generator

A voice-powered story generator that uses OpenAI to create engaging short stories and ElevenLabs to bring them to life with realistic voice narration.

## Features

- 📝 Generate creative short stories using OpenAI GPT-3.5
- 🎙️ Convert stories to speech using ElevenLabs text-to-speech
- ▶️ Play/Pause/Stop audio controls with progress bar
- 🎨 Beautiful, modern UI with gradient design
- 📱 Responsive design for all devices
- ⚠️ **Graceful error handling with toast notifications**
- 🛡️ **Specific error messages for quota, authentication, and network errors**
- 🔄 **Non-blocking error system - app never crashes**
- 🎵 **Persistent audio UI with fallback clip**
- 📊 **Animated progress bar for audio playback**
- 🖼️ **Screenshot-ready consistent UI**

## Prerequisites

- Node.js (v14 or higher)
- OpenAI API Key
- ElevenLabs API Key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd story-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Local Development

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3001
```

## Usage

1. Enter a story idea in the text area (e.g., "A brave knight discovers a magical forest")
2. Click "Generate Story" to create your story using AI
3. Once the story appears, click "Generate Voice" to create audio narration
4. Use the Play/Stop buttons to control audio playback

## Deployment to Netlify

### Option 1: Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build and deploy:
```bash
netlify deploy --prod
```

3. Set environment variables in Netlify dashboard:
   - Go to Site settings > Environment variables
   - Add `OPENAI_API_KEY`
   - Add `ELEVENLABS_API_KEY`

### Option 2: Netlify Dashboard

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm install`
   - Publish directory: `public`
   - Functions directory: (leave empty for now)
3. Add environment variables in Site settings

**Note:** This application requires a backend server. For Netlify deployment, you'll need to convert the API endpoints to Netlify Functions or use a separate backend service.

## Project Structure

```
story-generator/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies
├── .env               # Environment variables (not in git)
└── README.md          # This file
```

## API Endpoints

- `POST /api/generate-story` - Generate a story from an idea
- `POST /api/generate-audio` - Convert text to speech
- `GET /api/health` - Health check endpoint

## Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express
- **AI Services:** OpenAI GPT-3.5, ElevenLabs TTS
- **Styling:** Custom CSS with gradients

## Error Handling

The application includes robust error handling with specific messages:

- **Quota Exceeded:** `"Quota exceeded: this request requires more tokens than your remaining credits."`
- **Authentication Errors:** `"Authentication failed: please check your API key or quota."`
- **Network Errors:** `"Audio generation failed. Please try again later."`
- **Toast Notifications:** Non-blocking, auto-dismissing notifications for all error types
- **No Crashes:** All errors are caught and handled without breaking the app
- **Fallback Audio:** App remains functional with default audio clip when errors occur

See [ERROR_HANDLING.md](ERROR_HANDLING.md) and [IMPROVEMENTS_V2.md](IMPROVEMENTS_V2.md) for detailed documentation.

## Toast Notification System

Reusable notification system for user feedback:

```javascript
showToast(message, type, duration)
```

Types: `'error'`, `'warning'`, `'success'`, `'info'`

See [TOAST_USAGE.md](TOAST_USAGE.md) for complete usage guide.

## Security Notes

- Never commit `.env` file to version control
- Store API keys as environment variables in production
- Use HTTPS in production
- Implement rate limiting for production use

## License

ISC

## Support

For issues or questions, please open an issue in the GitHub repository.
