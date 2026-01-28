import React from 'react';
import { Brain, Fingerprint, Target, ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] flex">
      <aside className="w-[400px] bg-white border-r border-gray-100 p-8 flex flex-col space-y-12 h-screen shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white"><Brain size={24} /></div>
          <h2 className="font-black text-xl uppercase tracking-tighter">Letta Memory</h2>
        </div>
        <div className="p-6 bg-black text-white rounded-[32px] space-y-2">
          <div className="flex items-center gap-2 text-blue-400"><Fingerprint size={16} /><span className="text-[10px] font-black uppercase">Active Context</span></div>
          <p className="text-sm opacity-80 italic">"Founder intends to scale into national distribution by Year 3."</p>
        </div>
        <div className="space-y-4">
          <div className="p-5 bg-gray-50 rounded-[32px] border border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-400">Risk Profile: Privacy Priority</div>
        </div>
      </aside>
    </div>
  );
}