import React from 'react';
import { Activity, ExternalLink, Database } from 'lucide-react';
import { GlassCard } from '../../shared/design-system/UIPrimitives';

/**
 * OverviewSector
 * The primary dashboard for Staff members.
 */
const OverviewSector = ({ stats }) => {
    const statCards = [
        { label: 'Pending Filings', val: stats.pendingFilings, color: 'text-blue-500' },
        { label: 'Active Privacies', val: stats.activePrivacies, color: 'text-white' },
        { label: 'System Health', val: stats.systemHealth, color: 'text-green-500' },
        { label: 'Emergency Req', val: stats.emergencyRequests, color: 'text-red-500' }
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {statCards.map((s, i) => (
                    <div key={i} className="bg-[#121214] p-8 rounded-[32px] border border-white/5 space-y-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</p>
                        <p className={`text-4xl font-black ${s.color}`}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Matrix & Sunbiz Grid */}
            <div className="grid lg:grid-cols-2 gap-12">
                <GlassCard className="p-10 space-y-8 bg-[#121214]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tighter">SEO Matrix Health</h3>
                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                            View Full Matrix <ExternalLink size={12} />
                        </button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { p: '/llc-formation-fl', h: '98%', s: 'Optimized' },
                            { p: '/anonymous-llc-privacy', h: '84%', s: 'Review Needed' },
                            { p: '/florida-registered-agent', h: '92%', s: 'Optimized' }
                        ].map((page, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                                <span className="text-xs font-bold text-gray-400 font-mono">{page.p}</span>
                                <div className="flex items-center gap-6">
                                    <span className="text-sm font-black">{page.h}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${page.s === 'Optimized' ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {page.s}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="p-10 space-y-8 bg-[#121214]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tighter">Sunbiz Automation</h3>
                        <div className="flex items-center gap-2 py-1 px-3 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 text-[8px] font-black uppercase tracking-widest">
                            <Activity size={10} /> Live Push
                        </div>
                    </div>
                    <div className="flex items-center justify-center h-48 border-2 border-dashed border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all cursor-pointer">
                        <div className="text-center space-y-2">
                            <Database size={32} className="mx-auto text-gray-700 group-hover:text-blue-500 transition-colors" />
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Active Transmission</p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default OverviewSector;
