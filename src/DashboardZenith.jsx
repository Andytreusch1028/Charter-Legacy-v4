import React, { useState, useEffect } from 'react';
import { 
  Shield, Clock, FileText, CheckCircle2, AlertCircle, 
  ChevronRight, Lock, Activity, RefreshCw, LogOut, Settings,
  Copy, Download, Eye, EyeOff, LayoutGrid, List, Info, Zap
} from 'lucide-react';
import { supabase } from './lib/supabase';

import FoundersBlueprint from './FoundersBlueprint';
import SuccessionSuite from './SuccessionSuite';
import DesignationProtocol from './DesignationProtocol';
import StatusRing from './components/StatusRing';
import ActionConsole from './components/ActionConsole';
import PortfolioGrid from './components/EmpireGrid';
import CompanyWorkspace from './components/SovereignCommandView';
import ViewSwitcher from './components/ViewSwitcher';
import PulseDetailModal from './components/PulseDetailModals';
import { useCompliance } from './hooks/useCompliance';
import { useAudit } from './hooks/useAudit';
import { useViewIntelligence } from './hooks/useViewIntelligence';
import { GlassCard } from './shared/design-system/UIPrimitives';

const DashboardZenith = ({ user, initialData }) => {
  const [loading, setLoading] = useState(true);
  const [activeLlc, setActiveLlc] = useState(initialData || null);
  const [companies, setCompanies] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [complianceAlerts, setComplianceAlerts] = useState([]);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isSuccessionOpen, setIsSuccessionOpen] = useState(false);
  const [showDesignation, setShowDesignation] = useState(false);
  const [activePulseModal, setActivePulseModal] = useState(null); // 'active', 'due', 'shield'

  // Audit Ledger Engine
  const { logAction } = useAudit();

  // Compliance Monitoring
  const compliance = useCompliance(user, activeLlc) || { 
      healthScore: 100, pulseColor: '#00D084', alerts: [], daysToDeadline: null 
  };

  // View Intelligence Engine
  const viewIntel = useViewIntelligence(
      user?.id,
      companies?.length || 0,
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
            setCompanies(data);
            if (!activeLlc) {
                setActiveLlc(data[0]);
                if (data[0]?.llc_name?.includes('Pending') || data[0]?.llc_status === 'Setting Up') {
                    setShowDesignation(true);
                }
            }
        } else {
            const demoCompanies = [
                { id: 1, llc_name: 'Charter Legacy Demo LLC', llc_status: 'Active', created_at: new Date().toISOString() },
                { id: 2, llc_name: 'Wyoming Holdings LLC', llc_status: 'Active', created_at: new Date().toISOString() },
                { id: 3, llc_name: 'Heritage Property LLC', llc_status: 'Action Required', created_at: new Date().toISOString() }
            ];
            setCompanies(demoCompanies);
            if (!activeLlc) setActiveLlc(demoCompanies[0]);
        }

        // Fetch Compliance Alerts
        try {
          const { data: alerts, error: alertError } = await supabase
              .from('compliance_alerts')
              .select('*')
              .eq('user_id', user.id);
          
          if (alertError) {
              console.warn("[Dashboard Warning] compliance_alerts missing in production.");
              setComplianceAlerts([]);
          } else if (alerts) {
              setComplianceAlerts(alerts);
          }
        } catch (alertErr) {
          console.error("Compliance fetch failure:", alertErr);
          setComplianceAlerts([]);
        }

        setActivityLog([
            { id: 1, message: "Account Secure", time: "Just now", icon: Shield },
            { id: 2, message: "Company List Updated", time: "1 min ago", icon: RefreshCw },
            { id: 3, message: "Dashboard Ready", time: "Auto", icon: Eye },
        ]);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        const errCompanies = [{ id: 'err', llc_name: 'Main Company', llc_status: 'Active', created_at: new Date().toISOString() }];
        setCompanies(errCompanies);
        setActiveLlc(errCompanies[0]);
      } finally {
        setTimeout(() => setLoading(false), 800);
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
      viewIntel.setOverride('situational');
  };

  const sanitizeName = (name) => {
    if (!name) return "";
    // Remove double occurrences of common company suffixes
    return name.replace(/(LTD\. CO\.)\s+\1/gi, "$1").replace(/(LLC)\s+\1/gi, "$1");
  };

  const currentLlc = activeLlc || (companies && companies[0]) || null;
  const currentLlcName = sanitizeName(currentLlc?.llc_name);
  const currentView = viewIntel.activeView;

  // Pulse Metrics Logic
  const activeFilingsCount = companies.filter(c => c.llc_status === 'Active').length;
  const shieldedCount = companies.filter(c => c.product_type === 'Shield').length;
  const dueSoonCount = complianceAlerts.filter(a => {
      if (a.status === 'Completed') return false;
      const dueDate = new Date(a.due_date);
      const today = new Date();
      const next30Days = new Date();
      next30Days.setDate(today.getDate() + 30);
      return dueDate >= today && dueDate <= next30Days;
  }).length;

  if (loading) {
      return (
          <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center space-y-8 text-white">
              <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/5 border-t-white rounded-full animate-spin" />
                  <Shield size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" />
              </div>
              <div className="space-y-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Preparing your Workspace</p>
                  <p className="text-[11px] text-white/20 font-medium animate-pulse">Setting up your secure view...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] selection:bg-white selection:text-black">
      {/* 1. NAVIGATION */}
      <nav className="h-20 bg-[#0D0D0E]/80 backdrop-blur-xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
               <Shield size={18} />
             </div>
             <span className="font-black uppercase tracking-tighter text-xl text-white">Charter Legacy</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex items-center gap-8">
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">Account Owner</span>
                <span className="text-xs font-bold text-white">{user?.email || 'Guest Founder'}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
             <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/60 whitespace-nowrap">Cloud Sync Active</span>
          </div>
          <button className="p-3 text-white/30 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <button className="px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all">
            Secure Logout
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-[1600px] mx-auto space-y-12 pb-32">
        {/* 2. HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-white/50 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">
                 <Activity size={12} /> Dashboard Overview
              </div>
              <div>
                 <h1 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">
                     {currentView === 'fleet' ? 'Business Portfolio' : (currentView === 'situational' ? 'Intelligence Feed' : currentLlcName)}
                 </h1>
                 <p className="text-white/40 text-sm font-medium mt-3">
                     {currentView === 'fleet' 
                       ? 'Overview of all your registered entities and their standing.' 
                       : (currentView === 'situational' 
                           ? 'Real-time portfolio telemetry and suggested actions.'
                           : 'Manage your selected company and active filings.')}
                 </p>
              </div>
           </div>

          <div className="flex items-center gap-3">
              <ViewSwitcher 
                activeView={currentView} 
                recommended={viewIntel.recommended}
                isOverridden={viewIntel.isOverridden}
                onSelect={(v) => viewIntel.setOverride(v)} 
                onReset={viewIntel.clearOverride}
              />
           </div>
        </header>

        {/* 3. DYNAMIC WORKSPACE */}
        <section className="grid grid-cols-12 gap-8">
            {/* LEFT COLUMN */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
                {currentView === 'fleet' ? (
                    <>
                        <PortfolioGrid 
                            entities={companies} 
                            onSelect={selectEntity}
                        />
                        {/* ACTIONS - Only shown in Portfolio view */}
                        <ActionConsole onAction={handleAction} />
                    </>
                ) : currentView === 'situational' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        {/* ADAPTIVE FEED - Surfaced Intelligence */}
                        <GlassCard variant="glass" className="p-8 border-[#00D084]/10 bg-[#00D084]/5">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Portfolio Pulse</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#00D084] mt-1 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#00D084] rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                                        Systems Nominal
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">Health Score</span>
                                    <span className="text-3xl font-black text-white">98%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div 
                                    onClick={() => setActivePulseModal('active')}
                                    className="p-6 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={12} className="text-white/40" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Active Filings</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-3xl font-black text-white">{activeFilingsCount}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[#00D084] opacity-0 group-hover:opacity-100 transition-all">View Detail →</span>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setActivePulseModal('due')}
                                    className="p-6 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={12} className="text-white/40" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Due Soon</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-3xl font-black text-amber-500">{dueSoonCount}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 opacity-0 group-hover:opacity-100 transition-all">Resolve →</span>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setActivePulseModal('shield')}
                                    className="p-6 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={12} className="text-white/40" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Shielded Entities</span>
                                    <div className="flex items-end justify-between">
                                        <span className="text-3xl font-black text-cyan-400">{shieldedCount}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-all">Verify →</span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        {/* CENTRAL ACTIVITY FEED */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-2">Recent Intelligence</h4>
                            {activityLog.map((log) => (
                                <GlassCard key={log.id} variant="glass" className="p-6 flex items-center justify-between group hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                                            <log.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white/90 group-hover:text-white">{log.message}</p>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{log.time}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                ) : (
                    <CompanyWorkspace 
                        llc={currentLlc} 
                        compliance={compliance}
                        onAction={handleAction}
                        onSuccession={() => {
                            setIsSuccessionOpen(true);
                            logAction('OPEN_SUCCESSION_SUITE', 'SUCCESS', { 
                                llcId: currentLlc?.id,
                                llcName: currentLlc?.llc_name 
                            });
                        }}
                        userId={user?.id}
                        logAction={logAction}
                    />
                )}
            </div>

            {/* RIGHT COLUMN */}
            <aside className="col-span-12 lg:col-span-4 space-y-8">
                 {/* HEALTH CARD */}
                 <GlassCard variant="glass" className="p-8 flex flex-col items-center text-center space-y-6">
                     <div className="w-full flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Business Standing</span>
                         <Info size={14} className="text-white/20" />
                     </div>
                     
                     <StatusRing 
                         score={compliance.healthScore} 
                         color={compliance.pulseColor} 
                         label={currentView === 'situational' ? 'Company' : 'Portfolio'}
                     />
 
                     <div className="space-y-1">
                         <h4 className="text-lg font-black uppercase tracking-tight text-white">
                             {compliance.healthScore === 100 ? 'Fully Operational' : 'Action Required'}
                         </h4>
                         <p className="text-xs text-white/40 font-medium">
                             {compliance.healthScore === 100 
                                 ? 'All filings are active and your business is in good standing.' 
                                 : 'Specific items require your attention to maintain status.'}
                         </p>
                     </div>
 
                     <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white hover:text-black transition-all">
                         View Full Report
                     </button>
                 </GlassCard>

                 {/* ACTIVITY LOG */}
                 <GlassCard variant="glass" className="p-8 space-y-6">
                     <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Recent Events</span>
                         <RefreshCw size={14} className="text-white/20 pointer-events-none" />
                     </div>
 
                     <div className="space-y-6 text-left">
                         {activityLog.map((log) => (
                             <div key={log.id} className="flex gap-4 group">
                                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-white group-hover:text-black transition-all flex-shrink-0">
                                     <log.icon size={18} />
                                 </div>
                                 <div className="flex flex-col justify-center">
                                     <p className="text-xs font-bold text-white/90">{log.message}</p>
                                     <p className="text-[10px] text-white/20 font-medium">{log.time}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </GlassCard>
            </aside>
        </section>
      </main>

      {/* DASHBOARD MODALS */}
      {isBlueprintOpen && <FoundersBlueprint llc={currentLlc} onClose={() => setIsBlueprintOpen(false)} />}
      {isSuccessionOpen && (
        <SuccessionSuite 
            llc={currentLlc} 
            onClose={() => setIsSuccessionOpen(false)} 
            logAction={logAction}
        />
      )}
      {showDesignation && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <DesignationProtocol 
                user={user} 
                llc={currentLlc} 
                onClose={() => setShowDesignation(false)} 
                onComplete={() => {
                  setShowDesignation(false);
                  window.location.reload(); 
                }}
            />
          </div>
        </div>
      )}
      {activePulseModal && (
          <PulseDetailModal 
            type={activePulseModal} 
            data={companies} 
            alerts={complianceAlerts} 
            onClose={() => setActivePulseModal(null)} 
          />
      )}
    </div>
  );
};

export default DashboardZenith;
