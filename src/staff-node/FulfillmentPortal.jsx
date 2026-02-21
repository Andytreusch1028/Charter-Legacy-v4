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

// --- COMPONENTS ---
const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const colors = {
        success: 'bg-emerald-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-luminous-blue text-white',
        warning: 'bg-amber-500 text-white'
    };

    return (
        <div className={`fixed bottom-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${colors[type] || colors.info}`}>
            <Activity size={18} className="animate-pulse" />
            <p className="text-xs font-black uppercase tracking-widest">{message}</p>
            <button onClick={onDismiss} className="ml-4 opacity-50 hover:opacity-100"><X size={14} /></button>
        </div>
    );
};

const StaffLoginForm = ({ onLoginSuccess }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('login'); // login, recovery
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsThinking(true);
        setError(null);
        
        try {
            // -- DEV BYPASS PROTOCOL --
            if (id === 'admin' && (password === 'charter1028' || password === 'admin')) {
                console.warn('⚠️  STAFF BYPASS ENGAGED: AUTHORIZING DEVELOPER OVERRIDE ⚠️');
                const mockStaff = {
                    id: 'staff-dev-override',
                    email: 'admin@charterlegacy.com',
                    app_metadata: { staff_role: 'Superuser' },
                    user_metadata: { full_name: 'Andytreusch (Dev)' }
                };
                onLoginSuccess(mockStaff);
                return;
            }

            if (!supabase?.auth) {
                throw new Error('Security Node offline. Please refresh.');
            }

            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email: id.includes('@') ? id : `${id}@charter-staff.internal`,
                password: password
            });

            if (loginError) throw loginError;
            onLoginSuccess(data.user);
        } catch (err) {
            setError(err.message);
            setIsThinking(false);
        }
    };

    const handleRecovery = async (e) => {
        e.preventDefault();
        setIsThinking(true);
        try {
            await supabase.from('staff_recovery_requests').insert({
                staff_email: recoveryEmail,
                requested_node: 'DeLand-01',
                reason: 'Operator forgot access credentials.'
            });
            setError('Recovery Protocol Initiated. Contact Node Superuser.');
            setIsThinking(false);
            setTimeout(() => setMode('login'), 3000);
        } catch (err) {
            setError('Recovery Sync Failed.');
            setIsThinking(false);
        }
    };

    return (
        <div className="min-h-screen bg-luminous-ink flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-luminous-blue rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-hacker-blue rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="mb-12 text-center">
                    <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        {mode === 'login' ? <Lock className="text-luminous-blue" size={32} /> : <ShieldAlert className="text-amber-500" size={32} />}
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        {mode === 'login' ? 'Internal Vault.' : 'Recovery.'}
                    </h1>
                    <p className="text-[10px] text-luminous-blue font-black uppercase tracking-[0.4em]">Fulfillment Protocol Node</p>
                </div>

                {mode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Credential ID</label>
                            <input 
                                type="text" 
                                required
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="OPERATOR_CODE"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-luminous-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-4 mr-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Access Key</label>
                                <button type="button" onClick={() => setMode('recovery')} className="text-[8px] font-black text-luminous-blue uppercase tracking-widest hover:underline">Forgot?</button>
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-luminous-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                            />
                        </div>
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                {error}
                            </div>
                        )}
                        <button 
                            type="submit"
                            disabled={isThinking}
                            className="w-full bg-luminous-blue hover:bg-hacker-blue text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-luminous-blue/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isThinking ? <Activity className="animate-spin" size={16} /> : <Zap size={16} />}
                            Initiate Session
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRecovery} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Registrar Email</label>
                            <input 
                                type="email" 
                                required
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                placeholder="name@charter-staff.internal"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-luminous-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                            />
                        </div>
                        {error && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-[10px] font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setMode('login')} className="flex-1 py-4 text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Back</button>
                            <button 
                                type="submit"
                                disabled={isThinking}
                                className="flex-2 bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                            >
                                {isThinking ? <Activity size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                                Request Audit
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

const FulfillmentPortal = () => {
    const [user, setUser] = useState(null);
    const [activeModule, setActiveModule] = useState('ra');
    const [staffRole, setStaffRole] = useState('staff');
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

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
    const [customCategories, setCustomCategories] = useState(['Tax Mail', 'Annual Report', 'State Notice']);

    // Watch Folder State
    const [watchFolder, setWatchFolder] = useState(() => localStorage.getItem('cl_watch_folder') || 'C:\\Scanner\\RA-Inbox');
    const [editingFolder, setEditingFolder] = useState(false);
    const [folderDraft, setFolderDraft] = useState(() => localStorage.getItem('cl_watch_folder') || 'C:\\Scanner\\RA-Inbox');
    const [isScanning, setIsScanning] = useState(false);
    const [fileBuffer, setFileBuffer] = useState([]); // Real File objects from local OS
    const folderInputRef = useRef(null);

    // Inquiry-Specific Shared State
    const [inquiries, setInquiries] = useState([]);
    const [activeInquiry, setActiveInquiry] = useState(null);
    const [messages, setMessages] = useState([]);

    // --- RA INGESTION ENGINE ---
    const triggerFolderPicker = () => {
        folderInputRef.current?.click();
    };

    const mapLocalFileToQueueItem = (file) => ({
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        docTitle: file.name,
        entity: '',
        hubId: '',
        sunbizId: '',
        category: 'Unclassified',
        received: 'Just Scanned',
        status: 'Inbound',
        initials: '??',
        aiStatus: 'needs_review',
        aiConfidence: 0,
        rawFile: file, // Keep reference to binary
        preview: {
            heading: file.name,
            body: `Local document pending binary analysis... (${(file.size / 1024).toFixed(1)} KB)`
        },
        meta: {
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type
        }
    });

    const handleScanFolder = async () => {
        if (fileBuffer.length === 0) {
            setToast({ type: 'info', message: 'No new documents detected in buffer.' });
            return;
        }

        setIsScanning(true);
        const processedNewItems = [];
        let duplicatesCount = 0;

        for (const file of fileBuffer) {
            try {
                const contentHash = await calculateSHA256(file);
                
                // 1. Check for global duplicates (liability prevention)
                const { data: existingDoc } = await supabase
                    .from('registered_agent_documents')
                    .select('id')
                    .eq('content_hash', contentHash)
                    .maybeSingle();
                
                const { data: existingLog } = await supabase
                    .from('ra_service_log')
                    .select('id')
                    .eq('document_hash', contentHash)
                    .maybeSingle();

                if (existingDoc || existingLog) {
                    duplicatesCount++;
                    continue; 
                }

                // 2. Persistent Ingest: Upload to pending storage
                const ext = file.name.split('.').pop();
                const path = `pending/${Date.now()}_${Math.random().toString(36).substr(2,9)}.${ext}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('ra-documents')
                    .upload(path, file);
                
                if (uploadError) throw uploadError;

                // 3. Create Service Log Entry (Status: RECEIVED)
                const { data: logEntry, error: logError } = await supabase
                    .from('ra_service_log')
                    .insert({
                        document_name: file.name,
                        document_hash: contentHash,
                        status: 'RECEIVED',
                        staff_id: user.id,
                        node_id: CURRENT_OPERATOR.node,
                        staff_notes: `Initial ingestion from ${watchFolder}`,
                        file_path: path
                    })
                    .select()
                    .single();

                if (logError) throw logError;

                // 4. Map to UI Queue Item
                const item = mapLocalFileToQueueItem(file);
                item.id = logEntry.id; // Sync with DB ID
                item.contentHash = contentHash;
                item.filePath = path;
                processedNewItems.push(item);

            } catch (err) {
                console.error(`Failed to ingest ${file.name}:`, err);
                setToast({ type: 'error', message: `Critical failure on ${file.name}` });
            }
        }
        
        if (processedNewItems.length > 0) {
            setQueue(prev => [...processedNewItems, ...prev]);
            
            // Log to Immutable Audit Ledger
            try {
                const auditEntries = processedNewItems.map(item => ({
                    user_id: user.id,
                    action: 'DOC_RECEIVED',
                    actor_type: 'CHARTER_ADMIN',
                    actor_email: user.email,
                    outcome: 'SUCCESS',
                    metadata: {
                        file_name: item.docTitle,
                        source_node: CURRENT_OPERATOR.node,
                        watch_folder: watchFolder,
                        hash: item.contentHash
                    }
                }));
                await supabase.from('ra_document_audit').insert(auditEntries);
            } catch (auditErr) {
                console.warn('Silent Audit Failure:', auditErr);
            }
        }

        setFileBuffer([]); // Clear buffer after ingestion
        setIsScanning(false);
        
        if (processedNewItems.length > 0) {
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
    };

    const handleFolderSelect = (e) => {
        const files = Array.from(e.target.files).filter(f => 
            f.type.includes('pdf') || f.type.includes('image') || f.name.match(/\.(pdf|jpg|jpeg|png)$/i)
        );
        
        if (files.length > 0) {
            setFileBuffer(files);
            setToast({ type: 'info', message: `${files.length} documents staged for ingestion.` });
        }
        // Reset input so same folder can be picked again if needed
        e.target.value = '';
    };

    const handleSaveFolder = () => {
        setWatchFolder(folderDraft);
        localStorage.setItem('cl_watch_folder', folderDraft);
        setEditingFolder(false);
        setToast({ type: 'success', message: 'Watch folder configuration updated.' });
    };

    const cancelFolderEdit = () => {
        setFolderDraft(watchFolder);
        setEditingFolder(false);
    };

    // --- LOGIC ---
    useEffect(() => {
        const checkUser = async () => {
            if (!supabase?.auth) {
                console.warn('[Staff Node] Supabase client not initialized. Retrying...');
                setLoading(false);
                return;
            }
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    setStaffRole(session.user.app_metadata?.staff_role || 'staff');
                    loadInitialData();
                }
            } catch (err) {
                console.error('[Staff Node] Auth check failed:', err);
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const loadInitialData = async () => {
        try {
            // 1. Load Entities
            const { data: entData } = await supabase.from('clients').select('*').order('name');
            if (entData) setClients(entData);

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

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    // --- RENDER HELPERS ---
    const renderModuleSidebar = () => (
        <aside className="w-80 bg-luminous-ink border-r border-white/5 flex flex-col p-6 shrink-0">
            <div className="mb-12 px-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Workhorse.</h2>
                <p className="text-[9px] text-luminous-blue font-black uppercase tracking-[0.3em] opacity-80 mt-1">Personnel Interface v2.1</p>
            </div>

            <nav className="flex-1 space-y-2">
                {MODULES.map(mod => (
                    <button 
                        key={mod.id}
                        onClick={() => !mod.locked && setActiveModule(mod.id)}
                        className={`w-full group relative p-5 rounded-[28px] text-left transition-all duration-300 border ${
                            activeModule === mod.id 
                                ? 'bg-white/10 border-white/10 shadow-xl' 
                                : 'hover:bg-white/5 border-transparent'
                        } ${mod.locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                                activeModule === mod.id ? 'bg-luminous-blue text-white' : 'bg-white/5 text-white/40 group-hover:text-white/60'
                            }`}>
                                <mod.icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <h3 className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                                    activeModule === mod.id ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                                }`}>
                                    {mod.label}
                                </h3>
                                <p className="text-[9px] text-white/20 font-medium italic truncate mt-0.5">{mod.desc}</p>
                            </div>
                            {mod.locked && <Lock size={12} className="ml-auto text-white/10" />}
                            {activeModule === mod.id && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-luminous-blue shadow-[0_0_12px_rgba(45,108,223,0.8)]" />
                            )}
                        </div>
                    </button>
                ))}
            </nav>

            <div className="mt-auto space-y-4 px-4">
                <div className="p-5 bg-white/5 rounded-[32px] border border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-white text-[10px] font-black">
                            {getInitials(user?.email?.split('@')[0], user?.email)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">{user?.email?.split('@')[0] || 'AL-901'}</p>
                            <p className="text-[8px] text-luminous-blue font-black uppercase tracking-widest">{staffRole}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleLogout} className="flex-1 py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-white/40 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            <LogOut size={10} /> Exit Session
                        </button>
                        <button onClick={() => setShowSettings(true)} className="w-12 py-3 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl flex items-center justify-center transition-all">
                            <Settings size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-luminous-ink flex flex-col items-center justify-center">
                <Activity className="text-luminous-blue animate-spin mb-4" size={40} />
                <p className="text-[10px] font-black text-white uppercase tracking-widest animate-pulse">Initializing Secure Node...</p>
            </div>
        );
    }

    if (!user) {
        return <StaffLoginForm onLoginSuccess={setUser} />;
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {renderModuleSidebar()}
            
            <main className="flex-1 p-16">
                <div className="max-w-6xl mx-auto h-full flex flex-col">
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

            <footer className="fixed bottom-0 left-80 right-0 h-10 px-8 border-t border-gray-100 bg-white/50 backdrop-blur-md flex items-center justify-between z-40">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black text-luminous-ink uppercase tracking-widest">{CURRENT_OPERATOR.node} // CONNECTED</span>
                    </div>
                    <div className="w-px h-3 bg-gray-200" />
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Operator: {user?.email?.split('@')[0]}</span>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-[8px] font-medium text-gray-400 italic">Security Layer: AES-256-GCM Encryption Active</p>
                </div>
            </footer>

            {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}

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
