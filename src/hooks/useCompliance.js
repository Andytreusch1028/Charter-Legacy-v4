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
        daysToDeadline: null
    });

    useEffect(() => {
        if (!user || !llcData) return;

        const calculatePulse = () => {
            let healthScore = 100;
            const alerts = [];
            const now = new Date();
            const currentYear = now.getFullYear();
            
            // 1. Formation Date Logic
            const formationDate = llcData.created_at ? new Date(llcData.created_at) : null;
            const formationYear = formationDate ? formationDate.getFullYear() : currentYear;

            // 2. Annual Report Deadlines (Florida § 605.0212)
            // Due Jan 1 - May 1 of year following formation
            if (currentYear > formationYear) {
                const deadline = new Date(currentYear, 4, 1); // May 1st
                const windowStart = new Date(currentYear, 0, 1); // Jan 1st
                const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

                if (now > deadline) {
                    healthScore -= 60;
                    alerts.push({ type: 'critical', title: 'Annual Report Overdue' });
                } else if (now >= windowStart) {
                    healthScore -= 20;
                    if (daysLeft < 30) healthScore -= 20; // Extra urgency
                    alerts.push({ type: 'warning', title: `Due in ${daysLeft} days` });
                }
            }

            // 3. Privacy Shield Logic
            if (!llcData.privacy_shield_active) {
                healthScore -= 50;
                alerts.push({ type: 'critical', title: 'Privacy Shield Inactive' });
            }

            // 4. Finalize
            healthScore = Math.max(0, healthScore);
            let pulseColor = '#00D084'; // Green
            if (healthScore < 50) pulseColor = '#FF3B30'; // Red
            else if (healthScore < 85) pulseColor = '#FF9500'; // Amber

            setStatus({
                healthScore,
                alerts,
                pulseColor,
                loading: false,
                daysToDeadline: currentYear > formationYear ? Math.ceil((new Date(currentYear, 4, 1) - now) / (1000 * 60 * 60 * 24)) : null
            });
        };

        calculatePulse();
    }, [user, llcData]);

    return status;
};
