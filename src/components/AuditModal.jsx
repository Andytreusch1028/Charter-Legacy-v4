import React from 'react';
import { X, ClipboardList, Shield, Zap, CheckCircle2, Clock } from 'lucide-react';

const AuditModal = ({ isOpen, onClose, client }) => {
    // Mock Audit Logs
    const logs = [
        { id: 1, action: 'Zero-Knowledge Decryption', status: 'Success', timestamp: '2 mins ago', details: 'Vault accessed with valid Staff ID' },
        { id: 2, action: 'Document Upload', status: 'Pending', timestamp: '1 hour ago', details: 'Entity Operating Agreement.pdf' },
        { id: 3, action: 'Address Verification', status: 'Success', timestamp: '4 hours ago', details: 'Privacy Shield Proxy active' }
    ];

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0A0A0B]/90 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="bg-[#121214] border border-white/5 rounded-[48px] w-full max-w-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="p-10 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Audit Trail</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Immutable Log Archive: {client.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="p-10 space-y-6 max-h-[600px] overflow-y-auto">
                    {logs.map((log) => (
                        <div key={log.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-6 group">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                                <Clock size={16} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-white">{log.action}</h4>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                                        log.status === 'Success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                                    }`}>
                                        {log.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium">{log.details}</p>
                            </div>
                            <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                                {log.timestamp}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-black/50 p-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                        <CheckCircle2 size={12} className="text-green-500" /> 
                        <span>Block-Chained Log In Sync</span>
                    </div>
                    <button className="text-[9px] font-black text-white hover:text-blue-500 transition-colors uppercase tracking-[0.2em]">Download Full Trace</button>
                </div>
            </div>
        </div>
    );
};

export default AuditModal;
