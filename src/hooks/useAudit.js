import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useAudit
 * Strategic hook for system-wide action tracking and terminal log retrieval.
 */
export const useAudit = (selectedClient = null) => {
    const [terminalLogs, setTerminalLogs] = useState([]);
    const [isLogging, setIsLogging] = useState(false);

    /**
     * logAction
     * Persists a system or user action to the unified fleet ledger (ra_document_audit).
     */
    const logAction = useCallback(async (action, status = 'Success', details = null) => {
        setIsLogging(true);
        try {
            // Strategic IP Resolution: Resolve real-time client IP for forensic accountability
            let clientIp = '72.14.201.121'; // Default Fallback
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                if (data.ip) clientIp = data.ip;
            } catch (ipErr) {
                console.warn("[Audit] IP Resolution failed, using fallback:", ipErr);
            }

            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('ra_document_audit').insert([{
                user_id: selectedClient?.id || user?.id || null,
                llc_id: details?.llcId || null,
                action,
                outcome: status.toUpperCase(), 
                metadata: details,
                actor_type: user?.email?.includes('charter') ? 'CHARTER_ADMIN' : 'USER',
                actor_email: user?.email || 'unknown@charterlegacy.com',
                ip_address: clientIp,
                user_agent: window.navigator.userAgent,
                created_at: new Date().toISOString()
            }]);
        } catch (err) {
            console.error("[Audit Error] Failed to log action:", err);
        } finally {
            setIsLogging(false);
        }
    }, [selectedClient]);

    /**
     * fetchLogs
     * Retrieves fleet operations from ra_document_audit with robust filtering.
     * @param {Object} filters - Optional filters: { llcId, userId, actorEmail, action, startDate, endDate, limit }
     */
    const fetchLogs = useCallback(async (filters = {}) => {
        const { llcId, userId, actorEmail, action, startDate, endDate, limit = 50 } = filters;
        
        try {
            // Dynamic Select: only use !inner when filtering to avoid pruning null llc_id system logs
            let selectStr = `
                *,
                llcs${llcId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(llcId) ? '!inner' : ''}(llc_name),
                registered_agent_documents(title, download_url)
            `;

            let query = supabase
                .from('ra_document_audit')
                .select(selectStr);

            // Apply Dynamic Filters
            if (llcId) {
                // If it's a valid UUID, search by ID. Otherwise, search by LLC Name via join.
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(llcId);
                if (isUUID) {
                    query = query.eq('llc_id', llcId);
                } else {
                    // Filter the result set by joined table column
                    query = query.ilike('llcs.llc_name', `%${llcId}%`);
                }
            }
            if (userId) query = query.eq('user_id', userId);
            if (actorEmail) query = query.ilike('actor_email', `%${actorEmail}%`);
            if (action) query = query.eq('action', action);
            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) query = query.lte('created_at', endDate);

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;

            if (data) {
                // Map to terminal format
                const mappedLogs = data.map(log => ({
                    ...log,
                    timestamp: log.created_at,
                    status: log.outcome === 'SUCCESS' ? 'Success' : 'Error'
                }));
                setTerminalLogs(mappedLogs);
                return mappedLogs;
            } else {
                setTerminalLogs([]);
            }
        } catch (err) {
            console.error("[Audit Error] Terminal fetch failure:", err);
            // On failure, clear the list so the user knows the current filter returned nothing/errored
            setTerminalLogs([]);
        }
        return [];
    }, []);

    return {
        terminalLogs,
        isLogging,
        logAction,
        fetchLogs
    };
};
