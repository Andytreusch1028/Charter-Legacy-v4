// Sunbiz Annual Report Automation Test
import { fileLLCWithSunbiz } from './automation/sunbiz-filing-engine.js';
import dotenv from 'dotenv';

dotenv.config();

async function runAnnualReportTest() {
    console.log("🧪 TESTING ANNUAL REPORT MAPPING...");
    
    // Mock Annual Report Data
    const mockReportData = {
        id: `test-ar-${Date.now()}`,
        document_number: 'L220001574560', // Charter Logistics LLC
        principal_address: '123 INNOVATION WAY, STE 400, DELAND, FL 32720',
        signature: 'ANDY TREUSCH',
        fein: '12-3456789'
    };

    // Force Dry Run
    process.env.SCRIVENER_DRY_RUN = 'true';
    process.env.HEADLESS = 'false';
    process.env.STAY_OPEN = 'true';

    try {
        console.log("🚀 Launching engine with 'annual_report' protocol...");
        const result = await fileLLCWithSunbiz(mockReportData, 'annual_report');
        
        if (result.success) {
            console.log("✅ ANNUAL REPORT MAPPING SUCCESSFUL (Dry Run)");
        } else {
            if (result.error === 'DRY_RUN_COMPLETE') {
                console.log("✅ ANNUAL REPORT MAPPING VERIFIED (Form reached & filled)");
            } else {
                console.error("❌ ANNUAL REPORT MAPPING FAILED:", result.error);
            }
        }
    } catch (err) {
        console.error("❌ Test Script Error:", err);
    }
}

runAnnualReportTest();
