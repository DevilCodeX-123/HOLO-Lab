import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER_ERROR:', error));
    page.on('requestfailed', request => console.log('BROWSER_REQUEST_FAILED:', request.url(), request.failure().errorText));

    await page.goto('http://localhost:4173', { waitUntil: 'load', timeout: 15000 });
    
    // Wait a couple seconds to see if React crashes after load
    await new Promise(r => setTimeout(r, 2000));
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    if (!bodyHTML.includes('canvas-container')) {
      console.log('DOM is missing core app elements!');
    } else {
      console.log('Core elements found in DOM.');
    }
    
    await browser.close();
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  }
})();
