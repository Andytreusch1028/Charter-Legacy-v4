import React from 'react';
import { Settings, Shield, Bell } from 'lucide-react';
import { GlassCard, PremiumToggle } from '../../shared/design-system/UIPrimitives';

/**
 * RaConfigSector
 * Autonomous forwarding and security rules for the RA domain.
 */
const RaConfigSector = ({ config, onUpdateConfig, triggerFireDrill }) => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <header className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    <Settings size={10} /> Forwarding Orchestration
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter">System Configuration.</h3>
                <p className="text-gray-500 font-medium italic">Define how Charter Legacy handles your official state and legal correspondence.</p>
            </header>

            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <GlassCard className="divide-y divide-white/5">
                        <PremiumToggle 
                            value={config.priority_forwarding}
                            onChange={(val) => onUpdateConfig('priority_forwarding', val)}
                            label="DeLand Priority Pass"
                            description="Real-time document scanning & email dispatch within 60 minutes of arrival."
                        />
                        <PremiumToggle 
                            value={config.auto_dispose_marketing}
                            onChange={(val) => onUpdateConfig('auto_dispose_marketing', val)}
                            label="Marketing Filter (Auto-Dispose)"
                            description="Our staff identifies and destroys junk mail/solicitations before they reach your inbox."
                        />
                        <PremiumToggle 
                            value={config.sms_interrupt}
                            onChange={(val) => onUpdateConfig('sms_interrupt', val)}
                            label="Emergency SMS Interrupt"
                            description="Bypass DnD on your phone via secondary carrier for Service of Process alerts."
                        />
                    </GlassCard>

                    <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <Shield size={18} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Protocol Testing</h4>
                        </div>
                        <p className="text-xs text-red-200/60 leading-relaxed font-light">
                            Trigger a "Service of Process" fire drill to verify your SMS and Email notification chain.
                        </p>
                        <button 
                            onClick={triggerFireDrill}
                            className="px-6 py-3 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-500/20"
                        >
                            Trigger Fire Drill
                        </button>
                    </div>
                </div>

                <GlassCard className="p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black uppercase tracking-tighter">Data Broker Shield</h4>
                                <StatusBadge active={config.data_broker_shield} label={config.data_broker_shield ? 'SHIELD ACTIVE' : 'SHIELD DISABLED'} />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Shield size={22} />
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 font-light leading-relaxed">
                            Our agents monitor 40+ major data brokers (Whitepages, Spokeo, etc.) for any public leakage of your home address or RA document numbers.
                        </p>
                        
                        <div className="space-y-4">
                            {[
                                { name: 'Whitepages.com', status: 'Clean' },
                                { name: 'Spokeo Internal', status: 'Blocked' },
                                { name: 'Florida Dept of State', status: 'RA Address Only' }
                            ].map((b, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[11px] font-bold text-gray-500">{b.name}</span>
                                    <span className="text-[10px] font-black text-emerald-500">{b.status}</span>
                                </div>
                            ))}
                        </div>

                        <PremiumToggle 
                            value={config.data_broker_shield}
                            onChange={(val) => onUpdateConfig('data_broker_shield', val)}
                            label="Autonomous Takedown"
                            description="AI agents automatically dispatch cease-and-desist mandates if leakage is detected."
                        />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default RaConfigSector;
