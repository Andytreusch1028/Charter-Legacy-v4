const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:5175');
  
  try {
     await page.waitForTimeout(2000);
     // The button in Landing.jsx is "Open Dashboard" OR "Client Login". Wait for it.
     const btn = await page.getByRole('button', { name: /Open Dashboard|Client Login/i }).first();
     if (btn) await btn.click();
     
     await page.waitForTimeout(3000);
     await page.screenshot({ path: 'dashboard.png', fullPage: true });
     console.log('Saved dashboard.png');
  } catch (e) {
     console.error(e);
     await page.screenshot({ path: 'dashboard_error.png', fullPage: true });
  }
  
  await browser.close();
})();
