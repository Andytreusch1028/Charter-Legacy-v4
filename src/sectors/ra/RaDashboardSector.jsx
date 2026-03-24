import React from 'react';
import { Activity, Shield, CheckCircle2, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { GlassCard, StatusBadge } from '../../shared/design-system/UIPrimitives';

/**
 * RaDashboardSector
 * The primary mission control for the Registered Agent domain.
 */
const RaDashboardSector = ({ documents, onOpenCompliance, onTabChange }) => {
    const RA_ADDRESS = '123 Innovation Way, Ste 400, DeLand, FL 32720';

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <header className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    <Shield size={10} className="text-luminous-blue" /> Status: Active Command
                </div>
                <h2 className="text-5xl md:text-6xl font-light text-white tracking-tight leading-none">
                    Registered Agent <span className="text-gray-500 font-medium">Console.</span>
                </h2>
                <p className="text-sm text-gray-400 font-light leading-relaxed max-w-xl">
                    Charter Legacy is your Florida-licensed Registered Agent. We maintain a physical address so your home never appears on public record.
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                <GlassCard className="p-8 text-white relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-luminous-blue/10 rounded-full blur-[80px] group-hover:bg-luminous-blue/20 transition-all duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue">DeLand Hub Node</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Live</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">Your Registered Address</p>
                            <p className="font-mono text-[15px] text-gray-200 leading-relaxed tracking-wide">{RA_ADDRESS}</p>
                        </div>
                        <div className="pt-5 border-t border-white/5 grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest mb-1.5">Availability</p>
                                <p className="text-[13px] font-medium text-gray-300">Mon–Fri, 9am–5pm ET</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest mb-1.5">State</p>
                                <p className="text-[13px] font-medium text-gray-300">Florida (FL)</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard 
                    onClick={onOpenCompliance}
                    className="group p-8 cursor-pointer relative"
                >
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 transition-all duration-1000" />
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-[16px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <CheckCircle2 size={20} strokeWidth={1.5} />
                            </div>
                            <StatusBadge active={true} />
                        </div>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500 mb-2">Entity Status</p>
                        <p className="text-[17px] font-semibold text-white mb-1 tracking-tight">Good Standing</p>
                        <p className="text-xs text-gray-400 font-light mb-6">Annual report filed · Sunbiz verified</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue group-hover:gap-3 transition-all">
                            View Full Status <ChevronRight size={12} />
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-[#3b2a1a]/40 border border-amber-500/20 backdrop-blur-xl rounded-[28px] flex items-center gap-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                    <div className="w-12 h-12 rounded-[16px] bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <Clock size={20} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 relative z-10">
                        <p className="text-[15px] font-medium text-amber-100 tracking-wide">Annual Report Due: May 1, 2027</p>
                        <p className="text-xs text-amber-400/60 font-light mt-1">Florida Statute 605.0210 — Reminders at 60, 30, and 7 days out.</p>
                    </div>
                    <div className="text-right shrink-0 relative z-10">
                        <p className="text-3xl font-light text-amber-400 tracking-tight">437</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/70">Days Away</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">Recent Mail</h3>
                    <button onClick={() => onTabChange('documents')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue hover:text-white transition-colors flex items-center gap-1.5">
                        View All <ArrowRight size={10} />
                    </button>
                </div>
                {documents.slice(0, 2).map((doc, i) => (
                    <div key={i} className="p-5 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            {doc.urgent ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] shrink-0" />
                            ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-white/20 shrink-0 group-hover:bg-white/40 transition-colors" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-white group-hover:dropdown-glow transition-all">{doc.title}</p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-0.5">{doc.date} • {doc.type}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-700 group-hover:text-white transition-colors" size={16} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RaDashboardSector;
