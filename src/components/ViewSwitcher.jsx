import React from 'react';
import { Zap, Eye, LayoutGrid, RotateCcw } from 'lucide-react';

/**
 * ViewSwitcher
 * A premium segmented control for switching between the 3 dashboard views.
 * Shows the AI-recommended view with a subtle indicator.
 */
const ViewSwitcher = ({ activeView, recommended, isOverridden, onSelect, onReset }) => {
    const views = [
        { id: 'command', label: 'Command', icon: Zap, desc: 'Action-first cockpit' },
        { id: 'situational', label: 'Adaptive', icon: Eye, desc: 'Context-aware intelligence' },
        { id: 'fleet', label: 'Empire', icon: LayoutGrid, desc: 'Portfolio management' },
    ];

    return (
        <div className="flex items-center gap-3">
            <div className="flex bg-[#F0F2F5] rounded-2xl p-1.5 gap-1">
                {views.map((v) => {
                    const isActive = activeView === v.id;
                    const isRecommended = recommended === v.id && !isActive;

                    return (
                        <button
                            key={v.id}
                            onClick={() => onSelect(v.id)}
                            title={`${v.label}: ${v.desc}${recommended === v.id ? ' (Recommended)' : ''}`}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                isActive
                                    ? 'bg-[#0A0A0B] text-white shadow-lg'
                                    : 'text-gray-400 hover:text-[#0A0A0B] hover:bg-white/80'
                            }`}
                        >
                            <v.icon size={14} strokeWidth={2} />
                            <span className="hidden md:inline">{v.label}</span>
                            
                            {/* Recommended indicator */}
                            {isRecommended && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00D084] rounded-full shadow-[0_0_6px_rgba(0,208,132,0.6)]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Reset button (only shows when overridden) */}
            {isOverridden && (
                <button
                    onClick={onReset}
                    title="Reset to AI-recommended view"
                    className="p-2 rounded-xl text-gray-300 hover:text-[#00D084] hover:bg-[#00D084]/10 transition-all"
                >
                    <RotateCcw size={14} />
                </button>
            )}
        </div>
    );
};

export default ViewSwitcher;
