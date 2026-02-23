import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { classifyDocument, loadRuleWeights, loadEntityPatterns } from '../src/lib/aiClassifier.js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function runTest() {
    console.log('🚀 Starting Ingestion & Classification Test...');

    // 1. Load Entities from DB
    console.log('--- Loading Entities ---');
    const { data: entities, error: entError } = await supabase.from('clients').select('*');
    if (entError) {
        console.error('❌ Failed to load entities:', entError);
        return;
    }
    console.log(`✅ Loaded ${entities.length} entities.`);

    // 2. Prepare Sample OCR Text
    const sampleOcrText = `
        IN THE CIRCUIT COURT OF THE SEVENTH JUDICIAL CIRCUIT
        IN AND FOR VOLUSIA COUNTY, FLORIDA

        CASE NO. 2026-CA-004821

        CITIBANK, N.A.,
        Plaintiff,
        vs.
        TREUSCH HOLDINGS, LLC,
        Defendant.

        SUMMONS

        TO: TREUSCH HOLDINGS, LLC
        C/O CHARTER LEGACY
        742 S. WOODLAND BLVD, SUITE 200
        DELAND, FL 32720

        YOU ARE HEREBY NOTIFIED that an action has been filed against you...
    `;

    // 3. Run Classification
    console.log('--- Running AI Classification ---');
    try {
        // We pass the dependencies to emulate the browser environment
        const options = {
            ruleWeights: await loadRuleWeights(),
            entityPatterns: await loadEntityPatterns()
        };

        const result = await classifyDocument(sampleOcrText, entities, options);

        console.log('\n📊 CLASSIFICATION RESULT:');
        console.log('---------------------------');
        console.log(`Best Match:  ${result.bestMatch?.entityName || 'NONE'}`);
        console.log(`Confidence:  ${result.bestMatch?.confidence}%`);
        console.log(`AI Status:   ${result.aiStatus}`);
        console.log(`Category:    ${result.detectedCategory}`);
        console.log(`Is Urgent:   ${result.isUrgent}`);
        console.log(`AI Source:   ${result.aiSource}`);
        
        if (result.bestMatch) {
            console.log('\n🎯 Triggered Rules:');
            result.bestMatch.rulesTriggered.forEach(r => {
                console.log(` - [${r.rule_name}] Score: ${r.score.toFixed(2)} - ${r.evidence}`);
            });
        }

        // 4. Simulate Ingestion into ra_service_log
        console.log('\n--- Simulating DB Ingestion ---');
        const testLog = {
            document_name: 'Test_Summons_Treusch.pdf',
            document_hash: 'fakesha256_' + Date.now(),
            category: result.detectedCategory || 'Unclassified',
            status: result.aiStatus === 'ai_matched' ? 'LINKED' : 'RECEIVED',
            staff_notes: 'Automated test ingestion via diagnostic script',
            staff_id: 'SYSTEM_DIAG',
            node_id: 'DEV-NODE-01'
        };

        // If matched, we'd normally pick up the client/user ID
        if (result.bestMatch) {
            // Find the client in our list to get the user_id (if we had it, currently they don't have user_id in the table yet based on my previous discovery, wait I added it in the fix)
            const matchedEntity = entities.find(e => e.id === result.bestMatch.entityId);
            // testLog.client_id = matchedEntity.user_id; // For now we keep it null if no user_id
        }

        const { data: insertedRec, error: insError } = await supabase
            .from('ra_service_log')
            .insert(testLog)
            .select()
            .single();

        if (insError) {
            console.error('❌ Ingestion Error:', insError);
        } else {
            console.log('✅ Document successfully logged into ra_service_log.');
            console.log(`   Internal ID: ${insertedRec.id}`);
        }

    } catch (err) {
        console.error('❌ Classification Failed:', err);
    }
}

runTest();
