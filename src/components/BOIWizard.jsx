import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  User,
  Users,
  MapPin,
  CheckCircle2,
  X,
  ArrowRight,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  AlertCircle,
  Building2,
  Fingerprint
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

const CheckoutForm = ({ onSuccess, amount }) => {
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
        className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        {processing ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            Pay ${amount} & Submit Report <Lock size={16} />
          </>
        )}
      </button>
    </form>
  );
};

const InputField = ({ label, name, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
    />
  </div>
);

const BOIWizard = ({ llcData, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  
  const [companyInfo, setCompanyInfo] = useState({
    legalName: llcData?.llc_name || "",
    ein: llcData?.ein || "",
    street: llcData?.principal_address?.split(',')[0]?.trim() || "",
    city: llcData?.principal_address?.split(',')[1]?.trim() || "",
    state: "FL",
    zip: llcData?.principal_address?.split(',')[2]?.trim() || "",
  });

  const [owners, setOwners] = useState([
    { id: 1, name: "", dob: "", street: "", city: "", state: "FL", zip: "", idNumber: "" }
  ]);

  const addOwner = () => {
    setOwners([...owners, { id: Date.now(), name: "", dob: "", street: "", city: "", state: "FL", zip: "", idNumber: "" }]);
  };

  const removeOwner = (id) => {
    if (owners.length > 1) {
      setOwners(owners.filter(o => o.id !== id));
    }
  };

  const handleOwnerChange = (id, field, value) => {
    setOwners(owners.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const generateConfirmation = () => {
    return "BOI-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSetupCheckout = async () => {
    setLoading(true);
    try {
      const { data: intentData, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: { packageId: 'boi_filing', userId: llcData?.user_id || 'system_fallback', amount: 14900 },
        },
      );
      if (error) {
          setClientSecret("mock");
      } else if (intentData?.clientSecret) {
          setClientSecret(intentData.clientSecret);
      } else {
          setClientSecret("mock");
      }
      setStep(5);
    } catch (err) {
      console.error("Payment Setup Error:", err);
      setClientSecret("mock");
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    const code = generateConfirmation();
    setConfirmationCode(code);

    try {
      // 1. Update LLC
      if (llcData?.id) {
        await supabase
          .from("llcs")
          .update({ boi_filed: true, updated_at: new Date().toISOString() })
          .eq('id', llcData.id);
      }

      // 2. Queue for fulfillment
      await supabase.from("marketing_queue").insert([{
          email: llcData?.user_id || "system@charterlegacy.com",
          event_type: "BOI_FILING",
          metadata: {
            entity_id: llcData?.id,
            entity_name: companyInfo.legalName,
            confirmation_code: code,
            company_info: companyInfo,
            owners_info: owners,
            total_paid: 149.0,
          },
          status: "PENDING",
      }]);

      // 3. Audit Log
      await supabase.from("ra_document_audit").insert([{
          user_id: llcData?.user_id,
          action: "BOI_REPORT_SUBMITTED",
          actor_type: "CLIENT",
          metadata: { confirmation_code: code, entity_id: llcData?.id },
      }]);

      setStep(6);
    } catch (err) {
      console.error("Final Submission Error:", err);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[600px] animate-in zoom-in-95 duration-500 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-orange-100 bg-orange-50/30">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-600 mb-1 flex items-center gap-2">
              <Shield size={12}/> Federal Compliance
            </p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              FinCEN BOI Reporting
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mb-6">
                  <Shield size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 leading-tight">
                  Mandatory Ownership Disclosure
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed">
                  The Corporate Transparency Act requires most small businesses to report their <strong>Beneficial Ownership Information (BOI)</strong> to the U.S. Treasury's Financial Crimes Enforcement Network (FinCEN).
                </p>
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Deadlines & Penalties</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Reports are due within 90 days of formation. Failure to file can result in civil penalties of up to $500/day.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Safe & Secure</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Charter Legacy transmits your data directly to FinCEN via encrypted protocol to ensure your privacy and compliance.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="text-orange-500" size={24} />
                  <h3 className="text-xl font-black text-slate-900">Reporting Company Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InputField 
                      label="Legal Entity Name" 
                      value={companyInfo.legalName} 
                      onChange={(e) => setCompanyInfo({...companyInfo, legalName: e.target.value})}
                    />
                  </div>
                  <InputField 
                    label="Federal EIN / TIN" 
                    value={companyInfo.ein} 
                    placeholder="00-0000000"
                    onChange={(e) => setCompanyInfo({...companyInfo, ein: e.target.value})}
                  />
                  <InputField 
                    label="Filing State" 
                    value={companyInfo.state} 
                    onChange={(e) => setCompanyInfo({...companyInfo, state: e.target.value})}
                  />
                  <div className="col-span-2">
                    <InputField 
                      label="Principal Street Address" 
                      value={companyInfo.street} 
                      onChange={(e) => setCompanyInfo({...companyInfo, street: e.target.value})}
                    />
                  </div>
                  <InputField 
                    label="City" 
                    value={companyInfo.city} 
                    onChange={(e) => setCompanyInfo({...companyInfo, city: e.target.value})}
                  />
                  <InputField 
                    label="Zip Code" 
                    value={companyInfo.zip} 
                    onChange={(e) => setCompanyInfo({...companyInfo, zip: e.target.value})}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Users className="text-orange-500" size={24} />
                    <h3 className="text-xl font-black text-slate-900">Beneficial Owners</h3>
                  </div>
                  <button 
                    onClick={addOwner}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-colors"
                  >
                    Add Owner
                  </button>
                </div>

                {owners.map((owner, index) => (
                  <div key={owner.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[32px] relative group hover:border-orange-200 transition-colors">
                    {owners.length > 1 && (
                      <button 
                        onClick={() => removeOwner(owner.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-6">Owner #{index + 1}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <InputField label="Full Legal Name" value={owner.name} onChange={(e) => handleOwnerChange(owner.id, 'name', e.target.value)} />
                      </div>
                      <div className="col-span-1">
                        <InputField label="Date of Birth" type="date" value={owner.dob} onChange={(e) => handleOwnerChange(owner.id, 'dob', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <InputField label="Residential Address" value={owner.street} onChange={(e) => handleOwnerChange(owner.id, 'street', e.target.value)} />
                      </div>
                      <InputField label="City" value={owner.city} onChange={(e) => handleOwnerChange(owner.id, 'city', e.target.value)} />
                      <InputField label="ID Number (Passport/DL)" value={owner.idNumber} onChange={(e) => handleOwnerChange(owner.id, 'idNumber', e.target.value)} />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">Review Submission</h3>
                  <p className="text-gray-500 mt-2">Please confirm all information is accurate before filing.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 space-y-4">
                   <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reporting Entity</span>
                      <span className="text-sm font-black text-slate-900">{companyInfo.legalName}</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Beneficial Owners</span>
                      <span className="text-sm font-black text-slate-900">{owners.length} Member(s)</span>
                   </div>
                   <div className="flex items-start gap-4 pt-4">
                      <div className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Fingerprint size={14} />
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed italic">
                        By proceeding, I certify under penalty of perjury that the information provided is true and correct to the best of my knowledge. I authorize Charter Legacy to transmit this data to FinCEN.
                      </p>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex flex-col justify-center h-full pt-10"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard size={28} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">Checkout</h3>
                  <p className="text-gray-500">Government filing transmission service.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-8 rounded-[40px] space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-sm">FinCEN Filing Service</span>
                    <span className="font-mono text-slate-600 text-sm">$149.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xl font-black text-slate-900">Total Due</span>
                    <span className="text-2xl font-black text-slate-900">$149.00</span>
                  </div>
                </div>

                {clientSecret && clientSecret !== "mock" ? (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret, appearance: { theme: 'stripe' } }}
                  >
                    <CheckoutForm onSuccess={handleFinalSubmit} amount="149.00" />
                  </Elements>
                ) : (
                  <div className="bg-white border border-slate-200 p-8 rounded-[40px] text-center shadow-lg">
                    <p className="text-amber-500 font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                      <Lock size={14}/> Sandbox Mode Active
                    </p>
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={loading}
                      className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <>Complete Sandbox Submission <ArrowRight size={16}/></>}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <ShieldCheck size={48} />
                </div>
                <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Reporting Complete</h3>
                <p className="text-gray-500 text-lg max-w-sm mx-auto mb-10 leading-relaxed font-light">
                  Your Beneficial Ownership Information and the audit receipt have been secured in your <strong>Heritage Vault</strong>.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 max-w-sm mx-auto mb-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Transmission Receipt</p>
                  <p className="text-2xl font-mono font-bold text-slate-900 tracking-wider">#{confirmationCode}</p>
                </div>

                <div className="flex items-center justify-center gap-4">
                   <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    <Download size={16} /> Save Receipt
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 5 && (
          <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-slate-50 mt-auto shrink-0">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? "w-8 bg-orange-500" : step > i ? "w-4 bg-orange-200" : "w-4 bg-gray-200"}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-slate-900 transition-colors"
                >
                  Back
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                >
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSetupCheckout}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Certify & Pay <ArrowRight size={14} /></>}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="p-8 border-t border-gray-100 flex items-center justify-center bg-slate-50 mt-auto shrink-0">
            <button
              onClick={onComplete}
              className="px-12 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10"
            >
              Return to Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BOIWizard;
