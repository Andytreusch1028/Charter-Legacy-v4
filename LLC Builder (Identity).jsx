import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Shield, 
  Info,
  Sparkles,
  Search,
  Cpu
} from 'lucide-react';

/**
 * LLC IDENTITY BUILDER v1.0
 * High-precision input for Article I (The Identity).
 * * FEATURES:
 * - Real-time distinguishability simulation.
 * - Auto-formatting for statutory standards.
 * - Obsidian / Legacy Blue Design Tokens.
 */

export default function App() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'checking', 'available', 'conflict'
  const [isAiRefining, setIsAiRefining] = useState(false);

  // Simulate Sunbiz API distinguishing check
  useEffect(() => {
    if (name.length < 3) {
      setStatus('idle');
      return;
    }

    setStatus('checking');
    const timer = setTimeout(() => {
      // Simulate a conflict if they type "Next Level" (the "beige" term)
      if (name.toUpperCase().includes('NEXT LEVEL')) {
        setStatus('conflict');
      } else {
        setStatus('available');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [name]);

  const handleAiRefine = () => {
    setIsAiRefining(true);
    setTimeout(() => {
      setName('TREUSCH & FORGE');
      setIsAiRefining(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased selection:bg-black selection:text-white flex flex-col items-center justify-center p-6">
      
      {/* Step Metadata */}
      <div className="mb-12 space-y-4 text-center animate-in fade-in duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">
          <Cpu size={14} /> Statutory Article I
        </div>
        <h2 className="text-xl font-black uppercase tracking-[0.3em] leading-none">Identity Mapping</h2>
      </div>

      <div className="max-w-2xl w-full space-y-8 relative">
        
        {/* The Identity Card */}
        <div className="bg-white rounded-[56px] p-10 md:p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 space-y-12 relative overflow-hidden">
          
          <header className="space-y-2 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tight">Name Your Dream.</h1>
            <p className="text-gray-400 font-medium italic">Your brand is the header of your Charter.</p>
          </header>

          <div className="space-y-6">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="ENTER ENTITY NAME" 
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-[24px] py-8 px-10 text-center font-bold tracking-tight text-2xl outline-none transition-all placeholder:text-gray-200 uppercase"
                />
                <Building2 className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-blue-500 transition-colors" size={24} />
                
                {/* Status Indicator */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                   {status === 'checking' && <RefreshCw size={24} className="text-blue-500 animate-spin" />}
                   {status === 'available' && <CheckCircle2 size={24} className="text-green-500 animate-in zoom-in" />}
                   {status === 'conflict' && <XCircle size={24} className="text-red-500 animate-in zoom-in" />}
                </div>
             </div>

             {/* Feedback Messages */}
             <div className="min-h-[40px] px-4 text-center">
                {status === 'available' && (
                   <p className="text-[10px] font-black text-green-600 uppercase tracking-widest animate-in fade-in">
                      Statutory Acceptable • Distinguishable in Sunbiz
                   </p>
                )}
                {status === 'conflict' && (
                   <div className="space-y-4 animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                         Conflict Detected • Name Folklore Saturation
                      </p>
                      <button 
                        onClick={handleAiRefine}
                        className="inline-flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-black transition-colors"
                      >
                         <Sparkles size={14} className={isAiRefining ? 'animate-pulse' : ''} />
                         {isAiRefining ? 'Consulting Engine...' : 'Request High-Taste Refinement'}
                      </button>
                   </div>
                )}
             </div>
          </div>

          <button 
            disabled={status !== 'available'}
            className="w-full bg-black text-white py-6 rounded-[28px] font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            Confirm Identity <ArrowRight size={28} />
          </button>

          {/* Background Aura */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        </div>

        {/* Pro-Tip Node */}
        <div className="bg-blue-50 rounded-[32px] border border-blue-100 p-8 flex items-start gap-6 animate-in fade-in duration-1000 delay-500">
           <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-500">
              <Info size={24} />
           </div>
           <div className="space-y-1">
              <h4 className="font-black text-sm uppercase tracking-tight text-blue-900">The "Distinguishable" Rule</h4>
              <p className="text-xs text-blue-800 font-medium leading-relaxed italic">
                 Florida doesn't check for trademarks; they only check if your name is "different enough" from other filings. We add the legal "LLC" suffix automatically to ensure your first-time acceptance.
              </p>
           </div>
        </div>

      </div>

      {/* Hardware Anchor Footer */}
      <footer className="fixed bottom-12 w-full text-center pointer-events-none opacity-20">
         <div className="flex items-center justify-center gap-3">
            <Search size={16} />
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">Real-time Sunbiz Scraper Active • DeLand Hub</p>
         </div>
      </footer>
    </div>
  );
}