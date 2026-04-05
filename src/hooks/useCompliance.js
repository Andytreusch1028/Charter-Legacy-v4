import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useCompliance Hook
 * Ported and adapted from legacy compliance-engine.js.
 * Manages live compliance data for the dashboard rings.
 */
export const useCompliance = (user, llcData) => {
    const [status, setStatus] = useState({
        healthScore: 100,
        alerts: [],
        pulseColor: '#00D084', // Standard safe color
        loading: true,
        daysToDeadline: null,
        lifecycleStage: 'FORMATION', // FORMATION, REVIEW, ACTIVE, RECOVERY
        namingStatus: 'PENDING', // PENDING, COMPLIANT, FLAG, PROTECTED
        hasOperatingAgreement: false,
        hasEIN: false
    });

    useEffect(() => {
        if (!user || !llcData) return;

        const calculatePulse = () => {
            let healthScore = 100;
            const alerts = [];
            const now = new Date();
            const currentYear = now.getFullYear();

            // 1. Florida Sunbiz Status Primary Weighting
            const flStatus = (llcData.llc_status || 'ACTIVE').toUpperCase();
            
            if (['ACTIVE'].includes(flStatus)) {
                healthScore = 100;
            } else if (['PENDING', 'NAME HS', 'SETTING UP'].includes(flStatus)) {
                healthScore = 50;
                alerts.push({ type: 'warning', title: `Standing: ${flStatus}` });
            } else if (['INACT/ADMIN DISS', 'REVOKED', 'INACT/UA'].includes(flStatus)) {
                healthScore = 0;
                alerts.push({ type: 'critical', title: `Action Required: ${flStatus}` });
            } else if (['INACT/VOL DISS', 'INACT/MG', 'INACT/CV', 'INACTIVE'].includes(flStatus)) {
                healthScore = 10;
                alerts.push({ type: 'info', title: `Legacy Standing: ${flStatus}` });
            }

            // 2. Formation Date Logic (Only for Active)
            if (healthScore > 50) {
                const formationDate = llcData.created_at ? new Date(llcData.created_at) : null;
                const formationYear = formationDate ? formationDate.getFullYear() : currentYear;

                // 3. Annual Report Deadlines (Florida § 605.0212)
                if (currentYear > formationYear) {
                    const deadline = new Date(currentYear, 4, 1);
                    const windowStart = new Date(currentYear, 0, 1);
                    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

                    if (now > deadline) {
                        healthScore -= 60;
                        alerts.push({ type: 'critical', title: 'Annual Report Overdue' });
                    } else if (now >= windowStart) {
                        healthScore -= 20;
                        if (daysLeft < 30) healthScore -= 20;
                        alerts.push({ type: 'warning', title: `Report Due in ${daysLeft} days` });
                    }
                }

                // 4. Privacy Shield Logic
                if (!llcData.privacy_shield_active) {
                    healthScore -= 30;
                    alerts.push({ type: 'critical', title: 'Privacy Shield Inactive' });
                }
            }

            // 5. Finalize
            healthScore = Math.max(0, healthScore);
            let pulseColor = '#00D084';
            if (healthScore < 40) pulseColor = '#FF3B30';
            else if (healthScore < 80) pulseColor = '#FF9500';

            // 6. Lifecycle Stage Derivation
            let lifecycleStage = 'FORMATION'; // DEFAULT
            if (flStatus === 'ACTIVE') lifecycleStage = 'ACTIVE';
            else if (['PENDING', 'SETTING UP'].includes(flStatus)) lifecycleStage = 'REVIEW';
            else if (healthScore === 0) lifecycleStage = 'RECOVERY';

            // 7. Naming Integrity Check
            let namingStatus = 'COMPLIANT';
            if (llcData.privacy_shield_active) namingStatus = 'PROTECTED';
            if (flStatus === 'NAME HS') namingStatus = 'FLAG';

            setStatus({
                healthScore,
                alerts,
                pulseColor,
                lifecycleStage,
                namingStatus,
                hasOperatingAgreement: !!llcData.has_operating_agreement,
                hasEIN: !!llcData.has_ein,
                loading: false,
                daysToDeadline: currentYear > (llcData.created_at ? new Date(llcData.created_at).getFullYear() : currentYear) 
                    ? Math.ceil((new Date(currentYear, 4, 1) - now) / (1000 * 60 * 60 * 24)) : null
            });
        };

        calculatePulse();
    }, [user, llcData]);

    return status;
};
