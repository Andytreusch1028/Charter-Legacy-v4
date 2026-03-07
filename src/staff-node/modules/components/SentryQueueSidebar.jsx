import React from 'react';
import { Clock } from 'lucide-react';

export const SentryQueueSidebar = ({ filteredQueue, activeItem, handleSelectItem }) => {
    return (
        <aside className="w-[350px] shrink-0 flex flex-col gap-3 overflow-y-auto px-2 py-2 mb-4 custom-scrollbar -ml-2">
            {filteredQueue.map(item => (
                <div 
                    key={item.id}
                    onClick={() => handleSelectItem(item.id)}
                    className={`p-5 rounded-[28px] border transition-all cursor-pointer group relative ${
                        activeItem === item.id 
                        ? 'bg-white border-luminous-blue shadow-xl shadow-luminous-blue/5 scale-[1.02] z-10' 
                        : 'bg-white/50 border-gray-100 hover:border-gray-200 hover:bg-white'
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1.5 flex-wrap">
                            {item.urgent && (
                                <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                                    Urgent
                                </span>
                            )}
                            {item.aiStatus === 'needs_review' && (
                                <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                                    Needs Review
                                </span>
                            )}
                            {item.aiStatus === 'confirmed' && (
                                <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    ✓ Confirmed
                                </span>
                            )}
                        </div>
                        <span className="text-[8px] font-mono text-gray-300">{item.hubId || '—'}</span>
                    </div>
                    <h4 className="text-xs font-black text-luminous-ink mb-0.5 group-hover:text-luminous-blue transition-colors truncate">{item.entity ? `${item.contact} / ${item.entity}` : item.docTitle}</h4>
                    <p className="text-[9px] text-gray-400 font-medium italic mb-3 truncate">{item.entity ? item.docTitle : 'Unclassified — manual review required'}</p>
                    <div className="flex items-center justify-between">
                        <div className="w-5 h-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-[7px] font-black text-gray-400">{item.initials}</div>
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-gray-400">
                            <Clock size={9} /> {item.received}
                        </div>
                    </div>
                </div>
            ))}
        </aside>
    );
};
