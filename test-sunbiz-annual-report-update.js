// Sunbiz Annual Report Update Test
import { fileLLCWithSunbiz } from './automation/sunbiz-filing-engine.js';
import dotenv from 'dotenv';
import { scrivenerLog } from './automation/lib/scrivener-logger.js';

dotenv.config();

async function runAnnualReportUpdateTest() {
    scrivenerLog('Test', "🧪 TESTING ANNUAL REPORT UPDATES (Address Change)...");
    
    // Mock Update Data for BEST PACK LLC
    const mockReportData = {
        id: `update-test-${Date.now()}`,
        document_number: 'L22000213714',
        principal_address: '1000 INNOVATION WAY, STE 100, DELAND, FL 32724', // NEW ADDRESS
        signature: 'ANDY TREUSCH',
        fein: '12-3456789'
    };

    // Force Dry Run
    process.env.SCRIVENER_DRY_RUN = 'true';
    process.env.HEADLESS = 'false';
    process.env.STAY_OPEN = 'true';

    try {
        scrivenerLog('Test', "🚀 Launching engine for update test...");
        const result = await fileLLCWithSunbiz(mockReportData, 'annual_report');
        
        if (result.success) {
            scrivenerLog('Test', "✅ UPDATE TEST SUCCESSFUL (Dry Run)");
        } else {
            if (result.error === 'DRY_RUN_COMPLETE') {
                scrivenerLog('Test', "✅ UPDATE TEST VERIFIED (Sub-forms navigated & filled)");
            } else {
                scrivenerLog('Test', "❌ UPDATE TEST FAILED:", result.error);
            }
        }
    } catch (err) {
        scrivenerLog('Test', "❌ Test Script Error:", err);
    }
}

runAnnualReportUpdateTest();
