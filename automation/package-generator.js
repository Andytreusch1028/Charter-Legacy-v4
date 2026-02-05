import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * SOVEREIGN DOCUMENT SYNTHESIS
 * Merges LLC data with statutory templates to create print-ready artifacts.
 */
export async function generateCustomerPackage(llcData) {
    const packageDir = join(process.cwd(), 'packages', llcData.id);
    
    if (!existsSync(packageDir)) {
        mkdirSync(packageDir, { recursive: true });
    }

    const templates = {
        resolution: 'automation/templates/banking-resolution.md',
        personal: 'automation/templates/bank-letter-personal.md'
    };

    const replacements = {
        '[ENTITY_NAME]': llcData.llc_name,
        '[FORMATION_DATE]': llcData.filed_at || new Date().toLocaleDateString(),
        '[TRACKING_NUMBER]': llcData.tracking_number || 'PENDING',
        '[USER_NAME]': llcData.owner_name || 'Authorized Member',
        '[CURRENT_DATE]': new Date().toLocaleDateString(),
        '[LLC_ID]': llcData.id.substring(0, 8).toUpperCase()
    };

    for (const [key, path] of Object.entries(templates)) {
        let content = readFileSync(path, 'utf8');
        
        // Batch replace
        for (const [placeholder, value] of Object.entries(replacements)) {
            content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }

        const fileName = key === 'resolution' ? 'SOVEREIGN_RESOLUTION.md' : 'BANK_INTRO_LETTER.md';
        const finalPath = join(packageDir, fileName);
        writeFileSync(finalPath, content);
        console.log(`[GEN] Created: ${finalPath}`);
    }

    return packageDir;
}
