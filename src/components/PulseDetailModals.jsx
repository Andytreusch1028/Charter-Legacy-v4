import React from 'react';
import { X, Shield, Clock, AlertCircle, CheckCircle2, ChevronRight, Building2, Calendar, FileText } from 'lucide-react';

const PulseDetailModal = ({ type, data, alerts, onClose }) => {
    if (!type) return null;

    const titles = {
        active: 'Active Portfolio Filings',
        due: 'Compliance Deadlines',
        shield: 'Shielded Entities'
    };

    const icons = {
        active: <Building2 className="text-[#00D084]" size={24} />,
        due: <AlertCircle className="text-amber-500" size={24} />,
        shield: <Shield className="text-cyan-400" size={24} />
    };

    const renderContent = () => {
        switch (type) {
            case 'active':
                return (
                    <div className="space-y-4">
                        {(data || []).filter(c => c && c.llc_status === 'Active').map((llc, i) => (
                            <div key={llc.id || i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#00D084]/10 flex items-center justify-center text-[#00D084]">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-white font-bold text-sm">{llc.llc_name}</h4>
                                            <span className="px-2 py-0.5 bg-[#00D084]/20 text-[#00D084] text-[8px] font-black uppercase tracking-widest rounded-full">Active</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className="text-white/40">Document:</span> Articles of Organization
                                        </p>
                                        <p className="text-[9px] text-gray-600 font-medium mt-0.5">Filed & Verified: {new Date(llc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <ChevronRight className="text-white/20 group-hover:text-white transition-colors" size={16} />
                                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest group-hover:text-white/30 transition-colors">Vault Ref: {llc.id?.substring(0,8) || 'MOCK-REF'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'due':
                return (
                    <div className="space-y-4">
                        {(alerts || []).filter(a => {
                            if (!a || a.status === 'Completed') return false;
                            const dueDate = new Date(a.due_date);
                            const today = new Date();
                            const next30Days = new Date();
                            next30Days.setDate(today.getDate() + 30);
                            return dueDate >= today && dueDate <= next30Days;
                        }).map((alert, i) => (
                            <div key={alert.id || i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3 group hover:bg-white/10 transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <Clock size={16} />
                                        </div>
                                        <h4 className="text-amber-500 font-black text-[10px] uppercase tracking-widest">{alert.alert_type}</h4>
                                    </div>
                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Due {new Date(alert.due_date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed">{alert.message}</p>
                                <button className="w-full py-2 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">
                                    Resolve Immediately
                                </button>
                            </div>
                        ))}
                        {alerts.length === 0 && (
                            <div className="py-12 text-center space-y-4">
                                <CheckCircle2 className="mx-auto text-[#00D084]" size={48} />
                                <p className="text-gray-400 text-sm font-medium">No urgent deadlines detected.</p>
                            </div>
                        )}
                    </div>
                );
            case 'shield':
                return (
                    <div className="space-y-4">
                        {(data || []).filter(c => c && (c.product_type === 'Shield' || c.product_type === 'double_llc_protocol')).map((llc, i) => (
                            <div key={llc.id || i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                                        <Shield size={18} fill="currentColor" opacity={0.2} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{llc.llc_name}</h4>
                                        <p className="text-[10px] text-cyan-400/60 font-black uppercase tracking-widest">Privacy Protocol Active</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-cyan-400/10 rounded-full text-[8px] font-black uppercase tracking-widest text-cyan-400">
                                    Secure
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            <div className="relative w-full max-w-xl bg-[#1A1A1B] border border-white/10 rounded-[32px] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            {icons[type]}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">{titles[type]}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live Telemetry Details</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="p-6 bg-black/40 border-t border-white/5 flex items-center justify-between px-8">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#00D084]">
                        <div className="w-1.5 h-1.5 bg-[#00D084] rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                        <span>Real-time Secure Link</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Close View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PulseDetailModal;
