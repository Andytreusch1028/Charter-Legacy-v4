import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Megaphone, Activity, CheckCircle2, Key, Edit3, Trash2, Linkedin, Twitter, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MarketingEngine } from '../../lib/MarketingEngine';

const MarketingDashboard = ({ isOpen, onClose }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [activeTab, setActiveTab] = useState('draft'); // 'draft' | 'posted'
  const [stats, setStats] = useState({ draft: 0, posted: 0 });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketing_queue')
        .select('*')
        .eq('status', activeTab)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setQueue(data || []);

      // Fetch simple metrics
      const { data: metricsData } = await supabase
        .from('marketing_queue')
        .select('status');
      
      if (metricsData) {
        setStats({
          draft: metricsData.filter(d => d.status === 'draft').length,
          posted: metricsData.filter(d => d.status === 'posted').length,
        });
      }

    } catch (err) {
      console.error("Failed to fetch marketing queue:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) {
      fetchQueue();
    }
  }, [isOpen, fetchQueue]);

  // Command+Enter shortcut for Power Users
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (editingId) {
          handleSaveEdit(editingId);
        }
      }
      if (e.key === 'Escape' && editingId) {
        setEditingId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingId, editBuffer]);

  const handlePublish = async (item) => {
    setPublishing(prev => ({ ...prev, [item.id]: true }));
    try {
      const webhookUrl = import.meta.env?.VITE_MARKETING_WEBHOOK_URL || 'https://hook.us1.make.com/mock';
      const engine = new MarketingEngine(null, webhookUrl);

      // Attempt to publish
      await engine.publishToWebhook(item.id, item.suggested_copy, item.platform || 'linkedin');

      // Update DB Status
      await supabase
        .from('marketing_queue')
        .update({ status: 'posted', updated_at: new Date().toISOString() })
        .eq('id', item.id);

      // Refresh Queue & Stats
      setQueue(prev => prev.filter(q => q.id !== item.id));
      setStats(prev => ({ ...prev, draft: Math.max(0, prev.draft - 1), posted: prev.posted + 1 }));
    } catch (err) {
      console.error("Publishing Error", err);
      alert("Failed to publish: " + err.message);
    } finally {
      setPublishing(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleDiscard = async (id) => {
    if (!window.confirm("Are you sure you want to discard this narrative?")) return;
    try {
      await supabase.from('marketing_queue').delete().eq('id', id);
      setQueue(prev => prev.filter(q => q.id !== id));
      setStats(prev => ({ ...prev, draft: Math.max(0, prev.draft - 1) }));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditBuffer(item.suggested_copy);
  };

  const handleSaveEdit = async (id) => {
    try {
      await supabase
        .from('marketing_queue')
        .update({ suggested_copy: editBuffer })
        .eq('id', id);
        
      setQueue(prev => prev.map(q => q.id === id ? { ...q, suggested_copy: editBuffer } : q));
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save edit:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-[#1D1D1F] font-sans">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#1D1D1F] w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden relative border border-white/10 flex flex-col font-sans"
      >
        {/* Header - Jony Ive Aesthetic */}
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#1D1D1F]">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <Megaphone size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Narrative Engine</h2>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1.5 opacity-80">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Live: Webhook Node Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex text-white/30 text-[10px] uppercase font-black tracking-widest bg-white/5 px-4 py-2 rounded-xl">
              <Key size={12} className="mr-2 inline" /> Pro Tip: CMD + Enter to Save
            </div>
            <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs for Filtering */}
        <div className="flex items-center gap-1 p-4 bg-gradient-to-br from-[#1D1D1F] to-[#121213] border-b border-white/5">
            <button 
              onClick={() => setActiveTab('draft')}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'draft' ? 'bg-white text-black' : 'text-white/40 hover:text-white/80'}`}
            >
              Pending Drafts ({stats.draft})
            </button>
            <button 
              onClick={() => setActiveTab('posted')}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'posted' ? 'bg-[#00D084]/20 text-[#00D084]' : 'text-white/40 hover:text-white/80'}`}
            >
              Published ({stats.posted})
            </button>
            <div className="ml-auto">
              <button onClick={fetchQueue} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all">
                 <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-[#1D1D1F] to-[#121213]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
               {activeTab === 'draft' ? 'Broadcasting Queue' : 'Broadcast Archive'}
            </h3>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">{queue.length} Total</span>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-white/30">
               <Activity className="animate-spin mb-4" size={32} />
               <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Narratives...</span>
             </div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-[32px] mt-2">
               {activeTab === 'draft' ? (
                 <>
                   <CheckCircle2 className="text-white/20 mb-4" size={48} />
                   <p className="text-white/40 text-sm font-medium">No pending broadcasts. Narrative Engine is idle.</p>
                 </>
               ) : (
                 <>
                   <Activity className="text-white/20 mb-4" size={48} />
                   <p className="text-white/40 text-sm font-medium">No archived broadcasts found.</p>
                 </>
               )}
            </div>
          ) : (
            <div className="space-y-6">
              {queue.map(item => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-[28px] p-6 lg:p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
                  {/* Glassmorphic Gradient Overlay */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-luminous-blue/10 rounded-full blur-[80px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5">
                          Trigger: {item.source_event_type}
                        </span>
                        
                        {item.platform === 'x' || item.platform === 'twitter' ? (
                           <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-white/50"><Twitter size={10} /> X</span>
                        ) : item.platform === 'newsletter' ? (
                           <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-white/50"><Mail size={10} /> Mail</span>
                        ) : (
                           <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-white/50"><Linkedin size={10} /> LinkedIn</span>
                        )}

                        <span className="text-[10px] font-medium text-white/40">{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                      
                      {editingId === item.id ? (
                        <div className="space-y-3">
                          <textarea 
                            autoFocus
                            value={editBuffer}
                            onChange={(e) => setEditBuffer(e.target.value)}
                            className="w-full h-48 bg-black/40 border border-white/20 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-luminous-blue/50 focus:ring-1 focus:ring-luminous-blue/50 transition-all resize-none shadow-inner"
                          />
                          <div className="flex justify-end gap-3">
                             <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg text-white/50 text-xs font-bold hover:text-white transition-colors">Cancel</button>
                             <button onClick={() => handleSaveEdit(item.id)} className="px-6 py-2 bg-white text-black rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="group/text cursor-pointer relative" onClick={() => activeTab === 'draft' && handleStartEdit(item)}>
                          {activeTab === 'draft' && (
                             <div className="absolute top-2 right-2 text-white/0 group-hover/text:text-white/40 transition-colors">
                                <Edit3 size={14} />
                             </div>
                          )}
                          <p className={`text-white/80 whitespace-pre-wrap text-sm leading-relaxed p-4 border border-transparent transition-all rounded-xl ${activeTab === 'draft' ? 'group-hover/text:bg-white/5 group-hover/text:border-white/10' : ''}`}>
                            {item.suggested_copy || JSON.stringify(item.raw_data)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="lg:w-64 flex flex-col justify-end gap-3">
                      {activeTab === 'draft' ? (
                        <>
                          <button 
                            disabled={publishing[item.id] || editingId === item.id}
                            onClick={() => handlePublish(item)}
                            className="w-full flex items-center justify-center gap-3 bg-luminous-blue hover:bg-hacker-blue text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(45,108,223,0.3)] hover:shadow-[0_0_30px_rgba(45,108,223,0.5)] transition-all disabled:opacity-50 disabled:grayscale"
                          >
                            {publishing[item.id] ? <Activity className="animate-spin" size={16} /> : <Send size={16} />}
                            {publishing[item.id] ? 'Broadcasting...' : 'Publish to World'}
                          </button>
                          <button 
                            disabled={publishing[item.id]}
                            onClick={() => handleDiscard(item.id)}
                            className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/5 text-white/30 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50"
                          >
                            <Trash2 size={12} /> Discard Narrative
                          </button>
                        </>
                      ) : (
                         <div className="w-full flex items-center justify-center gap-2 bg-[#00D084]/10 text-[#00D084] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] border border-[#00D084]/20">
                            <CheckCircle2 size={16} /> Successfully Posted
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MarketingDashboard;
