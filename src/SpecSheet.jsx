import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { 
  X, Lock, Check, Loader2, Mail, CreditCard, ArrowRight 
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { marketingTriggerService } from './lib/MarketingTriggerService';

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
  const [externalLLCBOI, setExternalLLCBOI] = useState(false);   // User has LLC not filed by us
  const [existingBOIStatus, setExistingBOIStatus] = useState(null); // 'already_filed' | 'not_filed' | null
  const [existingLLCInfo, setExistingLLCInfo] = useState(null);   // Their Charter LLC on record

  // ── Computed BOI scenario flags ───────────────────────────────────────────
  const FORMATION_IDS = ['founder', 'medical', 'contractor', 'sovereign_upgrade'];
  const boiIncludedInPackage = FORMATION_IDS.includes(item?.id); // BOI ships with formation
  const boiNotApplicable     = item?.id === 'will';               // Succession doc — BOI irrelevant
  const isPrivacyShieldOnly  = item?.id === 'privacy_shield';     // May have external LLC

  useEffect(() => {
    if (isOpen) {
        setStep('details');
        // Formation packages → pre-include BOI (locked). Sovereign upgrade → both.
        setBoiAdded(boiIncludedInPackage);
        setBreachAdded(item?.id === 'sovereign_upgrade');
        setExternalLLCBOI(false);
        setExistingBOIStatus(null);
        setExistingLLCInfo(null);
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

          // ── POST-AUTH BOI CHECK ───────────────────────────────────────────
          // Check if user already has a Charter LLC with BOI on file.
          // This covers two cases:
          //   1. Privacy Shield buyer who formed with us before → BOI already done
          //   2. Returning customer adding a new product → no double-billing
          try {
              const { data: existingLLCs } = await supabase
                  .from('llcs')
                  .select('id, product_type, llc_name, boi_filed')
                  .eq('user_id', authenticatedUser.id);

              if (existingLLCs && existingLLCs.length > 0) {
                  const charterFormationTypes = ['founders_shield', 'medical_pllc', 'trade_professional'];
                  const charterLLC = existingLLCs.find(llc => charterFormationTypes.includes(llc.product_type));

                  if (charterLLC) {
                      setExistingLLCInfo(charterLLC);
                      // BOI is always included in Charter formation packages
                      setExistingBOIStatus('already_filed');
                      setBoiAdded(false); // Remove from add-on total — already covered
                  }
              }
          } catch (boiCheckErr) {
              // Non-fatal: if check fails, don't block checkout
              console.warn('[BOI Check] Could not verify existing LLC status:', boiCheckErr.message);
          }

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

              if (dbError) {
                  console.error("DB Error:", dbError);
              } else {
                  // --- MARKETING AGGREGATE TRIGGER ---
                  // Trigger the formation accepted milestone here contextually
                  if (item.id !== 'will') { // Assuming will is not an LLC formation
                    marketingTriggerService.triggerMilestone('LLC Formation Accepted', {
                        userId: user.id,
                        package: item.id,
                        price: item.price,
                        privacyShieldIncluded: true
                    }).catch(err => console.error("Non-blocking Marketing Error:", err));
                  }
              }
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
             
             <div className="space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">What&apos;s Included in Your Order:</p>
                <div className="grid gap-4">
                    {[
                      { id: 1, name: 'Florida Registered Agent', sub: 'State Filing & Registered Agent Service' },
                      { id: 2, name: 'Privacy Shield', sub: 'Your home address removed from every public record' },
                      { id: 3, name: 'Successor Plan', sub: 'Transfer on Death Document Service' }
                    ].filter(p => item.id === 'will' ? p.id === 3 : true)
                     .map((p) => {
                       const isActive = (item.includedProtocols || []).includes(p.id);
                       return (
                         <div key={p.id} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                           isActive 
                             ? 'bg-black text-white border-black shadow-lg scale-[1.02]' 
                             : 'bg-gray-50 border-gray-100 opacity-40'
                         }`}>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{p.name}</p>
                               <p className={`text-[9px] font-medium leading-none ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                                 {isActive ? p.sub : 'Not in this package'}
                               </p>
                            </div>
                            {isActive ? (
                               <div className="w-6 h-6 rounded-full bg-[#00D084] flex items-center justify-center text-black">
                                  <Check size={14} strokeWidth={4} />
                               </div>
                            ) : (
                               <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Not included</span>
                            )}
                         </div>
                       );
                     })}
                </div>
             </div>

             {/* ── BOI SECTION: 3 SCENARIOS ─────────────────────────────────── */}

             {/* Scenario A: Formation package → BOI included, locked green card */}
             {boiIncludedInPackage && (
               <div className="flex items-center justify-between p-5 rounded-2xl border mb-4 bg-emerald-50 border-emerald-200">
                 <div className="flex items-center gap-4">
                   <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                     <Check size={14} strokeWidth={3} />
                   </div>
                   <div className="space-y-0.5">
                     <p className="text-xs font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2">
                       Federal BOI Filing
                       <span className="text-[9px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-black">INCLUDED</span>
                     </p>
                     <p className="text-[10px] font-medium text-emerald-600 max-w-[220px]">
                       Included with your LLC formation. We file your FinCEN Beneficial Ownership report automatically.
                     </p>
                   </div>
                 </div>
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">$0</span>
               </div>
             )}

             {/* Scenario B: Privacy Shield only → optional add-on + external LLC option */}
             {!boiIncludedInPackage && !boiNotApplicable && (
               <>
                 {existingBOIStatus === 'already_filed' && existingLLCInfo && (
                   <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 mb-4">
                     <Check size={14} className="text-blue-500 shrink-0" />
                     <p className="text-[10px] font-bold text-blue-700 leading-tight">
                       Your BOI is already on file from when we formed <span className="font-black">{existingLLCInfo.llc_name || 'your LLC'}</span>. No action needed.
                     </p>
                   </div>
                 )}
                 {existingBOIStatus !== 'already_filed' && (
                   <div
                     onClick={() => setBoiAdded(!boiAdded)}
                     className={`flex items-center justify-between p-5 rounded-2xl border mb-4 cursor-pointer transition-all ${boiAdded ? 'bg-black text-white border-black' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                   >
                     <div className="flex items-center gap-4">
                       <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${boiAdded ? 'bg-white text-black border-transparent' : 'border-gray-200'}`}>
                         <Check size={14} className={boiAdded ? 'opacity-100' : 'opacity-0'} />
                       </div>
                       <div className="space-y-0.5">
                         <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                           Federal BOI Filing
                           <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${boiAdded ? 'bg-white text-black' : 'bg-amber-100 text-amber-700'}`}>REQUIRED BY FEDERAL LAW</span>
                         </p>
                         <p className={`text-[10px] font-medium leading-tight max-w-[220px] ${boiAdded ? 'text-gray-400' : 'text-gray-500'}`}>
                           We file your mandatory FinCEN Beneficial Ownership report. *Future ownership changes require a new filing.
                         </p>
                       </div>
                     </div>
                     <span className={`text-xs font-black ${boiAdded ? 'text-[#00D084]' : 'text-gray-400'}`}>+$149</span>
                   </div>
                 )}
                 {isPrivacyShieldOnly && (
                   <div
                     onClick={() => setExternalLLCBOI(!externalLLCBOI)}
                     className={`flex items-center justify-between p-5 rounded-2xl border mb-4 cursor-pointer transition-all ${externalLLCBOI ? 'bg-black text-white border-black' : 'bg-white border-dashed border-gray-200 hover:border-gray-300'}`}
                   >
                     <div className="flex items-center gap-4">
                       <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${externalLLCBOI ? 'bg-white text-black border-transparent' : 'border-gray-200'}`}>
                         <Check size={14} className={externalLLCBOI ? 'opacity-100' : 'opacity-0'} />
                       </div>
                       <div className="space-y-0.5">
                         <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                           BOI for My Existing Business
                           <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${externalLLCBOI ? 'bg-white text-black' : 'bg-gray-100 text-gray-500'}`}>NOT FILED BY US</span>
                         </p>
                         <p className={`text-[10px] font-medium leading-tight max-w-[220px] ${externalLLCBOI ? 'text-gray-400' : 'text-gray-500'}`}>
                           I have an LLC formed elsewhere. File my FinCEN BOI report as a standalone service.
                         </p>
                       </div>
                     </div>
                     <span className={`text-xs font-black ${externalLLCBOI ? 'text-[#00D084]' : 'text-gray-400'}`}>+$149</span>
                   </div>
                 )}
               </>
             )}

             {/* ── LEGACY: sovereign_upgrade fallback (kept for safety) ───────── */}
             {/* sovereign_upgrade: BOI separately shown via boiIncludedInPackage above */}

             {/* BREACH ALERTS TOGGLE */}

             <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-100">
                 <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total cost</p>
                    <p className="text-3xl font-black text-black">
                        {item.price}
                    </p>
                 </div>
                 <div className="space-y-2">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">LLC Filed Within</p>
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

export default SpecSheet;
