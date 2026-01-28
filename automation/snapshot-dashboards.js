const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewportSize({ width: 1280, height: 1200 });
  
  // 1. Dashboard LLC
  console.log('Navigating to LLC Dashboard...');
  await page.goto('http://localhost:8080/app/dashboard-llc.html');
  await page.waitForLoadState('networkidle');
  console.log('Taking snapshot of LLC Dashboard...');
  await page.screenshot({ path: 'dashboard-llc-proof.png', fullPage: true });
  
  // 2. Dashboard Will
  console.log('Navigating to Will Dashboard...');
  await page.goto('http://localhost:8080/app/dashboard-will.html');
  await page.waitForLoadState('networkidle');
  console.log('Taking snapshot of Will Dashboard...');
  await page.screenshot({ path: 'dashboard-will-proof.png', fullPage: true });
  
  console.log('SUCCESS: Snapshots saved to root directory.');
  
  await browser.close();
})();
