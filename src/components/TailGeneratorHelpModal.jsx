import React from 'react';
import { X, Sparkles, Network, Copy } from 'lucide-react';

const TailGeneratorHelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#121214] w-full max-w-3xl rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121214] z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-blue-500/10 flex items-center justify-center text-purple-500">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Tail Generator Guide</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Scaling Ground Truth</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-8 text-gray-300 text-sm leading-relaxed">
           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><Network className="text-purple-500" size={18}/> What is a Model Prompt Graph?</h4>
             <p>A <strong>Model Prompt Graph</strong> is a highly-structured set of instructions designed to be copied and pasted directly into a commercial AI like ChatGPT or Claude.</p>
             <p>Instead of just asking ChatGPT to "write a tweet about LLCs", the Prompt Graph mathematically forces the AI to base its entire response on the exact, legally-approved <strong>Ground Truth</strong> snippet currently loaded in your Auditor/Vault. This prevents the AI from hallucinating or generating UPL (Unauthorized Practice of Law) liabilities.</p>
           </section>

           <section className="space-y-4">
             <h4 className="text-lg font-black text-white flex items-center gap-3"><Sparkles className="text-blue-500" size={18}/> How to use the Generator</h4>
             <ol className="space-y-4 pl-4 list-decimal marker:text-purple-500 marker:font-black">
               <li><strong className="text-white">Audit Copy:</strong> First, ensure you have a highly-rated, UPL-safe text snippet loaded in the AEO Auditor on the left.</li>
               <li><strong className="text-white">Select Persona:</strong> Choose the psychological profile you want the output to embody (e.g., "The Discrete Executive").</li>
               <li><strong className="text-white">Select Channel:</strong> Click on the Marketing Channel you intend to post to (Twitter, LinkedIn, Blog, etc.). This tells the graph how to format the output.</li>
               <li><strong className="text-white">Generate Graph:</strong> Click "Model Prompt Graph". The system will instantly compile the instruction set.</li>
               <li><strong className="text-white">Deploy:</strong> Click the copy button, paste the resulting prompt into ChatGPT or Claude, and hit enter. You will receive channel-perfect marketing copy that fundamentally inherits your strict technical Ground Truth.</li>
             </ol>
           </section>
        </div>
      </div>
    </div>
  );
};

export default TailGeneratorHelpModal;
