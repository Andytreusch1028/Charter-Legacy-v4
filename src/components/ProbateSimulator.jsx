import React, { useState } from 'react';
import { Scale, AlertTriangle, X, Info, Eye, Lock, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ProbateSimulator = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Card */}
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-[32px] bg-white border-2 border-dashed border-gray-200 p-8 cursor-pointer hover:border-red-500/50 hover:bg-red-50/50 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100/80 text-red-600 rounded-xl">
                <Scale size={24} />
            </div>
            <div className="px-3 py-1 bg-red-100 rounded-full text-[10px] font-bold uppercase tracking-wider text-red-600">
                Simulator
            </div>
        </div>
        <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">
            The Cost of <br/>Inaction.
        </h3>
        <p className="text-sm text-gray-500 font-medium group-hover:text-red-700 transition-colors flex items-center gap-2">
            Tap to simulate a probate event <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative"
            >
                {/* Header */}
                <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-[80px] pointer-events-none" />
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4 text-red-400">
                        <AlertTriangle size={20} />
                        <span className="font-bold uppercase tracking-widest text-xs">Probate Simulation</span>
                    </div>
                    <h2 className="text-3xl font-black mb-2">The Public Risk Profile</h2>
                    <p className="text-gray-400 text-sm max-w-md">
                        Without a Living Trust, assets typically go through Probate. This is a public, costly, and time-consuming court process.
                    </p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Comparison Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Scenario A: Probate */}
                        <div className="p-6 bg-red-50 border border-red-100 rounded-3xl">
                            <h4 className="text-red-900 font-black uppercase tracking-wider text-xs mb-4">Without a Trust (Probate)</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-red-700 font-bold mb-1">Estimated Cost</p>
                                    <p className="text-3xl font-black text-red-600">3-7%</p>
                                    <p className="text-[10px] text-red-500">of Gross Estate Value</p>
                                </div>
                                <div className="h-px bg-red-200" />
                                <div>
                                     <p className="text-xs text-red-700 font-bold mb-1">Time Frozen</p>
                                     <p className="text-2xl font-black text-red-800">9-18 Months</p>
                                </div>
                                 <div className="h-px bg-red-200" />
                                 <div>
                                     <p className="text-xs text-red-700 font-bold mb-1">Privacy Level</p>
                                     <div className="flex items-center gap-2 text-red-600 font-bold">
                                        <Eye size={16} /> Public Record
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Scenario B: Trust */}
                        <div className="p-6 bg-green-50 border border-green-100 rounded-3xl">
                             <h4 className="text-green-900 font-black uppercase tracking-wider text-xs mb-4">With Charter Legacy (Trust)</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-green-700 font-bold mb-1">Transfer Cost</p>
                                    <p className="text-3xl font-black text-green-600">~0%</p>
                                    <p className="text-[10px] text-green-500">Immediate Transfer</p>
                                </div>
                                <div className="h-px bg-green-200" />
                                <div>
                                     <p className="text-xs text-green-700 font-bold mb-1">Time Frozen</p>
                                     <p className="text-2xl font-black text-green-800">0 Days</p>
                                </div>
                                 <div className="h-px bg-green-200" />
                                 <div>
                                     <p className="text-xs text-green-700 font-bold mb-1">Privacy Level</p>
                                     <div className="flex items-center gap-2 text-green-600 font-bold">
                                        <Lock size={16} /> 100% Private
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer - CRITICAL FOR UPL */}
                    <div className="bg-gray-50 p-4 rounded-xl flex gap-3 border border-gray-200">
                        <Info size={20} className="text-gray-400 shrink-0" />
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                            <strong>EDUCATIONAL USE ONLY:</strong> Costs and timelines are estimates based on national averages for probate proceedings. This simulator does not constitute legal advice or a guarantee of specific results. Probate laws and fees vary significantly by state and county.
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
