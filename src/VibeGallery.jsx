import React, { useState } from 'react';
import { 
  Shield, PenTool, Layout, Layers, Box, 
  ChevronRight, ArrowRight, Anchor, MapPin, 
  Settings, Zap, Maximize2, Monitor
} from 'lucide-react';

const VibeGallery = ({ onSelectVibe }) => {
  const [activeVibe, setActiveVibe] = useState(null);

  const vibes = [
    {
      id: 'heritage',
      name: 'The Legacy Archive',
      tagline: 'Foundational Architecture',
      description: 'Trust built through precision and permanence. Reimagining company formation as a historical milestone.',
      colors: ['#F5F5ED', '#1A1A1A', '#8B0000'],
      tokens: {
        bg: '#F5F5ED',
        text: '#1A1A1A',
        accent: '#8B0000',
        font: 'serif',
        material: 'Parchment & Steel'
      },
      agentComment: "Mom: 'It feels solid and established, like a trust vault.'",
      previewStyles: "bg-[#F5F5ED] text-[#1D1D1F] border-amber-900/20 font-serif"
    },
    {
      id: 'cockpit',
      name: 'Corporate Cockpit',
      tagline: 'Command & Control',
      description: 'The pilot seat of your empire. Authority, precision, and haptic feedback.',
      colors: ['#0A0A0B', '#00D084', '#FFFFFF'],
      tokens: {
        bg: '#0A0A0B',
        text: '#FFFFFF',
        accent: '#00D084',
        font: 'sans-serif',
        material: 'Brushed Obsidian'
      },
      agentComment: "Steve: 'This is a high-performance machine.'",
      previewStyles: "bg-[#0A0A0B] text-white border-green-500/30"
    },
    {
      id: 'luminous',
      name: 'Florida Luminous',
      tagline: 'Refracting Privacy',
      description: 'Stark contrast meeting clinical elegance. Light-focused security.',
      colors: ['#FFFFFF', '#007AFF', '#E2E2E2'],
      tokens: {
        bg: '#FFFFFF',
        text: '#1D1D1F',
        accent: '#007AFF',
        font: 'sans-serif',
        material: 'Prismatic Glass'
      },
      agentComment: "Jony: 'Unapologetically bright and airy.'",
      previewStyles: "bg-white text-gray-900 border-blue-500/20 shadow-xl"
    },
    {
      id: 'stealth',
      name: 'Stealth Founder',
      tagline: 'The Invisibility Engine',
      description: 'Build in silence. Deep shadows, matte surfaces, and total discretion.',
      colors: ['#000000', '#4A4A4A', '#FFFFFF'],
      tokens: {
        bg: '#000000',
        text: '#FFFFFF',
        accent: '#4A4A4A',
        font: 'sans-serif',
        material: 'Matte Titanium'
      },
      agentComment: "Agent X: 'Confidentiality is the highest luxury.'",
      previewStyles: "bg-black text-white border-white/10"
    },
    {
      id: 'blueprint',
      name: 'The Blueprint',
      tagline: 'Business Engineering',
      description: 'Scientific precision in entity structure. Technical, clear, and foundational.',
      colors: ['#003366', '#FFFFFF', '#00D084'],
      tokens: {
        bg: '#003366',
        text: '#FFFFFF',
        accent: '#00D084',
        font: 'mono',
        material: 'Structural Schematic'
      },
      agentComment: "Steve: 'This makes the complex feel like a solved problem.'",
      previewStyles: "bg-[#003366] text-white border-white/30 font-mono"
    }
  ];

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-start p-10 overflow-y-auto scroller-zen">
      <div className="max-w-7xl w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20 border-b border-white/10 pb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-[#d4af37]">
              <Settings size={12} className="animate-spin-slow" /> Strategic Design Audit
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white">The Council <span className="text-gray-600">Moodboard.</span></h1>
            <p className="text-xl text-gray-400 font-medium italic max-w-2xl">
              Compare 5 distinct design languages for the Charter Legacy redesign. Click to "Step inside" each vibe.
            </p>
          </div>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-full hover:bg-[#d4af37] transition-all">
            Exit Preview
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {vibes.map((vibe) => (
            <div 
              key={vibe.id}
              onClick={() => setActiveVibe(vibe)}
              className={`group relative h-[600px] rounded-[40px] overflow-hidden border transition-all duration-700 cursor-pointer ${
                activeVibe?.id === vibe.id ? 'lg:col-span-2 border-[#d4af37]' : 'border-white/10 hover:border-white/30'
              }`}
            >
              {/* Vibe Material Preview (Simulated with Gradient) */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${vibe.previewStyles} flex flex-col p-8`}>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-12 opacity-40 uppercase font-black text-[8px] tracking-[0.4em]">
                  <span>Vibe.{vibe.id.toUpperCase()}</span>
                  <span>Proto_v4.0</span>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className={`text-4xl font-black uppercase tracking-tighter mb-2 leading-none`}>
                    {vibe.name}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-60 mb-6">{vibe.tagline}</p>
                  
                  {activeVibe?.id === vibe.id && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                      <p className="text-sm leading-relaxed opacity-80">{vibe.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-current/10">
                        <div>
                          <p className="text-[8px] uppercase tracking-widest opacity-40 mb-2">Materiality</p>
                          <p className="text-[10px] font-bold">{vibe.tokens.material}</p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-widest opacity-40 mb-2">Typography</p>
                          <p className="text-[10px] font-bold">{vibe.tokens.font}</p>
                        </div>
                      </div>

                      <div className="bg-current/5 border border-current/10 p-4 rounded-2xl italic text-[11px] leading-relaxed">
                        "{vibe.agentComment}"
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-auto pt-8 flex items-center justify-between border-t border-current/10">
                   <div className="flex gap-2">
                       {vibe.colors.map((c, i) => (
                           <div key={i} className="w-3 h-3 rounded-full border border-current/20" style={{ backgroundColor: c }}></div>
                       ))}
                   </div>
                   <div className="w-10 h-10 rounded-full bg-current text-current-inverse flex items-center justify-center filter invert">
                       <ArrowRight size={18} />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="mt-20 flex flex-col items-center gap-6">
           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Selected Strategy: <span className="text-white">{activeVibe ? activeVibe.name : 'Awaiting Decision'}</span></p>
           {activeVibe && (
             <button 
               onClick={() => onSelectVibe(activeVibe.id)}
               className="px-20 py-8 bg-[#d4af37] text-black font-black uppercase text-xl rounded-[40px] hover:bg-white hover:scale-105 transition-all shadow-[0_20px_50px_rgba(212,175,55,0.3)] flex items-center gap-4"
             >
               Commit to {activeVibe.name} <Zap size={24} />
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default VibeGallery;
