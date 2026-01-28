import React from 'react';
import { Shield, Lock, FileArchive, Download } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FBFBFD] p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-5xl font-black uppercase">The Freedom Vault.</h1>
        <div className="bg-black text-white rounded-[60px] p-20 shadow-2xl flex flex-col items-center text-center space-y-8">
           <FileArchive size={64} className="text-blue-500" />
           <h3 className="text-4xl font-black uppercase">One Click. Zero Friction.</h3>
           <p className="text-gray-400 max-w-lg">Export your entire institutional history in a single archive. You own your legacy.</p>
           <button className="bg-white text-black px-12 py-6 rounded-3xl font-black uppercase tracking-widest flex items-center gap-4">
              <Download size={24} /> Download Legacy ZIP
           </button>
        </div>
      </div>
    </div>
  );
}