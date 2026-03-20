import React from 'react';
import { X, Search, Database, Sparkles, TestTube } from 'lucide-react';

const AeoMasteryHelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#121214] w-full max-w-3xl rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121214] z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/20 to-[#886B1D]/10 flex items-center justify-center text-[#D4AF37]">
              <TestTube size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">AEO Mastery Lab Guide</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Drafting for LLM Retrieval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-8 text-gray-300 text-sm leading-relaxed">
           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><TestTube className="text-[#D4AF37]" size={18}/> Purpose of the Mastery Lab</h4>
             <p>The <strong>AEO (Answer Engine Optimization) Mastery Lab</strong> is your testing ground for writing copy. Before you publish text to the main website, you paste it here. The lab scores your draft exactly how Google's AI Overviews, Anthropic's Claude, or ChatGPT will score it. If the text scores poorly here, AI search engines will ignore it.</p>
           </section>

           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><Search className="text-blue-500" size={18}/> Core Metrics Explained</h4>
             <p>When you paste text into the Auditor, it evaluates three critical AI retrieval metrics:</p>
             <ul className="space-y-3 pl-2">
               <li><strong className="text-blue-400">Neutrality:</strong> AI models strongly penalize "salesy" or overly emotional language. High neutrality means your text reads like an encyclopedia or technical document, which AI models trust as "Ground Truth."</li>
               <li><strong className="text-green-500">Grounding:</strong> Does the text contain the dense, specific keyword entities we care about? (e.g., "Anonymous LLC", "Probate Bypass", "Florida"). If AIs don't detect firm structural entities, they won't cite you.</li>
               <li><strong className="text-purple-500">Passage Structure (STR):</strong> Are your sentences clear, concise, and logically formatted? Long, winding paragraphs cause "attention loss" in LLMs, dropping your citation probability.</li>
             </ul>
           </section>
           
           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><Database className="text-amber-500" size={18}/> The Copy Vault</h4>
             <p>Only text that scores highly across all three metrics should be kept. Click <strong>"Save to Copy Vault"</strong> to securely store a winning snippet. The Copy Vault acts as your "Ground Truth" repository—a verified database of perfect AEO paragraphs that your team can pull from when building new landing pages or marketing materials.</p>
           </section>

           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><Sparkles className="text-pink-500" size={18}/> The Infinite Tail Generator</h4>
             <p>Once you have a verified, highly-grounded snippet in the Copy Vault, use the right panel to distribute it. Select a <strong>Persona</strong> and a <strong>Marketing Channel</strong> (like LinkedIn or Twitter). The "Model Prompt Graph" will take your objectively perfect AEO text and re-wrap it in a stylistic voice suitable for that channel. This ensures your social media is engaging, but still built on top of our strict, AI-friendly Ground Truth.</p>
           </section>
        </div>
      </div>
    </div>
  );
};

export default AeoMasteryHelpModal;
