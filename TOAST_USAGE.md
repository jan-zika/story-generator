# Toast Notification System - Quick Reference

## Function Signature

```javascript
showToast(message, type = 'error', duration = 4000)
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | string | required | The message to display to the user |
| `type` | string | `'error'` | Notification type: `'error'`, `'warning'`, `'success'`, `'info'` |
| `duration` | number | `4000` | Display duration in milliseconds |

## Usage Examples

### Error Notifications (Red)
```javascript
// Generic error
showToast('Something went wrong!', 'error', 4000);

// Network error
showToast('Unable to connect to server', 'error', 5000);

// API error
showToast('Failed to process request', 'error', 4000);
```

### Warning Notifications (Orange)
```javascript
// Quota exceeded
showToast('Voice generation temporarily unavailable: you\'ve exceeded your token or credit limit.', 'warning', 5000);

// Validation warning
showToast('Please generate a story first!', 'warning', 3000);

// Rate limit warning
showToast('Too many requests. Please wait a moment.', 'warning', 4000);
```

### Success Notifications (Green)
```javascript
// Operation completed
showToast('Voice generated successfully!', 'success', 2000);

// Save successful
showToast('Story saved!', 'success', 2000);

// Upload complete
showToast('File uploaded successfully', 'success', 3000);
```

### Info Notifications (Blue)
```javascript
// Processing status
showToast('Processing your request...', 'info', 3000);

// Feature info
showToast('Tip: Press Ctrl+Enter to generate story', 'info', 4000);

// Update notification
showToast('New features available!', 'info', 5000);
```

## Visual Appearance

### Error (Red)
- Background: Red gradient (rgba(239, 68, 68) → rgba(220, 38, 38))
- Use for: Failures, errors, critical issues

### Warning (Orange)
- Background: Orange gradient (rgba(245, 158, 11) → rgba(217, 119, 6))
- Use for: Warnings, quota limits, validation issues

### Success (Green)
- Background: Green gradient (rgba(34, 197, 94) → rgba(22, 163, 74))
- Use for: Successful operations, confirmations

### Info (Blue)
- Background: Blue gradient (rgba(59, 130, 246) → rgba(37, 99, 235))
- Use for: Informational messages, tips, updates

## Animation Behavior

1. **Appear:** Slides up from bottom with fade-in (300ms)
2. **Display:** Stays visible for specified duration
3. **Disappear:** Fades out smoothly (300ms)
4. **Remove:** Removed from DOM after fade-out completes

## Best Practices

### Duration Guidelines
- **Quick success:** 2000ms (2 seconds)
- **Standard info:** 3000-4000ms (3-4 seconds)
- **Important warnings:** 5000ms (5 seconds)
- **Critical errors:** 5000-6000ms (5-6 seconds)

### Message Guidelines
- Keep messages concise (under 100 characters)
- Use clear, non-technical language
- Provide actionable information when possible
- Avoid jargon and error codes

### When to Use Each Type

**Error:**
- API failures
- Network issues
- Authentication problems
- Data processing errors

**Warning:**
- Quota/rate limits
- Validation issues
- Deprecation notices
- Non-critical problems

**Success:**
- Completed operations
- Successful saves
- Upload confirmations
- Action confirmations

**Info:**
- Status updates
- Tips and hints
- Feature announcements
- General information

## Integration Examples

### In API Calls
```javascript
async function saveData() {
    try {
        const response = await fetch('/api/save', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            showToast('Failed to save data', 'error', 4000);
            return;
        }
        
        showToast('Data saved successfully!', 'success', 2000);
    } catch (error) {
        showToast('Network error: Unable to connect', 'error', 5000);
    }
}
```

### In Form Validation
```javascript
function validateForm() {
    if (!email) {
        showToast('Please enter your email address', 'warning', 3000);
        return false;
    }
    
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address', 'warning', 3000);
        return false;
    }
    
    return true;
}
```

### In User Actions
```javascript
function copyToClipboard(text) {
    try {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!', 'success', 2000);
    } catch (error) {
        showToast('Failed to copy to clipboard', 'error', 3000);
    }
}
```

## Styling Customization

To customize toast appearance, modify `styles.css`:

```css
/* Change position */
.toast {
    bottom: 30px;  /* Distance from bottom */
    left: 50%;     /* Horizontal position */
}

/* Change size */
.toast {
    min-width: 300px;
    max-width: 500px;
    padding: 16px 24px;
}

/* Change animation speed */
.toast {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Change colors */
.toast-error {
    background: linear-gradient(135deg, 
        rgba(239, 68, 68, 0.95) 0%, 
        rgba(220, 38, 38, 0.95) 100%);
}
```

## Mobile Responsiveness

On screens < 600px:
- Width: 90% of screen (max)
- Minimum width: 280px
- Bottom spacing: 20px
- Smaller padding: 14px 20px
- Smaller font: 0.9em

## Accessibility

- High contrast colors for readability
- Clear, descriptive messages
- Appropriate display duration
- Non-blocking (doesn't prevent interaction)
- Automatically dismisses (no manual close needed)

## Multiple Toasts

The system supports multiple toasts:
- Each toast is independent
- Multiple toasts can appear simultaneously
- They stack vertically (newest at bottom)
- Each auto-dismisses after its duration

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

Requires:
- CSS transitions
- CSS transforms
- ES6 JavaScript
