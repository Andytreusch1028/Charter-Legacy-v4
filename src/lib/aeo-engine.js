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

/**
 * GEO METRICS (Generative Engine Optimization)
 * Composite scoring for AI Answer Engine visibility.
 */
export const GEO_METRICS = {
    // Composite GEO Score: weighted blend of all metrics
    calculateGEOScore: (pageData) => {
        const citation = AEO_METRICS.calculateCitationProbability(pageData);
        const recency = AEO_METRICS.calculateRecencyScore(pageData.lastModified || new Date().toISOString());
        const consensus = AEO_METRICS.calculateConsensusHealth(pageData.externalMentions || []);
        
        // GEO Weights: Citation (40%), Recency (30%), Consensus (30%)
        return Math.round(citation * 0.4 + recency * 0.3 + consensus * 0.3);
    },

    // Validates llms.txt structure
    checkLlmsTxtHealth: (content) => {
        if (!content) return { score: 0, issues: ['File not found'] };
        const issues = [];
        
        if (!content.startsWith('#')) issues.push('Missing title heading');
        if (!content.includes('## Core Features')) issues.push('Missing Core Features section');
        if (!content.includes('## Links')) issues.push('Missing Links section');
        if (content.length < 200) issues.push('Content too short (< 200 chars)');
        if (content.length > 5000) issues.push('Content too long (> 5000 chars)');
        
        const score = Math.max(0, 100 - (issues.length * 20));
        return { score, issues };
    },

    // Checks robots.txt for AI bot access
    checkBotAccessScore: (content) => {
        if (!content) return { score: 0, bots: {} };
        
        const bots = {
            GPTBot: content.includes('GPTBot') && !content.includes('Disallow: /\n'),
            'Claude-Web': content.includes('Claude-Web'),
            PerplexityBot: content.includes('PerplexityBot'),
            'Google-Extended': content.includes('Google-Extended'),
            'Anthropic-AI': content.includes('Anthropic-AI')
        };
        
        const allowed = Object.values(bots).filter(Boolean).length;
        const score = Math.round((allowed / Object.keys(bots).length) * 100);
        
        return { score, bots };
    },

    // Schema coverage checker
    checkSchemaCoverage: () => {
        const schemas = document.querySelectorAll('script[type="application/ld+json"]');
        const types = [];
        schemas.forEach(s => {
            try {
                const data = JSON.parse(s.textContent);
                types.push(data['@type']);
            } catch (e) { /* skip invalid */ }
        });
        
        const required = ['Organization', 'FAQPage', 'HowTo', 'Service'];
        const covered = required.filter(r => types.includes(r));
        const score = Math.round((covered.length / required.length) * 100);
        
        return { score, covered, missing: required.filter(r => !types.includes(r)), total: types.length };
    }
};
