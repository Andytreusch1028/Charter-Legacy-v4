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
     * Persists a system or user action to the audit_logs table.
     */
    const logAction = useCallback(async (action, status = 'Success', details = null) => {
        setIsLogging(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('audit_logs').insert([{
                user_id: selectedClient?.id || user?.id || null,
                action,
                status,
                details,
                timestamp: new Date().toISOString()
            }]);
        } catch (err) {
            console.error("[Audit Error] Failed to log action:", err);
        } finally {
            setIsLogging(false);
        }
    }, [selectedClient]);

    /**
     * fetchLogs
     * Retrieves the most recent 50 logs for the terminal view.
     */
    const fetchLogs = useCallback(async (limit = 50) => {
        try {
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(limit);
            
            if (!error) {
                setTerminalLogs(data);
                return data;
            }
        } catch (err) {
            console.error("[Audit Error] Terminal fetch failure:", err);
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
