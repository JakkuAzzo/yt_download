const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Mock the remote API response so tests don't require network or proxy
  await page.route('https://api.cobalt.tools/api/json', async route => {
    const mock = {
      status: 'redirect',
      url: 'https://cdn.example/video.mp4'
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mock)
    });
  });

  const fileUrl = 'file://' + path.resolve(__dirname, '..', 'index.html');
  console.log('Opening', fileUrl);
  await page.goto(fileUrl);

  // Fill input and click
  await page.fill('#videoUrl', 'https://youtu.be/KiPCIoqWAOI');
  await page.click('#downloadBtn');

  // Wait for the download link to appear
  try {
    await page.waitForSelector('#downloadOptions .download-link', { timeout: 5000 });
    const href = await page.getAttribute('#downloadOptions .download-link', 'href');
    console.log('Found download link:', href);

    if (href === 'https://cdn.example/video.mp4') {
      console.log('E2E test passed');
      await browser.close();
      process.exit(0);
    } else {
      console.error('Unexpected download URL');
      await browser.close();
      process.exit(2);
    }
  } catch (err) {
    console.error('Test failed:', err);
    await browser.close();
    process.exit(1);
  }
})();
