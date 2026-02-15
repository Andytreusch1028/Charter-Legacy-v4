import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  Shield, ArrowRight, Zap, CheckCircle2, Fingerprint, Building2, 
  Settings, ShieldCheck, Loader2, FileCode, MessageSquare, Clock, FileText, Activity 
} from 'lucide-react';

const RegisteredAgentConsole = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [autoDisposeMarketing, setAutoDisposeMarketing] = useState(true);
  const [priorityForwarding, setPriorityForwarding] = useState(true);
  const [autoRenew, setAutoRenew] = useState(false);
  const [smsInterrupt, setSmsInterrupt] = useState(false);
  const [brokerShield, setBrokerShield] = useState(true);

  // Fetch Configuration & Content on Load
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Load Config
        let { data: configData } = await supabase
          .from('registered_agent_config')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (configData) {
           setAutoDisposeMarketing(configData.auto_dispose_marketing);
           setPriorityForwarding(configData.priority_forwarding);
           setAutoRenew(configData.auto_renew);
           setSmsInterrupt(configData.sms_interrupt);
           setBrokerShield(configData.data_broker_shield);
        }

        // 2. Load Documents
        const { data: docData } = await supabase
          .from('registered_agent_documents')
          .select('*')
          .eq('user_id', user.id);
        
        if (docData && docData.length > 0) {
            setDocuments(docData);
        } else {
            // Fallback Mock Data
            setDocuments([
                { title: 'Notice of Annual Filing', date: 'Feb 12, 2026', type: 'State Requirement' },
                { title: 'Service of Process (Mock)', date: 'Feb 09, 2026', type: 'Legal Notice' },
                { title: 'Information Request', date: 'Feb 05, 2026', type: 'Bureaucracy' }
            ]);
        }

        // 3. Load Messages
        const { data: msgData } = await supabase
           .from('registered_agent_messages')
           .select('*')
           .eq('user_id', user.id);

        if (msgData && msgData.length > 0) {
            setMessages(msgData);
        } else {
             // Fallback Mock Data
             setMessages([
                 { sender: 'Sarah J.', role: 'Legal Liaison', content: 'We received a state notice regarding your annual report. No action needed yet.', time: '2h ago', unread: true },
                 { sender: 'Mike T.', role: 'Privacy Officer', content: 'Data Broker Shield has successfully removed your info from Whitepages.', time: '1d ago', unread: false }
             ]);
        }

      } catch (err) {
        console.error('Error loading RA data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save Configuration Debounced/Direct
  const saveConfig = async (key, value) => {
    // Optimistic Update
    if (key === 'auto_dispose_marketing') setAutoDisposeMarketing(value);
    if (key === 'priority_forwarding') setPriorityForwarding(value);
    if (key === 'auto_renew') setAutoRenew(value);
    if (key === 'sms_interrupt') setSmsInterrupt(value);
    if (key === 'data_broker_shield') setBrokerShield(value);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('registered_agent_config')
        .upsert({ 
          user_id: user.id,
          [key]: value,
          updated_at: new Date()
        }, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving config:', err);
      // Revert on error (optional implementation)
    }
  };

  // Mock: Initiate Broker Removal
  const initiateBrokerRemoval = async () => {
     if (!brokerShield) return;
     // Simulate API call
     const newMsg = {
        sender: 'Mike T.',
        role: 'Privacy Officer',
        content: 'Manual removal request initiated for 3 new databases. We will update you within 48 hours.',
        time: 'Just Now',
        unread: true
     };
     setMessages(prev => [newMsg, ...prev]);
     alert('Removal Protocol Initiated. Check your Agent Messages.');
  };

  // Dev: Simulate Service of Process
  const simulateServiceOfProcess = () => {
      const newDoc = { 
          title: 'URGENT: Service of Process', 
          date: 'Feb 14, 2026', 
          type: 'Legal Action', 
          status: priorityForwarding ? 'Forwarded' : 'Received' 
      };
      setDocuments(prev => [newDoc, ...prev]);

      if (smsInterrupt) {
          alert('SMS INTERRUPT: Service of Process Received. Immediate Action Required.');
      } else {
          console.log('Standard notification sent.');
      }
      
      setActiveTab('documents');
  };

  const tabs = [
    { id: 'dashboard', icon: Activity, label: 'Agent Dashboard' },
    { id: 'documents', icon: FileText, label: 'Document Feed' },
    { id: 'messaging', icon: MessageSquare, label: 'Agent Messaging' },
    { id: 'privacy', icon: ShieldCheck, label: 'Ownership Privacy' },
    { id: 'config', icon: Settings, label: 'Console Config' },
  ];

  const renderContent = () => {
    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                <Loader2 className="animate-spin text-luminous-blue" size={32} />
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400">Establish Secure Uplink...</p>
            </div>
        );
    }

    switch (activeTab) {
      case 'documents':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Document Feed.</h3>
                   <p className="text-gray-500 font-medium italic">All official correspondence received at your private address.</p>
                </div>
                <div className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Zap size={12} className="text-[#00D084]" /> Real-time Sync
                </div>
             </div>
             
             <div className="space-y-3">
                {[
                  { title: 'Annual Report Filing Confirmation', date: 'Feb 12, 2026', type: 'State FL', status: 'Processed' },
                  { title: 'Service of Process (Mock Inquiry)', date: 'Feb 09, 2026', type: 'Legal', status: 'Blocked' },
                  { title: 'Tax Receipt - Department of Revenue', date: 'Jan 28, 2026', type: 'Tax', status: 'Scanned' },
                  { title: 'Official Mail - Division of Corporations', date: 'Jan 15, 2026', type: 'Sunbiz', status: 'Scanned' },
                  { title: 'Registered Agent Designation Status', date: 'Jan 02, 2026', type: 'Legal', status: 'Active' },
                ].map((doc, i) => (
                   <div key={i} className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-luminous-blue/30 hover:shadow-xl transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-luminous-blue/10 group-hover:text-luminous-blue transition-colors">
                            <FileText size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-[#1D1D1F] text-sm group-hover:text-luminous-blue transition-colors">{doc.title}</p>
                            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                               <span>{doc.date}</span>
                               <span className="text-gray-300">•</span>
                               <span>{doc.type}</span>
                            </div>
                         </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         doc.status === 'Blocked' ? 'bg-red-50 text-red-500' :
                         doc.status === 'Active' ? 'bg-[#00D084]/10 text-[#00D084]' :
                         'bg-gray-100 text-gray-500'
                      }`}>
                         {doc.status}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        );

      case 'messaging':
        return (
           <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Secure Channel.</h3>
                <p className="text-gray-500 font-medium italic">Direct encrypted line to your Registered Agent team.</p>
             </div>
              
             <div className="flex-1 bg-gray-50/50 rounded-[32px] border border-gray-100 p-6 flex flex-col relative overflow-hidden">
                <div className="flex-1 space-y-6 overflow-y-auto pr-4">
                   <div className="flex items-start gap-4 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white text-[10px] font-black shrink-0">RA</div>
                      <div className="space-y-2">
                         <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-xs font-medium text-gray-600 leading-relaxed">
                            "System Alert: We successfully intercepted a public record request for your home address essentially 'blocking' it from the public database. Your privacy shield held firm."
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 pl-2">Yesterday 2:30 PM</span>
                      </div>
                   </div>

                   <div className="flex items-start gap-4 max-w-[80%] ml-auto flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-luminous-blue flex items-center justify-center text-white text-[10px] font-black shrink-0">YOU</div>
                      <div className="space-y-2 text-right">
                         <div className="bg-luminous-blue p-4 rounded-2xl rounded-tr-none shadow-md text-xs font-medium text-white leading-relaxed">
                            "Excellent. Do I need to take any action on the annual report?"
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 pr-2">Yesterday 2:45 PM</span>
                      </div>
                   </div>

                   <div className="flex items-start gap-4 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white text-[10px] font-black shrink-0">RA</div>
                      <div className="space-y-2">
                         <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-xs font-medium text-gray-600 leading-relaxed">
                            "No action required. We utilized the 'Double LLC' structure to file anonymously on your behalf. You are compliant for 2026."
                         </div>
                         <div className="flex items-center gap-2 pl-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Just Now</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-[#00D084]" />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-6 relative">
                   <input type="text" placeholder="Type a secure message..." className="w-full bg-white p-4 pr-14 rounded-2xl border border-gray-100 font-medium text-sm focus:ring-2 focus:ring-luminous-blue/20 outline-none transition-all" />
                   <button className="absolute right-2 top-2 bottom-2 aspect-square bg-[#1D1D1F] rounded-xl text-white flex items-center justify-center hover:scale-95 transition-transform">
                      <ArrowRight size={18} />
                   </button>
                </div>
             </div>
          </div>
        );

      case 'privacy':
        return (
           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                 <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Privacy Status.</h3>
                    <p className="text-gray-500 font-medium italic">Monitoring your public data footprint.</p>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-[#00D084]/10 text-[#00D084] rounded-xl border border-[#00D084]/20">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Shield Active</span>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="p-8 bg-[#0A0A0B] rounded-[32px] text-white overflow-hidden relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D084] rounded-full blur-[100px] opacity-10" />
                    
                    <div className="relative z-10 space-y-8">
                       <div className="space-y-2">
                          <span className="text-[#00D084] text-[10px] font-black uppercase tracking-[0.3em]">Sunbiz Public Record</span>
                          <h4 className="text-2xl font-black">Official Filing Data</h4>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-1">
                             <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Registered Agent</p>
                             <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-[#00D084]" />
                                <p className="font-mono text-lg text-gray-300">Charter Legacy, Inc.</p>
                             </div>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Manager / Owner</p>
                             <div className="flex items-center gap-2">
                                <Shield size={14} className="text-[#00D084]" />
                                <p className="font-mono text-lg text-gray-300">*********** LLC</p>
                             </div>
                             <p className="text-[10px] text-gray-600 font-bold italic">Your name is hidden via Double LLC.</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Principal Address</p>
                             <div className="flex items-center gap-2">
                                <Building2 size={14} className="text-[#00D084]" />
                                <p className="font-mono text-lg text-gray-300">1200 Brickell Ave...</p>
                             </div>
                             <p className="text-[10px] text-gray-600 font-bold italic">Using our generic facility address.</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-4 shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                             <Activity size={18} />
                          </div>
                          <div>
                             <p className="font-black text-[#1D1D1F] text-sm">Threat Blocked</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Yesterday</p>
                          </div>
                       </div>
                       <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          "A data scraper attempted to access beneficial ownership info. Our system returned the statutory holding company data, preserving your anonymity."
                       </p>
                    </div>
                    <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-4 shadow-sm opacity-60">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                             <Activity size={18} />
                          </div>
                          <div>
                             <p className="font-black text-[#1D1D1F] text-sm">Routine Scan</p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Feb 10, 2026</p>
                          </div>
                       </div>
                       <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          "Weekly sweep of 40+ data broker sites. No personal leaks detected."
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        );

      case 'config':
        return (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Configuration.</h3>
                <p className="text-gray-500 font-medium italic">Manage your alerts and forwarding protocols.</p>
             </div>

             <div className="space-y-6 max-w-2xl">
                <div onClick={() => saveConfig('auto_dispose_marketing', !autoDisposeMarketing)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${autoDisposeMarketing ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                   <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-wide transition-colors ${autoDisposeMarketing ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Auto-Dispose Marketing</p>
                      <p className="text-xs text-gray-500 font-medium">Automatically shred spam and solicitation mail.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${autoDisposeMarketing ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                          {autoDisposeMarketing ? 'Active' : 'Off'}
                      </span>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${autoDisposeMarketing ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${autoDisposeMarketing ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                      </div>
                   </div>
                </div>
                
                <div onClick={() => saveConfig('priority_forwarding', !priorityForwarding)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${priorityForwarding ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                   <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-wide transition-colors ${priorityForwarding ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Pleadings / Priority Mail</p>
                      <p className="text-xs text-gray-500 font-medium">Instant scan & forward for all court/state documents.</p>
                   </div>
                   <div className="flex items-center gap-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${priorityForwarding ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                          {priorityForwarding ? 'Active' : 'Off'}
                      </span>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${priorityForwarding ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${priorityForwarding ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                      </div>
                   </div>
                </div>

                <div onClick={() => saveConfig('auto_renew', !autoRenew)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${autoRenew ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 opacity-80 hover:opacity-100 hover:border-gray-200'}`}>
                   <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-wide transition-colors ${autoRenew ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Auto-Renewal</p>
                      <p className="text-xs text-gray-500 font-medium">Automatically renew my privacy shield every year.</p>
                   </div>
                   <div className="flex items-center gap-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${autoRenew ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                          {autoRenew ? 'Active' : 'Off'}
                      </span>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${autoRenew ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${autoRenew ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                      </div>
                   </div>
                </div>

                <div onClick={() => saveConfig('sms_interrupt', !smsInterrupt)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${smsInterrupt ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                   <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-wide transition-colors ${smsInterrupt ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Urgent SMS Interrupt</p>
                      <p className="text-xs text-gray-500 font-medium">Bypass "Do Not Disturb" for Service of Process alerts.</p>
                   </div>
                   <div className="flex items-center gap-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${smsInterrupt ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                          {smsInterrupt ? 'Active' : 'Off'}
                      </span>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${smsInterrupt ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${smsInterrupt ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                      </div>
                   </div>
                </div>

                <div onClick={() => saveConfig('data_broker_shield', !brokerShield)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col gap-4 group hover:scale-[1.01] ${brokerShield ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                   <div className="flex items-center justify-between w-full">
                      <div className="space-y-1">
                         <p className={`font-black text-sm uppercase tracking-wide transition-colors ${brokerShield ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Data Broker Shield</p>
                         <p className="text-xs text-gray-500 font-medium">Auto-submit removal requests to 40+ people-search sites.</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${brokerShield ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                              {brokerShield ? 'Active' : 'Off'}
                          </span>
                          <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${brokerShield ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${brokerShield ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                          </div>
                      </div>
                   </div>
                   
                   <div className={`pt-4 border-t ${brokerShield ? 'border-[#007AFF]/10' : 'border-gray-100'} grid grid-cols-2 gap-4`}>
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-gray-400">
                             <Fingerprint size={10} className={brokerShield ? "text-[#007AFF]" : "text-gray-300"} />
                             Targeted Databases
                         </div>
                         <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            Whitepages, Spokeo, BeenVerified, Radaris, PeopleFinder, +35 others.
                         </p>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-gray-400">
                             <Activity size={10} className={brokerShield ? "text-[#007AFF]" : "text-gray-300"} />
                             Action Frequency
                         </div>
                         <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            Continuous monitoring. Auto-removal requests sent every 30 days.
                         </p>
                      </div>
                   </div>
                   {!brokerShield && (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-gray-500">Included in Sovereign Package</span>
                         <span className="text-[10px] font-black uppercase text-luminous-blue cursor-pointer">Upgrade</span>
                      </div>
                   )}
                   
                   {/* Removal Simulation Button */}
                   {brokerShield && (
                       <div onClick={initiateBrokerRemoval} className="mt-2 w-full py-3 bg-luminous-blue/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-luminous-blue/20 transition-colors">
                           <ShieldCheck size={14} className="text-luminous-blue" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-luminous-blue">Run Manual Removal Scan</span>
                       </div>
                   )}
                </div>

                {/* Dev Tool: Service of Process Simulation */}
                <div onClick={simulateServiceOfProcess} className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl cursor-pointer hover:bg-red-100 transition-colors opacity-50 hover:opacity-100">
                    <div className="flex items-center gap-3 text-red-500">
                        <Zap size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Dev: Simulate Service of Process</span>
                    </div>
                </div>
             </div>
           </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="relative z-10 space-y-16 animate-in fade-in duration-700">
             <header className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500">
                   <Shield size={12} /> Status: Active Command
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-luminous-ink uppercase tracking-tighter leading-none">Registered Agent <br/><span className="text-luminous-blue">Console.</span></h2>
                <div className="flex items-center gap-4 pt-2">
                   <div className="h-px bg-gray-200 w-12"></div>
                   <p className="text-xl md:text-2xl text-luminous-ink font-black uppercase tracking-tight">
                       Business Ownership Kept Private.
                   </p>
                </div>
                <p className="text-lg text-gray-500 font-medium italic leading-relaxed">
                   This is the command center for your statutory shield. We intercept public records requests and keep your residential address off the grid.
                </p>
             </header>

             <div className="grid lg:grid-cols-2 gap-12">
                {/* DOCUMENT FEED WIDGET */}
                <div className="space-y-6">
                   <h3 className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                      Scanned Documents <span onClick={() => setActiveTab('documents')} className="text-[10px] text-luminous-blue cursor-pointer hover:underline">View All</span>
                   </h3>
                   <div className="space-y-3">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                           <div className="space-y-1">
                              <p className="text-xs font-black text-luminous-ink">{doc.title}</p>
                              <div className="flex gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                 <span>{doc.date}</span>
                                 <span>•</span>
                                 <span className="text-luminous-blue">{doc.type}</span>
                              </div>
                           </div>
                           <FileCode size={20} className="text-gray-200 group-hover:text-luminous-blue transition-colors" />
                        </div>
                      ))}
                   </div>
                </div>

                {/* MESSAGING WIDGET */}
                <div className="space-y-6">
                   <h3 className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                      Agent Secure Chat <span onClick={() => setActiveTab('messaging')} className="text-[10px] text-luminous-blue cursor-pointer hover:underline">Open Comms</span>
                   </h3>
                   <div className="space-y-3">
                      {messages.map((msg, i) => (
                        <div key={i} className="p-5 bg-white rounded-2xl border border-gray-100 group hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                           {msg.unread && <div className="absolute top-0 right-0 w-3 h-3 bg-luminous-blue rounded-bl-xl" />}
                           <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-full bg-luminous-ink text-white flex items-center justify-center font-black text-xs shrink-0">
                                 {msg.sender[0]}
                              </div>
                              <div className="space-y-1.5">
                                 <div className="flex justify-between items-start w-full">
                                    <div>
                                       <p className="text-xs font-black text-luminous-ink">{msg.sender}</p>
                                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{msg.role}</p>
                                    </div>
                                    <span className="text-[9px] text-gray-300 font-bold">{msg.time}</span>
                                 </div>
                                 <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                                    "{msg.content}"
                                 </p>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

             </div>

             {/* SYSTEM ACTIVITY TRACKER */}
             <div className="bg-luminous-ink rounded-[32px] p-10 space-y-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 dot-overlay opacity-10 pointer-events-none" />
                <h4 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   System Activity Tracker <span className="h-[1px] flex-1 bg-white/10" />
                </h4>
                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                   <div className="space-y-2">
                      <p className="text-2xl font-black text-luminous-blue">Activated</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ownership Privacy Shield</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-2xl font-black">Live</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sunbiz Automated Liaison</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-2xl font-black">24h</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Document Processing Window</p>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <section id="privacy" className="py-48 px-6 bg-luminous relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-10" />
        <div className="absolute inset-0 dot-overlay opacity-30 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative group/slab">
                <div className="flex flex-col md:flex-row min-h-[850px]">
                
                 {/* SIDEBAR NAVIGATION */}
                 <aside className="w-full md:w-72 bg-gray-50/50 border-r border-gray-100/50 p-10 space-y-12 shrink-0">
                    <div className="space-y-2 text-left">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block">Console ID</span>
                       <span className="text-xs font-mono text-luminous-blue">RA-FL-482910</span>
                    </div>
                    <nav className="space-y-6">
                       {tabs.map((link) => (
                         <button 
                            key={link.id} 
                            onClick={() => setActiveTab(link.id)}
                            className={`flex items-center gap-4 w-full transition-all duration-300 group ${activeTab === link.id ? 'text-luminous-blue translate-x-2' : 'text-gray-400 hover:text-black hover:translate-x-1'}`}
                         >
                            <link.icon size={18} className={activeTab === link.id ? "" : "group-hover:scale-110 transition-transform"} />
                            <span className="text-xs font-black uppercase tracking-widest text-left">{link.label}</span>
                         </button>
                       ))}
                    </nav>
                    
                    <div className="pt-20 text-left">
                       <div className="p-4 bg-luminous-blue/10 rounded-2xl border border-luminous-blue/20">
                          <div className="flex items-center gap-3 text-luminous-blue mb-2">
                             <Clock size={14} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Facility Uplink</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-[10px] font-bold text-gray-600">Miami Hub Active</span>
                          </div>
                       </div>
                    </div>
                 </aside>

                 {/* MAIN CONTENT AREA */}
                 <main className="flex-1 p-12 md:p-20 relative text-left overflow-y-auto">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-luminous-blue/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />
                    {renderContent()}
                 </main>

              </div>
           </div>
        </div>
    </section>
  );
};

export default RegisteredAgentConsole;
