import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, ChevronRight } from 'lucide-react';

/**
 * GlassCard
 * The foundational layout wrapper for the CharterLegacy "Absolute Depth" aesthetic.
 */
export const GlassCard = ({ children, className = '', onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white/80 backdrop-blur-3xl border border-black/5 rounded-[32px] overflow-hidden transition-all duration-500 hover:border-black/10 ${className}`}
    >
        {children}
    </div>
);

/**
 * StatusBadge
 * High-visibility tracking indicator.
 */
export const StatusBadge = ({ active, label, activeLabel = 'Active', inactiveLabel = 'Inactive' }) => (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${
        active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-red-500 animate-pulse'}`} />
        {label || (active ? activeLabel : inactiveLabel)}
    </div>
);

/**
 * PremiumToggle
 * A tactile, high-fidelity toggle switch.
 */
export const PremiumToggle = ({ value, onChange, label, description }) => (
    <div
        onClick={() => onChange(!value)}
        className="px-6 py-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between group flex-1 transition-colors hover:bg-white/[0.04] gap-4 sm:gap-0"
    >
        <div className="space-y-1 pr-0 sm:pr-6">
            <p className={`text-[15px] tracking-wide transition-colors duration-300 ${value ? 'font-medium text-white' : 'font-light text-gray-300 group-hover:text-white'}`}>{label}</p>
            {description && <p className="text-[12px] sm:text-[13px] text-gray-500 font-light leading-relaxed">{description}</p>}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 px-0 sm:px-2.5">
            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${value ? 'text-white' : 'text-gray-600'}`}>{value ? 'ON' : 'OFF'}</span>
            <div className={`w-[44px] h-[24px] rounded-full relative transition-all duration-500 border ${value ? 'bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-transparent border-white/20 group-hover:border-white/40'}`}>
                <div className={`absolute top-[1.5px] w-[19px] h-[19px] rounded-full transition-all duration-500 ${value ? 'bg-black left-[calc(100%-21.5px)]' : 'bg-gray-500 left-[2px]'}`} />
            </div>
        </div>
    </div>
);

/**
 * PremiumToast
 * Temporary system notification.
 */
export const PremiumToast = ({ message, type, onDismiss }) => {
    useEffect(() => { 
        const t = setTimeout(onDismiss, 4000); 
        return () => clearTimeout(t); 
    }, [onDismiss]);

    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-xl border ${
            type === 'success' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-500/30' : 'bg-red-900/80 text-red-100 border-red-500/30'
        }`}>
            {type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {message}
        </div>
    );
};
/**
 * PrivateSovereignButton
 * A high-fidelity, interactive button for critical corporate actions.
 */
export const SovereignButton = ({ onClick, label, icon: Icon, description, variant = 'primary' }) => (
    <button 
        onClick={onClick}
        className={`group relative p-6 rounded-[28px] border transition-all duration-500 flex items-center gap-6 text-left overflow-hidden ${
            variant === 'primary' 
                ? 'bg-[#0A0A0B] border-white/10 hover:border-emerald-500/30' 
                : 'bg-white/5 border-white/5 hover:border-white/20'
        }`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            variant === 'primary' 
                ? 'bg-white/5 text-gray-400 group-hover:bg-emerald-500 group-hover:text-white' 
                : 'bg-white/5 text-gray-400 group-hover:bg-white group-hover:text-black'
        }`}>
            {Icon && <Icon size={24} strokeWidth={1.5} />}
        </div>
        <div className="flex-1">
            <h4 className="text-[13px] font-black uppercase tracking-widest text-white mb-0.5">{label}</h4>
            <p className="text-[11px] text-gray-500 font-medium leading-tight">{description}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
            <ChevronRight size={18} className="text-gray-400" />
        </div>
    </button>
);

/**
 * ActionBadge
 * A context-aware status indicator for the Empire Grid.
 */
export const ActionBadge = ({ status }) => {
    const configs = {
        'Active': { color: 'emerald', text: 'Operational' },
        'Pending': { color: 'amber', text: 'Processing' },
        'Action Required': { color: 'red', text: 'Maintenance' },
        'Dissolved': { color: 'gray', text: 'Inactive' }
    };
    const c = configs[status] || configs['Active'];
    return (
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
            c.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
            c.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
            c.color === 'red' ? 'bg-red-50 text-red-600 border-red-100' :
            'bg-gray-50 text-gray-600 border-gray-100'
        } whitespace-nowrap`}>
            {c.text}
        </div>
    );
};

