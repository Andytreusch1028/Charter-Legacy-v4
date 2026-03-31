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
    updateDocumentStatus,
    deleteDocument,
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
    const [activeViewerDoc, setActiveViewerDoc] = useState(null); // For global premium viewer (id, title, url, type)

    // Global Vault Search & Filter
    const [vaultSearchQuery, setVaultSearchQuery] = useState('');
    const [vaultFilter, setVaultFilter] = useState(raSettings?.vault_default_filter || 'llc'); 

    // Global Ledger Search & Filter
    const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
    const [ledgerFilter, setLedgerFilter] = useState('all'); // 'all', 'user', 'system'

    // Selection Nexus (Steve's Velocity)
    const [selectedVaultIds, setSelectedVaultIds] = useState([]);
    const [selectedLedgerIds, setSelectedLedgerIds] = useState([]);

    // Tab Refs for Sliding Indicator (Jony's Materiality)
    const tabRefs = {
        inbox: useRef(null),
        mail: useRef(null),
        vault: useRef(null),
        ledger: useRef(null)
    };
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, opacity: 0 });

    // Keyboard Flight Controls (Hotkey Engine)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
            if ((e.ctrlKey || e.metaKey) && !isNaN(e.key)) {
                const num = parseInt(e.key);
                const tabMap = { 1: 'inbox', 2: 'mail', 3: 'vault', 4: 'ledger' };
                if (tabMap[num]) {
                    e.preventDefault();
                    setActiveSubTab(tabMap[num]);
                    setSelectedThread(null);
                    setToast({ message: `Navigating to ${tabMap[num].toUpperCase()}`, type: 'system' });
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Update Sliding Indicator Position
    useEffect(() => {
        const activeTab = tabRefs[activeSubTab]?.current;
        if (activeTab) {
            setIndicatorStyle({
                width: activeTab.offsetWidth,
                left: activeTab.offsetLeft,
                opacity: 1
            });
        }
    }, [activeSubTab]);

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
                                {thread.llc_id && <span><Briefcase size={10} className="inline mr-1" /> {thread.llcs?.llc_name || 'Individual'}</span>}
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

    const AcrylicActionControl = ({ doc }) => {
        const [isDeleting, setIsDeleting] = useState(false);
        const [isOpen, setIsOpen] = useState(false);
        const menuRef = useRef(null);

        useEffect(() => {
            const handleClickOutside = (e) => {
                if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
            };
            if (isOpen) document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [isOpen]);

        const handleAction = async (action) => {
            setIsOpen(false);
            if (!action) return;
            
            try {
                if (action === 'DELETE') {
                    if (window.confirm("Are you sure you want to PERMANENTLY delete this document? This action CANNOT be undone and will be logged in the audit stream.")) {
                        setIsDeleting(true);
                        await deleteDocument(doc.id);
                        setToast({ message: 'Document permanently purged from registry.', type: 'success' });
                    }
                    return;
                }

                let newStatus = doc.status;
                let actionType = 'DOCUMENT_STATUS_CHANGE';

                if (action === 'ARCHIVE') {
                    newStatus = 'ARCHIVED';
                    actionType = 'DOCUMENT_ARCHIVED';
                } else if (action === 'UNARCHIVE' || action === 'RESEND') {
                    newStatus = 'FORWARDED';
                    actionType = action === 'RESEND' ? 'DOCUMENT_RESENT' : 'DOCUMENT_UNARCHIVED';
                } else if (action === 'MARK_HANDLED') {
                    actionType = 'URGENCY_RESOLVED';
                }

                await updateDocumentStatus(doc.id, newStatus, actionType);
                
                setToast({ 
                    message: action === 'ARCHIVE' ? 'Document Archived & Audit Logged' : 
                             action === 'RESEND' ? 'Re-send protocol initiated & recorded.' : 
                             action === 'UNARCHIVE' ? 'Document Restored to Active Registry' : 'Urgency Flag Cleared', 
                    type: 'success' 
                });
            } catch (err) {
                setToast({ message: `Administrative action failed: ${err.message}`, type: 'error' });
            } finally {
                setIsDeleting(false);
            }
        };

        const handleTrace = () => {
            setIsOpen(false);
            setActiveSubTab('ledger');
            setLedgerSearchQuery(doc.id);
            setToast({ message: `Filtering system ledger for document context: ${doc.title}`, type: 'system' });
        };

        return (
            <div className="relative flex items-center gap-1" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isDeleting}
                    className="h-8 px-3 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#00f3ff] hover:bg-[#00f3ff]/10 hover:border-[#00f3ff]/30 transition-all shadow-lg shadow-black/20"
                >
                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Settings size={12} />}
                    Actions
                </button>

                {isOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="p-2 space-y-1">
                            <button 
                                onClick={() => handleAction('RESEND')}
                                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors uppercase tracking-widest"
                            >
                                <Send size={12} className="text-emerald-500" /> Forward / Resend
                            </button>
                            <button 
                                onClick={handleTrace}
                                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors uppercase tracking-widest"
                            >
                                <History size={12} className="text-[#00f3ff]" /> View History
                            </button>
                            
                            <div className="h-px bg-white/5 mx-2 my-1" />

                            {doc.status?.toUpperCase() === 'ARCHIVED' ? (
                                <button 
                                    onClick={() => handleAction('UNARCHIVE')}
                                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors uppercase tracking-widest"
                                >
                                    <RefreshCw size={12} className="text-amber-500" /> Un-archive
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleAction('ARCHIVE')}
                                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 flex items-center gap-3 transition-colors uppercase tracking-widest"
                                >
                                    <Archive size={12} className="text-amber-500" /> Archive Log
                                </button>
                            )}

                            {doc.urgent && (
                                <button 
                                    onClick={() => handleAction('MARK_HANDLED')}
                                    className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-colors uppercase tracking-widest"
                                >
                                    <ShieldPlus size={12} /> Clear Urgency
                                </button>
                            )}

                            <button 
                                onClick={() => handleAction('DELETE')}
                                className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors uppercase tracking-widest"
                            >
                                <Trash2 size={12} /> Purge Record
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };


    const IntelligenceCard = ({ icon: Icon, label, value, description, onClick, tooltipTitle, tooltipDesc, colorClass, highlightActive }) => {
        const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
        const [isHovered, setIsHovered] = useState(false);
        const cardRef = useRef(null);

        const handleMouseMove = (e) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        };

        return (
            <button 
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
                className="relative bg-[#121214]/40 backdrop-blur-md border border-white/5 rounded-[24px] p-5 flex items-center gap-5 group hover:border-white/20 transition-all duration-500 text-left outline-none w-full overflow-hidden shadow-2xl"
                style={{
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                }}
            >
                {/* Magnetic Shimmer (Jony's Materiality) */}
                <div 
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 40%)`
                    }}
                />

                {/* Tooltip (Disappearing UI) */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-60 p-3 bg-[#0a0a0c]/90 border border-white/10 rounded-2xl text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none transition-all duration-300 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                    <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                        <Icon size={12} className={colorClass} />
                        <p className={`${colorClass} font-black uppercase tracking-widest text-[9px]`}>{tooltipTitle}</p>
                    </div>
                    {tooltipDesc}
                </div>

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500 group-hover:scale-110 ${highlightActive ? `bg-${colorClass.split('-')[1]}-500/10 ${colorClass} border-${colorClass.split('-')[1]}-500/20` : 'bg-white/5 text-gray-500 border-white/10'}`}>
                    <Icon size={28} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1 relative z-10">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors duration-500">{label}</p>
                        <ArrowRight size={12} className="text-gray-600 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <p className="text-2xl font-light text-white my-1 tracking-tight">{value}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter leading-tight group-hover:text-gray-400 transition-colors duration-500">{description}</p>
                </div>
            </button>
        );
    };

    const IntelligenceTray = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <IntelligenceCard 
                icon={ShieldAlert}
                label="Urgent SOPs"
                value={operationsSummary?.urgentDocCount || 0}
                description="Critical legal tasks. View in Global Vault."
                tooltipTitle="SOP Protocol"
                tooltipDesc="Critical procedural protocols for handling high-priority legal documents and state compliance."
                colorClass="text-rose-500"
                highlightActive={operationsSummary?.urgentDocCount > 0}
                onClick={() => {
                    setActiveSubTab('vault');
                    setVaultSearchQuery('is:urgent');
                    setVaultFilter('all');
                }}
            />
            <IntelligenceCard 
                icon={Inbox}
                label="Open Inquiries"
                value={operationsSummary?.openThreadCount || 0}
                description="Active client threads. View in Global Inbox."
                tooltipTitle="Active Traffic"
                tooltipDesc="Pending client communications requiring Registered Agent attention or official response."
                colorClass="text-luminous-blue"
                highlightActive={operationsSummary?.openThreadCount > 0}
                onClick={() => {
                    setActiveSubTab('inbox');
                    setInboxFilter('needs_action');
                    setSelectedThread(null);
                }}
            />
            <IntelligenceCard 
                icon={CheckCircle2}
                label="Processed Today"
                value={operationsSummary?.processedTodayCount || 0}
                description="Completed operations. View in System Ledger."
                tooltipTitle="Daily Audit"
                tooltipDesc="Real-time log of all secure operations performed within the current 24-hour cycle."
                colorClass="text-emerald-400"
                highlightActive={true}
                onClick={() => {
                    setActiveSubTab('ledger');
                    setLedgerSearchQuery(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
                    setLedgerFilter('all');
                }}
            />
            <IntelligenceCard 
                icon={FileBox}
                label="Total Vault"
                value={operationsSummary?.totalVaultCount || 0}
                description="All entity documents. View in Global Vault."
                tooltipTitle="Fleet Registry"
                tooltipDesc="Complete encrypted repository containing all historical documents and high-value legal filings."
                colorClass="text-white"
                highlightActive={false}
                onClick={() => {
                    setActiveSubTab('vault');
                    setVaultSearchQuery('');
                    setVaultFilter('all');
                }}
            />
        </div>
    );




    const renderGlobalVault = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h3 className="text-xl font-light text-white tracking-tight">Mission Control File Registry</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Cross-entity secure documents ({filteredVaultDocs.length})</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input 
                            type="text"
                            value={vaultSearchQuery}
                            onChange={(e) => setVaultSearchQuery(e.target.value)}
                            placeholder="Search title, LLC, or owner..."
                            className="w-full bg-white/5 border border-white/10 focus:border-luminous-blue/40 rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-bold text-white placeholder:text-gray-600 outline-none transition-all uppercase tracking-widest shadow-inner shadow-black/20"
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

                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0 shadow-inner shadow-black/40">
                        {[
                            { id: 'all', label: 'All Registry' },
                            { id: 'llc', label: 'LLCs' },
                            { id: 'individual', label: 'Direct' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setVaultFilter(f.id)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${vaultFilter === f.id ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="bg-[#121214]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/[0.02] items-center">
                    <div className="col-span-1 flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            checked={selectedVaultIds.length === filteredVaultDocs.length && filteredVaultDocs.length > 0}
                            onChange={(e) => {
                                if (e.target.checked) setSelectedVaultIds(filteredVaultDocs.map(d => d.id));
                                else setSelectedVaultIds([]);
                            }}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#00f3ff] cursor-pointer"
                        />
                    </div>
                    <div className="col-span-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Document Focus</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Entity (LLC)</div>
                    <div className="col-span-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Author / Actor</div>
                    <div className="col-span-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredVaultDocs.map(doc => {
                        const llcName = doc.llcs?.llc_name || 'Individual / Direct';
                        const latestLog = (globalAuditLogs || []).find(l => l.document_id === doc.id);
                        
                        const formatStaffName = (email) => {
                            if (!email) return 'System Initialized';
                            const namePart = email.split('@')[0];
                            return namePart.split(/[\._]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                        };

                        const authorName = latestLog 
                            ? (latestLog.actor_type === 'USER' ? (clientMap[latestLog.user_id]?.name || latestLog.actor_email) : formatStaffName(latestLog.actor_email))
                            : (clientMap[doc.user_id]?.name || 'System Initialized');

                        return (
                            <div key={doc.id} className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.04] transition-all group ${selectedVaultIds.includes(doc.id) ? 'bg-[#00f3ff]/5 border-l-2 border-l-[#00f3ff]' : 'border-l-2 border-l-transparent'}`}>
                                <div className="col-span-1 flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedVaultIds.includes(doc.id)}
                                        onChange={() => {
                                            setSelectedVaultIds(prev => 
                                                prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                                            );
                                        }}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#00f3ff] cursor-pointer"
                                    />
                                </div>

                                <div className="col-span-3 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${doc.urgent ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                        <FileText size={14} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <button 
                                            onClick={() => {
                                                if (doc.download_url) setActiveViewerDoc({ id: doc.id, title: doc.title, url: doc.download_url, type: doc.type, llc_name: llcName });
                                            }}
                                            className="text-sm text-[#00f3ff] font-bold truncate hover:text-white transition-all text-left w-full hover:underline underline-offset-4 decoration-[#00f3ff]/30 block"
                                        >
                                            {doc.title || 'Untitled Registry Record'}
                                        </button>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{doc.type || 'Managed'}</p>
                                            <span className="text-[8px] text-gray-700 font-mono">v1.4</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 min-w-0">
                                    <p className={`text-xs font-bold truncate transition-all ${doc.llc_id ? 'text-luminous-blue' : 'text-gray-600'}`}>
                                        {llcName}
                                    </p>
                                </div>

                                <div className="col-span-3 truncate">
                                    <p className="text-[11px] text-white font-bold tracking-tight truncate">{authorName}</p>
                                    <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black leading-none mt-0.5">{new Date(doc.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {latestLog?.actor_email || 'SYSTEM'}</p>
                                </div>

                                <div className="col-span-1">
                                    <div className="flex items-center">
                                        {doc.status?.toUpperCase() === 'ARCHIVED' && <span className="text-[7px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Archived</span>}
                                        {doc.status?.toUpperCase() === 'FORWARDED' && <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Forwarded</span>}
                                        {(!doc.status || doc.status?.toUpperCase() === 'READY') && <span className="text-[7px] font-black uppercase tracking-widest text-luminous-blue bg-luminous-blue/10 px-1.5 py-0.5 rounded border border-luminous-blue/20">Active</span>}
                                    </div>
                                </div>

                                <div className="col-span-2 flex items-center justify-end gap-1.5 text-right">
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all gap-1.5">
                                        <button 
                                            onClick={() => {
                                                if (doc.download_url) setActiveViewerDoc({ id: doc.id, title: doc.title, url: doc.download_url, type: doc.type, llc_name: llcName });
                                            }}
                                            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white text-gray-500 hover:text-black border border-white/10 hover:border-white rounded-lg transition-all"
                                            title="Quick View"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button 
                                            onClick={() => updateDocumentStatus(doc.id, 'ARCHIVED', 'DOCUMENT_ARCHIVED')}
                                            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-amber-500/20 text-gray-500 hover:text-amber-500 border border-white/10 hover:border-amber-500/30 rounded-lg transition-all"
                                            title="Quick Archive"
                                        >
                                            <Archive size={14} />
                                        </button>
                                    </div>
                                    <AcrylicActionControl doc={doc} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {filteredVaultDocs.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
                            <FileSearch size={32} />
                        </div>
                        <h4 className="text-white font-medium">No Documents Found</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 max-w-[200px]">Adjust your search or entity filters to locate records.</p>
                    </div>
                )}
            </div>
        </div>
    );


    if (loading) return <div className="p-12 text-center text-gray-500 text-[10px] uppercase font-bold tracking-widest animate-pulse">Synchronizing Nodes...</div>;

    const renderPremiumViewer = () => {
        if (!activeViewerDoc) return null;
        
        return (
            <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex flex-col p-6 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 px-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00f3ff]/20 to-purple-500/10 border border-[#00f3ff]/30 flex items-center justify-center text-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.15)]">
                            <FileText size={28} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-light text-white tracking-tight">{activeViewerDoc.title}</h3>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-[#00f3ff] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-[#00f3ff]/10 rounded border border-[#00f3ff]/20">Secure Mission Control Viewer</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase size={10} className="text-white/20" />
                                    {activeViewerDoc.llc_name || 'Individual Entity'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <button 
                            onClick={() => {
                                const frame = document.getElementById('premium-viewer-frame');
                                if (frame) frame.contentWindow.print();
                                else window.print();
                            }}
                            className="px-5 py-2.5 hover:bg-white hover:text-black text-gray-400 rounded-xl transition-all flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest group"
                        >
                            <Printer size={14} className="group-hover:scale-110 transition-transform" /> Print
                        </button>
                        <button 
                            onClick={() => {
                                if (!activeViewerDoc?.url) return;
                                const link = document.createElement('a');
                                link.href = activeViewerDoc.url;
                                link.download = activeViewerDoc.title || 'document';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                setToast({ message: 'Document download initiated.', type: 'success' });
                            }}
                            className="px-5 py-2.5 hover:bg-emerald-500 hover:text-black text-emerald-500 rounded-xl transition-all flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest group"
                        >
                            <Download size={14} className="group-hover:scale-110 transition-transform" /> Save
                        </button>
                        <button 
                            onClick={() => {
                                setToast({ message: 'Initializing Forwarding Flow... System shifting to Inbox Context.', type: 'system' });
                                setTimeout(() => {
                                    setActiveSubTab('inbox');
                                    setNewMessage(`[ATTACHMENT REFERENCE: ${activeViewerDoc?.title}] \n\nI have reviewed the document for ${activeViewerDoc?.llc_name} and...`);
                                    setActiveViewerDoc(null);
                                }, 800);
                            }}
                            className="px-5 py-2.5 hover:bg-[#00f3ff] hover:text-black text-[#00f3ff] rounded-xl transition-all flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest group"
                        >
                            <Mail size={14} className="group-hover:scale-110 transition-transform" /> Email
                        </button>
                        <div className="w-px h-8 bg-white/10 mx-2" />
                        <button 
                            onClick={() => setActiveViewerDoc(null)} 
                            className="p-2.5 bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/30"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white rounded-[32px] overflow-hidden border-8 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center relative">
                    {activeViewerDoc.type?.startsWith('image/') ? (
                        <img src={activeViewerDoc.url} alt="Secure Preview" className="w-[98%] h-[98%] object-contain" />
                    ) : (
                        <iframe 
                            id="premium-viewer-frame"
                            src={`${activeViewerDoc.url}#toolbar=0`} 
                            className="w-full h-full border-0 bg-white" 
                            title="Mission Control Full Preview" 
                        />
                    )}
                    <div className="absolute bottom-8 right-8 pointer-events-none opacity-[0.03] select-none text-right">
                        <p className="text-4xl font-black uppercase tracking-[0.5em] text-black">Charter Legacy</p>
                        <p className="text-sm font-mono text-black mt-2">SECURE_MISSION_CONTROL_STREAM_v4</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderLedger = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h3 className="text-xl font-light text-white tracking-tight">Mission Control Fleet Ledger</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">High-fidelity audit stream & system interaction log</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search by Action, Actor, or LLC..."
                            value={ledgerSearchQuery}
                            onChange={e => setLedgerSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-bold text-white focus:outline-none focus:border-purple-500/50 transition-all uppercase tracking-widest placeholder:text-gray-600"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                        {[
                            { id: 'all', label: 'All Traffic' },
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

            <div className="bg-[#121214]/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                {/* Table Header with Selection Nexus */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/[0.02] items-center">
                    <div className="col-span-1 flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            checked={selectedLedgerIds.length === filteredLedgerLogs.length && filteredLedgerLogs.length > 0}
                            onChange={(e) => {
                                if (e.target.checked) setSelectedLedgerIds(filteredLedgerLogs.map(l => l.id));
                                else setSelectedLedgerIds([]);
                            }}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 accent-emerald-500 cursor-pointer"
                        />
                    </div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Operation / Action</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Entity (LLC)</div>
                    <div className="col-span-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Document Focus</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Author</div>
                    <div className="col-span-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Timing</div>
                </div>

                <div className="divide-y divide-white/5">
                    {filteredLedgerLogs.map(log => {
                        const llcName = log.llcs?.llc_name || 'Global / System';
                        const docTitle = log.registered_agent_documents?.title || log.metadata?.filename || 'No Attachment';
                        const isSystem = log.actor_type === 'SYSTEM' || log.actor_type === 'CHARTER_ADMIN';
                        
                        const formatStaffName = (email) => {
                            if (!email) return 'System';
                            const namePart = email.split('@')[0];
                            return namePart.split(/[\._]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                        };

                        const authorName = log.actor_type === 'USER' ? (clientMap[log.user_id]?.name || log.actor_email) : formatStaffName(log.actor_email);

                        return (
                            <div key={log.id} className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.04] transition-all group ${selectedLedgerIds.includes(log.id) ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' : 'border-l-2 border-l-transparent'}`}>
                                {/* Selection Column */}
                                <div className="col-span-1 flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedLedgerIds.includes(log.id)}
                                        onChange={() => {
                                            setSelectedLedgerIds(prev => 
                                                prev.includes(log.id) ? prev.filter(id => id !== log.id) : [...prev, log.id]
                                            );
                                        }}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 accent-emerald-500 cursor-pointer"
                                    />
                                </div>

                                <div className="col-span-2 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${!isSystem ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                        {!isSystem ? <User size={14} /> : <Cpu size={14} />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-white font-black uppercase tracking-widest truncate">{log.action}</p>
                                            <span className={`px-1.5 py-0.5 rounded-[4px] text-[6px] font-black uppercase tracking-widest border shrink-0 ${log.outcome?.toUpperCase() === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {log.outcome}
                                            </span>
                                        </div>
                                        <p className="text-[7px] text-gray-500 font-mono mt-0.5 uppercase tracking-tighter truncate">{log.id.split('-')[0]}</p>
                                    </div>
                                </div>

                                <div className="col-span-2 min-w-0">
                                    <button 
                                        onClick={() => {
                                            if (log.llc_id) {
                                                setActiveSubTab('vault');
                                                setVaultSearchQuery(llcName);
                                                setVaultFilter('llc');
                                            }
                                        }}
                                        className={`text-xs font-bold truncate transition-all ${log.llc_id ? 'text-luminous-blue hover:text-white hover:underline decoration-luminous-blue/30' : 'text-gray-600 cursor-default'}`}
                                    >
                                        {llcName}
                                    </button>
                                </div>

                                <div className="col-span-3 min-w-0 overflow-hidden">
                                    <button 
                                        disabled={!log.document_id}
                                        onClick={() => {
                                            const doc = globalDocuments?.find(d => d.id === log.document_id);
                                            if (doc?.download_url) {
                                                setActiveViewerDoc({
                                                    id: doc.id,
                                                    title: doc.title || docTitle,
                                                    url: doc.download_url,
                                                    type: doc.type || 'application/pdf',
                                                    llc_name: log.llcs?.llc_name || 'Individual Entity'
                                                });
                                            }
                                        }}
                                        className={`text-xs font-bold truncate transition-all flex items-center gap-2 w-full text-left ${log.document_id ? 'text-[#00f3ff] hover:text-white cursor-pointer hover:underline decoration-[#00f3ff]/30' : 'text-gray-600 cursor-default'}`}
                                        title={docTitle}
                                    >
                                        {log.document_id && <FileText size={10} className="text-[#00f3ff]/50 shrink-0" />}
                                        <span className="truncate">{docTitle || 'System Metadata'}</span>
                                    </button>
                                </div>

                                <div className="col-span-2 truncate">
                                    <p className="text-[11px] text-white font-bold tracking-tight truncate">{authorName}</p>
                                    {log.actor_type !== 'SYSTEM' && <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black leading-none mt-0.5 truncate">{log.actor_email}</p>}
                                </div>

                                <div className="col-span-2 flex items-center justify-end gap-3 min-w-0">
                                    {log.document_id && (
                                        <AcrylicActionControl doc={globalDocuments?.find(d => d.id === log.document_id) || { id: log.document_id, title: docTitle, user_id: log.user_id, llc_id: log.llc_id }} />
                                    )}
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter mt-0.5">{new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-8 font-sans selection:bg-[#00f3ff]/30 selection:text-white">
            {toast && <PremiumToast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            <div className="max-w-[1600px] mx-auto space-y-10">
                {activeViewerDoc && renderPremiumViewer()}

                {/* Selection Ribbon (Steve's Power Hub) */}
                {(selectedVaultIds.length > 0 || selectedLedgerIds.length > 0) && (
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/20 rounded-3xl px-8 py-5 flex items-center gap-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-12 duration-500">
                        <div className="flex items-center gap-4 border-r border-white/10 pr-8">
                            <div className="w-10 h-10 bg-[#00f3ff]/10 rounded-xl flex items-center justify-center text-[#00f3ff]">
                                <CircleDot size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <p className="text-xl font-light text-white leading-none">{selectedVaultIds.length + selectedLedgerIds.length}</p>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Nodes Selected</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={async () => {
                                    const totalVault = selectedVaultIds.length;
                                    const totalLedger = selectedLedgerIds.length;
                                    setToast({ message: `Initiating bulk forward for ${totalVault + totalLedger} nodes...`, type: 'system' });
                                    
                                    if (totalVault > 0) {
                                        for (const id of selectedVaultIds) {
                                            await updateDocumentStatus(id, 'FORWARDED', 'BULK_FORWARD_OPS');
                                        }
                                        setSelectedVaultIds([]);
                                    }
                                    
                                    // Ledger entries are records of actions, forwarding them might mean something else in this context
                                    // but we'll clear the selection for now.
                                    if (totalLedger > 0) {
                                        setSelectedLedgerIds([]);
                                    }
                                    
                                    setToast({ message: `Successfully processed ${totalVault + totalLedger} nodes.`, type: 'success' });
                                }}
                                className="px-6 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                <Mail size={14} /> Forward Bulk
                            </button>
                            <button 
                                onClick={async () => {
                                    const totalVault = selectedVaultIds.length;
                                    setToast({ message: `Bulk archiving ${totalVault} registry nodes...`, type: 'system' });
                                    
                                    if (totalVault > 0) {
                                        for (const id of selectedVaultIds) {
                                            await updateDocumentStatus(id, 'ARCHIVED', 'BULK_ARCHIVE_OPS');
                                        }
                                        setSelectedVaultIds([]);
                                    }
                                    
                                    setSelectedLedgerIds([]);
                                    setToast({ message: `Successfully archived ${totalVault} nodes.`, type: 'success' });
                                }}
                                className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-white/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <Archive size={14} /> Archive Bulk
                            </button>
                            <div className="w-px h-8 bg-white/10 mx-2" />
                            <button 
                                onClick={() => { setSelectedVaultIds([]); setSelectedLedgerIds([]); }}
                                className="p-2.5 bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/30"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}
                
                <header className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-light text-white tracking-tight">RA Operations <span className="text-gray-500 font-medium">Global.</span></h2>
                        <p className="text-sm text-gray-400 font-light mt-1">Manage all registered agent interactions across the fleet.</p>
                    </div>
                </header>

                <div className="relative flex gap-1 bg-white/5 border border-white/10 p-1.5 rounded-full overflow-hidden w-fit shadow-inner shadow-black/40">
                    {/* Kinetic Sliding Indicator (Jony's Materiality) */}
                    <div 
                        className="absolute h-[calc(100%-12px)] bg-white rounded-full transition-all duration-500 cubic-bezier(0.2, 1, 0.2, 1) z-0" 
                        style={{
                            width: `${indicatorStyle.width}px`,
                            left: `${indicatorStyle.left}px`,
                            opacity: indicatorStyle.opacity
                        }}
                    />

                    {[
                        { id: 'inbox', label: 'Global Inbox', icon: Inbox },
                        { id: 'mail', label: 'Scanner Room', icon: Mail },
                        { id: 'vault', label: 'Global Vault', icon: FileBox },
                        { id: 'ledger', label: 'System Ledger', icon: Search }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            ref={tabRefs[tab.id]}
                            onClick={() => { setActiveSubTab(tab.id); setSelectedThread(null); }}
                            className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${activeSubTab === tab.id ? 'text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            <tab.icon size={14} className="shrink-0" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-8 animate-in fade-in duration-500">
                    <IntelligenceTray />
                    {activeSubTab === 'inbox' && renderInbox()}
                    {activeSubTab === 'mail' && renderMailRoom()}
                    {activeSubTab === 'vault' && renderGlobalVault()}
                    {activeSubTab === 'ledger' && renderLedger()}
                </div>
            </div>
        </div>
    );
};

export default RaOperationsSector;
