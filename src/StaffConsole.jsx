import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Shield, Brain, Search, FileText, AlertCircle, 
  Settings, Users, Activity, ExternalLink, 
  Layout, Database, Globe, Command
} from 'lucide-react';

const StaffConsole = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    pendingFilings: 12,
    activePrivacies: 450,
    systemHealth: '100%',
    emergencyRequests: 0
  });

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

           {activeTab !== 'overview' && (
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
