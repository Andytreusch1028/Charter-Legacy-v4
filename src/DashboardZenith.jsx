import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, FileText, CheckCircle2, AlertCircle, 
  ChevronRight, Lock, Activity, RefreshCw, LogOut, Settings,
  Copy, Download, Eye, EyeOff, LayoutGrid, List
} from 'lucide-react';
import { supabase } from './lib/supabase';

import FoundersBlueprint from './FoundersBlueprint';
import SuccessionSuite from './SuccessionSuite';
import DesignationProtocol from './DesignationProtocol';
import StatusRing from './components/StatusRing';
import ActionConsole from './components/ActionConsole';
import EmpireGrid from './components/EmpireGrid';
import SovereignCommandView from './components/SovereignCommandView';
import ViewSwitcher from './components/ViewSwitcher';
import { useCompliance } from './hooks/useCompliance';
import { useViewIntelligence } from './hooks/useViewIntelligence';

const DashboardZenith = ({ user, initialData }) => {
  const [loading, setLoading] = useState(true);
  const [activeLlc, setActiveLlc] = useState(initialData || null);
  const [fleet, setFleet] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isSuccessionOpen, setIsSuccessionOpen] = useState(false);
  const [showDesignation, setShowDesignation] = useState(false);

  // Compliance & Statutory Monitoring
  const compliance = useCompliance(user, activeLlc) || { 
      healthScore: 100, pulseColor: '#00D084', alerts: [], daysToDeadline: null 
  };

  // View Intelligence Engine
  const viewIntel = useViewIntelligence(
      user?.id,
      fleet?.length || 0,
      compliance.healthScore < 100
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user) { setLoading(false); return; }
      
      try {
        const { data, error } = await supabase
            .from('llcs').select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        if (data && data.length > 0) {
            setFleet(data);
            if (!activeLlc) {
                setActiveLlc(data[0]);
                if (data[0]?.llc_name?.includes('Pending') || data[0]?.llc_status === 'Setting Up') {
                    setShowDesignation(true);
                }
            }
        } else {
            const mockFleet = [
                { id: 1, llc_name: 'Charter Legacy Demo LLC', llc_status: 'Active', privacy_shield_active: true, created_at: new Date().toISOString() },
                { id: 2, llc_name: 'Wyoming Holdings LLC', llc_status: 'Active', privacy_shield_active: true, created_at: new Date().toISOString() },
                { id: 3, llc_name: 'Heritage Property LLC', llc_status: 'Action Required', privacy_shield_active: false, created_at: new Date().toISOString() }
            ];
            setFleet(mockFleet);
            if (!activeLlc) setActiveLlc(mockFleet[0]);
        }

        setActivityLog([
            { id: 1, message: "Sovereign Environment Initialized", time: "Just now", icon: Shield },
            { id: 2, message: "Fleet Status Synchronized", time: "1 min ago", icon: RefreshCw },
            { id: 3, message: "View Intelligence Calibrated", time: "Auto", icon: Eye },
        ]);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        const errFleet = [{ id: 'err', llc_name: 'Recovery Mode', llc_status: 'Active', created_at: new Date().toISOString() }];
        setFleet(errFleet);
        setActiveLlc(errFleet[0]);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchData();
  }, [user]);

  const handleAction = (actionId) => {
      viewIntel.recordAction(actionId);
      if (actionId === 'amend') setIsBlueprintOpen(true);
  };

  const selectEntity = (entity) => {
      setActiveLlc(entity);
      // When selecting from fleet, switch to situational to see that entity
      viewIntel.setOverride('situational');
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
              <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-[#0A0A0B] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Calibrating View Intelligence...</p>
              </div>
          </div>
      );
  }

  const currentLlc = activeLlc || (fleet && fleet[0]) || null;
  const currentView = viewIntel.activeView;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#0A0A0B] font-sans antialiased flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <style>{`
          :root { --obsidian-ink: #0A0A0B; --accent-green: #00D084; --gold-leaf: #d4af37; }
          .zenith-slab-shadow { box-shadow: 0 50px 100px -20px rgba(0,0,0,0.15), 0 30px 60px -30px rgba(0,0,0,0.15); }
        `}</style>
      
      <div className="bg-white w-full max-w-7xl min-h-[90vh] rounded-[48px] zenith-slab-shadow flex flex-col md:flex-row relative z-10 border border-white/70 animate-in fade-in zoom-in-95 duration-700 overflow-hidden">
        
        <main className="flex-1 p-8 md:p-16 overflow-y-auto">
            {/* Header with View Switcher */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                <ViewSwitcher 
                    activeView={currentView}
                    recommended={viewIntel.recommended}
                    isOverridden={viewIntel.isOverridden}
                    onSelect={viewIntel.setOverride}
                    onReset={viewIntel.clearOverride}
                />
                <div className="text-[0.55rem] font-black uppercase tracking-[0.5em] text-[#0A0A0B] opacity-20">
                    {currentView === 'fleet' ? 'Sovereign Fleet' : currentView === 'command' ? 'Command Cockpit' : 'Adaptive Console'}
                </div>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* VIEW ROUTER                                */}
            {/* ═══════════════════════════════════════════ */}

            {currentView === 'fleet' && (
                <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#0A0A0B] mb-4">The Empire.</h1>
                    <p className="text-gray-400 font-medium mb-16 max-w-xl">
                        Managing {fleet?.length || 0} active entities. Global health indicators synchronized.
                    </p>
                    <EmpireGrid 
                        entities={(fleet || []).map(e => ({
                            id: e.id,
                            name: e.llc_name || 'Unnamed LLC',
                            status: e.llc_status || 'Active',
                            health: e.privacy_shield_active === false ? 60 : 100
                        }))}
                        activeId={currentLlc?.id}
                        onSelect={selectEntity}
                        onAdd={() => setShowDesignation(true)}
                    />
                </div>
            )}

            {currentView === 'command' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SovereignCommandView 
                        llc={currentLlc}
                        compliance={compliance}
                        onAction={handleAction}
                        onSuccession={() => setIsSuccessionOpen(true)}
                    />
                </div>
            )}

            {currentView === 'situational' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Adaptive Hero */}
                    {compliance.healthScore < 100 ? (
                        // WARNING STATE
                        <div className="p-8 bg-amber-50 border border-amber-200 rounded-[32px] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Action Required</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#0A0A0B] leading-[0.9]">
                                {currentLlc?.llc_name || "Your Entity"}
                            </h1>
                            <p className="text-amber-700 font-medium">
                                {compliance.daysToDeadline 
                                    ? `Your annual report is due in ${compliance.daysToDeadline} days. File now to maintain good standing.`
                                    : 'One or more compliance items need your attention.'}
                            </p>
                            <button 
                                onClick={() => handleAction('annual_report')}
                                className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg"
                            >
                                File Annual Report →
                            </button>
                        </div>
                    ) : (
                        // SAFE STATE
                        <div className="space-y-2">
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#0A0A0B] leading-[0.9]">
                                {currentLlc?.llc_name || "Sovereign Entity"}
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-[#00D084] uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#00D084] rounded-full animate-pulse" />
                                    {currentLlc?.llc_status || "Operational"}
                                </span>
                                <span className="text-gray-200">/</span>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Established {currentLlc?.created_at ? new Date(currentLlc.created_at).toLocaleDateString() : '--/--/----'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-[#FAFAFA] border border-gray-100 rounded-[32px] p-8 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Statutory Health</span>
                                <Activity size={16} className="text-gray-200" />
                            </div>
                            <div className="flex items-center gap-6">
                                <StatusRing 
                                    percentage={compliance.healthScore} color={compliance.pulseColor}
                                    size={72} strokeWidth={6} pulse={compliance.healthScore < 100}
                                >
                                    <span className="text-xs font-black" style={{ color: compliance.pulseColor }}>{compliance.healthScore}%</span>
                                </StatusRing>
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight text-[#0A0A0B]">
                                        {compliance.healthScore === 100 ? 'In Good Standing' : 'Maintenance Required'}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                        {compliance.daysToDeadline ? `${compliance.daysToDeadline} days to report` : 'No upcoming filings'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div onClick={() => setIsSuccessionOpen(true)} className="p-8 bg-[#0A0A0B] text-white rounded-[32px] shadow-xl hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden relative">
                            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-[#d4af37]/20 blur-[80px]"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37]">Continuity Plan</span>
                                <Clock size={16} className="text-[#d4af37] opacity-40" />
                            </div>
                            <div className="space-y-1 relative z-10 pt-4">
                                <p className="text-xl font-black uppercase tracking-tight text-[#d4af37]">Active Protection</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">364:23:59:59</p>
                            </div>
                        </div>

                        <div className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Privacy Armor</span>
                                <Shield size={16} className="text-[#00D084] opacity-20" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#00D084]/10 flex items-center justify-center text-[#00D084]">
                                    <Shield size={20} />
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-[#0A0A0B]">Registered Agent <br/><span className="text-[10px] text-[#00D084]">Masked • DeLand FL</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Action Console */}
                    <div className="space-y-6 pt-4 border-t border-gray-50">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 text-center">Sovereign Action Console</h3>
                        <ActionConsole 
                            status={currentLlc?.llc_status}
                            health={compliance.healthScore}
                            onAction={handleAction} 
                        />
                    </div>
                </div>
            )}
        </main>

        {/* Sidebar */}
        <aside className="w-full md:w-[400px] bg-[#F8F9FB] border-l border-[#F0F2F5] p-12 flex flex-col">
            <div className="flex items-center justify-between mb-12">
                <div className="text-[0.6rem] font-black uppercase tracking-[0.6em] text-[#0A0A0B] opacity-20">Live Stream</div>
                <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-gray-300 hover:text-red-500 transition-colors">
                    <LogOut size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8">
                {activityLog.map((log) => (
                    <div key={log.id} className="relative pl-8 border-l border-gray-100">
                        <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full border border-white shadow-sm" style={{ backgroundColor: log.message.includes('Required') ? '#FF3B30' : '#0A0A0B' }}></div>
                        <p className="text-xs font-black text-[#0A0A0B] mb-1">{log.message}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.time}</p>
                    </div>
                ))}
            </div>

            {/* Intelligence Telemetry (subtle) */}
            <div className="py-6 border-t border-gray-100 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">View Intelligence</p>
                <div className="flex gap-2 flex-wrap">
                    {Object.entries(viewIntel.scores).map(([view, score]) => (
                        <div key={view} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                            viewIntel.activeView === view 
                                ? 'bg-[#0A0A0B] text-white border-transparent' 
                                : 'bg-white text-gray-400 border-gray-100'
                        }`}>
                            {view}: {score}
                        </div>
                    ))}
                </div>
                <p className="text-[9px] text-gray-300">
                    {viewIntel.isOverridden ? '⚡ Manual Override' : '🤖 Auto-Selected'} 
                    {' '}• Logins: {viewIntel.signals.loginCount} • Actions: {viewIntel.signals.recentActions}
                </p>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <div className="bg-[#0A0A0B] rounded-[32px] p-8 text-white">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Settings size={18} /></div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest">{user?.email ? user.email.split('@')[0] : "Founder"}</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sovereign Admin</p>
                        </div>
                    </div>
                    <button onClick={() => window.location.reload()} className="w-full py-3 bg-white/5 hover:bg-white hover:text-[#0A0A0B] border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all">Sync System</button>
                </div>
            </div>
        </aside>
      </div>

      <FoundersBlueprint isOpen={isBlueprintOpen} onClose={() => setIsBlueprintOpen(false)} llcData={currentLlc} />
      <SuccessionSuite isOpen={isSuccessionOpen} onClose={() => setIsSuccessionOpen(false)} companyName={currentLlc?.llc_name} user={user} />
      {showDesignation && <DesignationProtocol user={user} llc={currentLlc} onComplete={(data) => { setActiveLlc(data); setShowDesignation(false); }} />}
    </div>
  );
};

export default DashboardZenith;
