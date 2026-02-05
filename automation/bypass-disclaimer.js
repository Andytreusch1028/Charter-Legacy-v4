import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function bypassDisclaimer() {
    console.log("🔓 BYPASSING SUNBIZ DISCLAIMER...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://efile.sunbiz.org/llc_file.html', { waitUntil: 'networkidle' });
        console.log("Landed on Disclaimer Page.");
        
        // Check the disclaimer checkbox (Sunbiz usually has one)
        // Based on the 'names' list: ['filing_type', 'Disclaimer', 'submit', ...]
        await page.check('input[name="Disclaimer"]');
        console.log("Disclaimer Checked.");
        
        // Wait for it to be stable
        await page.waitForTimeout(1000);
        
        // Click submit to enter the actual form
        await page.click('input[type="submit"][name="submit"]');
        console.log("Submit Clicked. Awaiting next page...");
        
        await page.waitForLoadState('networkidle');
        console.log("Landed on Final Form:", page.url());
        
        const names = await page.evaluate(() => Array.from(document.querySelectorAll('input, select, textarea')).map(i => ({
            tag: i.tagName,
            name: i.name,
            type: i.type,
            id: i.id
        })));
        
        console.log("\nForm Fields:");
        names.forEach(n => console.log(`- ${n.tag}[name='${n.name}'] (ID: ${n.id}, Type: ${n.type})`));
        
        const html = await page.content();
        writeFileSync('automation/sunbiz-final-form.html', html);
        await page.screenshot({ path: 'automation/sunbiz-final-form.png', fullPage: true });
        
    } catch (err) {
        console.error("Bypass Failed:", err);
    } finally {
        await browser.close();
    }
}

bypassDisclaimer();
