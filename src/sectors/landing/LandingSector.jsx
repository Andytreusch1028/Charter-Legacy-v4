import React, { useState } from 'react';
import { Shield, ArrowRight, Zap, Globe, Lock, Eye, EyeOff, Building2, Landmark, Check, ChevronDown, ChevronRight, Vault, Users, FileKey, Star, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { GlassCard } from '../../shared/design-system/UIPrimitives';
import DoubleLLCExplainer from '../../DoubleLLCExplainer';
import BackgroundEffects from '../../shared/design-system/BackgroundEffects';
import FilingLedger from './FilingLedger';

/**
 * LandingSector
 * The high-fidelity front-matter of the CharterLegacy experience.
 * 
 * Sections:
 *   1. Hero — Bold CTA with value proposition
 *   2. Features Matrix — Core capabilities
 *   3. Legacy Vault Showcase — Heritage protection value prop
 *   4. Double LLC Explainer — Privacy structure education
 *   5. Pricing Tiers — Privacy Shield ($249) & Double LLC ($999)
 *   6. FAQ — AEO-optimized expandable Q&A
 *   7. Footer — Links
 */
const LandingSector = ({ onStartCheckout, onEnterConsole }) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
    const [showDoubleLLC, setShowDoubleLLC] = useState(false);
    const [heroTypewriter, setHeroTypewriter] = useState('Autonomous.');


    // Typewriter effect for Steve Agent's technical transparency
    React.useEffect(() => {
        const phrases = ['Autonomous.', 'Zero-Knowledge.', 'Encrypted.'];
        let i = 0;
        const timer = setInterval(() => {
            i = (i + 1) % phrases.length;
            setHeroTypewriter(phrases[i]);
        }, 3000);
        return () => clearInterval(timer);
    }, []);



    return (
        <div className="relative min-h-screen bg-neutral-dark text-white selection:bg-white/10 selection:text-white overflow-x-hidden">
            <BackgroundEffects />
            
            {/* Double LLC Modal */}
            <DoubleLLCExplainer isOpen={showDoubleLLC} onClose={() => setShowDoubleLLC(false)} />

            {/* ═══════════════════════════════════════════
                NAVIGATION
            ═══════════════════════════════════════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center justify-between px-6 md:px-12 bg-gradient-to-b from-[#050506] via-[#050506]/90 to-transparent backdrop-blur-sm border-b border-white/[0.03]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        <Shield size={22} />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter uppercase block leading-none">Charter Legacy</span>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1 ml-0.5">Control Tower v4.5</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <button 
                        onClick={onEnterConsole}
                        className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all group"
                    >
                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-emerald-500 group-hover:shadow-[0_0_8px_#10b981] transition-all" />
                        Access Terminal
                    </button>
                    <button 
                        onClick={() => onStartCheckout('founder')}
                        className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/20"
                    >
                        Form LLC
                    </button>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════
                1. HERO SECTION
            ═══════════════════════════════════════════ */}
            <section className="relative pt-64 pb-32 px-6 md:px-12 flex flex-col items-center text-center">
                <div className="relative z-10 space-y-10 max-w-5xl">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 backdrop-blur-xl transition-all hover:border-white/20">
                        <Zap size={12} className="text-amber-400" /> 
                        <span>Florida's Privacy-First LLC Platform</span>
                        <div className="w-px h-3 bg-white/10 mx-1" />
                        <span className="animate-pulse text-emerald-500/80">LIVE_FORMATION_ACTIVE</span>
                    </div>
                    
                    <h1 className="text-[clamp(3.5rem,15vw,10.5rem)] font-black uppercase tracking-tighter leading-[0.8]">
                        Florida LLC <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-400 to-gray-200 animate-in fade-in duration-1000">
                            {heroTypewriter}
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto italic leading-relaxed">
                        A zero-knowledge holding company structure for founders who value privacy. Complete Florida and Wyoming synchronized protection.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
                        <button 
                            onClick={() => onStartCheckout('founder')}
                            className="group flex items-center gap-6 bg-white text-black px-12 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
                        >
                            Initialize Formation <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setShowDoubleLLC(true)}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors underline underline-offset-8 decoration-white/10 hover:decoration-white/40"
                        >
                            What is a Double LLC?
                        </button>
                        <button 
                            onClick={() => setShowPrivacy(true)}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors underline underline-offset-8 decoration-white/10 hover:decoration-white/40"
                        >
                            Get Full Privacy
                        </button>
                    </div>
                </div>

                <div className="mt-32 w-full max-w-6xl mx-auto z-10">
                    <FilingLedger />
                </div>
                {showPrivacy && (
                  <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#0A0A0B] rounded-2xl p-8 max-w-md text-center">
                      <h3 className="text-xl font-black uppercase mb-4">Full Privacy</h3>
                      <p className="text-gray-400 mb-6">
                        Charter Legacy uses zero‑knowledge architecture. Your documents never leave your browser unencrypted, and we never store your personal address. You remain fully anonymous.
                      </p>
                      <button
                        onClick={() => setShowPrivacy(false)}
                        className="mt-4 px-6 py-2 bg-white text-black rounded font-black uppercase"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
            </section>

            {/* ═══════════════════════════════════════════
                2. FEATURES MATRIX
            ═══════════════════════════════════════════ */}
            <section className="px-6 md:px-12 pb-32 grid md:grid-cols-3 gap-6 md:gap-8">
                {[
                    { title: 'DeLand Hub', desc: 'Secure physical nexus for state compliance. Your registered agent address on every filing.', icon: Globe },
                    { title: 'Z-K Vault', desc: 'Encrypted document orchestration with zero-knowledge architecture. Only you hold the key.', icon: Lock },
                    { title: 'Instant Filing', desc: 'Same-day electronic submission to the Florida Division of Corporations via Sunbiz.', icon: Shield }
                ].map((f, i) => (
                    <GlassCard key={i} className="p-8 md:p-10 space-y-6 group hover:border-white/20 transition-all">
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

            {/* ═══════════════════════════════════════════
                3. LEGACY VAULT SHOWCASE
            ═══════════════════════════════════════════ */}
            <section className="relative px-6 md:px-12 py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D0F] to-transparent" />
                <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-transparent rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
                
                <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                            <Vault size={12} /> Legacy Vault
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                            Your Business <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Heritage.</span>
                        </h2>

                        <p className="text-gray-400 text-base leading-relaxed font-medium">
                            The Legacy Vault is more than document storage — it's your encrypted business continuity system.
                            Store formation documents, operating agreements, and succession protocols in a zero-knowledge vault 
                            that only you can access.
                        </p>

                        <ul className="space-y-4">
                            {[
                                '256-bit AES zero-knowledge encryption',
                                'Succession protocols that bypass probate',
                                'Encrypted video messages for your heirs',
                                'Physical document location mapping',
                                'Immutable audit trail for every action'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Check size={12} className="text-amber-400" />
                                    </div>
                                    <span className="text-sm text-gray-300 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative">
                        <GlassCard className="p-8 space-y-6 border-amber-500/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                        <Lock size={16} className="text-amber-400" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Encrypted Vault</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Secured</span>
                                </div>
                            </div>
                            
                            {[
                                { name: 'Articles_of_Organization.pdf', date: 'Oct 20, 2024', size: '892 KB' },
                                { name: 'Operating_Agreement.pdf', date: 'Oct 24, 2024', size: '2.4 MB' },
                                { name: 'EIN_Confirmation.pdf', date: 'Oct 24, 2024', size: '156 KB' },
                                { name: 'AEO_Succession_Protocol.pdf', date: 'Nov 15, 2024', size: '1.2 MB' },
                            ].map((doc, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group">
                                    <div className="flex items-center gap-3">
                                        <FileKey size={16} className="text-gray-600 group-hover:text-amber-400 transition-colors" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{doc.name}</p>
                                            <p className="text-[10px] text-gray-600">{doc.date} · {doc.size}</p>
                                        </div>
                                    </div>
                                    <EyeOff size={14} className="text-gray-700" />
                                </div>
                            ))}

                            <div className="pt-4 border-t border-white/5 text-center">
                                <p className="text-[10px] text-gray-600 font-medium">
                                    <Lock size={10} className="inline mr-1" />
                                    Zero-knowledge — CharterLegacy cannot read your documents
                                </p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                4. DOUBLE LLC SECTION
            ═══════════════════════════════════════════ */}
            <section className="px-6 md:px-12 py-32 relative overflow-hidden">
                <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-l from-emerald-500/5 to-transparent rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

                <div className="relative z-10 max-w-6xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <Shield size={12} /> Advanced Privacy
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                            The Double LLC
                        </h2>
                        <p className="text-gray-500 text-base font-medium max-w-2xl mx-auto leading-relaxed">
                            Florida requires a human name on every LLC filing. The Double LLC structure eliminates this exposure 
                            by layering a Wyoming holding company between you and the public record.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <GlassCard className="p-8 space-y-6 border-red-500/10 hover:border-red-500/20">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">
                                <Eye size={12} /> The Problem
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Single LLC</h3>
                            <div className="bg-[#121212] rounded-2xl p-5 border border-gray-800 font-mono text-sm space-y-2">
                                <div className="flex justify-between"><span className="text-gray-500">Entity:</span><span className="text-white">Your Business LLC</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Agent:</span><span className="text-gray-400">✅ Hidden (RA Service)</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Manager:</span><span className="text-red-400 font-bold">❌ JOHN DOE</span></div>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Your registered agent hides your address — but your <span className="text-red-400 font-bold">personal name</span> remains on the Sunbiz public record, searchable by anyone.
                            </p>
                        </GlassCard>

                        <GlassCard className="p-8 space-y-6 border-emerald-500/10 hover:border-emerald-500/20">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                                <EyeOff size={12} /> The Solution
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Double LLC</h3>
                            <div className="bg-[#121212] rounded-2xl p-5 border border-gray-800 font-mono text-sm space-y-2">
                                <div className="flex justify-between"><span className="text-gray-500">Entity:</span><span className="text-white">Your Business LLC</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Agent:</span><span className="text-gray-400">✅ Hidden (RA Service)</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Manager:</span><span className="text-emerald-400 font-bold">✅ WY Holdings LLC</span></div>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                A Wyoming holding company is listed as the manager. Wyoming does <span className="text-emerald-400 font-bold">NOT</span> require owner names on filings. Your identity is completely shielded.
                            </p>
                        </GlassCard>
                    </div>

                    <div className="text-center mt-12">
                        <button 
                            onClick={() => setShowDoubleLLC(true)}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 hover:text-white transition-colors underline underline-offset-4 decoration-emerald-400/30 hover:decoration-white flex items-center gap-2 mx-auto"
                        >
                            See How It Works in Detail <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
                5. PRICING TIERS
            ═══════════════════════════════════════════ */}
            <section className="px-6 md:px-12 py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D0F] to-transparent" />
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Choose Your Shield</h2>
                        <p className="text-gray-500 text-base font-medium">All plans include electronic filing, registered agent service, and encrypted vault access.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <GlassCard className="p-8 md:p-10 space-y-8 hover:border-white/20 flex flex-col">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Privacy Shield</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Standard Florida LLC formation with registered agent service. Your home address stays off public record.
                                </p>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black text-white">$249</span>
                                <span className="text-gray-500 font-bold mb-2">one-time</span>
                            </div>
                            <ul className="space-y-3 flex-1">
                                {[
                                    'Florida LLC Formation',
                                    'Registered Agent Service (1 Year)',
                                    'Legacy Vault Access (Encrypted Storage)',
                                    'Compliance Pulse Monitoring'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400 font-medium">
                                        <Check size={14} className="text-white mt-0.5 flex-shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={() => onStartCheckout('founder')}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
                            >
                                Start Formation
                            </button>
                        </GlassCard>

                        {/* Double LLC */}
                        <div className="relative">
                            <div className="absolute -inset-[1px] rounded-[33px] bg-gradient-to-b from-white/20 to-white/5 pointer-events-none" />
                            <GlassCard className="p-8 md:p-10 space-y-8 relative border-white/20 flex flex-col">
                                <div className="absolute top-4 right-4 px-3 py-1 bg-white text-black rounded-full text-[9px] font-black uppercase tracking-widest">
                                    Most Popular
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Double LLC</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                        The full anonymity structure — Florida + Wyoming holding company. Your name never touches the public record.
                                    </p>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black text-white">$999</span>
                                    <span className="text-gray-500 font-bold mb-2">one-time</span>
                                </div>
                                <button 
                                    onClick={() => onStartCheckout('sovereign')}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
                                >
                                    Start Formation
                                </button>
                                <ul className="space-y-3 flex-1">
                                    {[
                                        'Everything in Privacy Shield',
                                        'Wyoming Holding LLC Formation',
                                        'Full Name Privacy (No Public Exposure)',
                                        'Inter-Company Operating Agreement',
                                        'Wyoming Registered Agent (1 Year)',
                                        'Priority Processing (48hr)',
                                        'AEO Succession Protocol Access'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-400 font-medium">
                                            <Check size={14} className="text-white mt-0.5 flex-shrink-0" /> {item}
                                        </li>
                                    ))}
                                </ul>
                                
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                7. FOOTER
            ═══════════════════════════════════════════ */}
            <footer className="px-6 md:px-12 py-16 border-t border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        {/* Brand */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black">
                                    <Shield size={22} />
                                </div>
                                <span className="font-black text-xl tracking-tighter uppercase">Charter Legacy</span>
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm">
                                Premium business formation and privacy infrastructure for modern entrepreneurs.
                            </p>
                            <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <MapPin size={12} /> DeLand, FL
                                </div>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Services</h4>
                            <ul className="space-y-3">
                                {['LLC Formation', 'Registered Agent', 'Double LLC', 'Legacy Vault'].map(link => (
                                    <li key={link}>
                                        <span className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer font-medium">{link}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Account</h4>
                            <ul className="space-y-3">
                                {[
                                    { label: 'Client Dashboard', action: onEnterConsole },
                                    { label: 'Staff Portal', action: null },
                                ].map((link, i) => (
                                    <li key={i}>
                                        <span 
                                            onClick={link.action}
                                            className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer font-medium"
                                        >{link.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-[10px] text-gray-600 font-medium max-w-xl leading-relaxed">
                            <span className="font-bold text-gray-500 uppercase">UPL Disclosure:</span> CharterLegacy is a document preparation and filing service. We do not practice law, provide legal advice, or establish attorney-client relationships. For specific legal guidance, please consult a licensed attorney in your jurisdiction.
                        </p>
                        <p className="text-[10px] text-gray-600 font-medium">
                            © {new Date().getFullYear()} CharterLegacy. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingSector;
