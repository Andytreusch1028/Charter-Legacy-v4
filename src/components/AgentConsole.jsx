import React, { useState } from 'react';
import { Terminal, Play, X, Shield } from 'lucide-react';

const AgentConsole = ({ isOpen, onClose, user, llcData }) => {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');

    if (!isOpen) return null;

    const handleRun = () => {
        try {
            // Evaluates the code in the scope of this component or window
            // Note: This is strictly for localhost/dev as discussed
            const result = eval(code);
            setOutput(String(result));
        } catch (err) {
            setOutput(`Error: ${err.message}`);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[500] w-96 bg-[#0A0A0B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                    <Terminal size={14} /> Agent Console
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors text-gray-500">
                    <X size={14} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* State Inspector */}
                <div className="space-y-2">
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Context State</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                            <div className="text-[8px] text-gray-500 uppercase mb-1">Vault Status</div>
                            <div className={`text-[10px] font-bold ${user?.permissions?.heritage_vault ? 'text-green-400' : 'text-red-400'}`}>
                                {user?.permissions?.heritage_vault ? 'UNLOCKED' : 'LOCKED'}
                            </div>
                        </div>
                        <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                            <div className="text-[8px] text-gray-500 uppercase mb-1">Entity</div>
                            <div className="text-[10px] font-bold text-gray-300 truncate">
                                {llcData?.llc_name || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Eval Interface */}
                <div className="space-y-2">
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">JavaScript Evaluator</div>
                    <div className="relative">
                        <textarea 
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    handleRun();
                                }
                            }}
                            className="w-full h-32 bg-black rounded-xl p-3 font-mono text-xs text-blue-300 border border-white/5 focus:ring-1 focus:ring-blue-500/50 outline-none resize-none"
                            placeholder="window.__antigravity_open_vault();"
                        />
                        <button 
                            onClick={handleRun}
                            title="Run (Ctrl+Enter)"
                            className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg"
                        >
                            <Play size={12} fill="currentColor" />
                        </button>
                    </div>
                </div>

                {/* Output */}
                {output && (
                    <div className="p-3 bg-black rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 break-all max-h-24 overflow-y-auto">
                        <span className="text-gray-600 mr-2">➜</span> {output}
                    </div>
                )}
            </div>
            
            <div className="px-4 py-2 bg-blue-500/5 flex items-center gap-2">
                 <Shield size={10} className="text-blue-500/50" />
                 <span className="text-[8px] text-blue-500/50 font-black uppercase tracking-widest">Localhost High-Privilege Mode</span>
            </div>
        </div>
    );
};

export default AgentConsole;
