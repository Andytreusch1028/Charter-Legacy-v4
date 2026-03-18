import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { 
  Shield, ArrowRight, Lock, Zap, CheckCircle2, Fingerprint, FileCheck,
  ChevronRight, X, Stethoscope, HardHat, Plus, Anchor, 
  History, Settings, HeartPulse, ShieldCheck, Menu, Brain, Check, Star, CreditCard, Loader2, Mail, Building2, Landmark, Users, Vault, Video
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

import AEOSchema from './components/AEOSchema';
import QASector from './components/QASector';
import DoubleLLCExplainer from './DoubleLLCExplainer';
import LoginModal from './LoginModal';
import DashboardZenith from './DashboardZenith';
import ZenithDialog from './ZenithDialog';
import StaffConsole from './StaffConsole';
import RegisteredAgentConsole from './RegisteredAgentConsole';
import MobileRecorder from './MobileRecorder';
import { isEnabled } from './shared/flags/flags';

/**
 * CHARTER LEGACY v3.1.0 // THE "RULE OF THREE" REVERSION
 * - RESTORED: "Rule of Three" Package Model (Shield, Professional, Will).
 * - RESTORED: "Folklore" Client Statement.
 * - RETAINED: 10/10 Glassmorphism & Micro-interactions.
 * - REMOVED: Complex Discovery Engine & A/B Testing noise.
 */

// --- SUB-COMPONENTS ---

const PackageCard = ({ title, price, icon: Icon, description, features, active, onClick, badge, isDark }) => (
  <div 
    onClick={onClick} 
    className={`group relative transition-all duration-500 ease-out cursor-pointer p-10 rounded-[48px] border-2 flex flex-col h-full ${
      active 
        ? 'border-black bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] scale-[1.02] z-10' 
        : isDark 
          ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' 
          : 'border-gray-50 bg-white hover:border-gray-200 hover:shadow-xl hover:-translate-y-1'
    }`}
  >
    {badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-lg z-20 animate-in fade-in zoom-in duration-500 flex items-center gap-2">
        {badge}
      </div>
    )}
    
    <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center mb-8 transition-colors duration-500 ${
      isDark ? 'bg-white/10 text-white' : active ? 'bg-black text-white' : 'bg-[#F5F5F7] text-gray-400 group-hover:text-black'
    }`}>
      <Icon size={32} strokeWidth={1.5} />
    </div>

    <div className="space-y-3 mb-8 text-left">
       <h3 className={`text-3xl font-black tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>{title}</h3>
       <p className={`text-2xl font-black ${isDark ? 'text-[#D4AF37]' : active ? 'text-[#007AFF]' : 'text-gray-400'}`}>{price}</p>
       <p className={`text-sm font-medium leading-relaxed italic pt-4 border-t mt-4 ${isDark ? 'text-gray-400 border-white/10' : 'text-gray-500 border-gray-100'}`}>
         {description}
       </p>
    </div>

    <div className="space-y-4 mb-10 flex-1">
      {features.map((f, i) => (
        <div key={i} className={`flex items-start gap-3.5 text-[11px] font-bold uppercase tracking-wide leading-snug ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <CheckCircle2 size={16} className={isDark ? "text-[#D4AF37]" : active ? "text-[#007AFF]" : 'text-gray-300'} />
          <span>{f}</span>
        </div>
      ))}
    </div>

    <div className={`mt-auto pt-8 border-t flex items-center justify-between ${isDark ? 'border-white/10' : 'border-gray-50'}`}>
       <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-300'}`}>Select Plan</span>
       <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ${
         isDark ? 'bg-white text-black hover:scale-110' : active ? 'bg-black text-white shadow-md' : 'bg-gray-50 text-gray-300 group-hover:bg-black group-hover:text-white'
       }`}>
          <ChevronRight size={20} />
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-[#007AFF] text-[10px] font-black uppercase tracking-[0.3em] bg-[#007AFF]/5 px-4 py-2 rounded-full border border-[#007AFF]/10 mb-2">
                <ShieldCheck size={14} />
                <span>The Integrated Standard</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-[#1D1D1F]">
                Privacy for <span className="text-[#007AFF]">Today.</span><br/>Heritage for <span className="text-[#D4AF37]">Eternity.</span>
              </h1>
            </div>
            <p className="max-w-xl mx-auto text-gray-500 text-2xl font-medium leading-relaxed italic">
              "We bridge the gap between building your private enterprise and protecting your family lineage."
            </p>
          </div>
      <div className="flex items-center justify-center gap-3 pt-4 opacity-30">
        <div className="w-10 h-[0.5px] bg-black" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Charter Legacy Protocol v4.1</span>
        <div className="w-10 h-[0.5px] bg-black" />
      </div>
    </div>
  </section>
);

const TestimonialSection = () => (
  <section className="py-24 px-6 bg-white border-t border-gray-50">
    <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
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

// Initialize Stripe outside component render to avoid recreation

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
        return_url: window.location.origin + '/app/dashboards/obsidian-zenith.html', // Redirect after success if using redirect-based methods
      },
      redirect: "if_required", // Handle success manually without redirect if possible
    });

    if (error) {
      setErrorMessage(error.message);
      onError(error.message);
      setProcessing(false);
    } else {
      // Payment succeeded
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
        {processing ? <Loader2 className="animate-spin" /> : <>Continue <Lock size={16} /></>}
      </button>
    </form>
  );
};

const SpecSheet = ({ item, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('details'); // details, setup, llc_confirm, llc_active_check, llc_entry, upsell, lead_capture, payment, success
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  
  // LLC Qualification States
  const [userLLCs, setUserLLCs] = useState([]);
  const [manualLLC, setManualLLC] = useState({ name: '', sunbizId: '' });
  const [selectedLLC, setSelectedLLC] = useState(null);

  useEffect(() => { 
      if (isOpen) {
          setStep('details'); 
          setError('');
          setLoading(false);
          setClientSecret('');
          setUserLLCs([]);
          setManualLLC({ name: '', sunbizId: '' });
          setSelectedLLC(null);
      }
  }, [isOpen]);

  const fetchUserLLCs = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('llcs')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      setUserLLCs(data || []);
      return data || [];
    } catch (err) {
      console.error("Error fetching LLCs:", err);
      return [];
    }
  };

  if (!isOpen || !item) return null;

  const handleNext = async () => {
      setLoading(true);
      
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (currentUser) {
          setUser(currentUser);
          const llcs = await fetchUserLLCs(currentUser.id);
          
          if (item.id === 'will') {
              if (llcs.length > 0) {
                  setStep('llc_confirm');
              } else {
                  setStep('llc_active_check');
              }
          } else {
              // Not a 'will' package, proceed to payment (creation of new LLC)
              await initializePayment(currentUser);
          }
      } else {
          setStep('setup');
      }
      setLoading(false);
  };

  const initializePayment = async (authenticatedUser, packageId = item.id) => {
      try {
          const { data: intentData, error: functionError } = await supabase.functions.invoke('create-payment-intent', {
              body: { packageId: packageId, userId: authenticatedUser.id }
          });

          if (functionError) throw functionError;
          if (intentData?.clientSecret) {
              setClientSecret(intentData.clientSecret);
          } else {
              throw new Error("Failed to initialize payment.");
          }
          setStep('payment');
      } catch (fnErr) {
          console.error("Payment Init Error:", fnErr);
          setClientSecret(''); // Fallback to mock
          setStep('payment');
      }
  };

  const handleSetup = async () => {
      if (!email || !password) {
          setError("Please enter both email and password.");
          return;
      }
      setLoading(true);
      setError('');

      try {
          // Auth logic (Existing)
          const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
          let authenticatedUser = data.user;

          if (signUpError) {
              if (signUpError.message.includes("already registered")) {
                  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
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
          const llcs = await fetchUserLLCs(authenticatedUser.id);

          if (item.id === 'will') {
              if (llcs.length > 0) {
                  setStep('llc_confirm');
              } else {
                  setStep('llc_active_check');
              }
          } else {
              await initializePayment(authenticatedUser);
          }
      } catch (err) {
          if (err.message !== "MAGIC_LINK_REQUIRED") {
            setError(err.message || "Authentication failed.");
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
              options: { emailRedirectTo: window.location.origin }
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
                  'sovereign': 'double_llc_protocol',
                  'will': 'legacy_will'
              };

              const insertData = { 
                  user_id: user.id, 
                  product_type: productMap[item.id] || 'standard',
                  llc_name: selectedLLC ? selectedLLC.llc_name : (manualLLC.name || 'Pending Formation - LLC Name TBD'), 
                  llc_status: selectedLLC ? 'Active' : 'Setting Up',
                  privacy_shield_active: true,
                  sunbiz_id: selectedLLC ? selectedLLC.sunbiz_id : (manualLLC.sunbizId || null)
              };

              await supabase.from('llcs').insert([insertData]);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      await handlePaymentSuccess();
  };

  const handleLeadCapture = async () => {
      setLoading(true);
      // Simulate capturing lead (e.g., store in a 'leads' table or send email)
      console.log("Lead Captured:", email || user?.email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('lead_capture');
      setLoading(false);
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
                <p className="text-base text-gray-600 font-medium leading-relaxed italic">"{item.plainEnglish}"</p>
             </div>
             <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-100">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total cost</p>
                    <p className="text-3xl font-black text-black">{item.price}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Establishment</p>
                    <p className="text-3xl font-black text-black">24h</p>
                 </div>
             </div>
             <button onClick={handleNext} disabled={loading} className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
               {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
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
                             <button onClick={handleMagicLink} className="text-[#007AFF] underline hover:text-black transition-colors block w-full text-left">Forgot Password? Email me a link.</button>
                         </div>
                    )}
                </div>
             )}
             <div className="space-y-4">
               <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 px-6 font-bold text-lg outline-none" />
               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Secure Password" className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 px-6 font-bold text-lg outline-none" />
             </div>
             <button onClick={handleSetup} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify Identity"}
             </button>
          </div>
        )}

        {step === 'llc_confirm' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-black text-white rounded-[28px] flex items-center justify-center mx-auto shadow-2xl"><Building2 size={40} /></div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Confirm Your LLC.</h2>
                <p className="text-gray-500 text-sm italic">We found this in your existing secure records:</p>
             </div>
             <div className="bg-[#1D1D1F] p-8 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Fingerprint size={80} /></div>
                 <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] mb-2">Active Protocol Target</p>
                 <p className="text-2xl font-black text-white tracking-tight uppercase">{userLLCs[0]?.llc_name}</p>
                 <div className="flex gap-4 mt-6">
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[8px] font-black text-gray-400 uppercase">FL-SUNBIZ ACTIVE</div>
                 </div>
             </div>
             <div className="space-y-4">
                <button onClick={() => { setSelectedLLC(userLLCs[0]); initializePayment(user); }} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Yes, Use This LLC</button>
                <button onClick={() => setStep('llc_active_check')} className="w-full bg-gray-50 text-gray-400 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">No, I want to use a different one</button>
             </div>
          </div>
        )}

        {step === 'llc_active_check' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-[#F5F5F7] text-black rounded-[28px] flex items-center justify-center mx-auto shadow-lg"><FileCheck size={40} /></div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Status Check.</h2>
                <p className="text-gray-500 text-sm italic leading-relaxed">Is the LLC you want to secure with the Heritage Protocol Suite already active on Florida Sunbiz?</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setStep('llc_entry')} className="p-8 bg-white border-2 border-black rounded-[32px] text-center group hover:bg-black hover:text-white transition-all">
                   <CheckCircle2 size={32} className="mx-auto mb-4 text-[#007AFF] group-hover:text-white" />
                   <p className="font-black uppercase text-xs tracking-widest">Yes, It's Active</p>
                </button>
                <button onClick={() => setStep('upsell')} className="p-8 bg-[#F5F5F7] border-2 border-transparent rounded-[32px] text-center group hover:border-[#007AFF] transition-all">
                   <X size={32} className="mx-auto mb-4 text-gray-300 group-hover:text-[#007AFF]" />
                   <p className="font-black uppercase text-xs tracking-widest text-gray-500">No, Not Yet</p>
                </button>
             </div>
          </div>
        )}

        {step === 'llc_entry' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
             <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Link Your Entity.</h2>
                <p className="text-gray-500 mt-2 text-sm italic">Enter the details exactly as they appear on Sunbiz.</p>
             </div>
             <div className="space-y-4">
               <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Company Legal Name</label>
                  <input type="text" value={manualLLC.name} onChange={(e) => setManualLLC({...manualLLC, name: e.target.value})} placeholder="EX: LEGACY HOLDINGS LLC" className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 px-6 font-bold text-lg outline-none" />
               </div>
               <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">FL Sunbiz ID (Optional)</label>
                  <input type="text" value={manualLLC.sunbizId} onChange={(e) => setManualLLC({...manualLLC, sunbizId: e.target.value})} placeholder="EX: L21000..." className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 px-6 font-bold text-lg outline-none" />
               </div>
             </div>
             <button onClick={() => { if(!manualLLC.name) return setError("LLC Name required"); initializePayment(user); }} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Continue to Secure Payment</button>
          </div>
        )}

        {step === 'upsell' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500 text-center">
             <div className="w-24 h-24 bg-gradient-to-br from-[#007AFF] to-[#00D084] text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl rotate-3"><Shield size={48} /></div>
             <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Protection Gap Detected.</h2>
                <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">You can't secure an LLC that doesn't exist yet. We can file your **Privacy Shield LLC** for you right now.</p>
             </div>
             <div className="bg-[#F5F5F7] p-8 rounded-[40px] border border-gray-100 text-left relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4"><Zap className="text-[#007AFF] opacity-20" size={40} /></div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Smart Recommendation</p>
                 <p className="text-2xl font-black text-black tracking-tight mb-4 uppercase">Privacy Shield</p>
                 <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-600 flex items-center gap-2"><Check size={14} className="text-[#00D084]" /> Official Setup within 24h</p>
                    <p className="text-xs font-bold text-gray-600 flex items-center gap-2"><Check size={14} className="text-[#00D084]" /> Private Business Address</p>
                 </div>
                 <p className="mt-6 text-3xl font-black text-black tracking-tight">$249 <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">+ State Fees</span></p>
             </div>
             <div className="space-y-4">
                <button onClick={() => onSuccess && onSuccess(user)} className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Yes, Set Up My LLC First</button>
                <button onClick={handleLeadCapture} className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-black transition-colors">No thanks, I'll come back later</button>
             </div>
          </div>
        )}

        {step === 'lead_capture' && (
          <div className="space-y-8 animate-in zoom-in duration-500 text-center py-12">
             <div className="w-24 h-24 bg-gray-50 text-[#1D1D1F] rounded-full flex items-center justify-center mx-auto shadow-inner"><Anchor size={48} className="opacity-20" /></div>
             <div className="space-y-4">
               <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Talk Soon.</h2>
               <p className="text-gray-500 font-medium max-w-xs mx-auto italic">"We've captured your request. A specialist will follow up at **{email || user?.email}** with some resources on Florida LLC requirements."</p>
             </div>
             <button onClick={onClose} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">Close & Talk Later</button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-8 animate-in slide-in-from-right duration-500">
             <div>
                <div className="inline-flex items-center gap-2 text-[#007AFF] text-[9px] font-black uppercase tracking-widest mb-4"><Lock size={12} /> 256-Bit SSL Encrypted</div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Secure Payment.</h2>
             </div>
             {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl animate-in slide-in-from-top-2">{error}</div>}
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
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 text-yellow-800 text-[10px] font-bold rounded-xl text-center uppercase tracking-widest">Mock Mode Enabled - No Stripe Key Detected</div>
                    <button onClick={handleMockPayment} disabled={loading} className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : "Complete Mock Transaction"}
                    </button>
                  </div>
               )}
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-8 animate-in zoom-in duration-500 text-center py-8">
             <div className="w-24 h-24 bg-[#007AFF] text-white rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce"><Check size={48} strokeWidth={3} /></div>
             <div className="space-y-2">
               <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Payment Confirmed</h2>
               <p className="text-gray-500 font-medium">Order #FL-28941 Initiated</p>
             </div>
             <p className="text-sm text-gray-400 italic max-w-xs mx-auto">"Your privacy shield is now active. Please complete the wizard to finalize your filing."</p>
             <button onClick={() => onSuccess && onSuccess(user)} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">Proceed to Console <ArrowRight size={18} /></button>
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
  // Shared User State for lifting up from SpecSheet
  const [appUser, setAppUser] = useState(null);
  const [showDoubleLLCExplainer, setShowDoubleLLCExplainer] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Auth Listener & Initial Check
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
          setAppUser(session.user);
      } else {
          setAppUser(null);
      }
    });

    const handleKeyDown = (e) => {
      // Steve-Pro: Keyboard Shortcut for Dashboard (Ctrl+K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (supabase?.auth?.getSession) {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setView('dashboard');
            else setIsLoginOpen(true);
          }).catch(err => {
            console.error("Auth Session Error:", err);
            setIsLoginOpen(true);
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Initial Path Check
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if ((path === '/staff' || path === '/admin/fulfillment') && isEnabled('newStaffNode')) {
        setView('staff');
        if (path === '/admin/fulfillment') {
            window.initialStaffTab = 'filings';
        }
    } else if (path === '/ra') {
        setView('ra');
    } else if (path.startsWith('/mobile-recorder/')) {
        const sessionId = path.split('/').pop();
        setView('mobile-recorder');
        window.mobileSessionId = sessionId;
    } else if (path === '/dashboard') {
        setView('dashboard');
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      subscription.unsubscribe();
    };
  }, []); // Run ONLY once on mount

  const handleDashboardTransition = (user) => {
      setAppUser(user);
      if (window.location.pathname === '/staff' && isEnabled('newStaffNode')) {
          setView('staff');
      } else if (window.location.pathname === '/ra') {
          setView('ra');
      } else {
          setView('dashboard');
      }
      setSelectedPackage(null);
      setIsLoginOpen(false);
  };

  const formationPackages = [
    { 
      id: 'founder', 
      title: "Privacy Shield", 
      price: "$249", 
      icon: Shield, 
      description: "One goal: Complete privacy for your business.", 
      plainEnglish: "We file your official setup paperwork with the State and list our registered office address on public record to help keep your home address private. Includes official setup within 24h.",
      features: ['Private Business Address', 'Free Mail Scanning (Year 1*)', 'Founder\'s Blueprint', 'AEO Ownership Succession'] 
    },
    { 
      id: 'sovereign', 
      title: "Double LLC", 
      price: "$999", 
      icon: ShieldCheck, 
      description: "Maximum privacy. The ultimate protection for your business.", 
      plainEnglish: "We set up two companies for you. One in Florida to do business, and one in Wyoming to own the Florida company so your name never appears on Sunbiz. Total anonymity protocol.",
      features: ['Florida Operating LLC', 'Wyoming Holding LLC', 'Invisible Ownership', 'Registered Agent for Both', 'EIN for Both', 'Inter-Company Agreement'] 
    },
  ];

  const willPackage = { 
    id: 'will', 
    title: "Heritage Protocol Suite", 
    price: "$199/yr", 
    icon: Anchor, 
    description: "Bank-grade digital vault, LLC ownership succession, and audit trails.", 
    plainEnglish: "The ultimate non-probate solution. Includes AEO Ownership Successor protocol, 24/7 audit logs, and encrypted instructions for your business heirs.",
    features: ['Secure Digital Vault', 'LLC Ownership Protocol', '24/7 Audit Trail', 'Successor Manager Continuity']
  };

  const handleSelection = (pkg) => {
    setSelectedPackage(pkg);
  };

  if (view === 'dashboard') {
      return <DashboardZenith user={appUser} />;
  }

  if (view === 'staff') {
      return <StaffConsole user={appUser} />;
  }

  if (view === 'ra' && appUser) {
      return <RegisteredAgentConsole />;
  }

  if (view === 'mobile-recorder') {
      return <MobileRecorder sessionId={window.mobileSessionId} onExit={() => window.location.href = '/'} />;
  }

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] font-sans selection:bg-[#007AFF]/10 selection:text-[#007AFF]">
      <AEOSchema 
        type="Organization" 
        data={{
            "knowsAbout": ["Florida LLC Formation", "Anonymous LLCs", "Business Privacy", "Registered Agent Services"],
            "legalName": "Charter Legacy LLC",
            "founder": {
                "@type": "Person",
                "name": "Charter Management"
            }
        }}
      />
      <AEOSchema 
        type="WebSite" 
        data={{
            "about": "Premium Business Privacy & Succession Infrastructure",
            "keywords": "Anonymous LLC, Florida Registered Agent, Asset Protection, Business Privacy"
        }}
      />
      
      {/* Mobile Menu Overlay */}
      <ZenithDialog />
      <DoubleLLCExplainer isOpen={showDoubleLLCExplainer} onClose={() => setShowDoubleLLCExplainer(false)} />
      <style>{`
        .bg-mesh { background-image: radial-gradient(at 50% 0%, rgba(29, 29, 31, 0.03) 0, transparent 70%), radial-gradient(at 100% 100%, rgba(0, 122, 255, 0.05) 0, transparent 60%); }
        .text-glow { text-shadow: 0 0 60px rgba(0, 122, 255, 0.15); }
      `}</style>
      
      {/* LOGIN MODAL */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSuccess={handleDashboardTransition} 
      />

      {/* NAVIGATION */}
      <nav className={`fixed top-0 w-full z-50 h-24 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100/50 shadow-sm' : 'bg-transparent'} flex items-center justify-between px-6 md:px-12`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
          <div className="w-10 h-10 bg-[#1D1D1F] rounded-xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6 duration-300"><Shield size={22} /></div>
          <span className="font-black text-xl tracking-tighter uppercase group-hover:opacity-80 transition-opacity">Charter <span className="italic-serif lowercase">Legacy</span></span>
        </div>
        <div className="hidden lg:flex items-center gap-12 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
          <button onClick={() => document.getElementById('protocol').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors">The Protocol</button>
          <button onClick={() => document.getElementById('privacy').scrollIntoView({behavior:'smooth'})} className="hover:text-black transition-colors text-[#007AFF]">Privacy Hub</button>
          <button 
            className="bg-[#1D1D1F] text-white px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest"
            onClick={() => appUser ? setView('dashboard') : setIsLoginOpen(true)}
          >
            {appUser ? "Open Console" : "Client Login"}
          </button>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="pt-52 pb-32 px-6 text-center bg-mesh">
          <div className="max-w-6xl mx-auto space-y-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
               <Brain size={14} className="text-[#D4AF37]" />
               <span className="text-gray-400">Family Business Protection Plan v4.1</span>
            </div>
            
            <h1 className="text-6xl md:text-[9.5rem] font-black tracking-tighter leading-[0.8] uppercase text-[#1D1D1F] animate-in zoom-in-95 duration-1000">
              Launch Your LLC.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#886B1D]">Lock Your Legacy.</span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-500 font-medium italic leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
              Professional Florida LLC formation in 24 hours. Integrated with a secure digital vault that ensures your business stays in the family forever.
            </p>

            <div className="pt-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
              <button onClick={() => document.getElementById('packages').scrollIntoView({behavior:'smooth'})} className="bg-[#1D1D1F] text-white px-16 py-8 rounded-[40px] font-black text-xl flex items-center gap-5 hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                Launch My Private LLC <ArrowRight size={28} className="text-[#007AFF]" />
              </button>
            </div>
          </div>
        </section>

        {/* NEW ORDER: HERO -> LEGACY VAULT -> QUOTE -> PACKAGES */}
        {/* THE HERITAGE BLUEPRINT - LEGACY VAULT UP-RANKED */}
        <section id="legacy-vault" className="py-40 px-6 bg-[#0F0F10] text-white relative overflow-hidden rounded-t-[3rem]">
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
           <div className="absolute -left-40 top-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-[160px] opacity-10" />
           
           <div className="max-w-[1400px] mx-auto relative z-10">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                 <div className="space-y-12">
                    <div className="space-y-6">
                       <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] bg-[#D4AF37]/10 px-4 py-2 rounded-full border border-[#D4AF37]/20">
                          <Vault size={14} />
                          <span>Heritage Grade Protection</span>
                       </div>
                       <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                          Secure The <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#886B1D]">Legacy.</span>
                       </h2>
                       <p className="text-2xl text-gray-400 font-medium italic leading-relaxed max-w-xl">
                         "You built the machine. Now ensure the handover is automated. The Legacy Vault is the bridge between your operational present and your family's future."
                       </p>
                    </div>

                    <div className="grid gap-8">
                       {[
                          {
                             icon: ShieldCheck,
                             title: "Avoid Probate",
                             desc: "Integrated directly with your LLC's Operating Agreement. Shares are designed to transfer to heirs upon a verified transfer of ownership, helping your family avoid the probate process for these assets."
                          },
                          {
                             icon: History,
                             title: "Compliance Heartbeat",
                             desc: "The vault monitors your activity. Should a 'Total Blackout' occur, the Sentinel Protocol triggers. Access coordinates are securely dispatched to your successor."
                          },
                          {
                             icon: Video,
                             title: "Video Heritage",
                             desc: "Personal messages and guidance for your family. Don't leave them guessing—explain the context behind your business in your own voice."
                          }
                       ].map((item, i) => (
                          <div key={i} className="flex gap-6 group">
                             <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform duration-500">
                                <item.icon size={24} />
                             </div>
                             <div className="space-y-2">
                                <h4 className="text-lg font-black uppercase tracking-tight text-white">{item.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="pt-8">
                       <button 
                          onClick={() => handleSelection(willPackage)} 
                          className="group relative bg-[#D4AF37] text-black px-16 py-8 rounded-[40px] font-black text-xl uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_-20px_rgba(212,175,55,0.5)]"
                       >
                          <span className="relative z-10 flex items-center gap-4">
                             Add Legacy Vault - $199/yr <ArrowRight size={28} />
                          </span>
                       </button>
                    </div>
                 </div>

                 {/* VISUAL BLUEPRINT / ANATOMY */}
                 <div className="relative">
                    <div className="absolute -inset-10 bg-[#D4AF37]/5 rounded-[60px] blur-3xl" />
                    <div className="relative bg-[#151516] rounded-[50px] border border-white/10 p-12 md:p-16 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)] overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent" />
                       
                       <div className="space-y-12 relative z-10">
                          <div className="flex items-center justify-between border-b border-white/5 pb-8">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 font-mono text-xs">0x1</div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Structural Anatomy</span>
                             </div>
                             <Fingerprint size={24} className="text-[#D4AF37]" />
                          </div>

                          <div className="space-y-8">
                             {/* The "Safe" Visualization */}
                             <div className="relative w-full aspect-square max-w-[300px] mx-auto">
                                <div className="absolute inset-0 border-[20px] border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                                <div className="absolute inset-4 border border-dashed border-[#D4AF37]/30 rounded-full" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                   <div className="w-40 h-40 bg-[#1A1A1B] rounded-[40px] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_80px_rgba(212,175,55,0.2)]">
                                      <Lock size={64} className="text-[#D4AF37]" />
                                   </div>
                                </div>
                                {/* Data Points */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1c1c1e] px-4 py-2 rounded-full border border-gray-800 text-[10px] font-bold text-white shadow-xl">
                                   256-Bit Encrypted
                                </div>
                                <div className="absolute top-1/4 -right-12 bg-[#1c1c1e] px-4 py-2 rounded-full border border-gray-800 text-[10px] font-bold text-[#D4AF37] shadow-xl">
                                   Offline Backup
                                </div>
                                <div className="absolute bottom-1/4 -left-12 bg-[#1c1c1e] px-4 py-2 rounded-full border border-gray-800 text-[10px] font-bold text-gray-300 shadow-xl">
                                   Probate Shield
                                </div>
                             </div>

                             <div className="bg-black/40 rounded-3xl p-8 border border-white/5 backdrop-blur-sm space-y-6">
                                <div className="flex items-center justify-between">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Vault Status</span>
                                   <span className="px-3 py-1 bg-[#D4AF37]/20 rounded-full text-[8px] font-black text-[#D4AF37] uppercase animate-pulse">Armored</span>
                                </div>
                                <div className="space-y-3">
                                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                      <div className="h-full w-3/4 bg-gradient-to-r from-[#D4AF37] to-[#886B1D]" />
                                   </div>
                                   <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter text-gray-500">
                                      <span>Security Integrity</span>
                                      <span>99.9%</span>
                                   </div>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed italic text-center">
                                   "The Heritage Plan ensures your most sensitive data—passwords, deeds, and recorded wishes—never enter the public domain while ensuring your heirs receive them exactly when needed."
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <QuoteSection />
        <TestimonialSection />

        {/* FORMATION PACKAGES */}
        <section id="packages" className="py-40 px-6 bg-white border-t border-gray-50 relative overflow-hidden">
           <div className="max-w-[1400px] mx-auto space-y-24">
              <div className="space-y-6 max-w-3xl mx-auto text-center">
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-[#1D1D1F]">Choose Your <span className="italic-serif lowercase text-[#007AFF]">Plan.</span></h2>
                <p className="text-lg text-gray-500 font-medium italic leading-relaxed">Simple, transparent pricing. No "nickel and diming" folklore.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-stretch pt-8 max-w-5xl mx-auto">
                 {formationPackages.map((pkg, idx) => (
                   <div key={pkg.id} className="animate-in fade-in slide-in-from-bottom-12 fill-mode-backwards" style={{ animationDelay: `${idx * 150}ms` }}>
                      <PackageCard 
                        {...pkg} 
                        active={selectedPackage?.id === pkg.id} 
                        onClick={() => handleSelection(pkg)} 
                        isDark={false}
                        badge={pkg.id === 'sovereign' ? "Premium Protocol" : null}
                      />
                   </div>
                 ))}
              </div>
               
  <p className="text-center text-xs text-gray-400 font-medium italic max-w-2xl mx-auto border-t border-gray-100 pt-8 mt-16">
                  * All packages include Florida Registered Agent service, free for the first 12 months. Service automatically renews at $129/year to maintain your privacy shield. Cancel anytime.
               </p>

               {/* CONSOLIDATED DISCLOSURES */}
        
           </div>
        </section>

        {/* PRIVACY FEATURE */}
        <section id="privacy" className="py-48 px-6 bg-[#1D1D1F] text-white text-center overflow-hidden relative">
           <div className="max-w-[1000px] mx-auto space-y-12 relative z-10">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto text-[#007AFF] shadow-[0_0_60px_rgba(0,122,255,0.3)]"><Settings size={40} /></div>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">The DeLand Hub.</h2>
              <p className="text-2xl text-gray-400 font-medium italic leading-relaxed">
                "We own the whole widget. Your Registered Agent, your physical address, and your mail scanning are all handled by our secure Florida facility."
              </p>
              <div className="grid sm:grid-cols-3 gap-8 pt-12 border-t border-white/10">
                  <div className="space-y-2">
                     <p className="text-4xl font-black text-white">$0</p>
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Year 1 Privacy Address</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-4xl font-black text-white">100%</p>
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Solicitor Shield</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-4xl font-black text-white">24/7</p>
                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Digital Access</p>
                  </div>
              </div>
           </div>
           <div className="absolute inset-0 bg-gradient-to-b from-[#007AFF]/5 to-transparent pointer-events-none" />
        </section>
        {/* AEO QUICK ANSWERS - STRUCTURED RETRIEVAL GRID */}
        <section id="aeo-answers" className="py-40 px-6 bg-white border-t border-gray-50">
           <div className="max-w-[1400px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                 <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 text-[#00D084] text-[10px] font-black uppercase tracking-[0.3em] bg-[#00D084]/5 px-4 py-2 rounded-full border border-[#00D084]/10">
                       <Brain size={14} />
                       <span>Answer Engine Optimization</span>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-[#0A0A0B]">
                       Quick <br/><span className="text-gray-200">Answers.</span>
                    </h2>
                 </div>
                 <p className="max-w-md text-gray-500 font-medium italic text-right leading-relaxed">
                   "We've made finding authoritative answers easy. If you have a question about Florida LLCs, we have the consensus-backed answer."
                 </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <QASector 
                    category="Privacy"
                    question="How does an Anonymous LLC work in Florida?"
                    answer="By utilizing a double-entity structure, we utilize protocols designed to help disconnect your name from the public record. Your Florida LLC is managed by a Wyoming Holding Company, keeping your personal identity invisible to public searches."
                 />
                 <QASector 
                    category="Compliance"
                    question="What are the monthly maintenance requirements?"
                    answer="Charter Legacy automates your compliance heartbeat. We provide tracking for statutory notifications designed to help you avoid administrative dissolution by ensuring you never miss a critical filing deadline."
                 />
                 <QASector 
                    category="Legal"
                    question="Is this legal under Florida statutes?"
                    answer="Our protocol is built upon standard Florida statutory frameworks. As a technology-driven scrivener, we help you formalize documents using state-standard templates while prioritizing your right to privacy."
                 />
                 <QASector 
                    category="Succession"
                    question="How do I transfer my business to my heirs?"
                    answer="Our Heritage Plan integrates the Legacy Vault directly into your Operating Agreement. This allows for a streamlined transfer of ownership that is designed to help families avoid the probate process for these business assets."
                 />
                 <QASector 
                    category="Finance"
                    question="Are there hidden filing fees?"
                    answer="No. Our pricing is transparent. Your foundation package includes state filing fees and 12 months of Registered Agent service. We maintain a zero-hidden-trap policy."
                 />
                 <QASector 
                    category="Support"
                    question="Can I talk to a human if needed?"
                    answer="While our interface is automated for speed, our Florida-based team of support specialists is available for protocol support. We provide institutional-grade service for private clients."
                 />
              </div>
           </div>
        </section>
      </main>

      <footer className="py-32 bg-white text-center flex flex-col items-center gap-10">
         <span className="font-black text-3xl uppercase tracking-tighter">Charter <span className="italic-serif lowercase">Legacy</span></span>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em]">Florida Business Hub â€¢ High-Tech Scrivener â€¢ v3.1.0</p>
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
