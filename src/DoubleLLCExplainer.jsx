import React, { useState } from 'react';
import { X, Shield, Eye, EyeOff, Check, ArrowRight, Building2, Landmark, Users, Lock, ChevronRight } from 'lucide-react';

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

        <div className="grid lg:grid-cols-5 min-h-[600px]">
          
          {/* Left Panel: The Problem */}
          <div className="lg:col-span-2 bg-[#121212] p-10 md:p-14 border-r border-gray-800 flex flex-col justify-between">
             <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                   <Eye size={12} /> The Exposure Risk
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                   The Florida <br/> Public Record.
                </h2>
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-gray-800 space-y-4 relative overflow-hidden group">
                   <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                   <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Sunbiz.org Inquiry</p>
                   
                   <div className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between items-center opacity-50">
                          <span className="text-gray-400">Entity Name:</span>
                          <span className="text-white">Your Business LLC</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-400">Reg. Agent:</span>
                          <span className="text-gray-500 line-through decoration-red-500/50">Your Home Address</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-gray-400">Manager:</span>
                          <span className="text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded">JOHN DOE</span>
                      </div>
                   </div>
                   
                   <div className="absolute -right-4 -bottom-4 text-red-500/10 transform rotate-[-15deg]">
                      <Eye size={100} />
                   </div>
                </div>
                <p className="text-sm font-medium text-gray-400 leading-relaxed">
                   <span className="text-white font-bold">The Problem:</span> Florida statutes require every LLC to list a human "Authorized Member" or "Manager" on public record. A Registered Agent hides your address, but <span className="text-red-400">not your name</span>.
                </p>
             </div>

             <div className="mt-12 pt-12 border-t border-gray-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Without Double LLC:</p>
                <ul className="space-y-3">
                   {['Name Searchable on Google', 'Tenants Can Find Your Home', 'Junk Mail to Your Door', 'Asset Net Worth Exposed'].map((risk, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-400">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                         {risk}
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* Right Panel: The Solution */}
          <div className="lg:col-span-3 p-10 md:p-14 bg-gradient-to-br from-[#0A0A0B] to-[#111] relative overflow-hidden">
             {/* Background Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
             
             <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00D084]/10 text-[#00D084] rounded-full text-[9px] font-black uppercase tracking-widest border border-[#00D084]/20">
                       <Shield size={12} /> The Double LLC Solution
                    </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                   The Anonymous <br/><span className="text-[#00D084]">Wyoming Shield.</span>
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-[#151516] rounded-3xl p-6 border border-gray-800 hover:border-[#00D084]/30 transition-colors group">
                      <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white mb-4 group-hover:bg-[#00D084] group-hover:text-black transition-colors">
                         <Building2 size={24} />
                      </div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">1. Florida Entity</h4>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">
                         This is your "Operating Company." It does business, signs leases, and takes payments. On public record, its Manager is listed as "Wyoming Holding Co." <span className="text-white font-bold">Not you.</span>
                      </p>
                   </div>

                   <div className="bg-[#151516] rounded-3xl p-6 border border-gray-800 hover:border-[#00D084]/30 transition-colors group">
                      <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white mb-4 group-hover:bg-[#00D084] group-hover:text-black transition-colors">
                         <Landmark size={24} />
                      </div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">2. Wyoming Entity</h4>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed">
                         This is your "Holding Company." It owns the Florida company. Wyoming law does <span className="text-[#00D084] font-bold">NOT</span> require owner names on public filings. Your name stops here.
                      </p>
                   </div>
                </div>

                <div className="bg-[#1A1A1A] rounded-3xl p-8 border border-gray-800 flex items-center gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D084] rounded-full blur-[80px] opacity-10" />
                    <div className="flex-1 space-y-4 relative z-10">
                       <div className="flex gap-1 text-[#00D084]">
                          {[...Array(5)].map((_,i) => <span key={i}>★</span>)}
                       </div>
                       <p className="text-lg md:text-xl font-medium text-white italic leading-relaxed">
                          "I didn't realize how easy it was to find my home address until a disgruntled tenant showed up. The Double LLC structure gave me my peace of mind back."
                       </p>
                       <div>
                          <p className="text-xs font-black text-white uppercase tracking-widest">Sarah J.</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real Estate Investor • Miami, FL</p>
                       </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-800 pt-8">
                   <div className="space-y-1">
                      <p className="text-2xl font-black text-white">5,000+</p>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Structures Formed</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-2xl font-black text-[#00D084]">100%</p>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Legal Anonymity</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-2xl font-black text-white">48h</p>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Avg. Deployment</p>
                   </div>
                </div>

             </div>
          </div>
          
        </div>

        {/* Footer / CTA */}
        <div className="bg-[#050505] p-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-[10px] text-gray-600 font-medium max-w-xl">
              <span className="font-bold text-gray-500 uppercase">UPL Disclosure:</span> This is a corporate structuring strategy for asset protection and privacy. Charter Legacy provides the filing service but does not provide legal or tax advice.
           </p>
           <button onClick={onClose} className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
              Got it <Check size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default DoubleLLCExplainer;
