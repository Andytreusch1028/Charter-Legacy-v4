import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Activity, Check, BarChart2, Zap, ShieldCheck, Anchor } from 'lucide-react';

const AIGrowthConsole = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [approved, setApproved] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-[#1D1D1F] font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#FBFBFD] w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden relative border border-white/20 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">AI Growth Engine</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Awaiting Java Backend (Mock Data)
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          
          {/* Ongoing Test Performance */}
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-2">Active A/B Test Variants (Phase 1)</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { id: 'A', name: 'Lifecycle', ctr: '4.2%', cvr: '1.1%', icon: Zap, title: "Start. Shield. Sustain." },
                { id: 'B', name: 'Privacy', ctr: '5.8%', cvr: '0.8%', icon: ShieldCheck, title: "Anonymity by Default." },
                { id: 'C', name: 'Legacy', ctr: '3.1%', cvr: '1.5%', icon: Anchor, title: "Build it. Protect it. Pass it on." },
              ].map((v) => (
                <div key={v.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-lg text-gray-500 border border-gray-100">Variant {v.id}</span>
                     <v.icon size={16} className="text-gray-300" />
                  </div>
                  <h4 className="font-bold text-sm mb-6">&quot;{v.title}&quot;</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">CTR (Clicks)</span>
                        <div className="text-xl font-black text-blue-600">{v.ctr}</div>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">CVR (Conv.)</span>
                        <div className="text-xl font-black text-green-600">{v.cvr}</div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Proposal (Human in the Loop) */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Pending AI Approval (HitL)</h3>
                 <span className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-md">Action Required</span>
             </div>

             <div className="bg-[#1D1D1F] text-white rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
                
                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                   <div>
                       <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-full mb-6">
                           <Brain size={14} /> AI Growth Engineer Action
                       </div>
                       <h4 className="text-2xl font-black uppercase tracking-tight mb-4">Ollama Analysis:</h4>
                       <p className="text-gray-400 text-sm italic leading-relaxed mb-6">
                           "Variant B (Privacy) is generating the highest curiosity (5.8% CTR), but Variant C (Legacy) is converting those clicks into firm formations at nearly double the rate (1.5% CVR). I have synthesized a Challenger Variant that utilizes the high-intent privacy hook of B, and closes with the logistical succession certainty of C."
                       </p>
                   </div>

                   <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                       <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-3">Proposed Challenger (Variant D)</span>
                       <h5 className="text-2xl font-black text-white mb-2 leading-tight">The Private Path to a Lasting Legacy.</h5>
                       <p className="text-sm text-gray-300 italic mb-8">
                           "Why choose between privacy today and security tomorrow? Charter Legacy provides the administrative framework to keep your business off the public radar while ensuring a seamless transition for the next generation."
                       </p>
                       
                       <div className="flex items-center gap-4">
                           {approved ? (
                               <div className="w-full py-4 rounded-xl bg-green-500/20 text-green-400 font-black tracking-widest uppercase text-xs flex items-center justify-center gap-2 border border-green-500/30">
                                   <Check size={16} /> Added to Rotation
                               </div>
                           ) : (
                               <>
                                   <button 
                                      onClick={() => setApproved(true)}
                                      className="flex-1 bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform flex items-center justify-center gap-2"
                                   >
                                      Approve & Deploy
                                   </button>
                                   <button className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-colors">
                                      Reject
                                   </button>
                               </>
                           )}
                       </div>
                   </div>
                </div>
             </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
};

export default AIGrowthConsole;
