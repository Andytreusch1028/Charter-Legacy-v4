import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SELECTORS = JSON.parse(readFileSync('./automation/selectors/sunbiz.v1.json', 'utf8'));

/**
 * Performs a name search on Sunbiz and returns a list of matching/similar entity names.
 */
export async function lookupSunbizNames(searchTerm) {
    console.log(`[SUNBIZ LOOKUP] Searching for: "${searchTerm}"`);

    const browser = await chromium.launch({
        headless: process.env.HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Charter Legacy Scrivener Bot v5.6'
    });

    const page = await context.newPage();
    const results = [];

    try {
        const config = SELECTORS.protocols.name_search;
        await page.goto(config.url, { waitUntil: 'networkidle' });

        // Fill search term and submit
        await page.fill(config.fields.searchTerm, searchTerm);
        await page.click(config.fields.submit);
        await page.waitForLoadState('networkidle');

        // Check for "No records found"
        const noResults = await page.isVisible(config.results.noResults);
        if (noResults) {
            console.log('[SUNBIZ LOOKUP] No records found.');
            return [];
        }

        // Extract names from result table
        // The results table usually has names in a specific column
        // We capture the top 10-15 results for similarity checking
        const rows = await page.$$(config.results.rows);
        for (let i = 0; i < Math.min(rows.length, 20); i++) {
            const name = await rows[i].$eval('td:first-child', el => el.innerText.trim());
            if (name && name !== 'Entity Name') {
                results.push(name);
            }
        }

        console.log(`[SUNBIZ LOOKUP] Found ${results.length} related entities.`);
        return results;

    } catch (err) {
        console.error('[SUNBIZ LOOKUP] Error:', err.message);
        throw err;
    } finally {
        await browser.close();
    }
}

// CLI execution support
if (process.argv[1].endsWith('sunbiz-lookup.js')) {
    const term = process.argv[2] || 'Charter Legacy';
    lookupSunbizNames(term).then(res => {
        console.log('Results:', JSON.stringify(res, null, 2));
    });
}
