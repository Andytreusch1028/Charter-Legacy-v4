import React, { useState, useEffect, useCallback } from 'react';
import { 
    Activity, Archive, Clock, Pin, Settings as SettingsIcon, Trash2, Upload, Search, RotateCw, CheckCircle2
} from 'lucide-react';
import RADocumentAuditLog from '../../components/RADocumentAuditLog';

import { useOCR } from './hooks/useOCR';
import { useSentryActions } from './hooks/useSentryActions';
import { SentryQueueSidebar } from './components/SentryQueueSidebar';
import { SentryWorkspace } from './components/SentryWorkspace';
import { SentryModals } from './components/SentryModals';

export const DOCUMENT_CATEGORIES = [
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
    const [activeDocUrl, setActiveDocUrl] = useState(null);
    const [duplicateModal, setDuplicateModal] = useState(null);
    const [tinyfishStatus, setTinyfishStatus] = useState({}); 
    const [reviewStartTimes, setReviewStartTimes] = useState({});
    const [aiStats, setAiStats] = useState({ accepted: 0, overridden: 0, manual: 0, total: 0 });
    const [feedbackBuffer, setFeedbackBuffer] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [dialogModal, setDialogModal] = useState(null);

    // Call custom hooks
    useOCR({
        activeItem,
        queue,
        ocrProgress,
        performOCR,
        setQueue,
        classifyDocumentLocal,
        clients,
        setAiClassifications,
        setLinkedEntities,
        setOcrProgress
    });

    const {
        getReviewTimeMs,
        handleAcceptMatch,
        handleOverride,
        handleManualLink,
        handleAddRecipient,
        handleRemoveRecipient,
        handleFinalize,
        handleArchive
    } = useSentryActions({
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
    });

    // Track when staff starts reviewing an item
    const handleSelectItem = useCallback((itemId) => {
        setActiveItem(itemId);
        setReviewStartTimes(prev => ({
            ...prev,
            [itemId]: prev[itemId] || Date.now()
        }));
    }, [setActiveItem]);

    // URL Management
    useEffect(() => {
        if (!activeItem) {
            setActiveDocUrl(null);
            return;
        }
        
        const doc = queue.find(q => q.id === activeItem);
        if (!doc) return;

        if (doc.rawFile) {
            const url = URL.createObjectURL(doc.rawFile);
            setActiveDocUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (doc.filePath) {
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
    }, [activeItem, queue, supabase, setToast]);

    // Sync state changes back to database
    useEffect(() => {
        if (!activeItem) return;
        const item = queue.find(q => q.id === activeItem);
        if (!item || typeof item.id === 'string' && item.id.startsWith('local-')) return;

        const syncToDB = async () => {
            const updates = {
                category: item.category,
                status: item.aiStatus === 'confirmed' ? 'LINKED' : 'RECEIVED',
                staff_id: CURRENT_OPERATOR.id,
                node_id: CURRENT_OPERATOR.node
            };
            
            await supabase.from('ra_service_log').update(updates).eq('id', item.id);
        };

        const timer = setTimeout(syncToDB, 1500); // Debounce sync
        return () => clearTimeout(timer);
    }, [queue, activeItem, CURRENT_OPERATOR, supabase]);

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
                                     <button 
                                         onClick={triggerFolderPicker}
                                         className="p-1 text-luminous-blue hover:text-hacker-blue hover:bg-luminous-blue/10 rounded transition-all ml-1 group"
                                         title="Refresh Folder Contents"
                                      >
                                          <RotateCw size={10} className="group-hover:rotate-180 transition-transform duration-500" />
                                      </button>
                                 </div>
                             </div>
                              <button 
                                 onClick={triggerFolderPicker}
                                 className="p-2.5 bg-gray-50 text-gray-400 hover:text-luminous-blue hover:bg-luminous-blue/5 rounded-xl transition-all"
                                 title="Change Watch Folder"
                              >
                                  <SettingsIcon size={14} />
                              </button>
                             <div className="w-px h-6 bg-gray-100" />
                             <button 
                                onClick={() => {
                                    setDialogModal({
                                        title: 'Clear Active Queue',
                                        message: 'Are you sure you want to clear the entire inactive queue? This will dump the current workload.',
                                        isDestructive: true,
                                        onConfirm: () => {
                                            setQueue([]);
                                            setActiveItem(null);
                                            setDialogModal(null);
                                        }
                                    });
                                }}
                                disabled={queue.length === 0}
                                className={`p-2.5 rounded-xl transition-all ${
                                    queue.length > 0 
                                    ? 'bg-red-50 text-red-500 hover:bg-red-100 shadow-sm' 
                                    : 'bg-gray-50 text-gray-300 disabled:opacity-50'
                                }`}
                                title="Clear Queue"
                             >
                                 <Trash2 size={14} />
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
                    <SentryQueueSidebar 
                        filteredQueue={filteredQueue}
                        activeItem={activeItem}
                        handleSelectItem={handleSelectItem}
                    />

                    <SentryWorkspace
                        activeItem={activeItem}
                        queue={queue}
                        activeDocUrl={activeDocUrl}
                        ocrProgress={ocrProgress}
                        aiClassifications={aiClassifications}
                        customCategories={customCategories}
                        setCustomCategories={setCustomCategories}
                        newCategoryName={newCategoryName}
                        setNewCategoryName={setNewCategoryName}
                        setQueue={setQueue}
                        setDialogModal={setDialogModal}
                        linkedEntities={linkedEntities}
                        setLinkedEntities={setLinkedEntities}
                        entitySearch={entitySearch}
                        setEntitySearch={setEntitySearch}
                        entityDropdownOpen={entityDropdownOpen}
                        setEntityDropdownOpen={setEntityDropdownOpen}
                        clients={clients}
                        forwardingRecipients={forwardingRecipients}
                        manualEmail={manualEmail}
                        setManualEmail={setManualEmail}
                        tinyfishStatus={tinyfishStatus}
                        setTinyfishStatus={setTinyfishStatus}
                        DOCUMENT_CATEGORIES={DOCUMENT_CATEGORIES}
                        handleAcceptMatch={handleAcceptMatch}
                        handleOverride={handleOverride}
                        handleManualLink={handleManualLink}
                        handleAddRecipient={handleAddRecipient}
                        handleRemoveRecipient={handleRemoveRecipient}
                        handleFinalize={handleFinalize}
                        setToast={setToast}
                        setActiveItem={setActiveItem}
                    />
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
                                <div className="w-px h-8 bg-gray-100" />
                                <button 
                                    onClick={() => {
                                        setProcessedItems(prev => prev.filter(p => p.id !== item.id));
                                        setQueue(prev => [item, ...prev]);
                                        setActiveItem(item.id);
                                        setViewMode('queue');
                                    }}
                                    className="p-2 bg-luminous-blue/5 text-luminous-blue rounded-xl hover:bg-luminous-blue/20 transition-all group"
                                    title="Reprocess Document"
                                >
                                    <RotateCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                </button>
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

            <SentryModals 
                duplicateModal={duplicateModal}
                dialogModal={dialogModal}
                setDialogModal={setDialogModal}
            />
        </div>
    );
};

export default RASentry;
