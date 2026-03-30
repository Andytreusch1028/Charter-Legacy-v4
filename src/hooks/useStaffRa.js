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
    
    // Thread messages cache
    const [threadMessages, setThreadMessages] = useState({});

    /**
     * fetchStaffRaData
     * Loads the master dataset for RA Staff.
     */
    const fetchStaffRaData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // Add proper role check if needed

            // 1. Fetch open/active threads
            const { data: threadsData, error: threadsErr } = await supabase
                .from('ra_inquiry_threads')
                .select('*')
                .order('updated_at', { ascending: false });

            // 2. Fetch global audit logs (limit 500 for performance)
            const { data: auditData, error: auditErr } = await supabase
                .from('ra_document_audit')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);

            // 3. Fetch client directory (unified auth profiles)
            const { data: rawProfiles, error: clientsErr } = await supabase
                .from('profiles')
                .select('id, first_name, last_name');

            const clientsData = rawProfiles?.map(p => ({
                id: p.id,
                user_id: p.id,
                name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown Client',
                email: p.email || ''
            })) || [];

            // 4. Fetch LLC fleet registry to map business entities
            const { data: llcsData, error: llcsErr } = await supabase
                .from('llcs')
                .select('id, user_id, llc_name, filing_status');

            // 5. Fetch global documents (limit 500 for staff view)
            const { data: docsData, error: docsErr } = await supabase
                .from('registered_agent_documents')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);

            // 6. Fetch RA Settings (Taxonomy, etc.)
            const { data: settingsData, error: settingsErr } = await supabase
                .from('ra_settings')
                .select('*');

            if (threadsErr) alert(`Fetch threads error: ${threadsErr.message}`);
            if (auditErr) alert(`Fetch audit error: ${auditErr.message}`);
            if (docsErr) alert(`Fetch docs error: ${docsErr.message}`);
            if (clientsErr) alert(`Fetch clients error: ${clientsErr.message}`);
            if (llcsErr) alert(`Fetch llcs error: ${llcsErr.message}`);
            if (settingsErr) alert(`Fetch settings error: ${settingsErr.message}`);

            if (threadsData) setGlobalThreads(threadsData);
            if (auditData) setGlobalAuditLogs(auditData);
            if (docsData) setGlobalDocuments(docsData);
            if (clientsData) setClientDirectory(clientsData);
            if (llcsData) setLlcDirectory(llcsData);

            if (settingsData) {
                const settingsMap = settingsData.reduce((acc, s) => {
                    acc[s.key] = s.value;
                    return acc;
                }, {});
                setRaSettings(settingsMap);
            }

        } catch (err) {
            console.error("[Staff RA Data Error] Fetch failure:", err);
            alert(`Fetch Failure: ${err.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
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
             console.error("[Staff RA Data Error] Fetch messages failure:", err);
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
             throw err;
         }
    }, [fetchStaffRaData]);

    const updateRaSettings = useCallback(async (key, value) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('ra_settings')
                .upsert({
                    key,
                    value,
                    updated_at: new Date(),
                    updated_by: user.id
                });

            if (error) throw error;
            setRaSettings(prev => ({ ...prev, [key]: value }));
        } catch (err) {
            console.error("[Staff RA Data Error] Update settings failure:", err);
            alert(`Update Settings Error: ${err.message}`);
        }
    }, []);

    const systemMetrics = useMemo(() => {
        const hasData = globalAuditLogs.length > 0 || globalDocuments.length > 0;
        const recentSuccess = globalAuditLogs.slice(0, 5).filter(l => l.outcome === 'SUCCESS').length;
        
        const maxThreads = parseInt(raSettings.max_auth_threads) || 8;
        return {
            bridge: hasData ? 'Connected' : 'Disconnected',
            compliance: recentSuccess >= 3 ? 'Online' : 'Degraded',
            ocr: globalDocuments.some(d => d.status === 'Pending') ? 'Processing' : 'Standby',
            capacity: Math.max(70, 100 - (globalDocuments.filter(d => d.status === 'Pending').length * 5)),
            authThreads: Math.min(maxThreads, 
                (new Set(globalAuditLogs
                    .filter(log => new Date(log.created_at) > new Date(Date.now() - 30 * 60 * 1000))
                    .map(log => log.user_id)
                ).size + globalDocuments.filter(d => d.status === 'Pending').length) || 1
            ),
            maxThreads: maxThreads
        };
    }, [globalAuditLogs, globalDocuments, clientDirectory, raSettings]);

    const operationsSummary = useMemo(() => {
        const today = new Date().toLocaleDateString();
        return {
            urgentDocCount: globalDocuments.filter(d => d.urgent).length,
            openThreadCount: globalThreads.filter(t => t.status === 'OPEN' || t.status === 'NEW').length,
            processedTodayCount: globalAuditLogs.filter(log => {
                const isToday = new Date(log.created_at).toLocaleDateString() === today;
                return isToday && log.action === 'DOCUMENT_UPLOADED_BY_STAFF';
            }).length,
            totalVaultCount: globalDocuments.length
        };
    }, [globalDocuments, globalThreads, globalAuditLogs]);

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
        updateRaSettings
    };
};
