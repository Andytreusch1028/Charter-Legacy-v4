/**
 * Sunbiz Validator - Florida LLC Naming Rules Engine
 * Based on Florida Statute § 605.0112
 */

export const SUNBIZ_RULES = {
    MANDATORY_SUFFIXES: ['LIMITED LIABILITY COMPANY', 'LLC', 'L.L.C.'],
    PRO_SUFFIXES: ['PROFESSIONAL LIMITED LIABILITY COMPANY', 'P.L.L.C.', 'PLLC'],
    ARTICLES: ['THE', 'A', 'AN'],
    PROHIBITED_TERMS: [
        'FLORIDA DEPARTMENT OF', 'FBI', 'TREASURY', 'AGENCY',
        'BANK', 'ATTORNEY', 'TRUST', 'UNIVERSITY'
    ],
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

    // 1. Remove Suffixes
    const allSuffixes = [...SUNBIZ_RULES.MANDATORY_SUFFIXES, ...SUNBIZ_RULES.PRO_SUFFIXES];
    allSuffixes.forEach(s => {
        const regex = new RegExp(`\\s+${s.replace(/\./g, '\\.')}$`, 'g');
        n = n.replace(regex, '');
    });

    // 2. Conjunctions
    n = n.replace(/&/g, ' AND ');

    // 3. Punctuation and Symbols
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
export function calculateAvailabilityScore(desiredName, existingNames = []) {
    const normalizedDesired = normalizeName(desiredName);
    console.log(`[DEBUG] Normalized Desired: "${normalizedDesired}"`);
    
    // Check Prohibited Terms
    const upperDesired = desiredName.toUpperCase();
    for (const term of SUNBIZ_RULES.PROHIBITED_TERMS) {
        if (upperDesired.includes(term)) {
            return {
                score: 20,
                status: 'Restricted',
                message: `The term "${term}" may require state approval or licensing.`
            };
        }
    }

    // Check for suffix
    const hasSuffix = [...SUNBIZ_RULES.MANDATORY_SUFFIXES, ...SUNBIZ_RULES.PRO_SUFFIXES]
        .some(s => upperDesired.endsWith(s));
    
    if (!hasSuffix) {
        return {
            score: 50,
            status: 'Suffix Missing',
            message: 'Your name must end with "LLC" or a similar designator.'
        };
    }

    // Check for suffix duplication (e.g., QUANTUM LLC LLC)
    const activeSuffixes = [...SUNBIZ_RULES.MANDATORY_SUFFIXES, ...SUNBIZ_RULES.PRO_SUFFIXES];
    const words = upperDesired.split(/\s+/);
    if (words.length >= 2) {
        const lastWord = words[words.length - 1];
        const secondToLastWord = words[words.length - 2].replace(/[.,]/g, '');
        // Check both exact and common punctuation variants
        if (activeSuffixes.some(s => s.replace(/[.,]/g, '') === lastWord.replace(/[.,]/g, '')) && 
            activeSuffixes.some(s => s.replace(/[.,]/g, '') === secondToLastWord)) {
            return {
                score: 10,
                status: 'Suffix Duplicated',
                message: `Double suffix detected ("${words[words.length - 2]} ${lastWord}"). Please remove one.`
            };
        }
    }

    // Check against existing database results
    const allSuffixes = [...SUNBIZ_RULES.MANDATORY_SUFFIXES, ...SUNBIZ_RULES.PRO_SUFFIXES];
    let nameNoSuffix = upperDesired;
    allSuffixes.forEach(s => {
        const regex = new RegExp(`\\s+${s.replace(/\./g, '\\.')}$`, 'g');
        nameNoSuffix = nameNoSuffix.replace(regex, '');
    });

    for (const existing of existingNames) {
        const upperExisting = existing.toUpperCase().trim();
        let existingNoSuffix = upperExisting;
        allSuffixes.forEach(s => {
            const regex = new RegExp(`\\s+${s.replace(/\./g, '\\.')}$`, 'g');
            existingNoSuffix = existingNoSuffix.replace(regex, '');
        });

        const normalizedExisting = normalizeName(existing);

        // Exact Match Path
        if (nameNoSuffix === existingNoSuffix) {
            return {
                score: 0,
                status: 'Exact Conflict',
                message: `This name is already registered as "${existing}". Please try a completely different name.`
            };
        }

        // 2. Suffix Duplication Check (e.g., QUANTUM LLC LLC)
        const activeSuffixes = [...SUNBIZ_RULES.MANDATORY_SUFFIXES, ...SUNBIZ_RULES.PRO_SUFFIXES];
        const words = upperDesired.split(/\s+/).filter(w => w.length > 0);
        if (words.length >= 2) {
            const lastWord = words[words.length - 1].replace(/[.,]/g, '');
            const secondToLastWord = words[words.length - 2].replace(/[.,]/g, '');
            const normalizedSuffixes = activeSuffixes.map(s => s.replace(/[.,]/g, ''));
            
            if (normalizedSuffixes.includes(lastWord) && normalizedSuffixes.includes(secondToLastWord)) {
                return {
                    score: 10,
                    status: 'Suffix Duplicated',
                    message: `Strategic Alert: Detected duplicated suffix "${words[words.length - 2]} ${words[words.length - 1]}". Please select only one designator.`
                };
            }
        }

        // Close Match Path
        if (normalizedDesired === normalizedExisting) {
            return {
                score: 10,
                status: 'Likely Conflict',
                message: `This name is very similar to "${existing}". There is a chance the state won't accept it.`
            };
        }
    }




    return {
        score: 95,
        status: 'Available',
        message: 'This name appears distinguishable and compliant.'
    };
}
