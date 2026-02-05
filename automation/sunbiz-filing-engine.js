// Sunbiz Automation - Playwright Implementation (Refactored)
// Charter Legacy v5.6 Institutional Filing Engine
// Technology: Playwright + Supabase Edge Functions
// PBP Reference: @SUNBIZ_AUTOMATION (Phase A, B, C)

import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { scrivenerLog } from './lib/scrivener-logger.js';
import { generateCustomerPackage } from './package-generator.js';
import dotenv from 'dotenv';
import path from 'path';

// Load Environment Variables
dotenv.config();

// Load Versioned Selectors
const SELECTORS = JSON.parse(readFileSync('./automation/selectors/sunbiz.v1.json', 'utf8'));

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * PHASE A: Intent Calibration (The Forge)
 */
function calibrateIntent(rawData) {
  scrivenerLog('Phase A', 'Starting Intent Calibration...', { rawData });
  
  const data = {
    entityName: rawData.llc_name,
    principalAddress: rawData.principal_address,
    managementType: rawData.management_type || 'MEMBER_MANAGED',
    statutoryPurpose: rawData.statutory_purpose,
    registeredAgent: 'Andy Treusch', 
    organizerName: rawData.organizer_name,
    effectiveDate: rawData.effective_date,
    managers: rawData.managers || [],
    isProfessional: rawData.is_professional || false,
    certStatus: rawData.cert_status || false,
    certCopy: rawData.cert_copy || false,
    documentNumber: rawData.document_number,
    fein: rawData.fein,
    updateAgent: rawData.update_agent || false
  };
  
  const poBoxRegex = /(P\.?O\.?\s*Box|PMB|Post Office Box)/i;
  
  if (data.principalAddress && poBoxRegex.test(data.principalAddress)) {
    throw new Error('Violates FL-605.0113: Principal office cannot be a P.O. Box.');
  }
  
  scrivenerLog('Phase A', 'Calibration Complete');
  return data;
}

/**
 * PHASE B: Headless Execution
 */
async function executePlaywright(llcData, taskId, protocol = 'llc_formation') {
  scrivenerLog('Phase B', `Launching Scrivener Engine (${protocol})...`, { taskId });
  
  const browser = await chromium.launch({
    headless: process.env.HEADLESS !== 'false',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Charter Legacy Scrivener Bot v5.6'
  });
  
  const page = await context.newPage();
  
  try {
    const protocolConfig = SELECTORS.protocols[protocol];
    if (!protocolConfig) throw new Error(`Unknown protocol: ${protocol}`);

    scrivenerLog('Phase B.1', `Navigating to ${protocol} endpoint...`);
    await page.goto(protocolConfig.url, { waitUntil: 'networkidle', timeout: 30000 });
    
    let mainSubmitSelector;

    if (protocol === 'llc_formation') {
        const fields = protocolConfig.fields;
        mainSubmitSelector = fields.submitButton;

        if (await page.isVisible(fields.disclaimer)) {
            await page.check(fields.disclaimer);
            await page.click(fields.disclaimerSubmit);
            await page.waitForLoadState('networkidle');
        }

        await page.fill(fields.entityName, llcData.entityName);
        const addrParts = llcData.principalAddress.split(',').map(p => p.trim());
        await page.fill(fields.principalAddress, addrParts[0]);
        if (addrParts.length >= 3) {
            await page.fill(fields.principalCity, addrParts[1]);
            await page.fill(fields.principalState, 'FL');
            const zipMatch = addrParts[2].match(/\d{5}/);
            if (zipMatch) await page.fill(fields.principalZip, zipMatch[0]);
        }
        await page.check('input[name="same_addr_flag"]');
        await page.fill(fields.registeredAgentName, 'Andy Treusch');
        await page.fill(fields.registeredAgentAddress, '123 INNOVATION WAY, STE 400');
        await page.fill(fields.registeredAgentCity, 'DeLand');
        await page.fill(fields.registeredAgentZip, '32720');
        await page.fill(fields.registeredAgentSignature, 'Andy Treusch');
        await page.fill(fields.signature, 'Andy Treusch');

    } else if (protocol === 'annual_report') {
        const gate = protocolConfig.gate;
        const triggers = protocolConfig.triggers;
        const subForms = protocolConfig.sub_forms;
        mainSubmitSelector = protocolConfig.review.submit;

        await page.fill(gate.documentNumber, llcData.documentNumber);
        await page.click(gate.submit);
        await page.waitForLoadState('networkidle');
        
        if (await page.isVisible(gate.error_dissolved)) {
            const errorMsg = await page.textContent(gate.error_dissolved);
            throw new Error(`ENTITY_DISSOLVED: ${errorMsg.trim()}`);
        }

        // Handle Updates
        if (llcData.principalAddress) {
            scrivenerLog('Phase B.2', 'Applying Principal Address Update...');
            await page.click(triggers.editPrincipal);
            await page.waitForLoadState('networkidle');
            
            const addr = subForms.principalAddress;
            const addrParts = llcData.principalAddress.split(',').map(p => p.trim());
            await page.fill(addr.street, addrParts[0]);
            if (addrParts.length >= 3) {
                await page.fill(addr.city, addrParts[1]);
                const zipMatch = addrParts[2].match(/\d{5}/);
                if (zipMatch) await page.fill(addr.zip, zipMatch[0]);
            }
            await page.click(addr.save);
            await page.waitForLoadState('networkidle');
        }

        if (llcData.updateAgent) {
            scrivenerLog('Phase B.2', 'Applying Registered Agent Update...');
            await page.click(triggers.editAgent);
            await page.waitForLoadState('networkidle');
            const agent = subForms.registeredAgent;
            await page.fill(agent.signature, llcData.registeredAgent);
            await page.click(agent.save);
            await page.waitForLoadState('networkidle');
        }
    }

    const screenshotPath = `vault/${taskId}/pre-submission-${Date.now()}.png`;
    await page.screenshot({ path: `automation/pre-submission-${taskId}.png` });

    if (process.env.SCRIVENER_DRY_RUN === 'true') {
        scrivenerLog('Phase B.4', 'DRY RUN - Bypassing Submission');
        throw new Error('DRY_RUN_COMPLETE');
    }

    if (mainSubmitSelector) {
        await page.click(mainSubmitSelector);
        await page.waitForSelector('.confirmation-number', { timeout: 45000 });
    }

    return { success: true };

  } catch (error) {
    scrivenerLog('Phase B', 'FAILURE', error);
    try {
        const html = await page.content();
        writeFileSync(`automation/failure-${taskId}.html`, html);
    } catch (e) {}
    return { success: false, error: error.message };
  } finally {
    if (process.env.STAY_OPEN !== 'true') await browser.close();
  }
}

/**
 * Main Orchestrator
 */
async function fileLLCWithSunbiz(llcIdentifier, protocol = 'llc_formation') {
  const taskId = typeof llcIdentifier === 'string' ? llcIdentifier : llcIdentifier.id;
  
  try {
    let llcData = typeof llcIdentifier === 'string' 
      ? (await supabase.from('llcs').select('*').eq('id', llcIdentifier).single()).data 
      : llcIdentifier;

    const calibratedData = calibrateIntent(llcData);
    const result = await executePlaywright(calibratedData, taskId, protocol);

    if (result.success) {
      await supabase.from('llcs').update({
        filing_status: 'TRANSMITTED',
        filed_at: new Date().toISOString()
      }).eq('id', taskId);
      await generateCustomerPackage(llcData);
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function startScrivenerLoop() {
  scrivenerLog('Engine', 'Monitoring for intents...');
  setInterval(async () => {
    const { data } = await supabase.from('llcs').select('id').eq('filing_status', 'PENDING').limit(5);
    if (data) for (const job of data) await fileLLCWithSunbiz(job.id);
  }, 60000);
}

export { calibrateIntent, fileLLCWithSunbiz, startScrivenerLoop };
