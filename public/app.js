// DOM Elements
const storyIdeaInput = document.getElementById('storyIdea');
const generateBtn = document.getElementById('generateBtn');
const voiceBtn = document.getElementById('voiceBtn');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const storySection = document.getElementById('storySection');
const storyText = document.getElementById('storyText');
const audioPlayerSection = document.getElementById('audioPlayerSection');
const audioStatus = document.getElementById('audioStatus');
const audioProgressFill = document.getElementById('audioProgressFill');
const errorMessage = document.getElementById('errorMessage');

// State
let currentStory = '';
let audioElement = null;
let isGenerating = false;
let isAudioGenerated = false;
let isPlaying = false;
let audioProgress = 0;

// Fallback audio URL
const FALLBACK_AUDIO_URL = 'https://github.com/jan-zika/assets/releases/download/sound/trump_maduro_05.wav';

// API Base URL
const API_BASE = window.location.origin;

// Utility Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Show a temporary toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'error', 'warning', 'success', 'info'
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showToast(message, type = 'error', duration = 4000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Trigger animation (add 'show' class after a brief delay for CSS transition)
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        // Remove from DOM after fade-out animation completes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * Parse error response and determine appropriate user message
 * @param {Response} response - Fetch API response object
 * @returns {Promise<{message: string, type: string}>}
 */
async function parseErrorResponse(response) {
    try {
        const errorData = await response.json();
        const errorText = JSON.stringify(errorData).toLowerCase();
        
        // Check for quota exceeded - most specific check first
        if (errorData.errorType === 'quota_exceeded' || 
            response.status === 429 ||
            errorText.includes('quota_exceeded') ||
            errorText.includes('quota') ||
            errorText.includes('credit') ||
            errorText.includes('token')) {
            return {
                message: 'Quota exceeded: this request requires more tokens than your remaining credits.',
                type: 'quota'
            };
        }
        
        // Check for authentication errors
        if (response.status === 401 || 
            errorData.errorType === 'auth_error' ||
            errorText.includes('401') ||
            errorText.includes('authentication') ||
            errorText.includes('unauthorized')) {
            return {
                message: 'Authentication failed: please check your API key or quota.',
                type: 'auth'
            };
        }
        
        // Generic error
        return {
            message: 'Audio generation failed. Please try again later.',
            type: 'network'
        };
    } catch (e) {
        // If response is not JSON, return generic error
        return {
            message: 'Audio generation failed. Please try again later.',
            type: 'network'
        };
    }
}

/**
 * Show popup notification (alias for showToast for consistency)
 * @param {string} message - The message to display
 */
function showPopup(message) {
    // Determine type based on message content
    let type = 'error';
    if (message.toLowerCase().includes('quota')) {
        type = 'warning';
    } else if (message.toLowerCase().includes('success')) {
        type = 'success';
    }
    showToast(message, type, 4000);
}

function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');
    
    if (isLoading) {
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        button.disabled = true;
    } else {
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
        button.disabled = false;
    }
}

/**
 * Generate story from user's idea using OpenAI
 */
async function generateStory() {
    const idea = storyIdeaInput.value.trim();
    
    if (!idea) {
        showError('Please enter a story idea first!');
        return;
    }
    
    if (isGenerating) return;
    
    isGenerating = true;
    hideError();
    setButtonLoading(generateBtn, true);
    storySection.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/api/generate-story`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idea })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate story');
        }
        
        const data = await response.json();
        currentStory = data.story;
        
        // Display story
        storyText.textContent = currentStory;
        storySection.classList.remove('hidden');
        
        // Initialize audio player with fallback clip
        initializeAudioPlayer();
        isAudioGenerated = false;
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        isGenerating = false;
        setButtonLoading(generateBtn, false);
    }
}

/**
 * Initialize audio player with fallback clip
 * Always visible, loads default audio on first story generation
 */
function initializeAudioPlayer() {
    // Load fallback audio
    if (!audioElement) {
        audioElement = new Audio(FALLBACK_AUDIO_URL);
        setupAudioEventListeners();
        isAudioGenerated = false;
    }
    
    // Show audio player
    audioPlayerSection.classList.remove('hidden');
    updateAudioStatus();
}

/**
 * Setup audio event listeners
 */
function setupAudioEventListeners() {
    if (!audioElement) return;
    
    audioElement.addEventListener('ended', () => {
        isPlaying = false;
        audioProgress = 0;
        updateAudioStatus();
    });
    
    audioElement.addEventListener('play', () => {
        isPlaying = true;
        updateAudioStatus();
    });
    
    audioElement.addEventListener('pause', () => {
        isPlaying = false;
        updateAudioStatus();
    });
    
    audioElement.addEventListener('timeupdate', () => {
        if (audioElement.duration) {
            audioProgress = (audioElement.currentTime / audioElement.duration) * 100;
            updateProgressBar();
        }
    });
    
    audioElement.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        showPopup('Audio playback failed. Please try again.');
    });
}

/**
 * Update progress bar visual
 */
function updateProgressBar() {
    if (audioProgressFill) {
        audioProgressFill.style.width = `${audioProgress}%`;
    }
}

/**
 * Update audio player UI based on current state
 */
function updateAudioStatus() {
    if (!audioElement) return;
    
    // Update play button
    if (isPlaying) {
        playBtn.textContent = '⏸️ Pause';
        playBtn.disabled = false;
    } else {
        playBtn.textContent = '▶️ Play';
        playBtn.disabled = false;
    }
    
    // Update stop button
    stopBtn.disabled = false;
    
    // Update status text
    if (isPlaying) {
        audioStatus.textContent = 'Playing...';
    } else if (audioElement.ended) {
        audioStatus.textContent = 'Finished';
    } else if (audioElement.currentTime > 0) {
        audioStatus.textContent = 'Paused';
    } else if (isAudioGenerated) {
        audioStatus.textContent = 'Ready to play';
    } else {
        audioStatus.textContent = 'Preview: default clip';
        audioStatus.title = 'Using fallback audio. Generate voice to hear your story.';
    }
    
    // Update progress bar
    updateProgressBar();
}

/**
 * Generate voice from story text using ElevenLabs API
 * Handles quota exceeded, authentication, and network errors gracefully
 */
async function generateVoice() {
    if (!currentStory) {
        showPopup('Please generate a story first!');
        return;
    }
    
    hideError();
    setButtonLoading(voiceBtn, true);
    
    try {
        const response = await fetch(`${API_BASE}/api/generate-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: currentStory })
        });
        
        // Handle error responses gracefully
        if (!response.ok) {
            const errorInfo = await parseErrorResponse(response);
            
            // Show specific error messages
            if (errorInfo.type === 'quota') {
                // Quota exceeded - show warning
                showPopup('Quota exceeded: this request requires more tokens than your remaining credits.');
            } else if (errorInfo.type === 'auth') {
                // Authentication failed
                showPopup('Authentication failed: please check your API key or quota.');
            } else {
                // Generic error
                showPopup('Audio generation failed. Please try again later.');
            }
            
            // Log error for debugging but don't crash the app
            console.warn('Voice generation failed:', errorInfo);
            
            // Keep fallback audio player visible
            initializeAudioPlayer();
            return; // Exit gracefully without throwing
        }
        
        const data = await response.json();
        
        // Create audio element from base64
        const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Clean up old audio
        if (audioElement) {
            audioElement.pause();
            if (audioElement.src.startsWith('blob:')) {
                URL.revokeObjectURL(audioElement.src);
            }
        }
        
        // Create new audio element with generated audio
        audioElement = new Audio(audioUrl);
        setupAudioEventListeners();
        isAudioGenerated = true;
        
        // Show audio controls
        audioPlayerSection.classList.remove('hidden');
        updateAudioStatus();
        
        // Show success toast
        showToast('Voice generated successfully!', 'success', 2000);
        
    } catch (error) {
        // Catch any unexpected errors (network failures, etc.)
        console.error('Unexpected error during voice generation:', error);
        showPopup('Audio generation failed. Please try again later.');
        
        // Keep fallback audio player visible
        initializeAudioPlayer();
    } finally {
        setButtonLoading(voiceBtn, false);
    }
}

/**
 * Toggle play/pause for audio
 */
function togglePlayPause() {
    if (!audioElement) {
        showPopup('Audio not available');
        return;
    }
    
    if (audioElement.paused) {
        audioElement.play().catch(err => {
            console.error('Playback failed:', err);
            showPopup('Playback failed. Please try again.');
        });
    } else {
        audioElement.pause();
    }
}

/**
 * Stop audio playback and reset to beginning
 */
function stopAudio() {
    if (!audioElement) return;
    
    audioElement.pause();
    audioElement.currentTime = 0;
    isPlaying = false;
    audioProgress = 0;
    updateProgressBar();
    updateAudioStatus();
}

// Convert base64 to Blob
function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

// Event Listeners
generateBtn.addEventListener('click', generateStory);
voiceBtn.addEventListener('click', generateVoice);
playBtn.addEventListener('click', togglePlayPause);
stopBtn.addEventListener('click', stopAudio);

// Allow Enter key in textarea to generate story (Ctrl+Enter)
storyIdeaInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        generateStory();
    }
});

console.log('🎭 Story Generator App Loaded');
