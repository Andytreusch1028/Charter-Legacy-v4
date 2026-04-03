import React from 'react';
import { Building2, Shield, Activity, ChevronRight, Plus } from 'lucide-react';
import { GlassCard, ActionBadge } from '../shared/design-system/UIPrimitives';

/**
 * EmpireGrid
 * A portfolio-level view for multi-entity owners.
 */
const EmpireGrid = ({ entities = [], onSelect, onAdd, activeId }) => {
    
    // Fallback for demo
    const fleet = entities.length > 0 ? entities : [
        { id: 1, name: 'Charter Legacy Demo LLC', status: 'Active', health: 100 },
        { id: 2, name: 'Wyoming Holdings LLC', status: 'Active', health: 100 },
        { id: 3, name: 'Heritage Property LLC', status: 'Action Required', health: 60 }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Your Sovereign Fleet</h3>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00D084] hover:text-[#00B074] transition-colors"
                >
                    Add Entity <Plus size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {fleet.map((entity) => (
                    <GlassCard 
                        key={entity.id}
                        onClick={() => onSelect(entity)}
                        className={`p-6 cursor-pointer border transition-all duration-500 hover:scale-[1.02] ${
                            activeId === entity.id 
                                ? 'bg-white border-[#00D084] shadow-[0_20px_40px_rgba(0,208,132,0.15)] border-2' 
                                : 'bg-white/80 border-gray-100 hover:border-gray-200 shadow-sm'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                activeId === entity.id ? 'bg-[#00D084] text-black' : 'bg-black/5 text-[#0A0A0B]/60'
                            }`}>
                                <Building2 size={20} strokeWidth={1.5} />
                            </div>
                            <ActionBadge status={entity.status} />
                        </div>

                        <div className="space-y-1 mb-6">
                            <h4 className="text-sm font-black uppercase tracking-tight text-[#0A0A0B] truncate pr-4">
                                {entity.name}
                            </h4>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className={entity.health >= 100 ? 'text-emerald-500' : 'text-amber-500'} />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    {entity.health}% Health
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-black/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                            <span>Manage Entity</span>
                            <ChevronRight size={14} className="opacity-60" />
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default EmpireGrid;
