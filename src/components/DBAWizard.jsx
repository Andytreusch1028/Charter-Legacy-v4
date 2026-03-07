import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  User,
  Users,
  CheckCircle2,
  ChevronRight,
  X,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Receipt,
  FileText,
  Loader2,
  Lock,
  Newspaper
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
        className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        {processing ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            Pay ${amount} & File <Lock size={16} />
          </>
        )}
      </button>
    </form>
  );
};

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
    />
  </div>
);

const DBAWizard = ({ llcData, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const [data, setData] = useState({
    dbaName: "",
    purpose: "General Business Operations",
    principalStreet: llcData?.principal_address?.split(",")[0]?.trim() || "",
    principalCity: llcData?.principal_address?.split(",")[1]?.trim() || "",
    principalZip: llcData?.principal_address?.split(",")[2]?.trim() || "",
    advertisingCounty: "Miami-Dade",
    ownerName: llcData?.llc_name || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const generateConfirmation = () => {
    return "DBA-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSetupCheckout = async () => {
    setLoading(true);
    try {
      const { data: intentData, error } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: { packageId: 'dba_registration', userId: llcData?.user_id || 'system_fallback' },
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
      setStep(5);
    } catch (err) {
      console.error("Failed to setup payment", err);
      setClientSecret("mock");
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    const code = generateConfirmation();
    setConfirmationCode(code);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id || llcData?.user_id || undefined;

      // 1. Mark DBA Intake
      const { data: newDba, error: dbaError } = await supabase
        .from("dbas")
        .insert([{
          user_id: userId,
          llc_id: llcData?.id || undefined,
          dba_name: data.dbaName,
          purpose: data.purpose,
          advertising_county: data.advertisingCounty,
          status: 'pending',
          payment_status: 'Paid'
        }])
        .select()
        .single();
        
      if (dbaError) console.error("Could not insert DBA record:", dbaError);

      // 2. Queue for fulfillment team
      await supabase.from("marketing_queue").insert([{
          email: llcData?.user_id || "system@charterlegacy.com",
          event_type: "DBA_REGISTRATION",
          metadata: {
            entity_id: llcData?.id,
            dba_name: data.dbaName,
            county: data.advertisingCounty,
            confirmation_code: code,
            total_paid: 249.0,
            dba_record_id: newDba?.id
          },
          status: "PENDING",
      }]);

      // 3. Log into Audit system
      await supabase.from("ra_document_audit").insert([{
          user_id: llcData?.user_id,
          action: "DBA_REGISTRATION_ORDERED",
          actor_type: "CLIENT",
          metadata: { confirmation_code: code, total_paid: 249.0, dba_name: data.dbaName },
      }]);

      setStep(6); // Go to receipt
    } catch (err) {
      console.error("Failed to process checkout:", err);
      alert(`Error processing payment: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const floridaCounties = [
    "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus", "Clay",
    "Collier", "Columbia", "DeSoto", "Dixie", "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist",
    "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands", "Hillsborough", "Holmes", "Indian River",
    "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee",
    "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach",
    "Pasco", "Pinellas", "Polk", "Putnam", "St. Johns", "St. Lucie", "Santa Rosa", "Sarasota", "Seminole", "Sumter",
    "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[600px] animate-in zoom-in-95 duration-500 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-1">
              Brand Expansion
            </p>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Fictitious Name (DBA) Registration
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
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                  <Building2 size={32} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                  Choose Your Trade Name
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                  A Fictitious Name (often called a "DBA" or Doing Business As) allows your LLC to legally operate under a different brand name without creating a separate company.
                </p>
                <div className="space-y-6">
                  <InputField
                    label="Desired Fictitious Name"
                    name="dbaName"
                    value={data.dbaName}
                    placeholder="e.g. Zenith Tech Solutions"
                    onChange={handleChange}
                  />
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">
                      Ownership Entity
                    </label>
                    <div className="text-sm font-bold text-slate-900">
                      Owned by: {llcData?.llc_name || "You"}
                    </div>
                    <p className="text-xs text-amber-600 mt-2 font-medium">
                      The DBA will be legally registered as an asset of this LLC. All liabilities remain shielded by the parent LLC.
                    </p>
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
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Business Address
                  </h3>
                </div>
                <p className="text-gray-500 mb-6">
                  Where will this DBA primarily conduct business? This requires a physical street address (no P.O. Boxes).
                </p>
                <div className="space-y-4">
                  <InputField
                    label="Street Address"
                    name="principalStreet"
                    value={data.principalStreet}
                    onChange={handleChange}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="City"
                      name="principalCity"
                      value={data.principalCity}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Zip Code"
                      name="principalZip"
                      value={data.principalZip}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Newspaper size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    Required Publication
                  </h3>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
                   <p className="text-sm font-bold text-slate-700 mb-2">Florida Statute 865.09</p>
                   <p className="text-sm text-gray-500">
                      Prior to registering a fictitious name, Florida law requires that the intention to register the name be advertised at least once in a newspaper in the county where the principal place of business will be located.
                   </p>
                </div>
                
                <div className="space-y-4 pt-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                    Select County For Publication
                  </label>
                  <select 
                    name="advertisingCounty"
                    value={data.advertisingCounty}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none"
                  >
                    {floridaCounties.map(county => (
                      <option key={county} value={county}>{county} County</option>
                    ))}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="border border-emerald-200 bg-emerald-50 p-4 rounded-xl">
                          <CheckCircle2 size={20} className="text-emerald-500 mb-2" />
                          <p className="text-xs font-bold text-slate-900 mb-1">We Handle It All</p>
                          <p className="text-xs text-emerald-800">We will find an approved publisher, place the ad, and secure the affidavit.</p>
                      </div>
                      <div className="border border-emerald-200 bg-emerald-50 p-4 rounded-xl">
                          <CheckCircle2 size={20} className="text-emerald-500 mb-2" />
                          <p className="text-xs font-bold text-slate-900 mb-1">Proof of Publication</p>
                          <p className="text-xs text-emerald-800">The statutory affidavit of publication will be deposited to your Vault.</p>
                      </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center pt-8">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">
                    Ready to File
                  </h3>
                  <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">
                    Your fictitious name registration forms have been successfully prepared.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
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
                    Review & Checkout
                  </h3>
                  <p className="text-gray-500 text-lg">
                    Approve the costs for transmission, publication, and filing.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <div className="font-bold text-slate-900">
                      State Registration Fee
                    </div>
                    <div className="font-mono text-slate-600">$50.00</div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <div className="font-bold text-slate-900">
                      Standard Newspaper Publication Fee
                    </div>
                    <div className="font-mono text-slate-600">$150.00</div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <div className="font-bold text-slate-900">
                      Charter Legacy Ops Fee
                      <span className="text-[10px] uppercase text-emerald-600 ml-2 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Included
                      </span>
                    </div>
                    <div className="font-mono text-slate-600">$49.00</div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xl font-black text-slate-900">
                      Total Due
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      $249.00
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
                        amount="249.00"
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
                        className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
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

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col justify-center text-center"
              >
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">
                  Registration Confirmed
                </h3>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                  Your fictitious name recording has been successfully queued for
                  fulfillment. We will begin the publication process in {data.advertisingCounty} county immediately.
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
        {step < 6 && (
          <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-slate-50 mt-auto shrink-0">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? "w-8 bg-blue-600" : step > i ? "w-4 bg-blue-200" : "w-4 bg-gray-200"}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-white hover:shadow-sm transition-all"
                >
                  Back
                </button>
              )}
              {step < 4 && (
                <button
                  onClick={() => {
                      if (step === 1 && !data.dbaName.trim()) {
                          alert("Please enter a fictitious name to continue.");
                          return;
                      }
                      setStep(step + 1);
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all hover:pr-6 hover:pl-10"
                >
                  Continue <ArrowRight size={14} />
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={handleSetupCheckout}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? "Preparing..." : "Continue to Checkout"}{" "}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="p-8 border-t border-gray-100 flex items-center justify-center bg-emerald-50/30 mt-auto shrink-0">
            <button
              onClick={() => {
                if (onComplete) onComplete();
              }}
              className="flex items-center gap-2 px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:-translate-y-0.5 transition-all"
            >
              Return to Console <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DBAWizard;
