import { chromium } from 'playwright';

(async () => {
  let browser;
  try {
    console.log('Attempting to launch chromium...');
    browser = await chromium.launch({ headless: true });
    console.log('Chromium launched successfully.');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { timeout: 30000 });
    
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    if (title.toLowerCase().includes('charter legacy')) {
      console.log('SUCCESS: Diagnostic passed.');
    } else {
      console.log('FAILURE: Title does not match.');
    }
  } catch (error) {
    console.error('DIAGNOSTIC FAILURE:', error.message);
    if (error.message.includes('executable')) {
      console.log('TIP: Try running `npx playwright install chromium`');
    }
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
})();
