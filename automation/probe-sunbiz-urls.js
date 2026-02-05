import { chromium } from 'playwright';

const URLS = [
    'https://efile.sunbiz.org/llc_menu.html',
    'https://efile.sunbiz.org/llc_file.html',
    'https://efile.sunbiz.org/llc_initial.html',
    'https://efile.sunbiz.org/corp_llc_menu.html',
    'https://efile.sunbiz.org/llc_acknowledgement.html'
];

async function probeUrls() {
    console.log("📡 PROBING STATUTORY ENDPOINTS...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    for (const url of URLS) {
        try {
            console.log(`\nTesting: ${url}`);
            const response = await page.goto(url, { waitUntil: 'load', timeout: 10000 });
            console.log(`Status: ${response.status()}`);
            if (response.status() === 200) {
                const title = await page.title();
                console.log(`Title: ${title}`);
                if (!title.includes('404')) {
                    console.log("📍 LIVE ENDPOINT FOUND!");
                }
            }
        } catch (err) {
            console.log(`Failed: ${err.message}`);
        }
    }
    
    await browser.close();
}

probeUrls();
