import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    FilePlus, Shield, Search, Filter, ChevronRight, CheckCircle2, Clock, AlertTriangle,
    Download, User, Lock, Eye, Mail, Activity, ArrowLeft, Upload, X, FileText, Archive, ChevronDown, 
    Brain, Zap, Plus, Pin, HelpCircle, Send, Maximize, Settings as SettingsIcon
} from 'lucide-react';
import RADocumentAuditLog from '../../components/RADocumentAuditLog';
import tinyfish from '../../lib/tinyfish';

const DOCUMENT_CATEGORIES = [
    { id: 'court_sop',      label: 'Court SOP',       desc: 'Summons & complaints',        urgent: true },
    { id: 'subpoena',       label: 'Subpoena',        desc: 'Subpoena duces tecum / ad test.', urgent: true },
    { id: 'garnishment',    label: 'Garnishment',     desc: 'Wage or asset garnishment',   urgent: true },
    { id: 'state_notice',   label: 'State Notice',    desc: 'DOS / division correspondence' },
    { id: 'annual_report',  label: 'Annual Report',   desc: 'Filing reminders & receipts' },
    { id: 'tax_mail',       label: 'Tax Mail',        desc: 'IRS, DOR, franchise tax' },
    { id: 'dissolution',    label: 'Dissolution',     desc: 'Articles of dissolution' },
    { id: 'compliance',     label: 'Compliance',      desc: 'Regulatory & licensing' },
    { id: 'informational',  label: 'Informational',   desc: 'Bulletins, TIPs, advisories' },
    { id: 'complimentary',  label: 'Complimentary',   desc: 'Courtesy / non-legal mail' },
];

const getInitials = (name, email) => {
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

const calculateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const RASentry = ({
    supabase,
    user,
    queue,
    setQueue,
    processedItems,
    setProcessedItems,
    activeItem,
    setActiveItem,
    viewMode,
    setViewMode,
    clients,
    aiClassifications,
    setAiClassifications,
    linkedEntities,
    setLinkedEntities,
    forwardingRecipients,
    setForwardingRecipients,
    ocrProgress,
    setOcrProgress,
    customCategories,
    setCustomCategories,
    setToast,
    CURRENT_OPERATOR,
    watchFolder,
    isScanning,
    fileBuffer,
    handleScanFolder,
    triggerFolderPicker,
    performOCR,
    classifyDocumentLocal,
    submitFeedbackLocal,
    submitFeedback,
    getLocalFeedbackBuffer
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [entitySearch, setEntitySearch] = useState('');
    const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);
    const [manualEmail, setManualEmail] = useState('');
    const [showOtherInput, setShowOtherInput] = useState({});
    const [otherCategoryDraft, setOtherCategoryDraft] = useState('');
    const [activeDocUrl, setActiveDocUrl] = useState(null);
    const [duplicateModal, setDuplicateModal] = useState(null);
    const [tinyfishStatus, setTinyfishStatus] = useState({}); // { [itemId]: { status: 'idle'|'running'|'completed'|'error', logs: [] } }
    const [automationGoal, setAutomationGoal] = useState('');
    const [reviewStartTimes, setReviewStartTimes] = useState({});
    const [aiStats, setAiStats] = useState({ accepted: 0, overridden: 0, manual: 0, total: 0 });
    const [feedbackBuffer, setFeedbackBuffer] = useState([]);

    // URL Management (Local Binaries + Cloud Storage)
    useEffect(() => {
        if (!activeItem) {
            setActiveDocUrl(null);
            return;
        }
        
        const doc = queue.find(q => q.id === activeItem);
        if (!doc) return;

        if (doc.rawFile) {
            // Local file just scanned
            const url = URL.createObjectURL(doc.rawFile);
            setActiveDocUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (doc.filePath) {
            // File persisted in cloud storage
            const fetchSignedUrl = async () => {
                const { data, error } = await supabase.storage
                    .from('ra-documents')
                    .createSignedUrl(doc.filePath, 3600);
                
                if (data?.signedUrl) {
                    setActiveDocUrl(data.signedUrl);
                } else if (error) {
                    console.error('Storage URL Error:', error);
                    setToast({ type: 'error', message: 'Failed to retrieve document from cloud storage.' });
                }
            };
            fetchSignedUrl();
        } else {
            setActiveDocUrl(null);
        }
    }, [activeItem, queue, supabase]);

    // Sync state changes back to database (Status/Category/Entity)
    // This ensures that if another node picks up the item, it sees our current progress
    useEffect(() => {
        if (!activeItem) return;
        const item = queue.find(q => q.id === activeItem);
        if (!item || typeof item.id === 'string' && item.id.startsWith('local-')) return;

        const syncToDB = async () => {
            const updates = {
                category: item.category,
                status: item.aiStatus === 'confirmed' ? 'LINKED' : 'RECEIVED',
                // We keep staff_id/node_id updated to the last operator who touched it
                staff_id: CURRENT_OPERATOR.id,
                node_id: CURRENT_OPERATOR.node
            };
            
            await supabase.from('ra_service_log').update(updates).eq('id', item.id);
        };

        const timer = setTimeout(syncToDB, 1500); // Debounce sync
        return () => clearTimeout(timer);
    }, [queue, activeItem, CURRENT_OPERATOR, supabase]);

    // Track when staff starts reviewing an item
    const handleSelectItem = useCallback((itemId) => {
        setActiveItem(itemId);
        setReviewStartTimes(prev => ({
            ...prev,
            [itemId]: prev[itemId] || Date.now()
        }));
    }, [setActiveItem]);

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
    }, [queue, aiClassifications, linkedEntities, getReviewTimeMs, setQueue, setForwardingRecipients, submitFeedbackLocal, submitFeedback, CURRENT_OPERATOR, getLocalFeedbackBuffer, setToast]);

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
    }, [queue, aiClassifications, getReviewTimeMs, setQueue, setLinkedEntities, submitFeedbackLocal, submitFeedback, CURRENT_OPERATOR, getLocalFeedbackBuffer, setToast]);

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
    }, [aiClassifications, queue, getReviewTimeMs, setLinkedEntities, setForwardingRecipients, setQueue, submitFeedbackLocal, submitFeedback, CURRENT_OPERATOR, getLocalFeedbackBuffer]);

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
            const { data: { user } } = await supabase.auth.getUser();
            
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
            // This handles the user console upload, audit ledger, and email notification
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
            // Move item from 'RECEIVED'/'LINKED' to 'FORWARDED'
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
            console.error('Finalize failure:', err);
            setToast({ type: 'error', message: `Critical Finalization Error: ${err.message}` });
        }
    }, [queue, linkedEntities, supabase, CURRENT_OPERATOR, forwardingRecipients, setProcessedItems, setQueue, setLinkedEntities, setForwardingRecipients, setToast, setActiveItem]);

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
            
            // Log to Audit
            const { data: { user } } = await supabase.auth.getUser();
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
    }, [supabase, setProcessedItems, setToast]);

    // OCR Trigger
    useEffect(() => {
        if (!activeItem) return;
        
        const doc = queue.find(q => q.id === activeItem);
        if (doc && doc.rawFile && !doc.fullText && ocrProgress[activeItem] === undefined) {
            const runOCR = async () => {
                setOcrProgress(prev => ({ ...prev, [activeItem]: 1 }));
                try {
                    const text = await performOCR(doc.rawFile, (progress) => {
                        setOcrProgress(prev => ({ ...prev, [activeItem]: progress }));
                    });
                    
                    setQueue(prev => prev.map(q => q.id === activeItem ? {
                        ...q,
                        fullText: text,
                        aiStatus: 'needs_review',
                        preview: { ...q.preview, body: text.substring(0, 1000) }
                    } : q));
                    
                    const classification = classifyDocumentLocal(text, clients);
                    setAiClassifications(prev => ({ ...prev, [activeItem]: classification }));
                    
                    if (classification.aiConfidence >= 60 && classification.matchedEntity) {
                        const entity = clients.find(e => e.name === classification.matchedEntity);
                        if (entity) setLinkedEntities(prev => ({ ...prev, [activeItem]: entity }));
                    }

                    setOcrProgress(prev => ({ ...prev, [activeItem]: 100 }));
                } catch (err) {
                    console.error('[RA Sentry] OCR Failure:', err);
                    setOcrProgress(prev => ({ ...prev, [activeItem]: -1 }));
                }
            };
            runOCR();
        }
    }, [activeItem, queue, ocrProgress, performOCR, setQueue, classifyDocumentLocal, clients, setAiClassifications, setLinkedEntities, setOcrProgress]);

    const filteredQueue = queue.filter(item => 
        item.docTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.entity && item.entity.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.sunbizId && item.sunbizId.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* SUB-NAV */}
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
                    {[
                        { id: 'queue', label: 'Work Queue', icon: Clock, count: queue.length },
                        { id: 'processed', label: 'History', icon: Archive, count: processedItems.length },
                        { id: 'audit', label: 'Logs', icon: Activity }
                    ].map(mode => (
                        <button 
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                viewMode === mode.id 
                                    ? 'bg-white text-luminous-ink shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <mode.icon size={12} />
                            {mode.label}
                            {mode.count !== undefined && <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] ${viewMode === mode.id ? 'bg-luminous-blue/10 text-luminous-blue' : 'bg-gray-200 text-gray-500'}`}>{mode.count}</span>}
                        </button>
                    ))}
                </div>
                
                {viewMode === 'queue' && (
                    <div className="flex items-center gap-4">
                        {/* Folder Config */}
                        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
                             <div className="px-3">
                                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Watch Folder</p>
                                 <div className="flex items-center gap-2">
                                     <Pin size={10} className="text-luminous-blue" />
                                     <span className="text-[10px] font-bold text-luminous-ink truncate max-w-[120px]">{watchFolder || 'Not Configured'}</span>
                                 </div>
                             </div>
                              <button 
                                 onClick={triggerFolderPicker}
                                 className="p-2.5 bg-gray-50 text-gray-400 hover:text-luminous-blue hover:bg-luminous-blue/5 rounded-xl transition-all"
                                 title="Change Watch Folder"
                              >
                                  <Upload size={14} />
                              </button>
                             <div className="w-px h-6 bg-gray-100" />
                             <button 
                                onClick={handleScanFolder}
                                disabled={isScanning || fileBuffer.length === 0}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    fileBuffer.length > 0 
                                    ? 'bg-luminous-blue text-white shadow-lg shadow-luminous-blue/20' 
                                    : 'bg-gray-50 text-gray-300 disabled:opacity-50'
                                }`}
                             >
                                 {isScanning ? <Activity size={12} className="animate-spin" /> : <Upload size={12} />}
                                 {fileBuffer.length > 0 ? `Ingest (${fileBuffer.length})` : 'No New Files'}
                             </button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-luminous-blue transition-colors" size={16} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search queue…" 
                                className="bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none ring-4 ring-transparent focus:ring-luminous-blue/5 focus:border-luminous-blue/20 transition-all w-64 shadow-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* QUEUE VIEW */}
            {viewMode === 'queue' && (
                <div className="flex flex-1 gap-8 min-h-0 overflow-hidden">
                    {/* LEFT: Queue Sidebar */}
                    <aside className="w-80 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredQueue.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={`p-5 rounded-[28px] border transition-all cursor-pointer group relative ${
                                    activeItem === item.id 
                                    ? 'bg-white border-luminous-blue shadow-xl shadow-luminous-blue/5 scale-[1.02] z-10' 
                                    : 'bg-white/50 border-gray-100 hover:border-gray-200 hover:bg-white'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {item.urgent && (
                                            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                                                Urgent
                                            </span>
                                        )}
                                        {item.aiStatus === 'needs_review' && (
                                            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                Needs Review
                                            </span>
                                        )}
                                        {item.aiStatus === 'confirmed' && (
                                            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                ✓ Confirmed
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[8px] font-mono text-gray-300">{item.hubId || '—'}</span>
                                </div>
                                <h4 className="text-xs font-black text-luminous-ink mb-0.5 group-hover:text-luminous-blue transition-colors truncate">{item.entity ? `${item.contact} / ${item.entity}` : item.docTitle}</h4>
                                <p className="text-[9px] text-gray-400 font-medium italic mb-3 truncate">{item.entity ? item.docTitle : 'Unclassified — manual review required'}</p>
                                <div className="flex items-center justify-between">
                                    <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[7px] font-black text-gray-400">{item.initials}</div>
                                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-gray-400">
                                        <Clock size={9} /> {item.received}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </aside>

                    {/* CENTER/RIGHT: Command Workspace */}
                    <main className="flex-1 bg-white border border-gray-200 rounded-[32px] overflow-hidden flex flex-col shadow-sm">
                        {activeItem ? (() => {
                            const doc = queue.find(q => q.id === activeItem);
                            if (!doc) return null;
                            return (
                            <div className="h-full flex flex-col">
                                {/* Workspace Header */}
                                <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.aiStatus === 'needs_review' ? 'bg-amber-50 text-amber-500' : doc.urgent ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}><FilePlus size={20} /></div>
                                        <div>
                                            <h3 className="text-base font-black text-luminous-ink uppercase tracking-tight">{doc.docTitle}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.entity ? `${doc.entity} (${doc.sunbizId})` : 'Unlinked — entity match required'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2.5 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-luminous-ink rounded-xl transition-all" title="Download Local Copy"><Download size={16} /></button>
                                        <button 
                                            onClick={() => {
                                                if (activeDocUrl) {
                                                    window.open(activeDocUrl, '_blank');
                                                } else {
                                                    setToast({ type: 'warning', message: "No source document available for full view." });
                                                }
                                            }}
                                            className="px-4 py-2 bg-luminous-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                                        >
                                            <Maximize size={12} /> Full View
                                        </button>
                                    </div>
                                </div>

                                {/* Main Workspace Content */}
                                <div className="flex-1 flex min-h-0">
                                    {/* Document Preview */}
                                    <div className="flex-1 bg-[#F1F3F5] flex items-center justify-center overflow-hidden border-r border-gray-100 p-8 relative">
                                        {ocrProgress[activeItem] !== undefined && ocrProgress[activeItem] < 100 && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                                                <Brain size={48} className="text-luminous-blue mb-4 animate-pulse shadow-sm" />
                                                <h3 className="text-xl font-black text-luminous-ink uppercase tracking-tight">Extracting Legal Data...</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-6">Real-Time Browser-Native OCR Engine</p>
                                                <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden mb-2 shadow-inner">
                                                    <div className="h-full bg-luminous-blue transition-all duration-300" style={{ width: `${ocrProgress[activeItem]}%` }} />
                                                </div>
                                                <p className="text-[10px] text-gray-400 italic max-w-xs mt-6 leading-relaxed">Analyzing document structure locally...</p>
                                            </div>
                                        )}

                                        {activeDocUrl && doc.meta?.type?.includes('pdf') ? (
                                            <div className="w-full h-full bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col">
                                                <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{doc.docTitle}</span>
                                                    <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded font-bold">LIVE SOURCE</span>
                                                </div>
                                                <iframe src={activeDocUrl} className="w-full h-full border-none" title="PDF Preview" />
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-lg bg-white shadow-xl rounded-lg p-8 flex flex-col gap-4 font-serif">
                                                <h4 className="text-sm font-bold text-center tracking-wide">{doc.preview?.heading || 'Document Preview'}</h4>
                                                <div className="w-full h-px bg-gray-200" />
                                                <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
                                                    {doc.rawFile ? `SYSTEM LOG: SOURCE BINARY DETECTED\n--------------------------------\n${doc.preview?.body || ''}` : doc.preview?.body || ''}
                                                </pre>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Controls */}
                                    <div className="w-72 p-6 flex flex-col gap-5 shrink-0 overflow-y-auto custom-scrollbar">
                                        {/* AI Classification Banner */}
                                        {doc.aiStatus !== 'confirmed' && (
                                            <div className={`p-3 rounded-2xl border ${doc.aiConfidence >= 80 ? 'bg-emerald-50 border-emerald-100' : doc.aiConfidence >= 50 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-200'}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${doc.aiConfidence >= 80 ? 'text-emerald-700' : doc.aiConfidence >= 50 ? 'text-blue-700' : 'text-amber-700'}`}>
                                                        {doc.aiConfidence >= 80 ? '✓ AI Matched' : doc.aiConfidence >= 50 ? '○ AI Partial' : '⚠ Needs Review'}
                                                    </p>
                                                    <span className="text-[10px] font-black">{doc.aiConfidence || 0}%</span>
                                                </div>
                                                <p className="text-[9px] text-gray-500 italic leading-relaxed mb-3">{aiClassifications[doc.id]?.aiSource || 'Analyzing...'}</p>
                                                {doc.aiConfidence >= 50 ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleAcceptMatch(doc.id)} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-1"><Zap size={9} /> Accept Match</button>
                                                        <button onClick={() => handleOverride(doc.id)} className="py-2 px-3 bg-white text-gray-500 border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-red-300 hover:text-red-500 transition-all">Override</button>
                                                    </div>
                                                ) : (
                                                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Link entity manually below ↓</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                                <h5 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Native Metadata</h5>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center"><span className="text-[7px] font-black text-gray-300 uppercase">File Context</span><span className="text-[9px] font-mono text-gray-500">{doc.meta?.size || '—'}</span></div>
                                                    <div className="flex justify-between items-center"><span className="text-[7px] font-black text-gray-300 uppercase">MIME Type</span><span className="text-[8px] font-mono text-gray-400 truncate max-w-[100px]">{doc.meta?.type || 'unknown'}</span></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</h5>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {[...DOCUMENT_CATEGORIES, ...customCategories.map(c => ({ id: `custom_${c}`, label: c, custom: true }))].map(cat => (
                                                    <button 
                                                        key={cat.id} 
                                                        onClick={() => setQueue(prev => prev.map(q => q.id === doc.id ? { ...q, category: cat.label } : q))}
                                                        className={`px-2 py-1.5 border rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${cat.label === doc.category ? (cat.urgent ? 'bg-red-500 text-white border-red-500' : 'bg-luminous-blue text-white border-luminous-blue') : (cat.urgent ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-luminous-blue')}`}
                                                    >
                                                        {cat.urgent && <span className="mr-0.5">⚠</span>}{cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Linked Entity</h5>
                                            {linkedEntities[doc.id] ? (
                                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-luminous-ink">{linkedEntities[doc.id].name}</p>
                                                        <button onClick={() => setLinkedEntities(prev => { const n = {...prev}; delete n[doc.id]; return n; })} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                                        <div><p className="text-[8px] font-black text-gray-400 uppercase">SunBiz ID</p><p className="text-[9px] font-bold text-luminous-ink font-mono">{linkedEntities[doc.id].sunbizId}</p></div>
                                                        <div><p className="text-[8px] font-black text-gray-400 uppercase">Status</p><p className={`text-[9px] font-black uppercase ${linkedEntities[doc.id].status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>{linkedEntities[doc.id].status}</p></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl py-2.5 px-3">
                                                        <Search size={12} className="text-gray-300" />
                                                        <input 
                                                            type="text" 
                                                            value={entitySearch}
                                                            onChange={(e) => { setEntitySearch(e.target.value); setEntityDropdownOpen(true); }}
                                                            onFocus={() => setEntityDropdownOpen(true)}
                                                            placeholder="Link entity manually..."
                                                            className="flex-1 bg-transparent border-none text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                    {entityDropdownOpen && entitySearch.length >= 2 && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                                                            {clients.filter(e => e.name.toLowerCase().includes(entitySearch.toLowerCase()) || (e.sunbizId || '').toLowerCase().includes(entitySearch.toLowerCase())).map(ent => (
                                                                <button key={ent.id} onClick={() => { handleManualLink(doc.id, ent); setEntitySearch(''); setEntityDropdownOpen(false); }} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                                                                    <p className="text-[10px] font-black text-luminous-ink">{ent.name}</p>
                                                                    <p className="text-[8px] text-gray-400 font-mono">{ent.sunbizId} · {ent.owner_name}</p>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Forward To</h5>
                                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                                {(forwardingRecipients[doc.id] || []).map(rec => (
                                                    <div key={rec.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl group transition-all hover:bg-gray-100/80">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-7 h-7 rounded-lg bg-luminous-blue/10 flex items-center justify-center text-[8px] font-black text-luminous-blue shrink-0">{rec.initials}</div>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-black text-luminous-ink truncate">{rec.name || 'Manual'}</p>
                                                                <p className="text-[8px] text-gray-400 font-medium truncate italic">{rec.email}</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleRemoveRecipient(doc.id, rec.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><X size={12} /></button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <div className="flex items-center gap-2 bg-gray-50/50 border border-gray-100 rounded-xl px-2.5 py-2">
                                                    <Plus size={12} className="text-gray-400" />
                                                    <input 
                                                        type="text"
                                                        value={manualEmail}
                                                        onChange={(e) => setManualEmail(e.target.value)}
                                                        placeholder="Add email or search..."
                                                        className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && manualEmail.includes('@')) {
                                                                handleAddRecipient(doc.id, { id: Date.now(), email: manualEmail, name: '', initials: getInitials('', manualEmail), source: 'manual' });
                                                                setManualEmail('');
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-3">
                                           {doc.urgent && (
                                               <div className="p-3 bg-red-50 border border-red-100 rounded-2xl">
                                                    <p className="text-[9px] font-black text-red-600 uppercase mb-1 flex items-center gap-1.5"><AlertTriangle size={10} /> SOP Detected</p>
                                                    <p className="text-[9px] text-red-500 font-medium leading-relaxed italic">Triggers 24h SLA & SMS interrupt to client.</p>
                                               </div>
                                           )}
                                           <button 
                                               onClick={() => handleFinalize(doc.id)}
                                               disabled={(forwardingRecipients[doc.id] || []).length === 0}
                                               className="w-full py-4 bg-luminous-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-hacker-blue shadow-xl shadow-luminous-blue/20 transition-all disabled:opacity-30"
                                           >
                                               {(forwardingRecipients[doc.id] || []).length > 0 ? 'Finalize & Forward' : 'Add Recipient to Proceed'}
                                           </button>

                                           {/* TinyFish Autonomous Bridge */}
                                           {(doc.category === 'Annual Report' || doc.category === 'State Notice') && (
                                               <div className="mt-4 p-4 bg-violet-50 border border-violet-100 rounded-2xl space-y-3 relative overflow-hidden group/tf">
                                                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/tf:opacity-30 transition-opacity">
                                                       <Brain size={32} className="text-violet-600" />
                                                   </div>
                                                   <div className="relative z-10">
                                                       <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                           <Zap size={10} /> TinyFish Protocol
                                                       </p>
                                                       <p className="text-[10px] text-violet-500 font-medium italic leading-relaxed">
                                                           Autonomous state filing detected. Trigger high-fidelity web agent?
                                                       </p>
                                                   </div>
                                                   
                                                   {(tinyfishStatus[doc.id]?.status === 'running') ? (
                                                       <div className="space-y-2">
                                                           <div className="h-1 bg-violet-100 rounded-full overflow-hidden">
                                                               <div className="h-full bg-violet-600 animate-pulse w-full" />
                                                           </div>
                                                           <div className="bg-white/50 rounded-lg p-2 max-h-24 overflow-y-auto custom-scrollbar">
                                                               {tinyfishStatus[doc.id].logs.map((log, i) => (
                                                                   <p key={i} className="text-[7px] font-mono text-violet-400 leading-tight">› {log}</p>
                                                               ))}
                                                           </div>
                                                       </div>
                                                   ) : (
                                                       <button 
                                                           onClick={async () => {
                                                               const goal = `File the ${doc.category} for ${doc.entity || 'this entity'} on Sunbiz. Use the data from the attached document: ${doc.docTitle}.`;
                                                               setTinyfishStatus(prev => ({ ...prev, [doc.id]: { status: 'running', logs: ['Initializing session...', 'Goal: ' + goal] } }));
                                                               
                                                               try {
                                                                   // Retrieve TinyFish API Key from settings/localStorage
                                                                   const settings = JSON.parse(localStorage.getItem('ra_node_settings') || '{}');
                                                                   const apiKey = settings.tinyfish_api_key || 'sk-tinyfish-_900RKNoZIA38xSHqFNhUl957VIGUMXw';
                                                                   
                                                                   await tinyfish.run({
                                                                       url: 'https://dos.myflorida.com/sunbiz/',
                                                                       goal: goal,
                                                                       apiKey: apiKey,
                                                                       onEvent: (data) => {
                                                                           setTinyfishStatus(prev => ({
                                                                               ...prev,
                                                                               [doc.id]: {
                                                                                   ...prev[doc.id],
                                                                                   logs: [...prev[doc.id].logs.slice(-10), data.message]
                                                                               }
                                                                           }));
                                                                           if (data.event === 'completed') {
                                                                               setTinyfishStatus(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], status: 'completed' } }));
                                                                               setToast({ type: 'success', message: 'TinyFish autonomous filing completed successfully.' });
                                                                           }
                                                                       },
                                                                       onError: (err) => {
                                                                           setTinyfishStatus(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], status: 'error' } }));
                                                                           setToast({ type: 'error', message: 'TinyFish Failure: ' + err.message });
                                                                       }
                                                                   });
                                                               } catch (err) {
                                                                   setTinyfishStatus(prev => ({ ...prev, [doc.id]: { status: 'error', logs: [err.message] } }));
                                                               }
                                                           }}
                                                           className="w-full py-2.5 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-violet-700 shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
                                                       >
                                                           <Zap size={10} /> Run Autonomous Filing
                                                       </button>
                                                   )}
                                                   
                                                   {tinyfishStatus[doc.id]?.status === 'completed' && (
                                                       <div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest pt-1">
                                                           <CheckCircle2 size={12} /> Filing Finalized
                                                       </div>
                                                   )}
                                               </div>
                                           )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })() : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 gap-6 bg-gray-50/50">
                                <Search size={32} className="text-gray-200" />
                                <h3 className="text-lg font-black text-gray-300 uppercase tracking-tight">Select a task to begin</h3>
                            </div>
                        )}
                    </main>
                </div>
            )}

            {/* PROCESSED VIEW */}
            {viewMode === 'processed' && (
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                    {processedItems.map(item => (
                        <div key={item.id} className="p-5 bg-white border border-gray-100 rounded-[24px] flex items-center justify-between group hover:border-gray-200 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={20} /></div>
                                <div>
                                    <h4 className="text-sm font-black text-luminous-ink">{item.docTitle}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.entity} · {item.hubId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${item.urgent ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{item.category}</span>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Forwarded to {item.contact}</p>
                                    <p className="text-[9px] text-gray-300 italic">{item.processedAt}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AUDIT VIEW */}
            {viewMode === 'audit' && (
                <div className="flex-1 overflow-y-auto bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm custom-scrollbar">
                    <RADocumentAuditLog isAdmin={true} />
                </div>
            )}

            {/* Duplicate Modal */}
            {duplicateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={duplicateModal.onCancel} />
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-4 text-red-600">
                            <div className="p-3 bg-red-100 rounded-xl"><AlertTriangle size={24} /></div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight">Duplicate Detected</h3>
                                <p className="text-xs text-red-500 font-bold">SHA-256 Hash Collision</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-sm text-gray-600 font-medium leading-relaxed">This document is identical to one submitted on {new Date(duplicateModal.existing.created_at).toLocaleDateString()}.</p></div>
                        <div className="flex gap-3">
                            <button onClick={duplicateModal.onCancel} className="flex-1 py-3 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200">Cancel</button>
                            <button onClick={duplicateModal.onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20">Forge Ahead</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RASentry;
