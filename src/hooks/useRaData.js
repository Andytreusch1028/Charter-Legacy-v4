import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useRaData
 * Orchestrates the Registered Agent domain: Documents, Config, Support, and Audit.
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
    const [auditLogs, setAuditLogs] = useState([]);
    
    // To store messages grouped by thread_id
    const [threadMessages, setThreadMessages] = useState({});

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
            const [docsRes, configRes, inqRes, auditRes] = await Promise.all([
                supabase.from('registered_agent_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('registered_agent_config').select('*').eq('user_id', user.id).single(),
                supabase.from('ra_inquiry_threads').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
                supabase.from('ra_document_audit').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
            ]);

            setDocuments(docsRes.data?.length ? docsRes.data : MOCK_DOCS);
            if (configRes.data) setConfig(configRes.data);
            setInquiries(inqRes.data || []);
            setAuditLogs(auditRes.data || []);

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

    const fetchThreadMessages = useCallback(async (threadId) => {
        try {
            const { data, error } = await supabase
                .from('ra_inquiry_messages')
                .select('*')
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true });
                
            if (!error && data) {
                setThreadMessages(prev => ({ ...prev, [threadId]: data }));
            }
        } catch (err) {
             console.error("[RA Data Error] Fetch messages failure:", err);
        }
    }, []);

    const sendMessage = useCallback(async (threadId, content) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // 1. Insert message
            const { data: msgData, error: msgError } = await supabase
                .from('ra_inquiry_messages')
                .insert({
                    thread_id: threadId,
                    sender_id: user.id,
                    content: content,
                    is_staff: false
                }).select().single();

            if (msgError) throw msgError;

            // 2. Update thread status and updated_at
            await supabase.from('ra_inquiry_threads')
                .update({ status: 'OPEN', updated_at: new Date() })
                .eq('id', threadId);

            // 3. Log Audit Event
            await logRaEvent(user.id, null, null, 'SENT_MESSAGE', 'USER', user.email, { thread_id: threadId });

            // Opt. refresh thread messages locally
            setThreadMessages(prev => ({
                ...prev,
                [threadId]: [...(prev[threadId] || []), msgData]
            }));
            
            // Re-sort inquiries based on updated_at could be done by re-fetching
            fetchRaData();

            return msgData;
        } catch (err) {
             console.error("[RA Data Error] Send message failure:", err);
             return null;
        }
    }, [fetchRaData]);

    const createThread = useCallback(async (subject, initialMessage) => {
         try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // 1. Create Thread
            const { data: threadData, error: threadError } = await supabase
                .from('ra_inquiry_threads')
                .insert({
                    user_id: user.id,
                    subject: subject,
                    status: 'OPEN'
                }).select().single();

            if (threadError) throw threadError;

            // 2. Insert initial message
            if (initialMessage) {
                await supabase.from('ra_inquiry_messages').insert({
                    thread_id: threadData.id,
                    sender_id: user.id,
                    content: initialMessage,
                    is_staff: false
                });
            }

            // 3. Log
            await logRaEvent(user.id, null, null, 'CREATED_THREAD', 'USER', user.email, { subject, thread_id: threadData.id });
            
            fetchRaData(); // Refresh inquiries
            return threadData;
         } catch (err) {
             console.error("[RA Data Error] Create thread failure:", err);
             return null;
         }
    }, [fetchRaData]);

    // Utility auditing function (exported just in case parts of the console need to manually log)
    const logRaEvent = async (userId, documentId, llcId, action, actorType, email, metadata = {}) => {
        await supabase.from('ra_document_audit').insert({
            user_id: userId,
            document_id: documentId,
            llc_id: llcId,
            action: action,
            actor_type: actorType,
            actor_email: email,
            metadata: metadata,
            outcome: 'SUCCESS'
        });
    };

    return {
        loading,
        documents,
        config,
        inquiries,
        auditLogs,
        threadMessages,
        fetchRaData,
        updateConfig,
        setDocuments,
        fetchThreadMessages,
        sendMessage,
        createThread,
        logRaEvent
    };
};
