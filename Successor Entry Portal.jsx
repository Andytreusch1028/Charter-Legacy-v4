import React, { useState } from 'react';
import { 
  Key, 
  Shield, 
  ArrowRight, 
  Fingerprint, 
  Timer, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle,
  Mail,
  Lock,
  UserCheck
} from 'lucide-react';

/**
 * SUCCESSOR ENTRY PORTAL v1.0
 * The high-security "Reception Desk" for the Charter Legacy transition.
 * * DESIGN TOKENS:
 * - Palette: Obsidian (#1D1D1F), Legacy Blue (#007AFF)
 * - Radius: [48px] for primary containers
 * - Interaction: active:scale-[0.98]
 */

export default function App() {
  const [step, setStep] = useState('landing'); // 'landing', 'key-entry', 'initiating', 'buffer-active'
  const [keyValue, setKeyValue] = useState('');

  const handleKeyTurn = () => {
    setStep('initiating');
    setTimeout(() => {
      setStep('buffer-active');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased selection:bg-black selection:text-white flex flex-col items-center justify-center p-6">
      
      {/* Institutional Branding */}
      <div className="mb-16 space-y-4 text-center animate-in fade-in duration-1000">
        <div className="w-20 h-20 bg-black rounded-[28px] flex items-center justify-center text-white mx-auto shadow-2xl transition-transform hover:rotate-3">
          <Shield size={40} />
        </div>
        <div className="space-y-1">
          <h2 className="font-black text-2xl uppercase tracking-[0.3em] leading-none">Charter Legacy</h2>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Verified Succession Node</p>
        </div>
      </div>

      <div className="max-w-md w-full relative">
        
        {/* STEP 1: LANDING */}
        {step === 'landing' && (
          <div className="space-y-12 animate-in zoom-in-95 duration-500 text-center">
            <div className="space-y-4">
              <h1 className="text-5xl font-black uppercase tracking-tight leading-[0.9]">The Key<br/>to the Vault.</h1>
              <p className="text-gray-400 font-medium italic leading-relaxed px-4">
                "Jane, you have been designated as a trusted successor for the Treusch & Forge Charter."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                     <UserCheck size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Designated Rider</p>
                     <p className="text-sm font-bold uppercase">Jane Doe (Verified)</p>
                  </div>
               </div>
               <button 
                onClick={() => setStep('key-entry')}
                className="w-full bg-black text-white py-6 rounded-3xl font-black text-lg uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Proceed to Entry <ArrowRight size={24} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: KEY ENTRY */}
        {step === 'key-entry' && (
          <div className="bg-white p-10 rounded-[56px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100 space-y-10 animate-in slide-in-from-right-8 duration-500">
             <div className="space-y-2 text-center">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest font-mono">Sequence 02 // Verification</p>
                <h3 className="text-3xl font-black uppercase tracking-tight">Turn the Key.</h3>
             </div>
             
             <div className="space-y-4">
               <div className="relative group">
                 <input 
                    type="text" 
                    placeholder="CHARTER-KEY-XXXX" 
                    value={keyValue}
                    onChange={(e) => setKeyValue(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-[24px] py-8 text-center font-mono font-bold tracking-[0.2em] text-xl outline-none transition-all placeholder:text-gray-200" 
                 />
                 <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-blue-500 transition-colors" size={24} />
               </div>
               
               <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-red-800 uppercase tracking-wide leading-relaxed">
                    Statutory Notice: Turning this key initiates a succession event and alerts the founder via DeLand Hub Sentinel.
                  </p>
               </div>
             </div>

             <button 
                disabled={keyValue.length < 8}
                onClick={handleKeyTurn}
                className="w-full bg-black text-white py-6 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-300"
              >
                Verify & Initiate
             </button>
          </div>
        )}

        {/* STEP 3: INITIATING */}
        {step === 'initiating' && (
          <div className="text-center space-y-8 animate-in zoom-in duration-500">
             <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.4)] relative">
                <RefreshCw size={48} className="animate-spin" />
                <div className="absolute inset-0 border-4 border-white/20 border-t-white rounded-full" />
             </div>
             <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase tracking-tight">Syncing Hub...</h3>
                <p className="text-gray-400 font-medium italic">Contacting Founder SMS & Email Nodes</p>
             </div>
          </div>
        )}

        {/* STEP 4: BUFFER ACTIVE */}
        {step === 'buffer-active' && (
          <div className="space-y-10 animate-in fade-in duration-1000">
             <div className="bg-black text-white p-10 rounded-[56px] shadow-2xl space-y-10 relative overflow-hidden group">
                <div className="relative z-10 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-red-500">
                         <Timer size={32} />
                         <h3 className="font-black text-2xl uppercase tracking-tight">Veto Buffer Active</h3>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest font-mono text-white/40 italic">Active Count</span>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <p className="text-6xl font-black tracking-tighter tabular-nums leading-none">10:00:00</p>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] pb-1">Days Remaining</p>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-[5%] animate-pulse" />
                      </div>
                   </div>

                   <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                      The Founder has been notified. This cooling-off period ensures security. Once the timer expires, Tier 2 & 3 assets will be released for download.
                   </p>
                </div>
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-red-500/20" />
             </div>

             <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Lock size={24} />
                   </div>
                   <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">Statutory Requirements</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action Items During Buffer</p>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between opacity-50">
                      <span className="text-[10px] font-black uppercase text-gray-400">Upload Incapacity Proof</span>
                      <ArrowRight size={14} className="text-gray-300" />
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between opacity-50">
                      <span className="text-[10px] font-black uppercase text-gray-400">Verified ID Scanned</span>
                      <ArrowRight size={14} className="text-gray-300" />
                   </div>
                </div>
             </div>
             
             <button 
               onClick={() => setStep('landing')}
               className="w-full text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] hover:text-black transition-colors"
             >
                Exit Session
             </button>
          </div>
        )}
      </div>

      {/* Hardware Node Status */}
      <footer className="fixed bottom-12 w-full text-center pointer-events-none opacity-20">
         <div className="flex items-center justify-center gap-3">
            <Fingerprint size={16} />
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">DeLand Hub Node • Institutional Protocol v1.2</p>
         </div>
      </footer>
    </div>
  );
}