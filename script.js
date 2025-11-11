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

// API endpoints (using public third-party services)
const API_ENDPOINTS = {
    youtube: 'https://www.y2mate.com/mates/analyzeV2/ajax',
    // Note: These are example endpoints. In production, you'd need to use actual working APIs
    facebook: 'https://www.getfvid.com/downloader',
    twitter: 'https://twitsave.com/info'
};

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
 * Show download options
 */
function showDownloadOptions(platform, url) {
    const optionsDiv = document.getElementById('downloadOptions');
    
    let content = `
        <h3>📥 Download Options for ${platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
        <p style="margin-bottom: 15px; color: #666;">Click a link below to download the video:</p>
    `;
    
    if (platform === 'youtube') {
        const videoId = extractYouTubeId(url);
        content += `
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">🎬 Open in Y2Mate</div>
                    <div class="quality-size">Download in various qualities</div>
                </div>
                <a href="https://www.y2mate.com/youtube/${videoId}" target="_blank" class="download-link">Open</a>
            </div>
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">🎬 Open in SaveFrom.net</div>
                    <div class="quality-size">Alternative downloader</div>
                </div>
                <a href="https://en.savefrom.net/#url=${encodeURIComponent(url)}" target="_blank" class="download-link">Open</a>
            </div>
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">🎬 Open in YT1s</div>
                    <div class="quality-size">Fast and simple</div>
                </div>
                <a href="https://yt1s.com/en/youtube-to-mp4?q=${encodeURIComponent(url)}" target="_blank" class="download-link">Open</a>
            </div>
        `;
    } else if (platform === 'facebook') {
        content += `
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">📘 Open in GetFVid</div>
                    <div class="quality-size">Download Facebook videos</div>
                </div>
                <a href="https://www.getfvid.com/downloader?url=${encodeURIComponent(url)}" target="_blank" class="download-link">Open</a>
            </div>
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">📘 Open in FBDown</div>
                    <div class="quality-size">Alternative downloader</div>
                </div>
                <a href="https://fbdownloader.net/?url=${encodeURIComponent(url)}" target="_blank" class="download-link">Open</a>
            </div>
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">📘 Open in SnapSave</div>
                    <div class="quality-size">Fast Facebook downloader</div>
                </div>
                <a href="https://snapsave.io/facebook-video-downloader?url=${encodeURIComponent(url)}" target="_blank" class="download-link">Open</a>
            </div>
        `;
    } else if (platform === 'twitter') {
        content += `
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">🐦 Open in Twitter Video Downloader</div>
                    <div class="quality-size">Download Twitter/X videos</div>
                </div>
                <a href="https://twittervideodownloader.com/?url=${encodeURIComponent(url)}" target="_blank" class="download-link">Open</a>
            </div>
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">🐦 Open in SaveTweet</div>
                    <div class="quality-size">Alternative downloader</div>
                </div>
                <a href="https://www.savetweetvid.com/downloader?url=${encodeURIComponent(url)}" target="_blank" class="download-link">Open</a>
            </div>
            <div class="quality-option">
                <div class="quality-info">
                    <div class="quality-label">🐦 Open in TWDown</div>
                    <div class="quality-size">Fast Twitter downloader</div>
                </div>
                <a href="https://twdown.net/?url=${encodeURIComponent(url)}" target="_blank" class="download-link">Open</a>
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
function handleDownload() {
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
    
    // Simulate processing delay (in real implementation, this would be an API call)
    setTimeout(() => {
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Video';
        
        showMessage(`✅ ${platform.charAt(0).toUpperCase() + platform.slice(1)} video detected! Choose a download option below.`, 'success');
        showDownloadOptions(platform, url);
        
        // Scroll to download options
        document.getElementById('downloadOptions').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 800);
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
