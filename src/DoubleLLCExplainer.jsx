import React, { useState } from 'react';
import { X, Shield, Eye, EyeOff, Check, ArrowRight, Building2, Landmark, Users, Lock, ChevronRight, AlertTriangle, Search, MapPin, BookText, Fingerprint, ShieldAlert, ShieldCheck } from 'lucide-react';

const DoubleLLCExplainer = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Main Modal */}
      <div className="relative w-full max-w-5xl bg-[#0A0A0B] rounded-[48px] border border-gray-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-md"
        >
          <X size={18} />
        </button>

        {/* Center Content: Comparison Sheet */}
        <div className="relative p-12 md:p-20 overflow-hidden">
           {/* Background Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
           
           <div className="relative z-10 flex flex-col items-center space-y-16">
              
              {/* High-Fidelity Protection Matrix */}
              <div className="w-full max-w-4xl space-y-12">
                 
                  {/* Narrative Header: Customer Quote Hero */}
                  <div className="text-center space-y-8">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00D084]/10 text-[#00D084] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00D084]/20 mx-auto">
                        <Users size={12} /> Real Protection Narrative
                     </div>
                     <div className="space-y-6">
                        <div className="flex justify-center gap-1 text-[#00D084]">
                           {[...Array(5)].map((_,i) => <span key={i}>★</span>)}
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black text-white leading-tight max-w-4xl mx-auto italic uppercase">
                           "Charter Legacy kept my business trouble exactly where it belongs: <span className="text-[#00D084] not-italic underline decoration-2 underline-offset-8">Away from my family's front door.</span>"
                        </h3>
                        <div className="pt-2">
                           <p className="text-xs font-black text-white uppercase tracking-widest">David P.</p>
                           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real Estate Investor • Miami, FL</p>
                        </div>
                     </div>
                     <p className="text-lg md:text-xl font-bold text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        The <span className="text-white">Standard LLC</span> protects your mail, but the <span className="text-[#00D084]">Double LLC</span> protects your Home.
                     </p>
                  </div>

                  {/* The Matrix Container */}
                  <div className="bg-[#121212] rounded-[32px] border border-gray-800 overflow-hidden shadow-2xl">
                     {/* Column Headers */}
                     <div className="grid grid-cols-2 bg-white/5 border-b border-gray-800">
                        <div className="p-6 text-center border-r border-gray-800">
                           <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Standard LLC</span>
                        </div>
                        <div className="p-6 text-center bg-[#00D084]/10">
                           <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00D084]">Double LLC</span>
                        </div>
                     </div>

                    <div className="divide-y divide-gray-800/50">
                       {/* Row 1: Identity Exposure */}
                       <div className="grid md:grid-cols-2">
                          <div className="p-8 border-r border-gray-800 space-y-4 relative group">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                      <Fingerprint size={16} />
                                   </div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Public Identity</span>
                                </div>
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded uppercase tracking-tighter border border-red-500/20">Vulnerable</span>
                             </div>
                             <p className="text-xs text-gray-500 font-medium leading-relaxed">Your full name is indexed on Sunbiz.org for any curious searcher or collection agent to find.</p>
                          </div>
                          <div className="p-8 bg-[#00D084]/5 space-y-4 relative group">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-[#00D084]/20 flex items-center justify-center text-[#00D084]">
                                      <EyeOff size={16} />
                                   </div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Total Anonymity</span>
                                </div>
                                <span className="px-2 py-0.5 bg-[#00D084]/20 text-[#00D084] text-[8px] font-black rounded uppercase tracking-tighter border border-[#00D084]/30">Shielded</span>
                             </div>
                             <p className="text-xs text-white font-medium leading-relaxed">Your name stops at the Wyoming layer. You are effectively invisible to public records.</p>
                          </div>
                       </div>

                       {/* Row 2: Asset Seizure Risk */}
                       <div className="grid md:grid-cols-2">
                          <div className="p-8 border-r border-gray-800 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                      <ShieldAlert size={16} />
                                   </div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Asset Seizure</span>
                                </div>
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded uppercase tracking-tighter border border-red-500/20">Exposed</span>
                             </div>
                             <p className="text-xs text-gray-500 font-medium leading-relaxed">Florida single-member LLCs offer weak protection. Judgments can lead to charging orders against your interest.</p>
                          </div>
                          <div className="p-8 bg-[#00D084]/5 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-[#00D084]/20 flex items-center justify-center text-[#00D084]">
                                      <ShieldCheck size={16} />
                                   </div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Asset Fortress</span>
                                </div>
                                <span className="px-2 py-0.5 bg-[#00D084]/20 text-[#00D084] text-[8px] font-black rounded uppercase tracking-tighter border border-[#00D084]/30">Shielded</span>
                             </div>
                             <p className="text-xs text-white font-medium leading-relaxed">Wyoming law provides superior charging order protection. Your ownership is locked behind a secondary legal firewall.</p>
                          </div>
                       </div>

                       {/* Row 3: Local Exposure */}
                       <div className="grid md:grid-cols-2">
                          <div className="p-8 border-r border-gray-800 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                      <Users size={16} />
                                   </div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Direct Service</span>
                                </div>
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded uppercase tracking-tighter border border-red-500/20">Targeted</span>
                             </div>
                             <p className="text-xs text-gray-500 font-medium leading-relaxed">Process servers can easily locate you via your local registered office filings.</p>
                          </div>
                          <div className="p-8 bg-[#00D084]/5 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-[#00D084]/20 flex items-center justify-center text-[#00D084]">
                                      <Building2 size={16} />
                                   </div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Office Isolation</span>
                                </div>
                                <span className="px-2 py-0.5 bg-[#00D084]/20 text-[#00D084] text-[8px] font-black rounded uppercase tracking-tighter border border-[#00D084]/30">Shielded</span>
                             </div>
                             <p className="text-xs text-white font-medium leading-relaxed">Your business is served across state lines. You are insulated from direct, hostile confrontations at home.</p>
                          </div>
                       </div>

                       {/* Row 4: Legacy Control */}
                       <div className="grid md:grid-cols-2">
                          <div className="p-8 border-r border-gray-800 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                      <Lock size={16} />
                                   </div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Personal Link</span>
                                </div>
                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded uppercase tracking-tighter border border-red-500/20">Exposed</span>
                             </div>
                             <p className="text-xs text-gray-500 font-medium leading-relaxed">Your family assets are psychologically linked to your business liabilities in the public eye.</p>
                          </div>
                          <div className="p-8 bg-[#00D084]/5 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-[#00D084]/20 flex items-center justify-center text-[#00D084]">
                                      <Landmark size={16} />
                                   </div>
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Legacy Shield</span>
                                </div>
                                <span className="px-2 py-0.5 bg-[#00D084]/20 text-[#00D084] text-[8px] font-black rounded uppercase tracking-tighter border border-[#00D084]/30">Shielded</span>
                             </div>
                             <p className="text-xs text-white font-medium leading-relaxed">Maintain a clean separation between your wealth and your work. Your legacy remains truly private.</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* High-Conversion Footer */}
                  <div className="flex flex-col items-center space-y-8 pt-8">
                     <div className="text-center space-y-2">
                        <p className="text-[10px] font-black text-[#00D084] uppercase tracking-[0.3em]">Sovereign Architecture Verdict</p>
                        <p className="text-2xl font-black text-white uppercase tracking-tighter">Maximum Personal Defense</p>
                     </div>
                     
                     <div className="flex flex-col sm:flex-row items-center gap-6">
                        <button 
                           onClick={onClose}
                           className="group relative px-10 py-5 bg-[#00D084] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,208,132,0.3)]"
                        >
                           <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                           <div className="relative flex items-center gap-3">
                              <span className="text-sm font-black text-black uppercase tracking-widest">Upgrade to Double LLC</span>
                              <Shield size={18} className="text-black" />
                           </div>
                        </button>
                        
                        <button 
                           onClick={onClose}
                           className="text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                           Keep Standard LLC
                        </button>
                     </div>
                  </div>

              </div>

           </div>
        </div>

      </div>
    </div>
  );
};

export default DoubleLLCExplainer;
