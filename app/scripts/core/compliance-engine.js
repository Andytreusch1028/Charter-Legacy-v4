/**
 * Compliance Pulse Engine
 * Statutory deadline monitoring and health scoring for Florida entities.
 */

const ComplianceEngine = {
    /**
     * Calculates compliance health and alerts for an entity.
     * @param {Object} entity - The entity object from CONFIG.
     * @returns {Object} { healthScore, alerts, pulseColor }
     */
    getCompliancePulse(entity) {
        if (!entity || !entity.formation_date) {
            return { healthScore: 100, alerts: [], pulseColor: '#34C759' };
        }

        const alerts = [];
        let healthScore = 100;
        const now = new Date();
        const currentYear = now.getFullYear();
        const formationYear = new Date(entity.formation_date).getFullYear();

        // 1. Annual Report Logic (Florida Statutes § 605.0212)
        // Reports are due between Jan 1 and May 1 of the year AFTER formation.
        if (currentYear > formationYear) {
            const deadline = new Date(currentYear, 4, 1); // May 1st
            const windowStart = new Date(currentYear, 0, 1); // Jan 1st

            if (now > deadline) {
                // Past Deadline: Critical (Entities are administratively dissolved after Sept)
                // Note: Sunbiz allows late filings with $400 penalty, but we flag as High risk.
                healthScore -= 60;
                alerts.push({
                    type: 'critical',
                    title: 'Annual Report Overdue',
                    text: `The deadline for the ${currentYear} Annual Report was May 1st. Failure to file may lead to administrative dissolution.`,
                    cta: 'File Reinstatement',
                    action: 'reinstatement'
                });
            } else if (now >= windowStart) {
                // Within Window: Action Required
                const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
                healthScore -= 20;
                alerts.push({
                    type: 'warning',
                    title: 'Annual Report Window Open',
                    text: `The ${currentYear} Annual Report is due by May 1st. ${daysLeft} days remaining.`,
                    cta: 'File Now',
                    action: 'annual_report'
                });
            }
        }

        // 2. Professional License Tracking (Vertical Specific)
        if (entity.license_expiry) {
            const expiry = new Date(entity.license_expiry);
            const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                healthScore -= 80;
                alerts.push({
                    type: 'critical',
                    title: 'License Expired',
                    text: `Professional license expired on ${entity.license_expiry}. Operational capacity may be compromised.`,
                    cta: 'Renew License',
                    link: entity.product_type === 'medical_pllc' ? 'https://mqa-internet.doh.state.fl.us' : 'https://www.myfloridalicense.com'
                });
            } else if (diffDays <= 90) {
                healthScore -= 30;
                alerts.push({
                    type: 'warning',
                    title: 'License Renewal Approaching',
                    text: `Professional license expires in ${diffDays} days (${entity.license_expiry}).`,
                    cta: 'Renew Now',
                    link: entity.product_type === 'medical_pllc' ? 'https://mqa-internet.doh.state.fl.us' : 'https://www.myfloridalicense.com'
                });
            }
        }

        // 3. Registered Agent Status
        if (!entity.ra_service && !entity.agent_name) {
            healthScore -= 15;
            alerts.push({
                type: 'info',
                title: 'No Registered Agent On File',
                text: 'Florida Statutes require a Registered Agent for all active entities.',
                cta: 'Appoint Agent',
                action: 'statement_of_change'
            });
        }

        // Finalize state
        healthScore = Math.max(0, healthScore);
        let pulseColor = '#34C759'; // Green (Safe)
        if (healthScore < 50) pulseColor = '#FF3B30'; // Red (Critical)
        else if (healthScore < 85) pulseColor = '#FF9500'; // Amber (Attention)

        return { healthScore, alerts, pulseColor };
    }
};

window.ComplianceEngine = ComplianceEngine;
