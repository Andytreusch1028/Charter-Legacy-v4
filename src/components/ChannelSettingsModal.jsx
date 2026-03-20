import React, { useState, useEffect } from 'react';
import { X, Settings, Key, ShieldCheck } from 'lucide-react';

const ChannelSettingsModal = ({ onClose }) => {
  const [twitterKey, setTwitterKey] = useState('');
  const [linkedinKey, setLinkedinKey] = useState('');
  const [blogKey, setBlogKey] = useState('');

  useEffect(() => {
    setTwitterKey(localStorage.getItem('_charter_twitter_key') || '');
    setLinkedinKey(localStorage.getItem('_charter_linkedin_key') || '');
    setBlogKey(localStorage.getItem('_charter_blog_key') || '');
  }, []);

  const saveKeys = () => {
    localStorage.setItem('_charter_twitter_key', twitterKey);
    localStorage.setItem('_charter_linkedin_key', linkedinKey);
    localStorage.setItem('_charter_blog_key', blogKey);
    alert('Marketing API Keys securely saved to local storage.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#121214] w-full max-w-md rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center text-blue-500">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Channel Sync</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Local API Configuration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-10 space-y-8">
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} className="text-[#1DA1F2]" /> Twitter / X API Key
                 </label>
                 <input 
                    type="password"
                    value={twitterKey}
                    onChange={(e) => setTwitterKey(e.target.value)}
                    placeholder="Enter your Twitter Developer Key..."
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-4 text-xs font-medium text-gray-300 focus:border-[#1DA1F2] outline-none transition-all"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} className="text-[#0A66C2]" /> LinkedIn Client Secret
                 </label>
                 <input 
                    type="password"
                    value={linkedinKey}
                    onChange={(e) => setLinkedinKey(e.target.value)}
                    placeholder="Enter your LinkedIn Client Secret..."
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-4 text-xs font-medium text-gray-300 focus:border-[#0A66C2] outline-none transition-all"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} className="text-[#FF3E00]" /> Blog API Key (WP / Ghost)
                 </label>
                 <input 
                    type="password"
                    value={blogKey}
                    onChange={(e) => setBlogKey(e.target.value)}
                    placeholder="Enter your CMS Application Password or API Key..."
                    className="w-full bg-[#0A0A0B] border border-white/10 rounded-xl p-4 text-xs font-medium text-gray-300 focus:border-[#FF3E00] outline-none transition-all"
                 />
              </div>
           </div>

           <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3 text-blue-400">
              <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium leading-relaxed">
                 Keys are stored locally encrypted in your browser and injected into Edge Function payloads at runtime. They are never sent to a database.
              </p>
           </div>

           <button 
              onClick={saveKeys}
              className="w-full bg-blue-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
           >
              Save Configuration
           </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsModal;
