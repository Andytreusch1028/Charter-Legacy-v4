import React from 'react';
import { ClipboardList, Shield, Activity, User, Server } from 'lucide-react';

/**
 * RaAuditSector
 * Transparent, immutable ledger of all Registered Agent interactions.
 */
const RaAuditSector = ({ auditLogs }) => {

    const getIconForActor = (actorType) => {
        switch (actorType) {
            case 'USER': return <User size={14} className="text-luminous-blue" />;
            case 'CHARTER_ADMIN': return <Shield size={14} className="text-emerald-400" />;
            case 'SYSTEM': 
            default: return <Server size={14} className="text-amber-400" />;
        }
    };

    const formatAction = (action) => {
        return action.replace(/_/g, ' ');
    };

    return (
        <div className="animate-in fade-in duration-500">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-light text-white tracking-tight">System Audit Log</h2>
                    <p className="text-xs text-gray-400 font-light mt-1">Immutable ledger of all views, downloads, and status changes for compliance.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Ledger Active</span>
                </div>
            </header>

            <div className="bg-[#121214] border border-white/5 rounded-[24px] overflow-hidden">
                {auditLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <ClipboardList className="mx-auto text-gray-600 mb-4" size={32} />
                        <h3 className="text-white font-medium mb-1">No Audit Traits</h3>
                        <p className="text-sm text-gray-500">No events have been recorded yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
                                <div className="mt-1 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    {getIconForActor(log.actor_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-semibold text-white tracking-wide">{formatAction(log.action)}</p>
                                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest shrink-0">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <p className="text-[11px] text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="opacity-50">Actor:</span> {log.actor_type}
                                        </p>
                                        {log.actor_email && (
                                            <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                                                <span className="opacity-50">Identity:</span> {log.actor_email}
                                            </p>
                                        )}
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                                            log.outcome === 'SUCCESS' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                                        }`}>
                                            {log.outcome}
                                        </span>
                                    </div>
                                    
                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                        <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/5">
                                            <pre className="text-[10px] text-gray-500 font-mono whitespace-pre-wrap">
                                                {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RaAuditSector;
