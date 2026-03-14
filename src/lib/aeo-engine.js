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
