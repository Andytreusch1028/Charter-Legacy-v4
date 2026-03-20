import React from 'react';
import { X, Command, Activity, ShieldAlert, ArrowRight } from 'lucide-react';

const TerminalHelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#121214] w-full max-w-2xl rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121214] z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center text-blue-500">
              <Command size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">System Terminal</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Audit Trail Documentation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-10 overflow-y-auto space-y-12">
           
           <div className="space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <Activity size={16} className="text-blue-500" />
                 Overview
              </h4>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                 The System Terminal provides a real-time, unfiltered view of every significant action taken across the Charter Legacy platform. It connects directly to the immutable <span className="text-blue-400 font-mono">audit_logs</span> database table, ensuring a permanent record of all staff and system activity.
              </p>
           </div>

           <div className="space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <Command size={16} className="text-blue-500" />
                 Syntax & Color Guide
              </h4>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                 Events in the terminal are color-coded based on their severity and outcome to allow for rapid parsing by system administrators.
              </p>
              
              <div className="grid gap-3 pt-2">
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                    <span className="text-green-500 font-mono font-bold">[Success]</span>
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-gray-200">Nominal Operations</p>
                       <p className="text-xs text-gray-500">Standard user actions such as generating copy, resolving LLC filings, or sending artifacts.</p>
                    </div>
                 </div>

                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                    <span className="text-blue-500 font-mono font-bold">[System]</span>
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-gray-200">Routine Events</p>
                       <p className="text-xs text-gray-500">Background syncs, data polling, or routine state updates.</p>
                    </div>
                 </div>

                 <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-4">
                    <span className="text-red-500 font-mono font-bold">[Security Check]</span>
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-gray-200">Access Violations</p>
                       <p className="text-xs text-gray-500">Failed Zero-Knowledge vault decryption attempts, invalid staff verifications, or unauthorized routing.</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <ShieldAlert size={16} className="text-blue-500" />
                 Compliance Logging
              </h4>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                 Every Terminal entry is permanently stamped with a UTC Timestamp and the unique Entity ID (Client Profile ID) responsible for or associated with the action. These records cannot be altered and are maintained for UPL and security compliance auditing.
              </p>
           </div>
           
        </div>
      </div>
    </div>
  );
};

export default TerminalHelpModal;
