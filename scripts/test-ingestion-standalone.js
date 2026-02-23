import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Standard weights from aiClassifier.js
const DEFAULT_RULE_WEIGHTS = {
    entity_name_exact:        0.95,
    entity_name_fuzzy:        0.70,
    sovereign_name_match:     0.85, 
    ocr_substitution_match:   0.80,  
    sunbiz_doc_number:        0.98,
    fuzzy_sunbiz_match:       0.75,  
    registered_agent_address: 0.60,
    case_number_pattern:      0.85,
    ein_tin_match:            0.92,
    hub_address_routing:      0.80,
    principal_address_match:  0.60,
};

const RA_ADDRESSES = [
    '742 S. WOODLAND BLVD, SUITE 200, DELAND, FL 32720',
    '742 S WOODLAND BLVD STE 200 DELAND FL 32720',
    '742 SOUTH WOODLAND BOULEVARD',
];

// Simplified Feature Extraction
function extractFeatures(ocrText) {
    const text = (ocrText || '').toUpperCase();
    return {
        entityNames: (text.match(/([A-Z][A-Z\s&.,'-]{2,50}(?:LLC|L\.L\.C\.|INC|CORP|CORPORATION|PA|P\.A\.|LP|L\.P\.|LLP|L\.L\.P\.))/g) || []).map(n => n.trim()),
        docNumbers: (text.match(/\b([LPNFWH]\d{6,14})\b/g) || []).map(n => n.trim()),
        caseNumbers: (text.match(/\b(20\d{2}-[A-Z]{2}-\d{4,8})\b/g) || []).map(n => n.trim()),
        taxIds: (text.match(/\b(\d{2}-\d{7})\b/g) || []).map(n => n.trim()),
        rawText: text
    };
}

// Simplified Scoring
function scoreEntity(entity, features, weights) {
    let weightedScore = 0;
    let totalWeight = 0;
    const rules = [];

    const nameUpper = (entity.name || '').toUpperCase();
    
    // 1. Exact Name
    const w1 = weights.entity_name_exact;
    if (features.entityNames.some(n => n === nameUpper || n.includes(nameUpper))) {
        weightedScore += w1;
        rules.push('entity_name_exact');
    }
    totalWeight += w1;

    // 2. Sunbiz ID
    const w3 = weights.sunbiz_doc_number;
    if (entity.sunbiz_id && features.docNumbers.includes(entity.sunbiz_id)) {
        weightedScore += w3;
        rules.push('sunbiz_doc_number');
    }
    totalWeight += w3;

    // 3. Address
    const w4 = weights.registered_agent_address;
    if (RA_ADDRESSES.some(addr => features.rawText.includes(addr))) {
        weightedScore += w4 * 0.8;
        rules.push('registered_agent_address');
    }
    totalWeight += w4;

    const confidence = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
    return { entityName: entity.name, confidence, rules };
}

async function runStandaloneTest() {
    console.log('🚀 INITIALIZING STANDALONE INGESTION TEST...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    try {
        // 1. Fetch Entities
        const { data: entities } = await supabase.from('clients').select('*');
        console.log(`📡 Loaded ${entities.length} entities from master database.`);

        // 2. Sample OCR Data (Summons for Treusch Holdings)
        const sampleOCR = `
            STATE OF FLORIDA, VOLUSIA COUNTY
            CIRCUIT COURT CASE: 2026-CA-004821
            
            PLAINTIFF: CITIBANK, N.A.
            DEFENDANT: TREUSCH HOLDINGS, LLC (ID: L24000392044)
            
            SUMMONS TO REGISTERED AGENT:
            CHARTER LEGACY
            742 S. WOODLAND BLVD, SUITE 200
            DELAND, FL 32720
        `;

        // 3. Process
        const features = extractFeatures(sampleOCR);
        const scores = entities.map(e => scoreEntity(e, features, DEFAULT_RULE_WEIGHTS))
            .sort((a, b) => b.confidence - a.confidence);

        const best = scores[0];
        console.log('\n🧠 AI CLASSIFICATION REPORT:');
        console.log('------------------------------');
        console.log(`Matched Entity: ${best.entityName}`);
        console.log(`Confidence:     ${best.confidence}%`);
        console.log(`Evidence:       ${best.rules.join(', ')}`);

        // 4. Ingest into ra_service_log
        console.log('\n📥 INGESTING INTO SYSTEM LOGS...');
        const logData = {
            document_name: 'test_summons_ingest.pdf',
            document_hash: 'sha256_test_' + Date.now(),
            category: 'Court SOP',
            status: best.confidence > 80 ? 'LINKED' : 'RECEIVED',
            staff_notes: 'Diagnostic ingestion test success.',
            staff_id: 'DIAG_BOT',
            node_id: 'NODE-SOUTH-01'
        };

        const { data, error } = await supabase.from('ra_service_log').insert(logData).select().single();
        
        if (error) {
            console.error('❌ Ingestion failed:', error.message);
        } else {
            console.log('✅ TEST COMPLETE: Ingestion successful.');
            console.log(`   Log Entry ID: ${data.id}`);
            console.log(`   System Status: ${data.status}`);
        }

    } catch (err) {
        console.error('❌ FATAL ERROR:', err);
    }
}

runStandaloneTest();
