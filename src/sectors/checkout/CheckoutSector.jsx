import React, { useState, useEffect } from 'react';
import { 
  X, ArrowRight, Lock, CheckCircle2, Fingerprint, FileCheck, 
  Building2, Zap, Check, Shield, Anchor, Loader2, Info, CreditCard, AlertCircle, Search, Plus
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';
import { calculateAvailabilityScore, SUNBIZ_RULES } from '../../lib/sunbiz-validator';
import BackgroundEffects from '../../shared/design-system/BackgroundEffects';
import FounderShieldExplainer from '../../FounderShieldExplainer';
import DoubleLLCExplainer from '../../DoubleLLCExplainer';

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
  const [availability, setAvailability] = useState(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  // Previous item ID tracking to prevent "hijacking" local selection state
  const [lastPropId, setLastPropId] = useState(null);

  useEffect(() => { 
      if (isOpen) {
          // Rule: Only reset if the actual prop ID has changed (new entry point)
          // This prevents internal selection (e.g. Formation Elite) from being reset
          const isNewPackage = item?.id !== lastPropId;
          const hasNewName = item?.llc_name && item.llc_name !== manualLLC.name;

            if (isNewPackage || hasNewName) {
              console.log(`[SYNC] Initializing for package: ${item?.id}`);
              // If the package is 'formation' (general entry) or 'unselected', show selection.
              // If the user upgraded from an explainer, they've already made their choice, so go to details.
              const startAtSelection = item?.id === 'unselected' || item?.id === 'formation';
              setStep(startAtSelection ? 'selection' : 'details'); 
              setError('');
              setLoading(false);
            setClientSecret('');
            setUserLLCs([]);
            setAvailability(null);
            
            setManualLLC({ 
              name: item?.llc_name || '', 
              sunbizId: '',
              isPrepopulated: !!item?.llc_name
            });
            setSelectedLLC(item); 
            setLastPropId(item?.id);
          }
      } else {
        // Reset tracking when closed
        setLastPropId(null);
      }
  }, [isOpen, item?.id, item?.llc_name]); 

  // Real-time Sunbiz Name Availability Engine
  const [showFounderInfo, setShowFounderInfo] = useState(false);
  const [showDoubleInfo, setShowDoubleInfo] = useState(false);

  useEffect(() => {
    if (!manualLLC.name || manualLLC.isPrepopulated) {
        setAvailability(null);
        return;
    }

    const checkName = async () => {
        setIsCheckingName(true);
        // Add a suffix if one isn't present for accurate statutory check
        let nameToCheck = manualLLC.name.toUpperCase().trim();
        const hasSuffix = SUNBIZ_RULES.MANDATORY_SUFFIXES.some(s => nameToCheck.endsWith(s));
        if (!hasSuffix) nameToCheck += " LLC";

        try {
            // Protocol: Real-Time Registry Bridge (Authoritative State Lookup)
            // Rule: Connect directly to search.sunbiz.org via Edge Function
            const { data, error } = await supabase.functions.invoke('sunbiz-lookup', {
                body: { name: nameToCheck }
            });

            if (error) throw error;
            if (!data) {
                console.warn("[SUNBIZ BRIDGE] No data returned from Registry.");
                throw new Error("Registry returned an empty response.");
            }

            if (!data.available && data.matches?.some(m => m === nameToCheck)) {
                // AUTHORITATIVE CONFLICT: State already has this exact record
                setAvailability({
                    score: 0,
                    status: 'State Conflict',
                    message: `Official Registry Conflict: This name is already taken in the State of Florida records.`,
                    logicExplanation: "Statutory Authority: Section 605.0112, F.S. The name you selected is an exact match for an existing entity in the Sunbiz database.",
                    closestMatches: data.matches.slice(0, 5).map(n => ({ name: n, similarity: 100 }))
                });
            } else {
                // RUN FORENSIC ENGINE: Analyze similarity against live matches
                const localResult = calculateAvailabilityScore(nameToCheck, data.matches || [], data.status || 'SUCCESS');
                setAvailability(localResult);
            }
        } catch (err) {
            console.error("[SUNBIZ BRIDGE ERROR]", err);
            // Fallback to local rules but mark as error to prevent false confidence
            const fallbackResult = calculateAvailabilityScore(nameToCheck, [], 'ERROR');
            setAvailability(fallbackResult);
        } finally {
            setIsCheckingName(false);
        }
    };

    const timer = setTimeout(checkName, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [manualLLC.name, manualLLC.isPrepopulated]);

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
          const finalPackageId = (selectedLLC && selectedLLC.id !== 'unselected') ? selectedLLC.id : item.id;
          const { data, error } = await supabase.functions.invoke('create-payment-intent', {
              body: { packageId: finalPackageId, userId: authenticatedUser.id }
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
    const productMap = { 'founder': 'founders_shield', 'sovereign': 'sovereign', 'will': 'legacy_will' };
    
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
        {step !== 'selection' && (
          <div className="w-full md:w-[380px] bg-white/[0.02] border-r border-white/[0.05] p-8 md:p-12 relative z-10 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left-6 duration-500">
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                  <Anchor size={12} /> Acquisition_Manifest
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-white">
                  {(selectedLLC || item)?.title || "NEW FLORIDA LLC FORMATION"}
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{(selectedLLC || item)?.price || "$399+"}</span>
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
        )}

        {/* Transaction Window (Jony-Standard UI) */}
        <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center overflow-y-auto">
          <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl shadow-xl hover:bg-white hover:text-black transition-all text-gray-400">
            <X size={20} />
          </button>

          <div className={`${step === 'selection' ? 'max-w-4xl' : 'max-w-md'} mx-auto w-full space-y-10`}>
            {step === 'selection' && (
              <div className="space-y-16 animate-in fade-in zoom-in-95 duration-700">
                <div className="text-center space-y-6">
                  <h3 className="text-5xl font-black uppercase tracking-tighter">Identity Shielding</h3>
                  <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
                    Select your architecture. These protocols determine the visibility and structural depth of your formation.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[
                    { 
                      id: 'founder', 
                      title: 'Formation Core', 
                      price: '$399', 
                      desc: 'Standard Anonymity', 
                      icon: Shield,
                      features: ['Privacy Address', 'State Documents', 'Registered Agent', 'Digital Vault Admission']
                    },
                    { 
                      id: 'sovereign', 
                      title: 'Formation Elite', 
                      price: '$999', 
                      desc: 'Ultimate Anonymity', 
                      icon: Zap,
                      features: ['Wyoming Parent LLC', 'Full Asset Shielding', 'Zero-Contact Registry', 'Family Handover Protocol']
                    }
                  ].map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        setSelectedLLC({
                          id: p.id,
                          title: p.title === 'Formation Elite' ? 'Formation Elite Protocol' : 'Formation Core',
                          price: p.price,
                          plainEnglish: p.id === 'founder' 
                            ? "Charter Legacy filings emphasize absolute anonymity. We file your official state documents and list our registered office as your principal address to keep your name off the public grid."
                            : "The ultimate privacy architecture. We create a Florida LLC owned by a Wyoming holding company. This two-layer structure ensures your identity never touches any state registry."
                        });
                        setStep('details');
                      }}
                      className={`relative p-12 rounded-[48px] border text-left transition-all duration-700 group overflow-hidden ${
                        selectedLLC?.id === p.id 
                          ? 'bg-white border-white text-black shadow-[0_40px_80px_rgba(255,255,255,0.15)] scale-[1.03]' 
                          : 'bg-white/[0.02] border-white/5 text-white hover:border-white/20 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="space-y-10 relative z-10">
                        <div className="flex justify-between items-start">
                          <div className={`p-6 rounded-[24px] ${selectedLLC?.id === p.id ? 'bg-black/5' : 'bg-white/5'}`}>
                            <p.icon size={48} strokeWidth={selectedLLC?.id === p.id ? 2.5 : 2} />
                          </div>
                          <div className="text-right">
                             <span className="block text-4xl font-black">{p.price}</span>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${selectedLLC?.id === p.id ? 'text-black/40' : 'text-gray-600'}`}>Protocol Fee</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <h4 className="text-3xl font-black uppercase tracking-tighter leading-none">{p.title}</h4>
                            <p className={`text-xs font-bold uppercase tracking-widest ${selectedLLC?.id === p.id ? 'text-black/40' : 'text-gray-500'}`}>
                              {p.desc}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (p.id === 'founder') setShowFounderInfo(true);
                              else setShowDoubleInfo(true);
                            }}
                            className={`px-5 py-2.5 rounded-full border transition-all duration-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transform hover:scale-[1.1] active:scale-[0.9] ${
                              p.id === 'sovereign'
                                ? selectedLLC?.id === p.id
                                  ? 'bg-[#00D084]/20 border-[#00D084]/40 text-[#008A58] shadow-[0_0_30px_rgba(0,208,132,0.3)]'
                                  : 'bg-[#00D084]/20 border-[#00D084]/40 text-[#00D084] shadow-[0_0_20px_rgba(0,208,132,0.2)] hover:bg-[#00D084] hover:text-black hover:shadow-[0_0_40px_rgba(0,208,132,0.4)]'
                                : selectedLLC?.id === p.id
                                  ? 'bg-black/10 border-black/20 text-black/60 hover:bg-black hover:text-white'
                                  : 'bg-white/10 border-white/20 text-white/60 hover:bg-white hover:text-black'
                            }`}
                          >
                            <span>More Information</span>
                            {p.id === 'sovereign' ? <Zap size={12} fill="currentColor" /> : <Plus size={12} />}
                          </button>
                        </div>
                        
                        <div className="space-y-3 pt-8 border-t border-current/10">
                           {p.features.map((f, i) => (
                             <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-60">
                               <Check size={14} strokeWidth={3} /> {f}
                             </div>
                           ))}
                        </div>
                      </div>
                      
                      {selectedLLC?.id === p.id && (
                        <div className="absolute -bottom-10 -right-10 opacity-5 scale-[2] pointer-events-none transition-all duration-1000 group-hover:scale-[2.5]">
                           <p.icon size={200} strokeWidth={0.5} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-8">
                  <button 
                    onClick={() => setStep('details')}
                    disabled={!selectedLLC}
                    className="group w-full max-w-md bg-white text-black py-8 rounded-[24px] font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(255,255,255,0.15)] hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-20 flex items-center justify-center gap-6"
                  >
                    Initialize Mission Control <ArrowRight size={24} className="group-hover:translate-x-4 transition-transform" />
                  </button>
                  <div className="flex items-center gap-4 opacity-40">
                     <div className="h-px w-12 bg-white/20"/>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                       Architect Selection Required
                     </p>
                     <div className="h-px w-12 bg-white/20"/>
                  </div>
                </div>
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
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                            {manualLLC.isPrepopulated ? "Established Entity" : "Company Name"}
                          </label>
                          <div className="relative group">
                            <input 
                                type="text" 
                                value={manualLLC.name}
                                onChange={(e) => setManualLLC({ ...manualLLC, name: e.target.value })}
                                placeholder="e.g. Acme Innovations LLC"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 font-black text-sm uppercase tracking-widest text-white outline-none focus:border-white/30 transition-all placeholder:text-gray-700" 
                            />
                            {manualLLC.isPrepopulated && (
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase tracking-widest text-[#00D084] pointer-events-none">
                                    Authoritative Data <Check size={10} className="inline ml-1" />
                                </div>
                            )}
                            {!manualLLC.isPrepopulated && (availability || isCheckingName) && (
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${
                                        isCheckingName ? 'text-gray-500' : 
                                        availability?.score === null ? 'text-[#00D084] italic' :
                                        (availability?.score ?? 0) >= 80 ? 'text-[#00D084]' : 'text-amber-500'
                                    }`}>
                                        {isCheckingName ? "Scoping Florida Registry..." : 
                                         availability?.isEnqueued ? "AUDIT ENQUEUED" :
                                         availability?.score === null ? "REGISTRY BUSY" :
                                         `${availability?.score ?? 0}% Available`}
                                    </span>
                                    {isCheckingName ? (
                                        <Loader2 size={10} className="animate-spin text-white/20" />
                                    ) : (
                                        <Shield size={10} className={availability?.score === null ? 'text-[#00D084]/50' : (availability?.score ?? 0) >= 80 ? 'text-[#00D084]' : 'text-amber-500'} />
                                    )}
                                </div>
                            )}
                          </div>
                          {manualLLC.isPrepopulated ? (
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-2 px-1 italic">
                                Using established record for {manualLLC.name}.
                            </p>
                          ) : (
                            <div className="mt-2 px-1 flex flex-col gap-1">
                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                                    {availability?.message || "Protocol: LLC, L.L.C. or Limited Liability Company suffix is mandatory."}
                                </p>
                            
                                {availability && (
                                    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-700">
                                        {/* Forensic Analysis Heading */}
                                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                            <Search size={10} className="text-gray-500" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Forensic Analysis: Florida Registry</span>
                                        </div>

                                        {/* Statutory Logic Explanation */}
                                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Info size={10} className="text-[#00D084]" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-[#00D084]">Statutory Basis</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                                                "{availability.logicExplanation}"
                                            </p>
                                        </div>

                                        {/* Closest Matches */}
                                        {availability.closestMatches && availability.closestMatches.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Closest Registry Matches</span>
                                                    <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">Similarity Index</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {availability.closestMatches.map((match, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => setManualLLC({ ...manualLLC, name: match.name || (typeof match === 'string' ? match : '') })}
                                                            className="flex items-center justify-between py-2 px-4 bg-white/[0.01] rounded-lg border border-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all group cursor-pointer active:scale-[0.98]"
                                                        >
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                                                                {match.name || (typeof match === 'string' ? match : 'UNKNOWN')}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1 w-12 bg-gray-800 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full transition-all duration-1000 ${match.similarity >= 90 ? 'bg-red-500' : match.similarity >= 70 ? 'bg-amber-500' : 'bg-emerald-500/50'}`} 
                                                                        style={{ width: `${match.similarity ?? (100 - (idx * 15))}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`text-[7px] font-black tracking-tighter ${match.similarity >= 90 ? 'text-red-500' : match.similarity >= 70 ? 'text-amber-500' : 'text-gray-600 uppercase'}`}>
                                                                    {match.similarity >= 90 ? 'CONFLICT' : match.similarity >= 70 ? 'MODERATE' : 'DISTINCT'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {availability.score !== null && availability.score < 80 && (
                                            <div className="pt-2">
                                                <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 bg-amber-500/5 py-2 px-3 rounded-lg border border-amber-500/10">
                                                    <AlertCircle size={10} /> Conflict detected. Refinement required for statutory approval.
                                                </span>
                                            </div>
                                        )}

                                        {availability.score === null && (
                                            <div className="pt-2">
                                                <div className="bg-[#00D084]/5 border border-[#00D084]/10 rounded-xl p-4 flex items-start gap-4">
                                                    <div className="bg-[#00D084]/10 p-2 rounded-lg">
                                                        <Shield size={14} className="text-[#00D084]" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#00D084]">Elite Audit Enqueued</p>
                                                        <p className="text-[9px] text-gray-500 font-medium leading-relaxed">
                                                            State registry is currently under heavy load. We have enqueued your name for an **Authoritative Professional Audit**. Our team will verify this with the Secretary of State manually.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                          )}
                      </div>
                  </div>

                  <button 
                    onClick={handleNext} 
                    disabled={loading || !manualLLC.name.trim() || (!manualLLC.isPrepopulated && (availability?.score ?? 0) < 80)} 
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
      {/* Detail Explainers */}
      <FounderShieldExplainer 
        isOpen={showFounderInfo} 
        onClose={() => setShowFounderInfo(false)} 
      />
      <DoubleLLCExplainer 
        isOpen={showDoubleInfo} 
        onClose={() => setShowDoubleInfo(false)} 
      />
    </div>
  );
};

export default CheckoutSector;
