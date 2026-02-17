import React, { useState, useEffect } from 'react';
import { 
    Shield, Activity, Eye, AlertTriangle, FileText, Lock, 
    CheckCircle2, RefreshCw, X, Fingerprint, Building2, Landmark, ShieldCheck 
} from 'lucide-react';
import SubscriptionGate from './SubscriptionGate';

const AssetSentryTile = ({ mode = 'MONOLITH', onClick }) => {
    const [status, setStatus] = useState('SECURE'); // 'SECURE' | 'WARNING' | 'CRITICAL'
    const [privacyScore, setPrivacyScore] = useState(98);
    const [lastScan, setLastScan] = useState('Just now');

    // Mock Threat Simulation
    const simulateThreat = (e) => {
        e.stopPropagation();
        setStatus('CRITICAL');
        setPrivacyScore(62);
    };

    const resolveThreat = (e) => {
        e?.stopPropagation();
        setStatus('SECURE');
        setPrivacyScore(98);
    };

    return (
        <SubscriptionGate feature="privacy_shield">
            <div onClick={onClick} className={`
                relative overflow-hidden transition-all duration-1000 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full cursor-pointer
                ${mode === 'MONOLITH' ? `rounded-[56px] p-[1.5px] flex flex-col h-[600px] ${status === 'CRITICAL' ? 'bg-red-500 shadow-[20px_0_80px_rgba(239,68,68,0.3)]' : 'bg-gradient-to-br from-white/10 via-white/5 to-white/10'}` : ''}
                ${mode === 'SWISS' ? 'rounded-[32px] p-8 h-full bg-[#0A0A0B] border border-white/10 flex flex-col justify-between hover:border-white/20' : ''}
                ${mode === 'CUPERTINO' ? 'rounded-[24px] p-8 h-full bg-white/60 backdrop-blur-xl border border-white/40 flex flex-col justify-between hover:bg-white shadow-sm' : ''}
            `}>
                
                {/* MODE: MONOLITH (Original) */}
                {mode === 'MONOLITH' && (
                    <div className={`flex-1 rounded-[55px] p-16 relative overflow-hidden flex flex-col justify-between transition-colors duration-1000 ${
                        status === 'CRITICAL' ? 'bg-[#1A0505]' : 'bg-[#0A0A0B]'
                    }`}>
                        {/* Ambient Glows */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luminous-blue/10 rounded-full blur-[160px] -mr-40 -mt-40 pointer-events-none" />
                        
                        {/* Top Section: Identity */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 text-gray-500 text-[10px] font-black uppercase tracking-[0.6em] mb-16">
                                <div className={`w-2 h-2 rounded-full ${status === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-luminous-blue'}`} />
                                Privacy Shield
                            </div>
                            <h3 className="text-white font-black text-6xl uppercase tracking-tighter leading-[0.8] mb-8">Asset <br/>Sentry.</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[85%]">
                                "Registered Agent & Privacy Defense."
                            </p>
                        </div>

                        {/* Middle Section: Visualization */}
                        <div className="relative z-10 flex-1 flex flex-col justify-center">
                             {status === 'CRITICAL' ? (
                                <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
                                    <h4 className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Interception Alert</h4>
                                    <div className="space-y-4">
                                        <button className="w-full h-20 bg-red-600 hover:bg-red-500 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/40 flex items-center justify-center gap-4 group">
                                            Deploy Mask <Lock size={18} className="group-hover:rotate-12 transition-transform" />
                                        </button>
                                        <button onClick={resolveThreat} className="w-full h-20 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all">
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                             ) : (
                                <div className="flex flex-col gap-8">
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-7xl font-black text-white tracking-tighter">{privacyScore}</span>
                                            <span className="text-xl font-black text-gray-600">%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-luminous-blue transition-all duration-1000 shadow-[0_0_20px_rgba(0,122,255,0.5)]" style={{ width: `${privacyScore}%` }} />
                                        </div>
                                        <p className="text-[10px] text-luminous-blue font-black uppercase tracking-widest pt-2">Safety Score</p>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-4">
                                            <CheckCircle2 size={16} className="text-[#00D084]" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registered Agent Active</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <CheckCircle2 size={16} className="text-[#00D084]" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public Record Hidden</span>
                                        </div>
                                    </div>
                                </div>
                             )}
                        </div>

                        {/* Bottom Section: Controls */}
                        <div className="relative z-10 flex items-center justify-between mt-auto pt-10 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">System Status</span>
                                <span className="text-[10px] font-bold text-gray-400 mt-1">{lastScan}</span>
                            </div>
                            <button onClick={simulateThreat} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/10 transition-all border border-white/5">
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* MODE: SWISS */}
                {mode === 'SWISS' && (
                    <>
                        <div className="relative z-10 flex justify-between items-start">
                             <div>
                                <h3 className="text-3xl font-black text-white tracking-tight mb-2">Registered <br/>Agent.</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#00D084] rounded-full animate-pulse" />
                                    <span className="text-sm font-medium text-[#00D084]">Service Active</span>
                                </div>
                             </div>
                             <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10">
                                <Building2 size={20} />
                             </div>
                        </div>

                        <div className="relative z-10 w-full bg-white/5 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Compliance Status</span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Good Standing</span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-[#00D084]" />
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 font-medium">
                                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#00D084]"/> Mail Fwd</div>
                                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#00D084]"/> SOP Service</div>
                            </div>
                        </div>
                    </>
                )}

                {/* MODE: CUPERTINO */}
                {mode === 'CUPERTINO' && (
                    <>
                        <div className="flex justify-between items-start">
                             <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm group-hover:scale-110 group-hover:bg-green-50 group-hover:text-[#00D084] transition-all duration-300">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="px-3 py-1 bg-white rounded-full border border-gray-100 shadow-sm text-[10px] font-bold uppercase tracking-wider text-[#00D084] flex items-center gap-1">
                                <Activity size={10} /> Live
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-center py-4">
                             <div className="relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="60"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="60"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={377}
                                        strokeDashoffset={377 - (377 * privacyScore) / 100}
                                        className="text-[#00D084] transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{privacyScore}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Score</span>
                                </div>
                             </div>
                        </div>

                        <div>
                            <h3 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight mb-2">Privacy</h3>
                            <p className="text-sm text-slate-500 font-medium">Registered Agent Active</p>
                        </div>
                    </>
                )}

            </div>
        </SubscriptionGate>
    );
};
export default AssetSentryTile;
