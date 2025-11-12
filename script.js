// URL patterns for different platforms
const PLATFORM_PATTERNS = {
    youtube: [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
    ],
    facebook: [
        /(?:https?:\/\/)?(?:www\.)?facebook\.com\/.*\/videos\/([0-9]+)/,
        /(?:https?:\/\/)?(?:www\.)?facebook\.com\/watch\/?\?v=([0-9]+)/,
        /(?:https?:\/\/)?(?:www\.)?fb\.watch\/([a-zA-Z0-9_-]+)/
    ],
    twitter: [
        /(?:https?:\/\/)?(?:www\.)?twitter\.com\/\w+\/status\/([0-9]+)/,
        /(?:https?:\/\/)?(?:www\.)?x\.com\/\w+\/status\/([0-9]+)/
    ]
};

// API configuration
// Using Cobalt API for video downloads (free, no API key required)
// By default the direct API endpoint is used. If you get CORS errors when
// testing locally, set PROXY_URL to a server you control that forwards the
// request to the Cobalt API (see server/proxy.js in this repo for an example).
const API_ENDPOINTS = {
    cobalt: 'https://api.cobalt.tools/api/json'
};

// Optional: prepend this proxy URL to the API endpoint. If empty, the app will
// call the API directly which may be blocked by CORS when run from some origins.
// Example: const PROXY_URL = 'http://localhost:3000/proxy';
// Auto-detect a common local dev setup: if you're loading the page from
// `localhost` or `127.0.0.1` and you have the included proxy running, we'll
// default to it so you don't have to edit this file manually.
let PROXY_URL = '';
try {
    const host = (typeof location !== 'undefined' && location.hostname) || '';
    if (host === 'localhost' || host === '127.0.0.1') {
        PROXY_URL = 'http://localhost:3000/proxy';
        console.info('Using local proxy at', PROXY_URL);
    }
} catch (e) {
    // ignore (e.g., running in non-browser context)
}

/**
 * Detect which platform the URL belongs to
 */
function detectPlatform(url) {
    for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(url)) {
                return platform;
            }
        }
    }
    return null;
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Show message to user
 */
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');
}

/**
 * Hide message
 */
function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.classList.add('hidden');
}

/**
 * Fetch video download URL from Cobalt API
 */
async function fetchDownloadUrl(url) {
    try {
        const endpoint = PROXY_URL ? `${PROXY_URL}` : API_ENDPOINTS.cobalt;

        // Try to call the endpoint. If CORS preflight fails the browser will
        // throw a TypeError. We detect this and surface a helpful message.
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                vCodec: 'h264',
                vQuality: '720',
                aFormat: 'mp3',
                filenamePattern: 'classic',
                isAudioOnly: false
            })
        });

        if (!response.ok) {
            // Non-2xx from server - bubble useful status
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        // Common failure modes:
        // - TypeError: Failed to fetch (usually network or CORS/preflight failure)
        // - HTTP error thrown above
        console.error('Error fetching download URL:', error);

        // Enrich network/CORS errors with actionable guidance.
        if (error instanceof TypeError || /Failed to fetch|NetworkError/i.test(String(error))) {
            // Create a friendly Error with guidance for the UI to show
            const guidance = `Network/CORS error when calling ${PROXY_URL || API_ENDPOINTS.cobalt}. ` +
                `Browsers block cross-origin requests unless the server sets CORS headers. ` +
                `To test locally either: (1) run the included local proxy at http://localhost:3000 (see README), ` +
                `(2) deploy this site to a public host (GitHub Pages) or (3) have the API enable CORS for your origin.`;
            const wrapped = new Error(guidance + ` Original: ${error.message || error}`);
            wrapped.cause = error;
            throw wrapped;
        }

        throw error;
    }
}

/**
 * Show download options with direct download link
 */
function showDownloadOptions(downloadData, platform) {
    const optionsDiv = document.getElementById('downloadOptions');
    
    let content = `
        <h3>📥 Download Ready</h3>
        <p style="margin-bottom: 15px; color: #666;">Your video is ready to download:</p>
    `;
    
    // Handle different response formats from Cobalt API
    if (downloadData.status === 'redirect' || downloadData.status === 'stream') {
        const downloadUrl = downloadData.url;
        content += `
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">🎬 ${platform.charAt(0).toUpperCase() + platform.slice(1)} Video</div>
                    <div class="quality-size">Click to download</div>
                </div>
                <a href="${downloadUrl}" target="_blank" class="download-link" download>Download</a>
            </div>
        `;
    } else if (downloadData.status === 'picker') {
        // Multiple files available (e.g., Twitter with images)
        content += `<p style="margin-bottom: 10px; color: #666;">Multiple media files available:</p>`;
        downloadData.picker.forEach((item, index) => {
            content += `
                <div class="quality-option">
                    <div class="quality-info">
                        <div class="quality-label">🎬 Media ${index + 1}</div>
                        <div class="quality-size">${item.type || 'Video'}</div>
                    </div>
                    <a href="${item.url}" target="_blank" class="download-link" download>Download</a>
                </div>
            `;
        });
    } else {
        // Fallback for unexpected response
        content += `
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">⚠️ Download Available</div>
                    <div class="quality-size">Response format may vary</div>
                </div>
            </div>
        `;
    }
    
    optionsDiv.innerHTML = content;
    optionsDiv.classList.remove('hidden');
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
    for (const pattern of PLATFORM_PATTERNS.youtube) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

/**
 * Hide download options
 */
function hideDownloadOptions() {
    const optionsDiv = document.getElementById('downloadOptions');
    optionsDiv.classList.add('hidden');
}

/**
 * Main download handler
 */
async function handleDownload() {
    const urlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const url = urlInput.value.trim();
    
    // Clear previous results
    hideMessage();
    hideDownloadOptions();
    
    // Validate input
    if (!url) {
        showMessage('❌ Please enter a video URL', 'error');
        return;
    }
    
    if (!isValidUrl(url)) {
        showMessage('❌ Please enter a valid URL', 'error');
        return;
    }
    
    // Detect platform
    const platform = detectPlatform(url);
    
    if (!platform) {
        showMessage('❌ URL not recognized. Please enter a valid YouTube, Facebook, or Twitter video URL.', 'error');
        return;
    }
    
    // Show loading state
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = 'Processing<span class="spinner"></span>';
    
    try {
        // Fetch download URL from API
        const downloadData = await fetchDownloadUrl(url);
        
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Video';
        
        if (downloadData.status === 'error') {
            showMessage(`❌ Error: ${downloadData.text || 'Unable to process this video. Please try another URL.'}`, 'error');
            return;
        }
        
        showMessage(`✅ Video ready! Click the download button below.`, 'success');
        showDownloadOptions(downloadData, platform);
        
        // Scroll to download options
        document.getElementById('downloadOptions').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    } catch (error) {
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Video';
        
        showMessage(`❌ Failed to process video: ${error.message}. Please try again.`, 'error');
        console.error('Download error:', error);
    }
}

/**
 * Allow Enter key to trigger download
 */
document.addEventListener('DOMContentLoaded', function() {
    const urlInput = document.getElementById('videoUrl');
    
    urlInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleDownload();
        }
    });
    
    // Clear message when user starts typing
    urlInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            hideMessage();
            hideDownloadOptions();
        }
    });
});
