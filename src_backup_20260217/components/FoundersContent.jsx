import React from 'react';
import { Building2, FileText, Landmark, ArrowRight } from 'lucide-react';

export const EINContent = ({ companyName }) => (
  <>
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#007AFF]">
       <Building2 size={32} />
    </div>
    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Federal Tax ID</h2>
    <div className="bg-white p-8 rounded-2xl shadow-sm text-left border border-gray-200/50">
       <div className="space-y-4 font-mono text-sm text-gray-600">
          <div className="flex justify-between border-b border-gray-100 pb-2">
             <span>Entity Name:</span>
             <span className="font-bold text-black">{companyName}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
             <span>EIN Status:</span>
             <span className="font-bold text-[#00D084]">Pending IRS Assignment</span>
          </div>
          <p className="pt-2 text-xs text-gray-400 italic">
             * Note: The IRS creates this number digitally. Once assigned, your CP-575 letter will appear here automatically.
          </p>
       </div>
    </div>
  </>
);

export const OAContent = ({ companyName }) => (
  <>
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#007AFF]">
       <FileText size={32} />
    </div>
    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Operating Agreement Template</h2>
    <p className="text-gray-500 font-medium">
      This multi-member agreement defines the ownership structure (Membership Units) and management rules for <strong>{companyName}</strong>.
    </p>
    <div className="h-64 bg-white rounded-xl border border-gray-200 w-full opacity-60 flex items-center justify-center relative overflow-hidden">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-50"></div>
       <p className="font-serif italic text-gray-300 text-2xl">Document Template</p>
    </div>
  </>
);

export const BankContent = ({ companyName }) => (
  <>
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#007AFF]">
       <Landmark size={32} />
    </div>
    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Banking Resolution</h2>
    <div className="bg-white p-8 rounded-2xl shadow-sm text-left border border-gray-200/50">
       <p className="text-sm font-medium text-gray-600 leading-relaxed mb-6">
          "Resolved, that the Members are hereby authorized to open bank accounts in the name of <span className="font-bold text-black">{companyName}</span>..."
       </p>
       
       <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400">
                <FileText size={18} />
             </div>
             <div>
                <p className="font-bold text-black text-sm">Resolution_Form_v2.pdf</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#00D084]">Ready to Sign</p>
             </div>
          </div>
       </div>

       {/* BANKING INTEGRATION SECTION */}
       <div className="mt-8 p-6 bg-[#007AFF]/5 rounded-2xl border border-[#007AFF]/10 text-left space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-[#007AFF] uppercase text-xs tracking-widest">Suggested Banking Integrations</h4>
          </div>
          
          <div className="grid gap-3">
             {/* Mercury */}
             <a href="https://mercury.com/partner/charter-legacy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-[#007AFF] hover:shadow-md transition-all group">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center font-black text-xs text-white">M</div>
                    <span className="font-bold text-black group-hover:text-[#007AFF] transition-colors">Mercury</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-[#007AFF] flex items-center gap-1">
                    Open Account <ArrowRight size={12} />
                 </span>
             </a>

             {/* Chase */}
             <a href="https://www.chase.com/business" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-[#007AFF] hover:shadow-md transition-all group">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#117ACA] flex items-center justify-center font-black text-xs text-white">C</div>
                    <span className="font-bold text-black group-hover:text-[#007AFF] transition-colors">Chase for Business</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-[#007AFF] flex items-center gap-1">
                    Apply Online <ArrowRight size={12} />
                 </span>
             </a>

             {/* Relay */}
             <a href="https://relayfi.com/partners" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-[#007AFF] hover:shadow-md transition-all group">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#36C5F0] flex items-center justify-center font-black text-xs text-white">R</div>
                    <span className="font-bold text-black group-hover:text-[#007AFF] transition-colors">Relay Financial</span>
                 </div>
                 <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-[#007AFF] flex items-center gap-1">
                    Partner Link <ArrowRight size={12} />
                 </span>
             </a>
          </div>
          
          <p className="text-[10px] text-gray-400 font-medium italic pt-2 border-t border-[#007AFF]/10">
             * UPL Disclaimer: We provide the resolution form. You select the bank.
          </p>
       </div>
    </div>
  </>
);
