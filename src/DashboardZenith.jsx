import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, FileText, CheckCircle2, AlertCircle, 
  ChevronRight, Lock, Activity, RefreshCw, LogOut, Settings,
  Copy, Download, Eye, EyeOff, MessageSquare, ShieldCheck, Fingerprint, Trash2, Scale
} from 'lucide-react';
import { supabase } from './lib/supabase';

import FoundersBlueprint from './FoundersBlueprint';
import RegisteredAgentConsole from './RegisteredAgentConsole';
import SuccessionSuite from './lib/succession/SuccessionSuite';
import { useSuccession } from './lib/succession/useSuccession';
import { AnimatePresence } from 'framer-motion';

import ActiveProtectionTriad from './components/ActiveProtectionTriad';
import VaultTile from './components/VaultTile';
import ProbateSimulator from './components/ProbateSimulator';
import DesignationProtocol from './DesignationProtocol';
import SubscriptionGate from './components/SubscriptionGate';
import AgentConsole from './components/AgentConsole';

const DashboardZenith = ({ user, initialData }) => {
  const [loading, setLoading] = useState(true);
  const [llcData, setLlcData] = useState(initialData || null);
  const [activityLog, setActivityLog] = useState([]);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [blueprintStep, setBlueprintStep] = useState('ein');
  const [isRAConsoleOpen, setIsRAConsoleOpen] = useState(false);
  const [isAgentConsoleOpen, setIsAgentConsoleOpen] = useState(false);
  const { openVault } = useSuccession();
  
  // Agent Access Bypass (Localhost Only)
  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      window.__antigravity_open_vault = () => openVault();
      console.log("🛠️ Antigravity: Global vault accessor mounted at window.__antigravity_open_vault()");
    }
  }, [openVault]);
  
  // New State for Designation
  const [showDesignation, setShowDesignation] = useState(false);
  
  // Steve Mode: Power Tools
  const [privacyMode, setPrivacyMode] = useState(false);
  
  // Agent Console Config
  const [autoDisposeMarketing, setAutoDisposeMarketing] = useState(true);
  const [priorityForwarding, setPriorityForwarding] = useState(true);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(llcData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${llcData.llc_name.replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(llcData, null, 2));
    alert("LLC Data copied to clipboard (JSON)");
  };

  // Keyboard Shortcuts (Steve Mode)
  useEffect(() => {
    const handleKeyDown = (e) => {
        // Ignore if typing in an input
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        switch(e.key.toLowerCase()) {
            case 'b':
                setIsBlueprintOpen(true);
                break;
            case 'v':
                openVault();
                break;
            case 'r':
                setIsRAConsoleOpen('dashboard');
                break;
            case 'p':
                setIsRAConsoleOpen('privacy');
                break;
            case 'm':
                setIsRAConsoleOpen('messaging');
                break;
            case 'escape':
                setIsBlueprintOpen(false);
                setIsRAConsoleOpen(false);
                setShowDesignation(false);
                break;
            default:
                break;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [newDocCount, setNewDocCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // Localhost Bypass: Auto-grant Heritage Vault permission
      if (window.location.hostname === 'localhost' && user.permissions) {
        user.permissions.heritage_vault = true;
      }

      try {
        // Fetch LLC Data if not provided
        if (!llcData) {
            const { data, error } = await supabase
                .from('llcs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (data) {
                setLlcData(data);
                if (data.llc_name.includes('Pending Formation') || data.llc_status === 'Setting Up') {
                    setShowDesignation(true);
                }
            }
        }

        // Fetch RA Alerts
        const { count } = await supabase
            .from('registered_agent_documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('viewed', false);
        
        setNewDocCount(count || 0);

        // Mock Activity Log
        setActivityLog([
            { id: 1, message: "Privacy Protection Started", time: "Just now", icon: ShieldCheck },
            { id: 2, message: "Institutional Payment Verified", time: "1 min ago", icon: CheckCircle2 },
            { id: 3, message: "Identity Verification Active", time: "Action Required", icon: Fingerprint },
        ]);

        setTimeout(() => setLoading(false), 2000);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        if (!llcData && user?.email?.includes('auditor')) {
            const mockLLC = {
                llc_name: 'Pending Formation - LLC Name TBD',
                llc_status: 'Setting Up',
                privacy_shield_active: true
            };
            setLlcData(mockLLC);
            setShowDesignation(true);
        }
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to new documents to update alert real-time
    const channel = supabase
      .channel('ra_doc_alerts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'registered_agent_documents',
        filter: `user_id=eq.${user.id}` 
      }, () => {
        // Re-fetch count on any change
        const fetchCount = async () => {
          const { count } = await supabase
            .from('registered_agent_documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('viewed', false);
          setNewDocCount(count || 0);
        };
        fetchCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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

      <div className="min-h-screen bg-luminous text-luminous-ink font-sans antialiased flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
        <style>{`
        .bg-blob {
            position: fixed;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(0, 122, 255, 0.03) 0%, rgba(0, 122, 255, 0) 70%);
            border-radius: 50%;
            z-index: 0;
            filter: blur(120px);
            animation: move 25s infinite alternate;
        }
        .blob-1 { top: -15%; left: -10%; }
        .blob-2 { bottom: -15%; right: -10%; background: radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, rgba(212, 175, 55, 0) 70%); }
        @keyframes move {
            from { transform: translate(0, 0); }
            to { transform: translate(80px, 40px); }
        }
        
          
        /* DESIGN TOGGLE REMOVED */
      `}</style>
      
      {/* Background Blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="fixed inset-0 dot-overlay opacity-[0.15] pointer-events-none" />

      {/* The Obsidian Slab */}
      <div className={`vitreous-glass w-full max-w-screen-2xl min-h-screen md:min-h-[900px] rounded-[48px] flex flex-col md:flex-row relative z-10 border border-white/10 animate-in fade-in zoom-in-95 duration-1000 overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,122,255,0.12)] transition-all`}>
        
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
                <div className="animate-in slide-in-from-bottom-8 duration-700">
                    
                    {/* --- ZERO STATE (SETUP MODE) --- */}
                    {!llcData || llcData?.llc_status === 'Setting Up' ? (
                        <div className="max-w-2xl text-left pt-10">
                            <div className="w-16 h-16 bg-luminous-ink rounded-2xl mb-12 shadow-2xl flex items-center justify-center text-white rotate-3">
                                <ShieldCheck size={32} strokeWidth={1.5} />
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-luminous-ink mb-8 leading-[0.9]">
                                Secure Your<br/><span className="text-luminous-blue">Foundation.</span>
                            </h1>
                            
                            <p className="text-gray-500 font-medium text-xl mb-16 max-w-lg leading-relaxed italic">
                                "The path to institutional privacy is one signature away. Let us finalize the architecture of your Florida entity."
                            </p>

                            {/* The ONE Main Action */}
                            <div 
                               onClick={() => setShowDesignation(true)}
                               className="bg-white/50 p-2 rounded-[2.5rem] shadow-2xl border border-white/80 hover:scale-[1.01] transition-transform cursor-pointer group mb-12"
                            >
                                <div className="bg-luminous-ink text-white rounded-[2rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-luminous-blue/10 rounded-bl-full pointer-events-none"></div>
                                    <div className="text-left relative z-10">
                                        <div className="flex items-center gap-3 mb-4 text-luminous-blue font-bold uppercase tracking-[0.3em] text-[10px]">
                                            <div className="w-2.5 h-2.5 bg-luminous-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(0,122,255,0.8)]"></div>
                                            Strategy Required
                                        </div>
                                        <h3 className="text-4xl font-black uppercase tracking-tight mb-4 leading-none">Initialize Charter</h3>
                                        <p className="text-gray-400 font-medium italic">Naming, Addresses, and Privacy Protocols.</p>
                                    </div>
                                    
                                    <button className="bg-white text-luminous-ink px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-luminous-blue hover:text-white transition-all flex items-center gap-3 text-xs shadow-xl whitespace-nowrap relative z-10">
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
                        </div>
                    ) : ( 
                        /* --- ACTIVE STATE (FULL DASHBOARD: "Command Center") --- */
                        <>
                            {/* Focused Header Section */}
                            <div className="flex flex-col mb-16 relative">
                                <div className="absolute top-0 right-0 flex items-center gap-4">
                                     {/* Agent Access Bypass (Dev Only) */}
                                     {import.meta.env.DEV && (
                                         <button 
                                            onClick={() => setIsAgentConsoleOpen(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                         >
                                             <Shield size={14} /> Agent Access
                                         </button>
                                     )}
                                     <button 
                                        onClick={handleLogout}
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95"
                                     >
                                         <LogOut size={14} /> Log Out
                                     </button>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-2.5 h-2.5 bg-luminous-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(0,122,255,0.6)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-luminous-blue">Command Center Active</span>
                                </div>
                                <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.8] text-luminous-ink break-words max-w-5xl mb-8">
                                    {llcData?.llc_name}.
                                </h1>
                                <p className="text-gray-400 font-medium text-xl italic max-w-3xl leading-relaxed opacity-60">
                                    "Unity Protocol Engaged. Monitoring Foundation, Protection, and Legacy systems."
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
                                    
                                    <div className="h-[500px]">
                                        <FoundersBlueprint 
                                            isOpen={false} 
                                            onClose={(step) => {
                                                setBlueprintStep(typeof step === 'string' ? step : 'ein');
                                                setIsBlueprintOpen(true);
                                            }} 
                                            mode="SWISS" // Using SWISS mode for compactness in column
                                        />
                                    </div>
                                </div>

                                {/* COLUMN 2: PROTECT (The Sentinel) */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 px-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-luminous-blue/10 flex items-center justify-center text-luminous-blue">
                                            <div className="font-black text-xs">02</div>
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-luminous-blue">Active Protection</h3>
                                    </div>

                                    <ActiveProtectionTriad
                                        llcData={llcData}
                                        onOpenRAConsole={() => setIsRAConsoleOpen(true)}
                                        raAlertCount={newDocCount}
                                    />
                                </div>

                                {/* COLUMN 3: PRESERVE (The Legacy) */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 px-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                                            <div className="font-black text-xs">03</div>
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-600">Preserve Legacy</h3>
                                    </div>

                                    {/* Heritage Vault */}
                                    <div className="h-[280px]">
                                        <VaultTile 
                                            onClick={() => openVault()}
                                            locked={!user?.permissions?.heritage_vault}
                                            mode="CUPERTINO"
                                        />
                                    </div>

                                    {/* New Probate Simulator */}
                                    <ProbateSimulator />
                                </div>

                            </div>
                        </>
                    )}
                </div>
            )}
        </main>



      </div>
    </div>
      {/* MODALS */}
      <AnimatePresence>
      {isBlueprintOpen && (
          <FoundersBlueprint 
              isOpen={isBlueprintOpen} 
              onClose={() => setIsBlueprintOpen(false)} 
              llcData={llcData} 
              initialStep={blueprintStep}
          />
      )}
      </AnimatePresence>

      <AnimatePresence>
          <SuccessionSuite user={user} />
      </AnimatePresence>

      <AnimatePresence>
      {showDesignation && (
          <DesignationProtocol 
              onComplete={(data) => {
                  setLlcData(data);
                  setShowDesignation(false);
              }}
          />
      )}
      </AnimatePresence>

      <AnimatePresence>
          {isRAConsoleOpen && (
              <RegisteredAgentConsole 
                  isModal={true}
                  onClose={() => setIsRAConsoleOpen(false)}
                  initialTab={isRAConsoleOpen} // passing string value directly if it's not boolean 'true'
              />
          )}
      </AnimatePresence>

      {/* Dev-Only Agent Console */}
      {import.meta.env.DEV && (
        <AgentConsole 
          isOpen={isAgentConsoleOpen}
          onClose={() => setIsAgentConsoleOpen(false)}
          user={user}
          llcData={llcData}
        />
      )}
    </>
  );
};

export default DashboardZenith;
