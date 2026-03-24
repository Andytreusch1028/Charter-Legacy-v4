import React, { useState } from 'react';
import { FileText, Search, Download, Mail, Eye, MoreHorizontal, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../../shared/design-system/UIPrimitives';

/**
 * DocumentRow
 * Individual document entry with progressive action disclosure.
 */
const DocumentRow = ({ doc, isSelected, onSelect, onAction, actionLoading }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`rounded-[24px] border transition-all duration-500 overflow-hidden ${
            isSelected ? 'border-luminous-blue/40 bg-luminous-blue/5 shadow-[0_8px_32px_rgba(0,122,255,0.15)]' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
        }`}>
            <div className="flex items-center gap-4 p-5">
                <button
                    onClick={() => onSelect(doc.id)}
                    className={`w-5 h-5 rounded-[6px] border shrink-0 flex items-center justify-center transition-all duration-300 ${
                        isSelected ? 'bg-luminous-blue border-luminous-blue shadow-[0_0_10px_rgba(0,122,255,0.5)]' : 'border-gray-600 hover:border-luminous-blue bg-black/20'
                    }`}
                >
                    {isSelected && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                </button>

                <div className="relative shrink-0">
                    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center border transition-all duration-500 ${
                        doc.urgent ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-white/5 text-gray-400 border-white/5'
                    }`}>
                        <FileText size={18} strokeWidth={1.5} />
                    </div>
                    {!doc.viewed && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#121214] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    )}
                </div>

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

                <div className="flex items-center gap-2 shrink-0">
                    {doc.urgent && (
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Critical</span>
                    )}
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${
                        doc.type === 'State Requirement' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                        doc.type === 'Legal Notice' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    }`}>
                        {doc.status || (doc.type === 'Legal Notice' ? 'Service of Process' : 'Verified')}
                    </span>
                </div>

                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border ${
                        expanded ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>

            {expanded && (
                <div className="flex items-center gap-3 px-5 py-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 mr-2">Actions</span>
                    <button
                        onClick={() => onAction('download', [doc.id])}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:border-luminous-blue hover:text-luminous-blue hover:bg-luminous-blue/10 transition-all duration-300"
                    >
                        <Download size={12} /> Download
                    </button>
                    <button
                        onClick={() => onAction('email', [doc.id])}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300"
                    >
                        <Mail size={12} /> Email to me
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

/**
 * RaVaultSector
 * Centralized document management for the RA domain.
 */
const RaVaultSector = ({ documents, onAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDocs, setSelectedDocs] = useState(new Set());

    const filteredDocs = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (id) => {
        setSelectedDocs(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Document Vault</h3>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">
                       {documents.length} Total Records • DeLand HUB Sync: Live
                   </p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#121214] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold transition-all focus:border-white/20 outline-none"
                    />
                </div>
            </div>

            {selectedDocs.size > 0 && (
                <div className="flex items-center gap-4 px-6 py-4 bg-luminous-blue/10 border border-luminous-blue/20 rounded-[24px] animate-in zoom-in-95 duration-300">
                    <span className="text-[10px] font-black uppercase tracking-widest text-luminous-blue">
                        {selectedDocs.size} Documents Selected
                    </span>
                    <div className="flex-1" />
                    <button 
                        onClick={() => onAction('zip_download', Array.from(selectedDocs))}
                        className="px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                    >
                        Export ZIP
                    </button>
                    <button 
                        onClick={() => setSelectedDocs(new Set())}
                        className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                    >
                        Clear
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {filteredDocs.map(doc => (
                    <DocumentRow 
                        key={doc.id}
                        doc={doc}
                        isSelected={selectedDocs.has(doc.id)}
                        onSelect={toggleSelect}
                        onAction={onAction}
                        actionLoading={null}
                    />
                ))}
            </div>
        </div>
    );
};

export default RaVaultSector;
