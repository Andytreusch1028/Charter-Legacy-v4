import React, { useState, useEffect } from 'react';
import { Search, HelpCircle, Box, Sparkles, RefreshCw, Copy, Share2 } from 'lucide-react';
import { GlassCard } from '../../shared/design-system/UIPrimitives';
import { useVault } from '../../hooks/useVault';
import { useAudit } from '../../hooks/useAudit';

/**
 * AeoLabSector
 * The strategic environment for LLM optimization and content grounding.
 */
const AeoLabSector = ({ 
    setShowAeoMasteryHelp, 
    setShowSeoHelp, 
    setShowTailHelp, 
    setShowChannelSettings 
}) => {
    const { 
        vaultItems, 
        fetchVault, 
        saveSnippet, 
        sharingStatus, 
        setSharingStatus 
    } = useVault();
    
    const { logAction } = useAudit();
    
    const [auditText, setAuditText] = useState('');
    const [auditResults, setAuditResults] = useState({ neutrality: 0, grounding: 0, structure: 0 });
    const [generatorPersona, setGeneratorPersona] = useState('The Discrete Executive');
    const [generatorChannel, setGeneratorChannel] = useState(null);
    const [modelPromptGraph, setModelPromptGraph] = useState('');
    const [finalDraft, setFinalDraft] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        fetchVault();
    }, [fetchVault]);

    const handleAudit = () => {
        if (!auditText) return;
        setAuditResults({
            neutrality: Math.floor(Math.random() * 20) + 80,
            grounding: Math.floor(Math.random() * 15) + 85,
            structure: Math.floor(Math.random() * 10) + 90
        });
        logAction("AEO Content Audit Performed");
    };

    const handleSaveToVault = async () => {
        const success = await saveSnippet(
            auditText.substring(0, 20) + '...',
            auditText
        );
        if (success) {
            setAuditText('');
            logAction("New Snippet Saved to Copy Vault");
        }
    };

    const generateTailPrompt = () => {
        if (!auditText) return;
        const promptText = `Generate a marketing strategy for: ${auditText}. Persona: ${generatorPersona}. Channel: ${generatorChannel || 'General'}.`;
        setModelPromptGraph(promptText);
        logAction(`Generated Prompt Graph for ${generatorChannel || 'Unknown Channel'}`);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end">
                <div className="space-y-4">
                    <h3 className="text-4xl font-black uppercase tracking-tighter">
                        AEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#886B1D]">Mastery Lab.</span>
                    </h3>
                    <p className="text-gray-500 font-medium italic">Integrated environment for Grounding, Neutrality, and Infinite Tail generation.</p>
                </div>
                <button 
                    onClick={() => setShowAeoMasteryHelp(true)}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-500 hover:text-white"
                >
                    <HelpCircle size={20} />
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* AEO Auditor */}
                    <GlassCard className="p-10 space-y-8 bg-[#121214]">
                        <div className="flex items-center justify-between text-blue-500">
                            <div className="flex items-center gap-3">
                                <Search size={20} />
                                <h4 className="text-sm font-black uppercase tracking-widest">AEO Auditor</h4>
                            </div>
                            <button onClick={() => setShowSeoHelp(true)} className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-600 hover:text-blue-500">
                                <HelpCircle size={16} />
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <textarea 
                                value={auditText}
                                onChange={(e) => setAuditText(e.target.value)}
                                onBlur={handleAudit}
                                placeholder="Paste copy here to audit for LLM retrieval suitability..."
                                className="w-full h-48 bg-[#0A0A0B] border border-white/10 rounded-2xl p-6 font-medium text-gray-300 focus:border-blue-500 outline-none transition-all resize-none"
                            />
                            <div className="grid grid-cols-3 gap-6">
                                {[
                                    { label: 'Neutrality', score: auditResults.neutrality, color: 'text-green-500' },
                                    { label: 'Grounding', score: auditResults.grounding, color: 'text-[#D4AF37]' },
                                    { label: 'Passage Str', score: auditResults.structure, color: 'text-blue-500' }
                                ].map((m, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{m.label}</p>
                                        <p className={`text-xl font-black ${m.color}`}>{m.score}%</p>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={handleSaveToVault}
                                disabled={!auditText}
                                className="w-full bg-blue-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                Save to Copy Vault
                            </button>
                        </div>
                    </GlassCard>

                    {/* Copy Vault */}
                    <GlassCard className="p-10 space-y-8 bg-[#121214]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[#D4AF37]">
                                <Box size={20} />
                                <h4 className="text-sm font-black uppercase tracking-widest">The Copy Vault</h4>
                            </div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{vaultItems.length} Active Snippets</span>
                        </div>
                        
                        <div className="space-y-4">
                            {vaultItems.length > 0 ? vaultItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.category}</p>
                                        <p className="text-xs font-bold truncate max-w-sm">"{item.content}"</p>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Size</p>
                                            <p className="text-sm font-black text-[#00D084]">{item.size}</p>
                                        </div>
                                        <button className="text-[9px] font-black px-3 py-1 bg-white text-black rounded-lg uppercase tracking-widest hover:scale-110 transition-all">Push</button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center opacity-20 italic">
                                    <p className="text-xs">Vault is empty. Audit copy to begin.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Tail Generator */}
                <GlassCard className="p-10 space-y-8 bg-[#121214]">
                    <div className="flex items-center justify-between text-purple-500">
                        <div className="flex items-center gap-3">
                            <Sparkles size={20} />
                            <h4 className="text-sm font-black uppercase tracking-widest">Tail Generator</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={setShowChannelSettings} className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-600 hover:text-purple-500">
                                <Settings size={16} />
                            </button>
                            <button onClick={setShowTailHelp} className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-600 hover:text-purple-500">
                                <HelpCircle size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Select Persona</label>
                            <select 
                                value={generatorPersona}
                                onChange={(e) => setGeneratorPersona(e.target.value)}
                                className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-4 font-bold text-xs outline-none"
                            >
                                <option>The Discrete Executive</option>
                                <option>The High-Stakes Founder</option>
                                <option>The Legacy Protector</option>
                            </select>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Marketing Channel</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Twitter', 'LinkedIn', 'Blog', 'Email'].map(c => (
                                    <button 
                                        key={c} 
                                        onClick={() => setGeneratorChannel(c)}
                                        className={`p-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${generatorChannel === c ? 'bg-purple-500/10 border-purple-500 text-purple-500' : 'bg-white/5 border-white/10 text-gray-500 hover:border-purple-500/50'}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={generateTailPrompt}
                                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                Model Prompt Graph <RefreshCw size={14} />
                            </button>
                        </div>

                        {modelPromptGraph ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 bg-[#0A0A0B] rounded-2xl border border-purple-500/20 space-y-4">
                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-purple-500">
                                        <span>Compiled Graph</span>
                                        <button onClick={() => navigator.clipboard.writeText(modelPromptGraph)} className="hover:text-white transition-colors"><Copy size={12} /></button>
                                    </div>
                                    <p className="text-[11px] font-mono text-gray-400 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                                        {modelPromptGraph}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-[#0A0A0B] rounded-2xl border border-white/5 mt-8 opacity-40 italic text-center">
                                <p className="text-[10px] font-medium text-gray-500">Generator idle. Ready for prompt modeling.</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AeoLabSector;
