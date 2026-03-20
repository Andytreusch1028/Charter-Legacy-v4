import React from 'react';
import { X, Globe, Brain, Zap, RefreshCw } from 'lucide-react';

const SeoHelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#121214] w-full max-w-3xl rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121214] z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00D084]/10 flex items-center justify-center text-[#00D084]">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Answer Engine Matrix Guide</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">AEO Optimization & Simulation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-8 text-gray-300 text-sm leading-relaxed">
           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><Globe className="text-[#00D084]" size={18}/> Purpose of this Console</h4>
             <p>The <strong>Answer Engine Matrix (AEO)</strong> is designed to optimize Charter Legacy's content natively for AI summaries and LLM retrievals—such as ChatGPT, Claude, and Google AI Overviews. Traditional SEO optimizes for raw link ranking; AEO ensures our content contains the exact structural density and semantic weight required for AI engines to cite us as the definitive "Ground Truth."</p>
           </section>

           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><RefreshCw className="text-blue-500" size={18}/> Key Metrics & Recency</h4>
             <ul className="space-y-3 pl-2">
               <li><strong className="text-white">Recency Integrity:</strong> AIs heavily weigh content that is verifiable and recently updated. The "Trigger Recency Pulse" broadcasts the latest timestamp of our documentation to major search indexing hubs, ensuring LLMs know our protocols are the most current.</li>
               <li><strong className="text-white">Citations & Score:</strong> These figures measure how strongly our structured data is performing. High scores indicate our language patterns are successfully saturating model training outputs for topics like "Anonymous LLCs" and "Probate-Free Succession."</li>
             </ul>
           </section>

           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><Brain className="text-purple-500" size={18}/> Using the AI Q&A Simulator</h4>
             <p>The right-side panel is the <strong>Sovereign Matrix Protocol</strong> Simulator. To use it to guide your SEO strategy:</p>
             <ol className="list-decimal list-inside space-y-2 mt-2">
               <li>Locate an optimized page path in the Matrix List (e.g., <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-[#00D084] font-mono">/privacy-shield</code>).</li>
               <li>Click the <Zap size={14} className="inline text-gray-400" /> <strong>Simulate</strong> button on the right edge of the row.</li>
               <li>The Simulator instantly calculates the <strong>Citation Probability</strong>—the percentage chance that a modern LLM will pull our specific copy verbatim to answer a related user prompt.</li>
               <li>Review the <strong>Retrieved Snippet</strong> to see the exact context the AI model has locked onto from our pages.</li>
             </ol>
             <div className="mt-6">
                <p className="italic text-xs text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
                  <strong>Strategic Insight:</strong> If a page shows low Recency Integrity or a dropping AEO Score, use the <span className="font-bold text-white">AEO Laboratory</span> tab to audit new copy and refine its Grounding and Neutrality before pushing updates live.
                </p>
             </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default SeoHelpModal;
