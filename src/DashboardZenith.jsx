import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, FileText, CheckCircle2, AlertCircle, 
  ChevronRight, Lock, Activity, RefreshCw, LogOut, Settings,
  Copy, Download, Eye, EyeOff, MessageSquare, ShieldCheck, Fingerprint, Trash2, Scale, Building2
} from 'lucide-react';
import { supabase } from './lib/supabase';

import { useSuccession } from './lib/succession/useSuccession';
import { motion, AnimatePresence } from 'framer-motion';
import { canAccessComponent } from './lib/rbac.config';

import FoundersBlueprint from './FoundersBlueprint';
import SuccessionSuite from './lib/succession/SuccessionSuite';
import VaultTile from './components/VaultTile';
import ProbateSimulator from './components/ProbateSimulator';
import BusinessSelector from './components/BusinessSelector';
import BusinessStoryTimeline from './components/BusinessStoryTimeline';
import ActiveProtectionTriad from './components/ActiveProtectionTriad';
import ActionAlerts from './components/dashboard/ActionAlerts';
import DashboardModals from './components/dashboard/DashboardModals';
import { useDashboardData } from './hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';

const DashboardZenith = ({ user, initialData }) => {
  const navigate = useNavigate();
  const { openVault, protocolData, setProtocolData } = useSuccession();
  
  const {
      loading,
      llcData,
      setLlcData,
      allLlcs,
      activeDBA,
      newDocCount,
      showDesignation,
      setShowDesignation
  } = useDashboardData(user, initialData, setProtocolData);

  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [blueprintStep, setBlueprintStep] = useState('ein');
  const [isRAConsoleOpen, setIsRAConsoleOpen] = useState(false);
  const [isAnnualReportWizardOpen, setIsAnnualReportWizardOpen] = useState(false);
  const [isDBAWizardOpen, setIsDBAWizardOpen] = useState(false);
  const [isDBARenewalWizardOpen, setIsDBARenewalWizardOpen] = useState(false);
  const [isReinstatementWizardOpen, setIsReinstatementWizardOpen] = useState(false);
  const [isDissolutionWizardOpen, setIsDissolutionWizardOpen] = useState(false);
  const [isCertStatusWizardOpen, setIsCertStatusWizardOpen] = useState(false);
  
  // Gatekeeper Role check for UI rendering
  const currentRole = user?.user_metadata?.role || 'customer';
  const hasBlueprintAccess = canAccessComponent(currentRole, 'FoundersBlueprint');
  const hasRAAccess = canAccessComponent(currentRole, 'RegisteredAgentConsole');
  const hasReportAccess = canAccessComponent(currentRole, 'AnnualReportWizard');
  const hasVaultAccess = canAccessComponent(currentRole, 'SuccessionSuite');
  
  // Agent Access Bypass (Localhost Only)
  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      window.__antigravity_open_vault = () => openVault();
    }
  }, [openVault]);
  
  // Steve Mode: Power Tools
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(llcData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${(llcData?.llc_name || 'export').replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(llcData, null, 2));
  };

  // Keyboard Shortcuts (Steve Mode)
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        switch(e.key.toLowerCase()) {
            case 'b': setIsBlueprintOpen(true); break;
            case 'v': openVault(); break;
            case 'r': setIsRAConsoleOpen('dashboard'); break;
            case 'p': setIsRAConsoleOpen('privacy'); break;
            case 'm': setIsRAConsoleOpen('messaging'); break;
            case 'escape':
                setIsBlueprintOpen(false);
                setIsRAConsoleOpen(false);
                setShowDesignation(false);
                break;
            default: break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleDesignationSuccess = async (fallbackData) => {
      // Re-fetch data to update UI
      setShowDesignation(false);
      
      if (fallbackData) {
          setLlcData(fallbackData);
          return;
      }

      const { data } = await supabase.from('llcs').select('*').eq('user_id', user.id).single();
      if (data) setLlcData(data);
  };

  const handleDemoAccess = () => {
      setLlcData({
          llc_name: "Charter Legacy Demo LLC",
          llc_status: "Active",
          privacy_shield_active: true,
          created_at: new Date().toISOString()
      });
      setShowDesignation(false);
  };

  return (
    <>

      <div className="min-h-screen bg-[#0A0A0B] text-white font-sans antialiased flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
      
      {/* Dark Mode Background Effects */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-luminous-blue/10 rounded-full blur-[150px] pointer-events-none opacity-50" />
      <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-[#d4af37]/5 rounded-full blur-[150px] pointer-events-none opacity-50" />
      <div className="fixed inset-0 dot-overlay opacity-10 pointer-events-none invert" />

      {/* The Obsidian Slab */}
      <div className={`w-full max-w-screen-2xl min-h-screen md:min-h-[900px] rounded-[48px] flex flex-col md:flex-row relative z-10 border border-white/5 bg-black/40 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-1000 overflow-hidden shadow-[0_0_100px_rgba(0,122,255,0.05)] transition-all`}>
        
        <main className={`flex-1 p-12 md:p-24 lg:p-32 flex flex-col transition-all duration-700`}>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-2xl w-3/4"></div>
                    <div className="flex gap-12 pt-8">
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                    </div>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    
                    {/* --- MULTIPLE LLC INTERSTITIAL --- */}
                    {!llcData && allLlcs.length > 1 ? (
                        <motion.div 
                           key="selector"
                           initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                           animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                           exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                           transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                           className="-m-12 md:-m-24 lg:-m-32"
                        >
                           <BusinessSelector llcs={allLlcs} onSelect={(selectedLlc) => {
                              setLlcData(selectedLlc);
                              if (selectedLlc.llc_name.includes('Pending Formation') || selectedLlc.llc_status === 'Setting Up') {
                                  setShowDesignation(true);
                              }
                           }} />
                        </motion.div>
                    ) : !llcData || llcData?.llc_status === 'Setting Up' ? (
                        <motion.div 
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-2xl text-left pt-10"
                        >
                            <div className="w-16 h-16 bg-[#1c1c1e] rounded-2xl mb-12 shadow-2xl flex items-center justify-center text-[#d4af37] border border-white/5 rotate-3">
                                <ShieldCheck size={32} strokeWidth={1.5} />
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9]">
                                Secure Your<br/><span className="text-luminous-blue">Foundation.</span>
                            </h1>
                            
                            <p className="text-gray-500 font-medium text-xl mb-16 max-w-lg leading-relaxed italic">
                                "The path to institutional privacy is one signature away. Let us finalize the architecture of your Florida entity."
                            </p>

                            <div 
                               onClick={() => setShowDesignation(true)}
                               className="bg-white/5 p-2 rounded-[2.5rem] shadow-2xl border border-white/10 hover:scale-[1.02] transition-transform cursor-pointer group mb-12"
                            >
                                <div className="bg-[#1c1c1e] text-white rounded-[2rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-white/5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-luminous-blue/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                                    <div className="text-left relative z-10">
                                        <div className="flex items-center gap-3 mb-4 text-[#d4af37] font-bold uppercase tracking-[0.3em] text-[10px]">
                                            <div className="w-2.5 h-2.5 bg-[#d4af37] rounded-full animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.8)]"></div>
                                            Strategy Required
                                        </div>
                                        <h3 className="text-4xl font-black uppercase tracking-tight mb-4 leading-none text-white">Initialize Charter</h3>
                                        <p className="text-gray-500 font-medium italic">Naming, Addresses, and Privacy Protocols.</p>
                                    </div>
                                    
                                    <button className="bg-white text-black px-12 py-6 rounded-2xl font-black uppercase tracking-widest group-hover:bg-[#d4af37] transition-all flex items-center gap-3 text-xs shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] whitespace-nowrap relative z-10">
                                        Begin Entry <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>



                            <p className="mt-12 text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">
                                Secure Initialization Sequence • 256-bit Encrypted
                            </p>

                            {/* DEMO BYPASS BUTTON */}
                            <button 
                                onClick={handleDemoAccess}
                                className="mt-8 bg-[#0A0A0B] text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl"
                            >
                                Open Dashboard
                            </button>
                        </motion.div>
                    ) : ( 
                        /* --- ACTIVE STATE (FULL DASHBOARD: "Command Center") --- */
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -20 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="w-full"
                        >
                             {/* Focused Header Section */}
                            <div className="flex flex-col mb-16 relative">
                                <div className="absolute top-0 right-0 flex items-center gap-4">
                                     <button 
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all active:scale-95"
                                     >
                                         <LogOut size={14} /> Log Out
                                     </button>

                                     {allLlcs.length > 1 && (
                                         <button 
                                            onClick={() => setLlcData(null)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1c1c1e] border border-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-white transition-all active:scale-95 shadow-lg"
                                         >
                                             <Building2 size={14} /> Switch Entity
                                         </button>
                                     )}
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-2.5 h-2.5 bg-luminous-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(0,122,255,0.6)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-luminous-blue">Command Center Active</span>
                                </div>
                                <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.8] text-white break-words max-w-5xl mb-8">
                                    {llcData?.llc_name}.
                                </h1>

                                <ActionAlerts 
                                    llcData={llcData}
                                    activeDBA={activeDBA}
                                    hasReportAccess={hasReportAccess}
                                    onOpenAnnualReport={() => setIsAnnualReportWizardOpen(true)}
                                    onOpenDBARenewal={() => setIsDBARenewalWizardOpen(true)}
                                    onOpenReinstatement={() => setIsReinstatementWizardOpen(true)}
                                />

                                <p className="text-gray-500 font-medium text-xl italic max-w-3xl leading-relaxed opacity-80">
                                    "Unity Protocol Engaged. Monitoring Governance, Abstraction, and Legacy systems."
                                </p>
                            </div>

                            {/* UNITY TRIAD GRID (3 Columns) */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                
                                {/* COLUMN 1: BUILD (The Foundation) */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 px-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                            <div className="font-black text-xs">01</div>
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Build Foundation</h3>
                                    </div>
                                    <div className={`h-[500px] ${!hasBlueprintAccess ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                        <FoundersBlueprint 
                                            isOpen={false} 
                                            onClose={(step) => {
                                                if (!hasBlueprintAccess) return;
                                                if (step === 'annual_report') {
                                                    setIsAnnualReportWizardOpen(true);
                                                } else if (step === 'dba') {
                                                    setIsDBAWizardOpen(true);
                                                } else {
                                                    setBlueprintStep(typeof step === 'string' ? step : 'ein');
                                                    setIsBlueprintOpen(true);
                                                }
                                            }} 
                                            mode="SWISS" // Using SWISS mode for compactness in column
                                        />
                                    </div>
                                </div>

                                {/* COLUMN 2: PROTECT (The Sentinel) */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 px-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-luminous-blue/10 border border-luminous-blue/20 flex items-center justify-center text-luminous-blue">
                                            <div className="font-black text-xs">02</div>
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-luminous-blue shadow-luminous-blue/20 drop-shadow-[0_0_10px_rgba(0,122,255,0.5)]">Ongoing Compliance</h3>
                                    </div>

                                    <div className={!hasRAAccess ? 'opacity-50 pointer-events-none grayscale' : ''}>
                                        <ActiveProtectionTriad
                                            llcData={llcData}
                                            onOpenRAConsole={() => {
                                                if (hasRAAccess) setIsRAConsoleOpen(true);
                                            }}
                                            raAlertCount={newDocCount}
                                        />
                                    </div>
                                </div>

                                {/* COLUMN 3: PRESERVE (The Legacy) */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 px-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
                                            <div className="font-black text-xs">03</div>
                                        </div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37] shadow-[#d4af37]/20 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">Preserve Legacy</h3>
                                    </div>

                                    <div className={`h-[280px] ${!hasVaultAccess ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                        <VaultTile 
                                            onClick={() => {
                                                if (hasVaultAccess) openVault();
                                            }}
                                            locked={!user?.permissions?.heritage_vault}
                                            mode="CUPERTINO"
                                            successionData={protocolData}
                                        />
                                    </div>

                                    {/* New Probate Simulator */}
                                    <ProbateSimulator />
                                </div>

                            </div>
                            
                            {/* --- THE BUSINESS STORY (JONY IVE NARRATIVE LEDGER) --- */}
                            <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                <BusinessStoryTimeline llcData={llcData} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </main>



      </div>
    </div>
      {/* MODALS ABSTRACTION */}
      <DashboardModals 
          user={user}
          llcData={llcData}
          activeDBA={activeDBA}
          setLlcData={setLlcData}
          isBlueprintOpen={isBlueprintOpen} setIsBlueprintOpen={setIsBlueprintOpen} blueprintStep={blueprintStep}
          showDesignation={showDesignation} setShowDesignation={setShowDesignation}
          isRAConsoleOpen={isRAConsoleOpen} setIsRAConsoleOpen={setIsRAConsoleOpen}
          isAnnualReportWizardOpen={isAnnualReportWizardOpen} setIsAnnualReportWizardOpen={setIsAnnualReportWizardOpen}
          isDBAWizardOpen={isDBAWizardOpen} setIsDBAWizardOpen={setIsDBAWizardOpen}
          isDBARenewalWizardOpen={isDBARenewalWizardOpen} setIsDBARenewalWizardOpen={setIsDBARenewalWizardOpen}
          isReinstatementWizardOpen={isReinstatementWizardOpen} setIsReinstatementWizardOpen={setIsReinstatementWizardOpen}
          isDissolutionWizardOpen={isDissolutionWizardOpen} setIsDissolutionWizardOpen={setIsDissolutionWizardOpen}
          isCertStatusWizardOpen={isCertStatusWizardOpen} setIsCertStatusWizardOpen={setIsCertStatusWizardOpen}
      />
    </>
  );
};

export default DashboardZenith;
