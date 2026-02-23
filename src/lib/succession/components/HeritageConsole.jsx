import React, { useState, useEffect } from 'react';
import { 
    Shield, ShieldCheck, Users, Lock, Unlock, Eye, 
    FileText, Trash2, Archive, RefreshCw, Key, 
    Fingerprint, AlertCircle, History, FileDown, Brain, X, Plus, Edit2, MapPin
} from 'lucide-react';
import ProtocolWizard from './ProtocolWizard';
import { LegalDocPreview, TrustDocPreview } from './LegalArtifacts';
import { useSuccession } from '../useSuccession';

/**
 * HERITAGE CONSOLE (Library Version)
 * 
 * Refactored to use the centralized state engine via useSuccession.
 */
const HeritageConsole = ({ 
    docs = [], 
    user, 
    onUpload, 
    onDownload, 
    onArchive, 
    onRestore,
    auditLog = [],
    activeProtocolData
}) => {
    const { isUnlocked, unlockVault, lockVault, validatePIN } = useSuccession();
    
    // UI Local State
    const [showWizard, setShowWizard] = useState(false);
    const [protocolMode, setProtocolMode] = useState('will');
    const [viewingDoc, setViewingDoc] = useState(null);
    const [showProtocolSelector, setShowProtocolSelector] = useState(false);
    
    // Vault Security (Simulated Zero-Knowledge)
    const [enteredPIN, setEnteredPIN] = useState('');
    const [showSecurityChallenge, setShowSecurityChallenge] = useState(false);

    // Helpers
    const activeWill = docs?.find(d => d.status === 'active' && d.label.includes('Will'));
    const activeTrust = docs?.find(d => d.status === 'active' && d.label.includes('Trust'));
    
    const handleVaultUnlock = (pin) => {
        if (validatePIN(pin)) {
            setShowSecurityChallenge(false);
            setEnteredPIN('');
        } else {
            setEnteredPIN('');
            alert("Invalid PIN. Access Denied.");
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto pb-24">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1c1c1e] to-black rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 mb-6">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2 italic">Heritage Vault</h2>
                <p className="text-gray-500 font-medium text-xs max-w-lg mx-auto leading-relaxed uppercase tracking-widest">
                    Sovereign Legacy Protection Protocol
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Protocol Focus (2/3 Width) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gradient-to-br from-[#1c1c1e] to-[#0A0A0B] rounded-[3rem] border border-gray-800 border-t-4 border-t-[#d4af37] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-bl-[10rem] pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                {activeTrust ? "Family Living Trust" : activeWill ? "Last Will & Testament" : "Legacy Protocol"}
                            </h3>
                            <p className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                {activeWill || activeTrust ? "Active Protection" : "Protocol Initialization Required"}
                            </p>

                            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-md">
                                {activeWill || activeTrust 
                                    ? "Your legal infrastructure is active. Your family can access these instructions according to your Veto Protocol."
                                    : "You have not yet established a succession plan. Our high-tech scrivener can assist in drafting a Will or Living Trust."}
                            </p>

                            <div className="flex gap-4">
                                {(activeWill || activeTrust) ? (
                                    <>
                                        <button onClick={() => setViewingDoc(activeTrust || activeWill)} className="px-6 py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#d4af37] transition-all flex items-center gap-2">
                                            <Eye size={14} /> View Draft
                                        </button>
                                        <button onClick={() => { setProtocolMode(activeTrust ? 'trust' : 'will'); setShowWizard(true); }} className="px-6 py-3 bg-transparent border border-gray-700 text-gray-400 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                                            <Edit2 size={14} /> Update
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setShowProtocolSelector(true)} className="px-8 py-4 bg-[#d4af37] text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-[#d4af37]/20 flex items-center gap-2">
                                        <Brain size={16} /> Begin Protocol
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vault Access Area */}
                    <div className="bg-[#0A0A0B] border-4 border-double border-gray-900 rounded-[3rem] p-10 shadow-inner relative min-h-[400px]">
                        {!isUnlocked ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                                <div className="w-20 h-20 bg-[#1c1c1e] rounded-full flex items-center justify-center border border-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                                    <Lock size={32} className="text-gray-600" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg uppercase tracking-tight">Vault Locked</h4>
                                    <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Master Identity Required</p>
                                </div>
                                <button 
                                    onClick={() => setShowSecurityChallenge(true)} 
                                    className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
                                >
                                    Unlock with PIN
                                </button>
                            </div>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-[#d4af37] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                        <Unlock size={14} /> Decrypted Storage
                                    </h4>
                                    <button onClick={lockVault} className="text-gray-500 hover:text-white text-[9px] font-bold uppercase tracking-widest">Lock Vault</button>
                                </div>
                                
                                {/* Document List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {docs.length > 0 ? docs.map(doc => (
                                        <div key={doc.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-[#d4af37]/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-[#d4af37]">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-white text-[11px] font-black uppercase tracking-tight">{doc.label}</div>
                                                    <div className="text-gray-500 text-[9px] uppercase tracking-widest">{doc.date}</div>
                                                </div>
                                            </div>
                                            <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                                <FileDown size={14} />
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="col-span-2 text-center py-20 border-2 border-dashed border-gray-800 rounded-[2rem] text-gray-600">
                                            No sovereign documents uploaded.
                                        </div>
                                    )}
                                </div>
                                
                                <button className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:border-[#d4af37] hover:text-[#d4af37] transition-all flex items-center justify-center gap-2">
                                    <Plus size={16} /> Store New Artifact
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats (1/3 Width) */}
                <div className="space-y-8">
                    {/* Security Health Score */}
                    <div className="bg-gradient-to-br from-[#1c1c1e] to-black border border-[#d4af37]/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#d4af37]/5 rounded-full blur-3xl group-hover:bg-[#d4af37]/10 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">Security Health</h4>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500 animate-pulse'}`}>
                                    {isUnlocked ? 'SECURE' : 'LOCKED'}
                                </span>
                            </div>
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-4xl font-black text-white italic">AA+</span>
                                <span className="text-gray-600 text-[10px] font-bold uppercase mb-1">Institutional</span>
                            </div>
                            {/* Simple Progress Bar */}
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mb-6">
                                <div className="bg-gradient-to-r from-[#d4af37] to-white h-full w-[88%] shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                            </div>
                            <p className="text-[9px] text-gray-500 leading-relaxed font-medium uppercase tracking-widest">
                                Your legacy protocol is operating at peak efficiency. Multi-signature nodes are synchronized.
                            </p>
                        </div>
                    </div>

                    {/* Trusted Helpers Card */}
                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <Users size={18} className="text-[#d4af37]" />
                            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Trusted Helpers</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#d4af37]/30 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#d4af37]/10 text-[#d4af37] rounded-lg flex items-center justify-center font-black text-xs">S</div>
                                    <div>
                                        <div className="text-white text-[10px] font-bold uppercase tracking-tight">Sarah (Spouse)</div>
                                        <div className="text-gray-500 text-[8px] uppercase tracking-widest">Master Beneficiary</div>
                                    </div>
                                </div>
                                <ShieldCheck size={14} className="text-green-500 opacity-50" />
                            </div>
                            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-[9px] font-bold uppercase tracking-widest hover:text-white hover:border-[#d4af37]/50 transition-all active:scale-95">
                                <Plus size={10} className="inline mr-1" /> Provision Agent
                            </button>
                        </div>
                    </div>

                    {/* Audit Trail Card */}
                    <div className="bg-[#1c1c1e]/50 border border-gray-800/50 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <History size={18} className="text-gray-500" />
                            <h4 className="text-gray-500 font-bold text-xs uppercase tracking-widest">Audit Trail</h4>
                        </div>
                        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {auditLog.map((log, i) => (
                                <div key={i} className="border-l border-gray-800 pl-4 py-1">
                                    <div className="text-white text-[10px] font-bold uppercase">{log.action}</div>
                                    <div className="text-gray-600 text-[9px] truncate">{log.details}</div>
                                </div>
                            ))}
                            {auditLog.length === 0 && <p className="text-gray-700 text-[9px] uppercase italic">No recent activity.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals & Overlays */}
            {showProtocolSelector && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="max-w-4xl w-full text-center">
                        <h2 className="text-4xl font-black uppercase text-white tracking-tighter mb-4 italic">The Choice of Continuity</h2>
                        <p className="text-gray-500 text-sm max-w-lg mx-auto mb-12 uppercase tracking-widest font-bold">Will or Living Trust?</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div onClick={() => { setProtocolMode('trust'); setShowProtocolSelector(false); setShowWizard(true); }} className="bg-[#1c1c1e] border-2 border-[#d4af37] p-10 rounded-[3rem] cursor-pointer hover:scale-105 transition-all group">
                                <Shield size={48} className="mx-auto text-[#d4af37] mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-black text-white uppercase mb-2">Living Trust Protocol</h3>
                                <p className="text-gray-500 text-[10px] leading-relaxed uppercase tracking-widest">Designed to Avoid Probate & Maintain Privacy</p>
                            </div>
                            <div onClick={() => { setProtocolMode('will'); setShowProtocolSelector(false); setShowWizard(true); }} className="bg-[#0f0f10] border-2 border-gray-800 p-10 rounded-[3rem] cursor-pointer hover:border-white transition-all group">
                                <FileText size={48} className="mx-auto text-gray-500 mb-6 group-hover:text-white transition-colors" />
                                <h3 className="text-xl font-black text-white uppercase mb-2">Heritage Will</h3>
                                <p className="text-gray-500 text-[10px] leading-relaxed uppercase tracking-widest">Traditional Statutory Instructions</p>
                            </div>
                        </div>
                        <button onClick={() => setShowProtocolSelector(false)} className="text-gray-600 hover:text-white uppercase font-black text-[10px] tracking-[0.4em]">Cancel Protocol</button>
                    </div>
                </div>
            )}

            {showWizard && (
                <ProtocolWizard 
                    mode={protocolMode}
                    onClose={() => setShowWizard(false)}
                    onComplete={(data) => {
                        onDownload(data);
                        setShowWizard(false);
                    }}
                    initialData={activeProtocolData}
                />
            )}

            {viewingDoc && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl overflow-y-auto p-8 animate-in zoom-in-95 duration-300">
                    <div className="max-w-2xl mx-auto relative pb-20">
                        <button onClick={() => setViewingDoc(null)} className="fixed top-8 right-8 text-white/50 hover:text-white bg-white/5 p-4 rounded-full backdrop-blur-md border border-white/10 z-[110] transition-all"><X size={32}/></button>
                        {viewingDoc.label.includes('Trust') ? <TrustDocPreview data={activeProtocolData} /> : <LegalDocPreview data={activeProtocolData} />}
                    </div>
                </div>
            )}

            {showSecurityChallenge && (
                <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-[#1c1c1e] border border-[#d4af37]/30 p-10 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl">
                        <Fingerprint size={48} className="mx-auto text-red-500 mb-6" />
                        <h4 className="text-white font-black uppercase text-xl mb-2">Master Identity</h4>
                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-8 font-bold">Enter Heritage PIN</p>
                        
                        <div className="flex justify-center gap-4 mb-8">
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className={`w-12 h-14 bg-black rounded-xl border flex items-center justify-center text-xl font-bold ${enteredPIN.length === i ? 'border-[#d4af37]' : 'border-gray-800 text-white'}`}>
                                    {enteredPIN.length > i ? '•' : ''}
                                </div>
                            ))}
                        </div>
                        
                        {/* Hidden input for PIN entry */}
                        <input 
                            autoFocus
                            type="text"
                            pattern="\d*"
                            maxLength={4}
                            value={enteredPIN}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setEnteredPIN(val);
                                if (val.length === 4) setTimeout(() => handleVaultUnlock(val), 200);
                            }}
                            className="fixed opacity-0 pointer-events-none"
                        />
                        
                        <button onClick={() => setShowSecurityChallenge(false)} className="text-gray-600 hover:text-white uppercase font-black text-[9px] tracking-[0.3em]">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeritageConsole;
