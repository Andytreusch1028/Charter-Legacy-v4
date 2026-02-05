import { chromium } from 'playwright';

async function discoverEfilingUrl() {
    console.log("🕵️ DISCOVERING LIVE E-FILING URL...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        // Start from root e-file hub
        await page.goto('https://efile.sunbiz.org/', { waitUntil: 'networkidle' });
        console.log("Landed on:", page.url());
        
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.innerText.trim(),
                href: a.href
            })).filter(a => a.text.length > 2);
        });
        
        console.log("\nALL E-Filing Links:");
        links.forEach(l => console.log(`- [${l.text}] -> ${l.href}`));

        if (links.length > 0) {
            const target = links[0].href;
            console.log(`\nTesting target: ${target}`);
            await page.goto(target, { waitUntil: 'networkidle' });
            console.log("Final URL after testing:", page.url());
            
            const content = await page.content();
            if (content.includes('Articles of Organization')) {
                console.log("✨ SUCCESS: Found the Holy Grail.");
            } else {
                console.log("❌ Target does not seem to be the form.");
            }
        }
        
    } catch (err) {
        console.error("Discovery Failed:", err);
    } finally {
        await browser.close();
    }
}

discoverEfilingUrl();
