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
import CheckoutSector from './sectors/checkout/CheckoutSector';
import { useCompliance } from './hooks/useCompliance';
import { useAudit } from './hooks/useAudit';
import { useViewIntelligence } from './hooks/useViewIntelligence';
import { GlassCard } from './shared/design-system/UIPrimitives';

const PrimeIntelligenceHub = ({ llc, compliance, onAction }) => {
  const { lifecycleStage, namingStatus } = compliance;

  const getLifecycleProgress = () => {
    switch (lifecycleStage) {
      case 'ACTIVE': return 100;
      case 'REVIEW': return 66;
      case 'FORMATION': return 33;
      case 'RECOVERY': return 0;
      default: return 33;
    }
  };

  const lifecycleLabels = [
    { id: 'FORMATION', label: 'Formation' },
    { id: 'REVIEW', label: 'State Review' },
    { id: 'ACTIVE', label: 'Active Status' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 1. Naming & Lifecycle Overview */}
      <GlassCard variant="glass" className="p-8 border-[#00D084]/10 bg-[#00D084]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D084]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">
              {llc?.llc_name} Intelligence
            </h3>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                <Shield size={10} className={namingStatus === 'PROTECTED' ? 'text-cyan-400' : 'text-[#00D084]'} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                  Naming: {namingStatus}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                <CheckCircle2 size={10} className="text-[#00D084]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                  Status: {llc?.llc_status || 'Active'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-black/20 p-3 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
              <Zap size={20} className={compliance.healthScore > 80 ? 'text-[#00D084]' : 'text-amber-500'} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block">Health Rating</span>
              <span className="text-xl font-black text-white">{compliance.healthScore}%</span>
            </div>
          </div>
        </div>

        {/* 2. State Lifecycle Progress Tracker */}
        <div className="mt-10 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">State Lifecycle Progress</span>
            <span className="text-[10px] font-black text-[#00D084]">{getLifecycleProgress()}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#00D084] transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
              style={{ width: `${getLifecycleProgress()}%` }}
            />
          </div>
          <div className="flex justify-between px-1">
            {lifecycleLabels.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getLifecycleProgress() >= (step.id === 'FORMATION' ? 33 : (step.id === 'REVIEW' ? 66 : 100)) ? 'bg-[#00D084] shadow-[0_0_8px_#10b981]' : 'bg-white/10'}`} />
                <span className={`text-[9px] font-bold uppercase tracking-tight ${getLifecycleProgress() >= (step.id === 'FORMATION' ? 33 : (step.id === 'REVIEW' ? 66 : 100)) ? 'text-white' : 'text-white/20'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* 3. Entity-Specific Action Cards (Fulfillment Desk) */}
      <div className="space-y-4">
        <div className="px-2">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Secure Your Entity</h4>
          <p className="text-[9px] text-white/20 font-medium uppercase tracking-widest mt-1">Foundational protocols for 10/10 asset protection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!compliance.hasOperatingAgreement && (
            <GlassCard 
              variant="glass" 
              onClick={() => onAction('governance')}
              className="p-6 cursor-pointer group hover:bg-white/5 transition-all border-white/5 hover:border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-[#00D084]/20 group-hover:text-[#00D084] transition-all border border-white/5">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-white group-hover:text-white transition-colors">Operating Agreement</h4>
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Required</span>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium leading-relaxed italic">"Establishing corporate veil separation."</p>
                </div>
                <ChevronRight size={16} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </GlassCard>
          )}

          {!compliance.hasEIN && (
            <GlassCard 
              variant="glass" 
              onClick={() => onAction('tax')}
              className="p-6 cursor-pointer group hover:bg-white/5 transition-all border-white/5 hover:border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all border border-white/5">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-white group-hover:text-white transition-colors">EIN Application</h4>
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/10">Optional</span>
                  </div>
                  <p className="text-[10px] text-white/30 font-medium leading-relaxed italic">"Automated IRS filing service."</p>
                </div>
                <ChevronRight size={16} className="text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </GlassCard>
          )}

          {compliance.hasOperatingAgreement && compliance.hasEIN && (
            <div className="col-span-full p-8 text-center bg-[#00D084]/5 border border-dashed border-[#00D084]/20 rounded-[32px] animate-in zoom-in-95 duration-500">
               <div className="w-12 h-12 rounded-full bg-[#00D084]/10 text-[#00D084] flex items-center justify-center mx-auto mb-4 border border-[#00D084]/20">
                  <CheckCircle2 size={20} />
               </div>
               <h5 className="text-[10px] font-black uppercase tracking-widest text-[#00D084] mb-1">Structural Integrity Verified</h5>
               <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">All available security protocols are active.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
              onClick={() => onAction('active')}
              className="p-6 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={12} className="text-white/40" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Active Filings</span>
              <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-white">1</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#00D084] opacity-0 group-hover:opacity-100 transition-all">View Detail →</span>
              </div>
          </div>

          <div 
              onClick={() => onAction('due')}
              className="p-6 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={12} className="text-white/40" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Due Soon</span>
              <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-amber-500">0</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 opacity-0 group-hover:opacity-100 transition-all">Resolve →</span>
              </div>
          </div>

          <div 
              onClick={() => onAction('shield')}
              className="p-6 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
          >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={12} className="text-white/40" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Security Status</span>
              <div className="flex items-end justify-between">
                  <span className="text-3xl font-black text-cyan-400">SAFE</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-all">Verify →</span>
              </div>
          </div>
      </div>
    </div>
  );
};

const DashboardZenith = ({ user, initialData, onLogout, entryOrigin, onNavigateLanding }) => {
  const [loading, setLoading] = useState(true);
  const [activeLlc, setActiveLlc] = useState(initialData || null);
  const [companies, setCompanies] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [complianceAlerts, setComplianceAlerts] = useState([]);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isSuccessionOpen, setIsSuccessionOpen] = useState(false);
  const [showDesignation, setShowDesignation] = useState(false);
  const [activePulseModal, setActivePulseModal] = useState(null); // 'active', 'due', 'shield'
  const [checkoutItem, setCheckoutItem] = useState(null);

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
                if ((data[0]?.llc_name?.includes('Pending') || data[0]?.llc_status === 'Setting Up') && entryOrigin !== 'footer') {
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
      
      const currentLlcName = activeLlc?.llc_name || '';
      const currentLlcId = activeLlc?.id;

      // 1. Structural Security Actions (Governance & Tax)
      if (actionId === 'governance') {
          setCheckoutItem({
              id: 'governance',
              title: "Operating Agreement",
              price: "$199",
              plainEnglish: "A professional, attorney-drafted Operating Agreement to establish your corporate veil and governance rules.",
              llc_name: currentLlcName,
              llc_id: currentLlcId
          });
      }

      if (actionId === 'tax') {
          setCheckoutItem({
              id: 'tax',
              title: "IRS EIN Application",
              price: "$99",
              plainEnglish: "Direct IRS filing for your Employer Identification Number. Essential for banking and taxes.",
              llc_name: currentLlcName,
              llc_id: currentLlcId
          });
      }

      // 2. Lifecycle Management Actions (From ActionConsole)
      if (actionId === 'new_entity') {
          setCheckoutItem({
              id: 'formation',
              title: "New Florida LLC Formation",
              price: "$399",
              plainEnglish: "Complete Articles of Organization filing, state correspondence, and initial compliance setup.",
              llc_name: '', // Starts clean for a new formation
              llc_id: null
          });
      }

      if (actionId === 'amend') {
          setCheckoutItem({
              id: 'amendment',
              title: "Articles of Amendment",
              price: "$149",
              plainEnglish: "Legally update your entity structure, names, or addresses with the State of Florida.",
              llc_name: currentLlcName,
              llc_id: currentLlcId
          });
      }

      if (actionId === 'annual_report') {
          setCheckoutItem({
              id: 'maintenance',
              title: "Annual Report Filing",
              price: "$200",
              plainEnglish: "State-mandated yearly update to keep your business in good standing ($150 State + $50 Service).",
              llc_name: currentLlcName,
              llc_id: currentLlcId
          });
      }

      if (actionId === 'dissolve') {
          setCheckoutItem({
              id: 'dissolution',
              title: "Articles of Dissolution",
              price: "$199",
              plainEnglish: "Legally close your business and terminate its liability with the State of Florida.",
              llc_name: currentLlcName,
              llc_id: currentLlcId
          });
      }

      // 3. Status Cards
      if (actionId === 'active') setActivePulseModal('active');
      if (actionId === 'due') setActivePulseModal('due');
      if (actionId === 'shield') setActivePulseModal('shield');
  };

  const selectEntity = (entity) => {
      setActiveLlc(entity);
      viewIntel.setOverride('situational');
  };

  const forensicSanitize = (llc) => {
    if (!llc?.llc_name) return "Main Company";
    
    let currentName = llc.llc_name.trim();
    const suffixes = ['LLC', 'LIMITED', 'COMPANY', 'PLLC', 'L.L.C.', 'P.L.L.C.', 'LTD. CO.'].map(s => s.replace(/[.,]/g, ''));

    // Recursive suffix stripping to handle deep duplication (e.g. LTD. CO. LTD. CO.)
    const cleanOneLevel = (name) => {
        const words = name.split(/\s+/).filter(Boolean);
        if (words.length < 2) return name;
        
        const last = words[words.length - 1].toUpperCase().replace(/[.,]/g, '');
        const secondLast = words[words.length - 2].toUpperCase().replace(/[.,]/g, '');
        
        if (suffixes.includes(last) && suffixes.includes(secondLast)) {
            return words.slice(0, -1).join(' ');
        }
        return name;
    };

    let prevName = "";
    while (currentName !== prevName) {
        prevName = currentName;
        currentName = cleanOneLevel(currentName);
    }
    
    return currentName;
  };

  const currentLlc = activeLlc || (companies && companies[0]) || null;
  const currentLlcName = forensicSanitize(currentLlc);
  const currentView = viewIntel.activeView;

  // Pulse Metrics Logic - Context Aware (Entity vs Fleet)
  const pulseContext = (currentView === 'fleet') ? companies : [currentLlc].filter(Boolean);
  // Synchronize with PulseDetailModals.jsx: Active entities are verified to have at least 'Articles of Organization'
  const activeFilingsCount = pulseContext.filter(c => c.llc_status === 'Active' || c.llc_status === 'ACTIVE').length;
  const shieldedCount = pulseContext.filter(c => c.product_type === 'Shield' || c.product_type === 'double_llc_protocol').length;
  const dueSoonCount = complianceAlerts.filter(a => {
      // Filter alerts by current LLC if not in fleet view
      if (currentView !== 'fleet' && currentLlc && a.llc_id !== currentLlc.id) return false;
      if (a.status === 'Completed') return false;
      const dueDate = new Date(a.due_date);
      const today = new Date();
      const next30Days = new Date();
      next30Days.setDate(today.getDate() + 30);
      return dueDate >= today && dueDate <= next30Days;
  }).length;

  // Filtered Activity for Intelligence Feed
  const currentActivityLog = (currentView === 'fleet') 
      ? activityLog 
      : activityLog.filter(log => !log.llcId || log.llcId === currentLlc?.id);

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
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onNavigateLanding}
          >
             <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black group-hover:scale-110 transition-transform">
               <Shield size={18} />
             </div>
             <span className="font-black uppercase tracking-tighter text-xl text-white group-hover:text-emerald-500 transition-colors">Charter Legacy</span>
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
          <button 
            onClick={onLogout}
            className="px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all"
          >
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
                    <PrimeIntelligenceHub 
                        llc={currentLlc} 
                        compliance={compliance}
                        onAction={(type) => {
                            if (['active', 'due', 'shield'].includes(type)) {
                                setActivePulseModal(type);
                            } else {
                                handleAction(type);
                            }
                        }}
                    />
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
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                              {currentView === 'fleet' ? 'Fleet Standing' : `${currentLlcName} Standing`}
                          </span>
                          <Info size={14} className="text-white/20" />
                      </div>
                      
                      <StatusRing 
                          percentage={compliance.healthScore} 
                          color={compliance.pulseColor} 
                          label={currentView === 'fleet' ? 'Portfolio' : 'Company'}
                          pulse={compliance.healthScore < 80}
                      />
 
                      <div className="space-y-1">
                          <h4 className="text-lg font-black uppercase tracking-tight text-white">
                              {compliance.healthScore === 100 ? 'Fully Operational' : 
                               (compliance.healthScore === 0 ? 'Action Required' : 
                                (currentLlc?.llc_status || 'Attention Needed'))}
                          </h4>
                          <p className="text-xs text-white/40 font-medium px-4">
                              {compliance.healthScore === 100 
                                  ? 'All filings are active and your business is in good standing.' 
                                  : (compliance.healthScore === 0 
                                      ? `We've detected that this entity is currently ${currentLlc?.llc_status || 'Inactive'}. We can help you restore it easily.`
                                      : `Your business is currently ${currentLlc?.llc_status || 'Active'}. We're simply monitoring for the final state confirmation.`)}
                          </p>
                      </div>
  
                      <button 
                        onClick={() => setActivePulseModal('health')}
                        className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white hover:text-black transition-all"
                      >
                          View Full Report
                      </button>
                 </GlassCard>

                  {/* ACTIVITY LOG */}
                  <GlassCard variant="glass" className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                              {currentView === 'fleet' ? 'Portfolio Events' : `${currentLlcName} Events`}
                          </span>
                          <RefreshCw size={14} className="text-white/20 pointer-events-none" />
                      </div>
  
                      <div className="space-y-6 text-left">
                          {currentActivityLog.map((log) => (
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
      <CheckoutSector 
          item={checkoutItem}
          isOpen={!!checkoutItem}
          onClose={() => setCheckoutItem(null)}
          onSuccess={() => {
              setCheckoutItem(null);
              window.location.reload();
          }}
      />
    </div>
  );
};

export default DashboardZenith;
