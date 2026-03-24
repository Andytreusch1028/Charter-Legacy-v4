import React, { useState, useEffect } from 'react';
import { 
  X, ArrowRight, Lock, CheckCircle2, Fingerprint, FileCheck, 
  Building2, Zap, Check, Shield, Anchor, Loader2 
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

/**
 * CheckoutForm
 * Stripe Payment Element integration.
 */
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

/**
 * CheckoutSector (SpecSheet)
 * The recursive acquisition engine for CharterLegacy.
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
    const { data } = await supabase.from('llcs').select('*').eq('user_id', userId);
    setUserLLCs(data || []);
    return data || [];
  };

  const handleNext = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
          setUser(session.user);
          const llcs = await fetchUserLLCs(session.user.id);
          if (item.id === 'will') {
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
          const { data: intentData } = await supabase.functions.invoke('create-payment-intent', {
              body: { packageId: item.id, userId: authenticatedUser.id }
          });
          if (intentData?.clientSecret) setClientSecret(intentData.clientSecret);
          setStep('payment');
      } catch (err) {
          setStep('payment'); // Fallback to mock
      } finally {
          setLoading(false);
      }
  };

  const handleSetup = async () => {
      setLoading(true);
      try {
          const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
          let authenticatedUser = data.user;
          if (signUpError && signUpError.message.includes("already registered")) {
              const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
              authenticatedUser = signInData.user;
          }
          setUser(authenticatedUser);
          const llcs = await fetchUserLLCs(authenticatedUser.id);
          if (item.id === 'will') {
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
    const productMap = { 'founder': 'founders_shield', 'sovereign': 'double_llc_protocol', 'will': 'legacy_will' };
    await supabase.from('llcs').insert([{ 
        user_id: user.id, 
        product_type: productMap[item.id] || 'standard',
        llc_name: selectedLLC ? selectedLLC.llc_name : (manualLLC.name || 'Pending Formation'),
        llc_status: selectedLLC ? 'Active' : 'Setting Up',
        privacy_shield_active: true
    }]);
    setStep('success');
    setLoading(false);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white w-full max-w-xl rounded-[48px] p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 text-left border border-gray-100">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all z-10"><X size={18} /></button>
        
        {step === 'details' && (
           <div className="space-y-8 animate-in slide-in-from-right duration-500 text-black">
              <h2 className="text-4xl font-black uppercase tracking-tighter">{item.title}</h2>
              <div className="bg-[#F5F5F7] p-6 rounded-2xl border border-gray-100/50">
                 <p className="text-base text-gray-600 font-medium leading-relaxed italic">"{item.plainEnglish}"</p>
              </div>
              <button onClick={handleNext} disabled={loading} className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Continue"}
              </button>
           </div>
        )}

        {step === 'setup' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500 text-black">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Create Your ID.</h2>
                <div className="space-y-4">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 px-6 font-bold text-lg outline-none" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Secure Password" className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 px-6 font-bold text-lg outline-none" />
                </div>
                <button onClick={handleSetup} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify Identity"}
                </button>
            </div>
        )}

        {step === 'payment' && (
           <div className="space-y-8 animate-in slide-in-from-right duration-500 text-black">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Secure Payment.</h2>
              <div className="p-6 bg-[#F5F5F7] rounded-3xl space-y-4 border border-gray-100">
                {clientSecret ? (
                   <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm onSuccess={handlePaymentSuccess} onError={setError} />
                   </Elements>
                ) : (
                   <button onClick={handlePaymentSuccess} disabled={loading} className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl">
                       {loading ? <Loader2 className="animate-spin mx-auto" /> : "Complete Mock Transaction"}
                   </button>
                )}
              </div>
           </div>
        )}

        {step === 'success' && (
           <div className="space-y-8 animate-in zoom-in duration-500 text-center py-8 text-black">
              <div className="w-24 h-24 bg-[#007AFF] text-white rounded-full flex items-center justify-center mx-auto shadow-2xl"><Check size={48} strokeWidth={3} /></div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Protocol Active</h2>
              <button onClick={() => onSuccess(user)} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl">Proceed to Console</button>
           </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSector;
