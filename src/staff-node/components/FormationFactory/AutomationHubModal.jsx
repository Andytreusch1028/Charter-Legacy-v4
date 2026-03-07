import React, { useState } from 'react';
import { Terminal, Zap, CheckCircle2, Server, Globe, Shield, RefreshCcw, Camera, ArrowLeftCircle, Edit3 } from 'lucide-react';

const AutomationHubModal = ({
    activeAutomation,
    automationState,
    automationLogs,
    lastSnapshot,
    elapsedTime,
    currentUrl,
    handoffUrl,
    setHandoffUrl,
    stopAutomation,
    setEditingSpec,
    setShowSpecEditor,
    setAutomationState
}) => {
    const [showFullSnapshot, setShowFullSnapshot] = useState(false);

    if (!activeAutomation) return null;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-5xl bg-[#0D1117] rounded-[40px] shadow-2xl shadow-black/50 overflow-hidden flex flex-col sm:flex-row relative border border-white/10" style={{ height: '80vh' }}>
                
                {/* Protocol Info Sidebar */}
                <div className="w-full sm:w-80 bg-[#161B22] border-b sm:border-b-0 sm:border-r border-white/5 flex flex-col shrink-0">
                    <div className="p-6 sm:p-8 flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-luminous-blue text-white flex items-center justify-center shadow-lg shadow-luminous-blue/20">
                                <Terminal size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-black uppercase tracking-widest text-xs">Tinyfish Engine</h3>
                                <p className="text-luminous-blue text-[9px] font-bold uppercase tracking-[0.2em] opacity-80 mt-0.5">Protocol Active</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 leading-none">{activeAutomation.entityName}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{activeAutomation.type} · {activeAutomation.owner}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-[#0D1117] rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Elapsed Time</span>
                                    <span className="text-xl font-mono text-white tracking-widest">{formatTime(elapsedTime)}</span>
                                </div>
                                <ActivityIndicator state={automationState} />
                            </div>

                            <div className="bg-[#0D1117] rounded-2xl p-4 border border-white/5 space-y-3">
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <Globe size={14} className={automationState === 'NAVIGATING' ? 'animate-spin-slow' : ''} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Network Secure</span>
                                </div>
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <Shield size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">State Portal Connected</span>
                                </div>
                                <div className="flex items-center gap-3 text-luminous-blue">
                                    <Server size={14} className={automationState === 'NAVIGATING' ? 'animate-pulse' : ''} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">DOM Parsing Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-[#1A1F2E]">
                        <button 
                            onClick={stopAutomation}
                            className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Zap size={14} /> Emergency Abort
                        </button>
                    </div>
                </div>

                {/* Log Terminal / Preview Area */}
                <div className="flex-1 flex flex-col relative min-h-[50vh] sm:min-h-0 bg-black">
                    {/* Header bar */}
                    <div className="h-12 border-b border-white/5 bg-[#161B22] flex items-center px-4 justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                            <div className="ml-4 px-3 py-1 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2 truncate max-w-[200px] sm:max-w-md">
                                <Globe size={10} className="text-gray-500 shrink-0" />
                                <span className="text-[9px] font-mono text-gray-400 truncate">{currentUrl || 'Initializing headless browser...'}</span>
                            </div>
                        </div>
                        {automationState === 'COMPLETE' && handoffUrl && (
                            <a href={handoffUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-luminous-blue uppercase tracking-widest hover:text-white transition-colors bg-luminous-blue/10 px-3 py-1.5 rounded-lg shrink-0">
                                Sunbiz Payment Handoff <ArrowLeftCircle size={14} className="rotate-180" />
                            </a>
                        )}
                    </div>

                    {/* Logs Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar font-mono text-[10px] sm:text-xs">
                        {automationLogs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                                <RefreshCcw size={32} className="animate-spin" />
                                <p className="uppercase tracking-widest font-black text-[10px]">Awaiting telemetry data...</p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {automationLogs.map((log, i) => (
                                    <div key={i} className={`flex gap-3 sm:gap-4 p-1 rounded hover:bg-white/5 transition-colors ${
                                        log.type === 'error' ? 'text-red-400' : 
                                        log.type === 'success' ? 'text-emerald-400' : 
                                        log.type === 'system' ? 'text-luminous-blue opacity-80' : 
                                        'text-gray-300'
                                    }`}>
                                        <span className="text-gray-600 shrink-0 select-none">[{log.timestamp}]</span>
                                        <span className={`${log.type === 'system' ? 'font-black tracking-wide' : ''}`}>{log.message}</span>
                                    </div>
                                ))}
                                {automationState === 'NAVIGATING' && (
                                    <div className="flex gap-4 p-1">
                                        <span className="text-gray-600 shrink-0 select-none">[{new Date().toLocaleTimeString()}]</span>
                                        <span className="text-amber-500 animate-pulse font-black">_</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Snapshot Overlay */}
                {lastSnapshot && !showFullSnapshot && (
                    <div className="absolute right-4 sm:right-8 bottom-4 sm:bottom-8 w-48 sm:w-64 h-32 sm:h-40 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group cursor-zoom-in hover:scale-105 transition-transform origin-bottom-right" onClick={() => setShowFullSnapshot(true)}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[7px] sm:text-[8px] font-black text-white uppercase tracking-widest">LIVE SNAPSHOT</span>
                            <Camera size={12} className="text-luminous-blue" />
                        </div>
                        <img src={lastSnapshot} alt="Automation Snapshot" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Fullscreen Snapshot Review */}
                {showFullSnapshot && (
                    <div className="absolute inset-0 z-[160] bg-black/95 backdrop-blur-2xl flex flex-col p-4 sm:p-10 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-4 sm:mb-8 shrink-0">
                            <div>
                                <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter">Final Filing Verification</h4>
                                <p className="text-[8px] sm:text-[10px] text-luminous-blue font-black uppercase tracking-[0.3em] opacity-80 mt-1">Sunbiz Review Screen Proof</p>
                            </div>
                            <button onClick={() => setShowFullSnapshot(false)} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition-all">
                                <ArrowLeftCircle size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden rounded-2xl sm:rounded-[40px] border border-white/10 shadow-2xl bg-[#0D1117] relative group">
                            <img src={lastSnapshot} alt="Full Review" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 pointer-events-none border-[10px] sm:border-[20px] border-emerald-500/10" />
                        </div>
                        <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 shrink-0">
                            <button 
                                onClick={() => {
                                    setShowFullSnapshot(false);
                                    setEditingSpec({ ...activeAutomation });
                                    setShowSpecEditor(true);
                                    setAutomationState('IDLE');
                                }} 
                                className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 border border-red-500/20 bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Edit3 size={16} /> Edit Spec Required
                            </button>
                            <button onClick={() => setShowFullSnapshot(false)} className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 bg-emerald-500 text-white rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all">
                                Verified: Return to Console
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ActivityIndicator = ({ state }) => {
    switch(state) {
        case 'NAVIGATING':
            return (
                <div className="w-10 h-10 rounded-xl bg-luminous-blue/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-2 border-luminous-blue/30 rounded-xl animate-ping opacity-75" />
                    <Zap size={18} className="text-luminous-blue animate-pulse" />
                </div>
            );
        case 'COMPLETE':
            return (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={18} />
                </div>
            );
        case 'ERROR':
            return (
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <Server size={18} />
                </div>
            );
        default:
            return (
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30">
                    <Zap size={18} />
                </div>
            );
    }
};

export default AutomationHubModal;
