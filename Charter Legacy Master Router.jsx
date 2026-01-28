import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ArrowRight, 
  ShieldCheck, 
  HeartPulse, 
  Lock, 
  LayoutDashboard, 
  Briefcase, 
  Zap, 
  Info, 
  Check, 
  ChevronRight,
  Bell,
  Activity,
  History,
  Brain,
  Fingerprint,
  Sparkles,
  RefreshCw,
  LogOut,
  Target
} from 'lucide-react';

/**
 * CHARTER LEGACY v1.0 - MASTER CONTROL CENTER
 * * This is the central nervous system of the "Whole Widget."
 * 1. Landing: High-taste Jobsian entry.
 * 2. Discovery: Intent-based choice between LLC (Protection) and DBA (Brand).
 * 3. Dashboard: The institutional concierge for active business assets.
 */

// --- Shared Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-50 text-green-700 border-green-100",
    protected: "bg-blue-50 text-blue-700 border-blue-100",
    alert: "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
      {status}
    </span>
  );
};

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'discovery', 'dashboard'
  const [activeTab, setActiveTab] = useState('overview');
  const [isAiSyncing, setIsAiSyncing] = useState(false);

  // --- Sub-Views ---

  /**
   * LANDING VIEW
   * The "Bicycle for the Mind" entry point.
   */
  const LandingView = () => (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col items-center justify-center p-6 text-center space-y-16 animate-in fade-in duration-1000">
      <div className="relative group">
        <div className="w-24 h-24 bg-black rounded-[32px] flex items-center justify-center text-white shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:rotate-3">
          <Shield size={48} strokeWidth={2.5} />
        </div>
        <div className="absolute -top-1 -right-1 bg-blue-500 w-5 h-5 rounded-full border-4 border-[#FBFBFD] animate-pulse" />
      </div>
      
      <div className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
          <Activity size={14} /> Statutory Protocol v1.0
        </div>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-[#1D1D1F] uppercase">
          Charter<br/>Legacy<span className="text-blue-500">.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-xl mx-auto leading-relaxed uppercase tracking-tight">
          The institutional concierge for the self-reliant.
        </p>
      </div>

      <button 
        onClick={() => setView('discovery')}
        className="bg-black text-white px-12 py-7 rounded-full font-black text-xl flex items-center gap-4 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-[0.98]"
      >
        Open Your Charter <ArrowRight size={28} />
      </button>

      <footer className="fixed bottom-12 w-full text-center">
         <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">High-Tech Scrivener • DeLand Hub</p>
      </footer>
    </div>
  );

  /**
   * DISCOVERY VIEW
   * Intent-based selection (LLC vs DBA).
   */
  const DiscoveryView = () => (
    <div className="min-h-screen bg-[#FBFBFD] p-6 md:p-12 space-y-24 animate-in slide-in-from-bottom-8 duration-700">
      <header className="max-w-4xl mx-auto space-y-4 text-center">
        <h2 className="text-6xl md:text-7xl font-black tracking-tight leading-none uppercase">The Matrix.</h2>
        <p className="text-xl text-gray-500 font-medium italic">Select the instrument that matches your dream.</p>
      </header>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">
        {[
          { 
            id: 'LLC', 
            title: 'LLC', 
            icon: Shield, 
            desc: 'Statute 605. Asset protection. The standard for private business owners.', 
            price: '$249',
            features: ['Liability Shield', 'Home Privacy', 'IRS Pass-through']
          },
          { 
            id: 'DBA', 
            title: 'DBA', 
            icon: Briefcase, 
            desc: 'Statute 865. Name registration. Automated newspaper publication.', 
            price: '$149',
            features: ['Professional Alias', 'Public Record Compliance', 'Publication Included']
          }
        ].map(e => (
          <div 
            key={e.id} 
            onClick={() => setView('dashboard')} 
            className="group bg-white p-12 rounded-[56px] border-2 border-gray-100 hover:border-black cursor-pointer transition-all hover:shadow-2xl flex flex-col"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-sm">
              <e.icon size={32} />
            </div>
            <h3 className="text-5xl font-black mb-4 uppercase tracking-tighter">{e.title}</h3>
            <p className="text-gray-400 text-sm mb-12 font-medium leading-relaxed flex-1 italic">{e.desc}</p>
            
            <div className="space-y-4 mb-12">
               {e.features.map(f => (
                 <div key={f} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <Check size={14} className="text-blue-500" /> {f}
                 </div>
               ))}
            </div>

            <div className="flex items-end justify-between border-t border-gray-100 pt-8 mt-auto">
               <div>
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Pricing Model</p>
                  <div className="text-3xl font-black">{e.price}</div>
               </div>
               <div className="p-3 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                  <ArrowRight size={24} />
               </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center pb-24">
        <button 
          onClick={() => setView('landing')}
          className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] hover:text-black transition-colors"
        >
          Return to Entry
        </button>
      </div>
    </div>
  );

  /**
   * DASHBOARD VIEW
   * The active operational center.
   */
  const DashboardView = () => (
    <div className="min-h-screen bg-[#FBFBFD] flex overflow-hidden font-sans selection:bg-black selection:text-white">
      {/* Institutional Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden md:flex flex-col space-y-12 h-screen shadow-sm">
         <div className="flex items-center gap-3 font-black text-2xl tracking-tighter cursor-pointer" onClick={() => setView('landing')}>
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">C</div>
            <span className="uppercase tracking-tighter">Charter</span>
         </div>
         
         <nav className="flex-1 space-y-3">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'vault', label: 'Legacy Vault', icon: Lock },
              { id: 'shield', label: 'Privacy Shield', icon: ShieldCheck },
              { id: 'pulse', label: 'Legacy Pulse', icon: HeartPulse }
            ].map(item => (
              <div 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`p-5 rounded-3xl font-bold text-sm flex items-center gap-4 cursor-pointer transition-all ${activeTab === item.id ? 'bg-black text-white shadow-2xl' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </div>
            ))}
         </nav>

         <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
               <Brain size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">Letta Memory</span>
            </div>
            <p className="text-[10px] text-blue-800 leading-relaxed italic font-medium">"Prioritizing scalable corporate architecture."</p>
         </div>

         <button 
           onClick={() => setView('landing')}
           className="flex items-center gap-3 text-gray-300 hover:text-red-500 transition-colors px-4 py-2 text-[10px] font-black uppercase tracking-widest"
         >
           <LogOut size={16} /> Exit Session
         </button>
      </aside>

      {/* Primary Workspace */}
      <main className="flex-1 p-8 md:p-16 space-y-16 overflow-y-auto h-screen bg-[#FBFBFD]">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <StatusBadge status="protected" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Hub ID: DL-FL-605</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none uppercase text-[#1D1D1F]">TREUSCH & FORGE LLC</h1>
              <p className="text-xl text-gray-400 font-medium italic">Florida Statute 605 • DeLand Hub Node</p>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={() => { setIsAiSyncing(true); setTimeout(() => setIsAiSyncing(false), 2000); }}
                className="bg-white border-2 border-gray-100 text-black px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:border-black transition-all shadow-sm"
              >
                <RefreshCw size={18} className={isAiSyncing ? 'animate-spin text-blue-500' : ''} />
                <span className="text-xs uppercase tracking-widest">Sync Context</span>
              </button>
              <button className="bg-black text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3 active:scale-[0.98] transition-all">
                 <Zap size={20} fill="currentColor" />
                 <span>Ask Engine</span>
              </button>
           </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <div className="grid md:grid-cols-3 gap-8">
               {[
                 { label: 'Privacy Shield', val: 'Protected', desc: 'Home Address Suppressed', icon: ShieldCheck, color: 'text-blue-500' },
                 { label: 'Legacy Pulse', val: 'Optimal', desc: 'Filing Window Closed', icon: HeartPulse, color: 'text-purple-500' },
                 { label: 'Vault Status', val: '14 Assets', desc: 'Encrypted & Redundant', icon: Lock, color: 'text-black' }
               ].map(stat => (
                 <div key={stat.label} className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-6 group hover:border-black transition-all cursor-default">
                    <stat.icon size={28} className={`${stat.color} transition-transform group-hover:scale-110`} />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                      <h3 className="text-3xl font-black uppercase tracking-tight">{stat.val}</h3>
                      <p className="text-[10px] font-bold text-gray-300 uppercase italic">{stat.desc}</p>
                    </div>
                 </div>
               ))}
             </div>

             <section className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[56px] p-12 border border-gray-100 shadow-sm space-y-8">
                   <h2 className="text-3xl font-black uppercase tracking-tight text-gray-300">Sentinel Activity</h2>
                   <div className="space-y-4">
                      {[
                        { time: '2h ago', event: 'Daily Sunbiz Scrape Complete', status: 'verified' },
                        { time: '1d ago', event: 'Newspaper Publication Verified', status: 'active' },
                        { time: '3d ago', event: 'Registered Agent Node Health Check', status: 'verified' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-gray-200 transition-all">
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-mono text-gray-300 uppercase">{item.time}</span>
                              <span className="text-xs font-bold uppercase text-gray-600">{item.event}</span>
                           </div>
                           <StatusBadge status={item.status} />
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-black text-white rounded-[56px] p-12 shadow-2xl space-y-8 relative overflow-hidden group">
                   <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                         <h2 className="text-3xl font-black uppercase tracking-tight">Active Warning</h2>
                         <AlertCircle className="text-red-500 animate-pulse" size={32} />
                      </div>
                      <p className="text-gray-400 font-medium leading-relaxed italic">
                        The **$400 Florida Late Fee Trap** becomes active on May 1st. You have 104 days remaining to execute your Annual Report through the Hub.
                      </p>
                      <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all">
                         Secure May 1st Protection
                      </button>
                   </div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-red-500/20 transition-all duration-1000" />
                </div>
             </section>
          </div>
        )}
      </main>
    </div>
  );

  // --- Router Logic ---

  if (view === 'discovery') return <DiscoveryView />;
  if (view === 'dashboard') return <DashboardView />;
  return <LandingView />;
}