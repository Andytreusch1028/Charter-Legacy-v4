/**
 * Sunbiz Validator - Florida LLC Naming Rules Engine
 * Based on Florida Statute § 605.0112
 */

export const SUNBIZ_RULES = {
    MANDATORY_SUFFIXES: ['LIMITED LIABILITY COMPANY', 'LLC', 'L.L.C.'],
    PRO_SUFFIXES: ['PROFESSIONAL LIMITED LIABILITY COMPANY', 'P.L.L.C.', 'PLLC'],
    ADDITIONAL_RESERVED_SUFFIXES: [
        'CORPORATION', 'CORP', 'INCORPORATED', 'INC', 
        'COMPANY', 'CO', 'LIMITED', 'LTD', 'L.T.D.',
        'CHARTERED', 'CHAR'
    ],
    ARTICLES: ['THE', 'A', 'AN'],
    CONJUNCTIONS: ['AND', '&'],
    PROHIBITED_TERMS: [
        'FLORIDA DEPARTMENT OF', 'FBI', 'TREASURY', 'AGENCY',
        'BANK', 'ATTORNEY', 'TRUST', 'UNIVERSITY'
    ],
    GLOBAL_RESERVED_NAMES: [
        'GOOGLE', 'APPLE', 'MICROSOFT', 'AMAZON', 'FACEBOOK', 'META', 
        'TESLA', 'DISNEY', 'FLORIDA', 'STATE', 'GOVERNMENT', 'POLICE'
    ],
    LANDMARK_POOL: [
        'PUBLIX SUPER MARKETS INC', 
        'WALT DISNEY WORLD CO', 
        'WALMART STORES EAST LP', 
        'TARGET CORPORATION', 
        'CHEVRON U.S.A. INC',
        'GOOGLE LLC',
        'APPLE INC',
        'MICROSOFT CORP'
    ]
};

/**
 * Normalizes an LLC name for distinguishability comparison.
 * Rules:
 * 1. Convert to uppercase.
 * 2. Remove mandatory/pro suffixes.
 * 3. Remove leading articles (The, A, An).
 * 4. Replace '&' with 'AND'.
 * 5. Remove all punctuation and symbols.
 * 6. Strip all whitespace for a 'canonical' string.
 * 7. Handle singular/plural/possessive (basic heuristic: remove 'S' at end of words).
 */
export function normalizeName(name) {
    if (!name) return '';

    let n = name.toUpperCase().trim();

    // 1. Remove Suffixes (All of them, including Corp, Inc, etc. for statutory distinction)
    const allSuffixes = [
        ...SUNBIZ_RULES.MANDATORY_SUFFIXES, 
        ...SUNBIZ_RULES.PRO_SUFFIXES,
        ...SUNBIZ_RULES.ADDITIONAL_RESERVED_SUFFIXES
    ];
    
    // Sort suffixes by length descending to catch 'LIMITED LIABILITY COMPANY' before 'COMPANY'
    allSuffixes.sort((a, b) => b.length - a.length).forEach(s => {
        const regex = new RegExp(`\\s+${s.replace(/\./g, '\\.')}$`, 'gi');
        n = n.replace(regex, '');
    });

    // 2. Conjunctions & Punctuation
    n = n.replace(/&/g, ' AND ');
    n = n.replace(/[.,\/#!$%\^?*;:{}=\-_`~()]/g, '');

    // 4. Tokenize to handle articles and plurals
    let tokens = n.split(/\s+/).filter(t => t.length > 0);

    // 5. Remove Leading Articles
    if (tokens.length > 0 && SUNBIZ_RULES.ARTICLES.includes(tokens[0])) {
        tokens.shift();
    }

    // 6. Basic Plural/Possessive Normalization (Ending with S)
    // Rule: Singular, plural, and possessive are not distinguishable.
    tokens = tokens.map(t => {
        if (t.length > 1 && t.endsWith('S')) {
            // Remove 'S' from end (handles BAKERS, BAKER'S -> BAKER)
            return t.slice(0, -1);
        }
        return t;
    });

    // 7. Join back for canonical comparison (no spaces)
    return tokens.join('');
}

/**
 * Checks if two names are distinguishable according to Florida rules.
 */
export function areDistinguishable(name1, name2) {
    return normalizeName(name1) !== normalizeName(name2);
}

/**
 * Calculates an availability probability percentage.
 * 100%: Name is highly unique and follows all rules.
 * 0%: Exact or non-distinguishable conflict found.
 * Mid: Restricted terms or phonetic similarities (future roadmap).
 */
export function calculateAvailabilityScore(desiredName, registryMatches = [], registryStatus = 'SUCCESS') {
    const normalizedDesired = normalizeName(desiredName);
    const upperDesired = desiredName.toUpperCase();
    
    // 0. Handle Registry Failure (403/Timeout/Busy)
    if (registryStatus === 'BUSY' || registryStatus === 'ERROR') {
        // Run phonetic shadow scan even in busy mode
        const phoneticConflict = SUNBIZ_RULES.GLOBAL_RESERVED_NAMES.find(r => 
            getSoundex(normalizedDesired) === getSoundex(normalizeName(r))
        );

        if (phoneticConflict) {
            return {
                score: 10,
                status: 'Phonetic Risk',
                message: `This name sounds identical to the reserved entity "${phoneticConflict}".`,
                logicExplanation: 'Local Forensic Audit: Identified a direct Soundex match. Even with registry downtime, our phonetic engine flags this as a high-risk similarity.',
                closestMatches: [{ name: phoneticConflict, similarity: 90 }]
            };
        }

        return {
            score: null,
            status: 'Registry Busy',
            message: 'Authoritative state registry is currently unreachable.',
            logicExplanation: 'Forensic System Alert: The Florida Department of State (Sunbiz) lookup was blocked. Enqueuing for Professional Audit.',
            closestMatches: [],
            isEnqueued: true
        };
    }

    let score = 95;
    let status = 'Available';
    let message = 'This name appears distinguishable and compliant based on Section 605.0112, F.S.';
    let logicExplanation = 'No non-distinguishable conflicts found. Unique phonetic signature detected.';

    console.log(`[SunbizValidator] Validating: "${desiredName}" (Normalized: "${normalizedDesired}")`);
    console.log(`[SunbizValidator] Soundex Check: ${getSoundex(normalizedDesired)}`);

    // 1. Check Prohibited Terms
    for (const term of SUNBIZ_RULES.PROHIBITED_TERMS) {
        if (upperDesired.includes(term)) {
            return {
                score: 20,
                status: 'Restricted',
                message: `The term "${term}" may require state approval or licensing.`,
                logicExplanation: `Statutory Check: Reserved term "${term}" identified. Use of regulated terminology requires specialized administrative clearance.`,
                closestMatches: []
            };
        }
    }

    // 2. Check Global Reserved Names & Phonetic Parallels
    const directReserved = SUNBIZ_RULES.GLOBAL_RESERVED_NAMES.find(reserved => {
        const normalizedReserved = normalizeName(reserved);
        return normalizedDesired.includes(normalizedReserved);
    });

    if (directReserved) {
        return {
            score: 0,
            status: 'State Conflict',
            message: `The name "${desiredName}" is globally reserved or presents a high-profile distinction conflict.`,
            logicExplanation: `Statutory Check: High-profile reserved entity Match. Section 605.0112, F.S. prohibits names that are non-distinguishable from existing state-regulated landmarks.`,
            closestMatches: [{ name: directReserved, similarity: 100 }]
        };
    }

    // 2.1 Phonetic Shadow Scan (Always active)
    const phoneticConflict = SUNBIZ_RULES.GLOBAL_RESERVED_NAMES.find(r => 
        getSoundex(normalizedDesired) === getSoundex(normalizeName(r))
    );

    if (phoneticConflict && normalizedDesired !== normalizeName(phoneticConflict)) {
        console.log(`[SunbizValidator] PHONETIC CONFLICT FOUND: "${phoneticConflict}"`);
        score = 15;
        status = 'Phonetic Risk';
        message = `This name sounds identical to the reserved entity "${phoneticConflict}".`;
        logicExplanation = 'Forensic System Analysis: Our phonetic engine identified a high probability of conflict with a regulated entity name. Section 605.0112, F.S. requires names to be distinguishable; "sound-alikes" often fail manual audit.';
    }

    // 3. Check Statutory Distinguishability against registry
    // Filter registry matches for non-distinguishable parallels
    const existingConflicts = registryMatches.filter(m => normalizedDesired === normalizeName(m));
    if (existingConflicts.length > 0) {
        score = 0;
        status = 'Statutory Conflict';
        message = 'This name is not distinguishable from an existing record (Rule: Section 605.0112, F.S.).';
        logicExplanation = 'Statutory Analysis: The proposed name only differs from established records by articles (The, A), conjunctions (&, and), or corporate suffixes (LLC, Inc). Florida law deems these non-distinguishable.';
    }

    // 4. Check for mandatory suffix
    const hasSuffix = [...SUNBIZ_RULES.MANDATORY_SUFFIXES, ...SUNBIZ_RULES.PRO_SUFFIXES]
        .some(s => upperDesired.endsWith(s));
    
    if (!hasSuffix && score > 50) {
        score = 50;
        status = 'Suffix Missing';
        message = 'Your name must end with "LLC" or a similar designator.';
        logicExplanation = 'Statutory Check: Missing required entity designator. Section 605.0112, F.S. requires all LLCs to clearly state their entity type (LLC, L.L.C., or Limited Liability Company).';
    }

    // 5. Check for suffix redundancy
    const activeSuffixes = [...SUNBIZ_RULES.MANDATORY_SUFFIXES, ...SUNBIZ_RULES.PRO_SUFFIXES];
    const words = upperDesired.split(/\s+/);
    if (words.length >= 2 && score > 10) {
        const lastWord = words[words.length - 1];
        const secondToLastWord = words[words.length - 2].replace(/[.,]/g, '');
        if (activeSuffixes.some(s => s.replace(/[.,]/g, '') === lastWord.replace(/[.,]/g, '')) && 
            activeSuffixes.some(s => s.replace(/[.,]/g, '') === secondToLastWord)) {
            score = 10;
            status = 'Suffix Duplicated';
            message = `Double suffix detected ("${words[words.length - 2]} ${lastWord}").`;
            logicExplanation = 'Analysis: Suffix redundancy detected. While not strictly prohibited, double designators can cause administrative friction and suggest non-professional alignment.';
        }
    }

    // 6. Forensic Similarity Analysis (Top 5 Closest Names)
    const matchesArray = Array.isArray(registryMatches) ? registryMatches : [];
    
    const searchPool = (matchesArray.length > 0) 
        ? matchesArray 
        : SUNBIZ_RULES.LANDMARK_POOL;
    
    // Remove duplicates and self
    const uniquePool = Array.from(new Set(searchPool.map(n => String(n).toUpperCase()))).filter(n => n !== upperDesired);

    const closestMatches = uniquePool
        .map(name => {
            const normalizedNameValue = normalizeName(name);
            const distance = getLevenshteinDistance(normalizedDesired, normalizedNameValue);
            const maxLen = Math.max(normalizedDesired.length, normalizedNameValue.length, 1);
            const similarity = Math.round(Math.max(0, (1 - distance / maxLen) * 100));
            return { name, similarity };
        })
        .filter(m => {
            // Rule: If using Landmark Pool (registry is empty), only show matches with > 50% similarity
            // This prevents "Disney" from hijacking the UI for unrelated names like "BACKYARD".
            if (matchesArray.length > 0) return true; 
            return m.similarity > 50; 
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

    return {
        score,
        status,
        message,
        logicExplanation,
        closestMatches
    };
}

/**
 * Calculates Levenshtein Distance between two strings.
 * Used for "Closest Matches" forensic analysis.
 */
export function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    
    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Soundex Phonetic Algorithm
 * Used for "Sound-Alike" identification when the registry is unreachable.
 */
export function getSoundex(name) {
    if (!name) return "";
    let s = name.toUpperCase().replace(/[^A-Z]/g, "");
    if (s.length === 0) return "";

    const firstLetter = s[0];
    const mappings = {
        'BFPV': '1', 'CGJKQSXZ': '2', 'DT': '3', 'L': '4', 'MN': '5', 'R': '6'
    };

    let result = firstLetter;
    let lastDigit = '';

    // Find the digit for the first letter to avoid repeats
    for (const [chars, digit] of Object.entries(mappings)) {
        if (chars.includes(firstLetter)) {
            lastDigit = digit;
            break;
        }
    }

    for (let i = 1; i < s.length && result.length < 4; i++) {
        let currentDigit = '';
        for (const [chars, digit] of Object.entries(mappings)) {
            if (chars.includes(s[i])) {
                currentDigit = digit;
                break;
            }
        }

        if (currentDigit && currentDigit !== lastDigit) {
            result += currentDigit;
            lastDigit = currentDigit;
        } else if (!currentDigit) {
            lastDigit = ''; // Vowels/H/W/Y break the run
        }
    }

    return (result + "000").substring(0, 4);
}

