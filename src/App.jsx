import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { 
  Shield, ArrowRight, Lock, Zap, CheckCircle2, Fingerprint, 
  ChevronRight, X, Building2, Plus, Anchor, 
  History, Settings, HeartPulse, ShieldCheck, Menu, Brain, Check, Star, CreditCard, Loader2, Mail, Monitor, Box, Wind,
  FileCode, MessageSquare, Clock, FileText, Activity, Landmark, Users
} from 'lucide-react';
import VibeGallery from './VibeGallery';
import FoundersBlueprint from './FoundersBlueprint';
import SuccessionSuite from './SuccessionSuite';
import DesignationProtocol from './DesignationProtocol';
import LoginModal from './LoginModal';
import DashboardZenith from './DashboardZenith';
import ZenithDialog from './ZenithDialog';
import RegisteredAgentConsole from './RegisteredAgentConsole';
import SpecSheet from './SpecSheet';
import DoubleLLCExplainer from './DoubleLLCExplainer';

/**
 * CHARTER LEGACY v3.1.0 // THE "RULE OF THREE" REVERSION
 * - RESTORED: "Rule of Three" Package Model (Shield, Professional, Will).
 * - RESTORED: "Folklore" Client Statement.
 * - RETAINED: 10/10 Glassmorphism & Micro-interactions.
 * - REMOVED: Complex Discovery Engine & A/B Testing noise.
 */

// --- SUB-COMPONENTS ---

const DesignAgentNote = ({ agent, note }) => (
  <div className="flex gap-4 p-6 bg-white/40 rounded-3xl border border-white/60 backdrop-blur-md shadow-sm">
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-10 h-10 rounded-full bg-luminous-ink text-white flex items-center justify-center font-black text-xs">
        {agent[0]}
      </div>
      <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">{agent}</span>
    </div>
    <p className="text-[11px] font-medium text-gray-600 italic leading-relaxed">"{note}"</p>
  </div>
);

const HeritageVault = ({ willPackage, handleSelection }) => (
  <section id="protocol" className="py-40 px-6 bg-[#F5F5F7] relative overflow-hidden">
    {/* Technical Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,#FFFFFF_0%,transparent_100%)] opacity-60" />

    <div className="max-w-6xl mx-auto relative z-10">
      {/* The Floating Window */}
      <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.12)] border border-gray-100 p-12 md:p-20 relative overflow-hidden group/window">
          
          {/* Decorative Blur */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Column: Typography & Features */}
            <div className="space-y-12 relative z-10">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
                     <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                     Will • Trust • Estate
                  </div>
                  
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-black">
                     WILL • TRUST <br/>
                     <span className="text-blue-600 underline decoration-4 decoration-blue-100 underline-offset-8">ESTATE.</span>
                  </h2>
                  
                  <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-md">
                    "You built the business for them. Now make sure it actually reaches them. The Heritage Vault bridges the gap between today and forever."
                  </p>
               </div>

               <div className="space-y-4 pt-4">
                  {[
                    'Estate Instructions',
                    'Legacy Protocols',
                    'Generational Triggers',
                    'Heir Access Key'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                       <div className="w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                          <Check size={10} strokeWidth={4} />
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest text-gray-600">{item}</span>
                    </div>
                  ))}
               </div>

               <button onClick={() => handleSelection(willPackage)} className="group bg-[#1D1D1F] text-white pl-8 pr-2 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl flex items-center gap-4 w-fit">
                  Finalize Estate Plan
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <ArrowRight size={16} />
                  </div>
               </button>
            </div>

            {/* Right Column: The Product Card */}
            <div className="relative">
               <div className="bg-gray-50/80 backdrop-blur-xl rounded-[32px] p-10 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-[#1D1D1F] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg">
                     <Anchor size={28} />
                  </div>
                  
                  <h3 className="text-3xl font-black uppercase tracking-tight text-black mb-2">The Heritage Vault</h3>
                  <div className="flex items-baseline gap-2 mb-8">
                     <span className="text-blue-600 font-black text-2xl">$199/yr</span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ One-time setup</span>
                  </div>

                  <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10 italic">
                     A secure bridge for your family. Encrypted instructions for your heirs + physical access keys.
                  </p>

                  <div className="space-y-4 mb-10">
                     {['Encrypted Data Vault', 'Digital Memories', '24/7 Security Audit', 'Generational Access Key', 'Data Broker Shield'].map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <CheckCircle2 size={14} className="text-blue-600" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{f}</span>
                        </div>
                     ))}
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                     <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Protocol Entry</span>
                     <button onClick={() => handleSelection(willPackage)} className="w-12 h-12 bg-[#1D1D1F] text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                        <ArrowRight size={20} />
                     </button>
                  </div>
               </div>
            </div>

          </div>
      </div>
    </div>
  </section>
);

const PackageCard = ({ title, price, icon: Icon, description, features, active, onClick, badge, isDark }) => (
  <div 
    onClick={onClick} 
    className={`group relative transition-all duration-[0.8s] ease-out cursor-pointer p-10 rounded-[40px] border flex flex-col h-full animate-in fade-in slide-in-from-bottom-12 duration-1000 ${
      active 
        ? 'prism-border vitreous-glass shadow-[0_40px_100px_-20px_rgba(0,122,255,0.1)] scale-[1.05] z-10' 
        : 'border-luminous-ink/5 bg-white/40 hover:bg-white/60 hover:shadow-2xl hover:-translate-y-2'
    }`}
  >
    {badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-luminous-ink text-white text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full shadow-xl z-20 flex items-center gap-2">
        <Zap size={10} className="text-luminous-gold" /> {badge}
      </div>
    )}
    
    <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mb-10 transition-all duration-700 ${
      active ? 'bg-luminous-ink text-white rotate-6' : 'bg-white/80 text-gray-400 group-hover:text-luminous-ink'
    } shadow-sm border border-black/5`}>
      <Icon size={30} strokeWidth={1} />
    </div>

    <div className="space-y-4 mb-10 text-left">
       <h3 className="text-4xl font-black tracking-tighter uppercase leading-none text-luminous-ink">{title}</h3>
       <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-black ${active ? 'text-luminous-blue' : 'text-gray-400'}`}>{price}</p>
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">/ one-time</span>
       </div>
       <p className="text-sm font-medium leading-relaxed italic pt-6 border-t mt-6 text-gray-400 border-black/5">
         {description}
       </p>
    </div>

    <div className="space-y-5 mb-12 flex-1">
      {features.map((f, i) => (
        <div key={i} className="flex items-start gap-4 text-[11px] font-bold uppercase tracking-widest leading-snug text-gray-500">
          <CheckCircle2 size={16} className={active ? "text-luminous-blue" : 'text-gray-200'} />
          <span>{f}</span>
        </div>
      ))}
    </div>

    <div className="mt-auto pt-8 border-t border-black/5 flex items-center justify-between">
       <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Protocol Entry</span>
       <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-700 shadow-sm ${
         active ? 'bg-luminous-ink text-white scale-110 shadow-lg' : 'bg-white/80 text-gray-300 group-hover:bg-luminous-ink group-hover:text-white'
       }`}>
          <ArrowRight size={22} strokeWidth={1.5} />
       </div>
    </div>
  </div>
);

const QuoteSection = () => (
  <section id="protocol" className="py-32 px-6 flex justify-center">
    <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="w-16 h-16 bg-[#1D1D1F] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
        <Brain size={32} />
      </div>
      <h2 className="text-3xl md:text-5xl font-medium italic leading-snug text-luminous-ink tracking-tight">
        "We've refined <span className="text-luminous-blue font-bold">30 years</span> of institutional strategy into a single, clean signature. No jargon. No complexity. Just your home, safeguarded."
      </h2>
      <div className="flex items-center justify-center gap-3 pt-4 opacity-30">
        <div className="w-10 h-[0.5px] bg-black" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Charter Legacy Protocol v4.0</span>
        <div className="w-10 h-[0.5px] bg-black" />
      </div>
    </div>
  </section>
);

const TestimonialSection = () => (
  <section className="py-24 px-6 bg-white border-t border-gray-50 relative overflow-hidden">
    <div className="absolute inset-0 dot-overlay opacity-50" />
    <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 relative z-10">
      <div className="flex justify-center gap-1 text-[#D4AF37]">
        {[...Array(5)].map((_,i) => <Star key={i} size={20} fill="currentColor" />)}
      </div>
      <p className="text-2xl md:text-3xl font-medium leading-relaxed text-[#1D1D1F]">
        "I was dreading the Sunbiz paperwork. Charter Legacy handled the filing, the Registered Agent, and the publication automatically. I didn't have to learn a single statute."
      </p>
      <div>
        <div className="font-black uppercase tracking-widest text-sm text-[#1D1D1F]">Michael R.</div>
        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Miami Brand Architect</div>
      </div>
    </div>
  </section>
);




// --- MAIN APPLICATION ---

export default function App() {
  const [view, setView] = useState('landing'); 
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [appUser, setAppUser] = useState(null);
  const [showVibeGallery, setShowVibeGallery] = useState(false);
  const [showDoubleLLCExplainer, setShowDoubleLLCExplainer] = useState(false); // 2. Add showDoubleLLCExplainer state

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
          setAppUser(session.user);
      }
    });

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (appUser) setView('dashboard');
        else setIsLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appUser]);

  const handleDashboardTransition = (user) => {
      setAppUser(user);
      setView('dashboard');
      setSelectedPackage(null);
      setIsLoginOpen(false);
  };

  const formationPackages = [
    { 
      id: 'founder', 
      title: "The Founder’s Shield", 
      price: "$249", 
      icon: ShieldCheck, 
      description: "Institutional privacy for the modern founder. We keep your home address off the grid.", 
      plainEnglish: "Your personal address shouldn't be public. We use our secure Florida office for your official filings so you can build in private.",
      features: ['Private Business Address', 'Mail Scanning Included', 'The Founder’s Guide', 'Heritage Intake Form'] 
    },
    { 
      id: 'medical', 
      title: "The Clinician’s Charter", 
      price: "$499", 
      icon: HeartPulse, 
      description: "Dignified structures for medical professionals. Privacy for those who provide care.", 
      plainEnglish: "For doctors and practitioners. We handle the specialized paperwork needed for a Professional LLC while protecting your home privacy.",
      features: ['Board-Ready Structure', 'Clinician Privacy Forms', 'Regulatory Assistance', 'Heritage Intake Form'] 
    },
    { 
      id: 'contractor', 
      title: "The Builder’s Blueprint", 
      price: "$599", 
      icon: Building2, 
      description: "Solid foundations for trades and contractors. From site-work to state-filing.", 
      plainEnglish: "For those who build Florida. we handle your entity formation and help link your professional license to your new company.",
      features: ['License Linking Support', 'Qualifier Certification', 'Permit-Ready Filing', 'Heritage Intake Form'] 
    }
  ];

  const willPackage = { 
    id: 'will', 
    title: "The Heritage Vault", 
    price: "$199/yr", 
    icon: Anchor, 
    description: "A secure bridge for your family. Encrypted instructions for your heirs.", 
    plainEnglish: "Make sure what you build stays with the people you love. A private, digital vault for your maps, keys, and final instructions.",
    features: ['Encrypted Data Vault', 'Digital Memories (Coming Soon)', '24/7 Security Audit', 'Generational Access Key']
  };

  const handleSelection = (pkg) => {
    setSelectedPackage(pkg);
  };

  if (view === 'dashboard') {
      return <DashboardZenith user={appUser} />;
  }

  return (
    <div className="min-h-screen bg-luminous text-luminous-ink font-sans antialiased selection:bg-luminous-gold selection:text-white relative overflow-x-hidden">
      <ZenithDialog />
      <style>{`
        .bg-mesh { background-image: radial-gradient(at 50% 0%, rgba(29, 29, 31, 0.03) 0, transparent 70%), radial-gradient(at 100% 100%, rgba(0, 122, 255, 0.05) 0, transparent 60%); }
        .text-glow { text-shadow: 0 0 60px rgba(0, 122, 255, 0.15); }
      `}</style>
      
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={handleDashboardTransition} 
      />
      {showVibeGallery && <VibeGallery onClose={() => setShowVibeGallery(false)} />}
      <DoubleLLCExplainer isOpen={showDoubleLLCExplainer} onClose={() => setShowDoubleLLCExplainer(false)} /> {/* 4. Render DoubleLLCExplainer component */}

      <nav className={`fixed top-0 w-full z-50 h-24 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-sm' : 'bg-transparent'} flex items-center justify-between px-6 md:px-12`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
          <div className="w-10 h-10 bg-[#1D1D1F] rounded-xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6 duration-300">
            <ShieldCheck size={22} />
          </div>
          <div className="flex flex-col -space-y-1">
             <span className="font-black text-xl tracking-tighter uppercase">Charter <span className="italic-serif lowercase text-luminous-blue">Legacy</span></span>
             <span className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400">Family & Business Protection</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-12 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
          <button onClick={() => document.getElementById('privacy').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors text-luminous-blue">Privacy Center</button>
          <button onClick={() => document.getElementById('protocol').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors">Heritage Vault</button>
          <button 
            className="bg-[#1D1D1F] text-white px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest"
            onClick={() => appUser ? setView('dashboard') : setIsLoginOpen(true)}
          >
            {appUser ? "Open Dashboard" : "Client Login"}
          </button>
        </div>
      </nav>

      <main>
        <section className="pt-52 pb-32 px-6 text-center">
          <div className="max-w-6xl mx-auto space-y-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
               <Fingerprint size={14} className="text-luminous-blue" />
               <span className="text-gray-400">The Heritage Privacy Plan</span>
            </div>
            
            <h1 className="text-6xl md:text-[9.5rem] font-black tracking-tighter leading-[0.85] uppercase text-luminous-ink animate-in zoom-in-95 duration-1000">
              Your Business.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-luminous-ink via-[#4A4A4A] to-luminous-ink bg-[length:200%_auto] animate-prism-shimmer">Private.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 font-medium italic leading-relaxed tracking-wide animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
              Your home belongs to your family, not the public record. We handle the paperwork and keep your residential address private.
            </p>

            <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-5 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
              <button 
                onClick={() => setView('packages')}
                className="group relative h-16 px-12 rounded-2xl bg-luminous-ink text-white font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center gap-3 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                Launch Entity <ChevronRight size={18} />
              </button>
              <button 
                onClick={() => setShowVibeGallery(true)}
                className="h-16 px-10 rounded-2xl vitreous-glass text-luminous-ink font-black uppercase tracking-widest hover:bg-luminous-ink hover:text-white transition-all flex items-center gap-3 shadow-xl border border-luminous-ink/5"
              >
                Strategy Audit <Monitor size={18} />
              </button>
            </div>
          </div>
        </section>

        <QuoteSection />
        <TestimonialSection />

        <section id="packages" className="py-40 px-6 bg-white border-t border-gray-50 relative overflow-hidden">
           <div className="max-w-[1400px] mx-auto space-y-24">
              <div className="space-y-6 max-w-3xl mx-auto text-center">
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-[#1D1D1F]">Select Your <span className="italic-serif lowercase text-luminous-blue">Foundation.</span></h2>
                <p className="text-lg text-gray-500 font-medium italic leading-relaxed">Personal, professional, or industrial. We make the complex simple.</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 items-stretch pt-8">
                 {formationPackages.map((pkg, idx) => (
                   <div key={pkg.id} className="animate-in fade-in slide-in-from-bottom-12 fill-mode-backwards" style={{ animationDelay: `${idx * 150}ms` }}>
                      <PackageCard 
                        {...pkg} 
                        active={selectedPackage?.id === pkg.id} 
                        onClick={() => handleSelection(pkg)} 
                        isDark={false}
                      />
                   </div>
                 ))}
              </div>
               


               {/* THE SOVEREIGN UPGRADE - DOUBLE LLC HIGHLIGHT */}
               <div className="mt-32 max-w-5xl mx-auto">
                  <div className="relative rounded-[40px] overflow-hidden bg-[#0A0A0B] border border-gray-800 shadow-2xl group cursor-pointer group/sovereign">
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                      <div className="absolute -right-20 -top-40 w-96 h-96 bg-[#00D084] rounded-full blur-[128px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                      
                      <div className="relative z-10 p-12 md:p-20 grid md:grid-cols-2 gap-12 items-center">
                          <div className="space-y-8">
                              <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#1A1A1A] rounded-full border border-gray-800 backdrop-blur-md">
                                  <Shield size={14} className="text-[#00D084] animate-pulse" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00D084]">Maximum Anonymity Protocol</span>
                              </div>
                              
                              <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                                  The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Double LLC</span> <br/> Strategy.
                              </h3>
                              
                              <p className="text-lg text-gray-400 font-medium leading-relaxed">
                                  For founders who demand total invisibility. We form an anonymous Holding Company in Wyoming to own your Florida entity, removing your name from public records entirely.
                              </p>

                              <div className="flex flex-wrap gap-4 pt-4">
                                  {['No Public Name', 'Asset Segregation', 'Wyoming Jurisdiction', 'Institutional Grade'].map((feat, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                          <Check size={12} className="text-[#00D084]" /> {feat}
                                      </div>
                                  ))}
                              </div>

                              <div className="mt-8 flex items-center gap-8">
                                <button 
                                    onClick={() => {
                                        handleSelection({
                                            id: 'sovereign_upgrade',
                                            title: 'The Sovereign Strategy',
                                            price: '$999',
                                            icon: Shield,
                                            description: 'The ultimate privacy architecture. Dual-entity structure for absolute anonymity.',
                                            plainEnglish: 'We set up two companies for you. One in Florida to do business, and one in Wyoming to own the Florida company so your name never appears on Sunbiz.',
                                            features: ['Florida Operating LLC', 'Wyoming Holding LLC', 'Registered Agent for Both', 'EIN for Both', 'Inter-Company Agreement']
                                        });
                                    }}
                                    className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                                >
                                    Deploy Protocol <ArrowRight size={16} />
                                </button>
                                
                                <button 
                                    onClick={() => setShowDoubleLLCExplainer(true)}
                                    className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest border-b border-gray-800 hover:border-white transition-colors pb-1"
                                >
                                    How does it work?
                                </button>
                              </div>
                           </div>

                          {/* Visual Diagram */}
                          <div className="relative h-full min-h-[300px] flex items-center justify-center">
                              <div className="relative z-10 w-64 h-80 bg-[#1A1A1A] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                                  <div className="flex justify-between items-start opacity-50">
                                      <Building2 size={24} className="text-white" />
                                      <div className="w-8 h-5 border-2 border-white/20 rounded-full" />
                                  </div>
                                  <div>
                                      <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Florida Entity</div>
                                      <div className="text-xl font-black text-white">Operating Co.</div>
                                      <div className="h-px w-full bg-gray-800 my-4" />
                                      <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-[#00D084]" />
                                          <span className="text-[10px] font-bold text-gray-400">Manager: Holding Co.</span>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* The Ghost Card */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-12 -ml-12 w-64 h-80 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col justify-between transform -rotate-6 hover:-rotate-12 transition-transform duration-500 z-0">
                                   <div className="flex justify-between items-start opacity-30">
                                      <Landmark size={24} className="text-white" />
                                  </div>
                                  <div className="opacity-50">
                                      <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Wyoming Entity</div>
                                      <div className="text-xl font-black text-white">Holding Co.</div>
                                      <div className="h-px w-full bg-white/10 my-4" />
                                      <div className="flex items-center gap-2">
                                          <Users size={12} className="text-white" />
                                          <span className="text-[10px] font-bold text-gray-300">Owner: You</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
               
               <p className="text-center text-xs text-gray-400 font-medium italic max-w-2xl mx-auto border-t border-gray-100 pt-16 mt-16">
                 * All packages include Florida Registered Agent service, free for the first 12 months. Service automatically renews at $129/year to maintain your privacy shield. Cancel anytime.
                 <br/><br/>
                 * The Double LLC Strategy involves a one-time upgrade fee of $999. It is compatible with all foundation packages.
                 <br/>
                 * Includes 12 months of RA service for BOTH entities. Renews at $250/year total to maintain dual-state anonymity.
               </p>
           </div>
        </section>

        {/* REGISTERED AGENT CONSOLE (THE SOVEREIGN SLAB) */}
        <RegisteredAgentConsole />

        <HeritageVault willPackage={willPackage} handleSelection={handleSelection} />
      </main>

      <footer className="py-32 bg-white text-center flex flex-col items-center gap-10">
         <span className="font-black text-3xl uppercase tracking-tighter">Charter <span className="italic-serif lowercase text-luminous-blue">Legacy</span></span>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em]">Florida Sovereign Business Hub • Since 2024 • v3.1.0</p>
      </footer>

      <SpecSheet 
        item={selectedPackage} 
        isOpen={!!selectedPackage} 
        onClose={() => setSelectedPackage(null)} 
        onSuccess={(user) => handleDashboardTransition(user)}
      />
    </div>
  );
}
