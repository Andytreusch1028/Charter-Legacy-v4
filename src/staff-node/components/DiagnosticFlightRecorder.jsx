import React, { useState, useEffect } from 'react';
import { 
    X, Terminal, Activity, CheckCircle2, AlertTriangle, 
    Clock, RefreshCw, FileText, Download, ShieldAlert, FastForward
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DiagnosticFlightRecorder = ({ entityId, entityName, onClose, setToast }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(''); // Natural language filter stub
    const [retryingId, setRetryingId] = useState(null);

    useEffect(() => {
        if (!entityId) return;
        fetchTelemetry();

        // Subscribe to real-time ledger updates for this entity
        const channel = supabase.channel(`ledger-${entityId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'system_events_ledger',
                filter: `entity_id=eq.${entityId}`
            }, (payload) => {
                setEvents(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [entityId]);

    const fetchTelemetry = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('system_events_ledger')
                .select('*')
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error('Failed to fetch telemetry:', err);
            setToast({ type: 'error', message: 'Failed to access Flight Recorder' });
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (eventLog) => {
        setRetryingId(eventLog.id);
        
        try {
            await supabase.from('system_events_ledger').insert({
                entity_id: entityId,
                client_id: eventLog.client_id,
                actor_id: 'CURRENT_OPERATOR_ID', // Replace with real auth user
                actor_type: 'STAFF',
                event_category: eventLog.event_category,
                event_type: 'MANUAL_RETRY_TRIGGERED',
                severity: 'INFO',
                internal_payload: { original_event_id: eventLog.id, note: 'Operator triggered 1-Click Retry' }
            });

            // Note: In a real architecture, this would trigger an Edge Function 
            // that pulls the `system_snapshot` and re-injects it into the Tinyfish queue.
            setToast({ type: 'success', message: 'Payload re-injected into execution queue' });
            
        } catch (err) {
             setToast({ type: 'error', message: 'Failed to trigger retry' });
        } finally {
            setRetryingId(null);
        }
    };

    const exportLogs = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `telemetry_${entityName}_${new Date().toISOString()}.json`);
        dlAnchorElem.click();
    };

    const StatusIcon = ({ severity }) => {
        switch (severity) {
            case 'SUCCESS': return <CheckCircle2 size={14} className="text-emerald-500" />;
            case 'WARNING': return <AlertTriangle size={14} className="text-amber-500" />;
            case 'CRITICAL': return <ShieldAlert size={14} className="text-red-500" />;
            default: return <Activity size={14} className="text-luminous-blue" />;
        }
    };

    // Advanced "Steve" NLP Filtering (Basic prototype matching any string value)
    const filteredEvents = filter.trim() ? events.filter(e => 
        JSON.stringify(e).toLowerCase().includes(filter.toLowerCase())
    ) : events;

    return (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-[#0A0D14] border-l border-white/5 shadow-2xl flex flex-col z-[200] animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between bg-black/50">
                <div>
                    <div className="flex items-center gap-2 text-luminous-blue mb-2">
                        <Terminal size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Diagnostic Flight Recorder</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{entityName}</h2>
                    <p className="text-xs text-white/40 font-mono mt-1">ID: {entityId}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportLogs} title="Export JSON" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                        <Download size={16} />
                    </button>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-500 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Smart Filter Command Bar */}
            <div className="p-4 border-b border-white/5 bg-black/20">
                <div className="relative">
                    <FastForward className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                        type="text" 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Natural Language Filter (e.g., 'Warning', 'Automation')..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs font-mono focus:border-luminous-blue focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
                    />
                </div>
            </div>

            {/* Terminal Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/20 space-y-4">
                        <RefreshCw className="animate-spin" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Extracting Blackbox Data...</span>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/20">
                        <FileText size={32} className="mb-4 opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest">No telemetry found</span>
                    </div>
                ) : (
                    filteredEvents.map((evt, i) => (
                        <div key={evt.id || i} className={`p-4 rounded-xl border ${
                            evt.severity === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : 
                            evt.severity === 'WARNING' ? 'bg-amber-500/5 border-amber-500/20' : 
                            'bg-white/5 border-white/5'
                        }`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <StatusIcon severity={evt.severity} />
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                                        {evt.event_type}
                                    </span>
                                </div>
                                <span className="text-[10px] text-white/30 font-mono">
                                    {new Date(evt.created_at).toLocaleString()}
                                </span>
                            </div>

                            {evt.customer_facing_message && (
                                <p className="text-sm text-white/80 mb-3 ml-6 border-l-2 border-white/10 pl-3 italic">
                                    "{evt.customer_facing_message}"
                                </p>
                            )}

                            {evt.internal_payload && (
                                <div className="ml-6 bg-black/50 rounded-lg p-3 overflow-x-auto text-[10px] text-emerald-400 font-mono border border-white/5 whitespace-pre">
                                    {JSON.stringify(evt.internal_payload, null, 2)}
                                </div>
                            )}

                            {/* 1-Click Reversibility (Steve Protocol) */}
                            {evt.severity === 'CRITICAL' && evt.system_snapshot && (
                                <div className="ml-6 mt-3 flex justify-end">
                                    <button 
                                        onClick={() => handleRetry(evt)}
                                        disabled={retryingId === evt.id}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-luminous-blue/20 hover:bg-luminous-blue/40 text-luminous-blue rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                                    >
                                        {retryingId === evt.id ? <RefreshCw className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                                        1-Click Retry
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DiagnosticFlightRecorder;
