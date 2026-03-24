import React from 'react';
import { Shield, ArrowRight, Zap, Globe, Lock } from 'lucide-react';
import { GlassCard } from '../../shared/design-system/UIPrimitives';

/**
 * LandingSector
 * The high-fidelity front-matter of the CharterLegacy experience.
 */
const LandingSector = ({ onStartCheckout, onEnterConsole }) => {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-white/10 selection:text-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center justify-between px-12 bg-gradient-to-b from-[#0A0A0B] to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black">
                        <Shield size={22} />
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase">Charter Legacy</span>
                </div>
                <div className="flex items-center gap-8">
                    <button 
                        onClick={onEnterConsole}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
                    >
                        Access Terminal
                    </button>
                    <button 
                        onClick={onStartCheckout}
                        className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                    >
                        Form LLC
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-12 flex flex-col items-center text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-white/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 space-y-8 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-in fade-in slide-in-from-top-4 duration-700">
                        <Zap size={12} className="text-amber-400" /> Version 5.0 — Sector Reset
                    </div>
                    
                    <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Florida LLC <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">Autonomous.</span>
                    </h1>
                    
                    <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto italic leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Instant formation. Zero-knowledge privacy. <br /> 
                        Your home address remains strictly off public record.
                    </p>

                    <div className="pt-8 flex items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <button 
                            onClick={onStartCheckout}
                            className="group flex items-center gap-4 bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                        >
                            Initialize Formation <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Matrix */}
            <section className="px-12 pb-48 grid md:grid-cols-3 gap-8">
                {[
                    { title: 'DeLand HUB', desc: 'Secure physical nexus for state compliance.', icon: Globe },
                    { title: 'Z-K Vault', desc: 'Encrypted document orchestration.', icon: Lock },
                    { title: 'Instant Pass', desc: 'Direct state filing via AEO Laboratory.', icon: Shield }
                ].map((f, i) => (
                    <GlassCard key={i} className="p-10 space-y-6 group hover:border-white/20 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-black transition-all">
                            <f.icon size={24} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter">{f.title}</h3>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                        </div>
                    </GlassCard>
                ))}
            </section>
        </div>
    );
};

export default LandingSector;
