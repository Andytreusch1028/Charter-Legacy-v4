import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, Radio } from 'lucide-react';
import ComplianceStatusModal from './ComplianceStatusModal';

const SentinelStatusBoard = ({ llcData, onOpenBlueprint, onOpenPrivacy }) => {
  const isActive = llcData?.llc_status === 'Active';
  const privacyActive = llcData?.privacy_shield_active;
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const DOCUMENT_NUMBER = llcData?.sunbiz_document_number || 'L24000392044';

  return (
    <>
    <div className="bg-[#0A0A0B] border border-white/10 rounded-[32px] p-6 mb-8 relative overflow-hidden group">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-luminous-blue/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-luminous-blue animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-luminous-blue">
            Command Center
          </span>
        </div>
        <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-green-500">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Row 1: Entity */}
        <div 
            onClick={(e) => {
                console.log('Clicked Entity');
                onOpenBlueprint && onOpenBlueprint();
            }}
            className="relative z-10 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/item"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-luminous-blue/20 text-luminous-blue group-hover/item:bg-luminous-blue group-hover/item:text-white' : 'bg-yellow-500/20 text-yellow-500'}`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover/item:text-luminous-blue transition-colors">Legal Entity</h4>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                {isActive ? 'Active & Good Standing' : 'Formation Pending'}
              </p>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-luminous-blue shadow-[0_0_10px_#007AFF]' : 'bg-yellow-500 animate-pulse'}`} />
        </div>

        {/* Status Row 2: Privacy */}
        <div 
            onClick={(e) => {
                console.log('Clicked Privacy');
                onOpenPrivacy && onOpenPrivacy();
            }}
            className="relative z-10 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/item"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${privacyActive ? 'bg-[#00D084]/20 text-[#00D084] group-hover/item:bg-[#00D084] group-hover/item:text-white' : 'bg-red-500/20 text-red-500'}`}>
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover/item:text-[#00D084] transition-colors">Privacy Shield</h4>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                {privacyActive ? 'Sentinel Active' : 'Exposure Detected'}
              </p>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full ${privacyActive ? 'bg-[#00D084] shadow-[0_0_10px_#00D084]' : 'bg-red-500 animate-pulse'}`} />
        </div>

        {/* Status Row 3: Signal (Decorative) */}

          <div 
             onClick={() => setIsComplianceOpen(true)}
             className="relative z-50 flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item hover:scale-[1.02] active:scale-95"
          >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-500 group-hover/item:text-white group-hover/item:bg-purple-500 transition-all">
              <Radio size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover/item:text-purple-400 transition-colors">Compliance Link</h4>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Monitoring State Db
              </p>
            </div>
          </div>
           <div className="flex gap-1 items-end h-3">
               <div className="w-1 bg-purple-500 h-full animate-[bounce_1s_infinite]" />
               <div className="w-1 bg-purple-500 h-2/3 animate-[bounce_1.2s_infinite]" />
               <div className="w-1 bg-purple-500 h-1/2 animate-[bounce_0.8s_infinite]" />
           </div>
        </div>
      </div>
    </div>
      {isComplianceOpen && (
          <ComplianceStatusModal
              documentNumber={DOCUMENT_NUMBER}
              onClose={() => setIsComplianceOpen(false)}
          />
      )}
    </>
  );
};

export default SentinelStatusBoard;
