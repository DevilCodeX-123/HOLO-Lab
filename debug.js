const http = require('http');
const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    
    const errors = [];
    const logs = [];
    
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      logs.push(text);
      console.log('LOG:', text);
    });
    
    page.on('pageerror', err => {
      errors.push(err.message);
      console.log('PAGE ERROR:', err.message);
    });

    page.on('requestfailed', req => {
      console.log('FAILED REQUEST:', req.url(), '-', req.failure()?.errorText);
    });
    
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(5000);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('BODY TEXT (first 500 chars):', bodyText.substring(0, 500));
    
    const rootHTML = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 500));
    console.log('ROOT HTML (first 500 chars):', rootHTML);

    console.log('\n=== SUMMARY ===');
    console.log('Errors:', errors.length ? errors : 'NONE');
    console.log('Console logs:', logs.length);
    
    await browser.close();
  } catch (err) {
    console.error('Script error:', err.message);
    if (browser) await browser.close();
  }
})();
