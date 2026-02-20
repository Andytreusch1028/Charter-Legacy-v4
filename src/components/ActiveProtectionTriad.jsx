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
        blue:   { bg: 'bg-blue-500/10',   text: 'text-blue-500',   hover: 'hover:bg-blue-500', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' },
        green:  { bg: 'bg-emerald-500/10', text: 'text-emerald-500', hover: 'hover:bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' },
        purple: { bg: 'bg-purple-500/10',  text: 'text-purple-500',  hover: 'hover:bg-purple-500', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500 shadow-[0_0_8px_#8b5cf6]' },
    };
    const a = accents[accentColor];

    return (
        <div
            onClick={onClick}
            className="group relative bg-white border border-slate-100 rounded-[20px] p-4 cursor-pointer hover:shadow-lg hover:border-slate-200 transition-all duration-300 hover:-translate-y-0.5"
        >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center ${a.text} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${a.dot}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${a.text}`}>{status}</span>
                </div>
            </div>

            {/* Labels */}
            <div className="mb-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                <p className="text-sm font-black text-slate-900 leading-tight">{sublabel}</p>
            </div>

            {/* Detail line */}
            <p className="text-[10px] text-slate-400 font-medium leading-snug mb-3">{detail}</p>

            {/* CTA */}
            <div className={`flex items-center justify-between pt-2.5 border-t border-slate-100`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-700 transition-colors">{cta}</span>
                <ArrowRight size={12} className={`${a.text} group-hover:translate-x-1 transition-transform`} />
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
