import React from 'react';
import { 
  Plus, FileEdit, Trash2, History, 
  ArrowUpRight, Landmark, Gavel, FileCheck 
} from 'lucide-react';
import { ActionButton, GlassCard } from '../shared/design-system/UIPrimitives';

/**
 * ActionConsole
 * The primary interaction layer for LLC lifecycle management.
 * Context-aware: shows relevant actions based on LLC status.
 */
const ActionConsole = ({ onAction, status = 'Active', health = 100 }) => {
    
    const actions = [
        {
            id: 'new_entity',
            label: 'Form New Company',
            desc: 'Start a new Florida LLC.',
            icon: Plus,
            variant: 'secondary'
        },
        {
            id: 'amend',
            label: 'Update Structure',
            desc: 'Change Owners, Address, or Name.',
            icon: FileEdit,
            variant: 'primary'
        },
        {
            id: 'annual_report',
            label: 'Keep in Good Standing',
            desc: 'File your mandatory yearly update.',
            icon: FileCheck,
            variant: health < 100 ? 'primary' : 'secondary',
            urgent: health < 100
        },
        {
            id: 'dissolve',
            label: 'Close Company',
            desc: 'Legally dissolve this business.',
            icon: Trash2,
            variant: 'secondary'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action) => (
                <div key={action.id} className="relative">
                    {action.urgent && (
                        <div className="absolute -top-2 -right-2 z-10">
                            <div className="bg-emerald-500 text-black text-[8px] font-black uppercase px-2 py-1 rounded-full animate-bounce shadow-lg">
                                Suggested
                            </div>
                        </div>
                    )}
                    <ActionButton 
                        label={action.label}
                        description={action.desc}
                        icon={action.icon}
                        variant={action.variant}
                        onClick={() => onAction(action.id)}
                    />
                </div>
            ))}
            
            {/* Quick Links Card */}
            <GlassCard variant="glass" className="md:col-span-2 p-6 flex flex-col md:row items-center justify-between gap-6 border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                        <Gavel size={18} />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">State Records</h5>
                        <p className="text-xs font-bold text-white/50">View official Florida documents and history.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                        Sunbiz Search <ArrowUpRight size={12} />
                    </button>
                    <button className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                        Filing History <History size={12} />
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default ActionConsole;
