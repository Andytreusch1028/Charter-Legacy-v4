/**
 * ═══════════════════════════════════════════════════════════════════════
 * Charter Legacy — Local AI Document Classifier
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * A self-learning classification engine that matches scanned documents
 * to known client entities. The engine:
 * 
 *   1. Extracts features from OCR text (entity names, doc numbers, etc.)
 *   2. Scores each known entity against those features using weighted rules
 *   3. Returns the best match with a confidence score
 *   4. Learns from corrections — Accept boosts rule weights, Override penalizes
 * 
 * The "intelligence" lives in the rule weights stored in Supabase.
 * Over time, the system naturally converges toward high accuracy because
 * every manual correction adjusts the scoring formula permanently.
 * 
 * Architecture:
 *   ┌──────────┐     ┌───────────┐     ┌──────────────┐
 *   │  Scanner  │────▶│  OCR Text  │────▶│  AI Matcher   │
 *   └──────────┘     └───────────┘     │  (this file)  │
 *                                       └──────┬───────┘
 *                                              │
 *                    ┌─────────────────────────▼────────────────┐
 *                    │           Supabase Tables                 │
 *                    │  ai_matching_rules  (learnable weights)  │
 *                    │  ai_entity_patterns (learned patterns)   │
 *                    │  ai_classification_feedback (training)   │
 *                    └─────────────────────────────────────────┘
 */

import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════
// 1. FEATURE EXTRACTION — Pull structured data from raw OCR text
// ═══════════════════════════════════════════════════════════════════════

/**
 * Extract all identifiable features from OCR text output.
 * Returns a structured object used by the scoring engine.
 */
export function extractFeatures(ocrText) {
    const text = (ocrText || '').toUpperCase();
    const original = ocrText || '';
    
    return {
        // Entity names — look for LLC, Corp, Inc, PA patterns
        entityNames: extractEntityNames(text),
        
        // Document numbers — SunBiz filings, court case numbers
        docNumbers: extractDocNumbers(text),
        
        // Addresses
        addresses: extractAddresses(text),
        
        // Court case numbers
        caseNumbers: extractCaseNumbers(text),
        
        // EIN / TIN numbers
        taxIds: extractTaxIds(text),
        
        // Document type keywords
        docTypeKeywords: extractDocTypeKeywords(text),
        
        // Return address / sender info
        senderInfo: extractSenderInfo(text),
        
        // Raw features for retraining
        rawTextLength: text.length,
        rawTextPreview: original.substring(0, 2000),
        
        // Overall OCR quality estimate (0-100)
        ocrQuality: estimateOCRQuality(text),

        // Form Identification
        formIds: extractFormIds(text),
        
        // Header Zone check (first 800 chars for identification)
        headerZoneText: text.substring(0, 800),
    };
}

/** Extract entity names (LLC, Corp, Inc, PA, LP, LLP patterns) */
function extractEntityNames(text) {
    const patterns = [
        // "Treusch Holdings, LLC" style
        /([A-Z][A-Z\s&.,'-]{2,50}(?:LLC|L\.L\.C\.|INC|CORP|CORPORATION|PA|P\.A\.|LP|L\.P\.|LLP|L\.L\.P\.))/g,
        // "TO: Entity Name" line
        /(?:TO|DEFENDANT|RE|ENTITY|TAXPAYER|RESPONDENT|ATTN|ATTENTION)[\s:]+([A-Z][A-Z\s&.,'-]{3,60})/g,
        // "c/o Charter Legacy" preceding pattern
        /([A-Z][A-Z\s&.,'-]{3,50}),?\s*C\/O\s*CHARTER\s*LEGACY/g,
        // Common Florida patterns
        /REGISTERED\s*(?:AGENT|OFFICE)\s*FOR\s*([A-Z][A-Z\s&.,'-]{3,60})/g,
    ];
    
    const names = new Set();
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const cleaned = match[1].trim()
                .replace(/[,.\s]+$/, '')  // trim trailing punctuation
                .replace(/\s+/g, ' ');    // normalize whitespace
            if (cleaned.length >= 4 && cleaned.length <= 80) {
                names.add(cleaned);
            }
        }
    }
    return Array.from(names);
}

/** Extract document/filing numbers */
function extractDocNumbers(text) {
    const patterns = [
        // SunBiz: L24000392044, P24000523891, N (Non-profit), F (Foreign)
        /\b([LPNFWH]\d{6,14})\b/g,
        // Filing number: 2026-0214-88432
        /\b(\d{4}-\d{4}-\d{4,9})\b/g,
        // Document Number: followed by value
        /(?:DOCUMENT|FILING|REVENUE|REGISTRATION)\s*(?:ID|NUMBER|NO|#)[\s:]+([A-Z0-9-]{5,25})/g,
    ];
    
    const numbers = new Set();
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            numbers.add(match[1].trim());
        }
    }
    return Array.from(numbers);
}

/** Extract Florida addresses */
function extractAddresses(text) {
    const patterns = [
        // Street address with FL zip
        /(\d{1,5}\s+[A-Z][A-Z\s.,]{2,60}(?:FL|FLORIDA)\s*\d{5}(?:-\d{4})?)/g,
        // Suite-style addresses
        /(\d{1,5}\s+[A-Z][A-Z\s.]+(?:BLVD|AVE|ST|RD|DR|LN|CT|WAY|PL|PKWY)[\s.,]+(?:SUITE|STE|#|UNIT|BLDG|OFFICE)\s*[A-Z0-9-]{1,8})/g,
        // PO Box
        /(?:P\.?\s*O\.?\s*BOX|POST\s*OFFICE\s*BOX)\s*(\d{1,8})/g,
    ];
    
    const addresses = new Set();
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            addresses.add(match[1].trim().replace(/\s+/g, ' '));
        }
    }
    return Array.from(addresses);
}

/** Extract court case numbers */
function extractCaseNumbers(text) {
    const patterns = [
        // Florida case format: 2026-CA-004821
        /\b(20\d{2}-[A-Z]{2}-\d{4,8})\b/g,
        // Case No. followed by number
        /CASE\s*(?:NO|NUMBER)[\s.:]+([A-Z0-9-]{5,20})/g,
    ];
    
    const cases = new Set();
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            cases.add(match[1].trim());
        }
    }
    return Array.from(cases);
}

/** Extract EIN/TIN tax identification numbers */
function extractTaxIds(text) {
    // EIN format: 12-3456789
    const pattern = /\b(\d{2}-\d{7})\b/g;
    const ids = new Set();
    let match;
    while ((match = pattern.exec(text)) !== null) {
        ids.add(match[1]);
    }
    return Array.from(ids);
}

/** Identify document type from keywords */
function extractDocTypeKeywords(text) {
    const typeMap = {
        'Court SOP': [
            'SUMMONS', 'SERVICE OF PROCESS', 'CIVIL ACTION', 'HEREBY NOTIFIED', 'WRITTEN DEFENSES',
            'PLAINTIFF', 'DEFENDANT', 'VS.', 'VERSUS', 'IN THE CIRCUIT COURT', 'IN AND FOR', 'JUDICIAL CIRCUIT'
        ],
        'Subpoena': [
            'SUBPOENA', 'DUCES TECUM', 'COMMANDED TO PRODUCE', 'COMMANDED TO APPEAR', 'AD TESTIFICANDUM',
            'PRODUCE THE FOLLOWING', 'CERTIFIED MAIL', 'FAILURE TO APPEAR'
        ],
        'Garnishment': [
            'GARNISHMENT', 'WRIT OF', 'CONTINUING WRIT', 'WAGE GARNISHMENT', 'DEBTOR', 'JUDGMENT CREDITOR',
            'ASSETS OF THE DEFENDANT', 'EXEMPTION CLAIM'
        ],
        'State Notice': [
            'DEPARTMENT OF STATE', 'DIVISION OF CORPORATIONS', 'ANNUAL REPORT', 'ARTICLES OF',
            'APPLICATION FOR', 'CERTIFICATE OF STATUS', 'ADMINISTRATIVE DISSOLUTION', 'AMENDMENT',
            'SECRETARY OF STATE'
        ],
        'Tax Mail': [
            'INTERNAL REVENUE', 'DEPARTMENT OF THE TREASURY', 'NOTICE CP', 'TAX YEAR', 'PROPOSED CHANGES',
            'DEPARTMENT OF REVENUE', 'DOR', 'TAX WARRANT', 'INTANGIBLE TAX', 'SALES AND USE TAX'
        ],
        'Legal Notice': [
            'NOTICE OF', 'HEARING', 'MOTION TO', 'ORDER TO', 'STIPULATION', 'FINAL JUDGMENT',
            'FORECLOSURE', 'EVICTION', 'DISCONTINUANCE', 'NOTICE TO QUIT'
        ],
        'Complimentary': [
            'INFORMATION PUBLICATION', 'BULLETIN', 'FOR INFORMATIONAL PURPOSES', 'NEWSLETTER',
            'ADVERTISEMENT', 'MARKETING'
        ],
    };
    
    const detected = [];
    for (const [type, keywords] of Object.entries(typeMap)) {
        const matchCount = keywords.filter(kw => text.includes(kw)).length;
        if (matchCount > 0) {
            // Apply weight for specific high-priority keywords
            let priorityBoost = 0;
            if (type === 'Court SOP' && text.includes('SUMMONS')) priorityBoost = 0.2;
            if (type === 'Subpoena' && text.includes('AD TESTIFICANDUM')) priorityBoost = 0.2;
            if (type === 'Legal Notice' && (text.includes('EVICTION') || text.includes('FORECLOSURE'))) priorityBoost = 0.3;
            
            detected.push({ 
                type, 
                matchCount, 
                totalKeywords: keywords.length, 
                strength: Math.min(1.0, (matchCount / keywords.length) + priorityBoost)
            });
        }
    }
    
    // Sort by match strength
    detected.sort((a, b) => b.strength - a.strength);
    return detected;
}

/** Extract Government Form IDs (e.g., SS-4, 1040, FL-DR-15) */
function extractFormIds(text) {
    const patterns = [
        /\b(?:FORM|FRM|NO\.?)\s*([A-Z0-9-]{2,12})\b/g,
        /\b(SS-4|1040|1120|1065|DR-\d{2,4})\b/g,
    ];
    
    const forms = new Set();
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            forms.add(match[1].trim());
        }
    }
    return Array.from(forms);
}

/** Extract sender / return address info */
function extractSenderInfo(text) {
    const courtPatterns = [
        /CIRCUIT COURT OF THE (\w+ JUDICIAL CIRCUIT)/,
        /([\w\s]+ COUNTY,\s*FLORIDA)/,
        /DEPARTMENT OF (?:THE )?([\w\s]+)/,
    ];
    
    const senders = [];
    for (const pattern of courtPatterns) {
        const match = text.match(pattern);
        if (match) senders.push(match[1].trim());
    }
    return senders;
}

/** Estimate OCR quality (0–100) based on text characteristics */
function estimateOCRQuality(text) {
    if (!text || text.length < 20) return 0;
    
    // Count "garbage" characters (signs of bad OCR)
    // Florida documents are mostly A-Z, 0-9, and standard punctuation
    const garbageChars = (text.match(/[^A-Z0-9\s.,;:!?'"()\-/\\$@#&*+=\[\]{}|<>]/g) || []).length;
    const garbageRatio = garbageChars / text.length;
    
    // Count word-like sequences vs non-word
    const words = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
    const wordDensity = words / (text.length / 5); // ~5 chars per average word
    
    // Check for repetitive character segments (OCR hallucination)
    const repetitive = (text.match(/(.)\1{4,}/g) || []).length;
    
    // Score
    let quality = 100;
    quality -= garbageRatio * 300;    // penalize garbage chars heavily
    quality -= Math.max(0, (0.3 - wordDensity)) * 120; // penalize low word density
    quality -= repetitive * 5;        // penalize hallucinations
    
    quality = Math.max(0, Math.min(100, Math.round(quality)));
    
    return quality;
}


// ═══════════════════════════════════════════════════════════════════════
// 2. SCORING ENGINE — Match features against entities using weighted rules
// ═══════════════════════════════════════════════════════════════════════

/** Default rule weights (used before Supabase weights are loaded) */
const DEFAULT_RULE_WEIGHTS = {
    entity_name_exact:        0.95,
    entity_name_fuzzy:        0.70,
    sovereign_name_match:     0.85,  // Matching "TREUSCH HOLDINGS" in "TREUSCH HOLDINGS, LLC"
    ocr_substitution_match:   0.80,  // Matching after swapping 0->O, 1->I, etc.
    sunbiz_doc_number:        0.98,
    fuzzy_sunbiz_match:       0.75,  // 1-char difference in SunBiz ID
    registered_agent_address: 0.60,
    case_number_pattern:      0.85,
    sender_return_address:    0.55,
    historical_sender:        0.75,
    document_type_pattern:    0.40,
    ein_tin_match:            0.92,
    hub_address_routing:      0.80,
    form_id_match:            0.45,
    contextual_proximity:     0.30,  // Boost if name is near "Defendant" or "To:"
    owner_name_match:         0.50,  // Find owner name in text
    structural_priority:      0.20,  // Global boost if match is in header (initial 800 chars)
    principal_address_match:  0.60,  // Physical address found in text
    phonetic_name_match:      0.40,  // Sounds like the entity name
};

/** Our known registered agent addresses */
const RA_ADDRESSES = [
    '742 S. WOODLAND BLVD, SUITE 200, DELAND, FL 32720',
    '742 S WOODLAND BLVD STE 200 DELAND FL 32720',
    '742 SOUTH WOODLAND BOULEVARD',
];

/**
 * Levenshtein distance for fuzzy name matching.
 * Optimized for short-to-medium strings (entity names).
 */
function levenshtein(a, b) {
    const an = a.length;
    const bn = b.length;
    if (an === 0) return bn;
    if (bn === 0) return an;
    
    const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
    for (let j = 0; j <= an; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= bn; i++) {
        for (let j = 1; j <= an; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[bn][an];
}

/** 
 * Handle common OCR character substitutions 
 * (0 -> O, 1 -> I/L, 5 -> S, 8 -> B)
 */
function normalizeOCRSubstitutions(text) {
    return text
        .replace(/0/g, 'O')
        .replace(/[1I]/g, 'L') // Map 1 and I to L for phonetic similarity in OCR
        .replace(/5/g, 'S')
        .replace(/8/g, 'B')
        .replace(/[^A-Z]/g, ''); // Strip everything but letters for core comparison
}

/** 
 * Simplified Phonetic Key (Soundex-Lite) 
 * Helps match "Treusch" vs "Truesch" vs "Treush"
 */
function getPhoneticKey(text) {
    if (!text) return '';
    let s = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (s.length === 0) return '';
    
    // Simple phonetic mapping
    const first = s[0];
    s = s.substring(1)
        .replace(/[AEIOUYHW]/g, '')
        .replace(/[BFPV]/g, '1')
        .replace(/[CGJKQSXZ]/g, '2')
        .replace(/[DT]/g, '3')
        .replace(/[L]/g, '4')
        .replace(/[MN]/g, '5')
        .replace(/[R]/g, '6');
    
    // Return first char + first 3 phonetic codes
    return (first + s).substring(0, 4).padEnd(4, '0');
}

/**
 * Score a single entity against extracted features.
 * Returns { score, rulesTriggered } where score is 0–100.
 */
function scoreEntity(entity, features, ruleWeights, entityPatterns) {
    const rulesTriggered = [];
    let totalWeight = 0;
    let weightedScore = 0;
    
    const entityNameUpper = (entity.name || '').toUpperCase();
    const patterns = entityPatterns?.[entity.id] || {};
    const sovereignPattern = /[\s,]+(LLC|L\.L\.C\.|INC|CORP|CORPORATION|PA|P\.A\.|LP|L\.P\.|LLP|L\.L\.P\.)$/;
    const entityClean = entityNameUpper.replace(/[^A-Z0-9]/g, '');
    const ownerNameUpper = (entity.owner_name || '').toUpperCase();
    
    // Zone Awareness
    const inHeader = (feat) => features.headerZoneText.includes(feat);
    const wStructural = ruleWeights.structural_priority ?? DEFAULT_RULE_WEIGHTS.structural_priority;
    
    // ── Rule 1: Entity Name Exact Match ───────────────────────────────
    const w1 = ruleWeights.entity_name_exact ?? DEFAULT_RULE_WEIGHTS.entity_name_exact;
    const exactMatch = features.entityNames.some(n => 
        n === entityNameUpper || 
        n.includes(entityNameUpper) || 
        entityNameUpper.includes(n)
    );
    if (exactMatch) {
        rulesTriggered.push({ rule_name: 'entity_name_exact', score: w1, evidence: `Exact name: "${entityNameUpper}"` });
        weightedScore += w1 * 1.0;
    }
    totalWeight += w1;

    // ── Rule 1.5: Sovereign Name Match (Stripping Legal Suffixes) ──────
    const w1_5 = ruleWeights.sovereign_name_match ?? DEFAULT_RULE_WEIGHTS.sovereign_name_match;
    if (!exactMatch) {
        const sovereignPattern = /[\s,]+(LLC|L\.L\.C\.|INC|CORP|CORPORATION|PA|P\.A\.|LP|L\.P\.|LLP|L\.L\.P\.)$/;
        const entitySovereign = entityNameUpper.replace(sovereignPattern, '').trim();
        
        if (entitySovereign.length >= 4) {
            const sovMatch = features.entityNames.some(n => {
                const nSov = n.replace(sovereignPattern, '').trim();
                return nSov === entitySovereign || nSov.includes(entitySovereign) || entitySovereign.includes(nSov);
            });
            
            if (sovMatch) {
                rulesTriggered.push({ rule_name: 'sovereign_name_match', score: w1_5, evidence: `Sovereign name match: "${entitySovereign}"` });
                weightedScore += w1_5 * 1.0;
            }
        }
    }
    totalWeight += w1_5;
    
    // ── Rule 1.7: OCR Substitution Match ───────────────────────────
    const w1_7 = ruleWeights.ocr_substitution_match ?? DEFAULT_RULE_WEIGHTS.ocr_substitution_match;
    if (!exactMatch && !rulesTriggered.some(r => r.rule_name === 'sovereign_name_match')) {
        const normalizedEntity = normalizeOCRSubstitutions(entityNameUpper);
        if (normalizedEntity.length >= 6) {
            const subMatch = features.entityNames.some(n => {
                const normalizedCaptured = normalizeOCRSubstitutions(n);
                return normalizedCaptured === normalizedEntity || normalizedCaptured.includes(normalizedEntity);
            });
            
            if (subMatch) {
                rulesTriggered.push({ rule_name: 'ocr_substitution_match', score: w1_7, evidence: `Substitution match (0/O, 1/L): "${normalizedEntity}"` });
                weightedScore += w1_7 * 1.0;
            }
        }
    }
    totalWeight += w1_7;

    // ── Rule 1.9: Contextual Proximity Boost ─────────────────────────
    // If the name is found near high-value legal labels
    const wProximity = ruleWeights.contextual_proximity ?? DEFAULT_RULE_WEIGHTS.contextual_proximity;
    const fullText = (features.rawTextPreview || '').toUpperCase();
    const proximityKeywords = ['DEFENDANT', 'RESPONDENT', 'TO:', 'RE:', 'ATTENTION:', 'ENTITY:'];
    
    let proximityTriggered = false;
    for (const kw of proximityKeywords) {
        const kwIdx = fullText.indexOf(kw);
        if (kwIdx !== -1) {
            // Check if entity name (or sovereign) exists within 100 chars of keyword
            const snippet = fullText.substring(Math.max(0, kwIdx - 50), Math.min(fullText.length, kwIdx + 150));
            if (snippet.includes(entityNameUpper) || snippet.includes(entityNameUpper.replace(sovereignPattern, '').trim())) {
                proximityTriggered = true;
                break;
            }
        }
    }
    
    if (proximityTriggered) {
        rulesTriggered.push({ rule_name: 'contextual_proximity', score: wProximity, evidence: `Name found near legal keyword (Defendant/To:/Re:)` });
        weightedScore += wProximity * 1.0;
    }
    totalWeight += wProximity;
    
    // ── Rule 2: Entity Name Fuzzy Match ──────────────────────────────
    const w2 = ruleWeights.entity_name_fuzzy ?? DEFAULT_RULE_WEIGHTS.entity_name_fuzzy;
    if (!exactMatch) {
        for (const name of features.entityNames) {
            const dist = levenshtein(name, entityNameUpper);
            const maxLen = Math.max(name.length, entityNameUpper.length);
            const similarity = 1 - (dist / maxLen);
            if (dist <= 3 || similarity >= 0.85) {
                rulesTriggered.push({ rule_name: 'entity_name_fuzzy', score: w2 * similarity, evidence: `Fuzzy match: "${name}" ≈ "${entityNameUpper}" (${Math.round(similarity * 100)}%)` });
                weightedScore += w2 * similarity;
                break;
            }
        }
        // Also check learned aliases
        if (patterns.known_aliases?.length) {
            for (const alias of patterns.known_aliases) {
                const aliasUpper = alias.toUpperCase();
                if (features.entityNames.some(n => n.includes(aliasUpper) || aliasUpper.includes(n))) {
                    rulesTriggered.push({ rule_name: 'entity_name_fuzzy', score: w2 * 0.9, evidence: `Known alias: "${alias}"` });
                    weightedScore += w2 * 0.9;
                    break;
                }
            }
        }
    }
    totalWeight += w2;
    
    // ── Rule 3: SunBiz Document Number Match ─────────────────────────
    const w3 = ruleWeights.sunbiz_doc_number ?? DEFAULT_RULE_WEIGHTS.sunbiz_doc_number;
    const w3_f = ruleWeights.fuzzy_sunbiz_match ?? DEFAULT_RULE_WEIGHTS.fuzzy_sunbiz_match;
    
    let sunbizMatch = false;
    let fuzzySunbizMatch = false;
    
    for (const d of features.docNumbers) {
        if (d === entity.sunbizId || (patterns.known_doc_numbers || []).includes(d)) {
            sunbizMatch = true;
            break;
        }
        // Fuzzy ID check (1 char difference)
        if (entity.sunbizId && d.length === entity.sunbizId.length) {
            const dist = levenshtein(d, entity.sunbizId);
            if (dist === 1) fuzzySunbizMatch = true;
        }
    }

    if (sunbizMatch) {
        rulesTriggered.push({ rule_name: 'sunbiz_doc_number', score: w3, evidence: `Doc number matched: ${entity.sunbizId}` });
        weightedScore += w3 * (inHeader(entity.sunbizId) ? (1 + wStructural) : 1.0);
    } else if (fuzzySunbizMatch) {
        rulesTriggered.push({ rule_name: 'fuzzy_sunbiz_match', score: w3_f, evidence: `SunBiz ID highly similar (1-char diff)` });
        weightedScore += w3_f * 0.9;
    }
    totalWeight += sunbizMatch ? w3 : (fuzzySunbizMatch ? w3_f : w3);
    
    // ── Rule 3.5: Owner Name Cross-Reference ─────────────────────────
    const wOwner = ruleWeights.owner_name_match ?? DEFAULT_RULE_WEIGHTS.owner_name_match;
    if (ownerNameUpper && ownerNameUpper.length > 5) {
        const ownerFound = (features.rawTextPreview || '').toUpperCase().includes(ownerNameUpper);
        if (ownerFound) {
            rulesTriggered.push({ rule_name: 'owner_name_match', score: wOwner, evidence: `Entity owner identified: "${ownerNameUpper}"` });
            weightedScore += wOwner * 1.0;
        }
    }
    totalWeight += wOwner;

    // ── Rule 4: Registered Agent Address Found ───────────────────────
    const w4 = ruleWeights.registered_agent_address ?? DEFAULT_RULE_WEIGHTS.registered_agent_address;
    const hasRAAddress = (features.rawTextPreview || '').toUpperCase();
    const raAddressFound = RA_ADDRESSES.some(addr => hasRAAddress.includes(addr.replace(/[.,]/g, '')));
    if (raAddressFound) {
        rulesTriggered.push({ rule_name: 'registered_agent_address', score: w4, evidence: 'Charter Legacy RA address found in document' });
        weightedScore += w4 * 0.8; // Broad signal — helps but not conclusive
    }
    totalWeight += w4;
    
    // ── Rule 5: Case Number Match ────────────────────────────────────
    const w5 = ruleWeights.case_number_pattern ?? DEFAULT_RULE_WEIGHTS.case_number_pattern;
    const caseMatch = features.caseNumbers.some(c =>
        (patterns.known_case_numbers || []).includes(c)
    );
    if (caseMatch) {
        rulesTriggered.push({ rule_name: 'case_number_pattern', score: w5, evidence: `Known case number matched` });
        weightedScore += w5 * 1.0;
    }
    totalWeight += w5;
    
    // ── Rule 6: Known Sender Match ───────────────────────────────────
    const w6 = ruleWeights.sender_return_address ?? DEFAULT_RULE_WEIGHTS.sender_return_address;
    const senderMatch = features.senderInfo.some(s => 
        (patterns.known_senders || []).some(ks => s.includes(ks.toUpperCase()))
    );
    if (senderMatch) {
        rulesTriggered.push({ rule_name: 'sender_return_address', score: w6, evidence: 'Sender previously associated with this entity' });
        weightedScore += w6 * 0.9;
    }
    totalWeight += w6;
    
    // ── Rule 7: Historical Sender Pattern ────────────────────────────
    const w7 = ruleWeights.historical_sender ?? DEFAULT_RULE_WEIGHTS.historical_sender;
    // This is boosted by the learned patterns — how often this sender sends to this entity
    if (patterns.total_matches && patterns.correct_matches) {
        const historicalAccuracy = patterns.correct_matches / patterns.total_matches;
        if (historicalAccuracy > 0.7 && senderMatch) {
            rulesTriggered.push({ rule_name: 'historical_sender', score: w7 * historicalAccuracy, evidence: `Entity historically ${Math.round(historicalAccuracy * 100)}% accurate` });
            weightedScore += w7 * historicalAccuracy;
        }
    }
    totalWeight += w7;
    
    // ── Rule 8: Document Type Pattern ────────────────────────────────
    const w8 = ruleWeights.document_type_pattern ?? DEFAULT_RULE_WEIGHTS.document_type_pattern;
    if (features.docTypeKeywords.length > 0 && patterns.known_doc_types?.length) {
        const topType = features.docTypeKeywords[0].type;
        if (patterns.known_doc_types.includes(topType)) {
            rulesTriggered.push({ rule_name: 'document_type_pattern', score: w8 * features.docTypeKeywords[0].strength, evidence: `Doc type "${topType}" known for this entity` });
            weightedScore += w8 * features.docTypeKeywords[0].strength * 0.5; // Soft signal
        }
    }
    totalWeight += w8;
    
    // ── Rule 9: EIN/TIN Match ────────────────────────────────────────
    const w9 = ruleWeights.ein_tin_match ?? DEFAULT_RULE_WEIGHTS.ein_tin_match;
    if (entity.ein && features.taxIds.includes(entity.ein)) {
        rulesTriggered.push({ rule_name: 'ein_tin_match', score: w9, evidence: `EIN matched: ${entity.ein}` });
        weightedScore += w9 * 1.0;
    }
    totalWeight += w9;
    
    // ── Rule 10: Hub Address Routing ─────────────────────────────────
    const w10 = ruleWeights.hub_address_routing ?? DEFAULT_RULE_WEIGHTS.hub_address_routing;
    if (entity.hubId && (features.rawTextPreview || '').toUpperCase().includes(entity.hubId)) {
        rulesTriggered.push({ rule_name: 'hub_address_routing', score: w10, evidence: `Hub ID "${entity.hubId}" found in text` });
        weightedScore += w10 * 1.0;
    }
    totalWeight += w10;
    
    // ── Rule 11: Form ID Presence ────────────────────────────────────
    const w11 = ruleWeights.form_id_match ?? DEFAULT_RULE_WEIGHTS.form_id_match;
    if (features.formIds.length > 0) {
        // Broad signal that it's a structural document
        rulesTriggered.push({ rule_name: 'form_id_match', score: w11 * 0.5, evidence: `Government Form detected: ${features.formIds[0]}` });
        weightedScore += w11 * 0.5;
    }
    totalWeight += w11;
    
    // ── Rule 12: Principal Address Found ────────────────────────────
    const wAddr = ruleWeights.principal_address_match ?? DEFAULT_RULE_WEIGHTS.principal_address_match;
    if (entity.principal_address) {
        const cleanAddr = entity.principal_address.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const addrFound = features.addresses.some(a => {
            const cleanA = a.toUpperCase().replace(/[^A-Z0-9]/g, '');
            return cleanA === cleanAddr || cleanA.includes(cleanAddr) || cleanAddr.includes(cleanA);
        });
        
        if (addrFound) {
            rulesTriggered.push({ rule_name: 'principal_address_match', score: wAddr, evidence: `Principal address match: ${entity.principal_address}` });
            weightedScore += wAddr * 1.0;
        }
    }
    totalWeight += wAddr;

    // ── Rule 13: Phonetic Name Match ─────────────────────────────────
    const wPhone = ruleWeights.phonetic_name_match ?? DEFAULT_RULE_WEIGHTS.phonetic_name_match;
    if (!exactMatch && !rulesTriggered.some(r => r.rule_name === 'sovereign_name_match')) {
        const entityPhone = getPhoneticKey(entityNameUpper.replace(sovereignPattern, ''));
        const phoneMatch = features.entityNames.some(n => getPhoneticKey(n.replace(sovereignPattern, '')) === entityPhone);
        
        if (phoneMatch) {
            rulesTriggered.push({ rule_name: 'phonetic_name_match', score: wPhone, evidence: `Phonetic match found` });
            weightedScore += wPhone * 1.0;
        }
    }
    totalWeight += wPhone;

    // ── Calculate final confidence ───────────────────────────────────
    // Normalized score: (weighted hits) / (total possible weight) × 100
    // If multiple names detected, we treat it as high signal but slightly reduce confidence
    const distinctNamesDetected = features.entityNames.length;
    const nameClarityPenalty = distinctNamesDetected > 2 ? (distinctNamesDetected - 1) * 2 : 0;

    const confidence = totalWeight > 0 
        ? Math.round(((weightedScore / totalWeight) * 100) - nameClarityPenalty)
        : 0;
    
    return {
        entityId: entity.id,
        entityName: entity.name,
        hubId: entity.hubId,
        sunbizId: entity.sunbizId,
        confidence: Math.max(0, Math.min(99, confidence)), // Never 100% sure
        rulesTriggered,
        rulesFired: rulesTriggered.length,
    };
}


// ═══════════════════════════════════════════════════════════════════════
// 3. CLASSIFIER — The main classification pipeline
// ═══════════════════════════════════════════════════════════════════════

/**
 * Load the current rule weights from Supabase.
 * Falls back to defaults if DB is unavailable.
 */
export async function loadRuleWeights() {
    try {
        const { data, error } = await supabase
            .from('ai_matching_rules')
            .select('rule_name, weight, active')
            .eq('active', true);
        
        if (error || !data) {
            console.warn('[AI Classifier] Could not load rule weights, using defaults:', error?.message);
            return { ...DEFAULT_RULE_WEIGHTS };
        }
        
        const weights = { ...DEFAULT_RULE_WEIGHTS };
        for (const rule of data) {
            weights[rule.rule_name] = parseFloat(rule.weight);
        }
        return weights;
    } catch (err) {
        console.warn('[AI Classifier] Rule weight load failed, using defaults');
        return { ...DEFAULT_RULE_WEIGHTS };
    }
}

/**
 * Load learned entity patterns from Supabase.
 */
export async function loadEntityPatterns() {
    try {
        const { data, error } = await supabase
            .from('ai_entity_patterns')
            .select('*');
        
        if (error || !data) return {};
        
        const patterns = {};
        for (const p of data) {
            patterns[p.entity_id] = p;
        }
        return patterns;
    } catch {
        return {};
    }
}

/**
 * Classify a document's OCR text against all known entities.
 * 
 * @param {string} ocrText - Raw OCR text output from the scanner
 * @param {Array} entities - Array of known entities to match against
 * @param {Object} [options] - Optional config overrides
 * @returns {Object} Classification result
 */
export async function classifyDocument(ocrText, entities, options = {}) {
    const startTime = performance.now();
    
    // 1. Extract features from OCR text
    const features = extractFeatures(ocrText);
    
    // 2. Load learnable weights from database
    const ruleWeights = options.ruleWeights || await loadRuleWeights();
    
    // 3. Load learned entity patterns
    const entityPatterns = options.entityPatterns || await loadEntityPatterns();
    
    // 4. Score every entity
    const scores = entities.map(entity => 
        scoreEntity(entity, features, ruleWeights, entityPatterns)
    );
    
    // 5. Sort by confidence (highest first)
    scores.sort((a, b) => b.confidence - a.confidence);
    
    const processingTimeMs = Math.round(performance.now() - startTime);
    const bestMatch = scores[0];
    const secondBest = scores[1];
    
    // 6. Determine AI status based on confidence and feature quality
    let aiStatus = 'needs_review';
    if (bestMatch && bestMatch.confidence >= 80 && features.ocrQuality >= 50) {
        aiStatus = 'ai_matched';
    } else if (bestMatch && bestMatch.confidence >= 50 && features.ocrQuality >= 40) {
        aiStatus = 'ai_matched'; 
    }
    
    // 7. Generate human-readable explanation
    const aiSource = bestMatch?.rulesTriggered.length > 0
        ? bestMatch.rulesTriggered.map(r => r.evidence).join('. ') + '.'
        : features.ocrQuality < 30
            ? 'OCR confidence very low. Document may be upside-down or a non-standard format.'
            : 'Could not match to any known entity. Manual review required.';
    
    // 8. Detect document type
    const detectedCategory = features.docTypeKeywords.length > 0
        ? features.docTypeKeywords[0].type
        : '';
    
    // 9. Detect urgency (SOP, subpoena)
    const isUrgent = ['Court SOP', 'Subpoena'].includes(detectedCategory);
    
    return {
        // Classification result
        aiConfidence: bestMatch?.confidence || 0,
        aiStatus,
        aiSource,
        
        // Best match details
        matchedEntity: bestMatch?.entityName || '',
        matchedHubId: bestMatch?.hubId || '',
        matchedSunbizId: bestMatch?.sunbizId || '',
        matchedEntityId: bestMatch?.entityId || '',
        
        // Scoring detail (for the AI banner)
        rulesTriggered: bestMatch?.rulesTriggered || [],
        totalRulesFired: bestMatch?.rulesFired || 0,
        
        // Alternative matches (for "Did you mean?" suggestions)
        alternatives: scores.slice(1, 4).filter(s => s.confidence > 20),
        
        // Detected metadata
        detectedCategory,
        isUrgent,
        
        // Features (saved with feedback for retraining)
        features,
        
        // Performance
        processingTimeMs,
        
        // Margin of victory (how much better the best match is vs. second)
        marginOfVictory: bestMatch && secondBest 
            ? bestMatch.confidence - secondBest.confidence 
            : bestMatch?.confidence || 0,
    };
}


// ═══════════════════════════════════════════════════════════════════════
// 4. FEEDBACK — Send correction signals back to the learning system
// ═══════════════════════════════════════════════════════════════════════

/**
 * Record a feedback event when staff accepts or overrides an AI classification.
 * This is the core learning signal — every call adjusts the model weights.
 * 
 * @param {Object} params
 * @param {string} params.feedbackType - 'ACCEPT' | 'OVERRIDE' | 'MANUAL_LINK' | 'RECLASSIFY'
 * @param {Object} params.classificationResult - The original AI classification output
 * @param {Object} params.correctedTo - What the staff corrected to (entity, hub, sunbiz, docType)
 * @param {Object} params.operator - { id, name, node }
 * @param {number} params.reviewTimeMs - How long staff took to review
 * @param {string} [params.documentId] - Supabase document UUID if available
 * @param {string} [params.queueItemId] - Local queue item ID
 */
export async function submitFeedback({
    feedbackType,
    classificationResult,
    correctedTo,
    operator,
    reviewTimeMs,
    documentId,
    queueItemId,
}) {
    const feedbackRow = {
        document_id: documentId || null,
        queue_item_id: queueItemId?.toString() || null,
        
        // What AI predicted
        ai_predicted_entity: classificationResult.matchedEntity || null,
        ai_predicted_hub: classificationResult.matchedHubId || null,
        ai_confidence: classificationResult.aiConfidence,
        ai_rules_fired: classificationResult.rulesTriggered || [],
        
        // Feedback type
        feedback_type: feedbackType,
        
        // Correct answer
        correct_entity: correctedTo.entity || null,
        correct_hub: correctedTo.hubId || null,
        correct_sunbiz_id: correctedTo.sunbizId || null,
        correct_doc_type: correctedTo.docType || null,
        
        // OCR snapshot for retraining
        ocr_text_snapshot: classificationResult.features?.rawTextPreview || null,
        ocr_features: {
            entities: classificationResult.features?.entityNames || [],
            addresses: classificationResult.features?.addresses || [],
            doc_numbers: classificationResult.features?.docNumbers || [],
            keywords: classificationResult.features?.docTypeKeywords?.map(k => k.type) || [],
        },
        
        // Operator
        operator_id: operator.id,
        operator_name: operator.name,
        node_id: operator.node,
        
        // Timing
        processing_time_ms: classificationResult.processingTimeMs,
        review_time_ms: reviewTimeMs,
    };
    
    try {
        const { data, error } = await supabase
            .from('ai_classification_feedback')
            .insert(feedbackRow)
            .select()
            .single();
        
        if (error) {
            console.error('[AI Feedback] Failed to save:', error.message);
            // Don't throw — feedback is important but shouldn't block the UI
            return { success: false, error: error.message };
        }
        
        console.log(`[AI Feedback] ${feedbackType} recorded. AI said "${classificationResult.matchedEntity}", correct is "${correctedTo.entity}".`);
        return { success: true, feedbackId: data.id };
    } catch (err) {
        console.error('[AI Feedback] Exception:', err);
        return { success: false, error: err.message };
    }
}


// ═══════════════════════════════════════════════════════════════════════
// 5. ANALYTICS — Read model performance
// ═══════════════════════════════════════════════════════════════════════

/**
 * Fetch AI classification performance stats.
 */
export async function getClassificationStats() {
    try {
        const { data, error } = await supabase
            .from('ai_classification_stats')
            .select('*')
            .single();
        
        if (error) return null;
        return data;
    } catch {
        return null;
    }
}

/**
 * Fetch current rule weights and their performance.
 */
export async function getRulePerformance() {
    try {
        const { data, error } = await supabase
            .from('ai_matching_rules')
            .select('*')
            .order('weight', { ascending: false });
        
        if (error) return [];
        return data;
    } catch {
        return [];
    }
}

/**
 * Fetch entity-specific accuracy data.
 */
export async function getEntityAccuracy() {
    try {
        const { data, error } = await supabase
            .from('ai_entity_patterns')
            .select('entity_name, hub_id, total_matches, correct_matches, accuracy_pct')
            .order('total_matches', { ascending: false })
            .limit(20);
        
        if (error) return [];
        return data;
    } catch {
        return [];
    }
}


// ═══════════════════════════════════════════════════════════════════════
// 6. LOCAL MODE — For offline/demo operation without Supabase
// ═══════════════════════════════════════════════════════════════════════

/** In-memory feedback buffer for when Supabase is unavailable */
let localFeedbackBuffer = [];

/**
 * Classify using only local data (no Supabase calls).
 * Uses default weights and no learned patterns.
 * Accumulates feedback in memory for later sync.
 */
export function classifyDocumentLocal(ocrText, entities) {
    const features = extractFeatures(ocrText);
    const ruleWeights = { ...DEFAULT_RULE_WEIGHTS };
    
    // Apply any local feedback adjustments
    for (const fb of localFeedbackBuffer) {
        for (const rule of (fb.rulesTriggered || [])) {
            if (fb.feedbackType === 'ACCEPT') {
                ruleWeights[rule.rule_name] = Math.min((ruleWeights[rule.rule_name] || 0.5) + 0.02, 1.0);
            } else {
                ruleWeights[rule.rule_name] = Math.max((ruleWeights[rule.rule_name] || 0.5) - 0.02, 0.0);
            }
        }
    }
    
    const scores = entities.map(entity => 
        scoreEntity(entity, features, ruleWeights, {})
    );
    scores.sort((a, b) => b.confidence - a.confidence);
    
    const bestMatch = scores[0];
    const secondBest = scores[1];
    
    let aiStatus = 'needs_review';
    if (bestMatch && bestMatch.confidence >= 80 && features.ocrQuality >= 50) {
        aiStatus = 'ai_matched';
    } else if (bestMatch && bestMatch.confidence >= 50 && features.ocrQuality >= 40) {
        aiStatus = 'ai_matched';
    }
    
    const aiSource = bestMatch?.rulesTriggered.length > 0
        ? bestMatch.rulesTriggered.map(r => r.evidence).join('. ') + '.'
        : features.ocrQuality < 30
            ? 'OCR confidence very low. Document may be upside-down or a non-standard format.'
            : 'Could not match to any known entity. Manual review required.';
    
    const detectedCategory = features.docTypeKeywords.length > 0
        ? features.docTypeKeywords[0].type
        : '';
    
    return {
        aiConfidence: bestMatch?.confidence || 0,
        aiStatus,
        aiSource,
        matchedEntity: bestMatch?.entityName || '',
        matchedHubId: bestMatch?.hubId || '',
        matchedSunbizId: bestMatch?.sunbizId || '',
        matchedEntityId: bestMatch?.entityId || '',
        rulesTriggered: bestMatch?.rulesTriggered || [],
        totalRulesFired: bestMatch?.rulesFired || 0,
        alternatives: scores.slice(1, 4).filter(s => s.confidence > 20),
        detectedCategory,
        isUrgent: ['Court SOP', 'Subpoena'].includes(detectedCategory),
        features,
        processingTimeMs: 0,
        marginOfVictory: bestMatch && secondBest 
            ? bestMatch.confidence - secondBest.confidence 
            : bestMatch?.confidence || 0,
    };
}

/**
 * Record feedback locally (for later sync to Supabase).
 */
export function submitFeedbackLocal(feedbackType, classificationResult, correctedTo) {
    localFeedbackBuffer.push({
        feedbackType,
        rulesTriggered: classificationResult.rulesTriggered,
        correctedTo,
        timestamp: new Date().toISOString(),
    });
    console.log(`[AI Local] Feedback buffered: ${feedbackType}. Buffer size: ${localFeedbackBuffer.length}`);
}

/** Get the local feedback buffer (for debugging / syncing) */
export function getLocalFeedbackBuffer() {
    return [...localFeedbackBuffer];
}

/** Clear the local buffer after successful sync */
export function clearLocalFeedbackBuffer() {
    localFeedbackBuffer = [];
}
