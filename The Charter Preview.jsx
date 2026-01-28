import React, { useState } from 'react';
import { Shield, FileText, Download, Sparkles } from 'lucide-react';

export default function App() {
  const [activeDoc, setActiveDoc] = useState('legacy');

  return (
    <div className="min-h-screen bg-[#FBFBFD] p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-4xl font-black uppercase">Formation Certified.</h1>
        <div className="flex p-1 bg-gray-100 rounded-2xl w-full max-w-md mx-auto">
          <button onClick={() => setActiveDoc('legacy')} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest ${activeDoc === 'legacy' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Legacy Charter</button>
          <button onClick={() => setActiveDoc('state')} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest ${activeDoc === 'state' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>State Filing</button>
        </div>
        <div className="bg-white shadow-2xl rounded-[40px] p-16 border border-gray-100 text-center italic text-gray-300">
           [ High-Fidelity {activeDoc === 'legacy' ? 'Legacy' : 'State'} Document Artifact ]
        </div>
      </div>
    </div>
  );
}