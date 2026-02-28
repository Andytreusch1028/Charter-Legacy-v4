import React, { useState } from 'react';
import { Building2, AlertTriangle, X, Info, Eye, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ProbateSimulator = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Card */}
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-[24px] bg-[#1c1c1e] border-2 border-dashed border-white/10 p-5 cursor-pointer hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex flex-col h-[155px]"
      >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#d4af37]/10 text-[#d4af37] rounded-xl border border-[#d4af37]/20 group-hover:scale-110 transition-transform">
                <Building2 size={20} />
            </div>
            <div className="px-3 py-1 bg-[#d4af37]/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#d4af37] border border-[#d4af37]/20">
                Simulator
            </div>
        </div>
        <div className="mb-auto">
            <h3 className="text-xl font-black text-white leading-tight">
                What happens to your LLC<br/>when you die?
            </h3>
        </div>
        <p className="text-[10px] text-gray-500 font-medium group-hover:text-[#d4af37] transition-colors flex items-center justify-between gap-2 mt-2 pt-3 border-t border-white/5">
            <span className="uppercase tracking-widest font-black">See the difference</span> <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </p>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0B] border border-white/5 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative"
            >
                {/* Header */}
                <div className="bg-[#1c1c1e] p-8 text-white relative overflow-hidden border-b border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4 text-red-400">
                        <AlertTriangle size={20} />
                        <span className="font-bold uppercase tracking-widest text-xs">LLC Transfer Scenario</span>
                    </div>
                    <h2 className="text-3xl font-black mb-2">Your LLC Without a TOD</h2>
                    <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                        Without a Transfer on Death designation on file, your LLC membership interest 
                        becomes a probate asset — frozen, public, and tied up in court for months.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Comparison Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Scenario A: No TOD */}
                        <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
                            <h4 className="text-red-400 font-black uppercase tracking-wider text-xs mb-4">No TOD on File</h4>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <p className="text-xs text-red-500/80 font-bold mb-1">Court & Attorney Costs</p>
                                    <p className="text-3xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">3–7%</p>
                                    <p className="text-[10px] text-red-500/60 uppercase font-black tracking-widest mt-1">of LLC interest value</p>
                                </div>
                                <div className="h-px bg-red-900/30" />
                                <div>
                                     <p className="text-xs text-red-500/80 font-bold mb-1">Business Impact</p>
                                     <p className="text-2xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">9–18 Months</p>
                                     <p className="text-[10px] text-red-500/60 uppercase font-black tracking-widest mt-1">Uncertain while estate is settled</p>
                                </div>
                                 <div className="h-px bg-red-900/30" />
                                 <div>
                                     <p className="text-xs text-red-500/80 font-bold mb-1">Ownership Record</p>
                                     <div className="flex items-center gap-2 text-red-400 font-bold">
                                        <Eye size={16} /> Becomes Public
                                     </div>
                                 </div>
                            </div>
                        </div>

                        {/* Scenario B: TOD Sealed */}
                        <div className="p-6 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-3xl relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />
                             <h4 className="text-[#d4af37] font-black uppercase tracking-wider text-xs mb-4">TOD Sealed with Charter Legacy</h4>
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <p className="text-xs text-[#d4af37]/80 font-bold mb-1">Transfer Cost</p>
                                    <p className="text-3xl font-black text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">~$0</p>
                                    <p className="text-[10px] text-[#d4af37]/60 uppercase font-black tracking-widest mt-1">No probate required</p>
                                </div>
                                <div className="h-px bg-[#d4af37]/10" />
                                <div>
                                     <p className="text-xs text-[#d4af37]/80 font-bold mb-1">Business Transfer</p>
                                     <p className="text-2xl font-black text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">No Court</p>
                                     <p className="text-[10px] text-[#d4af37]/60 uppercase font-black tracking-widest mt-1">Successor claims outside probate</p>
                                </div>
                                 <div className="h-px bg-[#d4af37]/10" />
                                 <div>
                                     <p className="text-xs text-[#d4af37]/80 font-bold mb-1">Ownership Record</p>
                                     <div className="flex items-center gap-2 text-[#d4af37] font-bold">
                                        <Lock size={16} /> No Public Filing
                                     </div>
                                 </div>
                            </div>
                        </div>
                    </div>

                    {/* What this does NOT cover */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 flex gap-3">
                        <ShieldCheck size={18} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mb-1">Scope: LLC Membership Interest Only</p>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                                This tool handles the transfer of your <strong className="text-white">LLC ownership interest only</strong> — not your personal real estate, bank accounts, or other assets. For full estate planning, consult a licensed estate attorney.
                            </p>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-white/5 p-4 rounded-xl flex gap-3 border border-white/10">
                        <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            <strong className="text-gray-200">EDUCATIONAL USE ONLY:</strong> Figures are estimates based on Florida probate averages. A TOD designation bypasses probate for your LLC membership interest under Florida law. This does not constitute legal advice. Individual circumstances vary.
                        </p>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProbateSimulator;
