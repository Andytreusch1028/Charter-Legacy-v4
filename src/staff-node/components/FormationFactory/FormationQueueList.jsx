import React from 'react';
import { Zap, FileText, Terminal } from 'lucide-react';

const FormationQueueList = ({
    filteredFormations,
    setEditingSpec,
    setShowSpecEditor,
    startAutomation,
    setActiveFlightRecorder
}) => {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFormations.map(formation => (
                    <div 
                        key={formation.id}
                        className={`p-6 bg-white border rounded-[32px] transition-all hover:shadow-xl hover:shadow-gray-200/50 group ${
                            formation.priority === 'high' ? 'border-red-100 shadow-sm shadow-red-500/5' : 'border-gray-100'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                formation.status === 'FILED' ? 'bg-emerald-50 text-emerald-500' : 'bg-luminous-blue/10 text-luminous-blue'
                            }`}>
                                <Zap size={24} />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-mono text-gray-300 block">ID: {formation.id}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mt-1 inline-block ${
                                    formation.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                }`}>{formation.priority} Priority</span>
                            </div>
                        </div>

                        <h4 className="text-lg font-black text-luminous-ink uppercase tracking-tight mb-1 group-hover:text-luminous-blue transition-colors">
                            {formation.entityName}
                        </h4>
                        <div className="flex items-center gap-2 mb-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                formation.action_type === 'FORMATION' ? 'bg-indigo-50 text-indigo-500' :
                                formation.action_type === 'ANNUAL_REPORT' ? 'bg-emerald-50 text-emerald-500' :
                                formation.action_type === 'CERTIFICATE_OF_STATUS' ? 'bg-cyan-50 text-cyan-500' :
                                formation.action_type === 'DISSOLUTION' ? 'bg-red-50 text-red-500' :
                                formation.action_type === 'REINSTATEMENT' ? 'bg-amber-50 text-amber-500' :
                                formation.action_type?.includes('DBA') ? 'bg-purple-50 text-purple-500' :
                                'bg-gray-100 text-gray-500'
                            }`}>
                                {formation.action_type?.replace(/_/g, ' ') || 'UNKNOWN'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">
                                · {formation.owner}
                            </span>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-gray-400 uppercase">Status</span>
                                <span className={`font-black uppercase tracking-widest ${
                                    formation.status === 'FILED' ? 'text-emerald-500' : 'text-amber-500'
                                }`}>{formation.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-gray-400 uppercase">Submitted</span>
                                <span className="font-bold text-luminous-ink">{formation.submitted}</span>
                            </div>
                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${
                                    formation.status === 'FILED' ? 'w-full bg-emerald-500' : 
                                    formation.status === 'DRAFTING' ? 'w-2/3 bg-luminous-blue' : 'w-1/3 bg-amber-500'
                                }`} />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    setEditingSpec({ ...formation });
                                    setShowSpecEditor(true);
                                }}
                                className="flex-[2] py-3 bg-gray-50 text-luminous-ink rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                <FileText size={14} /> View Spec
                            </button>
                            <button 
                                onClick={() => formation.status === 'FILED' ? null : startAutomation(formation)}
                                className="flex-[3] py-3 bg-luminous-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-luminous-blue/20 transition-all flex items-center justify-center gap-2"
                            >
                                {formation.status === 'FILED' 
                                    ? 'Download Receipt' 
                                    : formation.action_type === 'ANNUAL_REPORT' ? 'File Annual Report (Auto)' 
                                    : formation.action_type === 'DBA_REGISTRATION' ? 'Process DBA' 
                                    : formation.action_type === 'DBA_RENEWAL' ? 'Process DBA Renewal' 
                                    : formation.action_type === 'REINSTATEMENT' ? 'Reinstate LLC' 
                                    : formation.action_type === 'DISSOLUTION' ? 'Dissolve LLC' 
                                    : formation.action_type === 'CERTIFICATE_OF_STATUS' ? 'Order Certificate' 
                                    : 'File Formation (Auto)'}
                                <Zap size={12} className={formation.status !== 'FILED' ? 'animate-pulse' : ''} />
                            </button>
                            <button 
                                onClick={() => setActiveFlightRecorder({ id: formation.id, name: formation.entityName })}
                                className="flex-[1] py-3 bg-[#1A1F2E] text-white/50 hover:text-white rounded-xl flex items-center justify-center transition-colors group border border-white/5"
                                title="View Action Ledger"
                            >
                                <Terminal size={14} className="group-hover:text-luminous-blue transition-colors" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FormationQueueList;
