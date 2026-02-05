const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/app/auth.html');
    await page.screenshot({ path: path.join(__dirname, 'auth_screen_capture.png') });
    console.log('Screenshot saved to auth_screen_capture.png');
    await browser.close();
})();
