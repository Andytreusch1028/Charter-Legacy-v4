import React from 'react';
import { Clock, CheckCircle2, Activity, Lock, Search } from 'lucide-react';

const FormationDashboardHeader = ({
    viewMode, setViewMode,
    formations,
    searchQuery, setSearchQuery,
    apiKey, setShowKeyPrompt
}) => {
    return (
        <div className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
                { [
                    { id: 'queue', label: 'Formation Queue', icon: Clock, count: formations.filter(f => f.status !== 'FILED').length },
                    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: formations.filter(f => f.status === 'FILED').length },
                    { id: 'stats', label: 'Factory Stats', icon: Activity }
                ].map(mode => (
                    <button 
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            viewMode === mode.id 
                                ? 'bg-white text-luminous-ink shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <mode.icon size={12} />
                        {mode.label}
                        {mode.count !== undefined && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] ${viewMode === mode.id ? 'bg-luminous-blue/10 text-luminous-blue' : 'bg-gray-200 text-gray-500'}`}>
                                {mode.count}
                            </span>
                        )}
                    </button>
                )) }
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setShowKeyPrompt(true)}
                    className={`p-3 rounded-xl border transition-all ${apiKey ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-amber-50 border-amber-100 text-amber-500'}`}
                    title={apiKey ? "Node Enabled" : "Enable Node with API Key"}
                >
                    <Lock size={16} />
                </button>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-luminous-blue transition-colors" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search entities…" 
                        className="bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none ring-4 ring-transparent focus:ring-luminous-blue/5 focus:border-luminous-blue/20 transition-all w-64 shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default FormationDashboardHeader;
