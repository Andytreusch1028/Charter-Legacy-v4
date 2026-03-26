import { useState, useEffect, useCallback } from 'react';

/**
 * useViewIntelligence
 * 
 * The brain of the adaptive dashboard. Tracks interaction signals,
 * scores each view, and returns the recommended + active view.
 * 
 * Views: 'command' | 'situational' | 'fleet'
 * 
 * Signal Sources:
 *  - entityCount: How many LLCs the user owns
 *  - loginCount: Total logins tracked
 *  - recentActions: Actions taken in the last 30 days
 *  - hasUrgentAction: Whether any entity has health < 100
 *  - daysSinceLastLogin: Recency of engagement
 * 
 * Override: User can manually select a view. This persists until cleared.
 */

const STORAGE_KEY = 'charter_view_intelligence';

const getStoredData = (userId) => {
    try {
        const raw = localStorage.getItem(`${STORAGE_KEY}_${userId || 'anon'}`);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
};

const storeData = (userId, data) => {
    try {
        localStorage.setItem(`${STORAGE_KEY}_${userId || 'anon'}`, JSON.stringify(data));
    } catch { /* silent fail */ }
};

const defaultSignals = {
    loginCount: 0,
    lastLogin: null,
    actions: [],         // Array of { type: string, timestamp: number }
    override: null,      // 'command' | 'situational' | 'fleet' | null
    firstSeen: Date.now()
};

export const useViewIntelligence = (userId, entityCount = 0, hasUrgentAction = false) => {
    const [signals, setSignals] = useState(() => {
        return getStoredData(userId) || { ...defaultSignals };
    });

    // On mount: record a login event
    useEffect(() => {
        const stored = getStoredData(userId) || { ...defaultSignals };
        const now = Date.now();
        
        // Only count as new login if > 5 min since last
        const timeSinceLast = stored.lastLogin ? now - stored.lastLogin : Infinity;
        if (timeSinceLast > 5 * 60 * 1000) {
            stored.loginCount = (stored.loginCount || 0) + 1;
            stored.lastLogin = now;
        }
        
        if (!stored.firstSeen) stored.firstSeen = now;

        setSignals(stored);
        storeData(userId, stored);
    }, [userId]);

    // Compute recent actions (last 30 days)
    const recentActions = (signals.actions || []).filter(
        a => Date.now() - a.timestamp < 30 * 24 * 60 * 60 * 1000
    ).length;

    // Compute days since last login
    const daysSinceLastLogin = signals.lastLogin 
        ? Math.floor((Date.now() - signals.lastLogin) / (1000 * 60 * 60 * 24))
        : 999;

    // ═══════════════════════════════════════════
    //  SCORING ENGINE
    // ═══════════════════════════════════════════
    const scores = { command: 0, situational: 0, fleet: 0 };

    // FLEET signals: Multi-entity users
    if (entityCount >= 2) scores.fleet += 45;
    if (entityCount >= 4) scores.fleet += 20;

    // COMMAND signals: Power users
    if (entityCount === 1) scores.command += 20;
    if (signals.loginCount > 10) scores.command += 25;
    else if (signals.loginCount > 5) scores.command += 15;
    if (recentActions > 5) scores.command += 30;
    else if (recentActions > 2) scores.command += 10;

    // SITUATIONAL signals: New or infrequent users
    if (signals.loginCount <= 3) scores.situational += 35;
    if (hasUrgentAction) scores.situational += 25;
    if (recentActions < 2) scores.situational += 20;
    if (daysSinceLastLogin > 30) scores.situational += 15;

    // Base scores to prevent zeros
    scores.command += 5;
    scores.situational += 10;  // slight bias toward simplicity
    scores.fleet += 5;

    // Determine recommendation
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const recommended = ranked[0][0];

    // Active view: override wins, else recommendation
    const activeView = signals.override || recommended;

    // Record an action (call this when user takes lifecycle actions)
    const recordAction = useCallback((actionType) => {
        setSignals(prev => {
            const updated = {
                ...prev,
                actions: [...(prev.actions || []), { type: actionType, timestamp: Date.now() }]
                    .slice(-100)  // Keep last 100 actions max
            };
            storeData(userId, updated);
            return updated;
        });
    }, [userId]);

    // Set manual override
    const setOverride = useCallback((viewId) => {
        setSignals(prev => {
            const updated = { ...prev, override: viewId };
            storeData(userId, updated);
            return updated;
        });
    }, [userId]);

    // Clear override (revert to auto-recommendation)
    const clearOverride = useCallback(() => {
        setSignals(prev => {
            const updated = { ...prev, override: null };
            storeData(userId, updated);
            return updated;
        });
    }, [userId]);

    return {
        activeView,
        recommended,
        isOverridden: !!signals.override,
        scores,
        signals: {
            loginCount: signals.loginCount,
            recentActions,
            entityCount,
            hasUrgentAction,
            daysSinceLastLogin
        },
        setOverride,
        clearOverride,
        recordAction
    };
};
