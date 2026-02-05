import { generateCustomerPackage } from './automation/package-generator.js';

async function testSynthesis() {
    console.log("🧪 TESTING SOVEREIGN SYNTHESIS...");
    
    const mockLLC = {
        id: 'test-llc-999',
        llc_name: 'SOVEREIGN SYNTHESIS LLC',
        tracking_number: 'CONF-12345678',
        filed_at: '2026-01-28',
        owner_name: 'Sovereign User'
    };

    try {
        const path = await generateCustomerPackage(mockLLC);
        console.log(`✨ SUCCESS: Package created at ${path}`);
    } catch (err) {
        console.error("❌ Synthesis Failed:", err);
    }
}

testSynthesis();
