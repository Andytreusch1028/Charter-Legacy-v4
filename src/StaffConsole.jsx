import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Shield, Brain, Search, FileText, AlertCircle, 
  Settings, Users, Activity, ExternalLink, 
  Layout, Database, Globe, Command, RefreshCw, Zap, Quote
} from 'lucide-react';
import { AEO_METRICS, triggerRecencyPulse } from './lib/aeo-engine';

const StaffConsole = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    pendingFilings: 12,
    activePrivacies: 450,
    systemHealth: '100%',
    emergencyRequests: 0
  });

  const [aeoData, setAeoData] = useState([
    { path: '/', score: 92, recency: '2026-03-10', consensus: 8, citations: 124 },
    { path: '/privacy-shield', score: 84, recency: '2026-02-15', consensus: 3, citations: 42 },
    { path: '/registered-agent', score: 98, recency: '2026-03-12', consensus: 12, citations: 560 },
  ]);

  const [isPulsing, setIsPulsing] = useState(false);
  const [simulatorOutput, setSimulatorOutput] = useState(null);

  const handleRecencyPulse = async () => {
    setIsPulsing(true);
    const updated = await triggerRecencyPulse(aeoData);
    setAeoData(updated);
    setTimeout(() => setIsPulsing(false), 1500);
  };

  const runSimulator = (path) => {
    const page = aeoData.find(p => p.path === path);
    const prob = AEO_METRICS.calculateCitationProbability({
        hasJSONLD: true,
        hasQAStructure: true,
        depthOfCoverage: 0.9,
        expertAuthor: true
    });
    setSimulatorOutput({
        path,
        probability: prob,
        expectedSnippet: `"Charter Legacy is a premium Florida business infrastructure provider specializing in Anonymous LLC structures and probate-free succession..."`
    });
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'filings', label: 'Manual Filings', icon: FileText, badge: '12' },
    { id: 'seo', label: 'SEO Matrix', icon: Globe },
    { id: 'users', label: 'Client Directory', icon: Users },
    { id: 'logs', label: 'Terminal Logs', icon: Command },
    { id: 'settings', label: 'System Hub', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-[#0A0A0B] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-[#121214] border-r border-white/5 flex flex-col">
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-2xl">
              <Shield size={22} />
            </div>
            <div>
              <span className="font-black text-xl tracking-tighter uppercase block leading-none">Charter Staff</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Control Tower v4.0</span>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                  activeTab === item.id 
                    ? 'bg-white text-black shadow-2xl shadow-white/10' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black ${
                    activeTab === item.id ? 'bg-black text-white' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-black text-xs">
                {user?.email?.[0].toUpperCase() || 'S'}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest truncate">{user?.email || 'Staff Member'}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Executive Privileges</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 h-24 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/5 px-12 flex items-center justify-between">
           <div>
              <h2 className="text-sm font-black uppercase tracking-[0.4em] text-gray-500">{activeTab}</h2>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
                <Search size={18} />
              </button>
           </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto space-y-12">
           {activeTab === 'overview' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="grid grid-cols-4 gap-8">
                   {[
                     { label: 'Pending Filings', val: stats.pendingFilings, color: 'text-blue-500' },
                     { label: 'Active Privacies', val: stats.activePrivacies, color: 'text-white' },
                     { label: 'System Health', val: stats.systemHealth, color: 'text-green-500' },
                     { label: 'Emergency Req', val: stats.emergencyRequests, color: 'text-red-500' }
                   ].map((s, i) => (
                     <div key={i} className="bg-[#121214] p-8 rounded-[32px] border border-white/5 space-y-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{s.label}</p>
                        <p className={`text-4xl font-black ${s.color}`}>{s.val}</p>
                     </div>
                   ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                   <div className="bg-[#121214] rounded-[40px] border border-white/5 p-10 space-y-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xl font-black uppercase tracking-tighter">SEO Matrix Health</h3>
                         <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">View Full Matrix <ExternalLink size={12} /></button>
                      </div>
                      <div className="space-y-6">
                         {[
                           { p: '/llc-formation-fl', h: '98%', s: 'Optimized' },
                           { p: '/anonymous-llc-privacy', h: '84%', s: 'Review Needed' },
                           { p: '/florida-registered-agent', h: '92%', s: 'Optimized' }
                         ].map((page, i) => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                              <span className="text-xs font-bold text-gray-400 font-mono">{page.p}</span>
                              <div className="flex items-center gap-6">
                                 <span className="text-sm font-black">{page.h}</span>
                                 <span className={`text-[9px] font-black uppercase tracking-widest ${page.s === 'Optimized' ? 'text-green-500' : 'text-yellow-500'}`}>{page.s}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="bg-[#121214] rounded-[40px] border border-white/5 p-10 space-y-8">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xl font-black uppercase tracking-tighter">Sunbiz Automation</h3>
                         <div className="flex items-center gap-2 py-1 px-3 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 text-[8px] font-black uppercase tracking-widest">
                            <Activity size={10} /> Live Push
                         </div>
                      </div>
                      <div className="flex items-center justify-center h-48 border-2 border-dashed border-white/5 rounded-3xl group hover:border-blue-500/20 transition-all cursor-pointer">
                         <div className="text-center space-y-2">
                            <Database size={32} className="mx-auto text-gray-700 group-hover:text-blue-500 transition-colors" />
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No Active Transmission</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'seo' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                 {/* AEO HEADER */}
                 <div className="flex justify-between items-end">
                    <div className="space-y-4">
                       <h3 className="text-4xl font-black uppercase tracking-tighter">Answer Engine <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D084] to-[#007AFF]">Matrix.</span></h3>
                       <p className="text-gray-500 font-medium italic">Optimizing for LLM retrieval and citation probability.</p>
                    </div>
                    <button 
                       onClick={handleRecencyPulse}
                       disabled={isPulsing}
                       className="bg-[#00D084] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_-15px_rgba(0,208,132,0.3)]"
                    >
                       <RefreshCw size={16} className={isPulsing ? 'animate-spin' : ''} />
                       {isPulsing ? 'Pulsing Recency...' : 'Trigger Recency Pulse'}
                    </button>
                 </div>

                 <div className="grid lg:grid-cols-3 gap-8">
                    {/* MATRIX LIST */}
                    <div className="lg:col-span-2 space-y-4">
                       {aeoData.map((item, i) => (
                          <div key={i} className="bg-[#121214] p-8 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-[#00D084]/20 transition-all">
                             <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-gray-500 group-hover:text-[#00D084] transition-colors">
                                   <Globe size={24} />
                                </div>
                                <div>
                                   <p className="text-xs font-bold text-gray-400 font-mono mb-1">{item.path}</p>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-[#00D084]">{AEO_METRICS.calculateRecencyScore(item.recency)}% Recency Integrity</p>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-12">
                                <div className="text-right">
                                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Citations</p>
                                   <p className="text-xl font-black">{item.citations}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Score</p>
                                   <p className="text-xl font-black text-[#00D084]">{item.score}</p>
                                </div>
                                <button 
                                   onClick={() => runSimulator(item.path)}
                                   className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-[#00D084] hover:text-black transition-all"
                                >
                                   <Zap size={18} />
                                </button>
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* SIMULATOR OUTPUT */}
                    <div className="space-y-8">
                       <div className="bg-[#121214] rounded-[40px] border border-white/5 p-10 h-full flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00D084]/10 to-transparent" />
                          <div className="space-y-6 relative z-10">
                             <div className="flex items-center gap-3 text-[#00D084]">
                                <Brain size={20} />
                                <h4 className="text-sm font-black uppercase tracking-widest">AI Q&A Simulator</h4>
                             </div>
                             
                             {simulatorOutput ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                   <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                         <span className="text-gray-500">Citation Prob</span>
                                         <span className="text-[#00D084]">{simulatorOutput.probability}%</span>
                                      </div>
                                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                         <div className="h-full bg-[#00D084] transition-all duration-1000" style={{ width: `${simulatorOutput.probability}%` }} />
                                      </div>
                                   </div>
                                   
                                   <div className="space-y-3">
                                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                         <Quote size={12} />
                                         <span>Retrieved Snippet</span>
                                      </div>
                                      <p className="text-xs text-gray-400 font-medium italic leading-relaxed bg-[#0A0A0B] p-4 rounded-xl border border-white/5">
                                         {simulatorOutput.expectedSnippet}
                                      </p>
                                   </div>
                                </div>
                             ) : (
                                <div className="py-20 text-center space-y-4 opacity-30">
                                   <Zap size={48} className="mx-auto" />
                                   <p className="text-[10px] font-black uppercase tracking-widest">Select a node to simulate retrieval</p>
                                </div>
                             )}
                          </div>

                          <div className="pt-8 mt-auto border-t border-white/5 relative z-10">
                             <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                System Status: Sovereign Matrix Protocol 01 active. Monitoring GPT-5 and Claude 3.5 opus citation weights.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           )}

           {activeTab !== 'overview' && activeTab !== 'seo' && (
             <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-600 border border-white/5">
                   <Layout size={40} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Component Manifesting</h3>
                   <p className="text-sm text-gray-500 font-medium italic">"{activeTab}" module is currently undergoing structural verification.</p>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default StaffConsole;
