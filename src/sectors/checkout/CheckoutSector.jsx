import React, { useState, useEffect } from 'react';
import { 
  X, ArrowRight, Lock, CheckCircle2, Fingerprint, FileCheck, 
  Building2, Zap, Check, Shield, Anchor, Loader2, Info, CreditCard
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';
import BackgroundEffects from '../../shared/design-system/BackgroundEffects';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/**
 * CheckoutForm
 * Stripe Payment Element integration with 'night' theme.
 */
const CheckoutForm = ({ onSuccess, onError, processing, setProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/dashboard',
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
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      {errorMessage && (
        <div className="p-4 bg-red-500/10 text-red-400 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-500/20">
            <X size={14} /> {errorMessage}
        </div>
      )}
      <button 
        type="submit" 
        disabled={!stripe || processing} 
        className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {processing ? <Loader2 className="animate-spin" /> : <>Authorize Transaction <Lock size={16} /></>}
      </button>
    </form>
  );
};

/**
 * CheckoutSector
 * The high-density 'Protocol Initialization' acquisition engine.
 */
const CheckoutSector = ({ item, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('details'); 
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [userLLCs, setUserLLCs] = useState([]);
  const [manualLLC, setManualLLC] = useState({ name: '', sunbizId: '' });
  const [selectedLLC, setSelectedLLC] = useState(null);

  useEffect(() => { 
      if (isOpen) {
          setStep(item?.id === 'unselected' ? 'selection' : 'details'); 
          setError('');
          setLoading(false);
          setClientSecret('');
          setUserLLCs([]);
          setManualLLC({ name: '', sunbizId: '' });
          setSelectedLLC(null);
      }
  }, [isOpen]);

  const fetchUserLLCs = async (userId) => {
    const { data } = await supabase.from('llcs').select('*').eq('user_id', userId);
    setUserLLCs(data || []);
    return data || [];
  };

  const handleNext = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
          setUser(session.user);
          const llcs = await fetchUserLLCs(session.user.id);
          if (item?.id === 'will') {
              setStep(llcs.length > 0 ? 'llc_confirm' : 'llc_active_check');
          } else {
              await initializePayment(session.user);
          }
      } else {
          setStep('setup');
      }
  };

  const initializePayment = async (authenticatedUser) => {
      setLoading(true);
      try {
          const { data, error } = await supabase.functions.invoke('create-payment-intent', {
              body: { packageId: item.id, userId: authenticatedUser.id }
          });
          if (error) throw error;
          if (data?.clientSecret) {
              setClientSecret(data.clientSecret);
          } else if (data?.error) {
              throw new Error(data.error);
          }
          setStep('payment');
      } catch (err) {
          console.error('Failed to create payment intent:', err);
          
          if (err?.message?.includes('401') || err?.status === 401) {
              await supabase.auth.signOut();
              setError('Session expired. Please re-verify identity.');
              setStep('setup');
          } else {
              setError(err.message || 'Unable to initiate payment. Please try again later.');
              setStep('details');
          }
      } finally {
          setLoading(false);
      }
  };

  const handleSetup = async () => {
      setLoading(true);
      try {
          const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
          let authenticatedUser = data?.user;
          if (signUpError && signUpError.message.includes("already registered")) {
              const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
              authenticatedUser = signInData?.user;
          }
          if (!authenticatedUser) throw new Error("Authentication failed.");
          
          setUser(authenticatedUser);
          const llcs = await fetchUserLLCs(authenticatedUser.id);
          if (item?.id === 'will') {
              setStep(llcs.length > 0 ? 'llc_confirm' : 'llc_active_check');
          } else {
              await initializePayment(authenticatedUser);
          }
      } catch (err) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handlePaymentSuccess = async () => {
    setLoading(true);
    const selectedItem = (item && item.id !== 'unselected') ? item : selectedLLC;
    const finalItem = selectedItem || item; // Fallback

    const productId = finalItem?.id || (item?.id !== 'unselected' ? item?.id : 'founder');
    const productMap = { 'founder': 'founders_shield', 'sovereign': 'double_llc_protocol', 'will': 'legacy_will' };
    
    await supabase.from('llcs').insert([{ 
        user_id: user.id, 
        product_type: productMap[productId] || 'standard',
        llc_name: manualLLC.name?.trim() || 'Pending Formation',
        principal_address: 'Charter Privacy Address', // Default until Designation Protocol
        llc_status: 'Setting Up',
        privacy_shield_active: true
    }]);
    setStep('success');
    setLoading(false);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#050506]/90 backdrop-blur-3xl" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[85vh] md:h-auto max-h-[95vh] bg-[#0A0A0B] rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95">
        <BackgroundEffects />
        
        {/* Manifest Sidebar (Steve-Standard Data) */}
        <div className="w-full md:w-[380px] bg-white/[0.02] border-r border-white/[0.05] p-8 md:p-12 relative z-10 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                <Anchor size={12} /> Acquisition_Manifest
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
                {(selectedLLC || item)?.title}
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{(selectedLLC || item)?.price}</span>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Protocol Fee</span>
              </div>
            </div>

            <div className="space-y-6">
               <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/[0.05] space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <Info size={12} /> Parameters
                  </div>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                    "{(selectedLLC || item)?.plainEnglish}"
                  </p>
               </div>

               <div className="space-y-3">
                 {[
                   { label: 'Registered Agent', value: 'Live' },
                   { label: 'Encryption', value: '256-Bit' },
                   { label: 'Latency Node', value: '14ms' },
                   { label: 'Jurisdiction', value: (selectedLLC || item)?.id === 'sovereign' ? 'FL + WY' : 'FL' }
                 ].map((param, i) => (
                   <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{param.label}</span>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{param.value}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.05] hidden md:block">
            <div className="flex items-center gap-3 text-gray-600">
              <Shield size={16} />
              <div className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                Secured by <br/> <span className="text-gray-400">Zero-Knowledge Architecture</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Window (Jony-Standard UI) */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center overflow-y-auto">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl shadow-xl hover:bg-white hover:text-black transition-all text-gray-400">
            <X size={20} />
          </button>

          <div className="max-w-md mx-auto w-full space-y-10">
            {step === 'selection' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black uppercase tracking-tighter">Select Your Shield</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Choose the protocol that matches your visibility requirements.
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    { id: 'founder', title: 'Privacy Shield', price: '$249', desc: 'Standard Florida Anonymity' },
                    { id: 'sovereign', title: 'Double LLC', price: '$999', desc: 'Full Florida + Wyoming Shield' }
                  ].map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setSelectedLLC({
                          id: p.id,
                          title: p.title,
                          price: p.price,
                          plainEnglish: p.id === 'founder' 
                            ? "We file your official setup paperwork and list our registered office to protect your home address."
                            : "The full anonymity structure — Florida + Wyoming holding company. Your name never touches the public record."
                        });
                      }}
                      className={`relative p-6 rounded-3xl border text-left transition-all group ${
                        selectedLLC?.id === p.id 
                          ? 'bg-white border-white text-black' 
                          : 'bg-white/[0.02] border-white/10 text-white hover:border-white/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-black uppercase tracking-widest ${selectedLLC?.id === p.id ? 'text-black/40' : 'text-gray-600'}`}>{p.title}</span>
                        <span className="font-black text-lg">{p.price}</span>
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-tight leading-relaxed ${selectedLLC?.id === p.id ? 'text-black/60' : 'text-gray-500'}`}>
                        {p.desc}
                      </p>
                      {selectedLLC?.id === p.id && (
                        <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                          {/* Optional: Checkmark or pulse */}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setStep('details')}
                  disabled={!selectedLLC}
                  className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all disabled:opacity-20"
                >
                  Configure Protocol
                </button>
              </div>
            )}

            {step === 'details' && (
               <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">Initialize Protocol</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      Begin the formation sequence. This will initialize your infrastructure and registered agent nexus.
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Company Name</label>
                          <input 
                              type="text" 
                              value={manualLLC.name}
                              onChange={(e) => setManualLLC({ ...manualLLC, name: e.target.value })}
                              placeholder="e.g. Acme Innovations LLC"
                              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 font-black text-sm uppercase tracking-widest text-white outline-none focus:border-white/30 transition-all placeholder:text-gray-700" 
                          />
                      </div>
                  </div>

                  <button 
                    onClick={handleNext} 
                    disabled={loading || !manualLLC.name.trim()} 
                    className="group w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20 disabled:hover:scale-100 disabled:active:scale-100"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Access System <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></>}
                  </button>
                  {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center mt-4">Error: {error}</p>}
               </div>
            )}

            {step === 'setup' && (
                <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Verify Identity</h3>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        Configure your administrative credentials to secure your formation and vault.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="ADMIN_EMAIL" 
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 font-black text-sm uppercase tracking-widest text-white outline-none focus:border-white/30 transition-all placeholder:text-gray-700" 
                      />
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="SYSTEM_KEY" 
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 font-black text-sm uppercase tracking-widest text-white outline-none focus:border-white/30 transition-all placeholder:text-gray-700" 
                      />
                    </div>
                    {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>}
                    <button 
                      onClick={handleSetup} 
                      disabled={loading} 
                      className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify Identity"}
                    </button>
                </div>
            )}

            {step === 'payment' && (
               <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                      <CreditCard size={24} className="text-gray-600" /> Payment.
                    </h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      Encrypted transaction authorization via Stripe. Your card data never touches our server.
                    </p>
                  </div>
                  <div className="p-8 bg-white/[0.02] rounded-[32px] border border-white/[0.05]">
                    {clientSecret ? (
                       <>
                        {step === 'payment' && clientSecret && clientSecret !== 'mock_secret' && (
                          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                              <Elements stripe={stripePromise} options={{ 
                                  clientSecret,
                                  appearance: {
                                      theme: 'night',
                                      variables: {
                                          colorPrimary: '#ffffff',
                                          colorBackground: '#0a0a0a',
                                          colorText: '#ffffff',
                                          colorDanger: '#ff4444',
                                          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                          spacingUnit: '4px',
                                          borderRadius: '12px'
                                      }
                                  }
                              }}>
                                  <CheckoutForm 
                                    onSuccess={handlePaymentSuccess} 
                                    onError={setError} 
                                    processing={loading} 
                                    setProcessing={setLoading} 
                                  />
                              </Elements>
                          </div>
                        )}

                        {step === 'payment' && clientSecret === 'mock_secret' && (
                          <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500 flex flex-col items-center">
                              <div className="p-4 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-xl border border-yellow-500/20 w-full text-center">
                                  <Info size={16} className="inline mr-2" />
                                  DEV MODE: Stripe Secret Key is missing in Supabase Secrets.<br/>
                                  Bypassing Stripe for testing.
                              </div>
                              <button 
                                  onClick={handlePaymentSuccess} 
                                  className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                              >
                                  Simulate Payment Success <CheckCircle2 size={16} />
                              </button>
                              <button 
                                   onClick={() => setStep('details')}
                                   className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                              >
                                  Cancel
                              </button>
                          </div>
                        )}
                       </>
                    ) : (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="animate-spin" />
                        </div>
                    )}
                  </div>
               </div>
            )}

            {step === 'success' && (
               <div className="space-y-10 animate-in zoom-in duration-500 text-center py-8">
                  <div className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                    <Check size={48} strokeWidth={3} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black uppercase tracking-tighter">Protocol Active</h2>
                    <p className="text-sm text-gray-500 font-medium">Your formation and privacy shield are being initialized at state agencies.</p>
                  </div>
                  <button 
                    onClick={() => onSuccess(user)} 
                    className="w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
                  >
                    Proceed to Console
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSector;
