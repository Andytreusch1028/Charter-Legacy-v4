import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    const browser = await chromium.launch();
    // Simulate Mobile Viewport
    const page = await browser.newPage({
        viewport: { width: 400, height: 800 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    });

    try {
        console.log('Navigating to RA Portal (Mobile)...');
        await page.goto('http://localhost:8080/app/portals/ra-portal.html');
        await page.waitForTimeout(1000);
        
        console.log('Capturing Mobile Pulse State...');
        await page.screenshot({ path: path.join(__dirname, 'ra_mobile_view.png') });
        console.log('Mobile capture saved.');

    } catch (error) {
        console.error('Mobile verification failed:', error);
    } finally {
        await browser.close();
    }
})();

