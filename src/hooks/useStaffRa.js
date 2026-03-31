import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useStaffRa
 * Orchestrates the Staff-side Registered Agent Operations.
 */
export const useStaffRa = () => {
    const [loading, setLoading] = useState(true);
    const [globalThreads, setGlobalThreads] = useState([]);
    const [globalAuditLogs, setGlobalAuditLogs] = useState([]);
    const [globalDocuments, setGlobalDocuments] = useState([]);
    const [clientDirectory, setClientDirectory] = useState([]);
    const [llcDirectory, setLlcDirectory] = useState([]);
    const [raSettings, setRaSettings] = useState({});
    const [threadMessages, setThreadMessages] = useState({});
    const [bridgeHealthy, setBridgeHealthy] = useState(true);

    /**
     * fetchStaffRaData
     * Loads the master dataset for RA Staff.
     */
    const fetchStaffRaData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Add proper role check if needed
            
            // Bridge is responsive
            setBridgeHealthy(true);

            // 1. Fetch open/active threads
            const [threadsRes, auditRes, profilesRes, llcsRes, docsRes, settingsRes] = await Promise.all([
                supabase.from('ra_inquiry_threads').select('*, llcs(llc_name)').order('updated_at', { ascending: false }),
                supabase.from('ra_document_audit').select('*, llcs(llc_name), registered_agent_documents(title)').order('created_at', { ascending: false }).limit(500),
                supabase.from('profiles').select('id, first_name, last_name'),
                supabase.from('llcs').select('id, user_id, llc_name, filing_status'),
                supabase.from('registered_agent_documents').select('*, llcs(llc_name)').order('created_at', { ascending: false }).limit(500),
                supabase.from('ra_settings').select('*')
            ]);
            
            if (threadsRes.data) setGlobalThreads(threadsRes.data);
            if (auditRes.data) setGlobalAuditLogs(auditRes.data);
            if (docsRes.data) setGlobalDocuments(docsRes.data);
            
            if (profilesRes.data) {
                const clientsData = profilesRes.data.map(p => ({
                    id: p.id,
                    user_id: p.id,
                    name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown Client',
                    email: p.email || ''
                }));
                setClientDirectory(clientsData);
            }
            
            if (llcsRes.data) setLlcDirectory(llcsRes.data);

            if (settingsRes.data) {
                const settingsMap = settingsRes.data.reduce((acc, s) => {
                    acc[s.key] = s.value;
                    return acc;
                }, {});
                setRaSettings(settingsMap);
            }

        } catch (err) {
            console.error("[Staff RA Data Error] Fetch failure:", err);
            setBridgeHealthy(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaffRaData();

        // 1. Audit Ledger Channel (Realtime inserts for Terminal & Ledger)
        const auditChannel = supabase
            .channel('ra_audit_updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ra_document_audit' }, () => {
                fetchStaffRaData();
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setBridgeHealthy(true);
                if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setBridgeHealthy(false);
            });

        // 2. Document Registry Channel (Urgent counts & Vault updates)
        const docChannel = supabase
            .channel('ra_doc_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'registered_agent_documents' }, () => {
                fetchStaffRaData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(auditChannel);
            supabase.removeChannel(docChannel);
        };
    }, [fetchStaffRaData]);

    const fetchThreadMessages = useCallback(async (threadId) => {
        try {
            const { data, error } = await supabase
                .from('ra_inquiry_messages')
                .select('*')
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true });
                
            if (!error && data) {
                setThreadMessages(prev => ({ ...prev, [threadId]: data }));
                setBridgeHealthy(true);
            }
        } catch (err) {
             console.error("[Staff RA Data Error] Fetch messages failure:", err);
             setBridgeHealthy(false);
        }
    }, []);

    const sendStaffMessage = useCallback(async (threadId, content) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // 1. Insert message as staff
            const { data: msgData, error: msgError } = await supabase
                .from('ra_inquiry_messages')
                .insert({
                    thread_id: threadId,
                    sender_id: user.id,
                    content: content,
                    is_staff: true
                }).select().single();

            if (msgError) throw msgError;

            // 2. Update thread status to ANSWERED
            await supabase.from('ra_inquiry_threads')
                .update({ status: 'ANSWERED', updated_at: new Date() })
                .eq('id', threadId);

            // 3. Log Audit Event
            // Note: In Staff context, we might not always have the exact client user_id handy unless passed, 
            // but we can log it with Staff as the Actor.
            await supabase.from('ra_document_audit').insert({
                user_id: user.id, // Logged against staff or target user if passed
                action: 'STAFF_SENT_MESSAGE',
                actor_type: 'CHARTER_ADMIN',
                actor_email: user.email,
                metadata: { thread_id: threadId },
                outcome: 'SUCCESS'
            });

            // Update local state
            setThreadMessages(prev => ({
                ...prev,
                [threadId]: [...(prev[threadId] || []), msgData]
            }));
            
            fetchStaffRaData();
            return msgData;
        } catch (err) {
             console.error("[Staff RA Data Error] Send message failure:", err);
             setBridgeHealthy(false);
             return null;
        }
    }, [fetchStaffRaData]);

    const uploadDocumentToClient = useCallback(async (clientUserId, llcId, title, type, fileObject, urgent = false) => {
         try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            let finalDownloadUrl = fileObject; 

            // If a physical Javascript File object is passed, stream it to Cloud Storage
            if (fileObject && typeof fileObject === 'object' && fileObject.name) {
                const fileExt = fileObject.name.split('.').pop();
                const fileName = `${clientUserId}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('ra-documents')
                    .upload(fileName, fileObject, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('ra-documents')
                    .getPublicUrl(fileName);
                
                finalDownloadUrl = publicUrl;
            }

            // 1. Insert document
            const { data: docData, error: docError } = await supabase
                .from('registered_agent_documents')
                .insert({
                    user_id: clientUserId,
                    llc_id: llcId || null,
                    title: title,
                    type: type,
                    download_url: finalDownloadUrl || null,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    urgent: urgent,
                    status: 'FORWARDED',
                    received_at: new Date(),
                    forwarded_at: new Date()
                }).select().single();

            if (docError) throw docError;

            // 2. Log Audit Event
            await supabase.from('ra_document_audit').insert({
                user_id: clientUserId,
                document_id: docData.id,
                llc_id: llcId || null,
                action: 'DOCUMENT_UPLOADED_BY_STAFF',
                actor_type: 'CHARTER_ADMIN',
                actor_email: user.email,
                metadata: { type, urgent },
                outcome: 'SUCCESS'
            });

            console.log("[Staff RA Data Success] Doc inserted:", docData);
            fetchStaffRaData();
            return docData;
         } catch (err) {
             console.error("[Staff RA Data Error] Upload failure:", err);
             setBridgeHealthy(false);
             throw err;
         }
    }, [fetchStaffRaData]);

    const updateDocumentStatus = useCallback(async (docId, newStatus, actionType = 'DOCUMENT_STATUS_CHANGE') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // 1. Update document
            const { data: docData, error: docError } = await supabase
                .from('registered_agent_documents')
                .update({ 
                    status: newStatus,
                    updated_at: new Date(),
                    // Automatically clear urgency when handled/archived or explicitly requested
                    urgent: (newStatus === 'FORWARDED' || newStatus === 'ARCHIVED' || actionType === 'URGENCY_RESOLVED') ? false : undefined,
                    // Automatically set forwarded_at if status is FORWARDED
                    ...(newStatus === 'FORWARDED' ? { forwarded_at: new Date() } : {})
                })
                .eq('id', docId)
                .select().single();

            if (docError) throw docError;

            // 2. Log Audit Event
            await supabase.from('ra_document_audit').insert({
                user_id: docData.user_id,
                document_id: docId,
                llc_id: docData.llc_id,
                action: actionType,
                actor_type: 'CHARTER_ADMIN',
                actor_email: user.email,
                metadata: { previous_status: docData.status, new_status: newStatus },
                outcome: 'SUCCESS'
            });

            fetchStaffRaData();
            return docData;
        } catch (err) {
            console.error("[Staff RA Data Error] Status update failure:", err);
            setBridgeHealthy(false);
            throw err;
        }
    }, [fetchStaffRaData]);

    const deleteDocument = useCallback(async (docId) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            // 1. Get info for audit before delete
            const { data: docData } = await supabase
                .from('registered_agent_documents')
                .select('*')
                .eq('id', docId)
                .single();

            // 2. Delete
            const { error: deleteError } = await supabase
                .from('registered_agent_documents')
                .delete()
                .eq('id', docId);

            if (deleteError) throw deleteError;

            // 3. Log Audit Event
            await supabase.from('ra_document_audit').insert({
                user_id: docData?.user_id,
                document_id: docId,
                action: 'DOCUMENT_DELETED_BY_STAFF',
                actor_type: 'CHARTER_ADMIN',
                actor_email: user.email,
                outcome: 'SUCCESS'
            });

            fetchStaffRaData();
            return true;
        } catch (err) {
            console.error("[Staff RA Data Error] Delete failure:", err);
            setBridgeHealthy(false);
            throw err;
        }
    }, [fetchStaffRaData]);

    const updateRaSettings = useCallback(async (key, value) => {
        try {
            const { error } = await supabase
                .from('ra_settings')
                .upsert({ key, value, updated_at: new Date() });
            if (error) throw error;
            fetchStaffRaData();
        } catch (err) {
            console.error("Failed to update RA settings:", err);
            setBridgeHealthy(false);
            throw err;
        }
    }, [fetchStaffRaData]);

    const systemMetrics = useMemo(() => {
        const maxT = parseInt(raSettings?.max_auth_threads) || 8;
        // Synthesize auth threads based on unique actors in recent logs or default to a healthy load
        const uniqueActors = new Set(globalAuditLogs.slice(0, 20).map(l => l.actor_email)).size;
        const currentThreads = Math.min(uniqueActors || 1, maxT);
        
        // Scan for recent failures in compliance
        const recentFailures = globalAuditLogs.slice(0, 50).filter(l => {
            const age = Date.now() - new Date(l.created_at).getTime();
            return l.outcome === 'FAILURE' && age < 3600000; // 1 hour window
        }).length;

        return {
            totalDocuments: globalDocuments.length,
            urgentSops: globalDocuments.filter(d => d.urgent && d.status !== 'ARCHIVED').length,
            openInquiries: globalThreads.filter(t => t.status === 'OPEN' || t.status === 'NEEDS_ACTION').length,
            totalAuditLogs: globalAuditLogs.length,
            // System Hub specific (Zen-Power)
            compliance: recentFailures > 0 ? 'Issue' : 'Online',
            ocr: globalDocuments.some(d => d.status === 'PROCESSING') ? 'Processing' : (globalDocuments.length > 0 ? 'Online' : 'Standby'),
            bridge: bridgeHealthy ? 'Connected' : 'Error',
            capacity: 100 - ((currentThreads / maxT) * 100),
            authThreads: currentThreads,
            maxThreads: maxT
        };
    }, [globalDocuments, globalThreads, globalAuditLogs, raSettings, bridgeHealthy]);

    const operationsSummary = useMemo(() => ({
        activeEntities: new Set(llcDirectory.map(l => l.id)).size,
        pendingActions: globalDocuments.filter(d => d.urgent).length,
        lastActivity: globalAuditLogs[0]?.created_at,
        // RA Ops Sector specific (Zen-Power)
        urgentDocCount: globalDocuments.filter(d => d.urgent && d.status !== 'ARCHIVED').length,
        openThreadCount: globalThreads.filter(t => t.status === 'OPEN' || t.status === 'NEEDS_ACTION').length,
        processedTodayCount: globalAuditLogs.filter(l => {
            const d = new Date(l.created_at);
            const today = new Date();
            return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }).length,
        totalVaultCount: globalDocuments.length
    }), [llcDirectory, globalDocuments, globalAuditLogs, globalThreads]);

    return {
        loading,
        globalThreads,
        globalAuditLogs,
        globalDocuments,
        clientDirectory,
        llcDirectory,
        raSettings,
        threadMessages,
        systemMetrics,
        operationsSummary,
        fetchStaffRaData,
        fetchThreadMessages,
        sendStaffMessage,
        uploadDocumentToClient,
        updateRaSettings,
        updateDocumentStatus,
        deleteDocument
    };
};
