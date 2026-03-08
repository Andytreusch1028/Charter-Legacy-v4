import React from 'react';
import { Lock, LogOut, Settings } from 'lucide-react';

const getInitials = (name, email) => {
    if (name && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    }
    if (email && email.includes('@')) {
        const prefix = email.split('@')[0];
        return prefix.substring(0, 2).toUpperCase();
    }
    return '?';
};

const FulfillmentSidebar = ({ 
    modules, 
    activeModule, 
    setActiveModule, 
    user, 
    staffRole, 
    onLogout, 
    onOpenSettings 
}) => {
    return (
        <aside className="w-80 bg-luminous-ink border-r border-white/5 flex flex-col p-6 shrink-0">
            <div className="mb-12 px-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Workhorse.</h2>
                <p className="text-[9px] text-luminous-blue font-black uppercase tracking-[0.3em] opacity-80 mt-1">Personnel Interface v2.1</p>
            </div>

            <nav className="flex-1 space-y-2">
                {modules.map(mod => (
                    <button 
                        key={mod.id}
                        onClick={() => !mod.locked && setActiveModule(mod.id)}
                        className={`w-full group relative p-5 rounded-[28px] text-left transition-all duration-300 border ${
                            activeModule === mod.id 
                                ? 'bg-white/10 border-white/10 shadow-xl' 
                                : 'hover:bg-white/5 border-transparent'
                        } ${mod.locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                                activeModule === mod.id ? 'bg-luminous-blue text-white' : 'bg-white/5 text-white/40 group-hover:text-white/60'
                            }`}>
                                <mod.icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <h3 className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                                    activeModule === mod.id ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                                }`}>
                                    {mod.label}
                                </h3>
                                <p className="text-[9px] text-white/20 font-medium italic truncate mt-0.5">{mod.desc}</p>
                            </div>
                            {mod.locked && <Lock size={12} className="ml-auto text-white/10" />}
                            {activeModule === mod.id && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-luminous-blue shadow-[0_0_12px_rgba(45,108,223,0.8)]" />
                            )}
                        </div>
                    </button>
                ))}
            </nav>

            <div className="mt-auto space-y-4 px-4">
                <div className="p-5 bg-white/5 rounded-[32px] border border-white/5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-white text-[10px] font-black">
                            {getInitials(user?.email?.split('@')[0], user?.email)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black text-white uppercase tracking-tight truncate">{user?.email?.split('@')[0] || 'AL-901'}</p>
                            <p className="text-[8px] text-luminous-blue font-black uppercase tracking-widest">{staffRole}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onLogout} className="flex-1 py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-white/40 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            <LogOut size={10} /> Exit Session
                        </button>
                        <button 
                            onClick={onOpenSettings} 
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl flex items-center justify-center gap-2 transition-all group"
                        >
                            <Settings size={14} className="group-hover:rotate-45 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default FulfillmentSidebar;
