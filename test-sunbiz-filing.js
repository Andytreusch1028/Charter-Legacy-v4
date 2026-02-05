// Sunbiz Automation - Comprehensive Test Suite
// Tests validation, form filling, and error handling
// Supports 'validation', 'full', and 'demo' modes

import { createClient } from '@supabase/supabase-js';
import { calibrateIntent, fileLLCWithSunbiz } from './automation/sunbiz-filing-engine.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// ============================================
// TEST CONFIGURATION
// ============================================

const TEST_MODE = process.argv[2] || 'validation'; // 'validation', 'full', or 'demo'

// Browser visibility for full/demo modes (false = visible)
process.env.HEADLESS = 'false';
process.env.STAY_OPEN = 'true';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// TEST DATA GENERATOR
// ============================================

function generateTestLLC(scenario = 'valid') {
  const timestamp = Date.now();
  
  const scenarios = {
    valid: {
      id: `test-valid-${timestamp}`,
      llc_name: 'Acme Consulting',
      principal_address: '123 Main Street, Miami, FL 33101',
      organizer_name: 'John Smith',
      management_type: 'MEMBER_MANAGED',
      statutory_purpose: 'General business consulting services',
      is_professional: false,
      registered_agent: 'Andy Treusch', // Statutory Identity
      filing_status: 'PENDING'
    },
    missingSuffix: {
      id: `test-suffix-${timestamp}`,
      llc_name: 'Test Company',
      principal_address: '456 Oak Ave, Orlando, FL 32801',
      organizer_name: 'Jane Doe',
      filing_status: 'PENDING'
    },
    poBox: {
      id: `test-pobox-${timestamp}`,
      llc_name: 'Invalid Address LLC',
      principal_address: 'P.O. Box 123, Tampa, FL 33602',
      organizer_name: 'Bob Johnson',
      filing_status: 'PENDING'
    },
    complex: {
      id: `test-complex-${timestamp}`,
      llc_name: 'Charter Legacy Alpha Group',
      principal_address: '123 Innovation Way, Ste 400, DeLand, FL 32720',
      organizer_name: 'Steve Charter',
      effective_date: '02/15/2026',
      managers: [
        { title: 'MGR', firstName: 'John', lastName: 'Doe', address: '456 Oak St', city: 'Miami', state: 'FL', zip: '33101' },
        { title: 'AMBR', firstName: 'Jane', lastName: 'Smith', address: '789 Pine Rd', city: 'Orlando', state: 'FL', zip: '32801' }
      ],
      is_professional: false,
      filing_status: 'PENDING'
    }
  };
  
  return scenarios[scenario] || scenarios.valid;
}

// ============================================
// TEST MODES
// ============================================

async function runValidationTests() {
  console.log('🧪 VALIDATION TEST SUITE\n');
  const scenarios = ['valid', 'missingSuffix', 'poBox'];
  
  for (const s of scenarios) {
    const data = generateTestLLC(s);
    try {
      const calibrated = calibrateIntent(data);
      console.log(`✅ ${s.toUpperCase()}: Calibrated Name -> ${calibrated.entityName}`);
    } catch (err) {
      console.log(`❌ ${s.toUpperCase()}: Error -> ${err.message}`);
    }
  }
}

async function runDemoFiling() {
  console.log('🎬 VISUAL AUTO-FILL DEMO (COMPLEX LLC)\n');
  console.log('This will open a browser, fill the Sunbiz form with 6 Managers and an Effective Date, and generate a PDF.\n');
  
  // Create a complex LLC data object
  const demoLLC = generateTestLLC('complex');
  demoLLC.llc_name = 'CHARTER LEGACY COMPLEX DEMO LLC';
  demoLLC.is_professional = false;
  
  // Ensure we have 6 managers for full stress test
  demoLLC.managers = [
    { title: 'MGR', firstName: 'Andy', lastName: 'Treusch', address: '123 Innovation Way', city: 'DeLand', state: 'FL', zip: '32720' },
    { title: 'MGR', firstName: 'Steve', lastName: 'Charter', address: '123 Innovation Way', city: 'DeLand', state: 'FL', zip: '32720' },
    { title: 'AMBR', firstName: 'John', lastName: 'Doe', address: '456 Oak St', city: 'Miami', state: 'FL', zip: '33101' },
    { title: 'AMBR', firstName: 'Jane', lastName: 'Smith', address: '789 Pine Rd', city: 'Orlando', state: 'FL', zip: '32801' },
    { title: 'AR', firstName: 'Alice', lastName: 'Johnson', address: '101 Maple Ln', city: 'Tampa', state: 'FL', zip: '33602' },
    { title: 'AR', firstName: 'Bob', lastName: 'Brown', address: '202 Birch Dr', city: 'Jacksonville', state: 'FL', zip: '32202' }
  ];

  // Set dry run flag to bypass final submission
  process.env.SCRIVENER_DRY_RUN = 'true';
  
  try {
    console.log('🚀 Launching Scrivener Engine (Direct Data Mode)...');
    // Pass the object directly to fileLLCWithSunbiz
    const result = await fileLLCWithSunbiz(demoLLC);
    
    if (result.success) {
      console.log('\n✅ DEMO COMPLETE!');
      console.log('   Check the Supabase vault for the PDF record.');
      console.log('   The browser is still open for your inspection.');
    }
  } catch (err) {
    if (err.message.includes('DRY_RUN_COMPLETE')) {
      console.log('\n✅ DEMO COMPLETE (Dry Run)!');
      console.log('   Form filled successfully. Final payment bypassed.');
    } else {
      console.error('❌ Demo failed:', err.message);
    }
  }
}

async function runFullTest() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('⚠️  WARNING: This will perform a REAL filing and cost $125. Continue? (y/N) ', async (answer) => {
    rl.close();
    if (answer.toLowerCase() === 'y') {
        const testLLC = generateTestLLC('valid');
        await supabase.from('llcs').insert(testLLC);
        await fileLLCWithSunbiz(testLLC.id);
    } else {
        console.log('Test cancelled.');
    }
  });
}

// ============================================
// MAIN
// ============================================

async function main() {
  if (TEST_MODE === 'validation') await runValidationTests();
  else if (TEST_MODE === 'demo') await runDemoFiling();
  else if (TEST_MODE === 'full') await runFullTest();
}

main();
