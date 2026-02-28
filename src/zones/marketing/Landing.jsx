import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Shield, ArrowRight, Lock, Zap, CheckCircle2, Fingerprint, 
  ChevronRight, X, Building2, Plus, Anchor, ChevronDown, Minus,
  History, Settings, HeartPulse, ShieldCheck, Menu, Brain, Check, Star, CreditCard, Loader2, Mail, Box, Wind,
  FileCode, MessageSquare, Clock, FileText, Activity, Landmark, Users
} from 'lucide-react';
import FoundersBlueprint from '../../FoundersBlueprint';
import DesignationProtocol from '../../DesignationProtocol';
import LoginModal from '../../LoginModal';
import ZenithDialog from '../../ZenithDialog';
import RegisteredAgentConsole from '../../RegisteredAgentConsole';
import SpecSheet from '../../SpecSheet';
import DoubleLLCExplainer from '../../DoubleLLCExplainer';
import PlanManager from '../../components/PlanManager';
import { useHeroVariant } from '../../hooks/useHeroVariant';
import { useNavigate } from 'react-router-dom';

/**
 * CHARTER LEGACY v3.1.0 // THE "RULE OF THREE" REVERSION
 * - RESTORED: "Rule of Three" Package Model (Shield, Professional, Will).
 * - RESTORED: "Folklore" Client Statement.
 * - RETAINED: 10/10 Glassmorphism & Micro-interactions.
 * - REMOVED: Complex Discovery Engine & A/B Testing noise.
 */

// --- SUB-COMPONENTS ---

const DesignAgentNote = ({ agent, note }) => (
  <div className="flex gap-4 p-6 bg-white/40 rounded-3xl border border-white/60 backdrop-blur-md shadow-sm">
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-10 h-10 rounded-full bg-luminous-ink text-white flex items-center justify-center font-black text-xs">
        {agent[0]}
      </div>
      <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">{agent}</span>
    </div>
    <p className="text-[11px] font-medium text-gray-600 italic leading-relaxed">"{note}"</p>
  </div>
);


// ─── NAME SHIELD — Waitlist Component ────────────────────────────────────────
// Not yet live. Captures early-access signups.
// Backed by: name_shield_waitlist table in Supabase.
// Launch target: when B2B API agreement with OneRep or DeleteMe is signed.

const NameShield = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'What is a data broker site?',
      a: 'Sites like Spokeo, Whitepages, BeenVerified, Intelius, and about 400 others collect your personal information and sell it to anyone who pays — employers, marketers, debt collectors, even strangers. They don\'t ask your permission because they don\'t have to.'
    },
    {
      q: 'Where do they get my information?',
      a: 'They pull from voter registration records, property tax records, court filings, motor vehicle records, changes-of-address, social media profiles, online purchase history, credit header data, and other data brokers. It\'s all technically "public" — which is why they can do it legally.'
    },
    {
      q: 'What exactly does Name Shield remove?',
      a: 'Your name, home address, phone number, relatives list, estimated income, and physical description from 200+ people-search and data broker databases. We submit opt-out requests on your behalf and monitor for re-listing on an ongoing basis.'
    },
    {
      q: 'How long does removal take?',
      a: 'Initial removals take 3–30 days depending on the site. Some comply within hours; others batch-process monthly. We start the first wave immediately on signup and report progress in your dashboard within 14 days.'
    },
    {
      q: 'Why does it need to be annual?',
      a: 'Because the data comes back. Brokers continuously refresh from new public record filings, credit header updates, and partner feeds. Without ongoing monitoring, removed listings reappear — sometimes within 90 days. The annual subscription covers continuous re-suppression.'
    },
    {
      q: 'What does Name Shield NOT do?',
      a: 'It cannot remove you from government records (Sunbiz, court filings, voter rolls — those are public law and cannot be opted out of). It cannot remove social media profiles you control. It does not prevent new information from entering the public record in the future — only from propagating through broker networks.'
    }
  ];

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const { error } = await supabase
        .from('name_shield_waitlist')
        .insert({ email, signed_up_at: new Date().toISOString(), source: 'landing_page' });
      if (error && !error.message.includes('duplicate')) throw error;
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('[NameShield Waitlist]', err.message);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-16 rounded-[40px] overflow-hidden bg-[#0A0A0B] border border-white/10 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="px-10 py-14 md:px-16 relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Coming Soon · Join the Waitlist</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
            NAME<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Shield.</span>
          </h2>
          <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-2xl">
            Your home address is off Sunbiz. Your name is still on 200+ other sites — 
            Spokeo, Whitepages, BeenVerified, and hundreds more. Name Shield removes it and keeps it off.
          </p>
        </div>

        {/* Three-column truth grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              label: 'What It Does',
              color: 'text-emerald-400',
              border: 'border-emerald-500/20',
              bg: 'bg-emerald-500/5',
              items: [
                'Removes your name from 200+ people-search databases',
                'Submits opt-out requests to each site individually',
                'Monitors for re-listing every 90 days',
                'Reports progress in your dashboard within 14 days',
                '$99/yr — all sites included, no per-site fees'
              ]
            },
            {
              label: 'What It Does Not Do',
              color: 'text-red-400',
              border: 'border-red-500/20',
              bg: 'bg-red-500/5',
              items: [
                'Cannot remove your name from Sunbiz or state records (use Double LLC for that)',
                'Cannot remove court filings, voter registration, or government records',
                'Cannot remove social media profiles you created',
                'Cannot prevent future listings if new public records are filed',
                'Does not provide legal anonymity'
              ]
            },
            {
              label: 'How Data Gets There',
              color: 'text-blue-400',
              border: 'border-blue-500/20',
              bg: 'bg-blue-500/5',
              items: [
                'Voter registration rolls (public in most states)',
                'Property tax and deed records',
                'Motor vehicle registrations',
                'Court filings and bankruptcy records',
                'Social media scrapes and purchase history sold by retailers'
              ]
            }
          ].map((col, i) => (
            <div key={i} className={`p-8 rounded-[32px] border ${col.border} ${col.bg}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${col.color} mb-6`}>{col.label}</p>
              <ul className="space-y-3">
                {col.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className={`w-1 h-1 rounded-full mt-2 shrink-0 ${col.color.replace('text-', 'bg-')}`} />
                    <span className="text-[11px] text-gray-400 font-medium leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pricing clarity */}
        <div className="flex items-center gap-6 mb-16 p-6 bg-white/5 rounded-2xl border border-white/10 max-w-xl">
          <div>
            <p className="text-4xl font-black text-white">$99<span className="text-xl text-gray-500 font-bold">/yr</span></p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Launch Price · Lock It In When You Join</p>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <p className="text-xs text-gray-400 font-medium leading-relaxed">
            Covers 200+ broker sites. No per-site fees. Annual monitoring and re-suppression included. Cancel anytime.
          </p>
        </div>

        {/* Waitlist form */}
        <div className="max-w-xl mb-20">
          {status === 'success' ? (
            <div className="flex items-center gap-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-black text-white">You're on the list.</p>
                <p className="text-xs text-gray-400 mt-0.5">We'll contact you when Name Shield launches. Early access gets the $99/yr lock-in rate.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-11 pr-4 text-white text-sm font-medium placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/30 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-amber-400 text-black px-7 py-4 rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-amber-300 active:scale-95 transition-all shrink-0 flex items-center gap-2 disabled:opacity-60"
              >
                {status === 'loading' ? 'Saving...' : <>Join Waitlist <ArrowRight size={14} /></>}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-xs font-bold mt-3">Something went wrong. Try again or email us directly.</p>
          )}
          <p className="text-[10px] text-gray-600 font-medium mt-4">
            No payment collected now. Waitlist is free. We'll email you when we're ready to launch and you can decide then.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-6">Common Questions</p>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-bold text-white pr-4">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-gray-400 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const HeritageVault = ({ willPackage, handleSelection }) => {
  const [activeItem, setActiveItem] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  const protocols = [
    { 
      label: 'Who Gets Your Business', 
      desc: 'Name the person who receives your business when you pass. We capture that in a legally formatted Transfer on Death (TOD) document — not a will, not a trust.'
    },
    { 
      label: 'Transfers Outside of Court', 
      desc: 'The document is designed to allow your LLC ownership to pass directly to your chosen person — without a probate proceeding, public court filing, or attorney involvement at the point of transfer.'
    },
    { 
      label: 'Your Document is Sealed on Record', 
      desc: 'Your designation is finalized with your e-signature and stored in your Heritage Vault. Every access, update, or download is permanently logged so there is never a dispute about what was on file.'
    },
    { 
      label: 'Annual Check-In Included', 
      desc: 'Life changes. Each year we prompt you to review and re-confirm your successor — so if your relationship, ownership split, or wishes change, your plan stays current.'
    }
  ];

  const vaultFeatures = [
    { name: 'Transfer on Death Document (TOD)', desc: 'A Florida-compliant document designating who receives your business ownership when you pass — drafted, sealed, and stored in your Heritage Vault.' },
    { name: 'Sealed & E-Signed Record', desc: 'Your designation is e-signed, assigned a unique ID, and stored permanently so there is never a dispute about what was on file.' },
    { name: 'Transfers Outside of Court', desc: 'Designed to allow your chosen person to receive your business directly — without a probate proceeding or public court filing.' },
    { name: 'Permanent Record of Your Designation', desc: 'Every action in your vault — access, updates, downloads — is recorded in a tamper-proof log available to you at any time.' },
    { name: 'Annual Check-In Included', desc: 'Each year we prompt you to review and re-confirm your successor so your plan always reflects your current wishes.' }
  ];

  return (
    <section id="protocol" className="py-40 px-6 bg-[#F5F5F7] relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,#FFFFFF_0%,transparent_100%)] opacity-60" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.12)] border border-gray-100 p-12 md:p-20 relative overflow-hidden group/window">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12 relative z-10">
                 <div className="space-y-8">
                    <div className="inline-flex items-center gap-3 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
                       <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                       LLC Succession · Designed to Transfer Outside of Court
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-black">
                       PROTECT <br/>
                       <span className="text-blue-600 underline decoration-4 decoration-blue-100 underline-offset-8">YOUR LLC.</span>
                    </h2>
                    <div className="space-y-6">
                       <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-md italic">
                         <strong className="text-white not-italic block mb-2 text-sm tracking-widest uppercase">The 90-Day Succession Gap</strong>
                         In Florida, the death of a single-member LLC owner can leave a business without legal leadership. If a successor isn't legally appointed within 90 days, the state may administratively dissolve the LLC.
                       </p>
                       <p className="text-sm font-bold tracking-widest text-blue-500 uppercase">
                         We integrate a Transfer-on-Death designation from day one so your business transitions automatically—without court delays.
                       </p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    {protocols.map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => setActiveItem(i === activeItem ? null : i)}
                        className={`overflow-hidden transition-all duration-500 cursor-pointer rounded-2xl border ${
                          activeItem === i 
                            ? 'bg-blue-600 border-blue-600 shadow-xl scale-[1.02]' 
                            : 'bg-gray-50/80 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                         <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                 activeItem === i ? 'bg-white text-blue-600' : 'bg-blue-600/10 text-blue-600'
                               }`}>
                                  <Check size={12} strokeWidth={4} />
                               </div>
                               <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                 activeItem === i ? 'text-white' : 'text-gray-600'
                               }`}>{item.label}</span>
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-500 ${
                              activeItem === i ? 'text-white rotate-180' : 'text-gray-300'
                            }`} />
                         </div>
                         <div className={`transition-all duration-500 ease-in-out ${
                           activeItem === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                         }`}>
                            <div className="px-14 pb-5">
                               <p className={`text-[11px] leading-relaxed font-medium transition-colors ${
                                 activeItem === i ? 'text-white/80' : 'text-gray-500'
                               }`}>
                                  {item.desc}
                               </p>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>

                 <button onClick={() => handleSelection(willPackage)} className="group bg-[#1D1D1F] text-white pl-8 pr-2 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl flex items-center gap-4 w-fit">
                    Choose Who Gets My Business
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <ArrowRight size={16} />
                    </div>
                 </button>
              </div>

              {/* Right Column: Product Card */}
              <div className="relative">
                 <div className="bg-gray-50/80 backdrop-blur-xl rounded-[32px] p-10 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-[#1D1D1F] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg">
                       <Anchor size={28} />
                    </div>

                    <h3 className="text-3xl font-black uppercase tracking-tight text-black mb-2">The Heritage Vault</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                       <span className="text-blue-600 font-black text-2xl">$199</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ yr · includes setup</span>
                    </div>

                    <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10 italic">
                       A legal document naming who gets your business when you’re gone — prepared under Florida Statute § 605.0204 so your business ownership is designed to pass to them directly, without going through a court.
                    </p>

                    <div className="space-y-2 mb-10 relative">
                       {vaultFeatures.map((f, i) => (
                          <div 
                            key={i} 
                            className={`transition-all duration-500 rounded-2xl ${
                              activeFeature === i ? 'bg-blue-600/5 ring-1 ring-blue-600/20' : ''
                            }`}
                          >
                            <div 
                              onClick={() => setActiveFeature(activeFeature === i ? null : i)}
                              className="flex items-center justify-between cursor-pointer group/feat p-3"
                            >
                               <div className="flex items-center gap-3">
                                  <CheckCircle2 size={14} className={activeFeature === i ? "text-blue-600 animate-pulse" : "text-blue-600 opacity-40 group-hover/feat:opacity-100 transition-opacity"} />
                                  <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${activeFeature === i ? 'text-blue-600' : 'text-gray-400 group-hover/feat:text-gray-600'}`}>
                                    {f.name}
                                  </span>
                               </div>
                               <Plus size={12} className={`text-gray-300 transition-transform duration-500 ${activeFeature === i ? 'rotate-45 text-blue-600' : ''}`} />
                            </div>
                            <div className={`transition-all duration-500 ease-in-out px-10 overflow-hidden ${
                              activeFeature === i ? 'max-h-24 pb-4 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                               <p className="text-[10px] font-medium leading-relaxed italic text-gray-500">{f.desc}</p>
                            </div>
                          </div>
                       ))}
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                       <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Name My Successor</span>
                       <button onClick={() => handleSelection(willPackage)} className="w-12 h-12 bg-[#1D1D1F] text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                          <ArrowRight size={20} />
                       </button>
                    </div>
                 </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};

const PackageCard = ({ title, price, icon: Icon, protectionLevel, description, features, active, onClick, badge, isDark }) => (
  <div 
    onClick={onClick} 
    className={`group relative transition-all duration-[0.8s] ease-out cursor-pointer p-10 rounded-[40px] border flex flex-col h-full animate-in fade-in slide-in-from-bottom-12 duration-1000 ${
      active 
        ? 'prism-border vitreous-glass shadow-[0_40px_100px_-20px_rgba(0,122,255,0.1)] scale-[1.05] z-10' 
        : 'border border-gray-200 bg-white shadow-[0_4px_32px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-2'
    }`}
  >
    {badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-luminous-ink text-white text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full shadow-xl z-20 flex items-center gap-2">
        <Zap size={10} className="text-luminous-gold" /> {badge}
      </div>
    )}
    
    <div className="flex justify-between items-start mb-10">
      <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center transition-all duration-700 ${
        active ? 'bg-luminous-ink text-white rotate-6' : 'bg-white/80 text-gray-400 group-hover:text-luminous-ink'
      } shadow-sm border border-black/5`}>
        <Icon size={30} strokeWidth={1} />
      </div>
      
      <div className="flex gap-1.5 pt-4">
        {[1, 2, 3].map((lv) => (
          <div 
            key={lv} 
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              lv <= protectionLevel 
                ? (active ? 'bg-luminous-blue shadow-[0_0_10px_rgba(0,122,255,0.5)]' : 'bg-luminous-ink') 
                : 'bg-gray-200'
            }`} 
          />
        ))}
      </div>
    </div>

     <div className="space-y-4 mb-10 text-left">
        <h3 className="text-4xl font-black tracking-tighter uppercase leading-none text-luminous-ink">{title}</h3>
        <div className="flex items-baseline gap-2">
           <p className={`text-2xl font-black ${active ? 'text-luminous-blue' : 'text-gray-400'}`}>{price}</p>
           <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">/ one-time</span>
        </div>
        {/* RA renewal notice — visible at decision point */}
        <p className="text-[10px] font-medium text-gray-400 leading-relaxed mt-1 flex items-start gap-1.5">
          <span className="text-gray-300 font-bold shrink-0">+</span>
          Registered Agent service included free year 1, then <span className="font-bold text-gray-500">$129/yr</span> — required to keep your LLC compliant. Cancel anytime.
        </p>
        <p className="text-sm font-medium leading-relaxed italic pt-6 border-t mt-6 text-gray-400 border-black/5">
          {description}
        </p>
     </div>

    <div className="space-y-5 mb-12 flex-1">
      {features.map((f, i) => (
        <div key={i} className="flex items-start gap-4 text-[11px] font-bold uppercase tracking-widest leading-snug text-gray-500">
          <CheckCircle2 size={16} className={active ? "text-luminous-blue" : 'text-gray-200'} />
          <span>{f}</span>
        </div>
      ))}
    </div>

    <div className="mt-auto pt-8 border-t border-black/5 flex items-center justify-between">
       <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Protocol Entry</span>
       <div className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-700 shadow-sm ${
         active ? 'bg-luminous-ink text-white scale-110 shadow-lg' : 'bg-white/80 text-gray-300 group-hover:bg-luminous-ink group-hover:text-white'
       }`}>
          <ArrowRight size={22} strokeWidth={1.5} />
       </div>
    </div>
  </div>
);

const QuoteSection = () => (
  <section className="py-32 px-6 flex justify-center">
    <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="w-16 h-16 bg-[#1D1D1F] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
        <ShieldCheck size={28} strokeWidth={1.5} />
      </div>
      <h2 className="text-3xl md:text-5xl font-medium italic leading-snug text-luminous-ink tracking-tight">
        "Most Florida LLCs die in probate when the founder does — frozen in court for months, ownership exposed to the public record. <span className="text-luminous-blue font-bold not-italic">We fix that with one document.</span>"
      </h2>
      <div className="flex items-center justify-center gap-3 pt-4 opacity-30">
        <div className="w-10 h-[0.5px] bg-black" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Charter Legacy · LLC Succession Protocol</span>
        <div className="w-10 h-[0.5px] bg-black" />
      </div>
    </div>
  </section>
);

const TestimonialSection = () => (
  <section className="py-24 px-6 bg-white border-t border-gray-50 relative overflow-hidden">
    <div className="absolute inset-0 dot-overlay opacity-50" />
    <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 relative z-10">
      <div className="flex justify-center gap-1 text-[#D4AF37]">
        {[...Array(5)].map((_,i) => <Star key={i} size={20} fill="currentColor" />)}
      </div>
      <p className="text-2xl md:text-3xl font-medium leading-relaxed text-[#1D1D1F] italic">
        "I formed my first LLC myself and got hit with hundreds of junk mail letters. My home address was suddenly everywhere online mapped to my business. With my new venture, Charter Legacy kept my name and my home completely off Sunbiz from day one."
      </p>
      <div>
        <div className="font-black uppercase tracking-widest text-[13px] text-[#1D1D1F]">Sarah T.</div>
        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">E-Commerce Founder <span className="opacity-50 mx-1">·</span> Orlando, FL</div>
      </div>
    </div>
  </section>
);




// --- MAIN APPLICATION ---

export default function Landing({ appUser }) {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showDoubleLLCExplainer, setShowDoubleLLCExplainer] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNameShield, setShowNameShield] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // A/B Testing Rotation & Tracking
  const { variant, trackClick } = useHeroVariant();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      // Show sticky bar after scrolling past the hero (~600px)
      setShowStickyBar(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (appUser) navigate('/app');
        else setIsLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appUser, navigate]);

  const handleDashboardTransition = () => {
      setIsLoginOpen(false);
      navigate('/app');
  };

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      window.location.reload();
  };

  const formationPackages = [
    { 
      id: 'founder', 
      title: "The Founder’s Shield", 
      price: "$249", 
      icon: ShieldCheck, 
      includedProtocols: [1],
      description: "We keep your home address off public records. Our licensed Florida office becomes your business address on every state filing.", 
      plainEnglish: "Your personal address shouldn't be public. We use our secure Florida office for your official filings so you can build in private.",
      features: ['State-Filed & Compliant', 'Federal BOI Report Included', 'Mail Scanning Included', 'Business Setup Guide'] 
    },
    { 
      id: 'medical', 
      title: "The Clinician’s Charter", 
      price: "$499", 
      icon: HeartPulse, 
      includedProtocols: [1, 2],
      description: "For doctors and practitioners. We form your Professional LLC and keep your home address off public records entirely.", 
      plainEnglish: "For doctors and practitioners. We handle the specialized paperwork needed for a Professional LLC while protecting your home privacy.",
      features: ['Advanced Privacy', 'PLLC Structure', 'Federal BOI Report Included', 'Regulatory Assistance'] 
    },
    { 
      id: 'contractor', 
      title: "The Builder’s Blueprint", 
      price: "$599", 
      icon: Building2, 
      includedProtocols: [1],
      description: "For contractors and trades. We form your LLC and connect your professional license to your new company — ready to pull permits.", 
      plainEnglish: "For those who build Florida. We handle your entity formation and help link your professional license to your new company.",
      features: ['State-Filed & Compliant', 'Federal BOI Report Included', 'Contractor Qualifier Cert', 'Permit-Ready Filing'] 
    }
  ];

  const willPackage = { 
    id: 'will', 
    title: "The Heritage Vault", 
    price: "$199/yr", 
    icon: Anchor, 
    includedProtocols: [3],
    description: "A legal document naming who gets your Florida LLC when you're gone. No court required at the point of transfer.", 
    plainEnglish: "When you pass, your business ownership goes directly to the person you chose — without a court date, without a lawyer at the point of transfer, and without your name in a public proceeding.",
    features: ['Transfer on Death Document (TOD)', 'Sealed & E-Signed Record', 'Transfers Outside of Court', 'Permanent Designation Record', 'Annual Check-In Included']
  };


  const handleSelection = (pkg) => {
    setSelectedPackage(pkg);
  };

  return (
    <div className="min-h-screen bg-luminous text-luminous-ink font-sans antialiased selection:bg-luminous-gold selection:text-white relative overflow-x-hidden">

      {/* ── STICKY PACKAGE BAR — appears after scrolling past hero ─────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[150] transition-all duration-500 ease-out ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-[#1D1D1F]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-20px_60px_-10px_rgba(0,0,0,0.4)]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-luminous-blue shrink-0" />
              <div>
                <p className="text-white font-black text-sm uppercase tracking-widest leading-none">Charter Legacy</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">Florida LLC Formation &amp; Privacy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Starting at $249 · one-time</span>
              <button
                id="sticky-select-package-btn"
                onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-xl hover:bg-luminous-blue hover:text-white active:scale-95 transition-all shadow-lg"
              >
                Select My Package <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setShowStickyBar(false)}
                aria-label="Dismiss"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-all shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ZenithDialog />
      <style>{`
        .bg-mesh { background-image: radial-gradient(at 50% 0%, rgba(29, 29, 31, 0.03) 0, transparent 70%), radial-gradient(at 100% 100%, rgba(0, 122, 255, 0.05) 0, transparent 60%); }
        .text-glow { text-shadow: 0 0 60px rgba(0, 122, 255, 0.15); }
      `}</style>
      
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={handleDashboardTransition} 
      />
      <DoubleLLCExplainer isOpen={showDoubleLLCExplainer} onClose={() => setShowDoubleLLCExplainer(false)} /> {/* 4. Render DoubleLLCExplainer component */}

      <nav className={`fixed top-0 w-full z-50 h-24 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-sm' : 'bg-transparent'} flex items-center justify-between px-6 md:px-12`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="w-10 h-10 bg-[#1D1D1F] rounded-xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6 duration-300">
            <ShieldCheck size={22} />
          </div>
          <div className="flex flex-col gap-0.5">
             <span className="font-black text-xl tracking-tighter uppercase">Charter <span className="italic-serif lowercase text-luminous-blue">Legacy</span></span>
             <span className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400">Florida LLC Formation &amp; Privacy</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-12 text-xs font-black uppercase tracking-widest text-gray-500">
          <button onClick={() => document.getElementById('privacy').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors text-luminous-blue">Privacy Center</button>
          <button onClick={() => document.getElementById('protocol').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors">Heritage Vault</button>
          <button onClick={() => document.getElementById('packages').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors font-bold text-black">Packages</button>
          <button 
            className="bg-[#1D1D1F] text-white px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
            onClick={() => appUser ? navigate('/app') : setIsLoginOpen(true)}
          >
            {appUser ? "Open Dashboard" : "Client Login"}
          </button>
          {appUser && (
            <button 
              onClick={handleSignOut}
              className="px-6 py-3.5 border border-gray-100 rounded-full text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-24 bg-white/95 backdrop-blur-xl z-[100] p-8 animate-in slide-in-from-right duration-300">
            <div className="flex flex-col gap-8">
              <button 
                onClick={() => { document.getElementById('privacy').scrollIntoView({behavior:'smooth'}); setIsMobileMenuOpen(false); }} 
                className="text-2xl font-black uppercase tracking-tighter text-left border-b border-gray-100 pb-4 text-luminous-blue"
              >
                Privacy Center
              </button>
              <button 
                onClick={() => { document.getElementById('protocol').scrollIntoView({behavior:'smooth'}); setIsMobileMenuOpen(false); }} 
                className="text-2xl font-black uppercase tracking-tighter text-left border-b border-gray-100 pb-4"
              >
                Heritage Vault
              </button>
              <button 
                onClick={() => { document.getElementById('packages').scrollIntoView({behavior:'smooth'}); setIsMobileMenuOpen(false); }} 
                className="text-2xl font-black uppercase tracking-tighter text-left border-b border-gray-100 pb-4"
              >
                Packages
              </button>
              <button 
                className="bg-[#1D1D1F] text-white px-8 py-6 rounded-3xl shadow-xl active:scale-95 transition-all text-sm font-black uppercase tracking-widest mt-4"
                onClick={() => { setIsMobileMenuOpen(false); appUser ? navigate('/app') : setIsLoginOpen(true); }}
              >
                {appUser ? "Open Dashboard" : "Client Login"}
              </button>
              {appUser && (
                <button 
                  onClick={handleSignOut}
                  className="px-8 py-6 border border-red-50 text-red-500 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-red-50 transition-all"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
        <section className="pt-52 pb-32 px-6 text-center">
          <div className="max-w-6xl mx-auto space-y-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-gray-200 shadow-md animate-in fade-in slide-in-from-top-4 duration-700">
               <Fingerprint size={14} className="text-luminous-blue" />
               <span className="text-gray-700">Florida LLC Formation &amp; Protection</span>
            </div>
            
            <h1 className="text-6xl md:text-[9.5rem] font-black tracking-tighter leading-[0.85] uppercase text-luminous-ink animate-in zoom-in-95 duration-1000">
              {variant.rawTitle}<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-luminous-ink via-[#4A4A4A] to-luminous-ink bg-[length:200%_auto] animate-prism-shimmer">{variant.titleHighlight}</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 font-medium italic leading-relaxed tracking-wide animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200" key={variant.id}>
              {variant.subHeading}
            </p>

            <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-5 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
              <button 
                onClick={() => {
                  trackClick();
                  document.getElementById('packages').scrollIntoView({behavior:'smooth'});
                }}
                className="group relative h-16 px-12 rounded-2xl bg-luminous-ink text-white font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center gap-3 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                Form My LLC <ChevronRight size={18} />
              </button>
            </div>

            {/* Micro Three Features */}
            <div className="pt-24 w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-left animate-in fade-in duration-1000 delay-500">
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 border border-gray-200 shadow-sm">
                     <Zap size={18} strokeWidth={2} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-luminous-ink">1. Start</h4>
                  <p className="text-sm font-medium italic text-gray-500 leading-relaxed">We file your LLC with the state, draft your operating agreement, and handle the mandatory federal ownership report — all included.</p>
               </div>
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 border border-gray-200 shadow-sm">
                     <ShieldCheck size={18} strokeWidth={2} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-luminous-ink">2. Shield</h4>
                  <p className="text-sm font-medium italic text-gray-500 leading-relaxed">Our office address — not your home — goes on every public filing. Your personal address stays completely off the state record.</p>
               </div>
               <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 border border-gray-200 shadow-sm">
                     <Anchor size={18} strokeWidth={2} />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-luminous-ink">3. Sustain</h4>
                  <p className="text-sm font-medium italic text-gray-500 leading-relaxed">Name who gets your business when you're gone. It transfers directly to them — no court, no probate, no delay.</p>
               </div>
            </div>
          </div>
        </section>

        {/* ── 2. QUOTE ────────────────────────────────────────────────────────── */}
        <QuoteSection />

        {/* ── 3. TESTIMONIAL ──────────────────────────────────────────────────── */}
        <TestimonialSection />

        {/* ── Gradient bridge: light → dark ───────────────────────────────────── */}
        <div className="h-32 bg-gradient-to-b from-white to-[#0A0A0B]" />

        {/* ── 4. TWO PLACES — The Privacy Insight ─────────────────────────────── */}
        <section id="privacy" className="py-32 px-6 bg-[#0A0A0B] relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative z-10">

            {/* UPSTREAM VULNERABILITY WARNING */}
            <div className="max-w-3xl mx-auto mb-24 p-8 rounded-[32px] bg-red-500/5 border border-red-500/10 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10 text-red-400 mb-6">
                  <ShieldCheck size={18} />
               </div>
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-400 mb-4">The Florida Sunshine Law Reality</h3>
               <p className="text-gray-400 text-lg leading-relaxed font-medium">
                 When you file a traditional LLC, Florida’s public records laws require an address. That address is immediately scraped by bots, exposing you to endless solicitation and allowing data brokers to map your business to your home. We engineer a different approach.
               </p>
            </div>

            {/* Section label */}
            <div className="text-center mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 mb-6">The Complete Privacy Stack</p>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                There are <span className="italic-serif lowercase font-black not-italic">two</span> places<br />
                <span className="text-gray-500">your name lives.</span>
              </h2>
              <p className="text-gray-500 text-lg font-medium mt-6 max-w-2xl mx-auto leading-relaxed">
                State records. The internet. Most people fix one and forget the other.
              </p>
            </div>

            {/* Two cards */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* LEFT — State Records (resolved) */}
              <div className="relative p-10 rounded-[40px] border border-emerald-500/20 bg-emerald-500/5 overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  {/* Status badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">Resolved · Double LLC</span>
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                    <Building2 size={24} className="text-emerald-400" />
                  </div>

                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                    State Records
                  </h3>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-6">
                    Sunbiz · County Records · LLC Filings
                  </p>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">
                    For <span className="text-white font-bold">the LLC we form for you</span>, your name will not appear as the registered owner on any state filing. A Wyoming Holding Company takes ownership — so your name stays off Sunbiz, county records, and every state formation document for this entity.
                  </p>

                  {/* Resolved items */}
                  <div className="space-y-3 mb-6">
                    {['Sunbiz filing — this LLC', 'Articles of Organization — this LLC', 'County property records — this LLC', 'State formation documents — this LLC'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Check size={11} className="text-emerald-400" strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Scope note */}
                  <p className="text-[10px] text-gray-600 font-medium leading-relaxed mb-10">
                    * Applies to the LLC formed through Charter Legacy in this order only. Does not retroactively cover existing LLCs or future entities formed elsewhere.
                  </p>

                  {/* Price tag */}
                  <div className="flex items-center gap-4 pt-6 border-t border-emerald-500/10">
                    <span className="text-2xl font-black text-white">$999</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">One-time · Both LLCs</span>
                  </div>
                </div>
              </div>

              {/* RIGHT — The Internet (Name Shield) */}
              <div className="relative p-10 rounded-[40px] border border-amber-500/20 bg-amber-500/5 overflow-hidden group">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10">
                  {/* Status badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Coming Soon · Name Shield</span>
                  </div>

                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8">
                    <Shield size={24} className="text-amber-400" />
                  </div>

                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                    The Internet
                  </h3>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-6">
                    Spokeo · Whitepages · 200+ More
                  </p>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">
                    Data brokers still have your name, home address, phone number, and relatives list — 
                    sourced from voter rolls, property records, and purchase history. The Double LLC doesn't touch this.
                  </p>

                  {/* Items to remove */}
                  <div className="space-y-3 mb-10">
                    {['People-search databases', 'Home address listings', 'Phone & relatives index', 'Data broker profiles'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                          <ArrowRight size={11} className="text-amber-400" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-3 pt-6 border-t border-amber-500/10 flex-wrap">
                    <span className="text-2xl font-black text-white">$99<span className="text-base text-gray-500 font-bold">/yr</span></span>
                    <button
                      onClick={() => setShowNameShield(true)}
                      className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-amber-300 active:scale-95 transition-all shadow-[0_0_30px_-5px_rgba(251,191,36,0.4)]"
                    >
                      See More <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom truth line */}
            <p className="text-center text-[10px] text-gray-700 font-medium mt-12 uppercase tracking-widest">
              Together: $999 + $99/yr · Your name off state records and off the internet.
            </p>
          </div>
        </section>

        {/* ── 5. COMMAND CENTER — Product Experience ───────────────────────────── */}
        <section className="pt-20 pb-40 bg-[#0A0A0B] relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-luminous-blue/20 to-transparent" />
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-luminous-blue/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto text-center mb-24 relative z-10 px-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
                    <div className="w-2 h-2 rounded-full bg-luminous-blue animate-pulse shadow-[0_0_10px_rgba(0,122,255,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-luminous-blue">Interactive Demo</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                    The Command <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-luminous-blue to-emerald-400">Center.</span>
                </h2>
                <p className="text-gray-400 text-xl mt-8 font-medium italic max-w-2xl mx-auto leading-relaxed">
                    Your dashboard, live. See your filing status, manage your documents, and monitor your active privacy protections — all in one place.
                </p>
                {/* Mom's note: set expectation that dashboard grows with plan */}
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-4">
                  Your dashboard grows with your plan · Features shown reflect the full suite
                </p>
            </div>
            
            <div className="w-full max-w-[1400px] h-[850px] mx-auto rounded-[48px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] relative z-20 bg-[#0A0A0B]">
                <RegisteredAgentConsole />
            </div>
        </section>

        {/* ── Gradient bridge: dark → light ───────────────────────────────────── */}
        <div className="h-32 bg-gradient-to-b from-[#0A0A0B] to-white" />

        {/* ── 6. PACKAGES — Select Your Foundation ────────────────────────────── */}
        <section id="packages" className="py-40 px-6 bg-white border-t border-gray-50 relative overflow-hidden">
           <div className="max-w-[1400px] mx-auto space-y-24">
              <div className="space-y-6 max-w-3xl mx-auto text-center">
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-[#1D1D1F]">Select Your <span className="italic-serif lowercase text-luminous-blue">Foundation.</span></h2>
                <p className="text-lg text-gray-500 font-medium italic leading-relaxed">Personal, professional, or industrial. We make the complex simple.</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8 items-stretch pt-8">
                 {formationPackages.map((pkg, idx) => (
                   <div key={pkg.id} className="animate-in fade-in slide-in-from-bottom-12 fill-mode-backwards" style={{ animationDelay: `${idx * 150}ms` }}>
                      <PackageCard 
                        {...pkg} 
                        active={selectedPackage?.id === pkg.id} 
                        onClick={() => handleSelection(pkg)} 
                        isDark={false}
                        badge={idx === 1 ? 'Most Popular' : null}
                      />
                   </div>
                 ))}
              </div>

               <p className="text-center text-xs text-gray-400 font-medium max-w-2xl mx-auto border-t border-gray-100 pt-16 mt-16 leading-relaxed">
                 <span className="font-bold text-gray-500">Registered Agent (RA) Service:</span> All packages include Florida Registered Agent service at no charge for the first 12 months. After that, RA service automatically renews at <span className="font-bold text-gray-500">$129/year</span> per entity to keep your LLC in good standing with the state. The Double LLC package includes RA service for both entities and renews at <span className="font-bold text-gray-500">$250/year</span> total. Florida law requires every active LLC to maintain a Registered Agent — canceling this service means you must appoint another agent or the state may administratively dissolve your company. You may cancel or transfer anytime.
               </p>
           </div>
        </section>

        {/* ── 7. HERITAGE VAULT — The Long Game ───────────────────────────────── */}
        <HeritageVault willPackage={willPackage} handleSelection={handleSelection} />
      </main>


      <footer className="py-24 bg-white text-center flex flex-col items-center gap-8 border-t border-gray-100 px-6">
         <span className="font-black text-3xl uppercase tracking-tighter">Charter <span className="italic-serif lowercase text-luminous-blue">Legacy</span></span>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em]">Florida Business Formation & LLC Succession · Est. 2024</p>
         <p className="text-[10px] text-gray-400 max-w-2xl leading-relaxed">
           Charter Legacy provides self-help business formation documents and LLC Transfer on Death (TOD) designation forms. We are not a law firm and do not provide legal advice. Our TOD product addresses your LLC membership interest only — not your personal estate, real property, or other assets. For comprehensive estate planning, consult a licensed Florida estate attorney.
         </p>
         <p className="text-[9px] text-gray-300 font-medium uppercase tracking-widest">© {new Date().getFullYear()} Charter Legacy · All Rights Reserved</p>
      </footer>

      <SpecSheet 
        item={selectedPackage} 
        isOpen={!!selectedPackage} 
        onClose={() => setSelectedPackage(null)} 
        onSuccess={() => handleDashboardTransition()}
      />
      <PlanManager />

      {/* Name Shield Modal */}
      <NameShield isOpen={showNameShield} onClose={() => setShowNameShield(false)} />
    </div>
  );
}
