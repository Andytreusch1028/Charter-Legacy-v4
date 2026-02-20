import React, { useState, useEffect } from 'react';
import { 
    Shield, Activity, Eye, AlertTriangle, FileText, Lock, 
    CheckCircle2, RefreshCw, X, Fingerprint, Building2, Landmark, ShieldCheck, ArrowRight
} from 'lucide-react';
import SubscriptionGate from './SubscriptionGate';

const AssetSentryTile = ({ mode = 'MONOLITH', onClick, onOpenBusiness, onOpenPersonal }) => {
    // ... (state remains same)

    // ... (mock functions remain same)

    return (
        <SubscriptionGate feature="privacy_shield">
            <div onClick={onClick} className={`...`}> 
                {/* ... MONOLITH and SWISS remain same ... */}

                {/* MODE: CUPERTINO */}
                {mode === 'CUPERTINO' && (
                    <>
                        <div className="flex justify-between items-start mb-2">
                             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm transition-all duration-300">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="px-2 py-1 bg-white rounded-full border border-gray-100 shadow-sm text-[9px] font-bold uppercase tracking-wider text-[#00D084] flex items-center gap-1">
                                <Activity size={10} /> Live
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                             {/* Business Shield Card */}
                             <div 
                                onClick={(e) => { e.stopPropagation(); onOpenBusiness && onOpenBusiness(); }}
                                className="group/biz relative bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between"
                             >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover/biz:scale-110 transition-transform">
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Business</p>
                                        <p className="text-xs font-bold text-slate-900 leading-none mt-0.5">Entity Shield</p>
                                    </div>
                                </div>
                                <div className="hidden group-hover/biz:block animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[9px] font-bold uppercase">View</div>
                                </div>
                                <div className="group-hover/biz:hidden text-[#00D084]">
                                    <CheckCircle2 size={16} />
                                </div>
                             </div>

                             {/* Personal Shield Card */}
                             <div 
                                onClick={(e) => { e.stopPropagation(); onOpenPersonal && onOpenPersonal(); }}
                                className="group/personal relative bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between"
                             >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-600 shadow-sm group-hover/personal:scale-110 transition-transform">
                                        <Fingerprint size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Owner</p>
                                        <p className="text-xs font-bold text-slate-900 leading-none mt-0.5">Personal Shield</p>
                                    </div>
                                </div>
                                <div className="hidden group-hover/personal:block animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-[9px] font-bold uppercase">View</div>
                                </div>
                                <div className="group-hover/personal:hidden text-[#00D084]">
                                    <CheckCircle2 size={16} />
                                </div>
                             </div>
                             
                             {/* LAUNCH CONSOLE BUTTON */}
                             <div className="pt-2">
                                <button className="w-full bg-[#0A0A0B] text-white py-2 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-luminous-blue transition-colors flex items-center justify-center gap-2 group/btn">
                                    Launch Console <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                             </div>
                        </div>

                        <div className="mt-2">
                            <h3 className="text-sm font-bold text-slate-900 leading-tight tracking-tight mb-0.5">Registered Agent Console</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Status: Command Active</p>
                        </div>
                    </>
                )}
            </div>
        </SubscriptionGate>
    );
};
export default AssetSentryTile;
