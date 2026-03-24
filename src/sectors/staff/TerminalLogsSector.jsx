import React, { useEffect } from 'react';
import { Command, RefreshCw } from 'lucide-react';
import { GlassCard } from '../../shared/design-system/UIPrimitives';
import { useAudit } from '../../hooks/useAudit';

/**
 * TerminalLogsSector
 * Real-time system monitoring and event streaming.
 */
const TerminalLogsSector = () => {
    const { terminalLogs, fetchLogs } = useAudit();

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(() => fetchLogs(), 5000);
        return () => clearInterval(interval);
    }, [fetchLogs]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">System Terminal</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Real-time Event Stream</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                    <RefreshCw size={12} className="animate-spin-slow" /> Polling Every 5s
                </div>
            </div>

            <GlassCard className="bg-[#050506] border-white/5 p-0">
                <div className="bg-[#121214] px-6 py-4 border-b border-white/5 flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                    <div className="flex-1 flex justify-center">
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">charter_system_audit_x64</span>
                    </div>
                </div>
                
                <div className="p-8 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[600px] custom-scrollbar space-y-3">
                    {terminalLogs.length > 0 ? terminalLogs.map((log, i) => (
                        <div key={i} className="flex gap-4 group">
                            <span className="text-gray-700 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className="text-blue-500 font-bold uppercase shrink-0">SYS_AUTH</span>
                            <span className="text-gray-400">»</span>
                            <div className="space-y-1">
                                <span className="text-gray-200 group-hover:text-white transition-colors">{log.action}</span>
                                {log.status === 'Success' ? (
                                    <span className="ml-3 text-emerald-500/80 font-black">[OK]</span>
                                ) : (
                                    <span className="ml-3 text-red-500/80 font-black">[ERR]</span>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="flex items-center gap-4 text-gray-700 animate-pulse">
                            <span>[SYSTEM]</span>
                            <span>Awaiting initialization pulse...</span>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default TerminalLogsSector;
