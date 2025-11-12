# 🎬 Video Downloader

A simple and elegant GitHub Pages website for downloading videos from YouTube, Facebook, and Twitter.

## 🌟 Features

- **Multi-Platform Support**: Download videos from YouTube, Facebook, and Twitter/X
- **User-Friendly Interface**: Clean and modern design with easy-to-use controls
- **Direct Download Links**: Get a single direct download link using free Cobalt API
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **No Installation Required**: Pure client-side web application
- **No API Key Required**: Uses free, publicly available API

## 🚀 Live Demo

Visit the live website: [https://jakkuazzo.github.io/yt_download/](https://jakkuazzo.github.io/yt_download/)

## 📋 How to Use

1. Copy the video URL from YouTube, Facebook, or Twitter
2. Paste the URL into the input field on the website
3. Click the "Download Video" button
4. Wait for the video to be processed via the API
5. Click the direct download link to save the video to your device

## 🎯 Supported Platforms

### YouTube
- Standard video URLs (youtube.com/watch)
- Short URLs (youtu.be)
- Embed URLs (youtube.com/embed)
- YouTube Shorts (youtube.com/shorts)

### Facebook
- Video posts (facebook.com/videos)
- Watch URLs (facebook.com/watch)
- Short URLs (fb.watch)

### Twitter/X
- Tweet video URLs (twitter.com/status)
- New X platform URLs (x.com/status)

## 🛠️ Technical Details

This is a static website built with:
- Pure HTML5
- CSS3 with modern features (Grid, Flexbox, Animations)
- Vanilla JavaScript (no frameworks required)
- Responsive design principles
- Cobalt.tools API for video processing and download link generation

The website uses the free Cobalt API (https://api.cobalt.tools) to process video URLs and generate direct download links, eliminating the need for users to navigate to third-party websites.

## 📝 Local Development

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/JakkuAzzo/yt_download.git
   cd yt_download
   ```

2. Open `index.html` in your web browser, or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

3. Navigate to `http://localhost:8000` in your browser

### CORS Considerations

When testing locally, you may encounter CORS (Cross-Origin Resource Sharing) restrictions from the Cobalt API. This is normal browser security behavior. The application works correctly when deployed to GitHub Pages or other public hosting services where the API's CORS policy allows requests.

### Troubleshooting / Running a Local Proxy

If you see errors like "Failed to fetch" or CORS preflight failures in the browser console, you can run a small local proxy that forwards requests to the Cobalt API and adds permissive CORS headers for development.

1. Install dependencies and start the proxy:

```bash
cd server
npm install
npm start
```

2. In `script.js` set `PROXY_URL` to `http://localhost:3000/proxy` and reload the page.

Notes:
- This proxy is for local development only. Do not deploy it publicly without adding authentication and rate-limiting.
- Alternatively, deploy a serverless proxy (Cloudflare Worker, Netlify function) that forwards requests to `https://api.cobalt.tools/api/json` and sets appropriate CORS headers.

### Deploy a small Cloudflare Worker proxy (recommended)

If you want a simple, hosted proxy so your GitHub Pages site can call the API without CORS issues, deploy the included Cloudflare Worker in `serverless/cf-proxy-worker.js`.

1. Install Wrangler (Cloudflare's CLI) and login:

```bash
npm install -g wrangler
wrangler login
```

2. Create a Worker project and copy `serverless/cf-proxy-worker.js` into it, or deploy directly with Wrangler:

```bash
# from repo root
wrangler publish serverless/cf-proxy-worker.js --name yt-download-proxy
```

3. Update `script.js` to use your worker URL (for example `https://yt-download-proxy.your-subdomain.workers.dev`) as `PROXY_URL`.

Security note: the Worker simply forwards requests and sets CORS headers. Protect it with rate limits or restrict origins if you plan to use it publicly.

### Automated deployment via GitHub Actions

If you'd like the Cloudflare Worker deployed automatically when you push to `main`, add the following repository secrets in GitHub:

- `CF_API_TOKEN` — a Cloudflare API token with "Account" > "Workers Scripts" permission.
- `CF_WORKER_NAME` — the desired worker name (for example `yt-download-proxy`).

Once those are set, the workflow `.github/workflows/deploy-cloudflare-worker.yml` will publish `serverless/cf-proxy-worker.js` to Cloudflare on each push to `main`.

After the worker is published, set `PROXY_URL` in `yt_download/script.js` to your worker URL, e.g.:

```javascript
const PROXY_URL = 'https://yt-download-proxy.your-subdomain.workers.dev/proxy';
```

Note: the worker script already handles CORS and forwards POST bodies to `https://api.cobalt.tools/api/json`.
## ⚠️ Important Notes

- **Copyright**: Users are responsible for ensuring they have the right to download and use video content
- **Terms of Service**: Respect the terms of service of YouTube, Facebook, and Twitter
- **Personal Use**: This tool is intended for personal, non-commercial use only
- **Legal Compliance**: Always comply with copyright laws and intellectual property rights

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is provided as-is for educational and personal use.

## 🙏 Acknowledgments

- Thanks to all the third-party download services that make video downloading possible
- Built with ❤️ for easy video downloading