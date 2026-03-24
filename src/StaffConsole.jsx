import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, Globe, TestTube, Users, Command, Settings, Search, RefreshCw 
} from 'lucide-react';

// Hooks
import { useAudit } from './hooks/useAudit';
import { useVault } from './hooks/useVault';
import { useStaffData } from './hooks/useStaffData';

// Sectors
import OverviewSector from './sectors/staff/OverviewSector';
import AeoLabSector from './sectors/staff/AeoLabSector';
import ClientDirectorySector from './sectors/staff/ClientDirectorySector';
import TerminalLogsSector from './sectors/staff/TerminalLogsSector';

// Modals (Will be sectorized in the next pass)
import SeoHelpModal from './components/SeoHelpModal';
import AeoMasteryHelpModal from './components/AeoMasteryHelpModal';
import TailGeneratorHelpModal from './components/TailGeneratorHelpModal';
import ChannelSettingsModal from './components/ChannelSettingsModal';
import TerminalHelpModal from './components/TerminalHelpModal';

/**
 * StaffConsole
 * The primary Mission Control for CharterLegacy staff.
 * Refactored to a Sector-based architecture for maximum modularity.
 */
const StaffConsole = ({ user }) => {
  const [activeTab, setActiveTab] = useState(window.initialStaffTab || 'overview');
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Custom Hooks (Decoupled Logic)
  const { logAction } = useAudit(selectedClient);
  const { vaultItems, fetchVault } = useVault();
  const { 
    loading, 
    clients, 
    stats, 
    fetchClients, 
    fetchStats 
  } = useStaffData();

  // Modal States
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showSeoHelp, setShowSeoHelp] = useState(false);
  const [showAeoMasteryHelp, setShowAeoMasteryHelp] = useState(false);
  const [showTailHelp, setShowTailHelp] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(false);
  const [showTerminalHelp, setShowTerminalHelp] = useState(false);

  // Initial Sync
  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchClients();
    if (activeTab === 'aeo-mastery') fetchVault();
  }, [activeTab, fetchStats, fetchClients, fetchVault]);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'filings', label: 'Manual Filings', icon: FileText, badge: stats.pendingFilings > 0 ? stats.pendingFilings.toString() : null },
    { id: 'seo', label: 'SEO Matrix', icon: Globe },
    { id: 'aeo-mastery', label: 'AEO Laboratory', icon: TestTube },
    { id: 'users', label: 'Client Directory', icon: Users },
    { id: 'logs', label: 'Terminal Logs', icon: Command },
    { id: 'settings', label: 'System Hub', icon: Settings }
  ];

  const handleOpenVault = (client) => {
    setSelectedClient(client);
    setShowVaultModal(true);
  };

  const handleOpenAudit = (client) => {
    setSelectedClient(client);
    setShowAuditModal(true);
  };

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
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Control Tower v4.5</span>
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

        <div className="p-12 max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewSector stats={stats} />}
            {activeTab === 'aeo-mastery' && (
                <AeoLabSector 
                    setShowAeoMasteryHelp={setShowAeoMasteryHelp}
                    setShowSeoHelp={setShowSeoHelp}
                    setShowTailHelp={setShowTailHelp}
                    setShowChannelSettings={setShowChannelSettings}
                />
            )}
            {activeTab === 'users' && (
                <ClientDirectorySector 
                    clients={clients}
                    loading={loading}
                    onOpenVault={handleOpenVault}
                    onOpenAudit={handleOpenAudit}
                />
            )}
            {activeTab === 'logs' && <TerminalLogsSector />}
        </div>

        {/* Modals */}
        {showAeoMasteryHelp && <AeoMasteryHelpModal onClose={() => setShowAeoMasteryHelp(false)} />}
        {showSeoHelp && <SeoHelpModal onClose={() => setShowSeoHelp(false)} />}
        {showTailHelp && <TailGeneratorHelpModal onClose={() => setShowTailHelp(false)} />}
        {showChannelSettings && <ChannelSettingsModal onClose={() => setShowChannelSettings(false)} />}
        {showTerminalHelp && <TerminalHelpModal onClose={() => setShowTerminalHelp(false)} />}
      </main>
    </div>
  );
};

// Mocking FileText for the menu until imported
const FileText = ({ size, strokeWidth }) => <Activity size={size} strokeWidth={strokeWidth} />;

export default StaffConsole;
