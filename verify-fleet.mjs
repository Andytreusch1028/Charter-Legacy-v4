import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('http://localhost:8080/app/obsidian-zenith.html');
        await page.waitForTimeout(2000); 

        // Capture Initial State (CL - RA Offline)
        await page.screenshot({ path: path.join(__dirname, 'ra_envy_offline.png') });
        console.log('Initial capture saved (Offline).');

        // Click on OV (Obsidian Ventures - RA Active)
        const nodes = await page.$$('.fleet-node');
        if (nodes.length > 1) {
            await nodes[1].click();
            await page.waitForTimeout(1000);
            
            // Capture Switched State
            await page.screenshot({ path: path.join(__dirname, 'ra_envy_active.png') });
            console.log('Active capture saved.');
        }

        await browser.close();
    } catch (err) {
        console.error('Error during verification:', err);
    }
})();
