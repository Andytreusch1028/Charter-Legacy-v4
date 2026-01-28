const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:8080/app/dashboard-llc.html');
  
  console.log('Taking screenshot...');
  // Ensure the directory exists or just save to current dir
  await page.screenshot({ path: 'local-test-screenshot.png' });
  
  console.log('SUCCESS: Browser automation is working on your machine.');
  
  await browser.close();
})();
