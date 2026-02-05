import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function scrapeSunbizLinks() {
    console.log("🔍 AUDITING SUNBIZ PORTAL STRUCTURE...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://efile.sunbiz.org/corp_ss_llc_menu.html', { waitUntil: 'networkidle' });
        console.log("Redirected to:", page.url());
        
        const frames = page.frames();
        console.log(`\nDetected ${frames.length} frames.`);
        
        for (const frame of frames) {
            console.log(`\nFrame: ${frame.name()} (${frame.url()})`);
            const frameLinks = await frame.evaluate(() => {
                return Array.from(document.querySelectorAll('a')).map(a => ({
                    text: a.innerText.trim(),
                    href: a.href
                })).filter(a => a.text.length > 5);
            });
            console.log("Links in this frame:");
            frameLinks.forEach(l => console.log(`  - [${l.text}] -> ${l.href}`));
            
            const forms = await frame.evaluate(() => {
                return Array.from(document.querySelectorAll('form')).map(f => ({
                    action: f.action,
                    method: f.method
                }));
            });
            if (forms.length > 0) {
                console.log("Forms in this frame:");
                forms.forEach(f => console.log(`  - ${f.method} -> ${f.action}`));
            }
        }
        
        const html = await page.content();
        writeFileSync('automation/sunbiz-snapshot.html', html);
        await page.screenshot({ path: 'automation/sunbiz-snapshot.png', fullPage: true });
        console.log("\nSnapshot saved to automation/sunbiz-snapshot.html and automation/sunbiz-snapshot.png");
        
    } catch (err) {
        console.error("Scrape Failed:", err);
    } finally {
        await browser.close();
    }
}

scrapeSunbizLinks();
