import React, { useState } from 'react';
import {
    Building2, Fingerprint, Landmark,
    CheckCircle2, ArrowRight, Activity, ShieldCheck
} from 'lucide-react';
import ComplianceStatusModal from './ComplianceStatusModal';
import EntityShieldConsole from './EntityShieldConsole';
import PrivacyShieldConsole from './PrivacyShieldConsole';

// ─── Individual Shield Card ───────────────────────────────────────────────────

const ShieldCard = ({ icon: Icon, label, sublabel, status, statusColor, detail, cta, onClick, accentColor = 'blue' }) => {
    const accents = {
        blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   hover: 'hover:bg-blue-500', dot: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' },
        green:  { bg: 'bg-emerald-500/10', text: 'text-emerald-500', hover: 'hover:bg-emerald-500', dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' },
        purple: { bg: 'bg-[#d4af37]/10',  text: 'text-[#d4af37]',  hover: 'hover:bg-[#d4af37]', dot: 'bg-[#d4af37] shadow-[0_0_8px_#d4af37]' },
    };
    const a = accents[accentColor];

    return (
        <div
            onClick={onClick}
            className="group relative bg-[#1c1c1e] border border-white/5 rounded-[24px] p-5 cursor-pointer hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-white/10 transition-all duration-300 hover:scale-[1.02] active:scale-95 overflow-hidden flex flex-col h-[155px]"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"></div>
            
            {/* Top row */}
            <div className="flex items-start justify-between mb-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl ${a.bg} border border-white/5 flex items-center justify-center ${a.text} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${a.dot} animate-pulse`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${a.text}`}>{status}</span>
                </div>
            </div>

            {/* Labels and Detail */}
            <div className="mb-auto relative z-10">
                <div className="flex items-baseline gap-2 mb-0.5">
                    <p className="text-sm font-black text-white leading-tight truncate">{sublabel}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 truncate">{label}</p>
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-snug truncate">{detail}</p>
            </div>

            {/* CTA */}
            <div className={`flex items-center justify-between pt-3 mt-3 border-t border-white/5 relative z-10`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">{cta}</span>
                <ArrowRight size={14} className={`${a.text} group-hover:translate-x-1 transition-transform`} />
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ActiveProtectionTriad = ({
    llcData,
    onOpenRAConsole,
    raAlertCount = 0
}) => {
    const [isEntityShieldOpen, setIsEntityShieldOpen] = useState(false);
    const [isPrivacyShieldOpen, setIsPrivacyShieldOpen] = useState(false);
    const [isComplianceOpen, setIsComplianceOpen] = useState(false);

    const DOCUMENT_NUMBER = llcData?.sunbiz_document_number || 'L24000392044';

    return (
        <>
            <div className="space-y-3">

                {/* ── Card 1: Registered Agent ── */}
                <div className="relative">
                    <ShieldCard
                        icon={Landmark}
                        label="Registered Agent"
                        sublabel="RA Console"
                        status={raAlertCount > 0 ? "Alert" : "Active"}
                        detail={raAlertCount > 0 
                            ? `You have ${raAlertCount} new unread document${raAlertCount > 1 ? 's' : ''}.`
                            : "Mail forwarded · Compliance monitored · Scanned"}
                        cta="Launch Console"
                        accentColor={raAlertCount > 0 ? "purple" : "blue"}
                        onClick={onOpenRAConsole}
                    />
                    {raAlertCount > 0 && (
                        <div className="absolute top-3 right-12 flex items-center gap-1 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full animate-bounce shadow-lg shadow-red-500/40">
                            New Filing
                        </div>
                    )}
                </div>

                {/* ── Card 2: Entity Shield ── */}
                <ShieldCard
                    icon={Building2}
                    label="Business"
                    sublabel="Entity Shield"
                    status="Active"
                    detail="Annual report filed · Good standing · BOI submitted"
                    cta="View Status"
                    accentColor="green"
                    onClick={() => setIsComplianceOpen(true)}
                />

                {/* ── Card 3: Personal Shield ── */}
                <ShieldCard
                    icon={Fingerprint}
                    label="Owner"
                    sublabel="Personal Shield"
                    status="Active"
                    detail="14 brokers removed · Identity suppressed · Alerts on"
                    cta="View Report"
                    accentColor="purple"
                    onClick={() => setIsPrivacyShieldOpen(true)}
                />

            </div>

            {/* ── Modals ── */}
            {isComplianceOpen && (
                <ComplianceStatusModal
                    documentNumber={DOCUMENT_NUMBER}
                    onClose={() => setIsComplianceOpen(false)}
                />
            )}
            {isEntityShieldOpen && (
                <EntityShieldConsole onClose={() => setIsEntityShieldOpen(false)} />
            )}
            {isPrivacyShieldOpen && (
                <PrivacyShieldConsole onClose={() => setIsPrivacyShieldOpen(false)} />
            )}
        </>
    );
};

export default ActiveProtectionTriad;
