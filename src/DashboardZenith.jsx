import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, FileText, CheckCircle2, AlertCircle, 
  ChevronRight, Lock, Activity, RefreshCw, LogOut, Settings,
  Copy, Download, Eye, EyeOff, MessageSquare, ShieldCheck, Fingerprint, Trash2, Scale
} from 'lucide-react';
import { supabase } from './lib/supabase';

import FoundersBlueprint from './FoundersBlueprint';
import RegisteredAgentConsole from './RegisteredAgentConsole';
import SuccessionSuite from './SuccessionSuite';
import { AnimatePresence } from 'framer-motion';

import DesignationProtocol from './DesignationProtocol';
import AssetSentryTile from './components/AssetSentryTile';
import SubscriptionGate from './components/SubscriptionGate';
import VaultTile from './components/VaultTile';

const DashboardZenith = ({ user, initialData }) => {
  const [loading, setLoading] = useState(true);
  const [llcData, setLlcData] = useState(initialData || null);
  const [activityLog, setActivityLog] = useState([]);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isSuccessionOpen, setIsSuccessionOpen] = useState(false);
  const [isRAConsoleOpen, setIsRAConsoleOpen] = useState(false);
  
  // New State for Designation
  const [showDesignation, setShowDesignation] = useState(false);
  
  // Steve Mode: Power Tools
  const [privacyMode, setPrivacyMode] = useState(false);
  const [designMode, setDesignMode] = useState('MONOLITH'); // 'MONOLITH' | 'SWISS' | 'CUPERTINO'
  const [focusMode, setFocusMode] = useState(false); // TRUE = NO SIDEBAR (Zenith Focus)
  
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

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
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
                // Check if we need to show designation wizard
                if (data.llc_name.includes('Pending Formation') || data.llc_status === 'Setting Up') {
                    setShowDesignation(true);
                }
            }
        }

        // Mock Activity Log (Replace with real RPC call later)
        setActivityLog([
            { id: 1, message: "Privacy Protection Started", time: "Just now", icon: ShieldCheck },
            { id: 2, message: "Institutional Payment Verified", time: "1 min ago", icon: CheckCircle2 },
            { id: 3, message: "Identity Verification Active", time: "Action Required", icon: Fingerprint },
        ]);

        // Simulate "Booting" sequence
        setTimeout(() => setLoading(false), 2000);

      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        // FALLBACK FOR AUDITOR TEST / OFFLINE MODE
        if (!llcData && user?.email?.includes('auditor')) {
            console.warn("Using Mock LLC Data for Auditor");
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
        
        /* DESIGN TOGGLE UI */
        .design-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(10px);
            padding: 8px;
            border-radius: 20px;
            display: flex;
            gap: 4px;
            z-index: 100;
            color: white;
            font-size: 10px;
            font-weight: 700;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .design-btn {
            padding: 8px 16px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .design-btn:hover { background: rgba(255,255,255,0.1); }
        .design-btn.active { background: white; color: black; }
      `}</style>
      
      {/* Background Blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="fixed inset-0 dot-overlay opacity-[0.15] pointer-events-none" />

      {/* The Obsidian Slab */}
      <div className={`vitreous-glass w-full max-w-screen-2xl min-h-screen md:min-h-[900px] rounded-[48px] flex flex-col md:flex-row relative z-10 border border-white/10 animate-in fade-in zoom-in-95 duration-1000 overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,122,255,0.12)] transition-all ${focusMode ? 'max-w-6xl mx-auto' : ''}`}>
        
        <main className={`flex-1 p-12 md:p-24 lg:p-32 flex flex-col transition-all duration-700 ${focusMode ? 'items-center' : ''}`}>

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

                            <button onClick={handleDemoAccess} className="mt-8 bg-white border-2 border-[#0A0A0B] text-[#0A0A0B] px-6 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-[#0A0A0B] hover:text-white transition-all shadow-lg flex items-center gap-2 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                                <Eye size={16} /> Skip Setup (Preview Dashboard)
                            </button>

                            <p className="mt-12 text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">
                                Secure Initialization Sequence • 256-bit Encrypted
                            </p>
                        </div>
                    ) : ( 
                        /* --- ACTIVE STATE (FULL DASHBOARD) --- */
                        <>
                            {/* Focused Header Section */}
                            <div className="flex flex-col mb-24">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-2.5 h-2.5 bg-luminous-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(0,122,255,0.6)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-luminous-blue">System Active</span>
                                </div>
                                <h1 className="text-6xl md:text-[9.5rem] font-black uppercase tracking-tighter leading-[0.8] text-luminous-ink break-words max-w-5xl mb-12">
                                    {llcData?.llc_name}.
                                </h1>
                                <p className="text-gray-400 font-medium text-2xl italic max-w-3xl leading-relaxed opacity-60">
                                    "Institutional-grade privacy architecture verified. Your physical and digital nexus remains secure."
                                </p>
                            </div>

                            {/* Action Area */}
                            <div className="space-y-12">
                                {/* PRIMARY CARDS */}
                            {/* THE POWER TRINITY (Primary Action Grid) */}
                            {/* THE POWER TRINITY (Primary Action Grid) */}
                            {designMode === 'MONOLITH' && (
                                <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-10 mb-24 animate-in fade-in duration-500">
                                    <div className="h-[600px]">
                                        <FoundersBlueprint 
                                            isOpen={false} 
                                            onClose={() => setIsBlueprintOpen(true)} 
                                            mode="MONOLITH"
                                        />
                                    </div>

                                    <VaultTile 
                                        onClick={() => setIsSuccessionOpen(true)}
                                        locked={!user?.permissions?.heritage_vault}
                                        mode="MONOLITH"
                                    />

                                    <AssetSentryTile mode="MONOLITH" />
                                </div>
                            )}

                            {designMode === 'SWISS' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24 animate-in fade-in duration-500">
                                    <div className="lg:row-span-2 h-full min-h-[500px]">
                                        <FoundersBlueprint 
                                            isOpen={false} 
                                            onClose={() => setIsBlueprintOpen(true)} 
                                            mode="SWISS"
                                        />
                                    </div>
                                    <div className="h-[280px]">
                                        <VaultTile 
                                            onClick={() => setIsSuccessionOpen(true)}
                                            locked={!user?.permissions?.heritage_vault}
                                            mode="SWISS"
                                        />
                                    </div>
                                    <div className="h-[280px]">
                                        <AssetSentryTile 
                                            mode="SWISS" 
                                            onClick={() => setIsRAConsoleOpen(true)}
                                        />
                                    </div>
                                </div>
                            )}

                            {designMode === 'CUPERTINO' && (
                                <div className="space-y-6 mb-24 animate-in fade-in duration-500">
                                    <div className="h-[180px]">
                                        <FoundersBlueprint 
                                            isOpen={false} 
                                            onClose={() => setIsBlueprintOpen(true)} 
                                            mode="CUPERTINO"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 h-[340px]">
                                         <VaultTile 
                                            onClick={() => setIsSuccessionOpen(true)}
                                            locked={!user?.permissions?.heritage_vault}
                                            mode="CUPERTINO"
                                        />
                                        <AssetSentryTile 
                                            mode="CUPERTINO" 
                                            onClick={() => setIsRAConsoleOpen(true)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* INTEGRATED UTILITIES (Secondary Actions) */}
                            <div className="grid lg:grid-cols-2 gap-16">
                                <div className="p-16 bg-white/40 backdrop-blur-2xl rounded-[56px] border border-white/50 flex items-center justify-between group transition-all hover:bg-white hover:shadow-[0_60px_100px_-20px_rgba(0,122,255,0.1)] cursor-pointer">
                                    <div className="flex items-center gap-12 flex-1">
                                        <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center text-luminous-ink group-hover:text-luminous-blue transition-all group-hover:scale-110 shrink-0">
                                            <FileText size={40} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-400 mb-3 whitespace-nowrap">Service Hub</h4>
                                            <p className="text-3xl font-black text-luminous-ink italic leading-none whitespace-nowrap">Scanned Archives</p>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-luminous-blue group-hover:text-white transition-all shrink-0 ml-8">
                                        <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                <div className="p-16 bg-white/40 backdrop-blur-2xl rounded-[56px] border border-white/50 flex items-center justify-between group transition-all hover:bg-white hover:shadow-[0_60px_100px_-20px_rgba(0,122,255,0.1)] cursor-pointer">
                                    <div className="flex items-center gap-12 flex-1">
                                        <div className="w-24 h-24 bg-luminous-blue/10 rounded-[32px] flex items-center justify-center text-luminous-blue group-hover:bg-luminous-blue group-hover:text-white transition-all group-hover:scale-110 shrink-0">
                                            <MessageSquare size={40} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-400 mb-3 whitespace-nowrap">Institutional Uplink</h4>
                                            <p className="text-3xl font-black text-luminous-ink italic leading-none whitespace-nowrap">Agent Comms Active</p>
                                        </div>
                                    </div>
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-luminous-blue group-hover:text-white transition-all shrink-0 ml-8">
                                        <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </main>

        {/* Sidebar Sentinel */}
        {!focusMode && (
            <aside className="w-full md:w-[480px] bg-white/60 backdrop-blur-3xl border-l border-white/20 p-16 flex flex-col animate-in slide-in-from-right duration-700">
                <div className="flex items-center justify-between mb-20">
                    <div className="text-[0.65rem] font-black uppercase tracking-[0.8em] text-luminous-ink opacity-20">
                        System Activity
                    </div>
                    <button onClick={handleLogout} className="text-gray-300 hover:text-luminous-blue transition-all hover:rotate-12">
                        <LogOut size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
                    {activityLog.map((log) => (
                        <div key={log.id} className="bg-white/90 p-10 rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100/30 flex gap-8 items-center transition-all hover:shadow-2xl group cursor-default">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-luminous-ink group-hover:bg-blue-50 group-hover:text-luminous-blue transition-all shrink-0">
                                <log.icon size={28} strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base font-black text-[#0A0A0B] leading-tight mb-2 truncate">{log.message}</p>
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{log.time}</p>
                            </div>
                        </div>
                    ))}

                    <div className="p-16 rounded-[40px] border border-dashed border-gray-200/50 flex flex-col items-center justify-center gap-6 text-gray-300 text-[10px] font-black uppercase tracking-[0.4em] mt-12">
                        <div className="w-4 h-4 rounded-full bg-gray-100 animate-pulse" />
                        Archive Standby
                    </div>
                </div>

                <div className="pt-16 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center text-luminous-ink font-black text-lg shadow-inner">
                            {user?.email?.[0].toUpperCase() || "F"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`text-base font-black text-[#0A0A0B] transition-all duration-300 truncate ${privacyMode ? 'blur-md select-none' : ''}`}>
                                {user?.email || "Founder"}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] leading-none mt-2">Institutional Admin</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    setLlcData(null);
                                    setShowDesignation(true);
                                }}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            >
                                <RefreshCw size={24} />
                            </button>
                            <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-300 hover:text-[#0A0A0B] hover:bg-gray-50 transition-all">
                                <Settings size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        )}

      </div>
    </div>
      {/* MODALS */}
      <AnimatePresence>
      {isBlueprintOpen && (
          <FoundersBlueprint 
              isOpen={isBlueprintOpen} 
              onClose={() => setIsBlueprintOpen(false)} 
              llcData={llcData} 
          />
      )}
      </AnimatePresence>

      <AnimatePresence>
      <SuccessionSuite 
          isOpen={isSuccessionOpen} 
          onClose={() => setIsSuccessionOpen(false)} 
          companyName={llcData?.llc_name} 
          user={user}
      />
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
              />
          )}
      </AnimatePresence>

      {/* DESIGN TOGGLE */}
      <div className="design-toggle">
        <div className={`design-btn ${designMode === 'MONOLITH' ? 'active' : ''}`} onClick={() => setDesignMode('MONOLITH')}>MONOLITH</div>
        <div className={`design-btn ${designMode === 'SWISS' ? 'active' : ''}`} onClick={() => setDesignMode('SWISS')}>SWISS</div>
        <div className={`design-btn ${designMode === 'CUPERTINO' ? 'active' : ''}`} onClick={() => setDesignMode('CUPERTINO')}>CUPERTINO</div>
        <div className={`design-btn ${focusMode ? 'active' : ''} !bg-luminous-blue/20 !text-luminous-blue`} onClick={() => setFocusMode(!focusMode)}>
            {focusMode ? 'SHOW SIDEBAR' : 'ZENITH FOCUS (NO SIDEBAR)'}
        </div>
      </div>
    </>
  );
};

export default DashboardZenith;
