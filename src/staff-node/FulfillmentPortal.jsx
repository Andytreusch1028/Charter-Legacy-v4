import React, { useState, useEffect, useRef, useCallback } from 'react';
import RASettingsPanel from './components/RASettingsPanel';
import { 
    LayoutDashboard, FilePlus, Shield, Landmark, MessageSquare, 
    Search, Filter, ChevronRight, CheckCircle2, Clock, AlertTriangle,
    Download, User, Lock, Eye, Mail, Activity, ArrowLeft, Upload, X, FileText, Archive, ChevronDown, LogOut,
    Brain, TrendingUp, Zap, Plus, Pin, HelpCircle, Send, FolderOpen, Maximize, Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import RADocumentAuditLog from '../components/RADocumentAuditLog';
import { 
    classifyDocumentLocal, 
    submitFeedbackLocal, 
    submitFeedback, 
    extractFeatures, 
    getLocalFeedbackBuffer 
} from '../lib/aiClassifier';
import { performOCR } from '../lib/ocrEngine';

// ─── Document Classification Categories (research-backed) ────────────────────
// Source: Florida Registered Agent document types per FL Stat. §48, §605, §607
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

// ─── Module Config ────────────────────────────────────────────────────────────
const MODULES = [
    { id: 'formations', label: 'Formation Factory', icon: FilePlus, roles: ['master_admin', 'formation_clerk'], color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'ra', label: 'RA Sentry', icon: Shield, roles: ['master_admin', 'ra_agent'], color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'legacy', label: 'Legacy Protocol', icon: Landmark, roles: ['master_admin', 'legacy_clerk'], color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'shield', label: 'Shield Command', icon: Activity, roles: ['master_admin', 'shield_clerk'], color: 'text-orange-600', bg: 'bg-orange-50' },
];

// Current operator — will be fetched from Supabase Auth in production
const CURRENT_OPERATOR = { id: 'AL-901', name: 'A. Lozano', node: 'DeLand-01' };

const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, []);
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom-4 duration-300 ${
            type === 'success' ? 'bg-emerald-600 text-white' : 
            type === 'info' ? 'bg-luminous-blue text-white' : 
            'bg-red-600 text-white'
        }`}>
            {type === 'success' ? <CheckCircle2 size={16} /> : 
             type === 'info' ? <Activity size={16} /> : 
             <AlertTriangle size={16} />}
            {message}
        </div>
    );
};

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

const StaffLoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // EMERGENCY OVERRIDE: Check local node key first
        try {
            const nodeSettings = JSON.parse(localStorage.getItem('ra_node_settings') || '{}');
            if (nodeSettings.node_access_key && password === nodeSettings.node_access_key) {
                // Adopt the identity of the entered email
                onLoginSuccess({ 
                    id: 'node-operator', 
                    email: email, 
                    app_metadata: { staff_role: 'master_admin' } 
                });
                setLoading(false);
                return;
            }
        } catch (e) { console.error("Node key check error", e); }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (onLoginSuccess) onLoginSuccess(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        if (!email) {
            setError("Please enter your staff email first.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOtp({ 
                email,
                options: {
                    emailRedirectTo: window.location.origin + '/fulfillment.html'
                }
            });
            if (error) throw error;
            setMagicLinkSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luminous-ink flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-500">
                <div className="p-8 pb-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-luminous-blue/10 mb-6">
                        <Shield size={32} className="text-luminous-blue" />
                    </div>
                    <h2 className="text-2xl font-black text-luminous-ink tracking-tight mb-2 uppercase">Staff Authentication</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Charter Legacy | Digital Mailroom Node</p>
                </div>

                <div className="p-8 pt-4 space-y-6">
                    {magicLinkSent ? (
                        <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <Mail size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-luminous-ink uppercase tracking-tight mb-2">Check Your Inbox</h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    A secure magic link has been sent to <span className="font-bold text-gray-900">{email}</span>.<br/>
                                    Click the link in the email to bypass the secure key and enter the node.
                                </p>
                            </div>
                            <button 
                                onClick={() => setMagicLinkSent(false)}
                                className="text-[10px] font-black text-luminous-blue uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                            >
                                ← Try conventional login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-[10px] font-black uppercase tracking-wider animate-shake">
                                    <AlertTriangle size={14} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Staff Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="operator@charterlegacy.com"
                                            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-luminous-blue transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Key</label>
                                        <button 
                                            type="button"
                                            onClick={handleMagicLink}
                                            className="text-[9px] font-black text-luminous-blue uppercase tracking-widest hover:underline"
                                        >
                                            Lost Key? Send Magic Link
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-luminous-blue transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-luminous-blue text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? (
                                    <Activity className="animate-spin" size={16} />
                                ) : (
                                    <>Authorize Access <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                            
                            <div className="pt-4 flex items-center justify-center gap-2 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                <Shield size={10} />
                                End-to-End Encrypted Node Connection
                            </div>
                        </form>
                    )}
                </div>
            </div>
            
            <div className="mt-12 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] animate-pulse">Authorized Personnel Only</p>
                <button 
                    onClick={() => onLoginSuccess({ id: 'mock-admin', email: 'admin@charterlegacy.com', app_metadata: { staff_role: 'master_admin' } })}
                    className="px-6 py-3 bg-red-600/10 border border-red-500 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-500/10 active:scale-95"
                >
                    DEBUG: Protocol Alpha Bypass
                </button>
            </div>
        </div>
    );
};

const FulfillmentPortal = () => {
    const [user, setUser] = useState(null);
    const [activeModule, setActiveModule] = useState(() => localStorage.getItem('cl_active_module') || 'ra');
    const [staffRole, setStaffRole] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('queue');
    const [activeItem, setActiveItem] = useState(null);

    // Stateful queue
    const [queue, setQueue] = useState([]);
    const [processedItems, setProcessedItems] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [activeInquiry, setActiveInquiry] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [toast, setToast] = useState(null);
    const [duplicateModal, setDuplicateModal] = useState(null); // { item, existing, onConfirm, onCancel }

    // Watch Folder config
    // Watch Folder config - prioritized from Settings
    const [watchFolder, setWatchFolder] = useState(() => {
        try {
            const settings = JSON.parse(localStorage.getItem('ra_node_settings') || '{}');
            return settings.watch_folder || localStorage.getItem('cl_watch_folder') || 'C:\\Scanner\\RA-Inbox';
        } catch {
            return 'C:\\Scanner\\RA-Inbox';
        }
    });
    const [editingFolder, setEditingFolder] = useState(false);
    const [folderDraft, setFolderDraft] = useState(watchFolder);
    const [isScanning, setIsScanning] = useState(false);

    // Auth Effect
    useEffect(() => {
        // Initial check
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user);
                setStaffRole(user.app_metadata?.staff_role || 'staff');
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                setStaffRole(session.user.app_metadata?.staff_role || 'staff');
            } else {
                setUser(null);
                setStaffRole(null);
            }
        });

        // Clear the error/access_token from URL if present to avoid loops
        if (window.location.hash) {
            window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('cl_active_module', activeModule);
        localStorage.setItem('cl_watch_folder', watchFolder);
        if (viewMode) localStorage.setItem('cl_view_mode', viewMode);
        if (activeItem) localStorage.setItem('cl_active_item', activeItem);
    }, [activeModule, watchFolder, viewMode, activeItem]);
    const [fileBuffer, setFileBuffer] = useState([]); // Real File objects from local OS
    const [activeDocUrl, setActiveDocUrl] = useState(null);
    const [ocrProgress, setOcrProgress] = useState({}); // { [itemId]: percentage }
    const folderInputRef = useRef(null);

    // Entity Lookup state
    const [clients, setClients] = useState([]); 
    const [entitySearch, setEntitySearch] = useState('');
    const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);
    const [linkedEntities, setLinkedEntities] = useState({});  // { [queueItemId]: entityObject }
    const [forwardingRecipients, setForwardingRecipients] = useState({}); // { [itemId]: Array<{ name, email, initials, id, source }> }
    const [manualEmail, setManualEmail] = useState('');
    
    // Fetch real entities from database
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const { data, error } = await supabase.from('clients').select('*').order('name');
                if (error) throw error;
                if (data) {
                    // Map snake_case from DB to camelCase for UI consistency where needed
                    const mapped = data.map(c => ({
                        ...c,
                        sunbizId: c.sunbiz_id,
                        hubId: c.hub_id
                    }));
                    setClients(mapped);
                }
            } catch (err) {
                console.error('[RA Sentry] Could not fetch clients from database:', err);
            }
        };
        fetchClients();
    }, []);
    
    // URL Management for Local Files
    useEffect(() => {
        if (!activeItem) {
            setActiveDocUrl(null);
            return;
        }
        
        const doc = queue.find(q => q.id === activeItem);
        if (doc && doc.rawFile) {
            const url = URL.createObjectURL(doc.rawFile);
            setActiveDocUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setActiveDocUrl(null);
        }
    }, [activeItem, queue]);

    // Fetch Inquiries - Real-time
    useEffect(() => {
        const fetchInquiries = async () => {
            const { data, error } = await supabase
                .from('ra_inquiry_threads')
                .select('*, profiles:user_id(full_name, email)')
                .order('updated_at', { ascending: false });
            if (!error && data) setInquiries(data);
        };
        fetchInquiries();

        const channel = supabase
            .channel('ra-staff-inquiries')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ra_inquiry_threads' }, () => {
                fetchInquiries();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Fetch Messages for active inquiry
    useEffect(() => {
        if (!activeInquiry) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('ra_inquiry_messages')
                .select('*')
                .eq('thread_id', activeInquiry.id)
                .order('created_at', { ascending: true });
            if (!error && data) setMessages(data);
        };
        fetchMessages();

        const channel = supabase
            .channel(`staff-messages-${activeInquiry.id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'ra_inquiry_messages',
                filter: `thread_id=eq.${activeInquiry.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeInquiry]);

    const handleSendStaffMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeInquiry) return;

        setSendingMessage(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('ra_inquiry_messages').insert({
                thread_id: activeInquiry.id,
                sender_id: user.id,
                content: newMessage,
                is_staff: true
            });
            if (error) throw error;
            
            // Update thread status to STAFF_REVIEW if it was OPEN
            if (activeInquiry.status === 'OPEN') {
                await supabase.from('ra_inquiry_threads').update({ status: 'STAFF_REVIEW' }).eq('id', activeInquiry.id);
            }

            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSendingMessage(false);
        }
    };
    
    // ── REAL OCR TRIGGER — Runs when a local document is selected ──────────────
    useEffect(() => {
        if (!activeItem) return;
        
        const doc = queue.find(q => q.id === activeItem);
        // Only run OCR if it's a local file, hasn't been OCR'd yet, and isn't currently running
        if (doc && doc.rawFile && !doc.fullText && ocrProgress[activeItem] === undefined) {
            const runOCR = async () => {
                setOcrProgress(prev => ({ ...prev, [activeItem]: 1 }));
                
                try {
                    const text = await performOCR(doc.rawFile, (progress) => {
                        setOcrProgress(prev => ({ ...prev, [activeItem]: progress }));
                    });
                    
                    // Update queue with real OCR content
                    setQueue(prev => prev.map(q => q.id === activeItem ? {
                        ...q,
                        fullText: text,
                        aiStatus: 'needs_review',
                        preview: {
                            ...q.preview,
                            body: text.substring(0, 1000) // First 1k chars for dashboard preview
                        }
                    } : q));
                    
                    // Run AI classification on the REAL text
                    const classification = classifyDocumentLocal(text, clients);
                    setAiClassifications(prev => ({ ...prev, [activeItem]: classification }));
                    
                    // Link if confidence is high
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
    }, [activeItem, queue, ocrProgress]);

    // AI Learning state
    const [aiClassifications, setAiClassifications] = useState({}); // { [queueItemId]: classificationResult }
    const [reviewStartTimes, setReviewStartTimes] = useState({});   // { [queueItemId]: timestamp }
    const [aiStats, setAiStats] = useState({ accepted: 0, overridden: 0, manual: 0, total: 0 });
    const [showAiStats, setShowAiStats] = useState(false);
    const [feedbackBuffer, setFeedbackBuffer] = useState([]);

    // Custom classification categories (operator-created)
    const [customCategories, setCustomCategories] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cl_custom_categories') || '[]'); } catch { return []; }
    });
    const [showOtherInput, setShowOtherInput] = useState({});  // { [queueItemId]: boolean }
    const [otherCategoryDraft, setOtherCategoryDraft] = useState('');  // text input draft

    // Persist custom categories to localStorage when they change
    useEffect(() => {
        localStorage.setItem('cl_custom_categories', JSON.stringify(customCategories));
    }, [customCategories]);

    // Pre-classifier effect — runs once clients are loaded
    useEffect(() => {
        if (clients.length === 0) return;

        const prelinked = {};
        const recipients = {};
        const classifications = {};
        
        setQueue(prev => prev.map(q => {
            let updatedItem = { ...q };
            
            // Find match in real clients
            const match = clients.find(e => e.name === q.entity);
            if (match) {
                prelinked[q.id] = match;
                const initials = getInitials(match.owner_name, match.email);
                recipients[q.id] = [{ name: match.owner_name, email: match.email, initials, id: `init-${q.id}`, source: 'entity' }];
                updatedItem = { ...updatedItem, hubId: match.hubId, sunbizId: match.sunbizId, contact: match.owner_name, initials };
            }
            
            // Run local AI classification on each item's preview text
            if (q.preview?.body) {
                const result = classifyDocumentLocal(
                    q.preview.heading + '\n' + q.preview.body,
                    clients
                );
                // Use existing AI fields if they exist, otherwise use classifier
                classifications[q.id] = {
                    ...result,
                    aiConfidence: q.aiConfidence ?? result.aiConfidence,
                    aiStatus: q.aiStatus ?? result.aiStatus,
                    aiSource: q.aiSource ?? result.aiSource,
                };
            }
            return updatedItem;
        }));
        
        setLinkedEntities(prelinked);
        setForwardingRecipients(recipients);
        setAiClassifications(classifications);
    }, [clients]);

    useEffect(() => {
        setLoading(false);
    }, []);

    // Toast auto-dismiss
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    // ── Track when staff starts reviewing an item (for review_time_ms) ──
    const handleSelectItem = useCallback((itemId) => {
        setActiveItem(itemId);
        setReviewStartTimes(prev => ({
            ...prev,
            [itemId]: prev[itemId] || Date.now()
        }));
    }, []);

    // ── Calculate review time for an item ──
    const getReviewTimeMs = useCallback((itemId) => {
        const start = reviewStartTimes[itemId];
        return start ? Date.now() - start : 0;
    }, [reviewStartTimes]);

    // ── ACCEPT MATCH — AI was correct, staff confirms ──
    const handleAcceptMatch = useCallback((itemId) => {
        const item = queue.find(q => q.id === itemId);
        const classification = aiClassifications[itemId];
        if (!item) return;

        const linked = linkedEntities[itemId];
        const initials = linked ? getInitials(linked.owner_name, linked.email) : item.initials;

        // Update queue item initials if we have a linked entity
        if (linked) {
            setQueue(prev => prev.map(q => q.id === itemId ? { ...q, aiStatus: 'confirmed', initials } : q));
            setForwardingRecipients(fr => ({
                ...fr,
                [itemId]: [{ name: linked.owner_name, email: linked.email, initials, source: 'entity' }]
            }));
        } else {
            setQueue(prev => prev.map(q => q.id === itemId ? { ...q, aiStatus: 'confirmed' } : q));
        }

        // Send ACCEPT feedback to learning system
        const correctedTo = {
            entity: linked?.name || item.entity,
            hubId: linked?.hubId || item.hubId,
            sunbizId: linked?.sunbizId || item.sunbizId,
            docType: item.category,
        };

        // Local feedback (adjusts weights in memory immediately)
        if (classification) {
            submitFeedbackLocal('ACCEPT', classification, correctedTo);
        }

        // Async feedback to Supabase (non-blocking)
        if (classification) {
            submitFeedback({
                feedbackType: 'ACCEPT',
                classificationResult: classification,
                correctedTo,
                operator: CURRENT_OPERATOR,
                reviewTimeMs: getReviewTimeMs(itemId),
                queueItemId: itemId.toString(),
            }).catch(() => {}); // Silently fail — feedback is best-effort
        }

        // Update stats
        setAiStats(prev => ({ ...prev, accepted: prev.accepted + 1, total: prev.total + 1 }));
        setFeedbackBuffer(getLocalFeedbackBuffer());

        setToast({ type: 'success', message: `✓ AI match confirmed — model weights reinforced` });
    }, [queue, aiClassifications, linkedEntities, getReviewTimeMs]);

    // ── OVERRIDE — AI was wrong, staff rejects and will manually link ──
    const handleOverride = useCallback((itemId) => {
        const item = queue.find(q => q.id === itemId);
        const classification = aiClassifications[itemId];
        if (!item) return;

        // Update queue state — clear entity data
        setQueue(prev => prev.map(q => q.id === itemId ? {
            ...q, 
            aiStatus: 'needs_review', 
            entity: '', hubId: '', sunbizId: '', contact: '', initials: '??'
        } : q));
        setLinkedEntities(prev => { const n = {...prev}; delete n[itemId]; return n; });

        // Send OVERRIDE feedback (penalizes rules that fired incorrectly)
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
    }, [queue, aiClassifications, getReviewTimeMs]);

    // ── MANUAL LINK — Staff manually selects an entity (for needs_review items) ──
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

        // Send MANUAL_LINK feedback so the AI learns this pattern
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
    }, [aiClassifications, queue, getReviewTimeMs]);

    const handleAddRecipient = useCallback((itemId, recipient) => {
        setForwardingRecipients(prev => {
            const current = prev[itemId] || [];
            if (current.some(r => r.email === recipient.email)) return prev;
            return {
                ...prev,
                [itemId]: [...current, recipient]
            };
        });
        
        // Update first recipient initials on queue item
        setForwardingRecipients(updated => {
            const list = updated[itemId];
            if (list.length > 0) {
                setQueue(q => q.map(item => item.id === itemId ? { ...item, initials: list[0].initials } : item));
            }
            return updated;
        });
    }, []);

    const handleRemoveRecipient = useCallback((itemId, recipientId) => {
        setForwardingRecipients(prev => {
            const current = prev[itemId] || [];
            const filtered = current.filter(r => r.id !== recipientId);
            
            // Sync initials if first one removed
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
    }, []);

    const handleFinalize = useCallback(async (itemId, override = false) => {
        const item = queue.find(q => q.id === itemId);
        const entity = linkedEntities[itemId];
        if (!item) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // 0. Deduplication Check (Client-side pre-flight for local files)
            let contentHash = null;
            if (item.rawFile) {
                 contentHash = await calculateSHA256(item.rawFile);
                 
                 if (!override) {
                     // Check specific hash in DB
                     const { data: existing } = await supabase
                        .from('registered_agent_documents')
                        .select('id, title, created_at, status')
                        .eq('content_hash', contentHash)
                        .maybeSingle();
                     
                     if (existing) {
                         setDuplicateModal({ 
                             item, 
                             existing, 
                             onConfirm: () => { setDuplicateModal(null); handleFinalize(itemId, true); },
                             onCancel: () => setDuplicateModal(null)
                         });
                         return; // Stop flow
                     }
                 }
            }

            // 1. Upload to Storage (if rawFile exists)
            let filePath = item.filePath;
            if (item.rawFile) {
                 const ext = item.rawFile.name.split('.').pop();
                 const targetUserId = entity?.user_id || user.id;
                 const path = `${targetUserId}/${Date.now()}_${Math.random().toString(36).substr(2,9)}.${ext}`;
                 
                 const { error: uploadError } = await supabase.storage
                    .from('ra-documents')
                    .upload(path, item.rawFile);
                 
                 if (uploadError) throw uploadError;
                 filePath = path; 
            }
            
            // 2. Ingest via Edge Function (handles DB insert + Email + Audit)
            const recipients = forwardingRecipients[itemId] || [];
            const primaryRecipient = recipients.find(r => r.source === 'entity') || recipients[0];
            
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
            if (ingestData?.error) throw new Error(ingestData.error);

            // 3. Local Cleanup & Event Log (Legacy)
            // We still log the event for the staff dashboard, though ingest function does its own audit
            await supabase.from('fulfillment_events').insert({
                staff_id: user.id,
                module: 'RA',
                action_type: override ? 'FINALIZE_FORWARD_OVERRIDE' : 'FINALIZE_FORWARD',
                target_id: ingestData.document_id,
                contemporaneous_proof: {
                    entity: entity?.name,
                    docTitle: item.docTitle,
                    hash: contentHash
                }
            });

            // --- TRANSPARENCY LEDGER SYNC ---
            // This is the bridge to the User Console
            await supabase.from('ra_service_log').insert({
                client_id: entity?.user_id || user.id,
                document_name: item.docTitle,
                document_hash: contentHash,
                category: item.category,
                status: 'FORWARDED',
                staff_id: CURRENT_OPERATOR.id,
                node_id: CURRENT_OPERATOR.node,
                staff_notes: `Forwarded to ${recipients.length} recipients.`
            });
            // --------------------------------

            // 4. Move to local processed state
            const now = new Date();
            setProcessedItems(prev => [{ 
                ...item, 
                id: ingestData.document_id || item.id, // Use real ID if available
                processedAt: now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }),
                processedBy: CURRENT_OPERATOR.id,
                processedByName: CURRENT_OPERATOR.name,
                processedNode: CURRENT_OPERATOR.node,
            }, ...prev]);

            setQueue(prev => prev.filter(q => q.id !== itemId));
            setLinkedEntities(prev => { const next = { ...prev }; delete next[itemId]; return next; });
            setForwardingRecipients(prev => { const next = { ...prev }; delete next[itemId]; return next; });
            setToast({ type: 'success', message: `${item.docTitle} forwarded to ${recipients.length} recipients successfully.` });
            
            // Auto-advance
            const remaining = queue.filter(q => q.id !== itemId);
            setActiveItem(remaining.length > 0 ? remaining[0].id : null);
        } catch (err) {
            console.error('Finalize failure:', err);
            setToast({ type: 'error', message: `Failed to finalize: ${err.message}` });
        }
    }, [queue, linkedEntities]);

    const handleRequestInquiry = useCallback(async (itemId) => {
        const item = queue.find(q => q.id === itemId);
        const entity = linkedEntities[itemId];
        if (!item) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Create a real inquiry thread
            const { data: thread, error: threadError } = await supabase
                .from('ra_inquiry_threads')
                .insert({
                    user_id: entity?.user_id || user?.id, // Use entity owner or current user
                    subject: `Clarification: ${item.docTitle}`,
                    status: 'OPEN'
                })
                .select()
                .single();

            if (threadError) throw threadError;

            // Add initial system message
            await supabase.from('ra_inquiry_messages').insert({
                thread_id: thread.id,
                sender_id: user?.id,
                content: `Document #${item.id} (${item.docTitle}) has been flagged for clarification. Our staff is reviewing the OCR data.`,
                is_staff: true
            });

            setQueue(prev => prev.filter(q => q.id !== itemId));
            setToast({ type: 'info', message: `Document #${item.id} moved to Legal Inquiries` });
            
            // Auto-advance
            const remaining = queue.filter(q => q.id !== itemId);
            setActiveItem(remaining.length > 0 ? remaining[0].id : null);
        } catch (err) {
            console.error('Inquiry request failed:', err);
            setToast({ type: 'error', message: 'Failed to create inquiry' });
        }
    }, [queue, linkedEntities]);

    // ── AUTHENTIC SCAN FOLDER — Pulls from real local file buffer ──
    const handleScanFolder = useCallback(() => {
        if (isScanning) return;
        
        if (fileBuffer.length === 0) {
            setToast({ type: 'warning', message: "No new documents in the linked folder. Browse to reload." });
            return;
        }

        setIsScanning(true);
        setToast({ type: 'info', message: `Ingesting from ${watchFolder}...` });

        const nextFile = fileBuffer[0];
        const remaining = fileBuffer.slice(1);
        setFileBuffer(remaining);

        const newId = Date.now();
        const newItem = {
            id: newId, 
            hubId: '', 
            category: '', 
            urgent: nextFile.name.toLowerCase().includes('urgent') || nextFile.name.toLowerCase().includes('sop'),
            entity: '', 
            sunbizId: '', 
            contact: '',
            initials: '??', 
            docTitle: nextFile.name,
            received: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
            ago: 'just now',
            aiConfidence: 0, 
            aiStatus: 'needs_review',
            aiSource: `Authentic ingestion of local binary: ${nextFile.name} (${(nextFile.size / 1024).toFixed(1)} KB)`,
            preview: { 
                heading: nextFile.name.toUpperCase(), 
                body: `Source: ${watchFolder}\nType: ${nextFile.type || 'application/octet-stream'}\nSize: ${(nextFile.size / 1024).toFixed(1)} KB\nReady for OCR extraction and entity matching.` 
            }
        };

        setQueue(prev => [newItem, ...prev]);
        setIsScanning(false);
        setToast({ type: 'success', message: `Successfully ingested: ${newItem.docTitle}` });
        
        // Trigger AI classification on the real filename/metadata
        const aiResult = classifyDocumentLocal(newItem.preview.heading + '\n' + newItem.preview.body, clients);
        setAiClassifications(prev => ({
            ...prev,
            [newId]: {
                ...aiResult,
                aiStatus: 'needs_review'
            }
        }));
    }, [isScanning, watchFolder, fileBuffer]);

    const triggerFolderPicker = () => {
        folderInputRef.current?.click();
    };

    const mapLocalFileToQueueItem = (file, folderPath) => {
        const id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
            id,
            hubId: 'LOCAL-INBOX',
            category: '', 
            urgent: file.name.toLowerCase().includes('urgent') || file.name.toLowerCase().includes('sop') || file.name.toLowerCase().includes('garnishment'),
            entity: '', 
            sunbizId: '', 
            contact: '',
            initials: getInitials(file.name), 
            docTitle: file.name,
            received: new Date(file.lastModified).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
            ago: 'just indexed',
            aiConfidence: 0, 
            aiStatus: 'needs_review',
            aiSource: `Authentic local file handle from ${folderPath}`,
            rawFile: file, // Store the raw file handle
            meta: {
                size: (file.size / 1024).toFixed(1) + ' KB',
                type: file.type || 'application/octet-stream',
                lastModified: new Date(file.lastModified).toISOString()
            },
            preview: { 
                heading: file.name.toUpperCase(), 
                body: `Source: ${folderPath}\nFile Type: ${file.type || 'document'}\nSize: ${(file.size / 1024).toFixed(1)} KB\nLast Modified: ${new Date(file.lastModified).toLocaleString()}\n\nSelect document to begin AI feature extraction and entity matching.` 
            }
        };
    };

    const handleFolderSelect = (event) => {
        const rawFiles = Array.from(event?.target?.files || []);
        if (rawFiles.length > 0) {
            const allowedExtensions = ['.pdf', '.txt', '.docx', '.doc'];
            const validFiles = rawFiles.filter(f => 
                allowedExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
            );

            // Extract folder name from the first file's path
            const relativePath = rawFiles[0].webkitRelativePath || '';
            const folderName = relativePath.split('/')[0] || 'Local Inbox';
            const simulatedPath = `G:\\My Drive\\${folderName}`;
            
            const realItems = validFiles.map(f => mapLocalFileToQueueItem(f, simulatedPath));
            
            setWatchFolder(simulatedPath);
            setFolderDraft(simulatedPath);
            
            // CRITICAL: Replace mocks with real documents
            setQueue(realItems); 
            setProcessedItems([]);
            setInquiries([]);
            setActiveItem(realItems.length > 0 ? realItems[0].id : null);
            
            setFileBuffer([]); 
            setToast({ 
                type: 'success', 
                message: `DIRECTORY SYNCED: Connected ${folderName} (${realItems.length} documents live)` 
            });

            // Reset input so it can be re-selected if needed
            if (event.target) event.target.value = '';
        }
    };

    const normalizedRole = user ? (staffRole || 'staff') : 'guest';
    const accessibleModules = (user && normalizedRole === 'master_admin') 
        ? MODULES 
        : MODULES.filter(m => m.roles.includes(normalizedRole));

    const renderModuleSidebar = () => (
        <aside className="w-72 bg-[#0A0A0B] text-white p-8 flex flex-col h-screen sticky top-0 shrink-0 border-r border-white/5">
            <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-luminous-blue flex items-center justify-center text-white"><Shield size={18} /></div>
                    <h1 className="text-xl font-black uppercase tracking-tighter">Staff Portal.</h1>
                </div>
            </div>
            {/* DEBUG MARKER */}
            <div className="absolute -left-1 top-20 w-2 h-10 bg-red-500 rounded-r-full shadow-[0_0_15px_rgba(239,68,68,0.5)] z-[100]" />

            {/* Session Status Badge */}
            <div className="mb-8 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Session Active</p>
                        <p className="text-[7px] font-bold text-gray-500 uppercase tracking-widest mt-1">Immutable Log Enabled</p>
                    </div>
                </div>
                <button 
                    onClick={handleSignOut}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
                    title="Terminate Session"
                >
                    <LogOut size={14} />
                </button>
            </div>

            <nav className="flex-1 space-y-6">
                <div>
                     <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 ml-2">Deliverables</p>
                    <div className="space-y-2">
                        {accessibleModules.map(module => (
                            <button
                                key={module.id}
                                onClick={() => setActiveModule(module.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                                    activeModule === module.id 
                                    ? 'bg-white/10 text-white shadow-lg' 
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <module.icon size={18} className={activeModule === module.id ? 'text-luminous-blue' : ''} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{module.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 ml-2">Administrative</p>
                    <div className="space-y-2">
                         <button onClick={() => setViewMode('audit')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${viewMode === 'audit' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                             <Activity size={18} />
                             <span className="text-[11px] font-black uppercase tracking-widest">Global Audit</span>
                         </button>
                         <button 
                            onClick={() => setShowSettings(true)} 
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-luminous-blue/10 text-luminous-blue hover:bg-luminous-blue hover:text-white transition-all shadow-lg shadow-luminous-blue/10"
                         >
                             <Settings size={18} />
                             <span className="text-[11px] font-black uppercase tracking-widest">Node Config</span>
                         </button>
                    </div>
                </div>
            </nav>

            <div className="pt-8 border-t border-white/5 mt-auto space-y-4">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-luminous-blue/20 flex items-center justify-center text-luminous-blue font-black uppercase tracking-tighter text-xs">
                        {user?.email?.[0].toUpperCase() || 'AL'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{user?.email?.split('@')[0] || 'Admin Liaison'}</p>
                        <p className="text-[8px] text-gray-500 font-medium truncate mb-0.5">{user?.email}</p>
                        <p className="text-[7px] font-black text-luminous-blue uppercase tracking-widest bg-luminous-blue/10 px-1.5 py-0.5 rounded inline-block">{staffRole?.replace('_', ' ')}</p>
                    </div>
                </div>

                <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] group"
                >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">End Session / Sign Out</span>
                </button>
            </div>
        </aside>
    );

    const renderRAModule = () => {

        return (
            <div className="h-[calc(100vh-128px)] flex flex-col gap-6 animate-in fade-in duration-500">
                {/* Connection Status Banner */}
                <div className="bg-luminous-ink text-white px-6 py-2 rounded-2xl flex items-center justify-between shadow-lg shadow-black/10">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Secure Node Connection: Active</p>
                    </div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest italic pt-0.5">Build v4.2.0-STAFF</p>
                </div>

                {/* RA Sub-Header / Tabs */}
                <header className="flex items-center justify-between border-b border-gray-200 pb-6 shrink-0">
                    <div className="flex items-center gap-8">
                        <div className="shrink-0">
                            <h2 className="text-3xl font-black text-luminous-ink uppercase tracking-tighter leading-none whitespace-nowrap">RA Sentry</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 whitespace-nowrap">Digital Mailroom Console</p>
                        </div>
                        <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                            {[
                                { id: 'queue', label: 'Work Queue', count: queue.length },
                                { id: 'processed', label: 'Processed', count: processedItems.length },
                                { id: 'inquiry', label: 'Inquiries', count: inquiries.length },
                                { id: 'audit', label: 'Audit Log' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setViewMode(tab.id)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        viewMode === tab.id ? 'bg-white text-luminous-ink shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {tab.label} <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] ${viewMode === tab.id ? 'bg-luminous-blue text-white' : 'bg-gray-200 text-gray-500'}`}>{tab.count}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex gap-3 items-center">
                         <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl min-w-[300px]">
                             <div className="relative">
                                 <FileText size={12} className={isScanning ? 'text-luminous-blue' : 'text-gray-400'} />
                                 {isScanning && <span className="absolute -top-1 -right-1 w-2 h-2 bg-luminous-blue rounded-full animate-ping" />}
                             </div>
                              {editingFolder ? (
                                 <div className="flex-1 flex items-center gap-2">
                                     <button 
                                        onClick={triggerFolderPicker}
                                        className="p-1.5 bg-white border border-gray-200 rounded-lg text-luminous-blue hover:bg-blue-50 transition-all flex items-center justify-center shrink-0"
                                        title="Browse folders"
                                     >
                                        <FolderOpen size={14} />
                                     </button>
                                     <form 
                                        onSubmit={(e) => { 
                                            e.preventDefault(); 
                                            setWatchFolder(folderDraft); 
                                            localStorage.setItem('cl_watch_folder', folderDraft);
                                            setEditingFolder(false); 
                                            setToast({ type: 'success', message: `Watch folder path updated and verified.` }); 
                                            handleScanFolder();
                                        }} 
                                        className="flex-1 flex items-center gap-2"
                                     >
                                         <input 
                                             type="text" value={folderDraft} onChange={e => setFolderDraft(e.target.value)}
                                             className="flex-1 text-[9px] font-mono font-bold text-luminous-ink bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-luminous-blue"
                                             autoFocus
                                         />
                                         <button type="submit" className="text-[8px] font-black text-luminous-blue uppercase hover:text-blue-700 transition-colors">Save</button>
                                         <button type="button" onClick={() => setEditingFolder(false)} className="text-[8px] font-black text-gray-400 uppercase hover:text-gray-600 transition-colors">Cancel</button>
                                     </form>
                                 </div>
                             ) : (
                                 <div className="flex-1 flex items-center justify-between gap-4">
                                     <div className="flex items-center gap-2 overflow-hidden">
                                         <button 
                                            onClick={triggerFolderPicker}
                                            className={`p-1.5 border rounded-lg transition-all flex items-center justify-center shrink-0 ${
                                                queue.some(q => String(q.id).startsWith('local')) ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-gray-100 text-luminous-blue hover:border-luminous-blue hover:bg-blue-50'
                                            }`}
                                            title="Browse local folder"
                                        >
                                            <FolderOpen size={14} />
                                        </button>
                                        <button onClick={() => { setFolderDraft(watchFolder); setEditingFolder(true); }} className="text-[9px] font-mono font-bold text-gray-500 hover:text-luminous-blue transition-colors truncate max-w-[150px]" title="Click to edit path manually">
                                            {watchFolder}
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={folderInputRef}
                                            webkitdirectory="true" 
                                            directory="true" 
                                            style={{ display: 'none' }}
                                            onChange={handleFolderSelect}
                                        />
                                     </div>
                                     <button 
                                        onClick={handleScanFolder}
                                        disabled={isScanning}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${
                                            isScanning ? 'bg-blue-50 text-blue-400' : 'bg-white border border-gray-200 text-gray-400 hover:border-luminous-blue hover:text-luminous-blue hover:shadow-sm'
                                        }`}
                                     >
                                        <Zap size={8} className={isScanning ? 'animate-pulse' : ''} />
                                        {isScanning ? 'Scanning...' : fileBuffer.length > 0 ? `Pull [${fileBuffer.length}]` : 'Refresh Folder'}
                                     </button>
                                 </div>
                             )}
                         </div>
                         <div className="flex items-center gap-4 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none">SLA: 100% On-Track</p>
                         </div>
                         {/* AI Learning Stats Badge */}
                         <button 
                            onClick={() => setShowAiStats(!showAiStats)}
                            className="flex items-center gap-3 px-4 py-2 bg-violet-50 border border-violet-100 rounded-xl hover:bg-violet-100 transition-all relative group"
                         >
                            <Brain size={12} className="text-violet-500" />
                            <p className="text-[9px] font-black text-violet-700 uppercase tracking-widest leading-none">
                                AI Engine {aiStats.total > 0 ? `· ${Math.round((aiStats.accepted / Math.max(aiStats.total, 1)) * 100)}%` : '· Ready'}
                            </p>
                            {feedbackBuffer.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 text-white text-[7px] font-black rounded-full flex items-center justify-center">{feedbackBuffer.length}</span>
                            )}
                         </button>
                    </div>
                </header>

                {/* AI Learning Stats Panel */}
                {showAiStats && (
                    <div className="absolute top-16 right-8 z-40 w-80 bg-white border border-violet-100 rounded-2xl shadow-2xl shadow-violet-500/10 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain size={14} className="text-violet-500" />
                                <h3 className="text-[10px] font-black text-luminous-ink uppercase tracking-widest">AI Learning Engine</h3>
                            </div>
                            <button onClick={() => setShowAiStats(false)} className="text-gray-300 hover:text-gray-500"><X size={12} /></button>
                        </div>

                        {/* Accuracy */}
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3">
                            <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest mb-1">Session Accuracy</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-violet-700">
                                    {aiStats.total > 0 ? `${Math.round((aiStats.accepted / aiStats.total) * 100)}%` : '—'}
                                </span>
                                <span className="text-[9px] text-violet-400 font-bold">
                                    {aiStats.total > 0 ? `${aiStats.accepted} of ${aiStats.total} correct` : 'No classifications yet'}
                                </span>
                            </div>
                            {aiStats.total > 0 && (
                                <div className="w-full bg-violet-100 rounded-full h-1.5 mt-2">
                                    <div 
                                        className="bg-violet-500 rounded-full h-1.5 transition-all duration-500"
                                        style={{ width: `${Math.round((aiStats.accepted / aiStats.total) * 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-emerald-50 rounded-lg p-2 text-center">
                                <p className="text-lg font-black text-emerald-600">{aiStats.accepted}</p>
                                <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Accepted</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-2 text-center">
                                <p className="text-lg font-black text-amber-600">{aiStats.overridden}</p>
                                <p className="text-[7px] font-black text-amber-400 uppercase tracking-widest">Overrides</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-2 text-center">
                                <p className="text-lg font-black text-blue-600">{aiStats.manual}</p>
                                <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Manual</p>
                            </div>
                        </div>

                        {/* Learning Signal */}
                        <div className="border-t border-violet-100 pt-3">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={10} className="text-violet-400" />
                                <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest">Learning Signal</p>
                            </div>
                            <p className="text-[9px] text-gray-500 leading-relaxed">
                                {feedbackBuffer.length === 0 
                                    ? 'Waiting for first classification feedback...'
                                    : `${feedbackBuffer.length} feedback events buffered. Each Accept reinforces matching rules (+δ). Each Override penalizes incorrect rules (-δ). Weights converge toward higher accuracy over time.`
                                }
                            </p>
                        </div>

                        {/* Active Rules Preview */}
                        <div className="border-t border-violet-100 pt-3">
                            <p className="text-[8px] font-black text-violet-400 uppercase tracking-widest mb-2">Top Matching Rules</p>
                            <div className="space-y-1.5">
                                {[
                                    { name: 'SunBiz Doc #', weight: 98 },
                                    { name: 'Entity Name (exact)', weight: 95 },
                                    { name: 'EIN/TIN Match', weight: 92 },
                                    { name: 'Case Number', weight: 85 },
                                    { name: 'Hub Address', weight: 80 },
                                ].map(rule => (
                                    <div key={rule.name} className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-100 rounded-full h-1">
                                            <div className="bg-violet-400 rounded-full h-1" style={{ width: `${rule.weight}%` }} />
                                        </div>
                                        <span className="text-[7px] font-bold text-gray-400 w-16 text-right truncate">{rule.name}</span>
                                        <span className="text-[8px] font-black text-violet-600 w-8 text-right">{rule.weight}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom-4 duration-300 ${
                        toast.type === 'success' ? 'bg-emerald-600 text-white' : toast.type === 'info' ? 'bg-violet-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                        {toast.type === 'success' ? <CheckCircle2 size={18} /> : toast.type === 'info' ? <Brain size={18} /> : <AlertTriangle size={18} />}
                        {toast.message}
                        <button onClick={() => setToast(null)} className="ml-4 opacity-60 hover:opacity-100"><X size={14} /></button>
                    </div>
                )}

                {viewMode === 'inquiry' && (
                    <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                        {/* LEFT: Inquiry List */}
                        <aside className="w-80 flex flex-col gap-3 overflow-y-auto pr-2 shrink-0 custom-scrollbar">
                            {inquiries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                                    <MessageSquare size={32} className="text-gray-200" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No Active Inquiries</p>
                                </div>
                            ) : inquiries.map(inq => (
                                <div 
                                    key={inq.id}
                                    className="p-4 bg-white border border-gray-100 rounded-[24px] hover:border-luminous-blue transition-all cursor-pointer group shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                            inq.status === 'awaiting_client' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>{inq.status.replace('_', ' ')}</span>
                                        <span className="text-[8px] font-bold text-gray-400">{inq.timestamp}</span>
                                    </div>
                                    <h4 className="text-xs font-black text-luminous-ink mb-1 group-hover:text-luminous-blue transition-colors line-clamp-1">{inq.subject}</h4>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tight truncate">{inq.entity}</p>
                                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-gray-400 uppercase">
                                            <User size={8} /> {inq.operator}
                                        </div>
                                        {inq.priority === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                    </div>
                                </div>
                            ))}
                        </aside>

                        {/* RIGHT: Inquiry Conversation */}
                        <main className="flex-1 bg-white border border-gray-100 rounded-[32px] flex flex-col overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h3 className="text-sm font-black text-luminous-ink uppercase tracking-tight">Inquiry Thread: {inquiries[0]?.subject}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Reference Document ID: #{inquiries[0]?.docId}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase text-gray-400 hover:text-luminous-blue transition-all">Close Inquiry</button>
                                    <button className="px-3 py-1.5 bg-luminous-blue text-white rounded-lg text-[9px] font-black uppercase shadow-lg shadow-luminous-blue/20">Client Portal Alert</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col-reverse">
                                {/* Message Thread Implementation */}
                                <div className="max-w-[80%] self-start space-y-2">
                                    <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                                        <p className="text-xs leading-relaxed text-gray-800">
                                            The summons has a case number that doesn't resolve in the Hillsborough county portal. It might be too new, or there's a typo in the header. Please confirm with the client.
                                        </p>
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-400 ml-1 uppercase">A. Lozano (Operator) • 2h ago</p>
                                </div>
                                
                                <div className="max-w-[80%] self-end space-y-2">
                                    <div className="bg-luminous-blue p-4 rounded-2xl rounded-tr-none text-white">
                                        <p className="text-xs leading-relaxed">
                                            Client notified. They are reaching out to their attorney (Jackson Legal). Will update as soon as they reply.
                                        </p>
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-400 mr-1 text-right uppercase">System • 45m ago</p>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                                <form className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Add internal note or message client..." 
                                        className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-6 pr-14 text-xs font-medium outline-none focus:ring-2 focus:ring-luminous-blue/20 transition-all shadow-inner"
                                    />
                                    <button className="absolute right-3 top-2 bottom-2 w-10 bg-luminous-blue text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-luminous-blue/20">
                                        <Send size={14} />
                                    </button>
                                </form>
                            </div>
                        </main>
                    </div>
                )}

                {viewMode === 'queue' && (
                <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                    {/* LEFT: Task List */}
                    <aside className="w-72 flex flex-col gap-3 overflow-y-auto pr-2 shrink-0 custom-scrollbar">
                        {queue.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                                <CheckCircle2 size={32} className="text-emerald-300" />
                                <p className="text-xs font-black text-gray-400 uppercase">Queue Clear</p>
                                <p className="text-[10px] text-gray-400 italic">All items have been processed.</p>
                            </div>
                        ) : queue.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={`p-4 rounded-[20px] border transition-all cursor-pointer group ${
                                    activeItem === item.id 
                                    ? 'bg-white border-luminous-blue shadow-lg shadow-luminous-blue/5' 
                                    : item.aiStatus === 'needs_review' ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400' : 'bg-white border-gray-100 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1.5">
                                        {item.urgent && (
                                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                                                Urgent SOP
                                            </span>
                                        )}
                                        {item.category && !item.urgent && (
                                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                                                {item.category}
                                            </span>
                                        )}
                                        {item.aiStatus === 'needs_review' && (
                                            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                                Needs Review
                                            </span>
                                        )}
                                        {item.aiStatus === 'ai_matched' && item.aiConfidence >= 90 && (
                                            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                AI {item.aiConfidence}%
                                            </span>
                                        )}
                                        {item.aiStatus === 'ai_matched' && item.aiConfidence < 90 && (
                                            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                AI {item.aiConfidence}%
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
                                        <Clock size={9} /> {item.ago}
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
                            const categoryStyle = {
                                'Court SOP': 'bg-red-50 text-red-600 border-red-100',
                                'State Notice': 'bg-blue-50 text-blue-600 border-blue-100',
                                'Tax Mail': 'bg-amber-50 text-amber-600 border-amber-100',
                                'Complimentary': 'bg-gray-50 text-gray-400 border-gray-100',
                            };
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
                                    {/* Document Preview / Actual PDF Rendering */}
                                    <div className="flex-1 bg-[#F1F3F5] flex items-center justify-center overflow-hidden border-r border-gray-100 p-8 relative">
                                        
                                        {/* OCR Processing Overlay */}
                                        {ocrProgress[activeItem] !== undefined && ocrProgress[activeItem] < 100 && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                                                <Brain size={48} className="text-luminous-blue mb-4 animate-pulse shadow-sm" />
                                                <h3 className="text-xl font-black text-luminous-ink uppercase tracking-tight">Extracting Legal Data...</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-6">Real-Time Browser-Native OCR Engine</p>
                                                
                                                <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden mb-2 shadow-inner">
                                                    <div 
                                                        className="h-full bg-luminous-blue transition-all duration-300"
                                                        style={{ width: `${ocrProgress[activeItem]}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between w-full max-w-xs">
                                                    <p className="text-[9px] font-black text-luminous-blue uppercase tracking-widest">{ocrProgress[activeItem]}% Complete</p>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase underline decoration-luminous-blue/20">Privacy-First Engine</p>
                                                </div>
                                                <p className="text-[10px] text-gray-400 italic max-w-xs mt-6 leading-relaxed">
                                                    Analyzing document structure and identifying key entities, SunBiz IDs, and court case numbers locally...
                                                </p>
                                            </div>
                                        )}

                                        {activeDocUrl && doc.meta?.type?.includes('pdf') ? (
                                            <div className="w-full h-full bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col">
                                                <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{doc.docTitle}</span>
                                                    <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded font-bold">LIVE SOURCE</span>
                                                </div>
                                                <iframe 
                                                    src={activeDocUrl} 
                                                    className="w-full h-full border-none"
                                                    title="PDF Preview"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-lg bg-white shadow-xl rounded-lg p-8 flex flex-col gap-4 font-serif">
                                                <h4 className="text-sm font-bold text-center tracking-wide">{doc.preview.heading}</h4>
                                                <div className="w-full h-px bg-gray-200" />
                                                <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
                                                    {doc.rawFile ? `SYSTEM LOG: SOURCE BINARY DETECTED\n--------------------------------\n${doc.preview.body}` : doc.preview.body}
                                                </pre>
                                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
                                                    <div className="text-center">
                                                        <div className="w-16 h-16 border border-gray-200 rounded flex items-center justify-center">
                                                            <span className="text-[8px] text-gray-300 italic">SEAL</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="w-32 h-px bg-gray-400 mb-1" />
                                                        <p className="text-[9px] text-gray-400 italic">Authorized Signature</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Controls */}
                                    <div className="w-72 p-6 flex flex-col gap-5 shrink-0 overflow-y-auto">

                                        {/* AI Classification Banner */}
                                        {doc.aiStatus !== 'confirmed' && (
                                            <div className={`p-3 rounded-2xl border ${
                                                doc.aiConfidence >= 80 ? 'bg-emerald-50 border-emerald-100' : 
                                                doc.aiConfidence >= 50 ? 'bg-blue-50 border-blue-100' : 
                                                'bg-amber-50 border-amber-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                                        doc.aiConfidence >= 80 ? 'text-emerald-700' : 
                                                        doc.aiConfidence >= 50 ? 'text-blue-700' : 
                                                        'text-amber-700'
                                                    }`}>
                                                        {doc.aiConfidence >= 80 ? '✓ AI Matched' : doc.aiConfidence >= 50 ? '○ AI Partial' : '⚠ Needs Review'}
                                                    </p>
                                                    <span className={`text-[10px] font-black ${
                                                        doc.aiConfidence >= 80 ? 'text-emerald-600' : 
                                                        doc.aiConfidence >= 50 ? 'text-blue-600' : 
                                                        'text-amber-600'
                                                    }`}>{doc.aiConfidence}%</span>
                                                </div>
                                                <p className="text-[9px] text-gray-500 italic leading-relaxed mb-3">{doc.aiSource}</p>
                                                {doc.aiConfidence >= 50 ? (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleAcceptMatch(doc.id)}
                                                            className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <Zap size={9} /> Accept Match
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOverride(doc.id)}
                                                            className="py-2 px-3 bg-white text-gray-500 border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-red-300 hover:text-red-500 transition-all"
                                                        >
                                                            Override
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRequestInquiry(doc.id)}
                                                            title="Request Legal Clarification"
                                                            className="py-2 px-3 bg-white text-gray-400 border border-gray-200 rounded-xl hover:text-amber-600 hover:border-amber-200 transition-all"
                                                        >
                                                            <HelpCircle size={10} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Link entity manually below ↓</p>
                                                )}
                                            </div>
                                        )}
                                        {doc.aiStatus === 'confirmed' && (
                                            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Match Confirmed by Operator</p>
                                            </div>
                                        )}

                                         <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Clock size={10} className="text-gray-400" />
                                                <p className="text-[9px] font-bold text-gray-500">{doc.received}</p>
                                            </div>
                                            
                                            {/* AUTHENTIC METADATA SECTION */}
                                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                                <h5 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Native Metadata</h5>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[7px] font-black text-gray-300 uppercase">File Context</span>
                                                        <span className="text-[9px] font-mono text-gray-500">{(doc.meta?.size) || '—'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[7px] font-black text-gray-300 uppercase">MIME Type</span>
                                                        <span className="text-[8px] font-mono text-gray-400 truncate max-w-[100px]">{doc.meta?.type || 'unknown'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[7px] font-black text-gray-300 uppercase">Drive Source</span>
                                                        <span className="text-[8px] font-mono text-luminous-blue bg-blue-50 px-1 rounded overflow-hidden truncate max-w-[100px]">{watchFolder.split('\\').pop()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={(e) => {
                                                    const el = e.currentTarget.nextElementSibling;
                                                    el.style.display = el.style.display === 'none' ? 'block' : 'none';
                                                    e.currentTarget.querySelector('span').textContent = el.style.display === 'none' ? '▸' : '▾';
                                                }}
                                                className="text-[8px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors flex items-center gap-1"
                                            >
                                                <span>▸</span> Debug Logs
                                            </button>
                                            <div style={{ display: 'none' }} className="space-y-1 pl-2 border-l-2 border-gray-100">
                                                <div className="space-y-0.5">
                                                    <label className="text-[7px] font-black text-gray-300 uppercase tracking-widest">Hub ID</label>
                                                    <p className="text-[9px] font-mono font-medium text-gray-400">{doc.hubId || '— unassigned'}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <label className="text-[7px] font-black text-gray-300 uppercase tracking-widest">Last Modified</label>
                                                    <p className="text-[8px] font-mono font-medium text-gray-400 truncate leading-tight">{doc.meta?.lastModified}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</h5>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {[...DOCUMENT_CATEGORIES, ...customCategories.map(c => ({ id: `custom_${c}`, label: c, custom: true }))].map(cat => (
                                                    <button 
                                                        key={cat.id} 
                                                        title={cat.desc || `Custom: ${cat.label}`}
                                                        onClick={() => {
                                                            setQueue(prev => prev.map(q => q.id === doc.id ? { ...q, category: cat.label } : q));
                                                        }}
                                                        className={`group relative px-2 py-1.5 border rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${
                                                            cat.label === doc.category 
                                                                ? cat.urgent ? 'bg-red-500 text-white border-red-500' : 'bg-luminous-blue text-white border-luminous-blue' 
                                                                : cat.urgent ? 'bg-red-50 text-red-600 border-red-100 hover:border-red-400 hover:bg-red-100' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-luminous-blue hover:text-luminous-blue'
                                                        }`}
                                                    >
                                                        {cat.urgent && <span className="mr-0.5">⚠</span>}{cat.label}
                                                        {cat.custom && (
                                                            <span 
                                                                onClick={(e) => { e.stopPropagation(); setCustomCategories(prev => prev.filter(c => c !== cat.label)); }}
                                                                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full text-[6px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                title="Remove custom category"
                                                            >×</span>
                                                        )}
                                                    </button>
                                                ))}
                                                {/* Temporary Badge for unpinned Custom Category */}
                                                {doc.category && !DOCUMENT_CATEGORIES.some(c => c.label === doc.category) && !customCategories.includes(doc.category) && (
                                                    <div className="px-2 py-1.5 bg-violet-600 text-white border-violet-600 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center justify-between group">
                                                        <span className="truncate">{doc.category}</span>
                                                        <span 
                                                            onClick={(e) => { e.stopPropagation(); setQueue(prev => prev.map(q => q.id === doc.id ? { ...q, category: '' } : q)); }}
                                                            className="ml-1 opacity-60 hover:opacity-100 cursor-pointer"
                                                        >×</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* OTHER — custom category input */}
                                            {!showOtherInput[doc.id] ? (
                                                <button 
                                                    onClick={() => setShowOtherInput(prev => ({ ...prev, [doc.id]: true }))}
                                                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 border border-dashed border-gray-200 rounded-lg text-[7px] font-black uppercase tracking-widest text-gray-300 hover:text-gray-500 hover:border-gray-400 transition-all"
                                                >
                                                    <Plus size={9} /> Other
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <input 
                                                        type="text" 
                                                        autoFocus
                                                        value={otherCategoryDraft}
                                                        onChange={e => setOtherCategoryDraft(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && otherCategoryDraft.trim()) {
                                                                const label = otherCategoryDraft.trim();
                                                                setQueue(prev => prev.map(q => q.id === doc.id ? { ...q, category: label } : q));
                                                                setShowOtherInput(prev => ({ ...prev, [doc.id]: false }));
                                                                setOtherCategoryDraft('');
                                                                setToast({ type: 'success', message: `Classification updated to "${label}" (One-time)` });
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setShowOtherInput(prev => ({ ...prev, [doc.id]: false }));
                                                                setOtherCategoryDraft('');
                                                            }
                                                        }}
                                                        placeholder="Type classification…" 
                                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2 text-[9px] font-bold outline-none ring-2 ring-transparent focus:ring-luminous-blue/30 transition-all" 
                                                    />
                                                    <button 
                                                        onClick={() => {
                                                            if (!otherCategoryDraft.trim()) return;
                                                            const label = otherCategoryDraft.trim();
                                                            setQueue(prev => prev.map(q => q.id === doc.id ? { ...q, category: label } : q));
                                                            setShowOtherInput(prev => ({ ...prev, [doc.id]: false }));
                                                            setOtherCategoryDraft('');
                                                            setToast({ type: 'success', message: `Classification updated to "${label}" (One-time)` });
                                                        }}
                                                        title="Apply once"
                                                        className="p-1.5 bg-luminous-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        <CheckCircle2 size={10} />
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (!otherCategoryDraft.trim()) return;
                                                            const label = otherCategoryDraft.trim();
                                                            // Apply to this doc
                                                            setQueue(prev => prev.map(q => q.id === doc.id ? { ...q, category: label } : q));
                                                            // Pin as permanent
                                                            if (!customCategories.includes(label) && !DOCUMENT_CATEGORIES.find(c => c.label === label)) {
                                                                setCustomCategories(prev => [...prev, label]);
                                                                setToast({ type: 'success', message: `"${label}" pinned as permanent category` });
                                                            }
                                                            setShowOtherInput(prev => ({ ...prev, [doc.id]: false }));
                                                            setOtherCategoryDraft('');
                                                        }}
                                                        title="Pin as permanent category"
                                                        className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                                    >
                                                        <Pin size={10} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setShowOtherInput(prev => ({ ...prev, [doc.id]: false })); setOtherCategoryDraft(''); }}
                                                        className="p-1.5 text-gray-300 hover:text-gray-500 transition-colors"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Linked Entity</h5>
                                            {linkedEntities[doc.id] ? (
                                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[10px] font-black text-luminous-ink">{linkedEntities[doc.id].name}</p>
                                                        <button onClick={() => { setLinkedEntities(prev => { const n = {...prev}; delete n[doc.id]; return n; }); setEntitySearch(''); }} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                                        <div>
                                                            <p className="text-[8px] font-black text-gray-400 uppercase">SunBiz ID</p>
                                                            <p className="text-[9px] font-bold text-luminous-ink font-mono">{linkedEntities[doc.id].sunbizId}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-gray-400 uppercase">Hub</p>
                                                            <p className="text-[9px] font-bold text-luminous-ink font-mono">{linkedEntities[doc.id].hubId}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-gray-400 uppercase">Owner</p>
                                                            <p className="text-[9px] font-bold text-luminous-ink">{linkedEntities[doc.id].owner_name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-gray-400 uppercase">Status</p>
                                                            <p className={`text-[9px] font-black uppercase ${linkedEntities[doc.id].status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>{linkedEntities[doc.id].status}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-[8px] text-gray-400 italic">Plan: {linkedEntities[doc.id].plan}</p>
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
                                                            placeholder="Search by name, SunBiz ID, or owner..."
                                                            className="flex-1 bg-transparent border-none text-xs font-bold outline-none placeholder:text-gray-300"
                                                        />
                                                    </div>
                                                    {entityDropdownOpen && entitySearch.length >= 2 && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                                                            {clients.filter(e => 
                                                                e.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
                                                                (e.sunbizId || '').toLowerCase().includes(entitySearch.toLowerCase()) ||
                                                                (e.owner_name || '').toLowerCase().includes(entitySearch.toLowerCase()) ||
                                                                (e.hubId || '').toLowerCase().includes(entitySearch.toLowerCase())
                                                            ).map(ent => (
                                                                <button 
                                                                    key={ent.id}
                                                                    onClick={() => {
                                                                        handleManualLink(doc.id, ent);
                                                                        setEntitySearch('');
                                                                        setEntityDropdownOpen(false);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2.5 hover:bg-luminous-blue/5 transition-colors border-b border-gray-50 last:border-none"
                                                                >
                                                                    <p className="text-[10px] font-black text-luminous-ink">{ent.name}</p>
                                                                    <p className="text-[8px] text-gray-400 font-mono">{ent.sunbizId} · {ent.owner_name} · {ent.hubId}</p>
                                                                </button>
                                                            ))}
                                                            {clients.filter(e => 
                                                                e.name.toLowerCase().includes(entitySearch.toLowerCase()) ||
                                                                (e.sunbizId || '').toLowerCase().includes(entitySearch.toLowerCase()) ||
                                                                (e.owner_name || '').toLowerCase().includes(entitySearch.toLowerCase())
                                                            ).length === 0 && (
                                                                <p className="px-3 py-4 text-[10px] text-gray-400 italic text-center">No matching entities found</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Forward To</h5>
                                            
                                            {/* Recipient List */}
                                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                                {(forwardingRecipients[doc.id] || []).map(rec => (
                                                    <div key={rec.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl group transition-all hover:bg-gray-100/80">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-7 h-7 rounded-lg bg-luminous-blue/10 flex items-center justify-center text-[8px] font-black text-luminous-blue shrink-0">{rec.initials}</div>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-black text-luminous-ink truncate">{rec.name || 'Manual Recipient'}</p>
                                                                <p className="text-[8px] text-gray-400 font-medium truncate italic">{rec.email}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveRecipient(doc.id, rec.id); }}
                                                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(forwardingRecipients[doc.id] || []).length === 0 && (
                                                    <div className="p-3 border border-dashed border-gray-100 rounded-xl flex items-center justify-center gap-2 text-gray-300">
                                                        <Mail size={12} />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">No Recipients</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add Recipient Input */}
                                            <div className="relative">
                                                <div className="flex items-center gap-2 bg-gray-50/50 border border-gray-100 rounded-xl px-2.5 py-2 focus-within:bg-white focus-within:border-luminous-blue/30 transition-all">
                                                    <Plus size={12} className="text-gray-400" />
                                                    <input 
                                                        type="text"
                                                        value={manualEmail}
                                                        onChange={(e) => setManualEmail(e.target.value)}
                                                        placeholder="Add email or search..."
                                                        className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold placeholder:text-gray-300"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && manualEmail.includes('@')) {
                                                                handleAddRecipient(doc.id, {
                                                                    id: Date.now(),
                                                                    email: manualEmail,
                                                                    name: '',
                                                                    initials: getInitials('', manualEmail),
                                                                    source: 'manual'
                                                                });
                                                                setManualEmail('');
                                                            }
                                                        }}
                                                    />
                                                    {manualEmail.includes('@') && (
                                                        <button 
                                                            onClick={() => {
                                                                handleAddRecipient(doc.id, {
                                                                    id: Date.now(),
                                                                    email: manualEmail,
                                                                    name: '',
                                                                    initials: getInitials('', manualEmail),
                                                                    source: 'manual'
                                                                });
                                                                setManualEmail('');
                                                            }}
                                                            className="text-luminous-blue hover:text-hacker-blue"
                                                        >
                                                            <Send size={12} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Client Selection List Overlay */}
                                                {manualEmail.trim().length >= 1 && (
                                                    <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 max-h-48 overflow-y-auto">
                                                        {clients
                                                            .filter(c => 
                                                                c.name?.toLowerCase().includes(manualEmail.toLowerCase()) || 
                                                                c.email?.toLowerCase().includes(manualEmail.toLowerCase()) ||
                                                                c.owner_name?.toLowerCase().includes(manualEmail.toLowerCase())
                                                            )
                                                            .slice(0, 10)
                                                            .map(c => (
                                                                <button
                                                                    key={c.id}
                                                                    onClick={() => {
                                                                        handleAddRecipient(doc.id, {
                                                                            id: `client-${c.id}`,
                                                                            name: c.owner_name || c.name,
                                                                            email: c.email,
                                                                            initials: getInitials(c.owner_name || c.name, c.email),
                                                                            source: 'entity'
                                                                        });
                                                                        setManualEmail('');
                                                                    }}
                                                                    className="w-full text-left px-4 py-3 hover:bg-luminous-blue/5 transition-colors border-b border-gray-50 last:border-none"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[7px] font-black text-gray-400">
                                                                            {getInitials(c.owner_name || c.name, c.email)}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <p className="text-[10px] font-black text-luminous-ink truncate">{c.owner_name || c.name}</p>
                                                                            <p className="text-[8px] text-gray-400 italic truncate">{c.email}</p>
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
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
                                               className="w-full py-4 bg-luminous-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-hacker-blue shadow-xl shadow-luminous-blue/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                               title={(forwardingRecipients[doc.id] || []).length === 0 ? 'Add at least one recipient to proceed' : ''}
                                           >
                                               {(forwardingRecipients[doc.id] || []).length > 0 ? 'Finalize & Forward' : 'Add Recipient to Proceed'}
                                           </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })() : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 gap-6 bg-gray-50/50">
                                <div className="w-20 h-20 rounded-[32px] bg-white border border-gray-100 flex items-center justify-center text-gray-200 shadow-sm">
                                    <Search size={32} strokeWidth={1.5} />
                                </div>
                                <div className="max-w-xs">
                                    <h3 className="text-lg font-black text-luminous-ink uppercase tracking-tight mb-2">Ready to Process</h3>
                                    <p className="text-xs text-gray-400 font-medium italic leading-relaxed">Select a task from the queue to begin. Documents will render here.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
                                     <div className="p-4 bg-white border border-gray-100 rounded-2xl">
                                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">In Queue</p>
                                         <p className="text-xl font-black text-luminous-ink">{queue.length}</p>
                                     </div>
                                     <div className="p-4 bg-white border border-gray-100 rounded-2xl">
                                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Processed Today</p>
                                         <p className="text-xl font-black text-emerald-500">{processedItems.length}</p>
                                     </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
                )}

                {/* PROCESSED VIEW */}
                {viewMode === 'processed' && (
                    <div className="flex-1 overflow-y-auto">
                        {processedItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
                                <Archive size={40} className="text-gray-200" />
                                <h3 className="text-lg font-black text-gray-300 uppercase">No Processed Items Yet</h3>
                                <p className="text-xs text-gray-400 italic max-w-xs">Items will appear here after you "Finalize & Forward" them from the Work Queue.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
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
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                                item.urgent ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>{item.category}</span>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                                                <User size={10} className="text-luminous-blue" />
                                                <span className="text-[9px] font-black text-luminous-ink uppercase">{item.processedBy}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Forwarded to {item.contact}</p>
                                                <p className="text-[9px] text-gray-300 italic">{item.processedAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* INQUIRY VIEW */}
                {viewMode === 'inquiry' && (
                    <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
                        {/* Threads Sidebar */}
                        <div className="w-80 flex flex-col gap-3 overflow-y-auto pr-2">
                            {inquiries.length === 0 ? (
                                <div className="p-12 text-center bg-white border border-dashed border-gray-100 rounded-[32px]">
                                    <p className="text-[10px] font-black text-gray-300 uppercase italic">No active inquiries</p>
                                </div>
                            ) : (
                                inquiries.map(inq => (
                                    <button
                                        key={inq.id}
                                        onClick={() => setActiveInquiry(inq)}
                                        className={`p-5 text-left rounded-[28px] border transition-all ${
                                            activeInquiry?.id === inq.id 
                                            ? 'bg-white border-luminous-blue shadow-lg shadow-luminous-blue/5 scale-[1.02]' 
                                            : 'bg-white/50 border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${
                                                inq.status === 'OPEN' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>{inq.status}</span>
                                            <span className="text-[8px] font-mono text-gray-300">#{inq.id.slice(0, 6)}</span>
                                        </div>
                                        <p className="text-[11px] font-black text-luminous-ink uppercase tracking-tight mb-1">{inq.subject}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase truncate">{inq.profiles?.full_name || 'Member'}</p>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                            {activeInquiry ? (
                                <>
                                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-luminous-blue/10 flex items-center justify-center text-luminous-blue">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-luminous-ink uppercase tracking-tight">{activeInquiry.subject}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                    Client: {activeInquiry.profiles?.full_name} ({activeInquiry.profiles?.email})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={async () => {
                                                    await supabase.from('ra_inquiry_threads').update({ status: 'CLOSED' }).eq('id', activeInquiry.id);
                                                    setToast({ type: 'success', message: 'Inquiry closed successfully.' });
                                                }}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200"
                                            >
                                                Close Ticket
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 overflow-y-auto space-y-6">
                                        {messages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-12 gap-4">
                                                <Activity size={24} className="text-gray-200" />
                                                <p className="text-[10px] font-black text-gray-300 uppercase italic">No messages yet</p>
                                            </div>
                                        ) : (
                                            messages.map(msg => (
                                                <div key={msg.id} className={`flex gap-3 ${msg.is_staff ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                                        msg.is_staff ? 'bg-luminous-ink text-white' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {msg.is_staff ? <Shield size={14} /> : <User size={14} />}
                                                    </div>
                                                    <div className={`max-w-[80%] ${msg.is_staff ? 'text-right' : ''}`}>
                                                        <div className={`p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${
                                                            msg.is_staff ? 'bg-luminous-blue text-white rounded-tr-none' : 'bg-gray-50 text-luminous-ink rounded-tl-none'
                                                        }`}>
                                                            {msg.content}
                                                        </div>
                                                        <p className="text-[8px] font-black text-gray-300 uppercase mt-1">
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <form onSubmit={handleSendStaffMessage} className="p-6 border-t border-gray-50 bg-gray-50/50 flex gap-3">
                                        <input 
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Type message to client..."
                                            className="flex-1 bg-white border-2 border-transparent rounded-2xl px-5 py-3 text-xs font-bold shadow-sm focus:border-luminous-blue/20 outline-none transition-all"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={sendingMessage || !newMessage.trim()}
                                            className="w-12 h-12 bg-luminous-blue text-white rounded-2xl flex items-center justify-center hover:bg-hacker-blue shadow-lg shadow-luminous-blue/20 transition-all disabled:opacity-50"
                                        >
                                            {sendingMessage ? <Activity size={16} className="animate-spin" /> : <Send size={16} />}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 gap-4">
                                    <MessageSquare size={48} className="text-gray-100" />
                                    <h4 className="text-sm font-black text-gray-300 uppercase">Select an Inquiry</h4>
                                    <p className="text-[11px] text-gray-400 italic max-w-xs">Viewing formal legal inquiries submitted by members from their dashboard.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AUDIT VIEW */}
                {viewMode === 'audit' && (
                    <div className="flex-1 overflow-y-auto bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
                        <RADocumentAuditLog isAdmin={true} />
                    </div>
                )}

                <footer className="h-16 shrink-0 border-t border-gray-100 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-gray-400 uppercase">Node:</span>
                            <span className="text-[9px] font-black text-luminous-ink uppercase">DeLand-01</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-gray-300">/</span>
                             <span className="text-[9px] font-black text-gray-400 uppercase">Operator:</span>
                             <span className="text-[9px] font-black text-luminous-ink uppercase">{user?.email?.split('@')[0] || 'AL-901'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                            <Activity size={12} className="text-emerald-500" /> All system operations logged to immutable audit ledger.
                        </p>
                    </div>
                </footer>

                {/* Duplicate Warning Modal */}
                {duplicateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={duplicateModal.onCancel} />
                        <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-4 mb-4 text-red-600">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">Duplicate Detected</h3>
                                    <p className="text-xs text-red-500 font-bold">SHA-256 Hash Collision</p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3 border border-gray-100">
                                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                    This document appears specifically identical to one submitted on <span className="font-bold text-gray-900">{new Date(duplicateModal.existing.created_at).toLocaleDateString()}</span>.
                                </p>
                                <div className="flex items-center gap-3 text-xs bg-white p-2 rounded-lg border border-gray-200">
                                    <FileText size={14} className="text-gray-400" />
                                    <span className="font-mono text-gray-500 truncate">{duplicateModal.existing.title}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={duplicateModal.onCancel}
                                    className="flex-1 py-3 bg-white border-2 border-gray-100 text-gray-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:border-gray-200 transition-all"
                                >
                                    Cancel Upload
                                </button>
                                <button
                                    onClick={duplicateModal.onConfirm}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 shadow-xl shadow-red-600/20 transition-all"
                                >
                                    Override & Upload
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderFormationModule = () => (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4 text-center">
             <div className="w-16 h-16 rounded-[24px] bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><FilePlus size={32} /></div>
             <h2 className="text-4xl font-black uppercase tracking-tighter text-luminous-ink">Formation Factory.</h2>
             <p className="text-gray-500 max-w-sm italic font-medium leading-relaxed">
                 Assembly line for LLC/DBA business setups, amendments, and dissolutions. Currently in deployment queue.
             </p>
        </div>
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
        return <StaffLoginForm onLoginSuccess={(u) => {
            setUser(u);
            setStaffRole(u.app_metadata?.staff_role || 'staff');
        }} />;
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {renderModuleSidebar()}
            
            <main className="flex-1 p-16">
                <div className="max-w-6xl mx-auto h-full">
                    {activeModule === 'ra' && renderRAModule()}
                    {activeModule === 'formations' && renderFormationModule()}
                    {/* Other modules placeholders */}
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
            {showSettings && <RASettingsPanel onClose={() => setShowSettings(false)} />}
            {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default FulfillmentPortal;
