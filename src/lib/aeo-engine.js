/**
 * AEO Engine - Answer Engine Optimization Logic
 * 
 * Calculated metrics to determine how effectively LLMs (ChatGPT, Claude, etc.)
 * can retrieve and cite Charter Legacy content.
 */

export const AEO_METRICS = {
    // Probability that an LLM will cite a specific page as a primary source
    calculateCitationProbability: (pageData) => {
        let score = 50; // Base score
        
        // E-E-A-T Weight
        if (pageData.expertAuthor) score += 15;
        if (pageData.depthOfCoverage > 0.8) score += 10;
        
        // Structure Weight (AEO specific)
        if (pageData.hasJSONLD) score += 10;
        if (pageData.hasQAStructure) score += 15;
        
        // Negative Signals
        if (pageData.pitchyLanguage) score -= 20;
        if (pageData.isAIGenerated && !pageData.hasHumanReview) score -= 30;
        
        return Math.min(100, Math.max(0, score));
    },

    // Recency is critical for AEO citation
    calculateRecencyScore: (lastModified) => {
        const now = new Date();
        const modified = new Date(lastModified);
        const diffDays = Math.floor((now - modified) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 7) return 100;
        if (diffDays < 30) return 90;
        if (diffDays < 90) return 70;
        if (diffDays < 180) return 40;
        return 10;
    },

    // Consensus: How many external sources agree with this claim?
    calculateConsensusHealth: (externalMentions) => {
        const count = externalMentions?.length || 0;
        if (count > 10) return 100;
        if (count > 5) return 80;
        if (count > 2) return 50;
        return 20;
    },

    /**
     * ADVANCED METRICS (Infinite Tail)
     */

    // Grounding: Fact consistency and corroboration probability
    calculateGroundingScore: (text, facts = []) => {
        if (!text) return 0;
        let hits = 0;
        facts.forEach(f => {
            if (text.toLowerCase().includes(f.toLowerCase())) hits++;
        });
        const ratio = hits / (facts.length || 1);
        return Math.min(100, Math.round(ratio * 100));
    },

    // Neutrality: Measuring "salesy" vs. "educational" tone
    // Low score = Pitchy/Aggressive, High score = Neutral/Reference-grade
    calculateNeutralityIndex: (text) => {
        const pitchWords = ['guaranteed', 'best', 'cheapest', 'proven', 'secret', 'miracle', 'revolutionary', 'buy now'];
        let count = 0;
        pitchWords.forEach(w => {
            const regex = new RegExp(`\\b${w}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) count += matches.length;
        });
        
        const score = 100 - (count * 15);
        return Math.max(0, score);
    },

    // Passage Independence: How well a block stands alone for LLM ripple-out
    calculatePassageStructure: (text) => {
        if (!text) return 0;
        const hasTopicSentence = /^[A-Z]/.test(text); // Starts with capital
        const hasConclusion = /[.!?]$/.test(text); // Ends with punctuation
        const length = text.split(' ').length;
        const isIdealLength = length > 20 && length < 80; // LLM sweet spot for citations

        let score = 40;
        if (hasTopicSentence) score += 20;
        if (hasConclusion) score += 20;
        if (isIdealLength) score += 20;
        
        return score;
    },

    // UPL (Unauthorized Practice of Law) Guardrail
    // Returns { safe: boolean, violations: string[] }
    checkUplCompliance: (text) => {
        if (!text) return { safe: true, violations: [] };
        const uplPhrases = [
            'legal advice',
            'we recommend',
            'you should',
            'our attorneys',
            'represent you',
            'guarantee',
            'we will advise',
            'illegal',
            'lawyer',
            'attorney-client',
            'court'
        ];
        const violations = [];
        uplPhrases.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
            if (regex.test(text)) {
                violations.push(phrase);
            }
        });
        return {
            safe: violations.length === 0,
            violations
        };
    }
};

/**
 * Recency Pulse
 * Simulates the bulk update of metadata to signal freshness to crawlers.
 */
export const triggerRecencyPulse = async (entities) => {
    // In a real app, this would perform a batch Supabase update
    console.log(`[AEO ENGINE] Triggering Recency Pulse for ${entities.length} entities...`);
    return entities.map(e => ({
        ...e,
        last_refreshed: new Date().toISOString()
    }));
};
