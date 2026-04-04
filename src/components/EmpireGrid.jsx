import React from 'react';
import { Building2, Shield, Activity, ChevronRight, Plus } from 'lucide-react';
import { GlassCard, ActionBadge } from '../shared/design-system/UIPrimitives';

/**
 * PortfolioGrid
 * A portfolio-level view for multi-entity owners.
 */
const PortfolioGrid = ({ entities = [], onSelect, onAdd, activeId }) => {
    
    // Portfolio Data
    const portfolio = entities.length > 0 ? entities : [
        { id: 1, name: 'Charter Legacy Demo LLC', status: 'Active', health: 100 },
        { id: 2, name: 'Wyoming Holdings LLC', status: 'Active', health: 100 },
        { id: 3, name: 'Heritage Property LLC', status: 'Action Required', health: 60 }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Your Companies</h3>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00D084] hover:text-[#00F0A4] transition-colors"
                >
                    Register New Company <Plus size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolio.map((entity) => (
                    <GlassCard 
                        key={entity.id}
                        onClick={() => onSelect(entity)}
                        variant="glass"
                        className={`p-6 cursor-pointer group ${
                            activeId === entity?.id 
                                ? 'border-[#00D084]/50 shadow-[0_20px_50px_rgba(0,208,132,0.1)] ring-1 ring-[#00D084]/30' 
                                : ''
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                activeId === entity?.id ? 'bg-[#00D084] text-black shadow-[0_0_20px_rgba(0,208,132,0.4)]' : 'bg-white/5 border border-white/5 text-white/50 group-hover:text-white'
                            }`}>
                                <Building2 size={20} strokeWidth={1.5} />
                            </div>
                            <ActionBadge status={entity?.status || 'Active'} />
                        </div>

                        <div className="space-y-1 mb-6">
                            <h4 className="text-sm font-black uppercase tracking-tight text-white/90 truncate pr-4">
                                {entity?.name || 'Pending Company'}
                            </h4>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className={(entity?.health || 100) >= 100 ? 'text-emerald-500' : 'text-amber-500'} />
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                                    {(entity?.health || 100) >= 100 ? 'In Good Standing' : 'Action Needed'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
                            <span className="group-hover:text-white transition-colors font-black">Manage Company</span>
                            <ChevronRight size={14} className="opacity-100 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default PortfolioGrid;
