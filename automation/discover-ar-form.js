import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';

async function probeSubForms() {
    const docNumber = 'L22000213714';
    const url = 'https://services.sunbiz.org/Filings/AnnualReport/FilingStart';
    
    console.log(`🔍 PROBING SUB-FORMS FOR: ${docNumber}`);
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.fill('#DocumentId', docNumber);
        await page.click('input[type="submit"][value="Submit"]');
        await page.waitForLoadState('networkidle');
        
        const subForms = [
            { label: 'PrincipalAddress', selector: 'input[value="Edit Principal Address"]' },
            { label: 'MailingAddress', selector: 'input[value="Edit Mailing Address"]' },
            { label: 'Agent', selector: 'input[value="Edit Agent / Signature"]' },
            { label: 'NewManager', selector: 'input[value*="Add New Manager"]' }
        ];
        
        const allFields = {};
        
        for (const sub of subForms) {
            console.log(`- Clicking ${sub.label}...`);
            await page.click(sub.selector);
            await page.waitForLoadState('networkidle');
            
            const fields = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
                    tag: i.tagName,
                    type: i.type,
                    name: i.name,
                    id: i.id,
                    value: i.value,
                    label: i.labels?.[0]?.innerText || i.placeholder || ''
                }));
            });
            
            allFields[sub.label] = fields;
            
            // Go back to the main form
            await page.goBack();
            await page.waitForLoadState('networkidle');
        }
        
        writeFileSync('automation/ar-subforms-discovery.json', JSON.stringify(allFields, null, 2));
        console.log('📁 Sub-form discovery data saved.');
        
    } catch (err) {
        console.error('❌ Probing Error:', err);
    } finally {
        await browser.close();
    }
}

probeSubForms();
