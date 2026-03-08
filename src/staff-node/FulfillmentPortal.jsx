import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    FilePlus, Shield, Search, Filter, ChevronRight, CheckCircle2, Clock, AlertTriangle,
    Download, User, Lock, Eye, Mail, Activity, ArrowLeft, Upload, X, FileText, Archive, ChevronDown, 
    Brain, Zap, Plus, Pin, HelpCircle, Send, Maximize, MessageSquare, Briefcase, Settings, LogOut,
    Check
} from 'lucide-react';
import RASentry from './modules/RASentry';
import CommunicationCenter from './modules/CommunicationCenter';
import FormationFactory from './modules/FormationFactory';
import NodeAdmin from './modules/NodeAdmin';
import RASettingsPanel from './components/RASettingsPanel';
import StaffLoginForm from './components/FulfillmentPortal/StaffLoginForm';
import FulfillmentToast from './components/FulfillmentPortal/FulfillmentToast';
import FulfillmentSidebar from './components/FulfillmentPortal/FulfillmentSidebar';
import FulfillmentFooter from './components/FulfillmentPortal/FulfillmentFooter';
import { useStaffAuth } from './hooks/FulfillmentPortal/useStaffAuth';
import { useDocumentIngestion } from './hooks/FulfillmentPortal/useDocumentIngestion';
import { supabase } from '../lib/supabase';
import { performOCR } from '../lib/ocrEngine';
import { classifyDocumentLocal } from '../lib/aiClassifier';
import { submitFeedbackLocal, submitFeedback, getLocalFeedbackBuffer } from '../lib/aiClassifier';

// --- CONFIGURATION ---
const CURRENT_OPERATOR = {
    id: 'AL-901',
    name: 'Andytreusch',
    node: 'DeLand-01',
    clearance: 'Level 5 (Superuser)'
};

const MODULES = [
    { id: 'ra', label: 'RA Sentry', icon: Shield, desc: 'Digital mailroom & statutory compliance' },
    { id: 'inquiry', label: 'Inquiry Threads', icon: MessageSquare, desc: 'Secure client communication layer' },
    { id: 'formations', label: 'Formation Factory', icon: Briefcase, desc: 'Entity lifecycle & filing queue' },
    { id: 'node_admin', label: 'Node Admin', icon: Brain, desc: 'Operator hub & access recovery', clearance: 'Level 5' },
    { id: 'shield', label: 'Shield Command', icon: Lock, desc: 'Privacy & trustee services', locked: true },
    { id: 'legacy', label: 'Legacy Protocol', icon: Archive, desc: 'Inheritance & estate management', locked: true }
];

// --- UTILITIES ---
// Helper functions removed as they are now handled by child components.

const FulfillmentPortal = () => {
    const [activeModule, setActiveModule] = useState('ra');
    const [showSettings, setShowSettings] = useState(false);
    const [toast, setToast] = useState(null);

    const { user, staffRole, loading, setLoading, handleLoginSuccess, handleLogout } = useStaffAuth();

    // RA-Specific Shared State (Persisted during module switches)
    const [queue, setQueue] = useState([]);
    const [processedItems, setProcessedItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const [viewMode, setViewMode] = useState('queue');
    const [clients, setClients] = useState([]);
    const [aiClassifications, setAiClassifications] = useState({});
    const [linkedEntities, setLinkedEntities] = useState({});
    const [forwardingRecipients, setForwardingRecipients] = useState({});
    const [ocrProgress, setOcrProgress] = useState({});
    const [customCategories, setCustomCategories] = useState(() => {
        const saved = localStorage.getItem('cl_custom_categories');
        return saved ? JSON.parse(saved) : ['Tax Mail', 'Annual Report', 'State Notice'];
    });

    // Watch Folder State & Document Ingestion Hook
    const {
        watchFolder,
        isScanning,
        fileBuffer,
        folderInputRef,
        setWatchFolder,
        triggerFolderPicker,
        handleFolderSelect,
        handleScanFolder
    } = useDocumentIngestion({
        user,
        operatorNode: CURRENT_OPERATOR.node,
        setToast,
        onIngestionComplete: (processedNewItems, duplicatesCount) => {
            if (processedNewItems.length > 0) {
                setQueue(prev => [...processedNewItems, ...prev]);
                setActiveItem(processedNewItems[0].id);
                setActiveModule('ra');
                setViewMode('queue');
                setToast({ 
                    type: 'success', 
                    message: `Ingested ${processedNewItems.length} documents. ${duplicatesCount > 0 ? `(${duplicatesCount} duplicates skipped)` : ''}` 
                });
            } else if (duplicatesCount > 0) {
                setToast({ type: 'warning', message: `All ${duplicatesCount} documents were identified as duplicates and skipped.` });
            }
        }
    });

    // --- LOGIC ---
    useEffect(() => {
        // Load initial data only if we have an authenticated user and auth is done loading
        if (user && !loading) {
            loadInitialData();
        }
    }, [user, loading]);

    const loadInitialData = async () => {
        try {
            // 1. Load Entities
            const { data: entData } = await supabase.from('clients').select('*').order('name');
            const testEntities = [
                { id: '111', name: 'Alpha Dynamics LLC', sunbizId: 'L20000000123', status: 'Active', owner_name: 'John Doe', email: 'john@alphadynamics.com' },
                { id: '222', name: 'Beta Ventures Inc.', sunbizId: 'P19000000456', status: 'Active', owner_name: 'Jane Smith', email: 'jane@betaventures.com' },
                { id: '333', name: 'Gamma Holdings LP', sunbizId: 'A18000000789', status: 'Inactive', owner_name: 'Bob Jackson', email: 'bob@gammaholdings.com' }
            ];
            
            if (entData && entData.length > 0) {
                setClients([...testEntities, ...entData]);
            } else {
                setClients(testEntities);
            }

            // 2. Load Persistent RA Queue
            const { data: queueData } = await supabase
                .from('ra_service_log')
                .select('*')
                .in('status', ['RECEIVED', 'OCR_PROCESSED', 'LINKED'])
                .order('created_at', { ascending: false });

            if (queueData) {
                const restoredQueue = queueData.map(log => ({
                    id: log.id,
                    docTitle: log.document_name,
                    entity: '', // Will be linked if status is LINKED
                    hubId: '',
                    sunbizId: '',
                    category: log.category || 'Unclassified',
                    received: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'Inbound',
                    initials: '??',
                    aiStatus: log.status === 'RECEIVED' ? 'needs_review' : 'confirmed',
                    aiConfidence: 0,
                    filePath: log.file_path,
                    contentHash: log.document_hash,
                    preview: {
                        heading: log.document_name,
                        body: 'Loading persistent document...'
                    },
                    meta: { size: '---', type: 'application/pdf' }
                }));
                setQueue(restoredQueue);
            }

            // 3. Load Recent History
            const { data: historyData } = await supabase
                .from('ra_service_log')
                .select('*')
                .eq('status', 'FORWARDED')
                .limit(20)
                .order('created_at', { ascending: false });

            if (historyData) {
                setProcessedItems(historyData.map(h => ({
                    ...h,
                    docTitle: h.document_name,
                    processedAt: new Date(h.created_at).toLocaleString(),
                })));
            }

            // 4. Load Node Context
            const { data: settingsData } = await supabase.from('ra_settings').select('*');
            if (settingsData) {
                const nodeId = settingsData.find(s => s.key === 'node_id')?.value;
                if (nodeId) CURRENT_OPERATOR.node = nodeId;
            }
            
        } catch (err) {
            console.error('Data Load Error:', err);
        }
    };

    const handleLogoutWithHook = async () => {
        await handleLogout();
        // Clear local state if necessary
    };

    // --- RENDER ---
    // Render helpers removed; transitioning to pure functional shell components.

    if (loading) {
        return (
            <div className="min-h-screen bg-luminous-ink flex flex-col items-center justify-center">
                <Activity className="text-luminous-blue animate-spin mb-4" size={40} />
                <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Initializing Secure Node...</p>
            </div>
        );
    }

    if (!user) {
        return <StaffLoginForm onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="h-screen bg-[#F8F9FA] flex overflow-hidden">
            <FulfillmentSidebar 
                modules={MODULES}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                user={user}
                staffRole={staffRole}
                onLogout={handleLogoutWithHook}
                onOpenSettings={() => setShowSettings(true)}
            />
            
            <main className="flex-1 p-8 lg:p-12 xl:p-16 overflow-hidden flex flex-col">
                <div className="max-w-[1400px] w-full mx-auto h-full flex flex-col min-h-0">
                    {activeModule === 'ra' && (
                        <RASentry 
                            supabase={supabase}
                            user={user}
                            queue={queue}
                            setQueue={setQueue}
                            processedItems={processedItems}
                            setProcessedItems={setProcessedItems}
                            activeItem={activeItem}
                            setActiveItem={setActiveItem}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            clients={clients}
                            aiClassifications={aiClassifications}
                            setAiClassifications={setAiClassifications}
                            linkedEntities={linkedEntities}
                            setLinkedEntities={setLinkedEntities}
                            forwardingRecipients={forwardingRecipients}
                            setForwardingRecipients={setForwardingRecipients}
                            ocrProgress={ocrProgress}
                            setOcrProgress={setOcrProgress}
                            customCategories={customCategories}
                            setCustomCategories={setCustomCategories}
                            setToast={setToast}
                            CURRENT_OPERATOR={CURRENT_OPERATOR}
                            
                            // Watch Folder Props
                            watchFolder={watchFolder}
                            isScanning={isScanning}
                            fileBuffer={fileBuffer}
                            handleScanFolder={handleScanFolder}
                            triggerFolderPicker={triggerFolderPicker}
                            
                            // OCR/AI Props
                            performOCR={performOCR}
                            classifyDocumentLocal={classifyDocumentLocal}
                            submitFeedbackLocal={submitFeedbackLocal}
                            submitFeedback={submitFeedback}
                            getLocalFeedbackBuffer={getLocalFeedbackBuffer}
                        />
                    )}

                    {activeModule === 'inquiry' && (
                        <CommunicationCenter 
                            supabase={supabase}
                            inquiries={inquiries}
                            setInquiries={setInquiries}
                            activeInquiry={activeInquiry}
                            setActiveInquiry={setActiveInquiry}
                            messages={messages}
                            setMessages={setMessages}
                            setToast={setToast}
                            CURRENT_OPERATOR={CURRENT_OPERATOR}
                        />
                    )}

                    {activeModule === 'node_admin' && (
                        <NodeAdmin 
                            supabase={supabase}
                            staffRole={staffRole}
                            setToast={setToast}
                            CURRENT_OPERATOR={CURRENT_OPERATOR}
                        />
                    )}

                    {activeModule === 'formations' && (
                        <FormationFactory 
                            supabase={supabase}
                            setToast={setToast}
                        />
                    )}

                    {['legacy', 'shield'].includes(activeModule) && (
                        <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center">
                             <Lock size={32} className="text-gray-200 mb-4" />
                             <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-300">Module Encrypted.</h2>
                              <p className="text-gray-400 max-w-sm italic font-medium leading-relaxed">
                                 The {MODULES.find(m => m.id === activeModule)?.label} requires active fulfillment protocols to be established.
                             </p>
                        </div>
                    )}
                </div>
            </main>

            <FulfillmentFooter 
                operatorNode={CURRENT_OPERATOR.node}
                userEmail={user?.email}
            />

            {toast && <FulfillmentToast {...toast} onDismiss={() => setToast(null)} />}

            {/* Settings Overlay */}
            {showSettings && (
                <RASettingsPanel 
                    onClose={() => setShowSettings(false)}
                    watchFolder={watchFolder}
                    setWatchFolder={setWatchFolder}
                    setToast={setToast}
                />
            )}

            {/* Hidden Folder Picker */}
            <input 
                type="file" 
                ref={folderInputRef}
                style={{ display: 'none' }}
                webkitdirectory="true" 
                directory="true" 
                onChange={handleFolderSelect}
            />
        </div>
    );
};

export default FulfillmentPortal;
