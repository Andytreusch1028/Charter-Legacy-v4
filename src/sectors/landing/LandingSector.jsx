import React, { useState } from 'react';
import { 
    Shield, 
    ArrowRight, 
    Globe, 
    Lock, 
    Zap, 
    Check, 
    Eye, 
    EyeOff, 
    Vault, 
    FileKey, 
    MapPin,
    ChevronRight,
    Search,
    AlertCircle,
    Info
} from 'lucide-react';
import { GlassCard } from '../../shared/design-system/UIPrimitives';
import FilingLedger from './FilingLedger';
import DoubleLLCExplainerModal from '../../DoubleLLCExplainer';
import FounderShieldExplainer from '../../FounderShieldExplainer';



// ═══════════════════════════════════════════
//   BACKGROUND EFFECTS
// ═══════════════════════════════════════════
const BackgroundEffects = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-white/[0.03] rounded-full blur-[150px] animate-mesh-drift" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/[0.02] rounded-full blur-[120px] animate-mesh-drift [animation-delay:2s]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
    </div>
);

const LandingSector = ({ onEnterConsole, onStartCheckout }) => {
    const [heroTypewriter, setHeroTypewriter] = useState('Private.');
    const [showDoubleLLC, setShowDoubleLLC] = useState(false);
    const [showFounderShield, setShowFounderShield] = useState(false);

    // Typewriter effect for simple, direct value props
    React.useEffect(() => {
        const phrases = ['Private.', 'Secure.', 'Simple.'];
        let i = 0;
        const timer = setInterval(() => {
            i = (i + 1) % phrases.length;
            setHeroTypewriter(phrases[i]);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-neutral-dark text-white selection:bg-white/10 selection:text-white overflow-x-hidden pt-24">
            <BackgroundEffects />
            <DoubleLLCExplainerModal isOpen={showDoubleLLC} onClose={() => setShowDoubleLLC(false)} onSelect={onStartCheckout} />
            <FounderShieldExplainer isOpen={showFounderShield} onClose={() => setShowFounderShield(false)} onSelect={onStartCheckout} />

            {/* NAVIGATION */}
            <nav className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center justify-between px-6 md:px-12 ive-glass border-b border-white/[0.05] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-all duration-500">
                        <Shield size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-2xl tracking-tighter uppercase block leading-none text-glow-premium">Charter Legacy</span>
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] mt-1.5 flex items-center gap-1.5">
                          <span>simple</span>
                          <div className="w-1 h-1 bg-white/[0.05] rounded-full" />
                          <span>private</span>
                          <div className="w-1 h-1 bg-white/[0.05] rounded-full" />
                          <span>secure</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <button 
                        onClick={onEnterConsole}
                        className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-all group"
                    >
                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-emerald-500 group-hover:shadow-[0_0_8px_#10b981] transition-all" />
                        Client Login
                    </button>
                    <button 
                        onClick={() => onStartCheckout('unselected')}
                        className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/20"
                    >
                        Start Your LLC
                    </button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-32 px-6 md:px-12 flex flex-col items-center text-center">
                <div className="relative z-10 space-y-10 max-w-5xl">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 backdrop-blur-xl transition-all hover:border-white/20">
                        <Zap size={12} className="text-amber-400" /> 
                        <span>Florida's Privacy-First LLC Platform</span>
                        <div className="w-px h-3 bg-white/10 mx-1" />
                        <span className="animate-pulse text-emerald-500/80">LIVE_SETUP_ACTIVE</span>
                    </div>
                    
                    <h1 className="text-[clamp(3.5rem,12vw,10rem)] font-black uppercase tracking-tighter leading-[0.8] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Florida LLC <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/40 drop-shadow-2xl">
                            {heroTypewriter}
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-white/40 font-medium max-w-2xl mx-auto italic leading-relaxed animate-in fade-in duration-1000 delay-300">
                        "Charter Legacy kept my business trouble exactly where it belongs: <span className="text-white/60 not-italic uppercase tracking-tighter">Away from my family's front door.</span>"
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
                        <button 
                            onClick={() => onStartCheckout('unselected')}
                            className="group flex items-center gap-6 bg-white text-black px-12 py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
                        >
                            Start Your LLC <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <button 
                            onClick={() => setShowDoubleLLC(true)}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors underline underline-offset-8 decoration-white/10 hover:decoration-white/40"
                        >
                            Hide Your Name on Record
                        </button>
                    </div>
                </div>

                <div className="mt-32 w-full max-w-6xl mx-auto z-10">
                    <FilingLedger />
                </div>
            </section>

            {/* FEATURES MATRIX */}
            <section className="px-6 md:px-12 pb-32 grid md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto relative z-10">
                {[
                    { title: 'Business Office', desc: 'A professional Florida address for state records. We receive your legal mail so you don\'t have to.', icon: Globe },
                    { title: 'Secure Vault', desc: 'Private encryption protects your documents. Only you hold the access keys.', icon: Lock },
                    { title: 'Same-Day Setup', desc: 'We submit your paperwork immediately to the Florida Division of Corporations.', icon: Shield }
                ].map((f, i) => (
                    <GlassCard key={i} variant="premium" className="p-8 md:p-10 space-y-6 group animate-shine">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black transition-all duration-700 shadow-inner">
                            <f.icon size={28} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-glow-premium">{f.title}</h3>
                            <p className="text-sm text-white/40 font-medium leading-relaxed">{f.desc}</p>
                        </div>
                    </GlassCard>
                ))}
            </section>

            {/* VAULT SECTION */}
            <section className="relative px-6 md:px-12 py-32 overflow-hidden border-y border-white/[0.03] bg-white/[0.01]">
                <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                            <Vault size={12} /> Private Vault
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                            Protect Your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Business Legacy.</span>
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed font-medium">
                            Our Vault is more than just storage — it's your business safety net. Keep your setup papers and handover plans in a private space that only you can ever see.
                        </p>
                        <ul className="space-y-4">
                            {[
                                'Secure private encryption',
                                'Automatic handover plans for your family',
                                'Secure video messages for your heirs',
                                'Simple maps for your physical papers',
                                'Permanent records of every update'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <Check size={14} className="text-amber-400 mt-1 flex-shrink-0" />
                                    <span className="text-sm text-gray-300 font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <GlassCard variant="glass" className="p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-2">
                                    <Lock size={16} className="text-amber-400" />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Private Vault Content</span>
                                </div>
                                <span className="text-[9px] font-black uppercase text-emerald-400">● Secured</span>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: 'Setup_Documents.pdf', date: 'Oct 20, 2024' },
                                    { name: 'Operating_Agreement.pdf', date: 'Oct 24, 2024' },
                                    { name: 'Tax_ID_Confirmation.pdf', date: 'Oct 24, 2024' },
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <FileKey size={14} className="text-gray-600" />
                                            <span className="text-sm font-bold text-gray-300">{doc.name}</span>
                                        </div>
                                        <EyeOff size={14} className="text-gray-700" />
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* DOUBLE LLC SECTION */}
            <section className="px-6 md:px-12 py-32 max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                        <Shield size={12} /> Complete Privacy
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Advanced Identity Protection</h2>
                    <p className="text-gray-500 text-base font-medium max-w-2xl mx-auto">
                        Florida usually requires your personal name on public records. Our "Formation Elite" structure keeps your identity private by using a Wyoming company to hold your Florida business.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <GlassCard variant="glass" className="p-8 space-y-6">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Formation Core</h3>
                        <div className="space-y-2 font-mono text-xs p-4 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex justify-between text-gray-500"><span>Business:</span><span>Your Business LLC</span></div>
                            <div className="flex justify-between text-gray-500"><span>Owner Name:</span><span className="text-red-400 font-bold">❌ PUBLICLY VISIBLE</span></div>
                        </div>
                        <p className="text-sm text-gray-400">Most services hide your address but your real name still appears on state records for anyone to find.</p>
                    </GlassCard>
                    <GlassCard variant="glass" className="p-8 space-y-6">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Formation Elite</h3>
                        <div className="space-y-2 font-mono text-xs p-4 bg-black/40 rounded-xl border border-white/5">
                            <div className="flex justify-between text-gray-500"><span>Business:</span><span>Your Business LLC</span></div>
                            <div className="flex justify-between text-gray-500"><span>Owner Name:</span><span className="text-emerald-400 font-bold">✅ COMPLETELY PRIVATE</span></div>
                        </div>
                        <p className="text-sm text-gray-400">We use a Wyoming company as the owner. Wyoming does not require names on record. You gain total anonymity.</p>
                    </GlassCard>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section className="px-6 md:px-12 py-32 bg-white/[0.01] border-t border-white/[0.03]">
                <div className="max-w-5xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Simple Pricing</h2>
                        <p className="text-gray-500 text-base">All plans include state filing, professional address service, and vault access.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-10">
                        <GlassCard variant="premium" className="p-12 space-y-10 border-white/5">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Standard Tier</span>
                                <h3 className="text-3xl font-black uppercase tracking-tighter">Formation Core</h3>
                            </div>
                            <div className="flex items-end gap-2 text-white">
                                <span className="text-6xl font-black tracking-tighter">$399</span>
                                <span className="text-white/20 font-bold mb-2 uppercase text-[10px] tracking-widest">Protocol Fee</span>
                            </div>
                            <ul className="space-y-4">
                                {['Florida LLC Setup', 'Business Address (1 Yr)', 'Operating Agreement', 'Tax ID (EIN) Aid', 'Private Vault'].map(i => (
                                    <li key={i} className="flex gap-4 text-sm text-white/40 font-medium"><Check size={16} className="text-emerald-500 mt-0.5"/> {i}</li>
                                ))}
                            </ul>
                            
                            <div className="flex flex-col gap-4 pt-4">
                                <button onClick={() => onStartCheckout('founder')} className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-700">Initialize Formation</button>
                                <button 
                                    onClick={() => setShowFounderShield(true)}
                                    className="flex items-center justify-center gap-2 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[0.3em] transition-colors"
                                >
                                    More Information <ChevronRight size={14} />
                                </button>
                            </div>
                        </GlassCard>

                        <div className="relative group">
                            <div className="absolute -inset-[2px] bg-gradient-to-b from-emerald-500/20 to-transparent rounded-[34px] blur-sm transition-all group-hover:from-emerald-500/40" />
                            <GlassCard variant="premium" className="p-12 space-y-10 relative border-emerald-500/20 bg-emerald-500/[0.02]">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/50">Elite Tier</span>
                                    <h3 className="text-3xl font-black uppercase tracking-tighter text-emerald-400">Formation Elite</h3>
                                </div>
                                <div className="flex items-end gap-2 text-white">
                                    <span className="text-6xl font-black tracking-tighter text-glow-premium">$999</span>
                                    <span className="text-white/20 font-bold mb-2 uppercase text-[10px] tracking-widest">Sovereign Fee</span>
                                </div>
                                <ul className="space-y-4">
                                    {['Everything in Basic', 'Wyoming Parent Company', 'Total Name Privacy', 'Advanced Agreements', 'Family Handover Plan'].map(i => (
                                        <li key={i} className="flex gap-4 text-sm text-white/60 font-medium"><Check size={16} className="text-emerald-500 mt-0.5"/> {i}</li>
                                    ))}
                                </ul>

                                <div className="flex flex-col gap-4 pt-4">
                                    <button onClick={() => onStartCheckout('sovereign')} className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-700">Protect My Identity</button>
                                    <button 
                                        onClick={() => setShowDoubleLLC(true)}
                                        className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-500/30 hover:text-emerald-400 uppercase tracking-[0.3em] transition-colors"
                                    >
                                        More Information <ChevronRight size={14} />
                                    </button>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="px-6 md:px-12 py-24 border-t border-white/[0.03]">
                <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-12 text-center md:text-left">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <Shield size={24} className="text-white" />
                            <span className="font-black text-2xl uppercase tracking-tighter">Charter Legacy</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto md:mx-0">Premium Florida LLC formation with absolute privacy. Built for founders who value anonymity.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600">Explore</h4>
                        <ul className="space-y-2 text-sm text-gray-500 font-medium">
                            <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Formation Elite</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Privacy Guide</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-600">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-500 font-medium">
                            <li className="hover:text-white transition-colors cursor-pointer" onClick={onEnterConsole}>Client Dashboard</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">© 2024 Charter Legacy • Florida Compliance Hub</p>
                    <p className="text-[9px] font-medium text-gray-600 max-w-md text-center md:text-right">Charter Legacy is a document preparation service. We are not attorneys and do not provide legal advice.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingSector;
