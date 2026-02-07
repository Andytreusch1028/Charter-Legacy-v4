import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { 
  Shield, ArrowRight, Lock, Zap, CheckCircle2, Fingerprint, 
  ChevronRight, X, Stethoscope, HardHat, Plus, Anchor, 
  History, Settings, HeartPulse, ShieldCheck, Menu, Brain, Check, Star, CreditCard, Loader2, Mail
} from 'lucide-react';

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
      <h2 className="text-3xl md:text-5xl font-medium italic leading-snug text-[#1D1D1F] tracking-tight">
        "We've automated <span className="text-[#007AFF] font-bold">30 years</span> of Florida legal folklore into a single, seamless engine. No beige forms. No hidden traps. Just your legacy, secured."
      </h2>
      <div className="flex items-center justify-center gap-3 pt-4 opacity-60">
        <div className="w-10 h-px bg-black" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Charter Legacy Protocol v3.1</span>
        <div className="w-10 h-px bg-black" />
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

import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

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
        {processing ? <Loader2 className="animate-spin" /> : <>Secure Checkout <Lock size={16} /></>}
      </button>
    </form>
  );
};

const SpecSheet = ({ item, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('details'); // details, setup, payment, success
  const [loading, setLoading] = useState(false);
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
          // 1. Try to Sign Up
          const { data, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
          });

          let authenticatedUser = data.user;

          if (signUpError) {
              // 2. If user exists, Try to Sign In
              if (signUpError.message.includes("already registered") || signUpError.message.includes("User already registered")) {
                  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                      email,
                      password,
                  });
                  
                  // HANDLE WRONG PASSWORD FOR EXISTING USER
                  if (signInError) {
                      if (signInError.message.includes("Invalid login credentials")) {
                          setError("Account exists, but password was incorrect.");
                          // Show Magic Link Option in UI (we'll use a specific error string to trigger it)
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

          // 3. Create Payment Intent (Fetch Client Secret)
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
             // Fallback for DEV/MOCK purposes if function fails or not deployed
             console.warn("Using Mock Payment Mode due to function error/missing");
             setClientSecret(''); // Proceed to legacy mock UI logic if needed, or handle error
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
                  emailRedirectTo: window.location.origin, // Redirect back to here
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
          // Create Placeholder LLC Record
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
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
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
               
               {/* CONDITIONAL RENDER: REAL STRIPE vs MOCK */}
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

import DashboardZenith from './DashboardZenith';

// --- MAIN APPLICATION ---

export default function App() {
  const [view, setView] = useState('landing'); 
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  // Shared User State for lifting up from SpecSheet
  const [appUser, setAppUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
          setAppUser(session.user);
          // Optional: Auto-redirect if session exists
          // setView('dashboard'); 
      }
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDashboardTransition = (user) => {
      setAppUser(user);
      setView('dashboard');
      setSelectedPackage(null);
  };

  const formationPackages = [
    { 
      id: 'founder', 
      title: "Standard LLC", 
      price: "$249", 
      icon: Shield, 
      description: "The definitive \"Founder's Shield\" vehicle. Zero home-address exposure.", 
      plainEnglish: "We file your official Articles with the State and list our registered office address on public record to help keep your home address private. Includes official setup within 24h.",
      features: ['Private Business Address', 'Free Mail Scanning (Year 1*)', 'Founder\'s Blueprint', 'Your Digital HQ'] 
    },
    { 
      id: 'medical', 
      title: "Medical PLLC", 
      price: "$499", 
      icon: Stethoscope, 
      description: "For Physicians & Practitioners. Full Board compliance tools.", 
      plainEnglish: "We form your Professional PLLC to align with State Medical Board requirements. Includes standard Patient Privacy Form templates designed for HIPAA compliance.",
      features: ['Board Compliance Tools', 'HIPAA Compliance Forms', 'Dept. of Health Registration', 'Priority Support'] 
    },
    { 
      id: 'contractor', 
      title: "Contractor LLC", 
      price: "$599", 
      icon: HardHat, 
      description: "For General Contractors. DBPR integration and license attachment.", 
      plainEnglish: "We form your LLC and assist with linking it to your Contractor's License. Includes the standard 'Verification of Authority' document often required for permitting.",
      features: ['DBPR License Linking', 'Qualifier License Attachment', 'Permit-Ready Documents', 'Priority Support'] 
    }
  ];

  const willPackage = { 
    id: 'will', 
    title: "The Legacy Will", 
    price: "$399", 
    icon: Anchor, 
    description: "Designed to help your family bypass probate court and access your business instantly.", 
    plainEnglish: "A secure digital Will template designed to help facilitate the transfer of your LLC ownership. This tool is built to help your family avoid probate court and legal delays.",
    features: ['Smart Transfer Rules', 'Notary-Ready Templates', 'Family Access Preview', 'Completeness Scan']
  };

  const handleSelection = (pkg) => {
    setSelectedPackage(pkg);
  };

  if (view === 'dashboard') {
      return <DashboardZenith user={appUser} />;
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans antialiased selection:bg-[#D4AF37] selection:text-white relative overflow-x-hidden">
      <style>{`
        .bg-mesh { background-image: radial-gradient(at 50% 0%, rgba(29, 29, 31, 0.03) 0, transparent 70%), radial-gradient(at 100% 100%, rgba(0, 122, 255, 0.05) 0, transparent 60%); }
        .text-glow { text-shadow: 0 0 60px rgba(0, 122, 255, 0.15); }
      `}</style>

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
            onClick={() => appUser ? setView('dashboard') : alert("Please start a business to create an account.")}
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
               <Fingerprint size={14} className="text-[#007AFF]" />
               <span className="text-gray-400">The High-Tech Scrivener Protocol</span>
            </div>
            
            <h1 className="text-6xl md:text-[8.5rem] font-black tracking-tighter leading-[0.9] uppercase text-[#1D1D1F] animate-in zoom-in-95 duration-1000">
              Your LLC.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1D1D1F] to-[#4A4A4A]">Your Privacy.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-500 font-medium italic leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
              Invisibility by Default. We keep your name off the public record so you can build in private.
            </p>

            <div className="pt-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
              <button onClick={() => document.getElementById('packages').scrollIntoView({behavior:'smooth'})} className="bg-[#1D1D1F] text-white px-16 py-8 rounded-[40px] font-black text-xl flex items-center gap-5 hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                Start My Business <ArrowRight size={28} className="text-[#007AFF]" />
              </button>
            </div>
          </div>
        </section>

        {/* CLIENT STATEMENT / FOLKLORE */}
        <QuoteSection />
        <TestimonialSection />

        {/* FORMATION PACKAGES */}
        <section id="packages" className="py-40 px-6 bg-white border-t border-gray-50 relative overflow-hidden">
           <div className="max-w-[1400px] mx-auto space-y-24">
              <div className="space-y-6 max-w-3xl mx-auto text-center">
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none text-[#1D1D1F]">Choose Your <span className="italic-serif lowercase text-[#007AFF]">Vehicle.</span></h2>
                <p className="text-lg text-gray-500 font-medium italic leading-relaxed">Simple, transparent pricing. No "nickel and diming" folklore.</p>
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
               
               <p className="text-center text-xs text-gray-400 font-medium italic max-w-2xl mx-auto border-t border-gray-100 pt-8">
                 * All packages include Florida Registered Agent service, free for the first 12 months. Service automatically renews at $129/year to maintain your privacy shield. Cancel anytime.
               </p>
           </div>
        </section>

        {/* SUCCESSION / WILL SECTION */}
        <section className="py-40 px-6 bg-[#1D1D1F] text-white relative overflow-hidden rounded-t-[3rem] -mt-12">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#007AFF]/10 to-transparent pointer-events-none" />
           <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
              <div className="space-y-12">
                 <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em]">
                       <Anchor size={14} />
                       <span>Succession Protocol</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">Secure The <span className="text-[#007AFF]">Driver.</span></h2>
                    <p className="text-2xl text-gray-400 font-medium italic leading-relaxed">
                      "You built the vehicle. Now protect the driver. The Legacy Will integrates with your Charter to ensure your shares transfer automatically."
                    </p>
                 </div>
                 <div className="space-y-6">
                    {willPackage.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 text-lg font-bold uppercase tracking-wide text-gray-300">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#D4AF37]">
                            <Check size={16} strokeWidth={3} />
                         </div>
                         {feature}
                      </div>
                    ))}
                 </div>
                 <div className="pt-4">
                    <button onClick={() => handleSelection(willPackage)} className="bg-white text-black px-12 py-6 rounded-full font-black text-lg uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center gap-4">
                       Add Legacy Will - $399 <ArrowRight size={24} />
                    </button>
                 </div>
              </div>

              {/* Will Card Representation */}
              <div className="relative">
                 <div className="absolute -inset-4 bg-gradient-to-br from-[#007AFF] to-[#D4AF37] rounded-[55px] opacity-20 blur-2xl" />
                 <PackageCard 
                    {...willPackage} 
                    active={false} 
                    onClick={() => handleSelection(willPackage)} 
                    isDark={false}
                 />
              </div>
           </div>
        </section>

        {/* PRIVACY FEATURE */}
        <section id="privacy" className="py-48 px-6 bg-[#1D1D1F] text-white text-center overflow-hidden relative">
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           <div className="max-w-4xl mx-auto space-y-16 relative z-10">
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
      </main>

      <footer className="py-32 bg-white text-center flex flex-col items-center gap-10">
         <span className="font-black text-3xl uppercase tracking-tighter">Charter <span className="italic-serif lowercase">Legacy</span></span>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em]">Florida Business Hub • High-Tech Scrivener • v3.1.0</p>
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
