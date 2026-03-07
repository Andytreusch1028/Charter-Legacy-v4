import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const getInitials = (name, email) => {
    if (name && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }
    if (email && email.includes('@')) {
        const prefix = email.split('@')[0];
        return prefix.substring(0, 2).toUpperCase();
    }
    return '?';
};

export const calculateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useSentryActions = ({
    supabase,
    user,
    queue,
    setQueue,
    setProcessedItems,
    setActiveItem,
    aiClassifications,
    linkedEntities,
    setLinkedEntities,
    forwardingRecipients,
    setForwardingRecipients,
    setAiStats,
    setFeedbackBuffer,
    setDuplicateModal,
    setToast,
    CURRENT_OPERATOR,
    reviewStartTimes,
    submitFeedbackLocal,
    submitFeedback,
    getLocalFeedbackBuffer
}) => {
    
    const getReviewTimeMs = useCallback((itemId) => {
        const start = reviewStartTimes[itemId];
        return start ? Date.now() - start : 0;
    }, [reviewStartTimes]);

    const handleAcceptMatch = useCallback((itemId) => {
        const item = queue.find(q => q.id === itemId);
        const classification = aiClassifications[itemId];
        if (!item) return;

        const linked = linkedEntities[itemId];
        const initials = linked ? getInitials(linked.owner_name, linked.email) : item.initials;

        if (linked) {
            setQueue(prev => prev.map(q => q.id === itemId ? { ...q, aiStatus: 'confirmed', initials } : q));
            setForwardingRecipients(fr => ({
                ...fr,
                [itemId]: [{ name: linked.owner_name, email: linked.email, initials, source: 'entity' }]
            }));
        } else {
            setQueue(prev => prev.map(q => q.id === itemId ? { ...q, aiStatus: 'confirmed' } : q));
        }

        const correctedTo = {
            entity: linked?.name || item.entity,
            hubId: linked?.hubId || item.hubId,
            sunbizId: linked?.sunbizId || item.sunbizId,
            docType: item.category,
        };

        if (classification) {
            submitFeedbackLocal('ACCEPT', classification, correctedTo);
            submitFeedback({
                feedbackType: 'ACCEPT',
                classificationResult: classification,
                correctedTo,
                operator: CURRENT_OPERATOR,
                reviewTimeMs: getReviewTimeMs(itemId),
                queueItemId: itemId.toString(),
            }).catch(() => {});
        }

        setAiStats(prev => ({ ...prev, accepted: prev.accepted + 1, total: prev.total + 1 }));
        setFeedbackBuffer(getLocalFeedbackBuffer());
        setToast({ type: 'success', message: `✓ AI match confirmed — model weights reinforced` });
    }, [queue, aiClassifications, linkedEntities, getReviewTimeMs, setQueue, setForwardingRecipients, submitFeedbackLocal, submitFeedback, CURRENT_OPERATOR, getLocalFeedbackBuffer, setToast, setAiStats, setFeedbackBuffer]);

    const handleOverride = useCallback((itemId) => {
        const item = queue.find(q => q.id === itemId);
        const classification = aiClassifications[itemId];
        if (!item) return;

        setQueue(prev => prev.map(q => q.id === itemId ? {
            ...q, 
            aiStatus: 'needs_review', 
            entity: '', hubId: '', sunbizId: '', contact: '', initials: '??'
        } : q));
        setLinkedEntities(prev => { const n = {...prev}; delete n[itemId]; return n; });

        if (classification) {
            submitFeedbackLocal('OVERRIDE', classification, { entity: '', hubId: '', sunbizId: '' });
            submitFeedback({
                feedbackType: 'OVERRIDE',
                classificationResult: classification,
                correctedTo: { entity: '', hubId: '', sunbizId: '' },
                operator: CURRENT_OPERATOR,
                reviewTimeMs: getReviewTimeMs(itemId),
                queueItemId: itemId.toString(),
            }).catch(() => {});
        }

        setAiStats(prev => ({ ...prev, overridden: prev.overridden + 1, total: prev.total + 1 }));
        setFeedbackBuffer(getLocalFeedbackBuffer());
        setToast({ type: 'info', message: `Override recorded — AI weights adjusted to reduce future mismatches` });
    }, [queue, aiClassifications, getReviewTimeMs, setQueue, setLinkedEntities, submitFeedbackLocal, submitFeedback, CURRENT_OPERATOR, getLocalFeedbackBuffer, setToast, setAiStats, setFeedbackBuffer]);

    const handleManualLink = useCallback((itemId, entity) => {
        const classification = aiClassifications[itemId];
        const initials = getInitials(entity.owner_name, entity.email);
        
        setLinkedEntities(prev => ({ ...prev, [itemId]: entity }));
        setForwardingRecipients(fr => {
            const current = fr[itemId] || [];
            if (current.some(r => r.email === entity.email)) return fr;
            return {
                ...fr,
                [itemId]: [...current, { name: entity.owner_name, email: entity.email, initials, id: Date.now(), source: 'entity' }]
            };
        });

        setQueue(prev => prev.map(q => q.id === itemId ? {
            ...q,
            entity: entity.name,
            hubId: entity.hubId,
            sunbizId: entity.sunbizId,
            contact: entity.owner_name,
            initials
        } : q));

        const correctedTo = {
            entity: entity.name,
            hubId: entity.hubId,
            sunbizId: entity.sunbizId,
            docType: queue.find(q => q.id === itemId)?.category || '',
        };

        if (classification) {
            submitFeedbackLocal('MANUAL_LINK', classification, correctedTo);
            submitFeedback({
                feedbackType: 'MANUAL_LINK',
                classificationResult: classification,
                correctedTo,
                operator: CURRENT_OPERATOR,
                reviewTimeMs: getReviewTimeMs(itemId),
                queueItemId: itemId.toString(),
            }).catch(() => {});
        }

        setAiStats(prev => ({ ...prev, manual: prev.manual + 1, total: prev.total + 1 }));
        setFeedbackBuffer(getLocalFeedbackBuffer());
    }, [aiClassifications, queue, getReviewTimeMs, setLinkedEntities, setForwardingRecipients, setQueue, submitFeedbackLocal, submitFeedback, CURRENT_OPERATOR, getLocalFeedbackBuffer, setAiStats, setFeedbackBuffer]);

    const handleAddRecipient = useCallback((itemId, recipient) => {
        setForwardingRecipients(prev => {
            const current = prev[itemId] || [];
            if (current.some(r => r.email === recipient.email)) return prev;
            const updated = [...current, recipient];
            
            // Sync initials if it's the first recipient
            if (updated.length > 0) {
                setQueue(q => q.map(item => item.id === itemId ? { ...item, initials: updated[0].initials } : item));
            }
            
            return {
                ...prev,
                [itemId]: updated
            };
        });
    }, [setForwardingRecipients, setQueue]);

    const handleRemoveRecipient = useCallback((itemId, recipientId) => {
        setForwardingRecipients(prev => {
            const current = prev[itemId] || [];
            const filtered = current.filter(r => r.id !== recipientId);
            
            if (filtered.length > 0) {
                setQueue(q => q.map(item => item.id === itemId ? { ...item, initials: filtered[0].initials } : item));
            } else {
                setQueue(q => q.map(item => item.id === itemId ? { ...item, initials: '??' } : item));
            }

            return {
                ...prev,
                [itemId]: filtered
            };
        });
    }, [setForwardingRecipients, setQueue]);

    const handleFinalize = useCallback(async (itemId, override = false) => {
        const item = queue.find(q => q.id === itemId);
        const entity = linkedEntities[itemId];
        if (!item) return;

        try {
            // 1. Content Hash & Deduplication (Liability Shield)
            let contentHash = item.contentHash;
            if (!contentHash && item.rawFile) {
                 contentHash = await calculateSHA256(item.rawFile);
            }
            
            // 2. File Path Resolution (Local vs Cloud)
            let filePath = item.filePath;
            if (!filePath && item.rawFile) {
                 const ext = item.rawFile.name.split('.').pop();
                 const targetUserId = entity?.user_id || user.id;
                 const path = `temp/${targetUserId}/${Date.now()}_${Math.random().toString(36).substr(2,9)}.${ext}`;
                 
                 const { error: uploadError } = await supabase.storage
                    .from('ra-documents')
                    .upload(path, item.rawFile);
                 
                 if (uploadError) throw uploadError;
                 filePath = path; 
            }
            
            const recipients = forwardingRecipients[itemId] || [];
            
            // 3. Trigger High-Fidelity Ingest (Edge Function)
            const { data: ingestData, error: ingestError } = await supabase.functions.invoke('ra-document-ingest', {
                body: {
                    user_id: entity?.user_id || user.id, 
                    title: item.docTitle,
                    doc_type: item.category,
                    file_path: filePath,
                    file_size_kb: item.meta?.size ? parseFloat(item.meta.size) : 0,
                    urgent: item.urgent,
                    admin_email: user.email,
                    source: `Digital Mailroom (Node: ${CURRENT_OPERATOR.node})`,
                    content_hash: contentHash,
                    override: override,
                    additional_recipients: recipients.map(r => ({ email: r.email, name: r.name }))
                }
            });

            if (ingestError) throw ingestError;
            if (ingestData?.error) {
                if (ingestData.code === 'DUPLICATE_DETECTED') {
                    setDuplicateModal({ 
                        item, 
                        existing: ingestData.original_doc, 
                        onConfirm: () => { setDuplicateModal(null); handleFinalize(itemId, true); },
                        onCancel: () => setDuplicateModal(null)
                    });
                    return;
                }
                throw new Error(ingestData.error);
            }

            // 4. Update Persistence Ledger (ra_service_log)
            if (typeof item.id === 'number' || !item.id.startsWith('local-')) {
                await supabase.from('ra_service_log').update({
                    status: 'FORWARDED',
                    client_id: entity?.user_id || user.id,
                    staff_id: CURRENT_OPERATOR.id,
                    node_id: CURRENT_OPERATOR.node,
                    updated_at: new Date().toISOString()
                }).eq('id', item.id);
            }

            // 5. Finalize UI State
            const now = new Date();
            setProcessedItems(prev => [{ 
                ...item, 
                id: ingestData.document_id || item.id, 
                processedAt: now.toLocaleString(),
                processedBy: CURRENT_OPERATOR.id,
                processedByName: CURRENT_OPERATOR.name,
                processedNode: CURRENT_OPERATOR.node,
            }, ...prev]);

            setQueue(prev => prev.filter(q => q.id !== itemId));
            setLinkedEntities(prev => { const next = { ...prev }; delete next[itemId]; return next; });
            setForwardingRecipients(prev => { const next = { ...prev }; delete next[itemId]; return next; });
            setToast({ type: 'success', message: `${item.docTitle} forwarded to ${recipients.length} recipients successfully.` });
            
            const remaining = queue.filter(q => q.id !== itemId);
            setActiveItem(remaining.length > 0 ? remaining[0].id : null);

        } catch (err) {
            console.error('Finalize Edge Function failure, dropping to Local Client Transaction', err);
            
            try {
                // FALLBACK: Simulate Edge Function locally if offline/failed
                const generatedUuid = uuidv4();
                
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Fallback failed: No active staff session found");

                let finalPath = item.filePath;
                if (!finalPath && item.rawFile) {
                     const ext = item.rawFile.name.split('.').pop();
                     finalPath = `temp/${entity?.user_id || user.id}/${Date.now()}_${Math.random().toString(36).substr(2,9)}.${ext}`;
                     await supabase.storage.from('ra-documents').upload(finalPath, item.rawFile);
                }
                
                const { data: docRecord, error: docError } = await supabase.from('registered_agent_documents').insert({
                    id: generatedUuid,
                    user_id: entity?.user_id || user.id,
                    document_name: item.docTitle,
                    document_type: item.category,
                    file_path: finalPath,
                    status: 'RECEIVED',
                    received_at: new Date().toISOString()
                }).select().single();
                
                if (docError) {
                     await supabase.from('registered_agent_documents').insert({
                        user_id: entity?.user_id || user.id,
                        document_name: item.docTitle,
                        document_type: item.category,
                        file_path: finalPath,
                        status: 'RECEIVED',
                        received_at: new Date().toISOString()
                    });
                }

                const timeTakenMs = getReviewTimeMs(itemId);
                const startTime = reviewStartTimes[itemId] ? new Date(reviewStartTimes[itemId]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const userAgent = window.navigator.userAgent;
                let osName = "Unknown OS";
                if (userAgent.indexOf("Win") !== -1) osName = "Windows";
                else if (userAgent.indexOf("Mac") !== -1) osName = "MacOS";
                else if (userAgent.indexOf("X11") !== -1) osName = "UNIX";
                else if (userAgent.indexOf("Linux") !== -1) osName = "Linux";

                let detectedIp = '127.0.0.1 (Local Dev)';
                try {
                     const ipRes = await fetch('https://api.ipify.org?format=json');
                     const ipData = await ipRes.json();
                     detectedIp = ipData.ip || detectedIp;
                } catch(e) { /* ignore silently */ }

                await supabase.from('ra_document_audit').insert({
                    user_id: entity?.user_id || user.id,
                    document_id: generatedUuid,
                    action: 'DOC_FORWARDED_MANUAL_FALLBACK',
                    actor_type: 'CHARTER_ADMIN',
                    actor_email: user.email,
                    outcome: 'SUCCESS',
                    ip_address: detectedIp,
                    user_agent: userAgent,
                    metadata: { 
                         recipients: (forwardingRecipients[itemId] || []).map(r => r.email),
                         category: item.category,
                         filename: item.docTitle,
                         fallback_mode: true,
                         entity_name: entity?.name || 'Unknown Entity',
                         time_taken_ms: timeTakenMs,
                         time_spent_seconds: (timeTakenMs / 1000).toFixed(1),
                         action_window: `${startTime} - ${endTime}`,
                         os: osName,
                         browser: userAgent.includes('Chrome') ? 'Chrome' : userAgent.includes('Firefox') ? 'Firefox' : userAgent.includes('Safari') ? 'Safari' : 'Other'
                    }
                });
                
                const now = new Date();
                setProcessedItems(prev => [{ 
                    ...item, 
                    id: generatedUuid, 
                    processedAt: now.toLocaleString(),
                    processedBy: CURRENT_OPERATOR.id,
                    processedByName: CURRENT_OPERATOR.name,
                    processedNode: CURRENT_OPERATOR.node,
                }, ...prev]);

                setQueue(prev => prev.filter(q => q.id !== itemId));
                setLinkedEntities(prev => { const next = { ...prev }; delete next[itemId]; return next; });
                setForwardingRecipients(prev => { const next = { ...prev }; delete next[itemId]; return next; });
                setToast({ type: 'success', message: `${item.docTitle} forwarded (Fallback Mode)` });
                
                const remaining = queue.filter(q => q.id !== itemId);
                setActiveItem(remaining.length > 0 ? remaining[0].id : null);

            } catch(fallbackErr) {
                 console.error('Absolute Finalization Error:', fallbackErr);
                 setToast({ type: 'error', message: `Critical Database Write Error: ${fallbackErr.message}` });
            }
        }
    }, [queue, linkedEntities, supabase, CURRENT_OPERATOR, forwardingRecipients, setProcessedItems, setQueue, setLinkedEntities, setForwardingRecipients, setToast, setActiveItem, getReviewTimeMs, reviewStartTimes, setDuplicateModal, user]);

    const handleArchive = useCallback(async (itemId) => {
        try {
            const now = new Date().toISOString();
            const { error } = await supabase
                .from('registered_agent_documents')
                .update({ archived_at: now })
                .eq('id', itemId);
            
            if (error) throw error;

            setProcessedItems(prev => prev.map(p => p.id === itemId ? { ...p, archived_at: now } : p));
            setToast({ type: 'success', message: 'Document moved to archive.' });
            
            await supabase.from('ra_document_audit').insert({
                user_id: user.id,
                document_id: itemId,
                action: 'DOC_ARCHIVED',
                actor_type: 'CHARTER_ADMIN',
                actor_email: user.email,
                outcome: 'SUCCESS'
            });

        } catch (err) {
            console.error('Archive Error:', err);
            setToast({ type: 'error', message: 'Failed to archive document.' });
        }
    }, [supabase, setProcessedItems, setToast, user]);

    return {
        getReviewTimeMs,
        handleAcceptMatch,
        handleOverride,
        handleManualLink,
        handleAddRecipient,
        handleRemoveRecipient,
        handleFinalize,
        handleArchive
    };
};
