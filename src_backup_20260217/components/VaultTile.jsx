import React from 'react';
import { Lock, Activity } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions.jsx';

const VaultTile = ({ onClick, locked, mode = 'MONOLITH' }) => {
    // If we passed locked prop, use it. Otherwise, use hook.
    // In DashboardZenith we pass `locked` but we can also use hook here.
    const { setIsUpgradeModalOpen } = usePermissions();

    // LOCKED STATE (Envy Node)
    if (locked) {
        return (
            <div 
                onClick={() => setIsUpgradeModalOpen(true)}
                className={`
                    relative overflow-hidden group cursor-pointer transition-all shadow-inner w-full
                    ${mode === 'MONOLITH' ? 'p-16 bg-[#0A0A0B] rounded-[56px] border border-white/5 h-[600px] flex flex-col justify-between hover:border-white/10' : ''}
                    ${mode === 'SWISS' ? 'p-8 bg-black rounded-[32px] border border-white/10 h-full flex flex-row items-center justify-between' : ''}
                    ${mode === 'CUPERTINO' ? 'p-8 bg-black/90 backdrop-blur-xl rounded-[24px] border border-white/10 h-full flex flex-col justify-between' : ''}
                `}
            >
                {/* ETCHED MONOLITH TEXTURE (Global) */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* MODE: MONOLITH (Original) */}
                {mode === 'MONOLITH' && (
                    <>
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
                        <div className="relative z-10 opacity-40">
                            <div className="flex items-center gap-4 text-gray-400 text-[10px] font-black uppercase tracking-[0.6em] mb-16">
                                <div className="w-2 h-2 bg-gray-600 rounded-full" />
                                Heritage
                            </div>
                            <h3 className="text-6xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.8]">Legacy <br/>Vault.</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-[90%]">
                                "Secure your Will, Trust, and Beneficiaries."
                            </p>
                        </div>
                        <div className="relative z-10 flex flex-col items-center justify-center gap-6 mt-auto">
                            {/* VAULT DOOR VISUAL */}
                            <div className="w-56 h-56 rounded-full border-[3px] border-white/10 relative flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black/50 overflow-hidden group-hover:border-luminous-gold/30 transition-all duration-700">
                                {/* Rotating Ring 1 */}
                                <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_10s_linear_infinite]" />
                                {/* Rotating Ring 2 (Counter) */}
                                <div className="absolute inset-4 rounded-full border-[2px] border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
                                {/* Inner Circle */}
                                <div className="absolute inset-12 rounded-full border border-white/10 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center shadow-inner">
                                    <div className="w-20 h-20 rounded-full bg-[#0A0A0B] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <Lock size={32} strokeWidth={1.5} className="text-gray-500 group-hover:text-luminous-gold transition-colors duration-500" />
                                    </div>
                                </div>
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-luminous-gold/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            </div>
                            
                            <div className="space-y-2 text-center">
                                <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
                                    Restricted Protocol
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* MODE: SWISS (Horizontal Compact) */}
                {mode === 'SWISS' && (
                    <>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2">Legacy Vault</h3>
                            <p className="text-white/60 font-medium text-sm">The Operating System for Your Legacy</p>
                        </div>
                        
                        {/* MINI VAULT DOOR VISUAL */}
                        <div className="relative z-10 w-24 h-24 rounded-full border-[2px] border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-black/50 overflow-hidden group-hover:border-luminous-gold/30 transition-all duration-700">
                             {/* Rotating Ring 1 */}
                             <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_10s_linear_infinite]" />
                             {/* Rotating Ring 2 (Counter) */}
                             <div className="absolute inset-2 rounded-full border-[1.5px] border-white/5 animate-[spin_15s_linear_infinite_reverse]" />
                             {/* Inner Circle */}
                             <div className="absolute inset-6 rounded-full border border-white/10 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center shadow-inner">
                                 <div className="w-8 h-8 rounded-full bg-[#0A0A0B] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                     <Lock size={14} strokeWidth={1.5} className="text-gray-500 group-hover:text-luminous-gold transition-colors duration-500" />
                                 </div>
                             </div>
                             {/* Glow Effect */}
                             <div className="absolute inset-0 bg-luminous-gold/5 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                    </>
                )}

                 {/* MODE: CUPERTINO (Square Compact) */}
                 {mode === 'CUPERTINO' && (
                    <>
                        <div className="relative z-10 flex justify-between items-start">
                             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white/50 border border-white/5">
                                <Lock size={24} />
                             </div>
                             <div className="px-3 py-1 bg-white/10 rounded-full border border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                Locked
                            </div>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center opacity-20">
                            <Lock size={80} strokeWidth={1} className="text-white" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-white leading-tight tracking-tight mb-2">Inheritance</h3>
                            <p className="text-sm text-gray-400 font-medium">Secure your Will</p>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // ACTIVE STATE
    return (
        <div 
            onClick={onClick}
            className={`
                relative overflow-hidden group cursor-pointer transition-all prism-border w-full
                ${mode === 'MONOLITH' ? 'p-16 bg-luminous-ink text-white rounded-[56px] shadow-[0_80px_160px_-40px_rgba(0,122,255,0.3)] h-[600px] flex flex-col justify-between hover:scale-[1.02]' : ''}
                ${mode === 'SWISS' ? 'p-8 bg-blue-600 text-white rounded-[32px] h-full flex flex-col justify-between hover:bg-blue-700' : ''}
                ${mode === 'CUPERTINO' ? 'p-8 bg-white/80 backdrop-blur-xl border border-white/40 rounded-[24px] h-full flex flex-col justify-between shadow-sm hover:bg-white' : ''}
            `}
        >
                {/* MODE: MONOLITH (Original) */}
            {mode === 'MONOLITH' && (
                <>
                    <div className="absolute top-0 right-0 p-64 bg-gradient-to-br from-luminous-blue/30 to-transparent rounded-full blur-[160px] -mr-32 -mt-32 pointer-events-none group-hover:from-luminous-blue/60 transition-all duration-1000 group-hover:scale-150"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 text-luminous-gold text-[10px] font-black uppercase tracking-[0.6em] mb-16">
                            <div className="w-2 h-2 bg-luminous-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
                            Inheritance
                        </div>
                        <h3 className="text-6xl font-black uppercase tracking-tighter mb-8 leading-[0.8]">Legacy <br/>Vault.</h3>
                        <p className="text-gray-400 text-base font-medium italic leading-relaxed max-w-[85%] opacity-80">
                            "Secure your Will, Trust, and Beneficiaries."
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center justify-between mt-auto pt-10 border-t border-white/10">
                        <div className="font-mono text-5xl font-black tracking-widest text-luminous-gold">
                            364<span className="opacity-20">:</span>23
                        </div>
                        <div className="w-20 h-20 bg-white/10 text-white rounded-[32px] flex items-center justify-center group-hover:bg-luminous-blue transition-all border border-white/10 shadow-2xl">
                            <Lock size={28} strokeWidth={1.5} />
                        </div>
                    </div>
                </>
            )}

             {/* MODE: SWISS */}
             {mode === 'SWISS' && (
                <>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black text-white tracking-tight mb-2">Legacy Vault.</h3>
                        <p className="text-white/60 font-medium text-sm">The Operating System for Your Legacy</p>
                    </div>
                    <div className="relative z-10 flex items-end justify-between">
                         <div className="font-mono text-2xl font-black tracking-widest text-white/40">364:23</div>
                         <Lock size={20} className="text-white" />
                    </div>
                </>
             )}

             {/* MODE: CUPERTINO */}
             {mode === 'CUPERTINO' && (
                <>
                    <div className="flex justify-between items-start">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-[#007AFF] transition-all duration-300">
                            <Lock size={24} />
                        </div>
                        <div className="px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Active
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center items-center py-4">
                        <div className="text-6xl font-black text-slate-900 tracking-tighter">364</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Days Remaining</div>
                    </div>

                    <div>
                        <h3 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight mb-2">Inheritance</h3>
                        <p className="text-sm text-slate-500 font-medium">Secure your Will</p>
                    </div>
                </>
             )}
        </div>
    );
};

export default VaultTile;
