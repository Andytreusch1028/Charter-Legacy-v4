import { chromium } from 'playwright';
import path from 'path';

async function run() {
    console.log("🚀 Starting Direct Browser Verification...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    
    try {
        console.log("🔗 Navigating to Staff Console...");
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
        
        // Wait for System Hub to render
        await page.waitForSelector('.system-hub-sector', { timeout: 10000 });
        
        const screenshotPath = path.resolve('c:/Users/imali/.gemini/antigravity/brain/61e6bb76-0e2e-4d3f-a37b-358615a9b7c1/verified_system_hub.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        console.log(`✅ Screenshot captured at: ${screenshotPath}`);
        console.log(`📑 Page Title: ${await page.title()}`);
        
    } catch (err) {
        console.error("❌ CAPTURE FAILURE:", err);
    } finally {
        await browser.close();
    }
}

run();
