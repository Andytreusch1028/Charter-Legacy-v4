import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, FileText, ArrowLeft, LogOut, Search, Filter, Loader2, UploadCloud, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FulfillmentConsole() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [llcs, setLlcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchFulfillmentQueue();
  }, []);

  const fetchFulfillmentQueue = async () => {
    setLoading(true);
    try {
      // We do not filter by user_id here because this is for staff. 
      // Ensure the user has the 'fulfillment' role or uses DEV_ADMIN_BYPASS
      // Note: RLS might block this if not using Service Role. 
      // For this build, we rely on the backend edge functions or assume RLS 
      // allows role-based SELECT. If testing locally with Mock Bypass, we fetch all.
      const { data, error } = await supabase
        .from('llcs')
        .select(`
          id, llc_name, llc_status, created_at, ein
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching LLCs:", error);
      } else {
        setLlcs(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('DEV_ADMIN_BYPASS');
    await supabase.auth.signOut();
    window.location.href = '/staff';
  };

  const handleProcess = async (llc) => {
    setProcessingId(llc.id);
    try {
        const { data, error } = await supabase.functions.invoke('sunbiz-e-file', {
            body: { llc_id: llc.id }
        });
        
        if (error) throw error;
        if (!data.success) throw new Error(data.error);

        alert("Success: " + data.message);
        await fetchFulfillmentQueue(); // Refresh the grid
    } catch (err) {
        console.error("Scrivener Engine Error:", err);
        alert("Automation Failed: " + err.message);
    } finally {
        setProcessingId(null);
    }
  };

  const getFilteredData = () => {
    if (activeTab === 'ALL') return llcs;
    if (activeTab === 'BOI') return llcs.filter(l => l.llc_status === 'Awaiting BOI' || !l.ein);
    if (activeTab === 'ARTICLES') return llcs.filter(l => l.llc_status === 'Setting Up' || l.llc_status === 'Pending Formation');
    return llcs;
  };

  const filteredLlcs = getFilteredData();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2A2A2E] pb-6 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Fulfillment Command</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  Operations & Document Prep Active
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
               <input type="text" placeholder="Search entity or ID..." className="bg-[#121214] border border-[#2A2A2E] text-xs font-medium text-white rounded-lg pl-9 pr-4 py-2.5 w-64 focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2.5 hover:bg-red-500/10 text-red-500 border border-red-500/0 hover:border-red-500/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all">
              <LogOut size={16} /> Disconnect
            </button>
          </div>
        </header>

        <main className="grid lg:grid-cols-4 gap-8">
          
          {/* Main Data Grid Section */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* The Brutalist Tabs */}
            <div className="flex items-center gap-2 border-b border-[#2A2A2E]">
               {[
                 { id: 'ALL', label: 'All Operations' },
                 { id: 'ARTICLES', label: 'Pending Articles' },
                 { id: 'BOI', label: 'Pending BOI' }
               ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                     activeTab === tab.id 
                       ? 'border-blue-500 text-blue-500 bg-blue-500/5' 
                       : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                   }`}
                 >
                   {tab.label}
                 </button>
               ))}
            </div>

            <div className="bg-[#121214] border border-[#2A2A2E] rounded-xl overflow-hidden shadow-2xl">
              
              {loading ? (
                 <div className="p-24 flex flex-col items-center justify-center text-gray-500 gap-4">
                     <Loader2 size={32} className="animate-spin text-blue-500" />
                     <span className="text-xs font-black uppercase tracking-widest">Scanning Databases...</span>
                 </div>
              ) : filteredLlcs.length === 0 ? (
                 <div className="p-24 flex flex-col items-center justify-center text-gray-500 gap-4 opacity-50">
                     <CheckCircle2 size={48} />
                     <span className="text-xs font-black uppercase tracking-widest">Zero Pending Tasks</span>
                 </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0A0A0B] border-b border-[#2A2A2E]">
                        <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Entity Data</th>
                        <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Status Code</th>
                        <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Origination</th>
                        <th className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2E]">
                      {filteredLlcs.map(llc => (
                        <tr key={llc.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-md bg-[#2A2A2E] flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black transition-all">
                                    <FileText size={14} />
                                </div>
                                <div>
                                   <div className="text-sm font-bold text-white mb-1">{llc.llc_name || 'Unnamed Entity'}</div>
                                   <div className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">{llc.id.split('-')[0]}</div>
                                </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                llc.llc_status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                llc.llc_status?.includes('Awaiting') ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                'bg-[#2A2A2E] text-gray-300 border-[#3A3A3E]'
                            }`}>
                                {llc.llc_status || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                 <Clock size={12} />
                                 {new Date(llc.created_at).toLocaleDateString()}
                             </div>
                          </td>
                          <td className="px-6 py-5 text-right space-x-2 w-48">
                             <button 
                                 onClick={() => handleProcess(llc)}
                                 disabled={processingId === llc.id}
                                 className="px-3 py-1.5 bg-[#2A2A2E] hover:bg-white hover:text-black text-gray-300 rounded text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 min-w-[70px]"
                             >
                                 {processingId === llc.id ? <Loader2 size={12} className="animate-spin inline" /> : 'Process'}
                             </button>
                             <button className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 border border-blue-500/20 rounded text-[9px] font-black uppercase tracking-widest transition-all">
                                 Upload Doc
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 text-center">
               <Shield size={32} className="text-blue-500 mx-auto mb-4 opacity-50" />
               <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">Notice</h4>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                 Your role is restricted to document generation and statutory filing tasks. Executive Analytics and AI test controls are disabled.
               </p>
             </div>
          </div>

        </main>

      </div>
    </div>
  );
}
