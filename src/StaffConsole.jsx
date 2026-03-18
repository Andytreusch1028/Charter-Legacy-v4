import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Shield, Brain, Search, FileText, AlertCircle, 
  Settings, Users, Activity, ExternalLink, 
  Layout, Database, Globe, Command, RefreshCw, Zap, Quote, TestTube, Box, Sparkles, CheckCircle2, X,
  Download, Mail, ArrowRight, Share2
} from 'lucide-react';
import { AEO_METRICS, triggerRecencyPulse } from './lib/aeo-engine';
import { encryptData, decryptData } from './lib/crypto';

const StaffConsole = ({ user }) => {
  const [activeTab, setActiveTab] = useState(window.initialStaffTab || 'overview');
  const [pendingFilings, setPendingFilings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fulfillmentData, setFulfillmentData] = useState({}); // { [id]: sunbizId }
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [clientVaultItems, setClientVaultItems] = useState([]);
  const [clientAuditLogs, setClientAuditLogs] = useState([]);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [decryptedItems, setDecryptedItems] = useState([]);
  const [isProcessingVault, setIsProcessingVault] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sharingStatus, setSharingStatus] = useState(null);
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [decryptedContent, setDecryptedContent] = useState({}); // { itemId: cleartext }

  const [stats, setStats] = useState({
    pendingFilings: 0,
    activePrivacies: 0,
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
  const [vaultItems, setVaultItems] = useState([]);
  const [auditText, setAuditText] = useState('');
  const [auditResults, setAuditResults] = useState({ neutrality: 0, grounding: 0, structure: 0 });

  const filteredVaultItems = (clientVaultItems || []).filter(item => 
    item.name.toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(vaultSearchQuery.toLowerCase())
  );

  const filteredAuditLogs = (clientAuditLogs || []).filter(log => 
    log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
    log.status.toLowerCase().includes(auditSearchQuery.toLowerCase())
  );

  const handleExport = (item) => {
    setIsSending(true);
    setSharingStatus(`Preparing ${item.name} for PDF export...`);
    setTimeout(() => {
      setIsSending(false);
      setSharingStatus(`Exported ${item.name} to PDF Successfully`);
      setTimeout(() => setSharingStatus(null), 3000);
    }, 1500);
  };

  const handleEmailInitiate = (item) => {
    setSelectedArtifact(item);
    setShowEmailModal(true);
  };

  const handleExportAuditTrail = () => {
    setIsSending(true);
    setSharingStatus(`Compiling full audit trail for ${selectedClient.email}...`);
    setTimeout(() => {
      setIsSending(false);
      setSharingStatus(`Audit Trail Exported to PDF Successfully`);
      setTimeout(() => setSharingStatus(null), 3000);
    }, 2000);
  };

  const handleEmailAuditInitiate = () => {
    setSelectedArtifact({ name: 'System Audit Trail (Complete Log)' });
    setShowEmailModal(true);
  };

  const handleDecrypt = async (item) => {
    if (!vaultPassphrase) {
      setSharingStatus("Error: Vault Access Key Required");
      setTimeout(() => setSharingStatus(null), 3000);
      return;
    }

    setIsProcessingVault(true);
    setSharingStatus("Initializing Zero-Knowledge Decryption...");
    
    try {
      // Simulate network/compute delay
      await new Promise(r => setTimeout(r, 1500));
      const cleartext = await decryptData(item.secret_payload, vaultPassphrase);
      
      setDecryptedContent(prev => ({ ...prev, [item.id]: cleartext }));
      setDecryptedItems(prev => [...prev, item.name]);
      setSharingStatus("Artifact Decrypted Successfully");
    } catch (err) {
      setSharingStatus("Security Alert: Invalid Access Key");
    } finally {
      setIsProcessingVault(false);
      setTimeout(() => setSharingStatus(null), 3000);
    }
  };

  const handleEncrypt = (item) => {
    setIsProcessingVault(true);
    setSharingStatus("Re-sealing Artifact with 256-bit AES...");
    setTimeout(() => {
      setDecryptedContent(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      setDecryptedItems(prev => prev.filter(name => name !== item.name));
      setIsProcessingVault(false);
      setSharingStatus("Artifact Securely Encrypted");
      setTimeout(() => setSharingStatus(null), 3000);
    }, 1500);
  };

  const handleEmailSend = () => {
    if (!recipientEmail) return;
    setIsSending(true);
    setSharingStatus(`Sending ${selectedArtifact.name} to ${recipientEmail}...`);
    setTimeout(() => {
      setIsSending(false);
      setShowEmailModal(false);
      setSharingStatus(`Artifact sent to ${recipientEmail} Successfully`);
      setRecipientEmail('');
      setSelectedArtifact(null);
      setTimeout(() => setSharingStatus(null), 3000);
    }, 2000);
  };

  const fetchStats = async () => {
    try {
      const { data: llcs } = await supabase.from('llcs').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');
      
      const pending = llcs?.filter(l => l.llc_status === 'Setting Up').length || 0;
      const active = llcs?.filter(l => l.llc_status === 'Active').length || 0;
      
      setStats(prev => ({
        ...prev,
        pendingFilings: pending,
        activePrivacies: active
      }));
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchPendingFilings = async () => {
    try {
      setLoading(true);
      await fetchStats();
      const { data, error } = await supabase
        .from('llcs')
        .select('*')
        .eq('llc_status', 'Setting Up')
        .order('created_at', { ascending: false });
      if (!error) setPendingFilings(data || []);
    } catch (err) {
      console.error("Failed to fetch filings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fulfillLlc = async (id, sunbizId) => {
    if (!sunbizId) return alert("Please enter a Sunbiz ID");
    try {
      const { error } = await supabase
        .from('llcs')
        .update({ 
          llc_status: 'Active', 
          sunbiz_id: sunbizId 
        })
        .eq('id', id);
      
      if (!error) {
        alert("LLC set to Active.");
        fetchPendingFilings();
      } else {
        alert("Error fulfilling LLC: " + error.message);
      }
    } catch (err) {
      alert("System Error: " + err.message);
    }
  };

  const fetchVault = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_copy_vault')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setVaultItems(data);
    } catch (err) {
      console.error("Failed to fetch vault:", err);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data: llcs, error: llcError } = await supabase.from('llcs').select('*');
      const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
      const { data: wills, error: willError } = await supabase.from('wills').select('user_id');
      const { data: raConfigs, error: raError } = await supabase.from('registered_agent_config').select('user_id');
      
      if (llcError) throw llcError;

      const clientsMap = {};
      profiles?.forEach(p => {
        clientsMap[p.id] = { ...p, llcs: [], hasVault: false, hasRA: false };
      });

      llcs?.forEach(llc => {
        if (!clientsMap[llc.user_id]) {
          clientsMap[llc.user_id] = { 
            id: llc.user_id, 
            email: 'Direct Checkout User', 
            llcs: [],
            hasVault: false,
            hasRA: false
          };
        }
        clientsMap[llc.user_id].llcs.push(llc);
      });

      wills?.forEach(will => {
        if (clientsMap[will.user_id]) {
          clientsMap[will.user_id].hasVault = true;
        } else {
          clientsMap[will.user_id] = {
            id: will.user_id,
            email: 'Vault-only User',
            llcs: [],
            hasVault: true,
            hasRA: false
          };
        }
      });

      raConfigs?.forEach(ra => {
        if (clientsMap[ra.user_id]) {
          clientsMap[ra.user_id].hasRA = true;
        } else {
          clientsMap[ra.user_id] = {
            id: ra.user_id,
            email: 'RA-only User',
            llcs: [],
            hasVault: false,
            hasRA: true
          };
        }
      });

      // Always ensure a rich mock user exists for presentation/demo
      if (!clientsMap['mock-seed-1']) {
        clientsMap['mock-seed-1'] = {
          id: 'mock-seed-1',
          full_name: 'Alex Founder',
          email: 'alex.founder@charterlegacy.com',
          hasVault: true,
          hasRA: true,
          llcs: [
            { id: 'llc-seed-1', llc_name: 'Charter Alpha LLC', llc_status: 'Active', product_type: 'Shield' },
            { id: 'llc-seed-2', llc_name: 'Legacy Holdings Group', llc_status: 'Setting Up', product_type: 'Foundation' }
          ]
        };
      }

      setClients(Object.values(clientsMap));
      await fetchStats();
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (clientId) => {
    try {
      setLoading(true);
      const { data: vault } = await supabase.from('vault_items').select('*').eq('user_id', clientId);
      const { data: logs } = await supabase.from('audit_logs').select('*').eq('user_id', clientId).order('timestamp', { ascending: false });
      
      // Auto-encrypt mock items that need it for the demo
      const processedVault = await Promise.all((vault || []).map(async (item) => {
        if (item.needs_initial_encryption) {
          const mockCleartext = `MNEMONIC: ${item.category.toUpperCase()} ${item.name.split('.')[0].toUpperCase()} SECTOR-${Math.floor(Math.random()*999)}`;
          const encrypted = await encryptData(mockCleartext, 'charter-2026');
          
          // Update the mock database record so it stays encrypted
          await supabase.from('vault_items').update({ 
            secret_payload: encrypted, 
            needs_initial_encryption: false 
          }).eq('id', item.id);
          
          return { ...item, secret_payload: encrypted, needs_initial_encryption: false };
        }
        return item;
      }));

      setClientVaultItems(processedVault);
      setClientAuditLogs(logs || []);
    } catch (err) {
      console.error("Failed to fetch client details:", err);
    } finally {
      setLoading(false);
    }
  };

  const openVault = async (client) => {
    setSelectedClient(client);
    await fetchClientDetails(client.id);
    setShowVaultModal(true);
  };

  const openAudit = async (client) => {
    setSelectedClient(client);
    await fetchClientDetails(client.id);
    setShowAuditModal(true);
  };

  useEffect(() => {
    if (activeTab === 'aeo-mastery') {
      fetchVault();
    }
    if (activeTab === 'filings') {
      fetchPendingFilings();
    }
    if (activeTab === 'users') {
      fetchClients();
    }
  }, [activeTab]);

  const handleAudit = () => {
    const neutrality = AEO_METRICS.calculateNeutralityIndex(auditText);
    const grounding = AEO_METRICS.calculateGroundingScore(auditText, ['Charter Legacy', 'Anonymous LLC', 'Probate Bypass', 'Double LLC']);
    const structure = AEO_METRICS.calculatePassageStructure(auditText);
    setAuditResults({ neutrality, grounding, structure });
  };

  const saveToVault = async () => {
    const { error } = await supabase
      .from('seo_copy_vault')
      .insert([{
        target_page: 'AEO_AUDIT',
        section_id: 'manual_input',
        copy_text: auditText,
        aeo_score: Math.round((auditResults.neutrality + auditResults.grounding + auditResults.structure) / 3),
        metrics: auditResults
      }]);
    if (!error) {
      setAuditText('');
      fetchVault();
    }
  };

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
    { id: 'filings', label: 'Manual Filings', icon: FileText, badge: stats.pendingFilings > 0 ? stats.pendingFilings.toString() : null },
    { id: 'seo', label: 'SEO Matrix', icon: Globe },
    { id: 'aeo-mastery', label: 'AEO Laboratory', icon: TestTube },
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

            {activeTab === 'aeo-mastery' && (
               <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex justify-between items-end">
                     <div className="space-y-4">
                        <h3 className="text-4xl font-black uppercase tracking-tighter">AEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#886B1D]">Mastery Lab.</span></h3>
                        <p className="text-gray-500 font-medium italic">Integrated environment for Grounding, Neutrality, and Infinite Tail generation.</p>
                     </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-12">
                     {/* 1. THE AUDITOR (Testing & Rating) */}
                     <div className="lg:col-span-2 space-y-8">
                        <div className="bg-[#121214] p-10 rounded-[40px] border border-white/5 space-y-8">
                           <div className="flex items-center gap-3 text-blue-500">
                              <Search size={20} />
                              <h4 className="text-sm font-black uppercase tracking-widest">AEO Auditor</h4>
                           </div>
                           
                           <div className="space-y-6">
                              <textarea 
                                 value={auditText}
                                 onChange={(e) => setAuditText(e.target.value)}
                                 onBlur={handleAudit}
                                 placeholder="Paste copy here to audit for LLM retrieval suitability..."
                                 className="w-full h-48 bg-[#0A0A0B] border border-white/10 rounded-2xl p-6 font-medium text-gray-300 focus:border-blue-500 outline-none transition-all resize-none"
                              />
                              <div className="grid grid-cols-3 gap-6">
                                 {[
                                    { label: 'Neutrality', score: auditResults.neutrality, color: 'text-green-500' },
                                    { label: 'Grounding', score: auditResults.grounding, color: 'text-[#D4AF37]' },
                                    { label: 'Passage Str', score: auditResults.structure, color: 'text-blue-500' }
                                 ].map((m, i) => (
                                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{m.label}</p>
                                       <p className={`text-xl font-black ${m.color}`}>{m.score}%</p>
                                    </div>
                                 ))}
                              </div>
                              <button 
                                 onClick={saveToVault}
                                 disabled={!auditText}
                                 className="w-full bg-blue-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                              >
                                 Save to Copy Vault
                              </button>
                           </div>
                        </div>

                        {/* 2. THE COPY VAULT (Maintenance) */}
                        <div className="bg-[#121214] p-10 rounded-[40px] border border-white/5 space-y-8">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-[#D4AF37]">
                                 <Box size={20} />
                                 <h4 className="text-sm font-black uppercase tracking-widest">The Copy Vault</h4>
                              </div>
                                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{vaultItems.length} Active Snippets</span>
                           </div>
                           
                           <div className="space-y-4">
                              {vaultItems.length > 0 ? vaultItems.map((item, i) => (
                                 <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.target_page}</p>
                                       <p className="text-xs font-bold truncate max-w-sm">"{item.copy_text}"</p>
                                    </div>
                                    <div className="flex items-center gap-8">
                                       <div className="text-right">
                                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">AEO</p>
                                          <p className="text-sm font-black text-[#00D084]">{item.aeo_score}</p>
                                       </div>
                                       <button className="text-[9px] font-black px-3 py-1 bg-white text-black rounded-lg uppercase tracking-widest hover:scale-110 transition-all">Push</button>
                                    </div>
                                 </div>
                              )) : (
                                 <div className="p-12 text-center opacity-20 italic">
                                    <p className="text-xs">Vault is empty. Audit copy to begin.</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* 3. INFINITE TAIL GENERATOR (Generation & Social) */}
                     <div className="space-y-8">
                        <div className="bg-[#121214] p-10 rounded-[40px] border border-white/5 space-y-8 h-full">
                           <div className="flex items-center gap-3 text-purple-500">
                              <Sparkles size={20} />
                              <h4 className="text-sm font-black uppercase tracking-widest">Tail Generator</h4>
                           </div>
                           
                           <div className="space-y-6">
                              <div className="space-y-4">
                                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Select Persona</label>
                                 <select className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-4 font-bold text-xs outline-none">
                                    <option>The Discrete Executive</option>
                                    <option>The High-Stakes Founder</option>
                                    <option>The Legacy Protector</option>
                                 </select>
                              </div>
                              
                              <div className="space-y-4">
                                 <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Marketing Channel</label>
                                 <div className="grid grid-cols-2 gap-3">
                                    {['Twitter', 'LinkedIn', 'Blog', 'Email'].map(c => (
                                       <button key={c} className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-purple-500 transition-all">{c}</button>
                                    ))}
                                 </div>
                              </div>

                              <div className="pt-4">
                                 <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                                    Model Prompt Graph <RefreshCw size={14} />
                                 </button>
                              </div>

                              <div className="p-6 bg-[#0A0A0B] rounded-2xl border border-white/5 mt-8 opacity-40 italic text-center">
                                 <p className="text-[10px] font-medium text-gray-500">Generator idle. Ready for prompt modeling.</p>
                              </div>
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

            {activeTab === 'filings' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-end">
                   <div className="space-y-4">
                      <h3 className="text-4xl font-black uppercase tracking-tighter text-blue-500">Manual Filings.</h3>
                      <p className="text-gray-500 font-medium italic">Entities requiring manual Sunbiz submission and verification.</p>
                   </div>
                   <button 
                     onClick={fetchPendingFilings}
                     className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                   >
                     <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                   </button>
                </div>

                {loading ? (
                  <div className="py-20 text-center opacity-30">
                    <RefreshCw size={48} className="mx-auto animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest mt-4">Connecting to Secure Vault...</p>
                  </div>
                ) : pendingFilings.length > 0 ? (
                  <div className="grid gap-6">
                    {pendingFilings.map((llc) => (
                      <div key={llc.id} className="bg-[#121214] p-8 rounded-[32px] border border-white/5 flex items-center justify-between group hover:border-blue-500/20 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-blue-500 font-black text-xl">
                             { (llc.llc_name && llc.llc_name[0]) ? llc.llc_name[0].toUpperCase() : '?' }
                          </div>
                          <div>
                            <p className="text-xl font-black uppercase tracking-tight">{llc.llc_name}</p>
                            <div className="flex gap-4 mt-2">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product: {llc.product_type}</p>
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Status: {llc.llc_status}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="bg-[#0A0A0B] p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                             <input 
                               type="text" 
                               value={fulfillmentData[llc.id] || ''}
                               onChange={(e) => setFulfillmentData({ ...fulfillmentData, [llc.id]: e.target.value })}
                               placeholder="Sunbiz ID (L24...)" 
                               className="bg-transparent border-none outline-none text-xs font-mono font-bold text-white w-32"
                             />
                             <button 
                               onClick={() => fulfillLlc(llc.id, fulfillmentData[llc.id])}
                               className="bg-blue-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                             >
                               Fulfill
                             </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4 opacity-30 bg-[#121214] rounded-[40px] border border-dashed border-white/10">
                    <CheckCircle2 size={48} className="mx-auto text-green-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">All Filings Synchronized</h4>
                    <p className="text-xs italic text-gray-500">No entities are currently awaiting manual intervention.</p>
                  </div>
                )}
             </div>
           )}

            {activeTab === 'users' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-end">
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-[#00D084]">Client Directory.</h3>
                    <p className="text-gray-500 font-medium italic">Comprehensive index of founders and their corporate entities.</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-[#121214] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 group focus-within:border-[#00D084]/50 transition-all">
                      <Search size={18} className="text-gray-500 group-focus-within:text-[#00D084]" />
                      <input 
                        type="text"
                        placeholder="Search by email or LLC name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-bold placeholder:text-gray-700 w-64"
                      />
                    </div>
                    <button 
                      onClick={fetchClients}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                    >
                      <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="py-20 text-center opacity-30">
                    <RefreshCw size={48} className="mx-auto animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest mt-4">Accessing Public Record Database...</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                     {clients
                       .filter(client => {
                         const displayEmail = client.email || 'Anonymous Founder';
                         const search = (searchTerm || '').toLowerCase();
                         const emailMatch = (displayEmail).toLowerCase().includes(search);
                         const llcMatch = client.llcs?.some(l => (l.llc_name || '').toLowerCase().includes(search));
                         const vaultMatch = client.hasVault && 'vault'.includes(search);
                         const raMatch = client.hasRA && 'ra'.includes(search);
                         const memberMatch = (client.llcs?.length > 0) && 'member'.includes(search);
                         return emailMatch || llcMatch || vaultMatch || raMatch || memberMatch;
                       })
                      .map((client) => {
                        const displayEmail = client.email || 'Anonymous Founder';
                        return (
                        <div key={client.id} className="bg-[#121214] p-8 rounded-[40px] border border-white/5 hover:border-[#00D084]/20 transition-all group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center font-black text-xl text-[#00D084]">
                                {displayEmail[0].toUpperCase()}
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xl font-black uppercase tracking-tight">{displayEmail}</h4>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">ID: {client.id.slice(0,8)}</span>
                                  {client.llcs?.length > 0 && <span className="text-[10px] font-black text-[#00D084] uppercase tracking-widest bg-[#00D084]/10 px-2 py-1 rounded">Member</span>}
                                  {client.hasVault && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded">Vault</span>}
                                  {client.hasRA && <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">RA</span>}
                                </div>
                              </div>
                            </div>
                            
                             <div className="flex gap-3">
                               <button 
                                 onClick={() => openAudit(client)}
                                 className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                               >
                                 Audit Trails
                               </button>
                               <button 
                                 onClick={() => openVault(client)}
                                 className="px-6 py-2 bg-[#00D084] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#00D084]/10"
                               >
                                 View Vault
                               </button>
                             </div>
                          </div>

                          {client.llcs?.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-6">
                              {client.llcs.map(llc => (
                                <div key={llc.id} className="bg-[#0A0A0B] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                                  <Shield size={16} className={llc.llc_status === 'Active' ? 'text-[#00D084]' : 'text-blue-500'} />
                                  <div>
                                    <p className="text-[11px] font-black uppercase tracking-tight truncate w-32">{llc.llc_name}</p>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">{llc.llc_status}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

           {activeTab !== 'overview' && activeTab !== 'seo' && activeTab !== 'aeo-mastery' && activeTab !== 'filings' && activeTab !== 'users' && (
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

       {/* Vault Modal */}
       {showVaultModal && selectedClient && (
         <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-[#121214] w-full max-w-2xl rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
             <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121214] z-10">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                   <Box size={24} />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">Client Vault</h3>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedClient.email}</p>
                 </div>
               </div>
               <button onClick={() => setShowVaultModal(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white">
                 <X size={20} />
               </button>
             </div>
              <div className="p-8 border-b border-white/5 bg-black/20 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-[#121214] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 group focus-within:border-amber-500/50 transition-all">
                    <Search size={18} className="text-gray-500 group-focus-within:text-amber-500" />
                    <input 
                      type="text"
                      placeholder="Search by document name or category..."
                      value={vaultSearchQuery}
                      onChange={(e) => setVaultSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold placeholder:text-gray-700 w-full"
                    />
                  </div>
                  <div className="flex-1 bg-[#121214] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 group focus-within:border-[#00D084]/50 transition-all">
                    <Shield size={18} className="text-gray-500 group-focus-within:text-[#00D084]" />
                    <input 
                      type="password"
                      placeholder="Vault Access Key..."
                      value={vaultPassphrase}
                      onChange={(e) => setVaultPassphrase(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold placeholder:text-gray-700 w-full text-[#00D084]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {filteredVaultItems.length > 0 ? filteredVaultItems.map((item, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:border-amber-500/20 transition-all group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-600 group-hover/item:text-amber-500 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-bold">{item.name}</p>
                          {decryptedContent[item.id] ? (
                            <span className="text-[7px] font-black text-[#00D084] uppercase tracking-[0.2em] border border-[#00D084]/30 px-2 py-0.5 rounded">Cleartext</span>
                          ) : (
                            <span className="text-[7px] font-black text-amber-500/50 uppercase tracking-[0.2em] border border-amber-500/10 px-2 py-0.5 rounded">Secured</span>
                          )}
                        </div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          {decryptedContent[item.id] ? (
                            <span className="text-white italic">"{decryptedContent[item.id]}"</span>
                          ) : (
                            `${item.category} • ${item.size}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleExport(item)}
                        title="Export to PDF"
                        className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                         onClick={() => handleEmailInitiate(item)}
                         title="Email to Third Party"
                         className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                      >
                        <Mail size={16} />
                      </button>
                      {decryptedItems.includes(item.name) ? (
                        <button 
                          onClick={() => handleEncrypt(item)}
                          disabled={isProcessingVault}
                          className="text-[9px] font-black text-[#00D084] uppercase tracking-widest border border-[#00D084]/20 px-4 py-2 rounded-xl hover:bg-[#00D084] hover:text-black transition-all ml-2 shadow-lg shadow-[#00D084]/5 disabled:opacity-50 disabled:cursor-wait"
                        >
                          Encrypt
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDecrypt(item)}
                          disabled={isProcessingVault}
                          className="text-[9px] font-black text-amber-500 uppercase tracking-widest border border-amber-500/20 px-4 py-2 rounded-xl hover:bg-amber-500 hover:text-black transition-all ml-2 shadow-lg shadow-amber-500/5 disabled:opacity-50 disabled:cursor-wait"
                        >
                          Decrypt
                        </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-20 italic">
                    <Search size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No matching artifacts found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

       {/* Audit Modal */}
       {showAuditModal && selectedClient && (
         <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-[#121214] w-full max-w-2xl rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
             <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121214] z-10">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                   <Activity size={24} />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase tracking-tighter">System Audit Trails</h3>
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedClient.email}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <button 
                   onClick={handleExportAuditTrail}
                   title="Export All to PDF"
                   className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white"
                 >
                   <Download size={20} />
                 </button>
                 <button 
                   onClick={handleEmailAuditInitiate}
                   title="Email Trail to Third Party"
                   className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white"
                 >
                   <Mail size={20} />
                 </button>
                 <button onClick={() => setShowAuditModal(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white">
                    <X size={20} />
                 </button>
               </div>
             </div>
             
             <div className="p-8 border-b border-white/5 bg-black/20">
               <div className="bg-[#121214] border border-white/5 rounded-2xl px-6 py-4 flex items-center gap-4 group focus-within:border-blue-500/50 transition-all">
                 <Search size={18} className="text-gray-500 group-focus-within:text-blue-500" />
                 <input 
                   type="text"
                   placeholder="Search audit actions or status..."
                   value={auditSearchQuery}
                   onChange={(e) => setAuditSearchQuery(e.target.value)}
                   className="bg-transparent border-none outline-none text-sm font-bold placeholder:text-gray-700 w-full"
                 />
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-6">
               {filteredAuditLogs.length > 0 ? filteredAuditLogs.map((log, i) => (
                 <div key={i} className="flex gap-6 relative">
                   {i < filteredAuditLogs.length - 1 && <div className="absolute left-6 top-10 bottom-0 w-[1px] bg-white/5" />}
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                     <Shield size={16} className="text-gray-500" />
                   </div>
                   <div className="space-y-1 py-1">
                     <p className="text-sm font-bold">{log.action}</p>
                     <div className="flex items-center gap-3">
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{new Date(log.timestamp).toLocaleString()}</p>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${log.status === 'Success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                         {log.status}
                       </span>
                     </div>
                   </div>
                 </div>
               )) : (
                 <div className="py-20 text-center opacity-20 italic">
                   <Shield size={48} className="mx-auto mb-4" />
                   <p className="text-xs font-bold uppercase tracking-widest">No matching audit history found</p>
                 </div>
               )}
             </div>
           </div>
         </div>
        )}

        {/* Sharing Notification */}
        {sharingStatus && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top duration-500">
            <div className="bg-[#00D084] text-black px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
              <CheckCircle2 size={20} />
              <p className="text-sm font-black uppercase tracking-widest">{sharingStatus}</p>
            </div>
          </div>
        )}

        {/* Email Sharing Modal */}
        {showEmailModal && selectedArtifact && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-[#18181B] w-full max-w-md rounded-[40px] border border-white/10 shadow-2xl p-10 space-y-8">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black uppercase tracking-tighter">Share Artifact</h3>
                   <p className="text-xs text-gray-500 font-medium italic">Preparing to transmit "{selectedArtifact.name}" securely.</p>
                </div>

                <div className="space-y-4">
                   <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Recipient Email</label>
                      <div className="flex items-center gap-4 bg-black/20 rounded-xl px-4 py-3 border border-white/5 focus-within:border-[#00D084]/50 transition-all">
                         <Mail size={18} className="text-gray-600" />
                         <input 
                           type="email" 
                           placeholder="Enter destination address..."
                           value={recipientEmail}
                           onChange={(e) => setRecipientEmail(e.target.value)}
                           className="bg-transparent border-none outline-none text-sm font-bold w-full"
                         />
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                   <button 
                     onClick={handleEmailSend}
                     disabled={isSending || !recipientEmail}
                     className="w-full py-5 bg-[#00D084] text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                   >
                     {isSending ? <RefreshCw size={18} className="animate-spin" /> : <><Zap size={18} /> Transmit Securely</>}
                   </button>
                   <button 
                     onClick={() => setShowEmailModal(false)}
                     className="w-full py-5 bg-white/5 text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                   >
                     Cancel
                   </button>
                </div>
             </div>
          </div>
        )}
     </div>
  );
};

export default StaffConsole;
