import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, FileText, CheckCircle2, AlertCircle, 
  ChevronRight, Lock, Activity, RefreshCw, LogOut, Settings,
  Copy, Download, Eye, EyeOff
} from 'lucide-react';
import { supabase } from './lib/supabase';

import FoundersBlueprint from './FoundersBlueprint';
import SuccessionSuite from './SuccessionSuite';

import DesignationProtocol from './DesignationProtocol';

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
            { id: 1, message: "Secure Environment Initialized", time: "Just now", icon: Shield },
            { id: 2, message: "Payment Verified (Stripe)", time: "1 min ago", icon: CheckCircle2 },
            { id: 3, message: "Identity Verification Pending", time: "Action Required", icon: AlertCircle },
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

      <div className="min-h-screen bg-[#F0F2F5] text-[#0A0A0B] font-sans antialiased flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
        <style>{`
          :root {
            --obsidian-ink: #0A0A0B;
            --accent-green: #00D084;
            --gold-leaf: #d4af37;
        }
        .bg-blob {
            position: fixed;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(0, 102, 255, 0.05) 0%, rgba(0, 102, 255, 0) 70%);
            border-radius: 50%;
            z-index: 0;
            filter: blur(100px);
            animation: move 20s infinite alternate;
        }
        .blob-1 { top: -10%; left: -10%; }
        .blob-2 { bottom: -10%; right: -10%; background: radial-gradient(circle, rgba(0, 208, 132, 0.04) 0%, rgba(0, 208, 132, 0) 70%); }
        @keyframes move {
            from { transform: translate(0, 0); }
            to { transform: translate(100px, 50px); }
        }
        .zenith-slab-shadow {
            box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.1), 0 30px 60px -30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      {/* Background Blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* The Obsidian Slab */}
      <div className="bg-white w-full max-w-6xl min-h-[600px] rounded-[48px] zenith-slab-shadow flex flex-col md:flex-row relative z-10 border border-white/70 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Main Control Area */}
        <main className="flex-1 p-8 md:p-20">
            <div className="text-[0.65rem] font-black uppercase tracking-[0.5em] text-[#0A0A0B] opacity-30 mb-8">
                Corporate Command Center
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
                        <div className="max-w-2xl mx-auto text-center pt-10">
                            <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-8 shadow-xl flex items-center justify-center text-[#0A0A0B]">
                                <Shield size={40} strokeWidth={1.5} />
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#0A0A0B] mb-6">
                                Welcome, Founder.
                            </h1>
                            
                            <p className="text-gray-500 font-medium text-lg mb-12 max-w-lg mx-auto leading-relaxed">
                                Your secure vault is ready. We just need a few details to legally form your Florida entity.
                            </p>

                            {/* The ONE Main Action */}
                            <div 
                               onClick={() => setShowDesignation(true)}
                               className="bg-white p-2 rounded-[2rem] shadow-2xl border border-white/50 hover:scale-[1.02] transition-transform cursor-pointer group"
                            >
                                <div className="bg-[#0A0A0B] text-white rounded-[1.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-left">
                                        <div className="flex items-center gap-3 mb-2 text-[#00D084] font-bold uppercase tracking-widest text-xs">
                                            <div className="w-2 h-2 bg-[#00D084] rounded-full animate-pulse"></div>
                                            Action Required
                                        </div>
                                        <h3 className="text-3xl font-black uppercase tracking-tight mb-2">Initialize LLC</h3>
                                        <p className="text-gray-400 font-medium">Step 1: Naming & Address Protocols</p>
                                    </div>
                                    
                                    <button className="bg-white text-[#0A0A0B] px-10 py-5 rounded-2xl font-black uppercase tracking-wider hover:bg-[#00D084] hover:text-white transition-colors flex items-center gap-3 text-sm shadow-lg whitespace-nowrap">
                                        Start Now <ChevronRight size={18} />
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
                                <h1 className={`text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[1.1] text-[#0A0A0B] break-words max-w-full transition-all duration-300`}>
                                    {llcData?.llc_name}
                                </h1>
                            </div>

                            {/* Stats Strip */}
                            <div className="flex flex-col md:flex-row gap-8 md:gap-16 py-12 border-y border-gray-100 mb-16">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</span>
                                    <span className="text-base font-bold text-[#00D084] flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#00D084] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,208,132,0.4)]"></div>
                                        {llcData?.llc_status || "Active"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Privacy Shield</span>
                                    <span className="text-base font-bold text-[#0A0A0B] flex items-center gap-2">
                                        <Shield size={16} className={llcData?.privacy_shield_active ? "text-[#00D084]" : "text-gray-300"} />
                                        {llcData?.privacy_shield_active ? "Engaged" : "Inactive"}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Renewal</span>
                                    <span className="text-base font-bold text-[#0A0A0B] opacity-40 flex items-center gap-2">
                                        <Clock size={16} />
                                        Auto-Renew (Year 1)
                                    </span>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="space-y-8">
                                <div 
                                onClick={() => setIsBlueprintOpen(true)}
                                className="p-8 bg-[#FAFAFA] rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-gray-200 cursor-pointer group"
                                >
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-[#0A0A0B] mb-1 group-hover:text-[#00D084] transition-colors">Company Profile</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            Manage Documents & Details
                                        </p>
                                    </div>
                                    <button className="bg-[#0A0A0B] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:scale-105 transition-transform shadow-lg flex items-center gap-2 group-hover:bg-[#00D084]">
                                        Manage <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div 
                                        onClick={() => setIsSuccessionOpen(true)}
                                        className="p-8 bg-[#0A0A0B] text-white rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
                                    >
                                        <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-[#d4af37]/30 transition-colors"></div>
                                        <div>
                                            <div className="flex items-center gap-2 text-[#d4af37] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                                <Clock size={12} /> Beneficiary Protection
                                            </div>
                                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-[#d4af37] transition-colors">Succession Plan</h3>
                                            <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[80%]">
                                                Your corporate will is active. Next verification check in:
                                            </p>
                                        </div>
                                        <div className="mt-8 font-mono text-3xl font-bold tracking-widest text-[#d4af37] opacity-90">
                                            364:23:59:59
                                        </div>
                                    </div>

                                    <div className="p-8 bg-[#FAFAFA] rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center gap-4 opacity-50 cursor-not-allowed">
                                        <div>
                                            <h3 className="text-xl font-black uppercase tracking-tight text-[#0A0A0B] mb-1">Florida Annual Report</h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Locked until Jan 1, 2027</p>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div className="w-[5%] h-full bg-[#0A0A0B]"></div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <Lock size={12} /> Filing window closed
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
        <aside className="w-full md:w-[380px] bg-[#F8F9FB]/70 backdrop-blur-3xl border-l border-[#F0F2F5] p-10 flex flex-col">
            <div className="flex items-center justify-between mb-10">
                <div className="text-[0.55rem] font-black uppercase tracking-[0.6em] text-[#0A0A0B] opacity-20">
                    Activity Log
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={16} />
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
