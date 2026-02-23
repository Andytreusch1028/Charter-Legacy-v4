import React from 'react';
import { Building2, ChevronRight, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const BusinessSelector = ({ llcs, onSelect }) => {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-100 rounded-full blur-[100px] opacity-80" />

      <div className="w-full max-w-4xl relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#1D1D1F] text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Building2 size={32} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1D1D1F] leading-none mb-4">
            Select Your <br />
            <span className="text-luminous-blue italic-serif lowercase">Foundation.</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto italic leading-relaxed">
            "You have multiple active entities currently under management. Please select the operational command center you wish to access."
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {llcs.map((llc, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={llc.id || idx}
              onClick={() => onSelect(llc)}
              className="bg-white/80 backdrop-blur-3xl p-8 rounded-[32px] border border-gray-100/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] cursor-pointer group hover:scale-[1.02] hover:shadow-[0_40px_80px_-20px_rgba(0,122,255,0.15)] hover:border-blue-100 transition-all duration-500 flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {llc.privacy_shield_active ? <ShieldCheck size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div className="px-3 py-1 bg-gray-100/50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {llc.llc_status || 'Active'}
                  </div>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-[#1D1D1F] mb-2 leading-tight">
                  {llc.llc_name}
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {llc.ein || 'EIN Pending'}
                </p>
              </div>

              <div className="pt-6 mt-auto flex items-center justify-between border-t border-gray-50 group-hover:border-blue-50 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                  Initialize Command
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white text-gray-400 transition-colors">
                  <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default BusinessSelector;
