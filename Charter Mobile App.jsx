import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  HeartPulse, 
  ShieldCheck, 
  LayoutDashboard, 
  Zap, 
  Sparkles, 
  Bell,
  ChevronRight,
  ArrowRight,
  Fingerprint,
  Activity,
  History,
  FileText,
  AlertCircle
} from 'lucide-react';

/**
 * CHARTER MOBILE APP v1.0
 * The thumb-optimized constraint of the Charter Legacy ecosystem.
 * Focus: High-density status, institutional hardware aesthetic.
 */

// --- Sub-Components ---

const StatTile = ({ label, value, icon: Icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col gap-4 text-left shadow-sm active:scale-95 transition-all group"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
      <Icon size={20} className={color} />
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-black text-[#1D1D1F] uppercase tracking-tight">{value}</p>
    </div>
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  // --- Views ---

  const Overview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Alert Card: The Heartbeat */}
      <section className="p-8 bg-black text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-blue-400">
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">Sentinel Active</span>
             </div>
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          
          <div className="space-y-2">
             <h3 className="text-3xl font-black leading-tight uppercase tracking-tight">Trap Defused.</h3>
             <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Your 2026 Annual Report was secured via the **DeLand Hub**. The $400 late fee trap is no longer a risk.
             </p>
          </div>

          <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
             View Compliance Artifact <ArrowRight size={16} />
          </button>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-blue-500/20" />
      </section>

      {/* Grid Status Tiles */}
      <div className="grid grid-cols-2 gap-4">
        <StatTile 
          label="Privacy" 
          value="Protected" 
          icon={ShieldCheck} 
          color="text-blue-500" 
          onClick={() => setActiveTab('shield')}
        />
        <StatTile 
          label="Vault" 
          value="14 Assets" 
          icon={Lock} 
          color="text-black" 
          onClick={() => setActiveTab('vault')}
        />
      </div>

      {/* Recent Activity Mini-Feed */}
      <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
         <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Hub Activity</h4>
            <History size={14} className="text-gray-200" />
         </div>
         <div className="space-y-4">
            {[
              { title: 'LLC Synced', time: '2h ago', icon: Activity },
              { title: 'Tax Mail Scanned', time: '1d ago', icon: FileText }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                 <div className="flex items-center gap-3">
                    <item.icon size={14} className="text-gray-300" />
                    <span className="text-[11px] font-bold uppercase tracking-tight text-gray-600">{item.title}</span>
                 </div>
                 <span className="text-[9px] font-bold text-gray-300 uppercase">{item.time}</span>
              </div>
            ))}
         </div>
      </section>
    </div>
  );

  const Vault = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-2 space-y-1">
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Institutional Storage</p>
        <h2 className="text-3xl font-black uppercase tracking-tight">Legacy Vault</h2>
      </header>
      <div className="space-y-3">
        {[
          { name: 'Articles of Org', type: 'Certified PDF', tier: 'Tier 2' },
          { name: 'Operating Agreement', type: 'Digital Artifact', tier: 'Tier 2' },
          { name: 'Health Directive', type: 'Succession Ready', tier: 'Tier 1' }
        ].map((doc, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-all">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><FileText size={20} /></div>
                <div>
                   <p className="text-[11px] font-black uppercase text-[#1D1D1F]">{doc.name}</p>
                   <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{doc.type} • {doc.tier}</p>
                </div>
             </div>
             <ChevronRight size={16} className="text-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased selection:bg-black selection:text-white">
      {/* Top Header */}
      <header className="px-6 pt-14 pb-6 bg-white border-b border-gray-50 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter leading-none">Charter</h1>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">DeLand Hub</p>
          </div>
        </div>
        <div className="relative">
          <Bell className="text-gray-300" size={24} />
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 pb-32">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'vault' && <Vault />}
        {activeTab === 'shield' && (
          <div className="p-12 text-center text-gray-300 italic animate-in fade-in">
             <Fingerprint size={48} className="mx-auto mb-4 opacity-20" />
             <p className="text-sm font-medium uppercase tracking-widest">Privacy Shield Control Node</p>
          </div>
        )}
        {activeTab === 'pulse' && (
          <div className="p-12 text-center text-gray-300 italic animate-in fade-in">
             <HeartPulse size={48} className="mx-auto mb-4 opacity-20" />
             <p className="text-sm font-medium uppercase tracking-widest">Compliance Heartbeat Console</p>
          </div>
        )}
      </main>

      {/* Floating Institutional Nav Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] flex items-center px-4 z-50">
        {[
          { id: 'overview', icon: LayoutDashboard },
          { id: 'vault', icon: Lock },
          { id: 'shield', icon: ShieldCheck },
          { id: 'pulse', icon: HeartPulse }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)} 
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === item.id ? 'text-black scale-110' : 'text-gray-300 hover:text-gray-400'}`}
          >
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            <div className={`w-1 h-1 rounded-full bg-black transition-opacity duration-300 ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
          </button>
        ))}
      </nav>

      {/* Haptic Visual Feedback Layer (Optional) */}
      <div className="fixed bottom-0 w-full h-1 pointer-events-none opacity-10 bg-gradient-to-r from-blue-500 via-black to-blue-500" />
    </div>
  );
}