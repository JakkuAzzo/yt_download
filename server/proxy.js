// Simple proxy to forward requests to https://api.cobalt.tools/api/json
// Usage: node proxy.js
// For development only. Do not expose this to untrusted traffic without
// proper rate-limiting and authentication.

const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/proxy', async (req, res) => {
  try {
    console.log('Proxy received request body:', JSON.stringify(req.body));
    const targetUrl = 'https://api.cobalt.tools/api/json';
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    const contentType = response.headers.get('content-type') || 'text/plain';

    console.log(`Remote API responded with status=${response.status} content-type=${contentType}`);
    console.log('Remote API response body:', text);

    // Mirror response status, content-type and body (and allow CORS for dev)
    res.status(response.status).set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Content-Type': contentType
    }).send(text);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ status: 'error', text: 'Proxy error' });
  }
});

// Preflight handler
app.options('/proxy', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept'
  }).sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
