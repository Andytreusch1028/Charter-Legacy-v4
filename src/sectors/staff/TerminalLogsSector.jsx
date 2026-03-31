import React, { useState, useEffect, useMemo } from 'react';
import { Command, RefreshCw, X, FileText, Printer, Download, Mail, Briefcase, Plus, Search, ShieldAlert, Cpu, User, Eye, History, CheckCircle2, Filter, Calendar, Hash, UserCheck, Activity, ChevronDown, ChevronUp, Tag, Globe } from 'lucide-react';
import { GlassCard, PremiumToast } from '../../shared/design-system/UIPrimitives';
import { useAudit } from '../../hooks/useAudit';

/**
 * TerminalLogsSector
 * High-fidelity system monitoring and event streaming with operational metadata.
 */
const TerminalLogsSector = () => {
    const { terminalLogs, fetchLogs } = useAudit();
    const [activeViewerDoc, setActiveViewerDoc] = useState(null);
    const [toast, setToast] = useState(null);

    // Filtering State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        llcId: '',
        userId: '',
        actorEmail: '',
        action: '',
        startDate: '',
        endDate: '',
        limit: 100
    });
    
    // The specific filters that were actually executed
    const [appliedFilters, setAppliedFilters] = useState({
        llcId: '',
        userId: '',
        actorEmail: '',
        action: '',
        startDate: '',
        endDate: '',
        limit: 100
    });

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initial and periodic fetch
    useEffect(() => {
        // Fetch initially with whatever is applied
        fetchLogs(appliedFilters);
        
        const interval = setInterval(() => {
            // Respect the lumping console state: constant pulse with applied filters
            fetchLogs(appliedFilters); 
        }, 10000); // Pulse every 10s to ensure stability during lumping
        
        return () => clearInterval(interval);
    }, [fetchLogs, appliedFilters]); 

    const handleApplyFilters = async () => {
        setIsRefreshing(true);
        setAppliedFilters(filters);
        await fetchLogs(filters);
        setIsRefreshing(false);
        setToast({ message: 'Intelligence Query Executed: Nodes Resynchronized.', type: 'system' });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleApplyFilters();
        if (e.key === 'Escape') {
            handleResetFilters();
            setShowFilters(false);
        }
    };

    const handleResetFilters = () => {
        const reset = { llcId: '', userId: '', actorEmail: '', action: '', startDate: '', endDate: '', limit: 100 };
        setFilters(reset);
        setAppliedFilters(reset);
        fetchLogs(reset);
        setToast({ message: 'Filters Purged. Core Feed Restored.', type: 'system' });
    };

    const renderPremiumViewer = () => {
        if (!activeViewerDoc) return null;
        
        return (
            <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-xl flex flex-col p-6 animate-in fade-in zoom-in duration-300 font-sans">
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {renderPremiumViewer()}
            {toast && <PremiumToast message={toast.message} type={toast.type} onExited={() => setToast(null)} />}

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">System Terminal</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">High-Fidelity Event Stream</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[9px] font-black uppercase tracking-widest shadow-lg 
                        ${showFilters ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/40 shadow-[#00f3ff]/10' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                    >
                        <Filter size={12} /> {showFilters ? 'Hide Lumping Console' : 'Open Intelligence Console'}
                    </button>
                    <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 text-[9px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <RefreshCw size={12} className={`${isRefreshing ? 'animate-spin' : 'animate-spin-slow'}`} /> {isRefreshing ? 'Querying...' : 'Nodes Active'}
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className="bg-[#0a0a0c]/40 backdrop-blur-3xl border-y border-white/[0.03] px-6 py-3 animate-in fade-in slide-in-from-top-2 duration-500 sticky top-0 z-50">
                    <div className="max-w-[1600px] mx-auto flex flex-wrap items-center gap-4">
                        {/* LLC Selector */}
                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-full pl-4 pr-1 py-1 group focus-within:border-[#00f3ff]/30 transition-all">
                            <Briefcase size={12} className="text-gray-500 group-focus-within:text-[#00f3ff]" />
                            <input 
                                type="text"
                                placeholder="LLC Search..."
                                value={filters.llcId}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setFilters({...filters, llcId: e.target.value})}
                                className="bg-transparent border-0 w-32 text-[10px] text-white font-mono placeholder:text-gray-700 outline-none"
                            />
                        </div>

                        {/* Author Selector */}
                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-full pl-4 pr-1 py-1 group focus-within:border-[#00f3ff]/30 transition-all">
                            <UserCheck size={12} className="text-gray-500 group-focus-within:text-[#00f3ff]" />
                            <input 
                                type="text"
                                placeholder="Author..."
                                value={filters.actorEmail}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setFilters({...filters, actorEmail: e.target.value})}
                                className="bg-transparent border-0 w-32 text-[10px] text-white font-mono placeholder:text-gray-700 outline-none"
                            />
                        </div>

                        {/* Action Selector */}
                        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-full px-4 py-1 group focus-within:border-[#00f3ff]/30 transition-all">
                            <Activity size={12} className="text-gray-500 group-focus-within:text-[#00f3ff]" />
                            <select 
                                value={filters.action}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setFilters({...filters, action: e.target.value})}
                                className="bg-transparent border-0 text-[10px] text-white font-mono outline-none cursor-pointer"
                            >
                                <option value="" className="bg-[#0a0a0c]">ALL_ACTIONS</option>
                                <option value="DOCUMENT_UPLOADED" className="bg-[#0a0a0c]">DOC_UPLOAD</option>
                                <option value="DOCUMENT_RESENT" className="bg-[#0a0a0c]">DOC_RESEND</option>
                                <option value="DOCUMENT_ARCHIVED" className="bg-[#0a0a0c]">DOC_ARCHIVE</option>
                                <option value="URGENCY_RESOLVED" className="bg-[#0a0a0c]">SOP_RESOLVED</option>
                            </select>
                        </div>

                        <div className="h-4 w-px bg-white/10 mx-2" />

                        {/* Date Range Inline */}
                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] rounded-full px-4 py-1">
                            <Calendar size={12} className="text-gray-500" />
                            <input 
                                type="date"
                                value={filters.startDate}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                                className="bg-transparent border-0 text-[10px] text-white font-mono outline-none [color-scheme:dark]"
                            />
                            <span className="text-gray-700 font-black">»</span>
                            <input 
                                type="date"
                                value={filters.endDate}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                                className="bg-transparent border-0 text-[10px] text-white font-mono outline-none [color-scheme:dark]"
                            />
                        </div>

                        <div className="flex-1" />

                        {/* Action Group */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleApplyFilters}
                                className="bg-[#00f3ff] hover:bg-white text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <Cpu size={12} /> Execute
                            </button>
                            <button 
                                onClick={handleResetFilters}
                                className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-500 rounded-full transition-all border border-transparent hover:border-rose-500/20"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <GlassCard className="bg-[#050506] border-white/5 p-0 shadow-2xl">
                <div className="bg-[#121214] px-6 py-4 border-b border-white/5 flex items-center gap-4 group">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40 group-hover:bg-red-500/40 transition-colors" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40 group-hover:bg-amber-500/40 transition-colors" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40 group-hover:bg-green-500/40 transition-colors" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">charter_system_audit_x64</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-gray-700">
                        <span className="animate-pulse">●</span> LIVE_NODE_01
                    </div>
                </div>
                
                <div className="p-8 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[700px] min-h-[500px] custom-scrollbar space-y-3 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,243,255,0.02),_transparent)]">
                    {terminalLogs.length > 0 ? terminalLogs.map((log, i) => {
                        const llcName = log.llcs?.llc_name || 'System / Global';
                        const docTitle = log.registered_agent_documents?.title;
                        const actor = log.actor_email?.split('@')[0] || 'Unknown';
                        const isSystem = log.actor_type === 'SYSTEM' || !log.actor_type;

                        return (
                            <div key={i} className="grid grid-cols-[90px_70px_180px_1fr_60px_100px] gap-6 group hover:bg-white/[0.03] -mx-4 px-4 py-1.5 rounded transition-colors items-center whitespace-nowrap border-b border-white/[0.01]">
                                {/* Timestamp */}
                                <span className="text-gray-700 shrink-0 tabular-nums text-[10px]">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                
                                {/* Auth Level */}
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black tracking-widest ${isSystem ? 'text-emerald-500/80' : 'text-blue-500/80'}`}>
                                        {isSystem ? 'SYS' : 'USR'}
                                    </span>
                                    <span className="text-white/5">»</span>
                                </div>

                                {/* Entity Context */}
                                <span className="text-gray-500 font-bold uppercase tracking-tighter truncate text-[10px]" title={llcName}>
                                    {llcName}
                                </span>
                                
                                {/* Content Stream */}
                                <div className="flex items-center gap-3 truncate">
                                    <span className="text-gray-400 font-black uppercase tracking-widest text-[9px] shrink-0 opacity-70">{log.action}:</span>
                                    {docTitle ? (
                                        <button 
                                            onClick={() => {
                                                if (log.registered_agent_documents?.download_url) {
                                                    setActiveViewerDoc({
                                                        id: log.document_id,
                                                        title: docTitle,
                                                        url: log.registered_agent_documents.download_url,
                                                        type: 'application/pdf',
                                                        llc_name: llcName
                                                    });
                                                }
                                            }}
                                            className="text-[#00f3ff] hover:text-white underline decoration-[#00f3ff]/20 hover:decoration-[#00f3ff] transition-all font-bold truncate text-[10px]"
                                        >
                                            {docTitle}
                                        </button>
                                    ) : (
                                        <span className="text-gray-300 truncate text-[10px]" title={log.metadata?.details}>{log.metadata?.details || 'Generic Registry Record'}</span>
                                    )}
                                </div>

                                {/* Status Pulse */}
                                <div className="flex justify-center">
                                    {log.status === 'Success' ? (
                                        <span className="text-emerald-500 font-black text-[9px] tracking-widest">[OK]</span>
                                    ) : (
                                        <span className="text-red-500 font-black text-[9px] tracking-widest">[ERR]</span>
                                    )}
                                </div>

                                {/* Action Actor */}
                                <span className="text-gray-700 italic group-hover:text-gray-500 transition-colors shrink-0 text-right text-[10px]">
                                    — {actor}
                                </span>
                            </div>
                        );
                    }) : (
                        <div className="flex items-center gap-4 text-gray-700 animate-pulse">
                            <span className="animate-spin-slow"><RefreshCw size={12} /></span>
                            <span className="uppercase tracking-[0.2em]">Synchronizing audit nodes... awaiting parity pulse</span>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default TerminalLogsSector;
