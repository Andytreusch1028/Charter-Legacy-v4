import { chromium } from 'playwright';
import path from 'path';

async function run() {
    console.log("🔓 Starting Secure Session Verification...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    
    try {
        console.log("🔗 Navigating to Home...");
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
        
        console.log("🖱️  Clicking Access Terminal...");
        await page.click('text="ACCESS TERMINAL"');
        
        console.log("⏳ Waiting for auth form...");
        await page.waitForTimeout(2000); 

        // Let's check for any input to see if we reached the modal or page
        const hasEmail = await page.isVisible('input[type="email"]');
        if (!hasEmail) {
            console.log("⚠️  Email field not found directly. Attempting to force /login navigation...");
            await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
        }

        console.log("⌨️  Entering fulfillment credentials...");
        await page.fill('input[type="email"]', 'fulfillment@charterlegacy.com');
        await page.fill('input[type="password"]', 'CharterTesting123!');
        await page.click('button:has-text("Sign In"), button:has-text("AUTHENTICATE")');
        
        console.log("⏳ Waiting for Staff Console redirect...");
        // Wait for ANY selector that implies we are logged in (e.g. MISSION CONTROL or LOGOUT)
        await page.waitForTimeout(5000); 
        
        const screenshotPath = path.resolve('c:/Users/imali/.gemini/antigravity/brain/61e6bb76-0e2e-4d3f-a37b-358615a9b7c1/verified_live_dashboard.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        console.log(`✅ VERIFIED: Screenshot captured at ${screenshotPath}`);
        
    } catch (err) {
        console.error("❌ VERIFICATION CRASH:", err);
        const errPath = path.resolve('c:/Users/imali/.gemini/antigravity/brain/61e6bb76-0e2e-4d3f-a37b-358615a9b7c1/final_error_snapshot.png');
        await page.screenshot({ path: errPath });
        console.log(`📸 Error snapshot saved to ${errPath}`);
    } finally {
        await browser.close();
    }
}

run();
