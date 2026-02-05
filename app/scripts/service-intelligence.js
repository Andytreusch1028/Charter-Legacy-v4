/**
 * Sovereign Service Intelligence
 * Heuristics for ranking Sunbiz offerings based on entity context and user intent.
 */

const SUNBIZ_SERVICES = [
    {
        id: 'annual-report',
        name: 'Annual Report Filing',
        description: 'Mandatory statutory pulse required by May 1st.',
        baseFee: 138.75,
        category: 'Compliance',
        action: 'annual_report'
    },
    {
        id: 'annual-report-bundle',
        name: 'Annual Report + Amendment Bundle',
        description: 'Update Registered Agent or Officers for free during your annual pulse.',
        baseFee: 138.75,
        category: 'Compliance',
        action: 'annual_report_bundle'
    },
    {
        id: 'articles-correction',
        name: 'Articles of Correction',
        description: 'Surgically fix errors in your original filing. Institutional discount applied.',
        baseFee: 0.00,
        category: 'Refinement',
        action: 'correction'
    },
    {
        id: 'articles-amendment',
        name: 'Articles of Amendment',
        description: 'Legal name changes or structural modifications to your Articles of Organization.',
        baseFee: 25.00,
        category: 'Refinement',
        action: 'amendment'
    },
    {
        id: 'certified-copy',
        name: 'Certified Copy of Record',
        description: 'Official state-certified evidence of your entity\'s foundation.',
        baseFee: 30.00,
        category: 'Verification',
        action: 'certified_copy'
    },
    {
        id: 'certificate-status',
        name: 'Certificate of Status',
        description: 'Verify your entity is active and compliant with Florida statutes.',
        baseFee: 5.00,
        category: 'Verification',
        action: 'cert_status'
    },
    {
        id: 'dissolution',
        name: 'Institutional Dissolution',
        description: 'Orderly wind-down and closure of the Sovereign entity.',
        baseFee: 25.00,
        category: 'Lifecycle',
        action: 'dissolution'
    },
    {
        id: 'reinstatement',
        name: 'Legacy Reinstatement',
        description: 'Restore an administratively dissolved entity to active status.',
        baseFee: 100.00,
        category: 'Lifecycle',
        action: 'reinstatement'
    },
    {
        id: 'foreign_qualification',
        name: 'Foreign Qualification',
        description: 'Register an out-of-state entity to legally do business in Florida.',
        category: 'Formation',
        baseFee: 125.00,
        processingTime: '2-3 business days',
        action: 'foreign_qualification',
        href: '/app/foreign-qualification-wizard.html',
        complexity: 'Moderate',
        isPremium: true
    }
];

function calculateRelevance(service, context) {
    let score = 0;
    const now = new Date();
    
    // 1. Statutory Proximity (Annual Report)
    if (service.action.includes('annual_report')) {
        const deadline = new Date(now.getFullYear(), 4, 1); // May 1st
        const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays < 60) score += 100;
        if (diffDays <= 0) score += 150; // Critical late status
    }

    // 2. Lifecycle Window (Correction)
    if (service.action === 'correction' && context.entityAgeDays < 15) {
        score += 80;
    }

    // 3. Behavioral Intent (Signals from Browsing)
    if (context.recentViews.includes('documents') && service.category === 'Verification') {
        score += 50;
    }

    // 4. Cross-LLC History
    if (context.userPatterns.includes(service.action)) {
        score += 40;
    }

    // 5. Dissolution Status
    if (context.isDissolved && service.action === 'reinstatement') {
        score += 1000; // Absolute Priority
    }

    return score;
}

function getRankedServices(entity, userContext) {
    // Calculate entity age
    const createdAt = entity.created_at ? new Date(entity.created_at) : new Date();
    const entityAgeDays = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));

    const context = {
        entityAgeDays,
        recentViews: JSON.parse(localStorage.getItem('zenith_intent_signals') || '[]'),
        userPatterns: JSON.parse(localStorage.getItem('zenith_user_patterns') || '[]'),
        isDissolved: entity.llc_status && entity.llc_status.toLowerCase().includes('dissolved')
    };

    return SUNBIZ_SERVICES
        .map(s => ({ ...s, score: calculateRelevance(s, context) }))
        .sort((a, b) => b.score - a.score);
}

window.ServiceIntelligence = { getRankedServices, SUNBIZ_SERVICES };
