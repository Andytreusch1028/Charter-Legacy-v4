import React, { useState, useEffect } from 'react';
import {
    Activity, FileText, Settings, Loader2, Zap,
    Shield, CheckCircle2, X, Bell, MapPin, Clock,
    ArrowRight, ExternalLink, ChevronRight, Landmark,
    Download, Mail, Archive, MoreHorizontal, AlertTriangle,
    ClipboardList, Eye, MessageSquare, Send, User, ArrowLeft
} from 'lucide-react';
import { supabase } from './lib/supabase';
import ComplianceStatusModal from './components/ComplianceStatusModal';
import RADocumentAuditLog from './components/RADocumentAuditLog';

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange, label, description }) => (
    <div
        onClick={() => onChange(!value)}
        className="px-6 py-5 cursor-pointer flex items-center justify-between group flex-1 transition-colors hover:bg-white/[0.04]"
    >
        <div className="space-y-1 pr-6">
            <p className={`text-[15px] tracking-wide transition-colors duration-300 ${value ? 'font-medium text-white' : 'font-light text-gray-300 group-hover:text-white'}`}>{label}</p>
            <p className="text-[13px] text-gray-500 font-light leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0 px-2.5">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${value ? 'text-white' : 'text-gray-600'}`}>{value ? 'ON' : 'OFF'}</span>
            <div className={`w-[44px] h-[24px] rounded-full relative transition-all duration-500 border ${value ? 'bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-transparent border-white/20 group-hover:border-white/40'}`}>
                <div className={`absolute top-[1.5px] w-[19px] h-[19px] rounded-full transition-all duration-500 ${value ? 'bg-black left-[calc(100%-21.5px)]' : 'bg-gray-500 left-[2px]'}`} />
            </div>
        </div>
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, []);
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-xl border ${
            type === 'success' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-500/30' : 'bg-red-900/80 text-red-100 border-red-500/30'
        }`}>
            {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {message}
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
        active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-red-500 animate-pulse'}`} />
        {active ? 'Active' : 'Inactive'}
    </div>
);

// ─── Document Row with action tray ────────────────────────────────────────────
const DocumentRow = ({ doc, isSelected, onSelect, onAction, actionLoading }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-[24px] border transition-all duration-500 overflow-hidden ${
            isSelected ? 'border-luminous-blue/40 bg-luminous-blue/5 shadow-[0_8px_32px_rgba(0,122,255,0.15)]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
        }`}>
            {/* Main row */}
            <div className="flex items-center gap-4 p-5">
                {/* Checkbox */}
                <button
                    onClick={() => onSelect(doc.id)}
                    className={`w-5 h-5 rounded-[6px] border shrink-0 flex items-center justify-center transition-all duration-300 ${
                        isSelected ? 'bg-luminous-blue border-luminous-blue shadow-[0_0_10px_rgba(0,122,255,0.5)]' : 'border-gray-600 hover:border-luminous-blue bg-black/20'
                    }`}
                >
                    {isSelected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                </button>

                {/* Icon & New Badge */}
                <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center border transition-all duration-500 ${
                        doc.urgent ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-white/5 text-gray-400 border-white/5'
                    }`}>
                        <FileText size={18} strokeWidth={1.5} />
                    </div>
                    {!doc.viewed && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#121214] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" title="New Document" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className={`text-[15px] ${doc.viewed ? 'font-medium text-gray-400' : 'font-semibold text-white dropdown-glow'} truncate transition-colors duration-300`}>
                        {doc.title}
                    </p>
                    <div className="flex gap-3 text-[10px] font-medium tracking-wider text-gray-500 mt-1 uppercase">
                        <span>{doc.date}</span>
                        <span className="text-gray-700">•</span>
                        <span>{doc.type}</span>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 shrink-0">
                    {doc.urgent && (
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">Legal</span>
                    )}
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {doc.status || 'Forwarded'}
                    </span>
                </div>

                {/* Expand actions */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border ${
                        expanded ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Action tray */}
            {expanded && (
                <div className="flex items-center gap-3 px-5 py-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mr-2">Actions</span>

                    <button
                        onClick={() => onAction('download', [doc.id])}
                        disabled={actionLoading === `download-${doc.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:border-luminous-blue hover:text-luminous-blue hover:bg-luminous-blue/10 transition-all duration-300 disabled:opacity-50"
                    >
                        {actionLoading === `download-${doc.id}`
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Download size={12} />}
                        Download
                    </button>

                    <button
                        onClick={() => onAction('email', [doc.id])}
                        disabled={actionLoading === `email-${doc.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300 disabled:opacity-50"
                    >
                        {actionLoading === `email-${doc.id}`
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Mail size={12} />}
                        Email to me
                    </button>

                    <button
                        onClick={() => onAction('view', [doc.id])}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:border-white hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                        <Eye size={12} /> View
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RegisteredAgentConsole = ({ isModal = false, onClose, initialTab = 'dashboard' }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [priorityForwarding, setPriorityForwarding] = useState(true);
    const [autoDisposeMarketing, setAutoDisposeMarketing] = useState(true);
    const [smsInterrupt, setSmsInterrupt] = useState(false);
    const [isComplianceOpen, setIsComplianceOpen] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState(new Set());
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [inquiries, setInquiries] = useState([]);
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const [isCreatingThread, setIsCreatingThread] = useState(false);
    const [newThreadSubject, setNewThreadSubject] = useState('');
    const [newThreadMessage, setNewThreadMessage] = useState('');
    const [newThreadUrgent, setNewThreadUrgent] = useState(false);

    const RA_ADDRESS = '123 Innovation Way, Ste 400, DeLand, FL 32720';
    const DOCUMENT_NUMBER = 'L24000392044';

    const MOCK_DOCS = [
        { id: 'mock-1', title: 'Annual Report Filing Confirmation', date: 'Feb 12, 2026', type: 'State FL', status: 'Forwarded', urgent: false },
        { id: 'mock-2', title: 'Service of Process — Inquiry',      date: 'Feb 09, 2026', type: 'Legal Notice', status: 'Forwarded', urgent: true },
        { id: 'mock-3', title: 'Division of Corporations — Official Mail', date: 'Jan 15, 2026', type: 'Sunbiz', status: 'Forwarded', urgent: false },
        { id: 'mock-4', title: 'Annual Report Reminder — Due May 1', date: 'Jan 02, 2026', type: 'Compliance', status: 'Forwarded', urgent: false },
    ];

    const MOCK_INQUIRIES = [
        {
            id: 'mock-thread-1',
            subject: '[URGENT] Document routing question',
            status: 'OPEN',
            updated_at: new Date().toISOString()
        }
    ];

    const MOCK_MESSAGES = [
        {
            id: 'mock-msg-1',
            sender_id: 'user',
            content: "I noticed your DeLand HUB received a document. Is this action required today?",
            is_staff: false,
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 'mock-msg-2',
            sender_id: 'staff',
            content: "Hello, this is Agent Support. We have verified the document is a standard Annual Report reminder. You have until May 1st to comply.",
            is_staff: true,
            created_at: new Date(Date.now() - 1800000).toISOString()
        }
    ];


    useEffect(() => {
        if (!isModal || !onClose) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModal, onClose]);

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { user }, error: authErr } = await supabase.auth.getUser();
                if (authErr || !user) {
                    setDocuments(MOCK_DOCS);
                    setInquiries(MOCK_INQUIRIES);
                    return;
                }
                setUserEmail(user.email || '');

                const { data: cfg } = await supabase
                    .from('registered_agent_config').select('*').eq('user_id', user.id).single();
                if (cfg) {
                    setPriorityForwarding(cfg.priority_forwarding ?? true);
                    setAutoDisposeMarketing(cfg.auto_dispose_marketing ?? true);
                    setSmsInterrupt(cfg.sms_interrupt ?? false);
                }

                const { data: docs } = await supabase
                    .from('registered_agent_documents').select('*')
                    .eq('user_id', user.id).order('created_at', { ascending: false });
                setDocuments(docs?.length ? docs : MOCK_DOCS);

                // Fetch inquiries
                const { data: inqs } = await supabase
                    .from('ra_inquiry_threads')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false });
                setInquiries(inqs || []);

            } catch {
                setDocuments(MOCK_DOCS);
                setInquiries(MOCK_INQUIRIES);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        if (activeThread) {
            const fetchMessages = async () => {
                if (String(activeThread.id).startsWith('mock-')) {
                    if (activeThread.id === 'mock-thread-1') {
                        setMessages(MOCK_MESSAGES.map(m => ({ ...m, thread_id: 'mock-thread-1' })));
                    } else {
                        // Retain messages that belong to the newly created mock thread
                        setMessages(prev => prev.filter(m => m.thread_id === activeThread.id));
                    }
                    return;
                }
                const { data } = await supabase
                    .from('ra_inquiry_messages')
                    .select('*')
                    .eq('thread_id', activeThread.id)
                    .order('created_at', { ascending: true });
                setMessages(data || []);
            };
            fetchMessages();

            // Subscribe to new messages
            const channel = supabase
                .channel(`thread-${activeThread.id}`)
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'ra_inquiry_messages',
                    filter: `thread_id=eq.${activeThread.id}`
                }, (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [activeThread]);

    const sendInquiryMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeThread) return;

        setSendingMessage(true);
        if (String(activeThread.id).startsWith('mock-')) {
            setMessages(prev => [...prev, {
                id: `mock-msg-${Date.now()}`,
                thread_id: activeThread.id,
                sender_id: 'user',
                content: newMessage,
                is_staff: false,
                created_at: new Date().toISOString()
            }]);
            setNewMessage('');
            setSendingMessage(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('ra_inquiry_messages').insert({
                thread_id: activeThread.id,
                sender_id: user.id,
                content: newMessage,
                is_staff: false
            });
            if (error) throw error;
            setNewMessage('');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setSendingMessage(false);
        }
    };

    const openCreateThreadUI = (defaultSubject = '') => {
        setNewThreadSubject(defaultSubject);
        setNewThreadMessage('');
        setNewThreadUrgent(false);
        setIsCreatingThread(true);
        setActiveThread(null);
    };

    const submitNewThread = async (e) => {
        if (e) e.preventDefault();
        try {
            setSendingMessage(true);
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            const finalSubject = newThreadUrgent ? `[URGENT] ${newThreadSubject}` : newThreadSubject;
            
            if (authError || !user) {
                // Mock behavior for UI preview without auth session
                const newThread = {
                    id: `mock-thread-${Date.now()}`,
                    subject: finalSubject,
                    status: 'OPEN',
                    updated_at: new Date().toISOString()
                };
                setInquiries(prev => [newThread, ...prev]);
                setActiveThread(newThread);
                setIsCreatingThread(false);
                setMessages([{
                    id: `mock-msg-${Date.now()}`,
                    thread_id: newThread.id,
                    sender_id: 'user',
                    content: newThreadMessage.trim(),
                    is_staff: false,
                    created_at: new Date().toISOString()
                }]);
                setNewThreadSubject('');
                setNewThreadMessage('');
                setNewThreadUrgent(false);
                showToast("Mock ticket created for UI preview.");
                return;
            }
            
            if (!newThreadSubject.trim() || !newThreadMessage.trim()) {
                throw new Error("Subject and Initial Request are required.");
            }
            
            const { data: threadData, error: threadErr } = await supabase.from('ra_inquiry_threads').insert({
                user_id: user.id,
                subject: finalSubject,
                status: 'OPEN'
            }).select().single();
            
            if (threadErr) {
                console.error("Thread creation error:", threadErr);
                throw new Error("Failed to create ticket: " + threadErr.message);
            }

            const { error: msgErr } = await supabase.from('ra_inquiry_messages').insert({
                thread_id: threadData.id,
                sender_id: user.id,
                content: newThreadMessage.trim(),
                is_staff: false
            });
            
            if (msgErr) {
                console.error("Message creation error:", msgErr);
                throw new Error("Ticket created, but message failed: " + msgErr.message);
            }

            // Successfully inserted
            setInquiries(prev => [threadData, ...prev]);
            setActiveThread(threadData);
            setIsCreatingThread(false);
            setNewThreadSubject('');
            setNewThreadMessage('');
            setNewThreadUrgent(false);
            showToast("Support ticket opened safely.");
            
        } catch (err) {
            console.error('Ticket submit crash:', err);
            showToast(err.message, 'error');
        } finally {
            setSendingMessage(false);
        }
    };

    const saveConfig = async (key, value) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast("Configuration saved (Preview Mode)", "success");
                return;
            }
            await supabase.from('registered_agent_config').upsert(
                { user_id: user.id, [key]: value, updated_at: new Date() },
                { onConflict: 'user_id' }
            );
            showToast("Configuration securely updated.", "success");
        } catch (err) { 
            console.error('Config save error:', err); 
            showToast("Failed to save configuration.", "error"); 
        }
    };

    const showToast = (message, type = 'success') => setToast({ message, type });

    // ── Document actions ──────────────────────────────────────────────────────
    const handleAction = async (action, docIds, isBulk = false) => {
        const loadKey = isBulk ? `bulk-${action}` : `${action}-${docIds[0]}`;
        setActionLoading(loadKey);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');

            const body = { action, document_ids: docIds, email_to: userEmail };

            if (action === 'download' || action === 'zip_download') {
                const res = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ra-document-action`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify(body),
                    }
                );

                if (action === 'zip_download') {
                    // Binary response — trigger browser download
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'charter-legacy-documents.zip';
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('ZIP downloaded successfully.');
                } else {
                    const data = await res.json();
                    if (data.url) {
                        window.open(data.url, '_blank');
                        showToast('Download started.');
                    } else {
                        showToast(data.error || 'Document not yet available for download.', 'error');
                    }
                }
            } else {
                // email / zip_email
                const res = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ra-document-action`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify(body),
                    }
                );
                const data = await res.json();
                if (data.success) {
                    showToast(`Email sent to ${userEmail}`);
                } else {
                    showToast(data.error || 'Email failed.', 'error');
                }
            }

            // Handle DB updates for read receipts
            if (action === 'view') {
                await supabase
                    .from('registered_agent_documents')
                    .update({ 
                        viewed: true, 
                        user_viewed_at: new Date().toISOString() 
                    })
                    .in('id', docIds);
                
                // Update local state to clear dot immediately
                setDocuments(prev => prev.map(d => docIds.includes(d.id) ? { ...d, viewed: true } : d));
                showToast('Document viewed — event logged.');
                
                // If it's a single view, we might want to open the file if file_path exists
                if (docIds.length === 1 && !isBulk) {
                    const doc = documents.find(d => d.id === docIds[0]);
                    if (doc?.file_path) {
                        const { data } = await supabase.storage.from('ra-documents').createSignedUrl(doc.file_path, 60);
                        if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                    }
                }
            }

        } catch (err) {
            showToast(err.message || 'Action failed.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const toggleSelect = (id) => {
        setSelectedDocs(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => setSelectedDocs(new Set(documents.map(d => d.id)));
    const clearSelection = () => setSelectedDocs(new Set());

    const tabs = [
        { id: 'dashboard', icon: Activity,       label: 'Dashboard' },
        { id: 'documents', icon: FileText,        label: 'Document Vault' },
        { id: 'inquiries', icon: MessageSquare,   label: 'Agent Support' },
        { id: 'config',    icon: Settings,        label: 'Forwarding Config' },
        { id: 'shield',    icon: Shield,          label: 'Address Shield' },
        { id: 'audit',     icon: ClipboardList,   label: 'Audit Log' },
    ];

    const renderContent = () => {
        if (loading) {
            return (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-luminous-blue" size={28} />
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400">Connecting to DeLand Hub...</p>
                </div>
            );
        }

        switch (activeTab) {

            // ── DASHBOARD ──────────────────────────────────────────────────────
            case 'dashboard':
            default:
                return (
                    <div className="space-y-10 animate-in fade-in duration-500">
                        <header className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                <Shield size={10} className="text-luminous-blue" /> Status: Active Command
                            </div>
                            <h2 className="text-5xl md:text-6xl font-light text-white tracking-tight leading-none">
                                Registered Agent <span className="text-gray-500 font-medium">Console.</span>
                            </h2>
                            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
                                Charter Legacy is your Florida-licensed Registered Agent. We maintain a physical address so your home never appears on public record.
                            </p>
                        </header>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-8 bg-black/60 backdrop-blur-3xl rounded-[32px] border border-white/10 text-white relative overflow-hidden group hover:border-luminous-blue/30 transition-all duration-500">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-luminous-blue/10 rounded-full blur-[80px] group-hover:bg-luminous-blue/20 transition-all duration-1000" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue">DeLand Hub Node</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Live</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">Your Registered Address</p>
                                        <p className="font-mono text-[15px] text-gray-200 leading-relaxed tracking-wide">{RA_ADDRESS}</p>
                                    </div>
                                    <div className="pt-5 border-t border-white/5 grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest mb-1.5">Availability</p>
                                            <p className="text-[13px] font-medium text-gray-300">Mon–Fri, 9am–5pm ET</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest mb-1.5">State</p>
                                            <p className="text-[13px] font-medium text-gray-300">Florida (FL)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => setIsComplianceOpen(true)} className="group p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] cursor-pointer hover:bg-white/10 hover:border-luminous-blue/30 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 transition-all duration-1000" />
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 rounded-[16px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                            <CheckCircle2 size={20} strokeWidth={1.5} />
                                        </div>
                                        <StatusBadge active={true} />
                                    </div>
                                    <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-2">Entity Status</p>
                                    <p className="text-[17px] font-semibold text-white mb-1 tracking-tight">Good Standing</p>
                                    <p className="text-xs text-gray-400 font-light mb-6">Annual report filed · Sunbiz verified</p>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue group-hover:gap-3 transition-all">
                                        View Full Status <ChevronRight size={12} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-[#3b2a1a]/40 border border-amber-500/20 backdrop-blur-xl rounded-[28px] flex items-center gap-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                            <div className="w-12 h-12 rounded-[16px] bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"><Clock size={20} strokeWidth={1.5} /></div>
                            <div className="flex-1 relative z-10">
                                <p className="text-[15px] font-medium text-amber-100 tracking-wide">Annual Report Due: May 1, 2027</p>
                                <p className="text-xs text-amber-400/60 font-light mt-1">Florida Statute 605.0210 — Reminders at 60, 30, and 7 days out.</p>
                            </div>
                            <div className="text-right shrink-0 relative z-10">
                                <p className="text-3xl font-light text-amber-400 tracking-tight">437</p>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/70">Days Away</p>
                            </div>
                            </div>
                            
                            <div className="p-6 bg-red-900/20 border border-red-500/20 backdrop-blur-xl rounded-[28px] flex items-center gap-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
                                <div className="w-12 h-12 rounded-[16px] bg-red-500/10 flex items-center justify-center text-red-400 shrink-0 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"><AlertTriangle size={20} strokeWidth={1.5} /></div>
                                <div className="flex-1 relative z-10">
                                    <p className="text-[15px] font-medium text-red-100 tracking-wide">FinCEN BOI Deadline</p>
                                    <p className="text-[11px] text-red-400/60 font-light mt-1 leading-tight">Must file within 90 days of formation to avoid severe federal penalties.</p>
                                </div>
                                <div className="text-right shrink-0 relative z-10">
                                    <p className="text-3xl font-light text-red-400 tracking-tight">89</p>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/70">Days Away</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">Recent Mail</h3>
                                <button onClick={() => setActiveTab('documents')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue hover:text-white transition-colors flex items-center gap-1.5">
                                    View All <ArrowRight size={10} />
                                </button>
                            </div>
                            {documents.slice(0, 2).map((doc, i) => (
                                <div key={i} className="p-5 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        {doc.urgent ? (
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] shrink-0" />
                                        ) : (
                                            <div className="w-2.5 h-2.5 rounded-full bg-white/20 shrink-0 group-hover:bg-white/40 transition-colors" />
                                        )}
                                        <div>
                                            <p className="text-[14px] font-medium text-gray-200 group-hover:text-white transition-colors tracking-wide">{doc.title}</p>
                                            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-1">
                                                {doc.date} <span className="text-gray-700 mx-1">•</span> {doc.type}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">{doc.status || 'Forwarded'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            // ── DOCUMENT VAULT ─────────────────────────────────────────────────
            case 'documents':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end border-b border-white/5 pb-6">
                            <div>
                                <h3 className="text-4xl font-light text-white tracking-tight">Document <span className="text-gray-500 font-medium">Vault.</span></h3>
                                <p className="text-sm text-gray-400 font-light mt-2 max-w-lg">All official mail received at your DeLand Hub address.</p>
                            </div>
                            <div className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-[14px] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
                                <Zap size={12} className="text-emerald-400" /> Real-time Sync
                            </div>
                        </div>

                        {/* Select all / bulk bar */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={selectedDocs.size === documents.length ? clearSelection : selectAll}
                                className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
                            >
                                {selectedDocs.size === documents.length ? 'Deselect All' : 'Select All'}
                            </button>
                            {selectedDocs.size > 0 && (
                                <div className="flex items-center gap-3 ml-auto animate-in fade-in duration-300 bg-white/5 px-2 py-1.5 rounded-[16px] border border-white/10">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue px-3">{selectedDocs.size} selected</span>

                                    <button
                                        onClick={() => handleAction('zip_download', [...selectedDocs], true)}
                                        disabled={actionLoading === 'bulk-zip_download'}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-[12px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === 'bulk-zip_download' ? <Loader2 size={12} className="animate-spin" /> : <Archive size={12} />}
                                        ZIP
                                    </button>

                                    <button
                                        onClick={() => handleAction('zip_email', [...selectedDocs], true)}
                                        disabled={actionLoading === 'bulk-zip_email'}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 text-purple-100 border border-purple-500/30 rounded-[12px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-purple-500/30 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === 'bulk-zip_email' ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                                        Email
                                    </button>

                                    <button onClick={clearSelection} className="w-8 h-8 flex items-center justify-center rounded-[10px] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Document list */}
                        <div className="space-y-3">
                            {documents.map((doc) => (
                                <DocumentRow
                                    key={doc.id}
                                    doc={doc}
                                    isSelected={selectedDocs.has(doc.id)}
                                    onSelect={toggleSelect}
                                    onAction={handleAction}
                                    actionLoading={actionLoading}
                                />
                            ))}
                        </div>

                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">What gets forwarded?</p>
                            <p className="text-[13px] text-gray-400 font-light leading-relaxed">
                                Service of Process (lawsuits, subpoenas), state compliance notices, annual report reminders, and official Division of Corporations mail. Marketing and solicitation mail is auto-disposed per your config.
                            </p>
                        </div>
                    </div>
                );

            case 'inquiries':
                return (
                    <div className="h-full space-y-8 animate-in fade-in duration-500">
                        <header className="flex items-end justify-between border-b border-white/5 pb-6">
                            <div>
                                <h3 className="text-4xl font-light text-white tracking-tight">Agent <span className="text-gray-500 font-medium">Support.</span></h3>
                                <p className="text-sm text-gray-400 font-light mt-2 max-w-lg">Administrative communication channel to your Charter Legacy registered agent team.</p>
                            </div>
                            {!activeThread && !isCreatingThread && (
                                <button 
                                    onClick={() => openCreateThreadUI('General Support')}
                                    className="px-6 py-3 bg-white text-black rounded-[16px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                >
                                    Contact Support
                                </button>
                            )}
                        </header>

                        {isCreatingThread ? (
                            <div className="flex flex-col border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />
                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl relative z-10">
                                    <div className="flex items-center gap-5">
                                        <button onClick={() => setIsCreatingThread(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                                            <ArrowLeft size={16} />
                                        </button>
                                        <p className="text-[15px] font-medium text-white tracking-wide">Open Support Ticket</p>
                                    </div>
                                </div>
                                <form onSubmit={submitNewThread} className="relative z-10 p-8 space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-2">Ticket Subject</label>
                                        <input 
                                            type="text" required value={newThreadSubject} onChange={e=>setNewThreadSubject(e.target.value)}
                                            placeholder="e.g. Received a forwarded document I don't understand" 
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[24px] text-[15px] font-light text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-2">Initial Request</label>
                                        <textarea 
                                            required value={newThreadMessage} onChange={e=>setNewThreadMessage(e.target.value)}
                                            rows={4} placeholder="Provide details about your administrative request..." 
                                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[24px] text-[15px] font-light text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-[24px] flex items-center overflow-hidden shadow-sm">
                                        <Toggle value={newThreadUrgent} onChange={setNewThreadUrgent} label="Flag as Urgent Request" description="Mark 'ON' to escalate priority for critical administrative document routing." />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button 
                                            type="submit" disabled={sendingMessage}
                                            className="px-8 py-4 bg-white text-black rounded-[20px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
                                        >
                                            {sendingMessage ? 'Submitting...' : 'Submit Ticket'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : activeThread ? (
                            <div className="flex flex-col h-[650px] max-h-[70vh] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />
                                
                                {/* Thread Header */}
                                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl relative z-10 shrink-0">
                                    <div className="flex items-center gap-5">
                                        <button onClick={() => setActiveThread(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                                            <ArrowLeft size={16} />
                                        </button>
                                        <div>
                                            <p className="text-[15px] font-medium text-white tracking-wide">{activeThread.subject}</p>
                                            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">Case ID: #INQ-{String(activeThread.id).slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm ${
                                        activeThread.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white/5 text-gray-400 border-white/10'
                                    }`}>
                                        {activeThread.status}
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-8 overflow-y-auto space-y-8 relative z-10 min-h-0">
                                    {messages.map((msg, i) => (
                                        <div key={msg.id} className={`flex gap-4 ${msg.is_staff ? '' : 'flex-row-reverse'}`}>
                                            <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 border ${
                                                msg.is_staff ? 'text-blue-500 border-blue-500/20 bg-blue-500/10' : 'bg-white/5 text-white border-white/10'
                                            }`}>
                                                {msg.is_staff ? <Shield size={18} /> : <User size={18} />}
                                            </div>
                                            <div className={`max-w-[70%] space-y-2 ${msg.is_staff ? '' : 'text-right'}`}>
                                                <div className={`p-5 rounded-[24px] text-[15px] font-light leading-relaxed backdrop-blur-md border ${
                                                    msg.is_staff 
                                                    ? 'bg-white/10 text-white border-white/5 rounded-tl-sm' 
                                                    : 'bg-blue-600/20 text-white border-blue-500/30 rounded-tr-sm shadow-[0_0_30px_rgba(0,122,255,0.1)]'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                                <p className="text-[10px] font-medium text-gray-500 tracking-wider">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-gray-500 gap-4">
                                            <MessageSquare size={40} strokeWidth={1} className="text-gray-600" />
                                            <p className="text-[15px] font-light">No messages yet. Send your first inquiry below.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <form onSubmit={sendInquiryMessage} className="p-6 border-t border-white/10 flex gap-4 relative z-10 shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
                                    <input 
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your formal request..."
                                        className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-[24px] text-[15px] font-light text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-white/10 outline-none shadow-sm transition-all duration-300"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={sendingMessage || !newMessage.trim()}
                                        className="w-16 h-16 bg-white text-black rounded-[24px] flex items-center justify-center hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none shrink-0"
                                    >
                                        {sendingMessage ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="ml-1" />}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {inquiries.length > 0 ? (
                                        inquiries.map(inq => (
                                            <div key={inq.id} onClick={() => setActiveThread(inq)} className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] cursor-pointer hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500 flex flex-col gap-6">
                                                <div className="flex items-center justify-between">
                                                    <div className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                                                        inq.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-gray-400 border-white/10'
                                                    }`}>
                                                        {inq.status}
                                                    </div>
                                                    <span className="text-[10px] text-gray-600 font-mono tracking-widest">#{inq.id.slice(0, 8)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[17px] font-medium text-white tracking-wide">{inq.subject}</p>
                                                    <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-2 flex items-center gap-2">
                                                        <Clock size={12} /> Updated {new Date(inq.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                    <div className="flex -space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#121214] flex items-center justify-center text-[9px] font-bold text-gray-300">CL</div>
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-500 group-hover:text-white transition-colors flex items-center gap-2">
                                                        View Thread <ChevronRight size={14} />
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-24 rounded-[48px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center gap-6" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                            <div className="w-20 h-20 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 shadow-sm"><MessageSquare size={32} strokeWidth={1} /></div>
                                            <div>
                                                <p className="text-lg font-medium text-white tracking-tight">No Support Tickets</p>
                                                <p className="text-sm text-gray-500 font-light mt-2 max-w-[300px] leading-relaxed">Need administrative assistance or have a question about a forwarded document? Open a support ticket.</p>
                                            </div>
                                            <button 
                                                onClick={() => openCreateThreadUI('General Support')}
                                                className="mt-6 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-[16px] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-sm"
                                            >
                                                Open Support Ticket
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-8 border border-amber-500/20 backdrop-blur-xl rounded-[32px] flex items-start gap-6 relative overflow-hidden" style={{ backgroundColor: 'rgba(59, 42, 26, 0.4)' }}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                                    <div className="w-12 h-12 rounded-[16px] bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20"><Shield size={20} strokeWidth={1.5} /></div>
                                    <div className="relative z-10">
                                        <p className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.2em]">Administrative Notice</p>
                                        <p className="text-[13px] text-amber-100/70 font-light mt-2 leading-relaxed">
                                            All communications are logged in the immutable audit ledger. This channel is for administrative support only and does not constitute legal representation. For immediate document routing issues, use the "Urgent" flag when opening a ticket.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            // ── FORWARDING CONFIG ──────────────────────────────────────────────
            case 'config':
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="border-b border-white/5 pb-6">
                            <h3 className="text-4xl font-light text-white tracking-tight">Forwarding <span className="text-gray-500 font-medium">Config.</span></h3>
                            <p className="text-sm text-gray-400 font-light mt-2 max-w-lg">Control how and when we notify you about received mail.</p>
                        </div>
                        <div className="flex flex-col border border-white/10 bg-white/5 backdrop-blur-3xl rounded-[32px] overflow-hidden divide-y divide-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-3xl">
                            <Toggle value={priorityForwarding} onChange={(v) => { setPriorityForwarding(v); saveConfig('priority_forwarding', v); }} label="Priority Forwarding" description="Instantly scan & email you for all court documents and state compliance notices." />
                            <Toggle value={autoDisposeMarketing} onChange={(v) => { setAutoDisposeMarketing(v); saveConfig('auto_dispose_marketing', v); }} label="Auto-Dispose Marketing Mail" description="Automatically shred unsolicited solicitation and marketing mail." />
                            <Toggle value={smsInterrupt} onChange={(v) => { setSmsInterrupt(v); saveConfig('sms_interrupt', v); }} label="Urgent SMS Interrupt" description="Bypass Do Not Disturb for time-sensitive Service of Process deliveries. Ensure rapid administrative handling." />
                        </div>
                        <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-md flex items-start gap-6 max-w-3xl relative overflow-hidden group hover:border-luminous-blue/30 transition-all duration-500">
                            <div className="absolute -top-16 -right-16 w-48 h-48 bg-luminous-blue/10 rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="w-12 h-12 rounded-[16px] bg-white/5 flex items-center justify-center text-gray-400 shrink-0 border border-white/10 group-hover:border-luminous-blue/30 group-hover:bg-luminous-blue/10 group-hover:text-luminous-blue transition-all duration-500">
                                <Bell size={20} strokeWidth={1.5} />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[11px] font-bold text-gray-500 group-hover:text-luminous-blue transition-colors duration-500 uppercase tracking-[0.2em] mb-2">Delivery Methodology</p>
                                <p className="text-[13px] text-gray-400 font-light leading-relaxed">
                                    All forwarded documents are sent to your account email with a pristine, deskewed PDF attachment. Priority mail is explicitly flagged for your immediate attention.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            // ── ADDRESS SHIELD ─────────────────────────────────────────────────
            case 'shield':
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
                        <div className="border-b border-white/5 pb-6">
                            <h3 className="text-4xl font-light text-white tracking-tight">Address <span className="text-gray-500 font-medium">Shield.</span></h3>
                            <p className="text-sm text-gray-400 font-light mt-2 max-w-lg">Verify that your home address remains completely distinct from the Florida public record.</p>
                        </div>
                        <div className="p-10 bg-black/60 backdrop-blur-3xl rounded-[40px] border border-emerald-500/20 text-white relative overflow-hidden group shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                            <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] group-hover:bg-emerald-500/20 transition-all duration-1000 pointer-events-none" />
                            <div className="relative z-10 space-y-10">
                                <div className="flex items-center justify-center sm:justify-start gap-4 p-4 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 max-w-max shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                    <CheckCircle2 size={24} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" strokeWidth={1.5} />
                                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">Sunbiz Public Record — Verified</span>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em]">Registered Agent</p>
                                        <p className="font-mono text-[15px] text-white">Charter Legacy, Inc.</p>
                                        <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 size={12} /> Your name hidden</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em]">RA Address on File</p>
                                        <p className="font-mono text-[13px] text-gray-300 leading-relaxed tracking-wide">123 Innovation Way<br />Ste 400, DeLand FL 32720</p>
                                        <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 size={12} /> Not your home address</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-[0.2em]">Entity Status</p>
                                        <p className="font-mono text-[15px] text-white">ACTIVE</p>
                                        <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5"><CheckCircle2 size={12} /> Good standing</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-6 group hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <div className="w-14 h-14 rounded-[20px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:bg-emerald-500/20 transition-all duration-500">
                                    <Eye size={24} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">What the public sees</p>
                                    <p className="text-[14px] text-gray-400 font-light leading-relaxed group-hover:text-gray-300 transition-colors">Anyone searching Sunbiz sees Charter Legacy's DeLand address — not your home. This applies to process servers, data scrapers, and anyone doing a public records search.</p>
                                </div>
                            </div>
                            <div className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-6 group hover:border-luminous-blue/30 hover:bg-white/10 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -inset-2 bg-gradient-to-br from-luminous-blue/0 via-luminous-blue/0 to-luminous-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <div className="w-14 h-14 rounded-[20px] bg-luminous-blue/10 border border-luminous-blue/20 flex items-center justify-center text-luminous-blue shadow-[0_0_15px_rgba(0,122,255,0.1)] group-hover:shadow-[0_0_20px_rgba(0,122,255,0.3)] group-hover:bg-luminous-blue/20 transition-all duration-500">
                                    <MapPin size={24} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-luminous-blue drop-shadow-[0_0_5px_rgba(0,122,255,0.3)]">What we receive</p>
                                    <p className="text-[14px] text-gray-400 font-light leading-relaxed group-hover:text-gray-300 transition-colors">All service of process, state mail, and official entity correspondence is delivered directly to our DeLand Hub. We scan and digitize everything securely to your ledger.</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsComplianceOpen(true)} className="w-full p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] flex items-center justify-between hover:border-luminous-blue/40 hover:bg-white/10 transition-all duration-500 group shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,122,255,0.05)]">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-[20px] bg-black/40 shadow-inner flex items-center justify-center border border-white/10 group-hover:border-luminous-blue/30 group-hover:bg-luminous-blue/10 transition-all duration-500">
                                    <Landmark size={20} strokeWidth={1.5} className="text-gray-500 group-hover:text-luminous-blue transition-colors duration-500" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[16px] font-medium text-white tracking-wide group-hover:text-luminous-blue transition-colors duration-500">View Live Sunbiz Record</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1.5">Florida Division of Corporations</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:bg-luminous-blue/10 group-hover:border-luminous-blue/30 transition-all duration-500 shadow-sm">
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-luminous-blue transition-colors duration-500" />
                            </div>
                        </button>
                    </div>
                );

            // ── AUDIT LOG ──────────────────────────────────────────────────────
            case 'audit':
                return <RADocumentAuditLog isAdmin={false} />;
        }
    };

    return (
        <>
        <section className={`${isModal
            ? 'fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700 ease-out'
            : 'relative w-full h-full overflow-hidden'
        }`}
        style={ isModal ? { backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(30px)' } : { backgroundColor: '#0A0A0B' }}>
            
            {isModal && <div className="absolute inset-0 z-0 cursor-pointer" onClick={onClose} title="Click anywhere to close" />}

            <div className={`${isModal ? 'w-full max-w-6xl h-[85vh] shadow-[0_0_120px_rgba(0,0,0,0.8)] rounded-[48px] animate-in zoom-in-95 duration-700 ease-out flex flex-col relative z-10' : 'w-full h-full relative z-10'}`}>
                <div className={`${isModal ? 'rounded-[48px] border border-white/15 flex-1' : 'w-full h-full'} overflow-hidden relative flex flex-col`}
                     style={ isModal ? { backgroundColor: 'rgba(12,12,14,0.95)', backdropFilter: 'blur(40px)' } : {} }>

                    {isModal && (
                        <button onClick={onClose} className="absolute top-8 right-8 z-50 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg">
                            <X strokeWidth={2} size={20} />
                        </button>
                    )}

                    <div className="flex flex-col md:flex-row h-full w-full mx-auto relative z-10 overflow-hidden min-h-0">
                        {/* Ambient Background Glows */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luminous-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none z-0" />
                        <div className="absolute bottom-[20%] left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none z-0" />

                        {/* Sidebar */}
                        <aside className="w-full md:w-72 bg-white/[0.02] border-r border-white/5 p-8 flex flex-col shrink-0 overflow-y-auto overflow-x-hidden no-scrollbar relative z-10">
                            <div className="space-y-1 mb-12">
                                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 block">Console ID</span>
                                <span className="text-[13px] font-mono tracking-wide text-luminous-blue">RA-FL-482910</span>
                            </div>
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all duration-300 ${
                                            activeTab === tab.id 
                                            ? 'bg-white/10 text-white shadow-[0_4px_24px_rgba(0,0,0,0.2)]' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2 : 1.5} className={activeTab === tab.id ? 'text-luminous-blue' : ''} />
                                        <span className="text-[11px] font-bold uppercase tracking-widest">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                            <div className="pt-8 mt-auto">
                                <div className="p-5 bg-luminous-blue/5 rounded-3xl border border-luminous-blue/20 backdrop-blur-md">
                                    <div className="flex items-center gap-2 text-luminous-blue mb-2.5">
                                        <MapPin size={12} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">DeLand Hub</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                        <span className="text-[11px] font-medium tracking-wide text-gray-300">Node Active</span>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main content */}
                        <main className={`flex-1 p-8 md:p-12 ${isModal ? 'pt-20 md:pt-24' : ''} relative text-left overflow-y-auto overflow-x-hidden no-scrollbar z-10`}>
                            <div className="relative w-full h-full pb-12">
                                {renderContent()}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </section>

        {isComplianceOpen && (
            <ComplianceStatusModal documentNumber={DOCUMENT_NUMBER} onClose={() => setIsComplianceOpen(false)} />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </>
    );
};

export default RegisteredAgentConsole;
