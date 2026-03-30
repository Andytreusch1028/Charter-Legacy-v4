import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Filter, ShieldAlert, FileText, Send, CheckCircle2, MoreVertical, Archive, ArrowRight, User, Settings, Info, Briefcase, Plus, X, UploadCloud, Scan, Loader2, FileSearch, Trash2, Layout, Zap, Eye, Download, History, ShieldPlus, Mail, Paperclip, Inbox, Maximize2, Minimize2, FileBox, CheckCircle, AlertCircle, Clock, ChevronRight, ExternalLink, Printer, MoreHorizontal, Folder, RefreshCw, Lock, Unlock, Cpu, CircleDot } from 'lucide-react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { useStaffRa } from '../../hooks/useStaffRa';
import { useUplAgent } from '../../hooks/useUplAgent';
import { PremiumToast } from '../../shared/design-system/UIPrimitives';
import { supabase } from '../../lib/supabase';

// Set up pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.5.207/build/pdf.worker.min.mjs`;

/**
 * RaOperationsSector
 * High-performance Global. staff workspace for Registered Agent duties.
 */
const RaOperationsSector = ({ 
    user,
    raSettings, 
    operationsSummary,
    scannerDirectoryHandle, 
    globalDocuments, 
    globalAuditLogs,
    globalThreads, 
    clientDirectory, 
    llcDirectory, 
    loading,
    fetchStaffRaData,
    fetchThreadMessages,
    threadMessages,
    sendStaffMessage,
    uploadDocumentToClient,
    updateRaSettings,
    scannerPermissionStatus,
    reconnectScanner
}) => {
    const { checkUplCompliance, isChecking: uplChecking, UPL_DISCLAIMER } = useUplAgent();

    // Navigation & State
    const [activeSubTab, setActiveSubTab] = useState('inbox');
    const [inboxFilter, setInboxFilter] = useState('all'); // 'all', 'needs_action'
    const [selectedThread, setSelectedThread] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [uplCheckState, setUplCheckState] = useState('idle'); // idle, scanning, review
    const [sanitizedMessage, setSanitizedMessage] = useState('');
    const [toast, setToast] = useState(null);
    const messagesEndRef = useRef(null);

    // Upload state
    const [scannerState, setScannerState] = useState('dropzone'); // Default to dropzone for fresh view
    const [scannedFile, setScannedFile] = useState(null);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [extractedText, setExtractedText] = useState('');
    const [ocrConfidence, setOcrConfidence] = useState(0);
    const [viewerExpanded, setViewerExpanded] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadClient, setUploadClient] = useState('');
    const [uploadLlc, setUploadLlc] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadType, setUploadType] = useState('Legal Notice');
    const [uploadUrl, setUploadUrl] = useState('');
    const [uploadUrgent, setUploadUrgent] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Global Vault Search & Filter
    const [vaultSearchQuery, setVaultSearchQuery] = useState('');
    const [vaultFilter, setVaultFilter] = useState(raSettings?.vault_default_filter || 'llc'); 

    // Global Ledger Search & Filter
    const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
    const [ledgerFilter, setLedgerFilter] = useState('all'); // 'all', 'user', 'system'

    const clientMap = useMemo(() => clientDirectory.reduce((acc, client) => {
        acc[client.user_id] = client;
        return acc;
    }, {}), [clientDirectory]);

    const llcMap = useMemo(() => llcDirectory.reduce((acc, llc) => {
        acc[llc.id] = llc;
        return acc;
    }, {}), [llcDirectory]);

    const filteredLedgerLogs = useMemo(() => {
        let logs = globalAuditLogs || [];
        
        // Filter by actor type
        if (ledgerFilter === 'user') {
            logs = logs.filter(l => l.actor_type === 'USER');
        } else if (ledgerFilter === 'system') {
            logs = logs.filter(l => l.actor_type !== 'USER');
        }
        
        // Filter by query
        if (ledgerSearchQuery) {
            const q = ledgerSearchQuery.toLowerCase();
            logs = logs.filter(l => {
                const client = clientMap[l.user_id];
                const llc = llcMap[l.llc_id];
                return (
                    (l.action || '').toLowerCase().includes(q) ||
                    (l.actor_email || '').toLowerCase().includes(q) ||
                    (l.outcome || '').toLowerCase().includes(q) ||
                    (client?.name || '').toLowerCase().includes(q) ||
                    (llc?.llc_name || '').toLowerCase().includes(q) ||
                    (l.document_id || '').toLowerCase() === q ||
                    (l.document_id || '').toLowerCase().includes(q)
                );
            });
        }
        
        return logs;
    }, [globalAuditLogs, ledgerSearchQuery, ledgerFilter, clientMap, llcMap]);

    const filteredVaultDocs = useMemo(() => {
        const docs = globalDocuments || [];
        const q = (vaultSearchQuery || '').toLowerCase().trim();

        // 1. ISOLATION CHECK: If searching by a full Document ID, return ONLY that document.
        if (q.length === 36) {
            const exactMatch = docs.find(d => (d.id || '').toLowerCase() === q);
            if (exactMatch) return [exactMatch];
        }

        // 2. Normal Filter Flow
        return docs.filter(d => {
            const client = clientMap[d.user_id];
            const llc = llcMap[d.llc_id];
            
            // Special Prefix Filters
            if (q === 'is:urgent') return !!d.urgent;
            if (q === 'is:archived') return d.status?.toUpperCase() === 'ARCHIVED';

            // 1. Check for Query Match (Matches Title, Client, LLC, ID, or Type)
            const isQueryMatch = !q || (
                (d.title || '').toLowerCase().includes(q) ||
                (client?.name || '').toLowerCase().includes(q) ||
                (llc?.llc_name || '').toLowerCase().includes(q) ||
                (d.type || '').toLowerCase().includes(q) ||
                (d.id || '').toLowerCase() === q || // Exact ID match for "Jump to Context"
                (d.id || '').toLowerCase().includes(q)
            );
            
            if (!isQueryMatch) return false;

            // 2. Filter by toggle (LLC vs Individual)
            if (vaultFilter === 'llc') {
                return !!d.llc_id;
            } else if (vaultFilter === 'individual') {
                return !d.llc_id;
            }

            return true;
        });
    }, [globalDocuments, vaultSearchQuery, vaultFilter, clientMap, llcMap]);

    // Sync filter with persistent settings from System Hub
    useEffect(() => {
        if (raSettings?.vault_default_filter) {
            setVaultFilter(raSettings.vault_default_filter);
        }
    }, [raSettings?.vault_default_filter]);


    // Entity Combobox State
    const [entitySearchQuery, setEntitySearchQuery] = useState('');
    const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);
    const [activeEntityIndex, setActiveEntityIndex] = useState(0);
    const comboBoxRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (comboBoxRef.current && !comboBoxRef.current.contains(event.target)) {
                setIsEntityDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredEntities = React.useMemo(() => {
        const q = (entitySearchQuery || '').toLowerCase();
        const results = [];
        
        clientDirectory?.forEach(c => {
            const cName = (c.name || '').toLowerCase();
            const cEmail = (c.email || '').toLowerCase();
            
            const clientMatch = !q || cName.includes(q) || cEmail.includes(q);
            const clientLlcs = llcDirectory?.filter(l => l.user_id === c.user_id) || [];
            
            if (clientMatch) {
                results.push({
                    type: 'client',
                    label: `[Root File] ${c.name || 'Unknown'} (${c.email || 'No Email'})`,
                    uid: c.user_id,
                    lid: ''
                });
            }
            
            clientLlcs.forEach(llc => {
                const llcName = (llc.llc_name || 'Unknown LLC').toLowerCase();
                const llcMatch = !q || llcName.includes(q);
                if (clientMatch || llcMatch) {
                    results.push({
                        type: 'llc',
                        label: `${llc.llc_name || 'Unknown LLC'} — (Owner: ${c.name || 'Unknown'})`,
                        uid: c.user_id,
                        lid: llc.id
                    });
                }
            });
        });
        
        return results.slice(0, 50);
    }, [clientDirectory, llcDirectory, entitySearchQuery]);

    const selectedEntityDisplay = React.useMemo(() => {
        if (!uploadClient) return '';
        const client = clientDirectory.find(c => c.user_id === uploadClient);
        if (!client) return '';
        if (!uploadLlc) return `[Root File] ${client.name}`;
        const llc = llcDirectory.find(l => l.id === uploadLlc);
        if (!llc) return `[Root File] ${client.name}`;
        return `${llc.llc_name} — (Owner: ${client.name})`;
    }, [uploadClient, uploadLlc, clientDirectory, llcDirectory]);

    const docTypes = raSettings['document_types'] || [
        'State Requirement (FL)',
        'Legal Notice / Subpoena',
        'Compliance Notice',
        'Tax Document',
        'General Entity Mail'
    ];

    const [managingTypes, setManagingTypes] = useState(false);
    const [newDocType, setNewDocType] = useState('');

    const handleAddDocType = () => {
        if (!newDocType.trim() || docTypes.includes(newDocType.trim())) return;
        updateRaSettings('document_types', [...docTypes, newDocType.trim()]);
        setNewDocType('');
    };

    const handleDeleteDocType = (type) => {
        const updated = docTypes.filter(t => t !== type);
        updateRaSettings('document_types', updated);
        if (uploadType === type) {
            setUploadType(updated[0] || '');
        }
    };

    useEffect(() => {
        fetchStaffRaData();
    }, [fetchStaffRaData]);

    useEffect(() => {
        if (selectedThread) fetchThreadMessages(selectedThread.id);
    }, [selectedThread, fetchThreadMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [threadMessages, selectedThread]);

    const handleSendStaffReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedThread) return;

        if (uplCheckState === 'idle') {
            setUplCheckState('scanning');
            const sanitized = await checkUplCompliance(newMessage);
            setSanitizedMessage(sanitized);
            setUplCheckState('review');
        } else if (uplCheckState === 'review') {
            // Strip the rewrite prefix if present before sending to DB
            const finalContent = sanitizedMessage.startsWith('[REWRITTEN') 
                ? sanitizedMessage.replace(/^\[REWRITTEN: UPL COMPLIANT\]\s*/, '') 
                : sanitizedMessage;

            await sendStaffMessage(selectedThread.id, finalContent);
            setNewMessage('');
            setSanitizedMessage('');
            setUplCheckState('idle');
            setToast({ message: 'UPL-Compliant reply sent to client.', type: 'success' });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadClient || !uploadTitle || !uploadUrl) {
            setToast({ message: 'Missing required fields.', type: 'error' });
            return;
        }
        try {
            await uploadDocumentToClient(uploadClient, uploadLlc || null, uploadTitle, uploadType, scannedFile?.rawFile || uploadUrl, uploadUrgent);
            setToast({ message: 'Document forwarded safely to the target entity.', type: 'success' });
            
            if (scannedFile?.previewUrl) URL.revokeObjectURL(scannedFile.previewUrl);
            setScannerState('dropzone');
            setScannedFile(null);
            setUploadClient('');
            setUploadLlc('');
            setUploadTitle('');
            setUploadUrl('');
            setUploadUrgent(false);
        } catch (err) {
            console.error("Deploy Error:", err);
            setToast({ message: `System rejected deployment: ${err.message || 'Unknown API Exception'}`, type: 'error' });
        }
    };


    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleRealScan(e.target.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleRealDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleRealScan(files[0]);
        }
    };

    const handleRealScan = async (file) => {
        const previewUrl = URL.createObjectURL(file);
        const isPdf = file.type === 'application/pdf';
        
        setScannedFile({ 
            name: file.name, 
            url: previewUrl,
            previewUrl: previewUrl,
            type: file.type,
            rawFile: file
        });
        
        // Fix: Set uploadUrl immediately to unblock the deploy button
        setUploadUrl(`SECURE_HASH_${Math.random().toString(36).substring(7).toUpperCase()}`);
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
        
        setScannerState('scanning');
        setOcrProgress(0);

        let ocrPayload = file;

        if (isPdf) {
            try {
                setExtractedText("Initializing PDF Engine...");
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1);
                
                const viewport = page.getViewport({ scale: 2.0 }); // Higher scale = better OCR
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({ canvasContext: context, viewport }).promise;
                
                // Convert canvas to Blob for Tesseract
                ocrPayload = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                setExtractedText("PDF Rendered. Running character recognition...");
            } catch (pdfErr) {
                console.error("PDF Render Error:", pdfErr);
                setExtractedText("PDF Rendering failed. Visual Review Required.");
                setScannerState('review');
                return;
            }
        }

        try {
            // Real OCR Processing via Tesseract.js (Now supports PDF via Canvas conversion)
            const result = await Tesseract.recognize(
                ocrPayload,
                'eng',
                { 
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setOcrProgress(Math.floor(m.progress * 100));
                        }
                    }
                }
            );

            const { data: { text, confidence } } = result;
            setExtractedText(text);
            setOcrConfidence(confidence);

            // Prediction & Entity Matching
            const lowerText = text.toLowerCase();
            const lowerName = file.name.toLowerCase();
            
            // 1. Match LLC Entity
            const matchedLlc = llcDirectory.find(llc => 
                lowerText.includes(llc.llc_name.toLowerCase()) || 
                lowerName.includes(llc.llc_name.toLowerCase().split(' ')[0])
            );

            if (matchedLlc) {
                setUploadClient(matchedLlc.user_id);
                setUploadLlc(matchedLlc.id);
            } else {
                // Predictive fuzzy match for owners if no LLC match
                const matchedOwner = clientDirectory.find(c => 
                    lowerText.includes(c.name.toLowerCase()) || 
                    lowerName.includes(c.name.toLowerCase().split(' ')[0])
                );
                if (matchedOwner) setUploadClient(matchedOwner.user_id);
            }

            // 2. Predict Type & Urgency
            let predictedType = 'State Requirement (FL)';
            let isUrgent = confidence < 70; // High uncertainty flag as default urgency
            let predictedTitle = file.name.replace(/\.[^/.]+$/, "");

            if (lowerText.includes('subpoena') || lowerText.includes('claim') || lowerText.includes('court') || lowerName.includes('subpoena')) {
                predictedType = 'Legal Notice / Subpoena';
                isUrgent = true;
            } else if (lowerText.includes('irs') || lowerText.includes('tax') || lowerText.includes('treasury') || lowerName.includes('irs')) {
                predictedType = 'Internal Revenue Service (IRS)';
                isUrgent = true;
            } else if (lowerText.includes('report') || lowerText.includes('annual') || lowerName.includes('report')) {
                predictedType = 'State Requirement (FL)';
                isUrgent = false;
            } else if (confidence > 85) {
                predictedType = 'General Entity Mail';
                isUrgent = false;
            }

            setUploadType(predictedType);
            setUploadTitle(predictedTitle);
            setUploadUrgent(isUrgent);
            setScannerState('review');

        } catch (err) {
            console.error("OCR Error:", err);
            // Fallback to basic simulation if OCR fails
            setScannerState('review');
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
            setOcrConfidence(0);
        }
    };


    const renderInbox = () => {
        if (selectedThread) {
            const messages = threadMessages[selectedThread.id] || [];
            const selectedThreadTitle = selectedThread.subject || selectedThread.title || 'Unknown Inquiry';
            const clientName = clientMap[selectedThread.user_id]?.name || 'Unknown Client';
            const llcName = selectedThread.llc_id ? llcMap[selectedThread.llc_id]?.llc_name : 'Individual/Direct';
            const recentDocs = globalDocuments.filter(d => d.user_id === selectedThread.user_id).slice(0, 3);

            return (
                <div className="flex gap-6 h-full min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                        <div>
                            <button onClick={() => { setSelectedThread(null); setUplCheckState('idle'); }} className="text-[10px] font-bold uppercase tracking-widest text-[#00f3ff] mb-2 hover:text-white transition-colors flex items-center gap-2">
                                <ArrowRight size={12} className="rotate-180" /> Back to Inbox
                            </button>
                            <h3 className="text-lg font-semibold text-white">{selectedThread.subject}</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                <span className="text-[#00f3ff]">{llcName}</span>
                                <span className="mx-2 opacity-30">|</span>
                                <span>Owner: {clientName}</span>
                            </p>
                        </div>
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedThread.status}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar pr-2">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.is_staff ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-4 rounded-xl ${msg.is_staff ? 'bg-white/10 text-white border border-white/20' : 'bg-luminous-blue/20 text-white border border-luminous-blue/30'}`}>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{msg.is_staff ? 'Charter Agent' : 'Client'}</p>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-[9px] text-gray-500 text-right mt-2 uppercase tracking-widest">{new Date(msg.created_at).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {uplCheckState === 'scanning' ? (
                        <div className="p-8 text-center bg-luminous-blue/5 border border-luminous-blue/20 rounded-2xl animate-pulse">
                            <ShieldAlert className="mx-auto text-luminous-blue mb-4" size={32} />
                            <p className="text-[10px] text-luminous-blue uppercase font-black tracking-widest">UPL Agent Scanning Activity...</p>
                            <p className="text-[9px] text-gray-400 mt-2">Checking local Ollama instance for compliance violations.</p>
                        </div>
                    ) : uplCheckState === 'review' ? (
                        <div className={`p-6 border rounded-2xl space-y-4 ${
                            sanitizedMessage.startsWith('[BLOCKED') ? 'bg-rose-500/5 border-rose-500/20' : 
                            sanitizedMessage.startsWith('[REWRITTEN') ? 'bg-amber-500/5 border-amber-500/20' : 
                            'bg-emerald-500/5 border-emerald-500/20'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 flex items-center justify-center rounded-lg border ${
                                        sanitizedMessage.startsWith('[BLOCKED') ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 
                                        sanitizedMessage.startsWith('[REWRITTEN') ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 
                                        'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                                    }`}>
                                        <ShieldAlert size={12} />
                                    </div>
                                    <p className={`text-[10px] uppercase font-black tracking-widest ${
                                        sanitizedMessage.startsWith('[BLOCKED') ? 'text-rose-500' : 
                                        sanitizedMessage.startsWith('[REWRITTEN') ? 'text-amber-500' : 
                                        'text-emerald-500'
                                    }`}>
                                        {sanitizedMessage.startsWith('[BLOCKED') ? 'UPL Agent Verdict: BLOCKED' : 
                                         sanitizedMessage.startsWith('[REWRITTEN') ? 'UPL Agent Verdict: Auto-Corrected' : 
                                         'UPL Agent Verdict: Compliant'}
                                    </p>
                                </div>
                                <button onClick={() => setUplCheckState('idle')} className="text-[9px] font-bold text-gray-500 hover:text-white uppercase tracking-widest">Edit Original</button>
                            </div>
                            
                            <div className={`bg-black/40 border rounded-xl p-4 ${
                                sanitizedMessage.startsWith('[BLOCKED') ? 'border-rose-500/30 bg-rose-500/5' : 
                                sanitizedMessage.startsWith('[REWRITTEN') ? 'border-amber-500/30 bg-amber-500/5' : 
                                'border-emerald-500/10'}`}>
                                <p className={`text-xs leading-relaxed whitespace-pre-wrap ${
                                    sanitizedMessage.startsWith('[BLOCKED') ? 'text-rose-400 font-medium' : 
                                    sanitizedMessage.startsWith('[REWRITTEN') ? 'text-amber-400 italic' : 
                                    'text-white'
                                }`}>
                                    {sanitizedMessage}
                                </p>
                            </div>

                            <button 
                                onClick={handleSendStaffReply}
                                disabled={sanitizedMessage.startsWith('[BLOCKED')}
                                className={`w-full py-3 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all shadow-lg 
                                    ${sanitizedMessage.startsWith('[BLOCKED') 
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' 
                                        : sanitizedMessage.startsWith('[REWRITTEN')
                                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                                            : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'}`}
                            >
                                {sanitizedMessage.startsWith('[BLOCKED') ? 'Send Disabled: Compliance Violation' : 'Final Approval & Send to Client'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendStaffReply} className="relative shrink-0">
                            <textarea
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type your official response..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-14 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none h-24"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendStaffReply(e);
                                    }
                                }}
                            />
                            <button type="submit" disabled={!newMessage.trim()} className="absolute bottom-4 right-4 w-8 h-8 bg-emerald-500 text-black rounded-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-400">
                                <Send size={14} className="ml-0.5" />
                            </button>
                        </form>
                    )}
                </div>

                    {/* Right Context Sidebar: [NEW] Premium RA Intelligence */}
                    <div className="w-80 border-l border-white/5 pl-6 hidden xl:block space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Column Identity Header */}
                        <div className="pb-2 border-b border-white/10">
                            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Intelligence Sidebar</h3>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase">Entity health & contextual oversight</p>
                        </div>

                        {/* Entity Health Hub */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Entity Metadata</p>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LLC State Standing</p>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                                    (selectedThread.llc_id ? llcMap[selectedThread.llc_id]?.filing_status : 'Active') === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                }`}>
                                    {selectedThread.llc_id ? llcMap[selectedThread.llc_id]?.filing_status : 'Individual'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Annual Report 2026</p>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                                    (selectedThreadTitle.toLowerCase().includes('annual') || selectedThreadTitle.toLowerCase().includes('report') || selectedThreadTitle.toLowerCase().includes('filing')) ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-gray-500'
                                }`}>
                                    {(selectedThreadTitle.toLowerCase().includes('annual') || selectedThreadTitle.toLowerCase().includes('report') || selectedThreadTitle.toLowerCase().includes('filing')) ? 'Pending Filing' : 'Not Started'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jurisdiction</p>
                                <p className="text-[9px] text-white font-black uppercase tracking-widest">Florida (USA)</p>
                            </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Owner</p>
                                    <p className="text-xs text-white font-medium truncate max-w-[120px]">{clientName}</p>
                                </div>
                                <div className="pt-2 border-t border-white/5">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compliance Pulse</p>
                                        <span className="text-[10px] text-emerald-500 font-black">94%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[94%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Documents Snippet */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Secure Vault Activity</p>
                                <FileBox size={14} className="text-gray-600" />
                            </div>
                            <div className="space-y-2">
                                {recentDocs.map(doc => (
                                    <div key={doc.id} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-default group">
                                        <div className="flex items-center gap-3 mb-1">
                                            <FileText size={14} className="text-[#00f3ff]" />
                                            <p className="text-xs text-white font-medium truncate">{doc.title}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">{doc.type}</p>
                                            <p className="text-[8px] text-gray-600 font-mono italic">{doc.date}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentDocs.length === 0 && (
                                    <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                                        <p className="text-[9px] text-gray-600 uppercase font-bold italic opacity-30">No Recent Documents</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Approved Ministerial Snippets */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">UPL-Safe Snippets</p>
                            <div className="grid grid-cols-1 gap-2">
                                <button 
                                    onClick={() => setNewMessage("Our records indicate your Annual Report is due soon. We will monitor the filing status and inform you once the state has confirmation.")} 
                                    className="text-left p-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all group"
                                >
                                    <p className="text-[10px] text-white font-bold uppercase tracking-widest group-hover:text-emerald-400">Annual Report Update</p>
                                    <p className="text-[8px] text-gray-500 mt-1">Ministerial / Informational</p>
                                </button>
                                <button 
                                    onClick={() => setNewMessage("A legal notice has been received at your Registered Agent address. A digital copy is now available in your Secure Vault for review.")} 
                                    className="text-left p-3 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-all group"
                                >
                                    <p className="text-[10px] text-white font-bold uppercase tracking-widest group-hover:text-emerald-400">Notice Received</p>
                                    <p className="text-[8px] text-gray-500 mt-1">Standard Notification</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        const filteredThreads = globalThreads.filter(t => {
            if (t.status === 'CLOSED') return false;
            if (inboxFilter === 'needs_action') return t.status === 'OPEN' || t.status === 'NEW';
            return true;
        });

        const openCount = globalThreads.filter(t => t.status === 'OPEN' || t.status === 'NEW').length;

        return (
            <div className="space-y-4">
                {/* Inbox Filter Header */}
                <div className="flex items-center justify-between mb-4 bg-white/5 border border-white/10 rounded-xl p-2">
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setInboxFilter('needs_action')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${inboxFilter === 'needs_action' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            <CircleDot size={12} className={inboxFilter === 'needs_action' ? 'animate-pulse' : ''} />
                            Needs Action ({openCount})
                        </button>
                        <button 
                            onClick={() => setInboxFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${inboxFilter === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Inbox size={12} />
                            All Active ({globalThreads.filter(t => t.status !== 'CLOSED').length})
                        </button>
                    </div>
                    <div className="px-3">
                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest italic">{inboxFilter === 'needs_action' ? 'Viewing threads requiring reply' : 'Viewing all synchronized threads'}</p>
                    </div>
                </div>

                {filteredThreads.map(thread => (
                    <div key={thread.id} onClick={() => setSelectedThread(thread)} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between cursor-pointer transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {thread.status === 'OPEN' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                <h4 className="text-white font-medium">{thread.subject}</h4>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-4">
                                <span><User size={10} className="inline mr-1" /> {clientMap[thread.user_id]?.name || 'Unknown'}</span>
                                {thread.llc_id && <span><Briefcase size={10} className="inline mr-1" /> {llcMap[thread.llc_id]?.llc_name || 'Individual'}</span>}
                                <span>Updated: {new Date(thread.updated_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                        <ArrowRight size={16} className="text-gray-600" />
                    </div>
                ))}
                
                {filteredThreads.length === 0 && (
                    <div className="p-12 text-center bg-white/5 border border-white/10 rounded-2xl">
                        <Inbox size={32} className="mx-auto text-gray-600 mb-4 opacity-20" />
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Global Inbox Empty</p>
                        <p className="text-[9px] text-gray-600 mt-2">All client inquiries have been resolved or synchronized.</p>
                    </div>
                )}
            </div>
        );
    };

    const renderMailRoom = () => {
        if (scannerState === 'dropzone') {
            return (
                <div className="max-w-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-xl border border-emerald-500/20">
                                <Mail size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Scanner Room Dropzone</h3>
                                <p className="text-xs text-gray-400 mt-1">Drag & drop incoming physical mail or process server documents here.</p>
                            </div>
                        </div>
                        
                        {/* Source Status Indicator */}
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Active Intake Source</p>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
                                {raSettings?.scanner_locked === 'true' && (
                                    <Lock size={10} className="text-blue-500" />
                                )}
                                <span className={`w-1.5 h-1.5 rounded-full ${scannerPermissionStatus === 'granted' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                <p className="text-[10px] text-gray-300 font-mono italic truncate max-w-[150px]">
                                    {raSettings['scanner_source_path'] || 'Default Local Buffer'}
                                </p>
                            </div>
                        </div>
                    </div>


                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleRealDrop}
                            onClick={async () => {
                                if (scannerPermissionStatus !== 'granted' && scannerDirectoryHandle) {
                                    const success = await reconnectScanner();
                                    if (!success) return;
                                }

                                if (scannerDirectoryHandle && window.showOpenFilePicker) {
                                    try {
                                        const [fileHandle] = await window.showOpenFilePicker({
                                            startIn: scannerDirectoryHandle,
                                            types: [{
                                                description: 'OCR Targets (PDF, Images)',
                                                accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'], 'application/pdf': ['.pdf'] }
                                            }]
                                        });
                                        const file = await fileHandle.getFile();
                                        handleRealScan(file);
                                    } catch (err) {
                                        // User aborted or API failed - fallback to old input
                                        if (err.name !== 'AbortError') document.getElementById('fileInput').click();
                                    }
                                } else {
                                    document.getElementById('fileInput').click();
                                }
                            }}
                            className={`relative border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group ${isDragging ? 'border-[#00f3ff] bg-[#00f3ff]/5 scale-[0.99]' : 'border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5'}`}
                        >
                            {scannerPermissionStatus !== 'granted' && scannerDirectoryHandle && raSettings?.scanner_locked === 'true' && (
                                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl animate-in fade-in duration-500">
                                    <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                                        <RefreshCw className="animate-spin-slow" size={32} />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Re-Authorization Required</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center px-8">
                                        The intake source is <span className="text-blue-400">Locked</span>. Click anywhere to re-link your local scan folder.
                                    </p>
                                </div>
                            )}
                            <input 
                                id="fileInput"
                                type="file" 
                                onChange={handleFileSelect} 
                                className="hidden" 
                                accept=".pdf,.png,.jpg,.jpeg"
                            />
                            <Paperclip className={`w-12 h-12 mb-4 transition-all ${isDragging ? 'text-[#00f3ff] scale-110 rotate-12' : 'text-gray-600 group-hover:text-gray-400'}`} />
                            <h4 className="text-lg font-bold text-white mb-2">Click or Drag Document to Scan</h4>
                            <p className="text-xs text-gray-500 max-w-sm text-center px-4 leading-relaxed">
                                Charter's OCR engine will automatically extract the target client, document type, and urgency.
                            </p>
                            
                        </div>
                </div>
            );
        }

        if (scannerState === 'scanning') {
            return (
                <div className="max-w-3xl h-64 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center bg-black/50 relative overflow-hidden">
                    {/* Premium Laser Beam Animation */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-luminous-blue to-transparent shadow-[0_0_15px_rgba(45,212,191,0.8)] animate-scan-beam z-20" />
                    
                    <div className="relative mb-6">
                        <Loader2 size={40} className="text-luminous-blue animate-spin absolute opacity-50 blur-sm" />
                        <Scan size={40} className="text-white relative z-10 animate-pulse" />
                    </div>
                    <h4 className="text-lg font-medium text-white mb-2">Engaging OCR Engine... ({ocrProgress}%)</h4>
                    <p className="text-sm text-gray-400">Extracting legal entity metadata and jurisdiction signatures.</p>
                    
                    <div className="mt-8 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-luminous-blue transition-all duration-300 shadow-[0_0_10px_#00f3ff]" style={{ width: `${ocrProgress}%` }} />
                    </div>
                    <p className="text-[10px] text-luminous-blue/60 uppercase font-black tracking-widest mt-4 animate-pulse">Neural Thread Processing Active</p>
                </div>
            );
        }

        // Review State
        return (
            <div className="max-w-5xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-xl border border-blue-500/20">
                        <Search size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Review & Onboard Document</h3>
                        <p className="text-xs text-gray-400">Verify AI-extracted tags. Do not attach legal advice or free-text notes.</p>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Left Panel: Simulated Document Preview */}
                    <div className="w-1/2 bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                            <h4 className="text-sm font-medium text-white flex items-center gap-2 max-w-[200px] truncate"><Paperclip size={14} className="shrink-0"/> <span className="truncate">{scannedFile?.name}</span></h4>
                            <div className="flex items-center gap-3">
                                {scannedFile?.previewUrl && (
                                    <button type="button" onClick={() => setViewerExpanded(true)} className="text-gray-400 hover:text-white transition-colors" title="Enlarge Document">
                                        <Maximize2 size={16} />
                                    </button>
                                )}
                                <span className="text-[10px] font-mono text-gray-500 bg-black px-2 py-1 rounded">SECURE_VIEWER_ACTIVE</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 bg-black rounded-lg border border-white/5 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px]">
                            {scannedFile?.previewUrl ? (
                                scannedFile.type?.startsWith('image/') ? (
                                    <img src={scannedFile.previewUrl} alt="Document Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <iframe src={scannedFile.previewUrl} className="w-full h-full border-0 bg-white" title="Document Preview" />
                                )
                            ) : (
                                <>
                                    {/* Simulated blurry document image baseline */}
                                    <div className="absolute inset-4 bg-white/10 opacity-20 blur-sm rounded"></div>
                                    <div className="absolute inset-8 bg-white/10 opacity-10 blur-md rounded mt-12 w-3/4"></div>
                                    <div className="absolute inset-x-8 top-32 h-4 bg-white/10 opacity-20 blur-sm rounded"></div>
                                    <div className="absolute inset-x-8 top-40 h-4 bg-white/10 opacity-20 blur-sm w-1/2 rounded"></div>
                                    
                                    <div className="relative z-10 flex flex-col items-center gap-3">
                                        <ShieldAlert size={32} className="text-white/20" />
                                        <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Encrypted Source File</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleUpload} className={`w-1/2 bg-white/5 border rounded-2xl p-6 space-y-5 transition-all duration-500 ${ocrConfidence < 70 ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/10'}`}>
                        <div className={`border rounded-xl p-4 transition-colors ${ocrConfidence < 70 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {ocrConfidence < 70 ? <AlertCircle size={14} className="text-rose-400" /> : <Zap size={14} className="text-emerald-400" />}
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${ocrConfidence < 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        OCR {ocrConfidence < 70 ? 'QUALITY ALERT' : 'CONFIDENCE'}: {ocrConfidence}%
                                    </p>
                                </div>
                                <span className={`text-[10px] font-mono ${ocrConfidence < 70 ? 'text-rose-500/50' : 'text-emerald-500/50'}`}>ENGINE: TESSERACT_V5</span>
                            </div>
                            {ocrConfidence < 70 && (
                                <p className="text-[9px] text-rose-500/70 font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <ShieldPlus size={10} /> MANUAL DATA VERIFICATION RECOMMENDED
                                </p>
                            )}
                            <div className="max-h-24 overflow-y-auto bg-black/40 rounded border border-white/5 p-2 custom-scrollbar">
                                <p className="text-[10px] text-gray-400 font-mono leading-relaxed whitespace-pre-wrap">{extractedText || 'Processing text payload...'}</p>
                            </div>
                        </div>

                        <div className="relative" ref={comboBoxRef}>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Target Entity Registry</label>
                                <span className="text-[8px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded">SYSTEM DIAGNOSTIC: {clientDirectory?.length || 0} CLIENTS / {llcDirectory?.length || 0} LLCS</span>
                            </div>
                            
                            {uploadClient ? (
                                <div className="bg-luminous-blue/10 border border-luminous-blue/30 rounded-lg p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-luminous-blue/20 rounded flex items-center justify-center text-luminous-blue">
                                            {uploadLlc ? <ShieldAlert size={16} /> : <User size={16} />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-luminous-blue font-bold uppercase tracking-widest mb-0.5">Target Confirmed</p>
                                            <p className="text-white text-sm font-medium">{selectedEntityDisplay}</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => { 
                                            setUploadClient(''); 
                                            setUploadLlc(''); 
                                            setEntitySearchQuery('');
                                            setIsEntityDropdownOpen(true);
                                        }} 
                                        className="text-[10px] px-3 py-1.5 bg-white/5 hover:bg-black border border-white/10 hover:border-white/30 text-white rounded transition-colors uppercase tracking-wider font-bold"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 py-0" size={14} />
                                    <input 
                                        type="text"
                                        value={entitySearchQuery}
                                        onChange={e => {
                                            setEntitySearchQuery(e.target.value);
                                            setIsEntityDropdownOpen(true);
                                            setActiveEntityIndex(0);
                                        }}
                                        onFocus={() => {
                                            setIsEntityDropdownOpen(true);
                                            setActiveEntityIndex(0);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                setActiveEntityIndex(prev => Math.min(prev + 1, filteredEntities.length - 1));
                                            } else if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                setActiveEntityIndex(prev => Math.max(prev - 1, 0));
                                            } else if ((e.key === 'Enter' || e.key === 'Tab') && isEntityDropdownOpen && filteredEntities.length > 0) {
                                                if (e.key === 'Enter') e.preventDefault(); // Prevent form submit
                                                
                                                const selected = filteredEntities[activeEntityIndex] || filteredEntities[0];
                                                setUploadClient(selected.uid);
                                                setUploadLlc(selected.lid);
                                                setEntitySearchQuery('');
                                                setIsEntityDropdownOpen(false);
                                                setActiveEntityIndex(0);
                                            }
                                        }}
                                        autoFocus={!uploadClient && isEntityDropdownOpen}
                                        placeholder="Type Client Name or Target LLC..."
                                        className="w-full bg-black border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] rounded-lg pl-9 pr-4 py-2 text-white outline-none focus:border-luminous-blue transition-colors text-sm"
                                    />
                                </div>
                            )}

                            {!uploadClient && isEntityDropdownOpen && (
                                <div className="absolute z-50 w-full mt-2 bg-black border border-white/20 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                                   {filteredEntities.length === 0 ? (
                                        <div className="p-4 text-xs text-gray-400 text-center">
                                            {entitySearchQuery ? "No matching entities found." : "Type to search thousands of entities..."}
                                        </div>
                                   ) : (
                                        <div className="py-2">
                                            {filteredEntities.map((entity, i) => (
                                                <button
                                                    key={`${entity.uid}-${entity.lid}-${i}`}
                                                    type="button"
                                                    onMouseEnter={() => setActiveEntityIndex(i)}
                                                    onClick={() => {
                                                        setUploadClient(entity.uid);
                                                        setUploadLlc(entity.lid);
                                                        setEntitySearchQuery('');
                                                        setIsEntityDropdownOpen(false);
                                                        setActiveEntityIndex(0);
                                                    }}
                                                    className={`w-full text-left px-4 py-3 transition-colors block border-b border-white/5 last:border-0 ${activeEntityIndex === i ? 'bg-luminous-blue/20 text-luminous-blue' : 'hover:bg-white/10 text-white'}`}
                                                >
                                                    {entity.type === 'llc' ? (
                                                        <span><span className="font-bold text-sm text-white block mb-0.5">{entity.label.split('—')[0]}</span> <span className="text-gray-400 text-[10px] uppercase tracking-wider">{entity.label.split('—')?.[1] || ''}</span></span>
                                                    ) : (
                                                        <span className="text-luminous-blue font-medium text-sm">{entity.label}</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                   )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Document Title</label>
                            <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Service of Process - Case #1234" className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-luminous-blue transition-colors" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Document Type</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setManagingTypes(!managingTypes)} 
                                        className="text-[10px] font-bold text-luminous-blue hover:text-white uppercase tracking-widest"
                                    >
                                        {managingTypes ? 'Done' : 'Manage Types'}
                                    </button>
                                </div>
                                {managingTypes ? (
                                    <div className="bg-black/50 border border-white/10 rounded-lg p-3 space-y-2">
                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                            {docTypes.map(type => (
                                                <div key={type} className="flex justify-between items-center group pd-1">
                                                    <span className="text-white text-xs">{type}</span>
                                                    <button type="button" onClick={() => handleDeleteDocType(type)} className="text-red-500/50 hover:text-red-500 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 pt-2 border-t border-white/10 mt-2">
                                            <input 
                                                type="text" 
                                                value={newDocType} 
                                                onChange={e => setNewDocType(e.target.value)} 
                                                placeholder="New type name..." 
                                                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-luminous-blue transition-colors"
                                                onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleAddDocType(); } }}
                                            />
                                            <button type="button" onClick={handleAddDocType} className="bg-luminous-blue/20 text-luminous-blue px-3 rounded text-xs font-bold hover:bg-luminous-blue/30 transition-colors">+</button>
                                        </div>
                                    </div>
                                ) : (
                                    <select value={uploadType} onChange={e => setUploadType(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-luminous-blue transition-colors">
                                        {docTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input type="checkbox" id="urgent" checked={uploadUrgent} onChange={e => setUploadUrgent(e.target.checked)} className="w-4 h-4 rounded border-gray-600 focus:ring-red-500 bg-gray-700 accent-red-500" />
                                <label htmlFor="urgent" className="text-sm font-bold text-red-400 flex items-center gap-1.5"><ShieldAlert size={14} /> Mark URGENT</label>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2 text-opacity-50">Internal Hash (Auto-Generated)</label>
                            <input type="text" value={uploadUrl} readOnly className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-gray-600 outline-none select-none cursor-not-allowed text-xs font-mono" />
                        </div>

                        <div className="flex gap-4 pt-4 mt-4 border-t border-white/10">
                            <button type="button" onClick={() => { 
                                if (scannedFile?.previewUrl) URL.revokeObjectURL(scannedFile.previewUrl);
                                setScannerState('dropzone'); 
                                setScannedFile(null); 
                                setUploadClient('');
                                setUploadLlc('');
                            }} className="px-4 py-2 border border-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/5 transition-colors">
                                Discard
                            </button>
                            <button type="submit" className="flex-1 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-white/50">
                                Verify & Deploy to Vault
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const RAActionControl = ({ doc }) => {
        return (
            <select 
                value="" 
                onChange={async (e) => {
                    const action = e.target.value;
                    if (!action) return;
                    
                    try {
                        if (action === 'ARCHIVE' || action === 'UNARCHIVE' || action === 'MARK_HANDLED') {
                            const updates = {};
                            if (action === 'ARCHIVE') updates.status = 'ARCHIVED';
                            if (action === 'UNARCHIVE') updates.status = 'FORWARDED';
                            if (action === 'MARK_HANDLED' || action === 'ARCHIVE' || action === 'RESEND') {
                                updates.urgent = false;
                            }
                            
                            const { error } = await supabase
                                .from('registered_agent_documents')
                                .update(updates)
                                .eq('id', doc.id);
                            if (error) throw error;
                        } else if (action === 'RESEND') {
                            // Automatically clear urgency on Resend as it indicates the task has been handled
                            const { error } = await supabase
                                .from('registered_agent_documents')
                                .update({ urgent: false })
                                .eq('id', doc.id);
                            if (error) throw error;
                        }

                        // Log to Audit Ledger
                        const { error: logErr } = await supabase.from('ra_document_audit').insert({
                            user_id: doc.user_id,
                            llc_id: doc.llc_id,
                            document_id: doc.id,
                            action: action === 'ARCHIVE' ? 'DOCUMENT_ARCHIVED' : 
                                    action === 'UNARCHIVE' ? 'DOCUMENT_UNARCHIVED' : 
                                    action === 'MARK_HANDLED' ? 'URGENCY_RESOLVED' : 'DOCUMENT_RESENT',
                            actor_type: 'CHARTER_ADMIN',
                            actor_email: user?.email || 'system@charter.legal',
                            metadata: { 
                                original_status: doc.status,
                                target_status: action === 'ARCHIVE' ? 'ARCHIVED' : action === 'UNARCHIVE' ? 'FORWARDED' : doc.status,
                                filename: doc.title || doc.name,
                                resolution_type: action
                            },
                            outcome: 'SUCCESS'
                        });

                        if (logErr) console.error("Ledger Logging Failed:", logErr);
                        
                        fetchStaffRaData();
                        setToast({ 
                            message: action === 'ARCHIVE' ? 'Document Archived & Urgency Resolved' : 
                                     action === 'UNARCHIVE' ? 'Document Restored to Registry' : 
                                     action === 'MARK_HANDLED' ? 'Urgency Flag Cleared' : 'Re-send Logged & Urgency Resolved', 
                            type: 'success' 
                        });
                    } catch (err) {
                        setToast({ message: `Action failed: ${err.message}`, type: 'error' });
                    }
                }}
                className="bg-[#1a1a2e] border border-white/10 rounded px-2 py-1 text-[8px] font-black uppercase text-purple-400 hover:text-white transition-colors outline-none cursor-pointer"
            >
                <option value="" disabled>Select Action</option>
                <option value="RESEND">Re-send to Client</option>
                {doc.urgent && <option value="MARK_HANDLED">Mark as Handled</option>}
                {doc.status?.toUpperCase() === 'ARCHIVED' ? (
                    <option value="UNARCHIVE">Un-archive Document</option>
                ) : (
                    <option value="ARCHIVE">Archive Document</option>
                )}
            </select>
        );
    };

    const IntelligenceTray = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Urgent SOPs Card */}
            <button 
                onClick={() => {
                    setActiveSubTab('vault');
                    setVaultSearchQuery('is:urgent');
                    setVaultFilter('all');
                }}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] transition-all text-left outline-none w-full"
            >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none transition-all duration-200 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1.5">
                        <ShieldAlert size={10} className="text-red-500" />
                        <p className="text-white font-black uppercase tracking-widest text-[8px]">SOP Protocol</p>
                    </div>
                    Critical procedural protocols for handling high-priority legal documents and state compliance.
                </div>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${operationsSummary?.urgentDocCount > 0 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-white/5 text-gray-500'}`}>
                    <ShieldAlert size={24} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-red-400 transition-colors">Urgent SOPs</p>
                        <ArrowRight size={10} className="text-gray-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                    <p className="text-xl font-light text-white my-0.5">{operationsSummary?.urgentDocCount || 0}</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter leading-tight group-hover:text-gray-400">Critical legal tasks. View in Global Vault.</p>
                </div>
            </button>

            {/* Open Inquiries Card */}
            <button 
                onClick={() => {
                    setActiveSubTab('inbox');
                    setInboxFilter('needs_action');
                    setSelectedThread(null);
                }}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] transition-all text-left outline-none w-full"
            >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none transition-all duration-200 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1.5">
                        <Inbox size={10} className="text-luminous-blue" />
                        <p className="text-luminous-blue font-black uppercase tracking-widest text-[8px]">Active Traffic</p>
                    </div>
                    Pending client communications requiring Registered Agent attention or official response.
                </div>
                

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${operationsSummary?.openThreadCount > 0 ? 'bg-luminous-blue/10 text-luminous-blue' : 'bg-white/5 text-gray-500'}`}>
                    <Inbox size={24} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-luminous-blue transition-colors">Open Inquiries</p>
                        <ArrowRight size={10} className="text-gray-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                    <p className="text-xl font-light text-white my-0.5">{operationsSummary?.openThreadCount || 0}</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter leading-tight group-hover:text-gray-400">Active client threads. View in Global Inbox.</p>
                </div>
            </button>

            {/* Processed Today Card */}
            <button 
                onClick={() => {
                    setActiveSubTab('ledger');
                    setLedgerSearchQuery(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
                    setLedgerFilter('all');
                }}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] transition-all text-left outline-none w-full"
            >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none transition-all duration-200 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1.5">
                        <CheckCircle2 size={10} className="text-emerald-400" />
                        <p className="text-emerald-400 font-black uppercase tracking-widest text-[8px]">Daily Audit</p>
                    </div>
                    Real-time log of all secure operations performed within the current 24-hour cycle.
                </div>

                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <CheckCircle2 size={24} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-emerald-400 transition-colors">Processed Today</p>
                        <ArrowRight size={10} className="text-gray-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                    <p className="text-xl font-light text-white my-0.5">{operationsSummary?.processedTodayCount || 0}</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter leading-tight group-hover:text-gray-400">Completed operations. View in System Ledger.</p>
                </div>
            </button>

            {/* Total Vault Card */}
            <button 
                onClick={() => {
                    setActiveSubTab('vault');
                    setVaultSearchQuery('');
                    setVaultFilter('all');
                }}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.02] transition-all text-left outline-none w-full"
            >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 p-2 bg-[#0a0a0c] border border-white/10 rounded-xl text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none transition-all duration-200 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1.5">
                        <FileBox size={10} className="text-white" />
                        <p className="text-white font-black uppercase tracking-widest text-[8px]">Fleet Registry</p>
                    </div>
                    Complete encrypted repository containing all historical documents and high-value legal filings.
                </div>

                <div className="w-12 h-12 rounded-xl bg-white/5 text-gray-500 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                    <FileBox size={24} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Total Vault</p>
                        <ArrowRight size={10} className="text-gray-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                    <p className="text-xl font-light text-white my-0.5">{operationsSummary?.totalVaultCount || 0}</p>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter leading-tight group-hover:text-gray-400">All entity documents. View in Global Vault.</p>
                </div>
            </button>
        </div>
    );

    const renderLedger = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h3 className="text-xl font-light text-white tracking-tight">System Ledger</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Immutable audit trail of fleet operations ({filteredLedgerLogs.length})</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search Component */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input 
                            type="text"
                            value={ledgerSearchQuery}
                            onChange={(e) => setLedgerSearchQuery(e.target.value)}
                            placeholder="Search action, email, LLC, or client..."
                            className="w-full bg-white/5 border border-white/10 focus:border-purple-500/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition-all shadow-inner shadow-black/20"
                        />
                        {ledgerSearchQuery && (
                            <button 
                                onClick={() => setLedgerSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Filter Segment */}
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0 shadow-inner shadow-black/40">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'user', label: 'Users' },
                            { id: 'system', label: 'System' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setLedgerFilter(f.id)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${ledgerFilter === f.id ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-[#121214]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-2xl">
                {filteredLedgerLogs.map(log => (
                    <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] gap-4 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${log.actor_type === 'USER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                {log.actor_type === 'USER' ? <User size={16} /> : <Cpu size={16} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {log.document_id ? (
                                            <button 
                                                onClick={() => { 
                                                    setActiveSubTab('vault'); 
                                                    setVaultSearchQuery(log.document_id); 
                                                }}
                                                className="text-sm text-white font-medium hover:text-purple-400 group-hover:text-purple-400 transition-colors uppercase tracking-tight shrink-0 underline decoration-purple-500/0 hover:decoration-purple-500/30"
                                            >
                                                {log.action}
                                            </button>
                                        ) : (
                                            <p className="text-sm text-white font-medium group-hover:text-purple-400 transition-colors uppercase tracking-tight shrink-0">{log.action}</p>
                                        )}
                                        {log.document_id && (
                                            <>
                                                <span className="text-white/20 text-[10px]">•</span>
                                                {(() => {
                                                    const doc = globalDocuments?.find(d => d.id === log.document_id);
                                                    const filename = log.metadata?.filename || doc?.title || 'Unknown Document';
                                                    return (
                                                        <button 
                                                            onClick={() => doc?.download_url && window.open(doc.download_url, '_blank')}
                                                            className={`text-[11px] font-bold tracking-tight transition-all truncate max-w-[200px] ${doc?.download_url ? 'text-luminous-blue hover:text-white hover:underline decoration-luminous-blue/30' : 'text-gray-500 cursor-not-allowed'}`}
                                                            title={filename}
                                                        >
                                                            {filename}
                                                        </button>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase tracking-widest border shrink-0 ${log.outcome === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                                        {log.outcome}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{log.actor_email} • {log.ip_address || 'Internal'}</p>
                            </div>
                        </div>
                        <div className="text-right flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Target:</span>
                                {log.llc_id && llcMap[log.llc_id] ? (
                                    <div className="flex flex-col items-end">
                                        <button 
                                            onClick={() => { 
                                                setActiveSubTab('vault'); 
                                                setVaultSearchQuery(llcMap[log.llc_id].llc_name); 
                                                setVaultFilter('llc');
                                            }}
                                            className="text-[9px] text-purple-400 font-black uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            {llcMap[log.llc_id].llc_name}
                                        </button>
                                        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">({clientMap[log.user_id]?.name || 'Direct'})</span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => { 
                                            setActiveSubTab('vault'); 
                                            setVaultSearchQuery(clientMap[log.user_id]?.name || ''); 
                                            setVaultFilter('individual');
                                        }}
                                        className="text-[9px] text-purple-400 font-black uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        {clientMap[log.user_id]?.name || log.user_id.split('-')[0]}
                                    </button>
                                )}
                            </div>
                            {log.document_id && (
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const doc = globalDocuments?.find(d => d.id === log.document_id);
                                        if (doc?.download_url) {
                                            return (
                                                <button 
                                                    onClick={() => window.open(doc.download_url, '_blank')}
                                                    className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded text-[8px] font-black uppercase text-purple-400 hover:text-white transition-all flex items-center gap-1"
                                                >
                                                    <Eye size={10} /> View Source
                                                </button>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <button 
                                        onClick={() => { 
                                            setActiveSubTab('vault'); 
                                            setVaultSearchQuery(log.document_id); 
                                        }}
                                        className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[8px] font-black uppercase text-gray-400 hover:text-white transition-all"
                                    >
                                        Jump to Context
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                {filteredLedgerLogs.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
                            <Search size={32} />
                        </div>
                        <h4 className="text-white font-medium">No Logs Found</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 max-w-[200px]">Adjust your search or actor filters to locate audit records.</p>
                        {(ledgerSearchQuery || ledgerFilter !== 'all') && (
                            <button 
                                onClick={() => { setLedgerSearchQuery(''); setLedgerFilter('all'); }} 
                                className="mt-6 text-[10px] text-purple-500 font-black uppercase tracking-widest hover:text-white transition-colors border-b border-purple-500/30"
                            >
                                Reset Ledger Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderGlobalVault = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h3 className="text-xl font-light text-white tracking-tight">Global File Registry</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Cross-entity secure documents ({filteredVaultDocs.length})</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search Component */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input 
                            type="text"
                            value={vaultSearchQuery}
                            onChange={(e) => setVaultSearchQuery(e.target.value)}
                            placeholder="Search title, LLC, or owner..."
                            className="w-full bg-white/5 border border-white/10 focus:border-luminous-blue/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition-all shadow-inner shadow-black/20"
                        />
                        {vaultSearchQuery && (
                            <button 
                                onClick={() => setVaultSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Filter Segment */}
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0 shadow-inner shadow-black/40">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'llc', label: 'LLCs' },
                            { id: 'individual', label: 'Direct' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setVaultFilter(f.id)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${vaultFilter === f.id ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="bg-[#121214]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-2xl">
                {filteredVaultDocs.map(doc => {
                    const client = clientMap[doc.user_id];
                    const llc = llcDirectory?.find(l => l.id === doc.llc_id);
                    
                    // Derive RESENT status from audit ledger
                    const isResent = globalAuditLogs?.some(log => 
                        log.document_id === doc.id && 
                        log.action === 'DOCUMENT_RESENT' && 
                        log.outcome === 'SUCCESS'
                    );

                    return (
                        <div key={doc.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] gap-4 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${doc.urgent ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] group-hover:scale-105' : 'bg-white/5 text-gray-500 border-white/10 group-hover:bg-white/10 group-hover:text-white'}`}>
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm text-white font-medium truncate group-hover:text-luminous-blue transition-colors">{doc.title}</h4>
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-[0.1em] border flex items-center gap-1.5 ${doc.type === 'State Requirement (FL)' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                            <div className={`w-1 h-1 rounded-full ${doc.type === 'State Requirement (FL)' ? 'bg-amber-500' : 'bg-gray-500'}`} />
                                            {doc.type}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                            <span className="text-white/40">{client?.name || 'Unknown Client'}</span>
                                            {llc && (
                                                <>
                                                    <span className="opacity-20">|</span>
                                                    <span className="text-luminous-blue/60">{llc.llc_name}</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                             <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                                 <div className="text-right hidden md:block">
                                     <div className="flex flex-col items-end gap-1">
                                         <div className="flex items-center gap-2">
                                             {doc.status?.toUpperCase() === 'FORWARDED' && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Forwarded</span>}
                                             {doc.status?.toUpperCase() === 'FAILED' && <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Failed</span>}
                                              {(doc.status?.toUpperCase() === 'READY' || doc.status?.toUpperCase() === 'FILED') && <span className="text-[9px] font-black uppercase tracking-widest text-luminous-blue bg-luminous-blue/10 px-2 py-0.5 rounded border border-luminous-blue/20">Filed</span>}
                                             {doc.status?.toUpperCase() === 'ARCHIVED' && <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">Archived</span>}
                                             
                                             {isResent && (
                                                 <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                                                     <RefreshCw size={8} className="animate-spin-slow" /> Resent
                                                 </span>
                                             )}
                                             
                                             <RAActionControl doc={doc} />
                                         </div>
                                         <p className="text-[8px] text-white/30 font-bold uppercase tracking-tighter mt-1">{doc.date}</p>
                                     </div>
                                 </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            if (doc.download_url) window.open(doc.download_url, '_blank');
                                            else setToast({ message: 'Document physically expired or pending Sync.', type: 'error' });
                                        }}
                                        className="px-5 py-2.5 bg-white/5 hover:bg-white text-gray-400 hover:text-black border border-white/10 hover:border-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95"
                                    >
                                        <Eye size={12} /> View
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setActiveSubTab('ledger');
                                            setLedgerSearchQuery(doc.id);
                                        }}
                                        className="w-10 h-10 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-purple-400 border border-white/10 rounded-xl flex items-center justify-center transition-all shadow-xl active:scale-95"
                                        title="View Audit History"
                                    >
                                        <Clock size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredVaultDocs.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
                            <FileSearch size={32} />
                        </div>
                        <h4 className="text-white font-medium">No Documents Found</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 max-w-[200px]">Adjust your search or filters to locate entity records.</p>
                        {(vaultSearchQuery || vaultFilter !== 'llc') && (
                            <button 
                                onClick={() => { setVaultSearchQuery(''); setVaultFilter('llc'); }} 
                                className="mt-6 text-[10px] text-luminous-blue font-black uppercase tracking-widest hover:text-white transition-colors border-b border-luminous-blue/30"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) return <div className="p-12 text-center text-gray-500 text-[10px] uppercase font-bold tracking-widest animate-pulse">Synchronizing Nodes...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-light text-white tracking-tight">RA Operations <span className="text-gray-500 font-medium">Global.</span></h2>
                    <p className="text-sm text-gray-400 font-light mt-1">Manage all registered agent interactions across the fleet.</p>
                </div>
            </header>

            <div className="flex gap-4 border-b border-white/10 pb-4">
                {[
                    { id: 'inbox', label: 'Global Inbox', icon: Inbox },
                    { id: 'mail', label: 'Scanner Room', icon: Mail },
                    { id: 'vault', label: 'Global Vault', icon: FileBox },
                    { id: 'ledger', label: 'System Ledger', icon: Search }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveSubTab(tab.id); setSelectedThread(null); }}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${activeSubTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            <div>
                <IntelligenceTray />
                {activeSubTab === 'inbox' && renderInbox()}
                {activeSubTab === 'mail' && renderMailRoom()}
                {activeSubTab === 'vault' && renderGlobalVault()}
                {activeSubTab === 'ledger' && renderLedger()}
            </div>

            {toast && <PremiumToast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

            {viewerExpanded && scannedFile?.previewUrl && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col p-6 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-emerald-500" size={24} />
                            <div>
                                <h3 className="text-xl font-light text-white tracking-tight">{scannedFile.name}</h3>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Enlarged Secure Viewer</p>
                            </div>
                        </div>
                        <button onClick={() => setViewerExpanded(false)} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                            <Minimize2 size={14} /> Close Viewer
                        </button>
                    </div>
                    <div className="flex-1 bg-white rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl flex items-center justify-center">
                        {scannedFile.type?.startsWith('image/') ? (
                            <img src={scannedFile.previewUrl} alt="Preview" className="w-[95%] h-[95%] object-contain" />
                        ) : (
                            <iframe src={scannedFile.previewUrl} className="w-full h-full border-0 bg-white" title="Full Preview" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RaOperationsSector;
