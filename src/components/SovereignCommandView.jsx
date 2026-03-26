import React from 'react';
import { 
    Plus, FileEdit, Trash2, FileCheck, 
    Shield, Activity, Zap, ChevronRight 
} from 'lucide-react';
import StatusRing from './StatusRing';

/**
 * SovereignCommandView (Option 1)
 * 
 * A cockpit-style, action-first dashboard for power users.
 * Minimal information display, maximum action surface.
 * Designed for speed and muscle memory.
 */
const SovereignCommandView = ({ llc, compliance, onAction, onSuccession }) => {
    const actions = [
        {
            id: 'new_entity',
            label: 'Genesis',
            desc: 'Form New Entity',
            icon: Plus,
            color: '#00D084',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            hoverBg: 'hover:bg-emerald-500',
        },
        {
            id: 'amend',
            label: 'Amend',
            desc: 'Update Structure',
            icon: FileEdit,
            color: '#3B82F6',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            hoverBg: 'hover:bg-blue-500',
        },
        {
            id: 'annual_report',
            label: 'Maintain',
            desc: 'File Annual Report',
            icon: FileCheck,
            color: compliance?.healthScore < 100 ? '#FF9500' : '#6B7280',
            bgColor: compliance?.healthScore < 100 ? 'bg-amber-500/10' : 'bg-gray-500/10',
            borderColor: compliance?.healthScore < 100 ? 'border-amber-500/20' : 'border-gray-500/10',
            hoverBg: compliance?.healthScore < 100 ? 'hover:bg-amber-500' : 'hover:bg-gray-500',
            urgent: compliance?.healthScore < 100,
        },
        {
            id: 'dissolve',
            label: 'Dissolve',
            desc: 'Close Business',
            icon: Trash2,
            color: '#EF4444',
            bgColor: 'bg-red-500/5',
            borderColor: 'border-red-500/10',
            hoverBg: 'hover:bg-red-500',
        },
    ];

    return (
        <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            {/* Compact Status Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-6">
                    <StatusRing 
                        percentage={compliance?.healthScore || 100} 
                        color={compliance?.pulseColor || '#00D084'}
                        size={56} strokeWidth={5} 
                        pulse={compliance?.healthScore < 100}
                    >
                        <Zap size={16} style={{ color: compliance?.pulseColor || '#00D084' }} />
                    </StatusRing>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#0A0A0B] leading-none">
                            {llc?.llc_name || 'Sovereign Entity'}
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#00D084] flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-[#00D084] rounded-full animate-pulse" />
                                {llc?.llc_status || 'Active'}
                            </span>
                            <span className="text-gray-200">•</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {compliance?.healthScore || 100}% Health
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onSuccession}
                    className="px-5 py-2.5 bg-[#0A0A0B] text-[#d4af37] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-[#0A0A0B] transition-all shadow-lg"
                >
                    Succession Plan
                </button>
            </div>

            {/* Action Cockpit - The Main Event */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => onAction(action.id)}
                        className={`group relative p-8 rounded-[32px] border ${action.borderColor} ${action.bgColor} ${action.hoverBg} hover:text-white transition-all duration-500 text-center hover:scale-[1.03] hover:shadow-2xl`}
                    >
                        {action.urgent && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                                <div className="bg-amber-500 text-black text-[7px] font-black uppercase px-2.5 py-0.5 rounded-full animate-bounce shadow-lg tracking-widest">
                                    Due
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500" style={{ color: action.color }}>
                                <action.icon size={32} strokeWidth={1.5} className="group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-[#0A0A0B] group-hover:text-white transition-colors">
                                    {action.label}
                                </h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white/70 transition-colors mt-1">
                                    {action.desc}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick Stats Strip */}
            <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 px-5 py-3 bg-[#FAFAFA] rounded-2xl border border-gray-100">
                    <Shield size={14} className="text-[#00D084]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        Privacy Shield: {llc?.privacy_shield_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-[#FAFAFA] rounded-2xl border border-gray-100">
                    <Activity size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {compliance?.daysToDeadline ? `Next Filing: ${compliance.daysToDeadline}d` : 'All Filings Current'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SovereignCommandView;
