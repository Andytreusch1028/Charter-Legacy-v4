import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, FileText, CheckCircle2, AlertCircle, 
  ChevronRight, Lock, Activity, RefreshCw, LogOut, Settings,
  Copy, Download, Eye, EyeOff, MessageSquare, ShieldCheck, Fingerprint, Trash2, Scale
} from 'lucide-react';
import { supabase } from './lib/supabase';

import FoundersBlueprint from './FoundersBlueprint';
import SuccessionSuite from './SuccessionSuite';

import DesignationProtocol from './DesignationProtocol';
import AssetSentryTile from './components/AssetSentryTile';

const DashboardZenith = ({ user, initialData }) => {
  const [loading, setLoading] = useState(true);
  const [llcData, setLlcData] = useState(initialData || null);
  const [activityLog, setActivityLog] = useState([]);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isSuccessionOpen, setIsSuccessionOpen] = useState(false);
  
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
  }, [user]);

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
      <FoundersBlueprint 
        isOpen={isBlueprintOpen} 
        onClose={() => setIsBlueprintOpen(false)} 
        companyName={llcData?.llc_name || "Your Company"} 
      />

      <SuccessionSuite 
        isOpen={isSuccessionOpen} 
        onClose={() => setIsSuccessionOpen(false)} 
        companyName={llcData?.llc_name || "Your Company"} 
      />

      {showDesignation && (
          <DesignationProtocol user={user} onSuccess={handleDesignationSuccess} />
      )}

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
      `}</style>
      
      {/* Background Blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="fixed inset-0 dot-overlay opacity-[0.15] pointer-events-none" />

      {/* The Obsidian Slab */}
      <div className="vitreous-glass w-full max-w-7xl min-h-[700px] rounded-[48px] flex flex-col md:flex-row relative z-10 border border-white animate-in fade-in zoom-in-95 duration-700 overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,122,255,0.08)]">
        
        <main className="flex-1 p-8 md:p-20 flex flex-col">
            <div className="text-[0.65rem] font-black uppercase tracking-[0.5em] text-luminous-ink opacity-30 mb-12">
                Registered Agent Console
            </div>

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
                            <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-12">
                                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-luminous-ink break-words max-w-full">
                                    {llcData?.llc_name}
                                </h1>
                            </div>

                            {/* Stats Strip */}
                            <div className="flex flex-col md:flex-row gap-12 md:gap-24 py-16 border-y border-gray-100/50 mb-16">
                                <div className="flex flex-col gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Current Status</span>
                                    <span className="text-lg font-black text-luminous-blue flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 bg-luminous-blue rounded-full animate-pulse shadow-[0_0_15px_rgba(0,122,255,0.4)]"></div>
                                        {llcData?.llc_status || "Active"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Privacy Shield</span>
                                    <span className="text-lg font-black text-luminous-ink flex items-center gap-3">
                                        <ShieldCheck size={20} className={llcData?.privacy_shield_active ? "text-luminous-blue" : "text-gray-300"} />
                                        {llcData?.privacy_shield_active ? "Verified" : "Inactive"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Governance</span>
                                    <span className="text-lg font-black text-luminous-ink opacity-40 flex items-center gap-3">
                                        <Clock size={20} />
                                        Auto-Protect
                                    </span>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="space-y-12">
                                {/* PRIMARY CARDS */}
                                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
                                    <div 
                                        onClick={() => setIsBlueprintOpen(true)}
                                        className="p-10 bg-[#FAFAFA] rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-[320px] transition-all hover:shadow-md hover:border-gray-200 cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-bl-full -mr-16 -mt-16 transition-colors group-hover:bg-gray-200"></div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                                <FileText size={14} /> Official Records
                                            </div>
                                            <h3 className="text-3xl font-black uppercase tracking-tight text-luminous-ink mb-2 group-hover:text-luminous-blue transition-colors leading-none">Company Charter</h3>
                                            <p className="text-gray-400 text-xs font-medium italic leading-relaxed max-w-[80%] mt-4">
                                                "Access your filed Articles, EIN, and Operating Agreement."
                                            </p>
                                        </div>
                                        <button className="bg-luminous-ink text-white w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-luminous-blue transition-colors shadow-lg flex items-center justify-center gap-2">
                                            View Documents <ChevronRight size={14} />
                                        </button>
                                    </div>

                                    <div 
                                        onClick={() => setIsSuccessionOpen(true)}
                                        className="p-10 bg-luminous-ink text-white rounded-[2.5rem] shadow-2xl flex flex-col justify-between h-[320px] relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform prism-border"
                                    >
                                        <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-luminous-blue/20 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:from-luminous-blue/30 transition-colors"></div>
                                        <div>
                                            <div className="flex items-center gap-2 text-luminous-gold text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                                <Activity size={14} /> Heritage Architecture
                                            </div>
                                            <h3 className="text-3xl font-black uppercase tracking-tight mb-4 group-hover:text-luminous-blue transition-colors leading-none">The Vault</h3>
                                            <p className="text-gray-400 text-xs font-medium italic leading-relaxed max-w-[80%]">
                                                "Will • Trust • Estate protocols are active."
                                            </p>
                                        </div>
                                        <div className="mt-auto font-mono text-3xl font-black tracking-widest text-luminous-gold opacity-90">
                                            364:23:59:59
                                        </div>
                                    </div>

                                    <AssetSentryTile />
                                </div>

                                {/* REGISTERED AGENT CONSOLE WIDGETS */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-4">
                                            <ShieldCheck size={16} /> Secure Agent Uplink 
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-3 bg-white/50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md cursor-pointer group/toggle" onClick={() => setPriorityForwarding(!priorityForwarding)}>
                                                <Scale size={12} className={`transition-colors ${priorityForwarding ? "text-luminous-blue" : "text-gray-300"}`} />
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest select-none">Pleadings / Priority</span>
                                                <div className={`w-7 h-4 rounded-full transition-colors relative ${priorityForwarding ? 'bg-luminous-blue' : 'bg-gray-200'}`}>
                                                     <div className={`absolute top-[2px] w-3 h-3 bg-white rounded-full shadow-sm transition-all ${priorityForwarding ? 'left-[14px]' : 'left-[2px]'}`}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white/50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm transition-all hover:bg-white hover:shadow-md cursor-pointer group/toggle" onClick={() => setAutoDisposeMarketing(!autoDisposeMarketing)}>
                                                <Trash2 size={12} className={`transition-colors ${autoDisposeMarketing ? "text-luminous-blue" : "text-gray-300"}`} />
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest select-none">Auto-Dispose Ads</span>
                                                <div className={`w-7 h-4 rounded-full transition-colors relative ${autoDisposeMarketing ? 'bg-luminous-blue' : 'bg-gray-200'}`}>
                                                     <div className={`absolute top-[2px] w-3 h-3 bg-white rounded-full shadow-sm transition-all ${autoDisposeMarketing ? 'left-[14px]' : 'left-[2px]'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid lg:grid-cols-2 gap-8">
                                        {/* Document Feed */}
                                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm h-[400px] flex flex-col">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-luminous-ink">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-black uppercase text-sm tracking-tight">Scanned Documents</h5>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Miami Processing Center</p>
                                                    </div>
                                                </div>
                                                <button className="text-[10px] font-black uppercase tracking-widest text-luminous-blue hover:text-luminous-ink transition-colors">View All</button>
                                            </div>
                                            
                                            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                                {[
                                                    { title: 'Notice of Annual Filing', date: 'Feb 12, 2026', type: 'State Requirement', status: 'Action Required' },
                                                    { title: 'Service of Process (Mock)', date: 'Feb 09, 2026', type: 'Legal Notice', status: 'Urgent' },
                                                    { title: 'Information Request', date: 'Feb 05, 2026', type: 'Bureaucracy', status: 'Standard' }
                                                ].map((doc, idx) => (
                                                    <div key={idx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-xs font-black text-luminous-ink group-hover:text-luminous-blue transition-colors">{doc.title}</p>
                                                                {doc.status === 'Urgent' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                                            </div>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{doc.date} • {doc.type}</p>
                                                        </div>
                                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-luminous-ink" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Agent Messaging */}
                                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm h-[400px] flex flex-col relative overflow-hidden">
                                            <div className="flex items-center justify-between mb-8 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-luminous-blue/10 rounded-xl flex items-center justify-center text-luminous-blue">
                                                        <MessageSquare size={20} />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-black uppercase text-sm tracking-tight text-luminous-blue">Direct Liaison</h5>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Live Agent 402
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-4 mb-4 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 max-w-[85%]">
                                                    <p className="text-xs text-gray-600 font-medium leading-relaxed">"Welcome to the console. I'm your dedicated agent. Your privacy shield is active and holding. No breaches detected."</p>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2 text-right">10:42 AM</p>
                                                </div>
                                                <div className="bg-luminous-blue/5 p-4 rounded-2xl rounded-tr-none border border-luminous-blue/10 max-w-[85%] ml-auto text-right">
                                                    <p className="text-xs text-luminous-ink font-medium leading-relaxed">"Confirmed. Please alert me if any mail arrives from the Department of Revenue."</p>
                                                    <p className="text-[8px] font-black text-luminous-blue/60 uppercase tracking-widest mt-2 text-left">10:45 AM</p>
                                                </div>
                                            </div>

                                            <div className="relative z-10 mt-auto">
                                                <input type="text" placeholder="Type secure message..." className="w-full bg-gray-50 rounded-xl py-4 px-5 text-xs font-bold outline-none border-2 border-transparent focus:border-luminous-blue/20 transition-all placeholder:text-gray-300" />
                                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-luminous-ink text-white rounded-lg hover:scale-105 transition-transform">
                                                    <ChevronRight size={14} />
                                                </button>
                                            </div>
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
        <aside className="w-full md:w-[420px] bg-white/40 backdrop-blur-3xl border-l border-white/50 p-10 flex flex-col">
            <div className="flex items-center justify-between mb-12">
                <div className="text-[0.55rem] font-black uppercase tracking-[0.6em] text-luminous-ink opacity-20">
                    System Activity
                </div>
                <button onClick={handleLogout} className="text-gray-300 hover:text-luminous-blue transition-colors">
                    <LogOut size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {activityLog.map((log) => (
                    <div key={log.id} className="bg-white p-6 rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex gap-4 items-start">
                        <div className="w-8 h-8 bg-[#F5F5F7] rounded-lg flex items-center justify-center opacity-50 shrink-0">
                            <log.icon size={16} className="text-[#0A0A0B]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#0A0A0B] leading-snug mb-1">{log.message}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.time}</p>
                        </div>
                    </div>
                ))}

                <div className="bg-white/50 p-6 rounded-[20px] border border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-300 text-xs font-bold uppercase tracking-widest">
                    <Activity size={14} /> End of Stream
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                     <div>
                         <p className={`text-xs font-black text-[#0A0A0B] transition-all duration-300 ${privacyMode ? 'blur-sm select-none' : ''}`}>
                             {user?.email || "Founder"}
                         </p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</p>
                     </div>
                     <div className="flex items-center gap-2 ml-auto">
                        <button 
                            onClick={() => {
                                setLlcData(null);
                                setShowDesignation(true);
                            }}
                            title="Reset to Setup (Dev)"
                            className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors"
                        >
                            <RefreshCw size={14} />
                        </button>
                        <Settings size={18} className="text-gray-300 hover:text-[#0A0A0B] cursor-pointer transition-colors" />
                     </div>
                </div>
            </div>
        </aside>

      </div>
    </div>
      {/* MODALS */}
      <FoundersBlueprint 
          isOpen={isBlueprintOpen} 
          onClose={() => setIsBlueprintOpen(false)} 
          llcData={llcData} 
      />

      <SuccessionSuite 
          isOpen={isSuccessionOpen} 
          onClose={() => setIsSuccessionOpen(false)} 
          companyName={llcData?.llc_name} 
          user={user}
      />

      {showDesignation && (
          <DesignationProtocol 
              onComplete={(data) => {
                  setLlcData(data);
                  setShowDesignation(false);
              }}
          />
      )}
    </>
  );
};

export default DashboardZenith;
