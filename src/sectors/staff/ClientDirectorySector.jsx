import React, { useState } from 'react';
import { Search, Shield, Activity, ClipboardList, Loader2 } from 'lucide-react';
import { GlassCard, StatusBadge } from '../../shared/design-system/UIPrimitives';

/**
 * ClientDirectorySector
 * High-authority client management and zero-knowledge vault access.
 */
const ClientDirectorySector = ({ 
    clients, 
    loading, 
    onOpenVault, 
    onOpenAudit 
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(c => 
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Client Directory</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Authorized Access Only</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#121214] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold focus:border-white/20 outline-none transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 border border-dashed border-white/5 rounded-[40px]">
                    <Loader2 className="animate-spin text-white/20" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Syncing Client Nodes...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredClients.map((client) => (
                        <GlassCard key={client.id} className="p-8 space-y-6 group">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-black text-xs border border-white/10 group-hover:border-white/30 transition-all">
                                    {client.email?.[0].toUpperCase() || 'U'}
                                </div>
                                <StatusBadge active={client.llcs?.length > 0} />
                            </div>
                            
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                    {client.full_name || 'System User'}
                                </p>
                                <p className="text-xs font-bold text-white truncate">{client.email}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Active LLCs</p>
                                    <p className="text-xs font-black">{client.llcs?.length || 0}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Artifacts</p>
                                    <p className="text-xs font-black">{client.hasVault ? 'ACTIVE' : 'NONE'}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => onOpenVault(client)}
                                    className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <Shield size={12} /> Vault
                                </button>
                                <button 
                                    onClick={() => onOpenAudit(client)}
                                    className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <ClipboardList size={12} /> Audit
                                </button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientDirectorySector;
