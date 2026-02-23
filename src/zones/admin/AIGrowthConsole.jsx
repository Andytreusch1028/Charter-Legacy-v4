import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Activity, Check, BarChart2, Zap, ShieldCheck, Anchor, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AIGrowthConsole = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [activeVariants, setActiveVariants] = useState([]);
  const [pendingVariants, setPendingVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVariants();
    }
  }, [isOpen]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
        const { data: activeData } = await supabase
            .from('hero_variants')
            .select('*')
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: true });
        
        const { data: pendingData } = await supabase
            .from('hero_variants')
            .select('*')
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        if (activeData) setActiveVariants(activeData);
        if (pendingData) setPendingVariants(pendingData);
    } catch (e) {
        console.error("Failed to fetch variants", e);
    } finally {
        setLoading(false);
    }
  };

  const handleGenerateTarget = async () => {
      setGenerating(true);
      try {
          // Mocking the analytics payload that would normally be aggregated
          const mockAnalytics = {
              current_test_period: "14 days",
              variants: activeVariants.map(v => ({
                  id: v.variant_code,
                  title: v.headline,
                  ctr: Math.random() * 5 + "%",
                  conversion_rate: Math.random() * 2 + "%"
              }))
          };
          
          const { data, error } = await supabase.functions.invoke('generate-hero-variant', {
              body: { analyticsData: mockAnalytics }
          });
          
          if (error) throw error;
          await fetchVariants(); // Refresh lists
      } catch (err) {
          console.error("AI Generation Error", err);
          alert("Failed to generate: " + err.message);
      } finally {
          setGenerating(false);
      }
  };

  const updateVariantStatus = async (id, status) => {
      try {
          await supabase.from('hero_variants').update({ status }).eq('id', id);
          await fetchVariants();
      } catch (e) {
          console.error("Update failed", e);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-[#1D1D1F] font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#FBFBFD] w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden relative border border-white/20 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <Brain size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">AI Growth Engine</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-400 mt-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Live: HitL Connected to Supabase
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          
          {/* Ongoing Test Performance */}
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-2">Active A/B Test Variants</h3>
            
            {loading ? (
                <div className="flex items-center justify-center p-12 text-gray-400"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {activeVariants.map((v) => (
                    <div key={v.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-gray-50 rounded-lg text-gray-500 border border-gray-100">Variant {v.variant_code}</span>
                         {v.variant_code === 'A' ? <Zap size={16} className="text-gray-300"/> : v.variant_code === 'B' ? <ShieldCheck size={16} className="text-gray-300"/> : <Anchor size={16} className="text-gray-300"/>}
                      </div>
                      <h4 className="font-bold text-sm mb-6">&quot;{v.headline}&quot;</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Target</span>
                            <div className="text-xs font-bold text-gray-600 line-clamp-1">{v.target_sentiment || 'Dynamic'}</div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
            )}
            
            <button 
                onClick={handleGenerateTarget}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 bg-[#1D1D1F] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] transition-transform disabled:opacity-50"
            >
                {generating ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />} 
                {generating ? 'Synthesizing Data...' : 'Generate New Challenger Variants'}
            </button>
          </section>

          {/* AI Proposal (Human in the Loop) */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Pending AI Approval (HitL)</h3>
                 <span className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-md">Action Required</span>
             </div>

              {pendingVariants.length === 0 && !loading && (
                 <div className="text-center p-8 text-gray-400 text-sm font-medium border border-dashed border-gray-200 rounded-2xl">
                     No pending variants awaiting review.
                 </div>
              )}

              {pendingVariants.map((variant) => (
                  <div key={variant.id} className="bg-[#1D1D1F] text-white rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
                    
                    <div className="grid md:grid-cols-2 gap-12 relative z-10">
                       <div>
                           <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-full mb-6">
                               <Brain size={14} /> AI Growth Engineer Action
                           </div>
                           <h4 className="text-2xl font-black uppercase tracking-tight mb-4">Proposed by AI:</h4>
                           <p className="text-gray-400 text-sm italic leading-relaxed mb-6">
                               "Generated based on current conversion analytics to optimize strictly for {variant.target_sentiment}. Validated against UPL constraints."
                           </p>
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                           <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-3">Proposed Challenger ({variant.variant_code})</span>
                           <h5 className="text-2xl font-black text-white mb-2 leading-tight">{variant.headline}</h5>
                           <p className="text-sm text-gray-300 italic mb-8">
                               "{variant.subheading}"
                           </p>
                           
                           <div className="flex items-center gap-4">
                               <button 
                                  onClick={() => updateVariantStatus(variant.id, 'ACTIVE')}
                                  className="flex-1 bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform flex items-center justify-center gap-2"
                               >
                                  Approve & Deploy
                               </button>
                               <button 
                                  onClick={() => updateVariantStatus(variant.id, 'REJECTED')}
                                  className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-colors"
                               >
                                  Reject
                               </button>
                           </div>
                       </div>
                    </div>
                  </div>
              ))}
          </section>

        </div>
      </motion.div>
    </div>
  );
};

export default AIGrowthConsole;
