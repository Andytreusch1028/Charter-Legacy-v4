import React, { useState } from 'react';
import { 
  Newspaper, 
  FileText, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Info,
  Globe,
  Printer,
  Shield
} from 'lucide-react';

/**
 * DBA PUBLICATION ENGINE v1.0
 * "The Printing Press" - Automating the folklore of F.S. 865.09.
 * * DESIGN TOKENS:
 * - Palette: Obsidian (#1D1D1F), Legacy Blue (#007AFF)
 * - Corner Radius: [48px]
 * - Interaction: active:scale-[0.98]
 */

export default function App() {
  const [status, setStatus] = useState('pending'); // 'pending', 'transmitting', 'verified'
  const [progress, setProgress] = useState(0);

  const startPublicationLoop = () => {
    setStatus('transmitting');
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStatus('verified');
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased selection:bg-black selection:text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-12 text-center animate-in fade-in duration-1000">
        
        {/* Branding Node */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center text-white mx-auto shadow-2xl transition-transform hover:rotate-3">
            <Newspaper size={40} />
          </div>
          <div className="space-y-1">
             <h2 className="font-black text-xl uppercase tracking-[0.3em] leading-none">Charter Legacy</h2>
             <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">F.S. 865.09 Automation Node</p>
          </div>
        </div>

        <div className="space-y-4">
           <h1 className="text-4xl font-black uppercase tracking-tight leading-none text-[#1D1D1F]">The Magic Wand.</h1>
           <p className="text-gray-400 font-medium italic px-8">
              Florida law requires a physical notice. We automate the bureaucracy and vault the digital proof.
           </p>
        </div>

        {/* The Console */}
        <div className="bg-white rounded-[56px] p-10 md:p-12 border border-gray-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] space-y-10 relative overflow-hidden text-left">
          
          {/* Progress Sentinel Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50">
             <div 
               className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,122,255,0.5)]" 
               style={{ width: `${progress}%` }} 
             />
          </div>

          <div className="space-y-10">
            {/* Step 1: Drafting */}
            <div className={`flex items-center gap-6 transition-all duration-500 ${progress < 10 ? 'opacity-30 grayscale' : 'opacity-100'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${progress >= 30 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                <FileText size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-sm uppercase tracking-tight">Drafting Statutory Notice</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">Template: Fictitious Name Act</p>
              </div>
              {progress >= 30 && <CheckCircle2 size={20} className="ml-auto text-green-500 animate-in zoom-in" />}
            </div>

            {/* Step 2: Transmission */}
            <div className={`flex items-center gap-6 transition-all duration-500 ${progress < 40 ? 'opacity-30 grayscale' : 'opacity-100'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${progress >= 70 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Zap size={24} fill={progress >= 70 ? "currentColor" : "none"} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-sm uppercase tracking-tight">Press Transmission</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">Target: FPA Statewide Node</p>
              </div>
              {progress >= 70 && <CheckCircle2 size={20} className="ml-auto text-green-500 animate-in zoom-in" />}
            </div>

            {/* Step 3: Vaulting */}
            <div className={`flex items-center gap-6 transition-all duration-500 ${progress < 80 ? 'opacity-30 grayscale' : 'opacity-100'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${progress >= 100 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                <ShieldCheck size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-sm uppercase tracking-tight">E-POP Vaulting</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">Digital Affidavit Captured</p>
              </div>
              {progress >= 100 && <CheckCircle2 size={20} className="ml-auto text-green-500 animate-in zoom-in" />}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-6">
            {status === 'pending' && (
              <button 
                onClick={startPublicationLoop}
                className="w-full bg-black text-white py-6 rounded-[24px] font-black text-xl uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
              >
                Execute Publication <ArrowRight size={24} />
              </button>
            )}

            {status === 'transmitting' && (
              <div className="w-full py-6 bg-gray-50 rounded-[24px] flex items-center justify-center gap-4 text-gray-400 font-black uppercase text-sm tracking-widest">
                <Clock size={20} className="animate-spin" />
                Processing statutory run...
              </div>
            )}

            {status === 'verified' && (
              <div className="w-full p-8 bg-green-50 rounded-[32px] border border-green-100 space-y-4 animate-in zoom-in-95">
                 <div className="flex items-center gap-3 text-green-700">
                    <CheckCircle2 size={24} />
                    <h4 className="font-black uppercase tracking-tight">Loop Complete</h4>
                 </div>
                 <p className="text-xs text-green-600 font-medium leading-relaxed italic">
                    Your legal notice has been dispatched. Monitoring `floridapublicnotices.com` for the final e-POP artifact.
                 </p>
                 <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95">
                    View Digital Record
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Reference */}
        <div className="flex flex-col items-center gap-6 opacity-30 group cursor-default">
           <div className="flex items-center gap-4">
              <Globe size={16} />
              <div className="h-[1px] w-12 bg-gray-300" />
              <Printer size={16} />
           </div>
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] text-center max-w-xs leading-loose">
              Direct connection to the Florida Press Association statutory aggregator.
           </p>
        </div>

      </div>

      {/* Background Decorative Element */}
      <div className="fixed top-0 right-0 p-12 pointer-events-none opacity-5">
         <Shield size={200} />
      </div>
    </div>
  );
}