import React, { useState, useEffect, useRef } from 'react';
import { Mail, Search, Paperclip, Send, Inbox, ShieldAlert, ArrowRight, User, Maximize2, Minimize2, FileBox, FileText, Briefcase } from 'lucide-react';
import { useStaffRa } from '../../hooks/useStaffRa';
import { useUplAgent } from '../../hooks/useUplAgent';
import { PremiumToast } from '../../shared/design-system/UIPrimitives';

/**
 * RaOperationsSector
 * The command center for Charter Legacy staff acting as Registered Agents.
 */
const RaOperationsSector = () => {
    const { 
        loading, globalThreads, globalAuditLogs, globalDocuments, clientDirectory, llcDirectory,
        raSettings, threadMessages, fetchStaffRaData, fetchThreadMessages, 
        sendStaffMessage, uploadDocumentToClient, updateRaSettings
    } = useStaffRa();

    const { checkUplCompliance, isChecking: uplChecking, UPL_DISCLAIMER } = useUplAgent();

    const [activeSubTab, setActiveSubTab] = useState('inbox');
    const [selectedThread, setSelectedThread] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [uplCheckState, setUplCheckState] = useState('idle'); // idle, scanning, review
    const [sanitizedMessage, setSanitizedMessage] = useState('');
    const [toast, setToast] = useState(null);
    const messagesEndRef = useRef(null);

    // Upload state
    const [scannerState, setScannerState] = useState('dropzone'); // dropzone, scanning, review
    const [scannedFile, setScannedFile] = useState(null);
    const [viewerExpanded, setViewerExpanded] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadClient, setUploadClient] = useState('');
    const [uploadLlc, setUploadLlc] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadType, setUploadType] = useState('Legal Notice');
    const [uploadUrl, setUploadUrl] = useState('');
    const [uploadUrgent, setUploadUrgent] = useState(false);

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

    const handleRealDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleRealScan(e.dataTransfer.files[0]);
        }
    };

    const handleRealScan = (file) => {
        const generatedId = Math.floor(Math.random() * 90000) + 10000;
        const previewUrl = URL.createObjectURL(file);
        setScannedFile({ 
            name: file.name, 
            url: `https://secure-charter.docs/${file.name}`,
            previewUrl: previewUrl,
            type: file.type,
            rawFile: file
        });
        setScannerState('scanning');

        // Simulate 2s OCR processing
        setTimeout(() => {
            if (clientDirectory.length > 0) {
                // Pick a random client to simulate AI routing
                const randomClient = clientDirectory[Math.floor(Math.random() * clientDirectory.length)];
                setUploadClient(randomClient.user_id);
            }
            
            // Randomize extracted metadata based on actual filename if possible
            const lowerName = file.name.toLowerCase();
            let predictedType = 'State Requirement (FL)';
            let isUrgent = false;
            let predictedTitle = file.name.replace(/\.[^/.]+$/, "");

            if (lowerName.includes('subpoena') || lowerName.includes('claim')) {
                predictedType = 'Legal Notice / Subpoena';
                isUrgent = true;
            } else if (lowerName.includes('irs') || lowerName.includes('tax')) {
                predictedType = 'Internal Revenue Service (IRS)';
                isUrgent = true;
            } else if (lowerName.includes('report') || lowerName.includes('annual')) {
                predictedType = 'State Requirement (FL)';
                isUrgent = false;
            } else {
                predictedType = 'General Entity Mail';
                isUrgent = Math.random() > 0.5;
            }

            setUploadType(predictedType);
            setUploadTitle(predictedTitle);
            setUploadUrgent(isUrgent);

            setUploadUrl(`https://secure-charter.docs/${file.name}`);
            setScannerState('review');
        }, 2000);
    };

    const clientMap = clientDirectory.reduce((acc, client) => {
        acc[client.user_id] = client;
        return acc;
    }, {});

    const llcMap = llcDirectory.reduce((acc, llc) => {
        acc[llc.id] = llc;
        return acc;
    }, {});

    const renderInbox = () => {
        if (selectedThread) {
            const messages = threadMessages[selectedThread.id] || [];
            const clientName = clientMap[selectedThread.user_id]?.name || 'Unknown Client';
            const llcName = selectedThread.llc_id ? llcMap[selectedThread.llc_id]?.llc_name : 'Individual/Direct';
            
            return (
                <div className="flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                        <div>
                            <button onClick={() => { setSelectedThread(null); setUplCheckState('idle'); }} className="text-[10px] font-bold uppercase tracking-widest text-luminous-blue mb-2 hover:text-white transition-colors">← Back to Inbox</button>
                            <h3 className="text-lg font-semibold text-white">{selectedThread.subject}</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                <span className="text-luminous-blue">{llcName}</span>
                                <span className="mx-2 opacity-30">|</span>
                                <span>Client: {clientName}</span>
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
            );
        }

        const filteredThreads = globalThreads.filter(t => t.status !== 'CLOSED');

        return (
            <div className="space-y-4">
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
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center rounded-xl border border-emerald-500/20">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Scanner Room Dropzone</h3>
                            <p className="text-xs text-gray-400">Drag & drop incoming physical mail or process server documents here.</p>
                        </div>
                    </div>

                    <label 
                        className="relative w-full h-64 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleRealDrop}
                    >
                        <input 
                            type="file" 
                            onChange={handleFileSelect} 
                            className="hidden" 
                            accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <Paperclip size={48} strokeWidth={1} className="text-gray-500 group-hover:text-emerald-400 mb-4 transition-colors" />
                        <h4 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">Click or Drag Document to Scan</h4>
                        <p className="text-sm text-gray-500 mt-2 max-w-sm">Charter's OCR engine will automatically extract the target client, document type, and urgency.</p>
                        <p className="text-[10px] text-emerald-500/80 uppercase font-bold tracking-widest mt-6">Secure Zero-Knowledge Ingestion</p>
                    </label>
                </div>
            );
        }

        if (scannerState === 'scanning') {
            return (
                <div className="max-w-3xl h-64 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center bg-black/50 relative overflow-hidden">
                    {/* Premium Laser Beam Animation */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-luminous-blue to-transparent shadow-[0_0_15px_rgba(45,212,191,0.8)] animate-scan-beam z-20" />
                    
                    <div className="relative mb-6">
                        <Search size={40} className="text-luminous-blue animate-pulse absolute opacity-50 blur-sm" />
                        <Search size={40} className="text-luminous-blue relative z-10" />
                    </div>
                    <h4 className="text-lg font-medium text-white mb-2">Analyzing Document Payload...</h4>
                    <p className="text-sm text-gray-400">Charter's OCR engine is extracting vital metadata.</p>
                    
                    <div className="mt-8 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-luminous-blue animate-[scanning_2s_ease-in-out_infinite] w-1/3 rounded-full" />
                    </div>
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

                    {/* Right Panel: Data Onboarding */}
                    <form onSubmit={handleUpload} className="w-1/2 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                        <div className="bg-luminous-blue/10 border border-luminous-blue/20 rounded-lg p-3 flex gap-3 text-luminous-blue text-sm">
                            <Search className="shrink-0 mt-0.5" size={16} />
                            <p><strong>OCR Data Extracted.</strong> Please review the target registry and typing. <span className="font-bold underline text-white">Do not</span> write custom messages to the client.</p>
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

    const renderLedger = () => (
        <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
            {globalAuditLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${log.actor_type === 'USER' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>{log.actor_type}</span>
                        <div>
                            <p className="text-sm text-white font-medium">{log.action}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{log.actor_email} • {log.outcome}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</p>
                        <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">Client: {clientMap[log.user_id]?.name || log.user_id.split('-')[0]}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderGlobalVault = () => (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-light text-white tracking-tight">Global File Registry</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Cross-entity secure documents ({globalDocuments?.length || 0})</p>
                </div>
            </div>
            
            <div className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
                {globalDocuments?.map(doc => {
                    const client = clientMap[doc.user_id];
                    const llc = llcDirectory?.find(l => l.id === doc.llc_id);
                    return (
                        <div key={doc.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${doc.urgent ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                    <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-white font-medium truncate">{doc.title}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${doc.type === 'State Requirement (FL)' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>{doc.type}</span>
                                        <span className="text-[10px] text-gray-500 font-mono">{client?.name || 'Unknown Client'} {llc ? `— ${llc.llc_name}` : ''}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-right hidden md:block">{doc.date}<br/>{doc.status}</p>
                                <button 
                                    onClick={() => {
                                        if (doc.download_url) window.open(doc.download_url, '_blank');
                                        else setToast({ message: 'Document physically expired or pending Sync.', type: 'error' });
                                    }}
                                    className="px-4 py-2 bg-luminous-blue/10 hover:bg-luminous-blue/20 text-luminous-blue border border-luminous-blue/20 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <Search size={12} /> View
                                </button>
                            </div>
                        </div>
                    );
                })}
                {(!globalDocuments || globalDocuments.length === 0) && (
                    <div className="p-12 text-center text-gray-500 text-[10px] uppercase font-bold tracking-widest">No physical documents indexed in system</div>
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
