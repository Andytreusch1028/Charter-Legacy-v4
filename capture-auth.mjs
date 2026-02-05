import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('http://localhost:8080/app/auth.html');
        await page.screenshot({ path: path.join(__dirname, 'auth_screen_capture.png') });
        console.log('Screenshot saved to auth_screen_capture.png');
        await browser.close();
    } catch (err) {
        console.error('Error during capture:', err);
    }
})();
