import React, { useState } from 'react';
import { 
  Shield, 
  Briefcase, 
  Check, 
  ArrowRight, 
  Info,
  Scale,
  Sparkles,
  Cpu,
  Target,
  Zap,
  ChevronRight
} from 'lucide-react';

/**
 * DISCOVERY ONBOARDING v1.0
 * The "First Choice Screen" of the Charter Legacy ecosystem.
 * * RUTHLESS PRIORITIZATION:
 * - Only LLC (Protection) and DBA (Brand) are offered to ensure 10/10 execution.
 * * UPL COMPLIANCE:
 * - Employs the "Librarian Model" where users select based on statutory features.
 */

// --- Sub-Components ---

const EntityCard = ({ title, icon: Icon, description, features, active, onClick, price }) => (
  <div 
    onClick={onClick}
    className={`group relative transition-all duration-700 cursor-pointer p-10 rounded-[56px] border-2 flex flex-col h-full ${
      active 
        ? 'border-black bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] scale-[1.02]' 
        : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 opacity-80 hover:opacity-100'
    }`}
  >
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 ${
      active ? 'bg-black text-white shadow-xl' : 'bg-white text-gray-400 group-hover:text-black shadow-sm'
    }`}>
      <Icon size={32} />
    </div>
    
    <div className="space-y-2 mb-6">
       <h3 className="text-4xl font-black mb-1 tracking-tighter uppercase leading-none">{title}</h3>
       <p className="text-gray-400 text-sm italic font-medium leading-relaxed">{description}</p>
    </div>
    
    <div className="space-y-4 mb-12">
      {features.map((f, i) => (
        <div key={i} className="flex items-start gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">
          <Check size={14} className={active ? 'text-blue-500' : 'text-gray-300'} strokeWidth={3} />
          <span>{f}</span>
        </div>
      ))}
    </div>

    <div className="mt-auto pt-8 border-t border-gray-100 flex items-end justify-between">
       <div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Charter Fee</p>
          <p className={`text-3xl font-black transition-colors ${active ? 'text-[#1D1D1F]' : 'text-gray-300'}`}>
            {price}
          </p>
       </div>
       <div className={`p-4 rounded-full transition-all duration-500 ${active ? 'bg-black text-white' : 'bg-gray-100 text-gray-300 group-hover:bg-black group-hover:text-white'}`}>
          <ChevronRight size={24} />
       </div>
    </div>

    {active && (
      <div className="absolute top-10 right-10 text-black animate-in fade-in zoom-in duration-500">
        <div className="bg-blue-500 text-white rounded-full p-1 shadow-lg">
          <Check size={16} strokeWidth={4} />
        </div>
      </div>
    )}
  </div>
);

export default function App() {
  const [choice, setChoice] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const entities = [
    {
      id: 'LLC',
      title: 'LLC',
      icon: Shield,
      price: '$249',
      description: 'Florida Statute 605. The modern instrument for asset protection and privacy.',
      features: [
        'Separates Personal & Business Liability',
        'Privacy Shield (Home Address Suppressed)',
        'Pass-through Taxation (IRS Standard)',
        'Legacy Vault & Succession Ready'
      ]
    },
    {
      id: 'DBA',
      title: 'DBA',
      icon: Briefcase,
      price: '$149',
      description: 'Florida Statute 865. Register a professional alias for your brand or nickname.',
      features: [
        'Official Name Registration (Fictitious Name)',
        'Automated Newspaper Publication Loop',
        'Direct Link to Personal/Entity Identity',
        'e-POP Digital Affidavit Vaulting'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased selection:bg-black selection:text-white p-6 md:p-12 lg:p-24 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-24">
        
        {/* Header Section */}
        <header className="max-w-3xl space-y-8 animate-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 mb-12 group cursor-default">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-3">
              <Shield size={22} strokeWidth={2.5} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">Charter Legacy</span>
          </div>
          
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                <Cpu size={14} /> Discovery Engine Active
             </div>
             <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
                Pick your<br/>tool<span className="text-blue-500">.</span>
             </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed max-w-2xl">
            Statutes define the characteristics. You define the intent. Select the architectural instrument that matches your dream.
          </p>
        </header>

        {/* Discovery Grid */}
        <div className="grid md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          {entities.map(e => (
            <EntityCard 
              key={e.id}
              {...e}
              active={choice === e.id}
              onClick={() => {
                setChoice(e.id);
                setConfirmed(false);
              }}
            />
          ))}
        </div>

        {/* The Action Panel (Librarian model verification) */}
        <div className={`transition-all duration-1000 ease-in-out ${choice ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}>
          <div className="bg-white border border-gray-100 rounded-[64px] p-10 md:p-16 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.1)] max-w-4xl mx-auto space-y-12 relative overflow-hidden">
            
            <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
              <div className="bg-blue-50 text-blue-600 p-5 rounded-3xl shadow-sm border border-blue-100">
                <Info size={32} />
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-2xl uppercase tracking-tight">Neutral Statutory Disclosure</h4>
                <p className="text-gray-500 text-lg leading-relaxed font-medium italic">
                  Charter Legacy is a high-tech clerical preparation service. Your selection of a **{choice}** is an active decision based on your own evaluation of your business architecture. We provide the tools; you provide the intent.
                </p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
               <div 
                 className="flex items-center gap-6 cursor-pointer group w-fit"
                 onClick={() => setConfirmed(!confirmed)}
               >
                 <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${confirmed ? 'bg-black border-black text-white shadow-lg' : 'border-gray-200 group-hover:border-black'}`}>
                   {confirmed && <Check size={22} strokeWidth={4} />}
                 </div>
                 <span className="text-sm font-black uppercase tracking-widest text-[#1D1D1F]">I confirm this selection matches my intent.</span>
               </div>

               <button 
                 disabled={!confirmed}
                 className="w-full bg-black text-white rounded-[28px] py-8 font-black text-2xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:opacity-95 transition-all shadow-2xl active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none disabled:cursor-not-allowed group"
               >
                 Configure {choice} <ArrowRight size={32} className="transition-transform group-hover:translate-x-2" />
               </button>
            </div>

            {/* Decorative Background Aura */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />
          </div>
        </div>

        {/* Footer Hardware Status */}
        <footer className="pt-24 pb-12 text-center max-w-lg mx-auto space-y-8 opacity-40">
           <div className="flex items-center justify-center gap-6">
              <div className="h-[1px] flex-1 bg-gray-200" />
              <div className="flex items-center gap-2">
                 <Target size={12} />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">DeLand Hub</span>
              </div>
              <div className="h-[1px] flex-1 bg-gray-200" />
           </div>
          <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.5em] leading-loose">
            High-Tech Scrivener Protocol v1.0 • Built for the Self-Reliant Artisan
          </p>
        </footer>
      </div>

      {/* Static Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-[0.02] z-0">
         <div className="absolute top-1/4 -left-20 w-96 h-96 border-[40px] border-black rounded-full" />
         <div className="absolute bottom-1/4 -right-20 w-64 h-64 border-[20px] border-black rounded-full" />
      </div>
    </div>
  );
}