import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Mail, 
  Eye, 
  Download, 
  Lock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  HeartPulse, 
  Sparkles, 
  Fingerprint,
  ChevronRight,
  ArrowRight,
  Bell,
  Trash2,
  MoreVertical,
  Activity,
  History,
  Target
} from 'lucide-react';

/**
 * PRIVACY SHIELD DASHBOARD v1.0
 * The "Virtual Office" and Digital Mailroom for the self-reliant founder.
 * * DESIGN TOKENS:
 * - Palette: Obsidian (#1D1D1F), Legacy Blue (#007AFF)
 * - Shadow: Soft institutional depth
 * - Interaction: active:scale-[0.98]
 */

// --- Shared Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-50 text-green-700 border-green-100",
    priority: "bg-red-50 text-red-700 border-red-100",
    protected: "bg-blue-50 text-blue-700 border-blue-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
      {status}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('mailroom'); // 'mailroom', 'address', 'security'
  
  const shieldData = {
    publicAddress: "123 INNOVATION WAY, STE 400, DELAND, FL 32720",
    status: "Active",
    blockedSolicitors: 142,
    syncTime: "2h ago"
  };

  const mailItems = [
    { 
      id: 1, 
      sender: "FL Dept. of Revenue", 
      subject: "Informational Tax Notice", 
      date: "JAN 17, 2026", 
      status: "active", 
      isPriority: false,
      type: "Official Government"
    },
    { 
      id: 2, 
      sender: "Service of Process", 
      subject: "Statutory Summons (Simulated)", 
      date: "JAN 15, 2026", 
      status: "priority", 
      isPriority: true,
      type: "Legal Action"
    },
    { 
      id: 3, 
      sender: "Division of Corporations", 
      subject: "Annual Report Window Notification", 
      date: "JAN 10, 2026", 
      status: "active", 
      isPriority: false,
      type: "Statutory Maintenance"
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased selection:bg-black selection:text-white flex overflow-hidden">
      
      {/* Institutional Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 p-8 hidden md:flex flex-col space-y-12 h-screen shadow-sm">
         <div className="flex items-center gap-3 font-black text-2xl tracking-tighter cursor-default">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">C</div>
            <span className="uppercase tracking-tighter text-[#1D1D1F]">Charter</span>
         </div>
         
         <nav className="flex-1 space-y-3">
            {[
              { id: 'mailroom', label: 'Mailroom', icon: Mail },
              { id: 'address', label: 'Physical Anchor', icon: MapPin },
              { id: 'security', label: 'Shield Logs', icon: Lock }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`w-full p-5 rounded-3xl font-bold text-sm flex items-center gap-4 transition-all duration-300 ${activeTab === item.id ? 'bg-black text-white shadow-2xl scale-[1.02]' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
         </nav>

         <div className="p-6 bg-blue-50 rounded-[32px] border border-blue-100 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
               <ShieldCheck size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">Shield Node</span>
            </div>
            <p className="text-[10px] text-blue-800 leading-relaxed italic font-medium">"Your home address is currently suppressed from all public Sunbiz records."</p>
         </div>

         <div className="pt-8 border-t border-gray-50">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] text-center">DeLand Hub Node</p>
         </div>
      </aside>

      {/* Primary Workspace */}
      <main className="flex-1 p-8 md:p-16 space-y-12 overflow-y-auto h-screen bg-[#FBFBFD]">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-in fade-in duration-700">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status="protected" />
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                <Activity size={12} className="text-green-500" />
                <span>Last Sync: {shieldData.syncTime}</span>
              </div>
            </div>
            <h1 className="text-6xl font-black tracking-tight leading-none uppercase text-[#1D1D1F]">Privacy Shield.</h1>
            <p className="text-xl text-gray-400 font-medium italic">Statutory Presence • Mail Extraction • Anonymity Defended</p>
          </div>
          
          <div className="flex bg-white p-2 rounded-[28px] shadow-sm border border-gray-100">
             <div className="px-6 py-4 text-center border-r border-gray-100">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Blocked Solicitation</p>
                <p className="text-2xl font-black text-[#1D1D1F] tabular-nums">{shieldData.blockedSolicitors}</p>
             </div>
             <div className="px-6 py-4 text-center">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Current Scan Rate</p>
                <p className="text-2xl font-black text-blue-500 tabular-nums">100%</p>
             </div>
          </div>
        </header>

        {/* Dynamic Context Area */}
        {activeTab === 'mailroom' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* The Physical Anchor Card */}
            <section className="bg-black text-white rounded-[48px] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] relative overflow-hidden group">
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3 text-blue-400">
                     <MapPin size={24} />
                     <h3 className="font-black uppercase tracking-widest text-xs tracking-tighter">Public Hub Address (Anchor)</h3>
                  </div>
                  <div className="space-y-2">
                     <p className="text-4xl font-black tracking-tight uppercase leading-tight max-w-2xl">
                        {shieldData.publicAddress}
                     </p>
                     <p className="text-gray-500 font-medium italic text-sm">
                        This is the address listed on your Articles of Organization and Registered Agent record.
                     </p>
                  </div>
                  <button className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all active:scale-[0.98]">
                     Update Physical Node
                  </button>
               </div>
               
               {/* Decorative Hardware Aura */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-blue-500/20" />
            </section>

            {/* Digital Mailroom Grid */}
            <section className="space-y-6">
               <div className="flex justify-between items-center px-4">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-gray-400">Digital Mailroom</h2>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Auto-OCR Enabled</span>
                     <Sparkles size={14} className="text-blue-500" />
                  </div>
               </div>
               
               <div className="space-y-4">
                  {mailItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-8 rounded-[40px] border transition-all cursor-pointer group ${item.isPriority ? 'bg-red-50 border-red-100 hover:border-red-500' : 'bg-white border-gray-100 hover:border-black'}`}
                    >
                       <div className="flex items-center gap-8">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${item.isPriority ? 'bg-red-500 text-white shadow-xl animate-pulse' : 'bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white'}`}>
                            {item.isPriority ? <AlertTriangle size={28} /> : <Mail size={28} />}
                          </div>
                          <div className="space-y-1">
                             <div className="flex items-center gap-3">
                                <h4 className="font-black text-lg uppercase tracking-tight leading-none">{item.sender}</h4>
                                <StatusBadge status={item.status} />
                             </div>
                             <p className="text-gray-400 font-medium italic">{item.subject}</p>
                             <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest pt-1">{item.type} Artifact</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Scanned On</p>
                             <p className="font-bold text-sm text-[#1D1D1F] font-mono">{item.date}</p>
                          </div>
                          <div className="flex gap-2">
                             <button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-black transition-all active:scale-95">
                                <Eye size={20} className="text-gray-400 group-hover:text-black" />
                             </button>
                             <button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-black transition-all active:scale-95 text-blue-500">
                                <Download size={20} />
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               
               <div className="pt-8 text-center">
                  <button className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] hover:text-black transition-colors flex items-center gap-3 mx-auto">
                     <History size={14} /> View Archived Mail
                  </button>
               </div>
            </section>
          </div>
        )}

        {/* Security / Address Placeholder Views */}
        {activeTab !== 'mailroom' && (
          <section className="bg-white rounded-[60px] border border-gray-100 p-24 text-center space-y-8 animate-in zoom-in-95">
             <Fingerprint size={64} className="mx-auto text-gray-100" />
             <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-gray-300">Section Under Encryption</h3>
                <p className="text-gray-400 font-medium italic">Switching to {activeTab.toUpperCase()} node...</p>
             </div>
             <button onClick={() => setActiveTab('mailroom')} className="bg-gray-100 text-gray-400 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                Return to Digital Mailroom
             </button>
          </section>
        )}

      </main>
      
      {/* Floating Alert Sentinel (Bottom Right) */}
      <div className="fixed bottom-12 right-12 flex flex-col items-end gap-4 pointer-events-none">
         <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-gray-100 flex items-center gap-6 animate-in slide-in-from-right-8 pointer-events-auto group">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center animate-bounce">
               <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
               <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">High Priority Alert</p>
               <p className="text-sm font-bold uppercase">Priority Mail Detected</p>
            </div>
            <button className="p-3 bg-gray-50 rounded-xl hover:bg-black hover:text-white transition-all">
               <ChevronRight size={18} />
            </button>
         </div>
      </div>
    </div>
  );
}