import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  X,
  ArrowRight,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  AlertTriangle,
  Trash2,
  ShieldAlert
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder",
);

const CheckoutForm = ({ onSuccess, onError, amount }) => {
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
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
      if (onError) onError(error.message);
      setProcessing(false);
    } else {
      if (onSuccess) onSuccess();
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
        className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        {processing ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            Pay ${amount} & File Dissolution <Lock size={16} />
          </>
        )}
      </button>
    </form>
  );
};

const DissolutionWizard = ({ llcData, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const entityName = llcData?.llc_name || "Your LLC";
  const confirmRequired = entityName.toUpperCase();

  const generateConfirmation = () => {
    return "DISS-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSetupCheckout = async () => {
    setLoading(true);
    try {
      const { data: intentData, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: { packageId: 'llc_dissolution', userId: llcData?.user_id || 'system_fallback' },
        },
      );
      if (error) {
          console.warn("Edge function error. Falling back to Mock.", error.message);
          setClientSecret("mock");
      } else if (intentData?.clientSecret) {
          setClientSecret(intentData.clientSecret);
      } else {
          setClientSecret("mock");
      }
      setStep(4);
    } catch (err) {
      console.error("Failed to setup payment", err);
      setClientSecret("mock");
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    const code = generateConfirmation();
    setConfirmationCode(code);

    try {
      // 1. Update LLC status
      if (llcData?.id) {
        await supabase
          .from("llcs")
          .update({ llc_status: 'Dissolving' })
          .eq('id', llcData.id);
      }

      // 2. Queue for fulfillment team
      await supabase.from("marketing_queue").insert([{
          email: llcData?.user_id || "system@charterlegacy.com",
          event_type: "DISSOLUTION",
          metadata: {
            entity_id: llcData?.id,
            entity_name: llcData?.llc_name,
            document_number: llcData?.document_number || llcData?.sunbiz_document_number || '',
            confirmation_code: code,
            total_paid: 35.0,
          },
          status: "PENDING",
      }]);

      // 3. Log into Audit system
      await supabase.from("ra_document_audit").insert([{
          user_id: llcData?.user_id,
          action: "DISSOLUTION_ORDERED",
          actor_type: "CLIENT",
          metadata: { confirmation_code: code, total_paid: 35.0, entity_name: llcData?.llc_name },
      }]);

      setStep(5);
    } catch (err) {
      console.error("Failed to process checkout:", err);
      alert(`Error processing dissolution: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[500px] animate-in zoom-in-95 duration-500 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-red-100 bg-red-50/30">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-1 flex items-center gap-2">
              <ShieldAlert size={12}/> Permanent Action
            </p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              LLC Dissolution
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1: Warning & Explanation */}
            {step === 1 && (
              <motion.div
                key="diss-step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                  You Are About to Dissolve Your LLC
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  Filing Articles of Dissolution with the Florida Division of Corporations will <span className="font-bold text-red-600">permanently close</span> <span className="font-bold text-slate-900">"{entityName}"</span> as a legal entity.
                </p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <label className="text-[10px] font-black uppercase tracking-widest text-red-600 block mb-1">
                      What This Means
                    </label>
                    <ul className="text-sm font-medium text-red-700 space-y-1 list-disc list-inside">
                      <li>The entity will no longer have authority to conduct business in Florida.</li>
                      <li>The registered name will be released back into the public domain.</li>
                      <li>Any registered agent services tied to this entity will be terminated.</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">
                      Important Disclaimer
                    </label>
                    <p className="text-sm font-medium text-amber-700">
                      Charter Legacy files the statutory dissolution paperwork on your behalf. We do not provide legal or tax advice regarding the consequences of dissolving your LLC. Please consult an attorney or CPA for questions about outstanding liabilities, tax obligations, or legal implications.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Confirmation Gate */}
            {step === 2 && (
              <motion.div
                key="diss-step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight text-center">
                  Confirm Your Intent
                </h3>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto text-center">
                  This action is <span className="font-bold text-red-600">irreversible</span>. To proceed, type your entity name below exactly as shown.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 max-w-md mx-auto w-full">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">
                    Type: <span className="text-red-600 font-mono">{confirmRequired}</span>
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type entity name to confirm..."
                    className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg font-bold text-slate-900 outline-none focus:border-red-500 transition-colors"
                    autoFocus
                  />
                  {confirmText.length > 0 && confirmText.toUpperCase() !== confirmRequired && (
                    <p className="text-xs text-red-500 font-bold mt-2">Names do not match. Please type it exactly.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Summary */}
            {step === 3 && (
              <motion.div
                key="diss-step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center pt-4">
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={40} className="text-red-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">
                    Final Review
                  </h3>
                  <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                    Review the filing details below before proceeding to payment.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl text-left max-w-md mx-auto space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700">Entity</span>
                      <span className="text-sm font-mono text-slate-900">{entityName}</span>
                    </div>
                    {(llcData?.document_number || llcData?.sunbiz_document_number) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">Doc #</span>
                        <span className="text-sm font-mono text-slate-900">{llcData.document_number || llcData.sunbiz_document_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-700">Filing Type</span>
                      <span className="text-sm font-mono text-red-600 font-black">Articles of Dissolution</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-sm font-bold text-slate-700">Action</span>
                      <span className="text-sm font-mono text-red-600 font-black">PERMANENT CLOSURE</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Checkout */}
            {step === 4 && (
              <motion.div
                key="diss-step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="flex items-center gap-3 mb-6 flex-col text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-900 border border-slate-200 shadow-sm rounded-3xl flex items-center justify-center mb-2">
                    <CreditCard size={28} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight">
                    Checkout
                  </h3>
                  <p className="text-gray-500 text-lg">
                    State filing fee for Articles of Dissolution.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <div className="font-bold text-slate-900">
                      State Dissolution Filing Fee
                    </div>
                    <div className="font-mono text-slate-600">$35.00</div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <div className="font-bold text-slate-900">
                      Charter Legacy Ops Fee
                      <span className="text-[10px] uppercase text-emerald-600 ml-2 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Waived
                      </span>
                    </div>
                    <div className="font-mono text-slate-400 line-through">$49.00</div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xl font-black text-slate-900">
                      Total Due
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      $35.00
                    </div>
                  </div>
                </div>

                {clientSecret && clientSecret !== "mock" ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: { theme: "stripe", labels: "floating" },
                    }}
                  >
                    <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                      <CheckoutForm
                        onSuccess={handleCheckout}
                        amount="35.00"
                      />
                    </div>
                  </Elements>
                ) : clientSecret === "mock" ? (
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm text-center">
                      <p className="text-amber-500 font-bold text-xs uppercase mb-4 tracking-widest flex items-center justify-center gap-2">
                        <CreditCard size={16}/> Payment Gateway Mock Mode
                      </p>
                      <button 
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <>Complete Mock Transaction <Lock size={16} /></>}
                      </button>
                  </div>
                ) : (
                  <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-gray-400" />
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 5: Receipt */}
            {step === 5 && (
              <motion.div
                key="diss-step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col justify-center text-center"
              >
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-slate-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">
                  Dissolution Filed
                </h3>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                  Your Articles of Dissolution have been queued for filing with the Florida Division of Corporations. Processing typically completes within 1-2 business days.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-sm mx-auto mb-6">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Confirmation Code
                  </div>
                  <div className="text-2xl font-mono font-bold text-slate-900 tracking-wider bg-white py-2 rounded-xl border border-slate-100 shadow-sm inline-block px-4">
                    {confirmationCode}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <FileText size={16} /> Print Receipt
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        {step < 5 && (
          <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-slate-50 mt-auto shrink-0">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? "w-8 bg-red-500" : step > i ? "w-4 bg-red-200" : "w-4 bg-gray-200"}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {step > 1 && step < 4 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                >
                  Back
                </button>
              )}
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all"
                >
                  I Understand, Continue <ArrowRight size={14} />
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={() => setStep(3)}
                  disabled={confirmText.toUpperCase() !== confirmRequired}
                  className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                >
                  Confirm Dissolution <ArrowRight size={14} />
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={handleSetupCheckout}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? "Preparing..." : "Proceed to Checkout"}{" "}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="p-8 border-t border-gray-100 flex items-center justify-center bg-slate-50 mt-auto shrink-0">
            <button
              onClick={() => {
                if (onComplete) onComplete();
              }}
              className="flex items-center gap-2 px-12 py-4 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-600/20 hover:-translate-y-0.5 transition-all"
            >
              Return to Console <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DissolutionWizard;
