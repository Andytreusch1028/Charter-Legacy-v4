import React from 'react';
import { Zap, Eye, LayoutGrid, RotateCcw } from 'lucide-react';

/**
 * ViewSwitcher
 * A premium segmented control for switching between the 3 dashboard views.
 * Shows the AI-recommended view with a subtle indicator.
 */
const ViewSwitcher = ({ activeView, recommended, isOverridden, onSelect, onReset }) => {
    const views = [
        { id: 'command', label: 'Workspace', icon: Zap, desc: 'Detailed business view' },
        { id: 'situational', label: 'Adaptive', icon: Eye, desc: 'Smart context view' },
        { id: 'fleet', label: 'Portfolio', icon: LayoutGrid, desc: 'All companies' },
    ];

    return (
        <div className="flex items-center gap-3">
            <div className="flex bg-white/5 rounded-2xl p-1.5 gap-1 border border-white/5">
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
                                    ? 'bg-white text-black shadow-xl ring-1 ring-white/10'
                                    : 'text-white/30 hover:text-white hover:bg-white/10'
                            } text-[9px]`}
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
                    className="p-2 rounded-xl text-gray-500 hover:text-[#00D084] hover:bg-[#00D084]/10 transition-all"
                >
                    <RotateCcw size={14} />
                </button>
            )}
        </div>
    );
};

export default ViewSwitcher;
