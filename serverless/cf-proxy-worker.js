// Cloudflare Worker to proxy requests to https://api.cobalt.tools/api/json
// Deployable to Cloudflare Workers (free tier) and used to avoid CORS from GitHub Pages.

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Only POST allowed', { status: 405 });
  }

  try {
    const body = await request.text();

    const resp = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body
    });

    const contentType = resp.headers.get('content-type') || 'text/plain';
    const responseBody = await resp.arrayBuffer();

    return new Response(responseBody, {
      status: resp.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', text: 'Worker proxy error' , message: String(err)}), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
