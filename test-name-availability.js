import { lookupSunbizNames } from './automation/sunbiz-lookup.js';
import { calculateAvailabilityScore } from './src/lib/sunbiz-validator.js';

async function testNameAvailability(testName) {
    try {
        console.log(`\n--- TESTING: ${testName} ---`);
        const existingNames = await lookupSunbizNames(testName);
        console.log('Existing Names found:', JSON.stringify(existingNames, null, 2));
        const result = calculateAvailabilityScore(testName, existingNames);

        
        console.log(`Status: ${result.status}`);
        console.log(`Score: ${result.score}%`);
        console.log(`Message: ${result.message}`);
        
        if (existingNames.length > 0) {
            console.log('Top match from Sunbiz:', existingNames[0]);
        }
    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

async function runTests() {
    // 1. Test an existing entity (Should fail or have low score)
    await testNameAvailability('CLOWN CAPITAL LLC');

    // 2. Test a "not distinguishable" variation
    await testNameAvailability('The Clown Capital');


    // 3. Test a likely available name
    await testNameAvailability('Antigravity Deepmind Solutions LLC');
}

runTests();
