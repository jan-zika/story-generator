# Error Handling Documentation

## Overview

The Story Generator application now includes robust error handling with a user-friendly toast notification system. The app gracefully handles API quota errors, authentication failures, and network issues without crashing.

## Features Implemented

### ✅ Server-Side Error Handling

**File:** `server.js`

The `/api/generate-audio` endpoint now:
- Detects quota exceeded errors from ElevenLabs API
- Identifies authentication failures (401 errors)
- Categorizes errors by type (`quota_exceeded`, `auth_error`, `network`)
- Returns structured error responses with appropriate HTTP status codes
- Logs detailed error information for debugging

**Error Detection Logic:**
```javascript
// Detects quota/credit/token exceeded errors
if (detail.status === 'quota_exceeded' || 
    detail.message?.toLowerCase().includes('quota') ||
    detail.message?.toLowerCase().includes('credit') ||
    detail.message?.toLowerCase().includes('token'))
```

**Response Format:**
```json
{
  "error": "User-friendly error message",
  "errorType": "quota_exceeded|auth_error|network",
  "details": "Technical error details"
}
```

### ✅ Client-Side Error Handling

**File:** `public/app.js`

#### 1. Toast Notification System

**Function:** `showToast(message, type, duration)`

A reusable notification system that displays temporary messages without blocking the UI.

**Parameters:**
- `message` (string): The message to display
- `type` (string): Notification type - `'error'`, `'warning'`, `'success'`, or `'info'`
- `duration` (number): Display duration in milliseconds (default: 4000ms)

**Features:**
- Smooth fade-in/fade-out animations
- Auto-dismisses after specified duration
- Positioned at bottom-center of screen
- Translucent background with backdrop blur
- Color-coded by notification type
- Fully responsive on mobile devices
- Non-blocking (doesn't prevent user interaction)

**Usage Examples:**
```javascript
// Error notification
showToast('Something went wrong!', 'error', 4000);

// Warning notification
showToast('Voice generation temporarily unavailable', 'warning', 5000);

// Success notification
showToast('Voice generated successfully!', 'success', 2000);

// Info notification
showToast('Processing your request...', 'info', 3000);
```

#### 2. Error Response Parser

**Function:** `parseErrorResponse(response)`

Intelligently parses API error responses and categorizes them.

**Returns:**
```javascript
{
  message: "User-friendly error message",
  type: "quota|auth|network"
}
```

**Detection Logic:**
- **Quota Errors:** Status 429, or keywords: "quota", "credit", "token"
- **Auth Errors:** Status 401, or errorType: "auth_error"
- **Network Errors:** All other errors

#### 3. Enhanced generateVoice() Function

**Improvements:**
- Wrapped in comprehensive try-catch block
- No longer throws errors that crash the app
- Gracefully handles all error types
- Shows appropriate toast notifications
- Logs errors for debugging without exposing to user
- Returns early on error instead of crashing

**Error Flow:**
```
1. API call fails
   ↓
2. parseErrorResponse() categorizes error
   ↓
3. showToast() displays user-friendly message
   ↓
4. console.warn() logs technical details
   ↓
5. Function returns gracefully (no crash)
   ↓
6. User can continue using the app
```

### ✅ CSS Styling

**File:** `public/styles.css`

**Toast Notification Styles:**
- Fixed positioning at bottom-center
- Smooth cubic-bezier transitions
- Gradient backgrounds by type:
  - **Error:** Red gradient
  - **Warning:** Orange gradient
  - **Success:** Green gradient
  - **Info:** Blue gradient
- Backdrop blur effect
- Responsive design for mobile
- High z-index (10000) to appear above all content

## Error Types and Messages

### 1. Quota Exceeded Error

**Trigger:** ElevenLabs API returns quota/credit/token limit error

**User Message:**
> "Voice generation temporarily unavailable: you've exceeded your token or credit limit."

**Display:** Orange warning toast, 5 seconds

**Status Code:** 429 (Too Many Requests)

### 2. Authentication Error

**Trigger:** Invalid or missing API key

**User Message:**
> "Authentication failed. Please check your API configuration."

**Display:** Red error toast, 5 seconds

**Status Code:** 401 (Unauthorized)

### 3. Network Error

**Trigger:** Server unreachable, timeout, or unexpected error

**User Message:**
> "Network error: Unable to connect to the server. Please try again."

**Display:** Red error toast, 4 seconds

**Status Code:** 500 (Internal Server Error)

### 4. Validation Error

**Trigger:** Missing required data (e.g., no story generated)

**User Message:**
> "Please generate a story first!"

**Display:** Orange warning toast, 3 seconds

### 5. Success Notification

**Trigger:** Voice successfully generated

**User Message:**
> "Voice generated successfully!"

**Display:** Green success toast, 2 seconds

## Testing the Error Handling

### Test Quota Error

If your ElevenLabs API quota is exceeded, you'll see:
1. Orange warning toast appears at bottom
2. Message: "Voice generation temporarily unavailable..."
3. Toast fades out after 5 seconds
4. App remains functional
5. No console crash

### Test Network Error

To simulate:
1. Stop the server
2. Try to generate voice
3. See: "Network error: Unable to connect to the server"
4. Red error toast appears
5. App doesn't crash

### Test Success Flow

1. Generate a story
2. Click "Generate Voice"
3. Wait for processing
4. See: "Voice generated successfully!" (green toast)
5. Audio controls appear

## Benefits

✅ **No App Crashes:** All errors are caught and handled gracefully  
✅ **User-Friendly:** Clear, non-technical error messages  
✅ **Non-Blocking:** Users can continue using the app after errors  
✅ **Reusable:** Toast system works for any notification type  
✅ **Debuggable:** Technical details logged to console  
✅ **Professional:** Smooth animations and polished UI  
✅ **Responsive:** Works perfectly on mobile devices  

## Code Structure

```
server.js
├── Enhanced error detection
├── Error categorization
└── Structured error responses

app.js
├── showToast() - Toast notification system
├── parseErrorResponse() - Error parser
└── generateVoice() - Enhanced with error handling

styles.css
├── .toast - Base toast styles
├── .toast-error - Red error styling
├── .toast-warning - Orange warning styling
├── .toast-success - Green success styling
├── .toast-info - Blue info styling
└── @media - Responsive mobile styles
```

## Future Enhancements

Potential improvements:
- Add retry mechanism for failed requests
- Show remaining quota/credits to user
- Queue multiple toasts if needed
- Add close button to toasts
- Persist error logs for analytics
- Add sound effects for notifications

## Troubleshooting

**Toast not appearing:**
- Check browser console for JavaScript errors
- Verify CSS file is loaded
- Ensure z-index isn't being overridden

**Errors still crashing:**
- Check for syntax errors in try-catch blocks
- Verify all async functions are properly awaited
- Look for unhandled promise rejections

**Wrong error messages:**
- Verify server error response format
- Check parseErrorResponse() logic
- Ensure errorType is being set correctly
