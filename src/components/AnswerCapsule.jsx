import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles } from 'lucide-react';

const AnswerCapsule = () => {
  const location = useLocation();
  const [capsule, setCapsule] = useState(null);

  useEffect(() => {
    const fetchCapsule = async () => {
      const { data } = await supabase
        .from('seo_discoverability')
        .select('answer_capsule, answer_capsule_b')
        .eq('route', location.pathname)
        .maybeSingle();

      const variation = localStorage.getItem('seo_variation') || 'A';
      
      if (variation === 'B' && data?.answer_capsule_b) {
        setCapsule(data.answer_capsule_b);
      } else if (data?.answer_capsule) {
        setCapsule(data.answer_capsule);
      } else {
        setCapsule(null);
      }
    };
    fetchCapsule();
  }, [location.pathname]);

  if (!capsule) return null;

  return (
    <div className="max-w-5xl mx-auto my-16 px-6 relative z-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="bg-[#1D1D1F] rounded-[32px] p-8 md:p-10 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-luminous-blue/20 blur-[100px] rounded-full group-hover:bg-luminous-blue/30 transition-all duration-1000 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex items-start md:items-center flex-col md:flex-row gap-6 md:gap-8 text-white relative z-10">
           <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-luminous-blue shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700">
              <Sparkles size={24} />
           </div>
           <div className="flex-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2 md:mb-3">Quick Answer</h2>
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-white/90">
                "{capsule}"
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCapsule;
