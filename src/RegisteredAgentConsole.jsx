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
        className={`p-5 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between hover:scale-[1.01] ${
            value ? 'border-luminous-blue/20 shadow-lg shadow-luminous-blue/5' : 'border-gray-100 hover:border-gray-200'
        }`}
    >
        <div className="space-y-0.5">
            <p className={`font-black text-sm uppercase tracking-wide transition-colors ${value ? 'text-luminous-blue' : 'text-[#1D1D1F]'}`}>{label}</p>
            <p className="text-xs text-gray-500 font-medium">{description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className={`text-[10px] font-black uppercase tracking-widest ${value ? 'text-luminous-blue' : 'text-gray-300'}`}>{value ? 'On' : 'Off'}</span>
            <div className={`w-12 h-7 rounded-full relative transition-all duration-300 ${value ? 'bg-luminous-blue shadow-[0_0_12px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${value ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`} />
            </div>
        </div>
    </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => {
    useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, []);
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom-4 duration-300 ${
            type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
            {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {message}
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
        active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'
    }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-red-500 animate-pulse'}`} />
        {active ? 'Active' : 'Inactive'}
    </div>
);

// ─── Document Row with action tray ────────────────────────────────────────────
const DocumentRow = ({ doc, isSelected, onSelect, onAction, actionLoading }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-2xl border transition-all overflow-hidden ${
            isSelected ? 'border-luminous-blue/30 shadow-lg shadow-luminous-blue/5' : 'border-gray-100 hover:border-gray-200'
        }`}>
            {/* Main row */}
            <div className="flex items-center gap-4 p-5 bg-white">
                {/* Checkbox */}
                <button
                    onClick={() => onSelect(doc.id)}
                    className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-luminous-blue border-luminous-blue' : 'border-gray-300 hover:border-luminous-blue'
                    }`}
                >
                    {isSelected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                </button>

                {/* Icon & New Badge */}
                <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        doc.urgent ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                    }`}>
                        <FileText size={16} />
                    </div>
                    {!doc.viewed && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-sm" title="New Document" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm ${doc.viewed ? 'font-medium text-gray-500' : 'font-black text-[#1D1D1F]'} truncate`}>
                        {doc.title}
                    </p>
                    <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                        <span>{doc.date}</span>
                        <span className="text-gray-200">•</span>
                        <span>{doc.type}</span>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 shrink-0">
                    {doc.urgent && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-200">Legal</span>
                    )}
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                        {doc.status || 'Forwarded'}
                    </span>
                </div>

                {/* Expand actions */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        expanded ? 'bg-[#1D1D1F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {/* Action tray */}
            {expanded && (
                <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mr-2">Actions:</span>

                    <button
                        onClick={() => onAction('download', [doc.id])}
                        disabled={actionLoading === `download-${doc.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-luminous-blue hover:text-luminous-blue transition-all disabled:opacity-50"
                    >
                        {actionLoading === `download-${doc.id}`
                            ? <Loader2 size={11} className="animate-spin" />
                            : <Download size={11} />}
                        Download
                    </button>

                    <button
                        onClick={() => onAction('email', [doc.id])}
                        disabled={actionLoading === `email-${doc.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all disabled:opacity-50"
                    >
                        {actionLoading === `email-${doc.id}`
                            ? <Loader2 size={11} className="animate-spin" />
                            : <Mail size={11} />}
                        Email to me
                    </button>

                    <button
                        onClick={() => onAction('view', [doc.id])}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:border-gray-400 transition-all"
                    >
                        <Eye size={11} /> View
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

    const RA_ADDRESS = '123 Innovation Way, Ste 400, DeLand, FL 32720';
    const DOCUMENT_NUMBER = 'L24000392044';

    const MOCK_DOCS = [
        { id: 'mock-1', title: 'Annual Report Filing Confirmation', date: 'Feb 12, 2026', type: 'State FL', status: 'Forwarded', urgent: false },
        { id: 'mock-2', title: 'Service of Process — Inquiry',      date: 'Feb 09, 2026', type: 'Legal Notice', status: 'Forwarded', urgent: true },
        { id: 'mock-3', title: 'Division of Corporations — Official Mail', date: 'Jan 15, 2026', type: 'Sunbiz', status: 'Forwarded', urgent: false },
        { id: 'mock-4', title: 'Annual Report Reminder — Due May 1', date: 'Jan 02, 2026', type: 'Compliance', status: 'Forwarded', urgent: false },
    ];

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
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
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        if (activeThread) {
            const fetchMessages = async () => {
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

    const createNewThread = async (subject, docId = null) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase.from('ra_inquiry_threads').insert({
                user_id: user.id,
                subject,
                document_id: docId,
                status: 'OPEN'
            }).select().single();
            if (error) throw error;
            setInquiries(prev => [data, ...prev]);
            setActiveThread(data);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const saveConfig = async (key, value) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase.from('registered_agent_config').upsert(
                { user_id: user.id, [key]: value, updated_at: new Date() },
                { onConflict: 'user_id' }
            );
        } catch (err) { console.error('Config save error:', err); }
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
        { id: 'inquiries', icon: MessageSquare,   label: 'Legal Inquiry' },
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
                        <header className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500">
                                <Shield size={10} /> Status: Active Command
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-luminous-ink uppercase tracking-tighter leading-none">
                                Registered Agent<br /><span className="text-luminous-blue">Console.</span>
                            </h2>
                            <p className="text-base text-gray-500 font-medium italic leading-relaxed max-w-xl">
                                Charter Legacy is your Florida-licensed Registered Agent. We maintain a physical address so your home never appears on public record.
                            </p>
                        </header>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-[#0A0A0B] rounded-[28px] text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-luminous-blue/10 rounded-full blur-[60px]" />
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-luminous-blue">DeLand Hub Node</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Live</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Your Registered Address</p>
                                        <p className="font-mono text-sm text-white leading-relaxed">{RA_ADDRESS}</p>
                                    </div>
                                    <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Availability</p>
                                            <p className="text-xs font-bold text-gray-300">Mon–Fri, 9am–5pm ET</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">State</p>
                                            <p className="text-xs font-bold text-gray-300">Florida (FL)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div onClick={() => setIsComplianceOpen(true)} className="group p-6 bg-white border border-gray-100 rounded-[28px] cursor-pointer hover:shadow-xl hover:border-luminous-blue/20 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 size={18} /></div>
                                    <StatusBadge active={true} />
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Entity Status</p>
                                <p className="text-sm font-black text-[#1D1D1F] mb-1">Good Standing</p>
                                <p className="text-xs text-gray-400 font-medium mb-4">Annual report filed · Sunbiz verified</p>
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-luminous-blue group-hover:gap-2.5 transition-all">
                                    View Full Status <ChevronRight size={12} />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-amber-50 border border-amber-200/60 rounded-[24px] flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0"><Clock size={18} /></div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-amber-900">Annual Report Due: May 1, 2027</p>
                                <p className="text-xs text-amber-700 font-medium mt-0.5">Florida Statute 605.0210 — Reminders at 60, 30, and 7 days out.</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-black text-amber-800">437</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Days Away</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Recent Mail</h3>
                                <button onClick={() => setActiveTab('documents')} className="text-[10px] font-black uppercase tracking-widest text-luminous-blue hover:underline flex items-center gap-1">
                                    View All <ArrowRight size={10} />
                                </button>
                            </div>
                            {documents.slice(0, 2).map((doc, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {doc.urgent && <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                                        <div>
                                            <p className="text-xs font-black text-[#1D1D1F]">{doc.title}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{doc.date} · {doc.type}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">{doc.status || 'Forwarded'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            // ── DOCUMENT VAULT ─────────────────────────────────────────────────
            case 'documents':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Document Vault.</h3>
                                <p className="text-gray-500 font-medium italic mt-1">All official mail received at your DeLand Hub address.</p>
                            </div>
                            <div className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} className="text-emerald-400" /> Real-time Sync
                            </div>
                        </div>

                        {/* Select all / bulk bar */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={selectedDocs.size === documents.length ? clearSelection : selectAll}
                                className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#1D1D1F] transition-colors"
                            >
                                {selectedDocs.size === documents.length ? 'Deselect All' : 'Select All'}
                            </button>
                            {selectedDocs.size > 0 && (
                                <div className="flex items-center gap-2 ml-auto animate-in fade-in duration-200">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{selectedDocs.size} selected</span>

                                    <button
                                        onClick={() => handleAction('zip_download', [...selectedDocs], true)}
                                        disabled={actionLoading === 'bulk-zip_download'}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1D1D1F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === 'bulk-zip_download' ? <Loader2 size={11} className="animate-spin" /> : <Archive size={11} />}
                                        Download ZIP
                                    </button>

                                    <button
                                        onClick={() => handleAction('zip_email', [...selectedDocs], true)}
                                        disabled={actionLoading === 'bulk-zip_email'}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === 'bulk-zip_email' ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}
                                        Email ZIP
                                    </button>

                                    <button onClick={clearSelection} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors">
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

                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">What gets forwarded?</p>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Service of Process (lawsuits, subpoenas), state compliance notices, annual report reminders, and official Division of Corporations mail. Marketing and solicitation mail is auto-disposed per your config.
                            </p>
                        </div>
                    </div>
                );

            case 'inquiries':
                return (
                    <div className="h-full space-y-8 animate-in fade-in duration-500">
                        <header className="flex items-end justify-between">
                            <div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Legal Inquiry.</h3>
                                <p className="text-gray-500 font-medium italic mt-1">Formal bridge to Charter Legacy's legal fulfillment team.</p>
                            </div>
                            {!activeThread && (
                                <button 
                                    onClick={() => createNewThread('General Inquiry')}
                                    className="px-6 py-3 bg-[#1D1D1F] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                                >
                                    Start New Inquiry
                                </button>
                            )}
                        </header>

                        {activeThread ? (
                            <div className="flex flex-col h-[calc(100vh-320px)] bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                                {/* Thread Header */}
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setActiveThread(null)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-luminous-blue transition-all border border-gray-100 shadow-sm">
                                            <ArrowLeft size={14} />
                                        </button>
                                        <div>
                                            <p className="text-xs font-black text-[#1D1D1F] uppercase tracking-widest">{activeThread.subject}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Case ID: #INQ-{activeThread.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        activeThread.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-400 border-gray-200'
                                    }`}>
                                        {activeThread.status}
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-white">
                                    {messages.map((msg, i) => (
                                        <div key={msg.id} className={`flex gap-4 ${msg.is_staff ? '' : 'flex-row-reverse'}`}>
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                                msg.is_staff ? 'bg-luminous-blue/10 text-luminous-blue' : 'bg-[#1D1D1F] text-white'
                                            }`}>
                                                {msg.is_staff ? <Shield size={16} /> : <User size={16} />}
                                            </div>
                                            <div className={`max-w-[70%] space-y-1 ${msg.is_staff ? '' : 'text-right'}`}>
                                                <div className={`p-4 rounded-[20px] text-sm font-medium leading-relaxed ${
                                                    msg.is_staff 
                                                    ? 'bg-gray-50 text-[#1D1D1F] rounded-tl-none' 
                                                    : 'bg-luminous-blue text-white rounded-tr-none'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-300 gap-3">
                                            <MessageSquare size={32} strokeWidth={1.5} />
                                            <p className="text-xs font-medium italic">No messages yet. Send your first inquiry below.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <form onSubmit={sendInquiryMessage} className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                                    <input 
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your formal inquiry..."
                                        className="flex-1 px-6 py-4 bg-white border-2 border-transparent rounded-[20px] text-sm font-medium placeholder:text-gray-400 focus:border-luminous-blue/20 outline-none shadow-sm transition-all"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={sendingMessage || !newMessage.trim()}
                                        className="w-14 h-14 bg-luminous-blue text-white rounded-2xl flex items-center justify-center hover:bg-hacker-blue shadow-lg shadow-luminous-blue/20 transition-all disabled:opacity-50"
                                    >
                                        {sendingMessage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {inquiries.length > 0 ? (
                                    inquiries.map(inq => (
                                        <div key={inq.id} onClick={() => setActiveThread(inq)} className="group p-6 bg-white border border-gray-100 rounded-[28px] cursor-pointer hover:shadow-xl hover:border-luminous-blue/20 transition-all flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    inq.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                                                }`}>
                                                    {inq.status}
                                                </div>
                                                <span className="text-[10px] text-gray-300 font-mono">#{inq.id.slice(0, 8)}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#1D1D1F] uppercase tracking-tight">{inq.subject}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic flex items-center gap-1.5">
                                                    <Clock size={10} /> Updated {new Date(inq.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-gray-400">CL</div>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-luminous-blue group-hover:gap-2.5 transition-all flex items-center gap-1.5">
                                                    View Thread <ChevronRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center gap-4">
                                        <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 flex items-center justify-center text-gray-300 shadow-sm"><MessageSquare size={32} strokeWidth={1.5} /></div>
                                        <div>
                                            <p className="text-sm font-black text-[#1D1D1F] uppercase tracking-tighter">No Inquiries Found</p>
                                            <p className="text-xs text-gray-400 font-medium italic mt-1 max-w-[240px]">Need legal clarification or have a question for the RA team? Start an inquiry.</p>
                                        </div>
                                        <button 
                                            onClick={() => createNewThread('General Inquiry')}
                                            className="mt-4 px-6 py-3 bg-white border border-gray-200 text-[#1D1D1F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-luminous-blue hover:text-luminous-blue transition-all shadow-sm"
                                        >
                                            New General Inquiry
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6 bg-amber-50 border border-amber-200/60 rounded-[28px] flex items-start gap-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0"><Shield size={18} /></div>
                            <div>
                                <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Statutory Notice</p>
                                <p className="text-[11px] text-amber-700 font-medium mt-1 leading-relaxed italic">
                                    All inquiries are logged in the immutable audit ledger. This channel is for fulfillment clarification only and does not constitute legal representation. For immediate Service of Process issues, use the "Urgent" flag.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            // ── FORWARDING CONFIG ──────────────────────────────────────────────
            case 'config':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Forwarding Config.</h3>
                            <p className="text-gray-500 font-medium italic mt-1">Control how and when we notify you about received mail.</p>
                        </div>
                        <div className="space-y-4 max-w-2xl">
                            <Toggle value={priorityForwarding} onChange={(v) => { setPriorityForwarding(v); saveConfig('priority_forwarding', v); }} label="Priority Forwarding" description="Instantly scan & email you for all court documents and state legal notices." />
                            <Toggle value={autoDisposeMarketing} onChange={(v) => { setAutoDisposeMarketing(v); saveConfig('auto_dispose_marketing', v); }} label="Auto-Dispose Marketing Mail" description="Automatically shred unsolicited solicitation and marketing mail." />
                            <Toggle value={smsInterrupt} onChange={(v) => { setSmsInterrupt(v); saveConfig('sms_interrupt', v); }} label="Urgent SMS Interrupt" description="Bypass Do Not Disturb for Service of Process alerts. Immediate action may be required." />
                        </div>
                        <div className="p-5 bg-luminous-blue/5 border border-luminous-blue/15 rounded-2xl flex items-start gap-4">
                            <Bell size={16} className="text-luminous-blue shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black text-luminous-blue uppercase tracking-widest mb-1">Email Notifications</p>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                    All forwarded documents are sent to your account email with a scanned PDF attachment. Priority mail is flagged with a red subject line.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            // ── ADDRESS SHIELD ─────────────────────────────────────────────────
            case 'shield':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Address Shield.</h3>
                            <p className="text-gray-500 font-medium italic mt-1">Proof that your home address does not appear on the public record.</p>
                        </div>
                        <div className="p-8 bg-[#0A0A0B] rounded-[32px] text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={20} className="text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Sunbiz Public Record — Verified</span>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Registered Agent</p>
                                        <p className="font-mono text-sm text-white">Charter Legacy, Inc.</p>
                                        <p className="text-[10px] text-emerald-400 font-bold">✓ Your name hidden</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">RA Address on File</p>
                                        <p className="font-mono text-xs text-gray-300 leading-relaxed">123 Innovation Way<br />Ste 400, DeLand FL 32720</p>
                                        <p className="text-[10px] text-emerald-400 font-bold">✓ Not your home</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Entity Status</p>
                                        <p className="font-mono text-sm text-white">ACTIVE</p>
                                        <p className="text-[10px] text-emerald-400 font-bold">✓ Good standing</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-5 bg-white border border-gray-100 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-emerald-600"><Eye size={14} /><p className="text-xs font-black uppercase tracking-widest">What the public sees</p></div>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">Anyone searching Sunbiz sees Charter Legacy's DeLand address — not your home. This applies to process servers, data scrapers, and anyone doing a public records search.</p>
                            </div>
                            <div className="p-5 bg-white border border-gray-100 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-luminous-blue"><MapPin size={14} /><p className="text-xs font-black uppercase tracking-widest">What we receive</p></div>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">All legal documents, state mail, and official correspondence is delivered to our DeLand Hub. We scan and forward everything to you within one business day.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsComplianceOpen(true)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between hover:border-luminous-blue/20 hover:bg-white transition-all group">
                            <div className="flex items-center gap-3">
                                <Landmark size={16} className="text-gray-400 group-hover:text-luminous-blue transition-colors" />
                                <div className="text-left">
                                    <p className="text-xs font-black text-[#1D1D1F]">View Live Sunbiz Record</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Florida Division of Corporations</p>
                                </div>
                            </div>
                            <ExternalLink size={14} className="text-gray-300 group-hover:text-luminous-blue transition-colors" />
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
            ? 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300'
            : 'py-48 px-6 bg-luminous relative overflow-hidden'
        }`}>
            <div className={`${isModal ? 'w-full max-w-7xl h-full max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300' : 'max-w-7xl mx-auto'}`}>
                <div className="bg-white rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative h-full flex flex-col">

                    {isModal && (
                        <button onClick={onClose} className="absolute top-6 right-6 z-50 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors">
                            <X strokeWidth={2.5} size={18} />
                        </button>
                    )}

                    <div className="flex flex-col md:flex-row h-full">
                        {/* Sidebar */}
                        <aside className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100/50 p-8 space-y-10 shrink-0 overflow-y-auto">
                            <div className="space-y-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 block">Console ID</span>
                                <span className="text-xs font-mono text-luminous-blue">RA-FL-482910</span>
                            </div>
                            <nav className="space-y-5">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 w-full transition-all duration-200 ${
                                            activeTab === tab.id ? 'text-luminous-blue translate-x-2' : 'text-gray-400 hover:text-[#1D1D1F] hover:translate-x-1'
                                        }`}
                                    >
                                        <tab.icon size={16} />
                                        <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                            <div className="pt-8 mt-auto">
                                <div className="p-4 bg-luminous-blue/8 rounded-2xl border border-luminous-blue/15">
                                    <div className="flex items-center gap-2 text-luminous-blue mb-2">
                                        <MapPin size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">DeLand Hub</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-gray-600">Node Active</span>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main content */}
                        <main className="flex-1 p-10 md:p-16 relative text-left overflow-y-auto">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-luminous-blue/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
                            {renderContent()}
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
