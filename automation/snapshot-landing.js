const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewportSize({ width: 1280, height: 1200 });
  
  console.log('Navigating to landing page...');
  await page.goto('http://localhost:8000/');
  
  // Wait for fonts/styles
  await page.waitForLoadState('networkidle');
  
  console.log('Taking snapshot of Product Section...');
  // Locate the product section
  const products = page.locator('.products');
  await products.scrollIntoViewIfNeeded();
  
  await products.screenshot({ path: 'landing-products-proof.png' });
  
  console.log('SUCCESS: Snapshot saved to landing-products-proof.png');
  
  await browser.close();
})();
