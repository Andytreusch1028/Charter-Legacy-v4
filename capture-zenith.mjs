import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        // Use the actual Zenith console path
        await page.goto('http://localhost:8080/app/dashboards/obsidian-zenith.html');
        // Wait for dynamic rendering if needed
        await page.waitForTimeout(2000); 
        await page.screenshot({ path: path.join(__dirname, 'zenith_console_capture.png') });
        console.log('Screenshot saved to zenith_console_capture.png');
        await browser.close();
    } catch (err) {
        console.error('Error during capture:', err);
    }
})();

