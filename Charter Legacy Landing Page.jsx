import React, { useState } from 'react';
import { Shield, ArrowRight, Check, Cpu, Globe, Building2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans selection:bg-black selection:text-white">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">Charter</span>
          </div>
          <button className="bg-black text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest">Launch Entity</button>
        </div>
      </nav>

      <section className="pt-40 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <Cpu size={14} /> The High-Tech Scrivener Protocol
          </div>
          <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] uppercase">Your Business,<br/>Defined.</h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 font-medium">We've automated 30 years of Florida legal folklore into a single, seamless engine. No beige forms. No hidden traps. Just your legacy, secured.</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
            <button className="w-full md:w-auto bg-black text-white px-12 py-7 rounded-full font-bold text-xl flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-2xl">
              Open Your Charter <ArrowRight size={28} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}