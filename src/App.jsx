import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { 
  Shield, ArrowRight, Lock, Zap, CheckCircle2, Fingerprint, 
  ChevronRight, X, Building2, Plus, Anchor, 
  History, Settings, HeartPulse, ShieldCheck, Menu, Brain, Check, Star, CreditCard, Loader2, Mail, Monitor, Box, Wind,
  FileCode, MessageSquare, Clock, FileText, Activity, Landmark, Users
} from 'lucide-react';
import VibeGallery from './VibeGallery';
import FoundersBlueprint from './FoundersBlueprint';
import SuccessionSuite from './SuccessionSuite';
import DesignationProtocol from './DesignationProtocol';
import LoginModal from './LoginModal';
import DashboardZenith from './DashboardZenith';
import ZenithDialog from './ZenithDialog';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

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

const HeritageVault = ({ willPackage, handleSelection }) => (
  <section id="protocol" className="py-40 px-6 bg-[#F5F5F7] relative overflow-hidden">
    {/* Technical Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-20%,#FFFFFF_0%,transparent_100%)] opacity-60" />

    <div className="max-w-6xl mx-auto relative z-10">
      {/* The Floating Window */}
      <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.12)] border border-gray-100 p-12 md:p-20 relative overflow-hidden group/window">
          
          {/* Decorative Blur */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl opacity-50 pointer-events-none" />

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Column: Typography & Features */}
            <div className="space-y-12 relative z-10">
               <div className="space-y-8">
                  <div className="inline-flex items-center gap-3 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">
                     <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                     Will • Trust • Estate
                  </div>
                  
                  <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-black">
                     WILL • TRUST <br/>
                     <span className="text-blue-600 underline decoration-4 decoration-blue-100 underline-offset-8">ESTATE.</span>
                  </h2>
                  
                  <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-md">
                    "You built the business for them. Now make sure it actually reaches them. The Heritage Vault bridges the gap between today and forever."
                  </p>
               </div>

               <div className="space-y-4 pt-4">
                  {[
                    'Estate Instructions',
                    'Legacy Protocols',
                    'Generational Triggers',
                    'Heir Access Key'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                       <div className="w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                          <Check size={10} strokeWidth={4} />
                       </div>
                       <span className="text-xs font-black uppercase tracking-widest text-gray-600">{item}</span>
                    </div>
                  ))}
               </div>

               <button onClick={() => handleSelection(willPackage)} className="group bg-[#1D1D1F] text-white pl-8 pr-2 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl flex items-center gap-4 w-fit">
                  Finalize Estate Plan
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black group-hover:bg-blue-600 group-hover:text-white transition-colors">
                     <ArrowRight size={16} />
                  </div>
               </button>
            </div>

            {/* Right Column: The Product Card */}
            <div className="relative">
               <div className="bg-gray-50/80 backdrop-blur-xl rounded-[32px] p-10 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-[#1D1D1F] rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg">
                     <Anchor size={28} />
                  </div>
                  
                  <h3 className="text-3xl font-black uppercase tracking-tight text-black mb-2">The Heritage Vault</h3>
                  <div className="flex items-baseline gap-2 mb-8">
                     <span className="text-blue-600 font-black text-2xl">$199/yr</span>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ One-time setup</span>
                  </div>

                  <p className="text-sm font-medium text-gray-500 leading-relaxed mb-10 italic">
                     A secure bridge for your family. Encrypted instructions for your heirs + physical access keys.
                  </p>

                  <div className="space-y-4 mb-10">
                     {['Encrypted Data Vault', 'Digital Memories', '24/7 Security Audit', 'Generational Access Key', 'Data Broker Shield'].map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <CheckCircle2 size={14} className="text-blue-600" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{f}</span>
                        </div>
                     ))}
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                     <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Protocol Entry</span>
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

const PackageCard = ({ title, price, icon: Icon, description, features, active, onClick, badge, isDark }) => (
  <div 
    onClick={onClick} 
    className={`group relative transition-all duration-[0.8s] ease-out cursor-pointer p-10 rounded-[40px] border flex flex-col h-full animate-in fade-in slide-in-from-bottom-12 duration-1000 ${
      active 
        ? 'prism-border vitreous-glass shadow-[0_40px_100px_-20px_rgba(0,122,255,0.1)] scale-[1.05] z-10' 
        : 'border-luminous-ink/5 bg-white/40 hover:bg-white/60 hover:shadow-2xl hover:-translate-y-2'
    }`}
  >
    {badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-luminous-ink text-white text-[9px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full shadow-xl z-20 flex items-center gap-2">
        <Zap size={10} className="text-luminous-gold" /> {badge}
      </div>
    )}
    
    <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center mb-10 transition-all duration-700 ${
      active ? 'bg-luminous-ink text-white rotate-6' : 'bg-white/80 text-gray-400 group-hover:text-luminous-ink'
    } shadow-sm border border-black/5`}>
      <Icon size={30} strokeWidth={1} />
    </div>

    <div className="space-y-4 mb-10 text-left">
       <h3 className="text-4xl font-black tracking-tighter uppercase leading-none text-luminous-ink">{title}</h3>
       <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-black ${active ? 'text-luminous-blue' : 'text-gray-400'}`}>{price}</p>
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">/ one-time</span>
       </div>
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
  <section id="protocol" className="py-32 px-6 flex justify-center">
    <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="w-16 h-16 bg-[#1D1D1F] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
        <Brain size={32} />
      </div>
      <h2 className="text-3xl md:text-5xl font-medium italic leading-snug text-luminous-ink tracking-tight">
        "We've refined <span className="text-luminous-blue font-bold">30 years</span> of institutional strategy into a single, clean signature. No jargon. No complexity. Just your home, safeguarded."
      </h2>
      <div className="flex items-center justify-center gap-3 pt-4 opacity-30">
        <div className="w-10 h-[0.5px] bg-black" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Charter Legacy Protocol v4.0</span>
        <div className="w-10 h-[0.5px] bg-black" />
      </div>
    </div>
  </section>
);

const TestimonialSection = () => (
  <section className="py-24 px-6 bg-white border-t border-gray-50 relative overflow-hidden">
    <div className="absolute inset-0 dot-overlay opacity-50" />
    <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 relative z-10">
      <div className="flex justify-center gap-1 text-[#D4AF37]">
        {[...Array(5)].map((_,i) => <Star key={i} size={20} fill="currentColor" />)}
      </div>
      <p className="text-2xl md:text-3xl font-medium leading-relaxed text-[#1D1D1F]">
        "I was dreading the Sunbiz paperwork. Charter Legacy handled the filing, the Registered Agent, and the publication automatically. I didn't have to learn a single statute."
      </p>
      <div>
        <div className="font-black uppercase tracking-widest text-sm text-[#1D1D1F]">Michael R.</div>
        <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Miami Brand Architect</div>
      </div>
    </div>
  </section>
);

const RegisteredAgentConsole = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [autoDisposeMarketing, setAutoDisposeMarketing] = useState(true);
  const [priorityForwarding, setPriorityForwarding] = useState(true);
  const [autoRenew, setAutoRenew] = useState(false);
  const [smsInterrupt, setSmsInterrupt] = useState(false);
  const [brokerShield, setBrokerShield] = useState(true);

  const tabs = [
    { id: 'dashboard', icon: Activity, label: 'Agent Dashboard' },
    { id: 'documents', icon: FileText, label: 'Document Feed' },
    { id: 'messaging', icon: MessageSquare, label: 'Agent Messaging' },
    { id: 'privacy', icon: ShieldCheck, label: 'Ownership Privacy' },
    { id: 'config', icon: Settings, label: 'Console Config' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'documents':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Document Feed.</h3>
                   <p className="text-gray-500 font-medium italic">All official correspondence received at your private address.</p>
                </div>
                <div className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Zap size={12} className="text-[#00D084]" /> Real-time Sync
                </div>
             </div>

             <div className="space-y-3">
                {[
                  { title: 'Annual Report Filing Confirmation', date: 'Feb 12, 2026', type: 'State FL', status: 'Processed' },
                  { title: 'Service of Process (Mock Inquiry)', date: 'Feb 09, 2026', type: 'Legal', status: 'Blocked' },
                  { title: 'Tax Receipt - Department of Revenue', date: 'Jan 28, 2026', type: 'Tax', status: 'Scanned' },
                  { title: 'Official Mail - Division of Corporations', date: 'Jan 15, 2026', type: 'Sunbiz', status: 'Scanned' },
                  { title: 'Registered Agent Designation Status', date: 'Jan 02, 2026', type: 'Legal', status: 'Active' },
                ].map((doc, i) => (
                   <div key={i} className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-luminous-blue/30 hover:shadow-xl transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-luminous-blue/10 group-hover:text-luminous-blue transition-colors">
                            <FileText size={20} />
                         </div>
                         <div>
                            <p className="font-bold text-[#1D1D1F] text-sm group-hover:text-luminous-blue transition-colors">{doc.title}</p>
                            <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                               <span>{doc.date}</span>
                               <span className="text-gray-300">•</span>
                               <span>{doc.type}</span>
                            </div>
                         </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                         doc.status === 'Blocked' ? 'bg-red-50 text-red-500' :
                         doc.status === 'Active' ? 'bg-[#00D084]/10 text-[#00D084]' :
                         'bg-gray-100 text-gray-500'
                      }`}>
                         {doc.status}
                      </div>
                   </div>
                ))}
             </div>
          </div>
        );
      
      case 'messaging':
        return (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-8">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Secure Channel.</h3>
                <p className="text-gray-500 font-medium italic">Direct encrypted line to your Registered Agent team.</p>
             </div>
             
             <div className="flex-1 bg-gray-50/50 rounded-[32px] border border-gray-100 p-6 flex flex-col relative overflow-hidden">
                <div className="flex-1 space-y-6 overflow-y-auto pr-4">
                   <div className="flex items-start gap-4 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white text-[10px] font-black shrink-0">RA</div>
                      <div className="space-y-2">
                         <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-xs font-medium text-gray-600 leading-relaxed">
                            "System Alert: We successfully intercepted a public record request for your home address essentially 'blocking' it from the public database. Your privacy shield held firm."
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 pl-2">Yesterday 2:30 PM</span>
                      </div>
                   </div>

                   <div className="flex items-start gap-4 max-w-[80%] ml-auto flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-luminous-blue flex items-center justify-center text-white text-[10px] font-black shrink-0">YOU</div>
                      <div className="space-y-2 text-right">
                         <div className="bg-luminous-blue p-4 rounded-2xl rounded-tr-none shadow-md text-xs font-medium text-white leading-relaxed">
                            "Excellent. Do I need to take any action on the annual report?"
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 pr-2">Yesterday 2:45 PM</span>
                      </div>
                   </div>

                   <div className="flex items-start gap-4 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white text-[10px] font-black shrink-0">RA</div>
                      <div className="space-y-2">
                         <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-xs font-medium text-gray-600 leading-relaxed">
                            "No action required. We utilized the 'Double LLC' structure to file anonymously on your behalf. You are compliant for 2026."
                         </div>
                         <div className="flex items-center gap-2 pl-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Just Now</span>
                            <span className="flex h-1.5 w-1.5 rounded-full bg-[#00D084]" />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-6 relative">
                   <input type="text" placeholder="Type a secure message..." className="w-full bg-white p-4 pr-14 rounded-2xl border border-gray-100 font-medium text-sm focus:ring-2 focus:ring-luminous-blue/20 outline-none transition-all" />
                   <button className="absolute right-2 top-2 bottom-2 aspect-square bg-[#1D1D1F] rounded-xl text-white flex items-center justify-center hover:scale-95 transition-transform">
                      <ArrowRight size={18} />
                   </button>
                </div>
             </div>
          </div>
        );

      case 'privacy':
        return (
           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-end">
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Privacy Status.</h3>
                   <p className="text-gray-500 font-medium italic">Monitoring your public data footprint.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#00D084]/10 text-[#00D084] rounded-xl border border-[#00D084]/20">
                   <ShieldCheck size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Shield Active</span>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-[#0A0A0B] rounded-[32px] text-white overflow-hidden relative group">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D084] rounded-full blur-[100px] opacity-10" />
                   
                   <div className="relative z-10 space-y-8">
                      <div className="space-y-2">
                         <span className="text-[#00D084] text-[10px] font-black uppercase tracking-[0.3em]">Sunbiz Public Record</span>
                         <h4 className="text-2xl font-black">Official Filing Data</h4>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-1">
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Registered Agent</p>
                            <div className="flex items-center gap-2">
                               <CheckCircle2 size={14} className="text-[#00D084]" />
                               <p className="font-mono text-lg text-gray-300">Charter Legacy, Inc.</p>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Manager / Owner</p>
                            <div className="flex items-center gap-2">
                               <Shield size={14} className="text-[#00D084]" />
                               <p className="font-mono text-lg text-gray-300">*********** LLC</p>
                            </div>
                            <p className="text-[10px] text-gray-600 font-bold italic">Your name is hidden via Double LLC.</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Principal Address</p>
                            <div className="flex items-center gap-2">
                               <Building2 size={14} className="text-[#00D084]" />
                               <p className="font-mono text-lg text-gray-300">1200 Brickell Ave...</p>
                            </div>
                            <p className="text-[10px] text-gray-600 font-bold italic">Using our generic facility address.</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                            <Activity size={18} />
                         </div>
                         <div>
                            <p className="font-black text-[#1D1D1F] text-sm">Threat Blocked</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Yesterday</p>
                         </div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                         "A data scraper attempted to access beneficial ownership info. Our system returned the statutory holding company data, preserving your anonymity."
                      </p>
                   </div>
                   <div className="p-6 bg-white border border-gray-100 rounded-3xl space-y-4 shadow-sm opacity-60">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center">
                            <Activity size={18} />
                         </div>
                         <div>
                            <p className="font-black text-[#1D1D1F] text-sm">Routine Scan</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Feb 10, 2026</p>
                         </div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                         "Weekly sweep of 40+ data broker sites. No personal leaks detected."
                      </p>
                   </div>
                </div>
             </div>
           </div>
        );

      case 'config':
        return (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Configuration.</h3>
                <p className="text-gray-500 font-medium italic">Manage your alerts and forwarding protocols.</p>
             </div>

             <div className="space-y-6 max-w-2xl">
                <div onClick={() => setAutoDisposeMarketing(!autoDisposeMarketing)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${autoDisposeMarketing ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                   <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-wide transition-colors ${autoDisposeMarketing ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Auto-Dispose Marketing</p>
                      <p className="text-xs text-gray-500 font-medium">Automatically shred spam and solicitation mail.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${autoDisposeMarketing ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                          {autoDisposeMarketing ? 'Active' : 'Off'}
                      </span>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${autoDisposeMarketing ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${autoDisposeMarketing ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                      </div>
                   </div>
                </div>
                
                <div onClick={() => setPriorityForwarding(!priorityForwarding)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${priorityForwarding ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                   <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-wide transition-colors ${priorityForwarding ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Pleadings / Priority Mail</p>
                      <p className="text-xs text-gray-500 font-medium">Instant scan & forward for all court/state documents.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${priorityForwarding ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                          {priorityForwarding ? 'Active' : 'Off'}
                      </span>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${priorityForwarding ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${priorityForwarding ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                      </div>
                   </div>
                </div>

                <div onClick={() => setAutoRenew(!autoRenew)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${autoRenew ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 opacity-80 hover:opacity-100 hover:border-gray-200'}`}>
                   <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-wide transition-colors ${autoRenew ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Auto-Renewal</p>
                      <p className="text-xs text-gray-500 font-medium">Automatically renew my privacy shield every year.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${autoRenew ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                          {autoRenew ? 'Active' : 'Off'}
                      </span>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${autoRenew ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${autoRenew ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                      </div>
                   </div>
                </div>

                <div onClick={() => setSmsInterrupt(!smsInterrupt)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:scale-[1.01] ${smsInterrupt ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                   <div className="space-y-1">
                      <p className={`font-black text-sm uppercase tracking-wide transition-colors ${smsInterrupt ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Urgent SMS Interrupt</p>
                      <p className="text-xs text-gray-500 font-medium">Bypass "Do Not Disturb" for Service of Process alerts.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${smsInterrupt ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                          {smsInterrupt ? 'Active' : 'Off'}
                      </span>
                      <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${smsInterrupt ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${smsInterrupt ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                      </div>
                   </div>
                </div>

                <div onClick={() => setBrokerShield(!brokerShield)} className={`p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col gap-4 group hover:scale-[1.01] ${brokerShield ? 'border-[#007AFF]/20 shadow-xl shadow-[#007AFF]/5' : 'border-gray-100 hover:border-gray-200'}`}>
                   <div className="flex items-center justify-between w-full">
                      <div className="space-y-1">
                         <p className={`font-black text-sm uppercase tracking-wide transition-colors ${brokerShield ? 'text-[#007AFF]' : 'text-[#1D1D1F]'}`}>Data Broker Shield</p>
                         <p className="text-xs text-gray-500 font-medium">Auto-submit removal requests to 40+ people-search sites.</p>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${brokerShield ? 'text-[#007AFF]' : 'text-gray-300'}`}>
                              {brokerShield ? 'Active' : 'Off'}
                          </span>
                          <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${brokerShield ? 'bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]' : 'bg-gray-200'}`}>
                             <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${brokerShield ? 'left-[calc(100%-1.75rem)]' : 'left-1'}`} />
                          </div>
                      </div>
                   </div>
                   
                   {/* Expanded Detail View for Data Broker Shield */}
                   <div className={`pt-4 border-t ${brokerShield ? 'border-[#007AFF]/10' : 'border-gray-100'} grid grid-cols-2 gap-4`}>
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-gray-400">
                             <Fingerprint size={10} className={brokerShield ? "text-[#007AFF]" : "text-gray-300"} />
                             Targeted Databases
                         </div>
                         <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            Whitepages, Spokeo, BeenVerified, Radaris, PeopleFinder, +35 others.
                         </p>
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-gray-400">
                             <Activity size={10} className={brokerShield ? "text-[#007AFF]" : "text-gray-300"} />
                             Action Frequency
                         </div>
                         <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                            Continuous monitoring. Auto-removal requests sent every 30 days.
                         </p>
                      </div>
                   </div>
                   {/* Inactive State Upsell */}
                   {!brokerShield && (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-gray-500">Included in Sovereign Package</span>
                         <span className="text-[10px] font-black uppercase text-luminous-blue cursor-pointer">Upgrade</span>
                      </div>
                   )}
                </div>
             </div>
           </div>
        );

      case 'dashboard':
      default:
        return (
          <div className="relative z-10 space-y-16 animate-in fade-in duration-700">
             <header className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-500">
                   <Shield size={12} /> Status: Active Command
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-luminous-ink uppercase tracking-tighter leading-none">Registered Agent <br/><span className="text-luminous-blue">Console.</span></h2>
                <div className="flex items-center gap-4 pt-2">
                   <div className="h-px bg-gray-200 w-12"></div>
                   <p className="text-xl md:text-2xl text-luminous-ink font-black uppercase tracking-tight">
                       Business Ownership Kept Private.
                   </p>
                </div>
                <p className="text-lg text-gray-500 font-medium italic leading-relaxed">
                   This is the command center for your statutory shield. We intercept public records requests and keep your residential address off the grid.
                </p>
             </header>

             <div className="grid lg:grid-cols-2 gap-12">
                {/* DOCUMENT FEED WIDGET */}
                <div className="space-y-6">
                   <h3 className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
                      Scanned Documents <span onClick={() => setActiveTab('documents')} className="text-[10px] text-luminous-blue cursor-pointer hover:underline">View All</span>
                   </h3>
                   <div className="space-y-3">
                      {[
                        { title: 'Notice of Annual Filing', date: 'Feb 12, 2026', type: 'State Requirement' },
                        { title: 'Service of Process (Mock)', date: 'Feb 09, 2026', type: 'Legal Notice' },
                        { title: 'Information Request', date: 'Feb 05, 2026', type: 'Bureaucracy' }
                      ].map((doc, idx) => (
                        <div key={idx} className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
                           <div className="space-y-1">
                              <p className="text-xs font-black text-luminous-ink">{doc.title}</p>
                              <div className="flex gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                 <span>{doc.date}</span>
                                 <span>•</span>
                                 <span className="text-luminous-blue">{doc.type}</span>
                              </div>
                           </div>
                           <FileCode size={20} className="text-gray-200 group-hover:text-luminous-blue transition-colors" />
                        </div>
                      ))}
                   </div>
                </div>

                {/* MESSAGING WIDGET */}
                <div className="space-y-6">
                   <h3 className="text-sm font-black uppercase tracking-widest">Direct Agent Liaison</h3>
                   <div className="bg-gray-50/80 rounded-[32px] border border-gray-100 flex flex-col h-[400px] overflow-hidden group cursor-pointer" onClick={() => setActiveTab('messaging')}>
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-luminous-ink flex items-center justify-center text-white text-[10px] font-black">L</div>
                            <div className="space-y-0.5">
                               <p className="text-[10px] font-black uppercase">Liaison 402</p>
                               <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Currently Online</p>
                            </div>
                         </div>
                      </div>
                      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                         <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm max-w-[80%]">
                            <p className="text-[11px] text-gray-600 italic">"Client 482910, your Annual Report has been successfully finalized with the Florida Department of State. Privacy shield maintained."</p>
                         </div>
                         <div className="bg-luminous-blue p-4 rounded-2xl rounded-tr-none text-white shadow-sm max-w-[80%] ml-auto">
                            <p className="text-[11px] font-medium">"Thank you. Please scan the hard copy and upload it to the vault."</p>
                         </div>
                      </div>
                      <div className="p-4 bg-white border-t border-gray-100">
                         <div className="relative pointer-events-none">
                            <input type="text" placeholder="Secure Message to Agent..." className="w-full bg-gray-50 rounded-xl py-3 px-4 text-xs font-medium outline-none border border-transparent" />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-luminous-ink text-white rounded-lg">
                               <ArrowRight size={14} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* SYSTEM ACTIVITY TRACKER */}
             <div className="bg-luminous-ink rounded-[32px] p-10 space-y-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 dot-overlay opacity-10 pointer-events-none" />
                <h4 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                   System Activity Tracker <span className="h-[1px] flex-1 bg-white/10" />
                </h4>
                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                   <div className="space-y-2">
                      <p className="text-2xl font-black text-luminous-blue">Activated</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ownership Privacy Shield</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-2xl font-black">Live</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sunbiz Automated Liaison</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-2xl font-black">24h</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Document Processing Window</p>
                   </div>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <section id="privacy" className="py-48 px-6 bg-luminous relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-10" />
        <div className="absolute inset-0 dot-overlay opacity-30 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden relative group/slab">
                <div className="flex flex-col md:flex-row min-h-[850px]">
                
                 {/* SIDEBAR NAVIGATION */}
                 <aside className="w-full md:w-72 bg-gray-50/50 border-r border-gray-100/50 p-10 space-y-12 shrink-0">
                    <div className="space-y-2 text-left">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block">Console ID</span>
                       <span className="text-xs font-mono text-luminous-blue">RA-FL-482910</span>
                    </div>
                    <nav className="space-y-6">
                       {tabs.map((link) => (
                         <button 
                            key={link.id} 
                            onClick={() => setActiveTab(link.id)}
                            className={`flex items-center gap-4 w-full transition-all duration-300 group ${activeTab === link.id ? 'text-luminous-blue translate-x-2' : 'text-gray-400 hover:text-black hover:translate-x-1'}`}
                         >
                            <link.icon size={18} className={activeTab === link.id ? "" : "group-hover:scale-110 transition-transform"} />
                            <span className="text-xs font-black uppercase tracking-widest text-left">{link.label}</span>
                         </button>
                       ))}
                    </nav>
                    
                    <div className="pt-20 text-left">
                       <div className="p-4 bg-luminous-blue/10 rounded-2xl border border-luminous-blue/20">
                          <div className="flex items-center gap-3 text-luminous-blue mb-2">
                             <Clock size={14} />
                             <span className="text-[9px] font-black uppercase tracking-widest">Facility Uplink</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                             <span className="text-[10px] font-bold text-gray-600">Miami Hub Active</span>
                          </div>
                       </div>
                    </div>
                 </aside>

                 {/* MAIN CONTENT AREA */}
                 <main className="flex-1 p-12 md:p-20 relative text-left overflow-y-auto">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-luminous-blue/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />
                    {renderContent()}
                 </main>

              </div>
           </div>
        </div>
    </section>
  );
};

// Initialize Stripe outside component render to avoid recreation
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/app/dashboards/obsidian-zenith.html', 
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
      onError(error.message);
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg flex items-center gap-2">
            <X size={14} /> {errorMessage}
        </div>
      )}
      <button 
        type="submit" 
        disabled={!stripe || processing} 
        className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        {processing ? <Loader2 className="animate-spin" /> : <>Secure Checkout <Lock size={16} /></>}
      </button>
    </form>
  );
};

const SpecSheet = ({ item, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('details'); // details, setup, payment, success
  const [loading, setLoading] = useState(false);
  const [boiAdded, setBoiAdded] = useState(false);
  const [breachAdded, setBreachAdded] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setStep('details');
        setBoiAdded(item?.id === 'sovereign_upgrade');
        setBreachAdded(item?.id === 'sovereign_upgrade');
    }
  }, [isOpen, item]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => { 
      if (isOpen) {
          setStep('details'); 
          setError('');
          setLoading(false);
          setClientSecret('');
      }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleNext = () => {
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setStep('setup');
      }, 500);
  };

  const handleSetup = async () => {
      if (!email || !password) {
          setError("Please enter both email and password.");
          return;
      }
      setLoading(true);
      setError('');

      try {
          const { data, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
          });

          let authenticatedUser = data.user;

          if (signUpError) {
              if (signUpError.message.includes("already registered") || signUpError.message.includes("User already registered")) {
                  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                      email,
                      password,
                  });
                  
                  if (signInError) {
                      if (signInError.message.includes("Invalid login credentials")) {
                          setError("Account exists, but password was incorrect.");
                          throw new Error("MAGIC_LINK_REQUIRED"); 
                      }
                      throw signInError;
                  }
                  authenticatedUser = signInData.user;
              } else {
                  throw signUpError;
              }
          }
          
          setUser(authenticatedUser);

          try {
             const { data: intentData, error: functionError } = await supabase.functions.invoke('create-payment-intent', {
                body: { packageId: item.id, userId: authenticatedUser.id }
             });

             if (functionError) throw functionError;
             if (intentData?.clientSecret) {
                 setClientSecret(intentData.clientSecret);
             } else {
                 throw new Error("Failed to initialize payment.");
             }
          } catch (fnErr) {
             console.error("Function Error:", fnErr);
             console.warn("Using Mock Payment Mode due to function error/missing");
             setClientSecret('');
          }

          setStep('payment');
      } catch (err) {
          console.error("Auth Error:", err);
          if (err.message === "MAGIC_LINK_REQUIRED") {
              setError("Account exists. Password incorrect.");
          } else {
              setError(err.message || "Authentication failed. Please try again.");
          }
      } finally {
          setLoading(false);
      }
  };

  const handleMagicLink = async () => {
      setLoading(true);
      setError('');
      try {
          const { error } = await supabase.auth.signInWithOtp({
              email,
              options: {
                  emailRedirectTo: window.location.origin,
              }
          });
          if (error) throw error;
          setError("Magic Link Sent! Check your email to log in.");
      } catch (err) {
          setError(err.message || "Failed to send magic link.");
      } finally {
          setLoading(false);
      }
  };

  const handlePaymentSuccess = async () => {
      setLoading(true);
      try {
          if (user) {
              const productMap = {
                  'founder': 'founders_shield',
                  'medical': 'medical_pllc',
                  'contractor': 'trade_professional',
                  'will': 'legacy_will'
              };

              const { data, error: dbError } = await supabase
                  .from('llcs')
                  .insert([
                      { 
                          user_id: user.id, 
                          product_type: productMap[item.id] || 'standard',
                          llc_name: 'Pending Formation - LLC Name TBD', 
                          llc_status: 'Setting Up',
                          privacy_shield_active: true
                      }
                  ])
                  .select();

              if (dbError) console.error("DB Error:", dbError);
          }
          setStep('success');
      } catch (err) {
          setError("Database record failed. Contact support.");
      } finally {
          setLoading(false);
      }
  };

  const handleMockPayment = async () => {
      setLoading(true);
      setError('');
      try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          await handlePaymentSuccess();
      } catch (err) {
          setError("Mock Payment processing failed.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white w-full max-w-xl rounded-[48px] p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 text-left border border-gray-100 transition-all duration-500">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all z-10"><X size={18} /></button>
        
        {step === 'details' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
             <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-4">Confirmed Selection</div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">{item.title}</h2>
             </div>
             
             <div className="bg-[#F5F5F7] p-6 rounded-2xl border border-gray-100/50">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">What you're actually getting:</p>
                <p className="text-base text-gray-600 font-medium leading-relaxed">
                  "{item.plainEnglish}"
                </p>
             </div>

             {/* FEDERAL COMPLIANCE TOGGLE - OPTION 2 */}
             {item.id !== 'will' && (
             <div 
                onClick={() => item.id !== 'sovereign_upgrade' && setBoiAdded(!boiAdded)}
                className={`flex items-center justify-between p-5 rounded-2xl border mb-6 cursor-pointer transition-all ${boiAdded ? 'bg-black text-white border-black' : 'bg-white border-gray-100 hover:border-gray-200'}`}
             >
                <div className="flex items-center gap-4">
                   <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${boiAdded ? 'bg-white text-black border-transparent' : 'border-gray-200 text-transparent'}`}>
                      <Check size={14} className={boiAdded ? "opacity-100" : "opacity-0"} />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                         Federal Compliance Guard
                         {item.id === 'sovereign_upgrade' && <span className="text-[9px] bg-[#00D084] text-black px-2 py-0.5 rounded-full">INCLUDED</span>}
                      </p>
                      <p className={`text-[10px] font-medium leading-tight max-w-[200px] ${boiAdded ? 'text-gray-400' : 'text-gray-500'}`}>Mandatory FinCEN BOI Filing. We handle this report to help avoid potential civil penalties. *Future ownership changes require an updated filing.</p>
                   </div>
                </div>
                <div className="text-right">
                   {item.id === 'sovereign_upgrade' ? (
                       <span className="text-[10px] font-black line-through text-gray-500 block">$149</span>
                   ) : (
                       <span className={`text-xs font-black ${boiAdded ? 'text-[#00D084]' : 'text-gray-400'}`}>+$149</span>
                   )}
                </div>
             </div>
             )}

             {/* BREACH ALERTS TOGGLE */}
             {item.id !== 'will' && (
             <div 
                onClick={() => item.id !== 'sovereign_upgrade' && setBreachAdded(!breachAdded)}
                className={`flex items-center justify-between p-5 rounded-2xl border mb-6 cursor-pointer transition-all ${breachAdded ? 'bg-black text-white border-black' : 'bg-white border-gray-100 hover:border-gray-200'}`}
             >
                <div className="flex items-center gap-4">
                   <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${breachAdded ? 'bg-white text-black border-transparent' : 'border-gray-200 text-transparent'}`}>
                      <Check size={14} className={breachAdded ? "opacity-100" : "opacity-0"} />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                         Instant Breach Alerts
                         {item.id === 'sovereign_upgrade' && <span className="text-[9px] bg-[#00D084] text-black px-2 py-0.5 rounded-full">INCLUDED</span>}
                      </p>
                      <p className={`text-[10px] font-medium leading-tight max-w-[200px] ${breachAdded ? 'text-gray-400' : 'text-gray-500'}`}>Notify me via SMS if my name appears on any public watchlist.</p>
                   </div>
                </div>
                <div className="text-right">
                   {item.id === 'sovereign_upgrade' ? (
                       <span className="text-[10px] font-black line-through text-gray-500 block">$49/yr</span>
                   ) : (
                       <span className={`text-xs font-black ${breachAdded ? 'text-[#00D084]' : 'text-gray-400'}`}>+$49/yr</span>
                   )}
                </div>
             </div>
             )}

             <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-100">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total cost</p>
                    <p className="text-3xl font-black text-black">
                        {item.id === 'will' ? item.price : `$${(parseInt(item.price.replace(/[^0-9]/g, '')) || 0) + ((item.id !== 'sovereign_upgrade' && boiAdded) ? 149 : 0) + ((item.id !== 'sovereign_upgrade' && breachAdded) ? 49 : 0)}`}
                    </p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Establishment</p>
                    <p className="text-3xl font-black text-black">24h</p>
                 </div>
             </div>
             <button onClick={handleNext} disabled={loading} className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
               {loading ? <Loader2 className="animate-spin" /> : <>Proceed to Secure Checkout <ArrowRight size={18} /></>}
             </button>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
             <div>
                <div className="inline-flex items-center gap-2 text-[#007AFF] text-[9px] font-black uppercase tracking-widest mb-4"><Lock size={12} /> Secure Setup</div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Create Your ID.</h2>
                <p className="text-gray-500 mt-2 text-sm italic">Existing user? We'll detect your account automatically.</p>
             </div>
             
             {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl animate-in slide-in-from-top-2">
                    {error}
                    {error.includes("Account exists") && !error.includes("Magic Link") && (
                         <div className="mt-3 pt-3 border-t border-red-100">
                             <button onClick={handleMagicLink} className="text-[#007AFF] underline hover:text-black transition-colors block w-full text-left">
                                 Forgot Password? Email me a one-time login link.
                             </button>
                         </div>
                    )}
                </div>
             )}

             <div className="space-y-4">
               <div>
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@legacy.com" 
                      className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 pl-12 pr-4 font-bold text-lg focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" 
                   />
                 </div>
               </div>
               <div>
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Secure Password</label>
                 <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 pl-12 pr-4 font-bold text-lg focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" 
                   />
                 </div>
               </div>
             </div>
             <button onClick={handleSetup} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
               {loading ? <Loader2 className="animate-spin" /> : <>Create Secure Account <ArrowRight size={18} /></>}
             </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
             <div>
                <div className="inline-flex items-center gap-2 text-[#007AFF] text-[9px] font-black uppercase tracking-widest mb-4"><Lock size={12} /> 256-Bit SSL Encrypted</div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Secure Payment.</h2>
             </div>

             {error && (
                <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl animate-in slide-in-from-top-2">
                    {error}
                </div>
             )}

             <div className="p-6 bg-[#F5F5F7] rounded-3xl space-y-4 border border-gray-100">
               <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                  <span className="font-bold text-sm text-gray-500">Order Total</span>
                  <span className="font-black text-2xl text-black">{item.price}</span>
               </div>
               
               {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', labels: 'floating' } }}>
                     <CheckoutForm onSuccess={handlePaymentSuccess} onError={setError} />
                  </Elements>
               ) : (
                  <>
                    <div className="opacity-50 pointer-events-none relative">
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">Mock Mode</span>
                        </div>
                        <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Card Information</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border-0 rounded-xl py-4 pl-12 pr-4 font-bold text-lg focus:ring-2 focus:ring-[#007AFF] outline-none" />
                        </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                        <input type="text" placeholder="MM/YY" className="bg-white border-0 rounded-xl py-4 px-4 font-bold text-center focus:ring-2 focus:ring-[#007AFF] outline-none" />
                        <input type="text" placeholder="CVC" className="bg-white border-0 rounded-xl py-4 px-4 font-bold text-center focus:ring-2 focus:ring-[#007AFF] outline-none" />
                        </div>
                    </div>
                    <button onClick={handleMockPayment} disabled={loading} className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : "Complete Mock Transaction"}
                    </button>
                    <p className="text-center text-xs text-red-400 mt-2">Stripe Key Missing or Function Error. Using Mock Mode.</p>
                  </>
               )}
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-8 animate-in zoom-in duration-500 text-center py-8">
             <div className="w-24 h-24 bg-[#007AFF] text-white rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
               <Check size={48} strokeWidth={3} />
             </div>
             <div className="space-y-2">
               <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Payment Confirmed</h2>
               <p className="text-gray-500 font-medium">Order #FL-28941 Initiated</p>
             </div>
             <p className="text-sm text-gray-400 italic max-w-xs mx-auto">
               "Your privacy shield is now active. Please complete the wizard to finalize your filing."
             </p>
             <button onClick={() => onSuccess && onSuccess(user)} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
               Proceed to Console <ArrowRight size={18} />
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [view, setView] = useState('landing'); 
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [appUser, setAppUser] = useState(null);
  const [showVibeGallery, setShowVibeGallery] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
          setAppUser(session.user);
      }
    });

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (appUser) setView('dashboard');
        else setIsLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appUser]);

  const handleDashboardTransition = (user) => {
      setAppUser(user);
      setView('dashboard');
      setSelectedPackage(null);
      setIsLoginOpen(false);
  };

  const formationPackages = [
    { 
      id: 'founder', 
      title: "The Founder’s Shield", 
      price: "$249", 
      icon: ShieldCheck, 
      description: "Institutional privacy for the modern founder. We keep your home address off the grid.", 
      plainEnglish: "Your personal address shouldn't be public. We use our secure Florida office for your official filings so you can build in private.",
      features: ['Private Business Address', 'Mail Scanning Included', 'The Founder’s Guide', 'Heritage Intake Form'] 
    },
    { 
      id: 'medical', 
      title: "The Clinician’s Charter", 
      price: "$499", 
      icon: HeartPulse, 
      description: "Dignified structures for medical professionals. Privacy for those who provide care.", 
      plainEnglish: "For doctors and practitioners. We handle the specialized paperwork needed for a Professional LLC while protecting your home privacy.",
      features: ['Board-Ready Structure', 'Clinician Privacy Forms', 'Regulatory Assistance', 'Heritage Intake Form'] 
    },
    { 
      id: 'contractor', 
      title: "The Builder’s Blueprint", 
      price: "$599", 
      icon: Building2, 
      description: "Solid foundations for trades and contractors. From site-work to state-filing.", 
      plainEnglish: "For those who build Florida. we handle your entity formation and help link your professional license to your new company.",
      features: ['License Linking Support', 'Qualifier Certification', 'Permit-Ready Filing', 'Heritage Intake Form'] 
    }
  ];

  const willPackage = { 
    id: 'will', 
    title: "The Heritage Vault", 
    price: "$199/yr", 
    icon: Anchor, 
    description: "A secure bridge for your family. Encrypted instructions for your heirs.", 
    plainEnglish: "Make sure what you build stays with the people you love. A private, digital vault for your maps, keys, and final instructions.",
    features: ['Encrypted Data Vault', 'Digital Memories (Coming Soon)', '24/7 Security Audit', 'Generational Access Key']
  };

  const handleSelection = (pkg) => {
    setSelectedPackage(pkg);
  };

  if (view === 'dashboard') {
      return <DashboardZenith user={appUser} />;
  }

  return (
    <div className="min-h-screen bg-luminous text-luminous-ink font-sans antialiased selection:bg-luminous-gold selection:text-white relative overflow-x-hidden">
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

      <nav className={`fixed top-0 w-full z-50 h-24 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-sm' : 'bg-transparent'} flex items-center justify-between px-6 md:px-12`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
          <div className="w-10 h-10 bg-[#1D1D1F] rounded-xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6 duration-300">
            <ShieldCheck size={22} />
          </div>
          <div className="flex flex-col -space-y-1">
             <span className="font-black text-xl tracking-tighter uppercase">Charter <span className="italic-serif lowercase text-luminous-blue">Legacy</span></span>
             <span className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400">Family & Business Protection</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-12 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
          <button onClick={() => document.getElementById('privacy').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors text-luminous-blue">Privacy Center</button>
          <button onClick={() => document.getElementById('protocol').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors">Heritage Vault</button>
          <button 
            className="bg-[#1D1D1F] text-white px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest"
            onClick={() => appUser ? setView('dashboard') : setIsLoginOpen(true)}
          >
            {appUser ? "Open Dashboard" : "Client Login"}
          </button>
        </div>
      </nav>

      <main>
        <section className="pt-52 pb-32 px-6 text-center">
          <div className="max-w-6xl mx-auto space-y-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
               <Fingerprint size={14} className="text-luminous-blue" />
               <span className="text-gray-400">The Heritage Privacy Plan</span>
            </div>
            
            <h1 className="text-6xl md:text-[9.5rem] font-black tracking-tighter leading-[0.85] uppercase text-luminous-ink animate-in zoom-in-95 duration-1000">
              Your Business.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-luminous-ink via-[#4A4A4A] to-luminous-ink bg-[length:200%_auto] animate-prism-shimmer">Private.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 font-medium italic leading-relaxed tracking-wide animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
              Your home belongs to your family, not the public record. We handle the paperwork and keep your residential address private.
            </p>

            <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-5 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
              <button 
                onClick={() => setView('packages')}
                className="group relative h-16 px-12 rounded-2xl bg-luminous-ink text-white font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center gap-3 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                Launch Entity <ChevronRight size={18} />
              </button>
              <button 
                onClick={() => setShowVibeGallery(true)}
                className="h-16 px-10 rounded-2xl vitreous-glass text-luminous-ink font-black uppercase tracking-widest hover:bg-luminous-ink hover:text-white transition-all flex items-center gap-3 shadow-xl border border-luminous-ink/5"
              >
                Strategy Audit <Monitor size={18} />
              </button>
            </div>
          </div>
        </section>

        <QuoteSection />
        <TestimonialSection />

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
                      />
                   </div>
                 ))}
              </div>
               


               {/* THE SOVEREIGN UPGRADE - DOUBLE LLC HIGHLIGHT */}
               <div className="mt-32 max-w-5xl mx-auto">
                  <div className="relative rounded-[40px] overflow-hidden bg-[#0A0A0B] border border-gray-800 shadow-2xl group cursor-pointer group/sovereign">
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                      <div className="absolute -right-20 -top-40 w-96 h-96 bg-[#00D084] rounded-full blur-[128px] opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
                      
                      <div className="relative z-10 p-12 md:p-20 grid md:grid-cols-2 gap-12 items-center">
                          <div className="space-y-8">
                              <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#1A1A1A] rounded-full border border-gray-800 backdrop-blur-md">
                                  <Shield size={14} className="text-[#00D084] animate-pulse" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00D084]">Maximum Anonymity Protocol</span>
                              </div>
                              
                              <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                                  The <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Double LLC</span> <br/> Strategy.
                              </h3>
                              
                              <p className="text-lg text-gray-400 font-medium leading-relaxed">
                                  For founders who demand total invisibility. We form an anonymous Holding Company in Wyoming to own your Florida entity, removing your name from public records entirely.
                              </p>

                              <div className="flex flex-wrap gap-4 pt-4">
                                  {['No Public Name', 'Asset Segregation', 'Wyoming Jurisdiction', 'Institutional Grade'].map((feat, i) => (
                                      <div key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                                          <Check size={12} className="text-[#00D084]" /> {feat}
                                      </div>
                                  ))}
                              </div>

                              <button 
                                onClick={() => {
                                    handleSelection({
                                        id: 'sovereign_upgrade',
                                        title: 'The Sovereign Strategy',
                                        price: '$999',
                                        icon: Shield,
                                        description: 'The ultimate privacy architecture. Dual-entity structure for absolute anonymity.',
                                        plainEnglish: 'We set up two companies for you. One in Florida to do business, and one in Wyoming to own the Florida company so your name never appears on Sunbiz.',
                                        features: ['Florida Operating LLC', 'Wyoming Holding LLC', 'Registered Agent for Both', 'EIN for Both', 'Inter-Company Agreement']
                                    });
                                }}
                                className="mt-8 bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-transform flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                              >
                                  Deploy Protocol <ArrowRight size={16} />
                              </button>
                          </div>

                          {/* Visual Diagram */}
                          <div className="relative h-full min-h-[300px] flex items-center justify-center">
                              <div className="relative z-10 w-64 h-80 bg-[#1A1A1A] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                                  <div className="flex justify-between items-start opacity-50">
                                      <Building2 size={24} className="text-white" />
                                      <div className="w-8 h-5 border-2 border-white/20 rounded-full" />
                                  </div>
                                  <div>
                                      <div className="text-[10px] font-black uppercase text-gray-500 mb-1">Florida Entity</div>
                                      <div className="text-xl font-black text-white">Operating Co.</div>
                                      <div className="h-px w-full bg-gray-800 my-4" />
                                      <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-[#00D084]" />
                                          <span className="text-[10px] font-bold text-gray-400">Manager: Holding Co.</span>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* The Ghost Card */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-12 -ml-12 w-64 h-80 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col justify-between transform -rotate-6 hover:-rotate-12 transition-transform duration-500 z-0">
                                   <div className="flex justify-between items-start opacity-30">
                                      <Landmark size={24} className="text-white" />
                                  </div>
                                  <div className="opacity-50">
                                      <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Wyoming Entity</div>
                                      <div className="text-xl font-black text-white">Holding Co.</div>
                                      <div className="h-px w-full bg-white/10 my-4" />
                                      <div className="flex items-center gap-2">
                                          <Users size={12} className="text-white" />
                                          <span className="text-[10px] font-bold text-gray-300">Owner: You</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
               
               <p className="text-center text-xs text-gray-400 font-medium italic max-w-2xl mx-auto border-t border-gray-100 pt-16 mt-16">
                 * All packages include Florida Registered Agent service, free for the first 12 months. Service automatically renews at $129/year to maintain your privacy shield. Cancel anytime.
                 <br/><br/>
                 * The Double LLC Strategy involves a one-time upgrade fee of $999. It is compatible with all foundation packages.
                 <br/>
                 * Includes 12 months of RA service for BOTH entities. Renews at $250/year total to maintain dual-state anonymity.
               </p>
           </div>
        </section>

        {/* REGISTERED AGENT CONSOLE (THE SOVEREIGN SLAB) */}
        <RegisteredAgentConsole />

        <HeritageVault willPackage={willPackage} handleSelection={handleSelection} />
      </main>

      <footer className="py-32 bg-white text-center flex flex-col items-center gap-10">
         <span className="font-black text-3xl uppercase tracking-tighter">Charter <span className="italic-serif lowercase text-luminous-blue">Legacy</span></span>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em]">Florida Sovereign Business Hub • Since 2024 • v3.1.0</p>
      </footer>

      <SpecSheet 
        item={selectedPackage} 
        isOpen={!!selectedPackage} 
        onClose={() => setSelectedPackage(null)} 
        onSuccess={(user) => handleDashboardTransition(user)}
      />
    </div>
  );
}
