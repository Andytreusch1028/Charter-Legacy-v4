import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useStaffData
 * Orchestrates the aggregation of clients, LLCs, and system-wide stats.
 */
export const useStaffData = () => {
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [pendingFilings, setPendingFilings] = useState([]);
    const [stats, setStats] = useState({
        pendingFilings: 0,
        activePrivacies: 0,
        systemHealth: '100%',
        emergencyRequests: 0
    });

    /**
     * fetchStats
     * Aggregates LLC counts and system health metrics.
     */
    const fetchStats = useCallback(async () => {
        try {
            const { data: llcs } = await supabase.from('llcs').select('llc_status');
            const pending = llcs?.filter(l => l.llc_status === 'Setting Up').length || 0;
            const active = llcs?.filter(l => l.llc_status === 'Active').length || 0;
            
            setStats(prev => ({
                ...prev,
                pendingFilings: pending,
                activePrivacies: active
            }));
        } catch (err) {
            console.error("[StaffData Error] Stats fetch failure:", err);
        }
    }, []);

    /**
     * fetchClients
     * Builds the unified client directory by joining profiles, LLCs, Wills, and RA configs.
     */
    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const [profilesRes, llcsRes, willsRes, raRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('llcs').select('*'),
                supabase.from('wills').select('user_id'),
                supabase.from('registered_agent_config').select('user_id')
            ]);

            const clientsMap = {};
            profilesRes.data?.forEach(p => {
                clientsMap[p.id] = { ...p, llcs: [], hasVault: false, hasRA: false };
            });

            llcsRes.data?.forEach(llc => {
                if (clientsMap[llc.user_id]) {
                    clientsMap[llc.user_id].llcs.push(llc);
                }
            });

            willsRes.data?.forEach(will => {
                if (clientsMap[will.user_id]) clientsMap[will.user_id].hasVault = true;
            });

            raRes.data?.forEach(ra => {
                if (clientsMap[ra.user_id]) clientsMap[ra.user_id].hasRA = true;
            });

            setClients(Object.values(clientsMap));
            await fetchStats();
        } catch (err) {
            console.error("[StaffData Error] Client directory construction failure:", err);
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    /**
     * fetchPendingFilings
     * Retrieves LLCs stuck in the 'Setting Up' state for manual fulfillment.
     */
    const fetchPendingFilings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('llcs')
                .select('*')
                .eq('llc_status', 'Setting Up')
                .order('created_at', { ascending: false });
            
            if (!error) setPendingFilings(data || []);
            await fetchStats();
        } catch (err) {
            console.error("[StaffData Error] Filings fetch failure:", err);
        } finally {
            setLoading(false);
        }
    }, [fetchStats]);

    return {
        loading,
        clients,
        pendingFilings,
        stats,
        fetchClients,
        fetchPendingFilings,
        fetchStats
    };
};
