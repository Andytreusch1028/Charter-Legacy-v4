import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useRaData
 * Orchestrates the Registered Agent domain: Documents, Config, and Support.
 */
export const useRaData = () => {
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [config, setConfig] = useState({
        priority_forwarding: true,
        auto_dispose_marketing: true,
        sms_interrupt: false,
        data_broker_shield: true
    });
    const [inquiries, setInquiries] = useState([]);

    const MOCK_DOCS = [
        { id: 'mock-1', title: 'Annual Report Filing Confirmation', date: 'Feb 12, 2026', type: 'State FL', status: 'Forwarded', urgent: false },
        { id: 'mock-2', title: 'Service of Process — Inquiry',      date: 'Feb 09, 2026', type: 'Legal Notice', status: 'Forwarded', urgent: true },
    ];

    /**
     * fetchRaData
     * Loads the core RA dataset for the authenticated user.
     */
    const fetchRaData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setDocuments(MOCK_DOCS);
                return;
            }

            // Parallel fetch for RA domain
            const [docsRes, configRes, inqRes] = await Promise.all([
                supabase.from('registered_agent_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('registered_agent_config').select('*').eq('user_id', user.id).single(),
                supabase.from('ra_inquiry_threads').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
            ]);

            setDocuments(docsRes.data?.length ? docsRes.data : MOCK_DOCS);
            if (configRes.data) setConfig(configRes.data);
            setInquiries(inqRes.data || []);

        } catch (err) {
            console.error("[RA Data Error] Fetch failure:", err);
            setDocuments(MOCK_DOCS);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * updateConfig
     * Persists configuration changes to the RA config table.
     */
    const updateConfig = useCallback(async (key, value) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('registered_agent_config').upsert(
                { user_id: user.id, [key]: value, updated_at: new Date() },
                { onConflict: 'user_id' }
            );
            if (!error) setConfig(prev => ({ ...prev, [key]: value }));
        } catch (err) {
            console.error("[RA Data Error] Config update failure:", err);
        }
    }, []);

    return {
        loading,
        documents,
        config,
        inquiries,
        fetchRaData,
        updateConfig,
        setDocuments
    };
};
