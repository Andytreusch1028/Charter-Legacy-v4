import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    try {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto('http://localhost:8080/app/dashboards/obsidian-zenith.html');
        await page.waitForTimeout(2000); 

        // Capture Initial State (CL - RA Offline / Privacy Exposed)
        await page.screenshot({ path: path.join(__dirname, 'privacy_exposed.png') });
        console.log('Initial capture saved (Exposed).');

        // Click on OV (Obsidian Ventures - RA Active / Fully Protected)
        const nodes = await page.$$('.fleet-node');
        if (nodes.length > 1) {
            await nodes[1].click();
            await page.waitForTimeout(1000);
            
            // Capture Switched State
            await page.screenshot({ path: path.join(__dirname, 'privacy_protected.png') });
            console.log('Active capture saved (Protected).');

            // Click RA Node to Enter Portal
            const raNode = await page.$('.stat-value[title="View Process"]');
            if (raNode) {
                await raNode.click();
                await page.waitForTimeout(2000);
                await page.screenshot({ path: path.join(__dirname, 'ra_portal_feed_enhanced.png') });
                console.log('Portal capture saved.');
                
                // Verify Vault List Exists
                const vaultItems = await page.$$('.vault-collection div');
                if (vaultItems.length > 0) console.log('Vault List Verified.');

                // Verify Guarded Address Widget
                const addressWidget = await page.$('#copyAddressBtn');
                if (addressWidget) console.log('Guarded Address Widget Verified.');
            }
        }

        await browser.close();
    } catch (err) {
        console.error('Error during verification:', err);
    }
})();

