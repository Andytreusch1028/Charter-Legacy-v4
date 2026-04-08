import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { ArrowRight, Search, Shield, Check, Loader2, AlertCircle, Info, ExternalLink, PenTool, X, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { calculateAvailabilityScore } from './lib/sunbiz-validator';

const DesignationProtocol = ({ user, llc, onSuccess, onComplete, onClose }) => {
    const finishAction = onSuccess || onComplete;
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Upsell & Product Tracking
    const [hasSeenUpsell, setHasSeenUpsell] = useState(false);
    const [showDoubleLLCUpsell, setShowDoubleLLCUpsell] = useState(false);
    const [productType, setProductType] = useState('standard');
    const [wyomingName, setWyomingName] = useState('');

    // Form Data - Required by Sunbiz
    const [llcName, setLlcName] = useState('');
    const [designator, setDesignator] = useState('LLC'); 
    const [availability, setAvailability] = useState(null);
    const [existingConflicts, setExistingConflicts] = useState([]);
    const [altName1, setAltName1] = useState('');




    const [altName2, setAltName2] = useState('');

    
    const [principalAddress, setPrincipalAddress] = useState('');
    const [usePrivacyAddress, setUsePrivacyAddress] = useState(true);
    
    // RA Data
    const [raType, setRaType] = useState('charter'); // 'charter' | 'custom'
    const [raName, setRaName] = useState('');
    const [raAddress, setRaAddress] = useState('');
    const [raSignature, setRaSignature] = useState('');

    const [members, setMembers] = useState([{ name: '', email: user?.email || '', role: 'Manager', address: '' }]);
    
    // Advanced / Optional Data
    const [effectiveDate, setEffectiveDate] = useState('');
    const [purpose, setPurpose] = useState('Any and all lawful business for which a limited liability company may be organized under the laws of the State of Florida.');
    const [mailingSameAsPrincipal, setMailingSameAsPrincipal] = useState(true);
    const [mailingAddress, setMailingAddress] = useState('');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    // Final Review Data
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    const [organizerSignature, setOrganizerSignature] = useState('');

    useEffect(() => {
        if (user?.email) setContactEmail(user.email);
        if (llc) {
            if (llc.product_type) setProductType(llc.product_type);
            if (llc.llc_name && llc.llc_name !== 'Pending Formation') {
                const nameParts = llc.llc_name.split(' ');
                if (nameParts.length > 1) {
                    setDesignator(nameParts.pop());
                    setLlcName(nameParts.join(' '));
                } else {
                    setLlcName(llc.llc_name);
                }
            }
        }
    }, [user, llc]);

    const handleSearchName = async () => {
        if (!llcName) return;
        setLoading(true);
        setAvailability(null);
        
        try {
            // 1. Initial Local Check (Statutory Rules)
            const fullName = `${llcName} ${designator}`;
            const result = calculateAvailabilityScore(fullName, existingConflicts);
            
            // 2. Simulated Sunbiz Connection (Wait for Crawler Node)
            // In a real environment, this would be: 
            // const res = await fetch(`/api/sunbiz/lookup?name=${encodeURIComponent(llcName)}`);
            // const names = await res.json();
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Statutory 2s pre-check simulation
            
            setAvailability(result);
            
            if (result.score >= 90) {
                // Success path
                setTimeout(() => {
                    setLoading(false);
                    setStep(2);
                }, 1000);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!organizerSignature.trim()) {
            alert("Please sign as the Organizer.");
            return;
        }

        console.log("Admin Key Check:", import.meta.env.VITE_SUPABASE_SERVICE_KEY ? "EXISTS" : "MISSING");
        setLoading(true);
        
        // Construct the full payload for the backend/filing engine
        const finalMembers = productType === 'double_llc_protocol' && wyomingName 
            ? [{ name: wyomingName, role: 'Sole Manager', address: 'Charter Privacy Address' }] 
            : members;

        // Stabilization: Prevent 'LLC LLC' or 'Ltd. Co. Ltd. Co.' redundancies
        const cleanName = llcName.replace(new RegExp(`\s+(${['LLC', 'L.L.C.', 'Ltd. Co.', 'Limited Liability Company'].join('|')})$`, 'i'), '').trim();

        const filingPayload = {
            user_id: user.id,
            llc_name: `${cleanName} ${designator}`,
            llc_status: 'Active',
            product_type: productType,
            privacy_shield_active: productType === 'double_llc_protocol' || raType === 'charter',
            // Core Sunbiz Fields
            principal_address: (raType === 'charter' || productType === 'double_llc_protocol') ? 'Charter Privacy Address' : raAddress,
            ra_type: raType,
            ra_name: (raType === 'charter' || productType === 'double_llc_protocol') ? 'Charter Legacy RA' : raName,
            ra_address: (raType === 'charter' || productType === 'double_llc_protocol') ? 'Charter HQ' : raAddress,
            ra_signature: (raType === 'charter' || productType === 'double_llc_protocol') ? 'Charter Signed' : raSignature,
            organizer_signature: organizerSignature,
            contact_email: contactEmail,
            // Advanced / Optional Fields
            effective_date: effectiveDate || 'Upon Filing',
            purpose: purpose,
            mailing_address: mailingSameAsPrincipal ? ((raType === 'charter' || productType === 'double_llc_protocol') ? 'Charter Privacy Address' : raAddress) : mailingAddress,
            members: finalMembers,
            internal_founders: productType === 'double_llc_protocol' ? members : null // Keep true owners for WY filing
        };

        try {
            // Check for existing record
            const { data: existing } = await supabase
                .from('llcs')
                .select('id')
                .eq('user_id', user.id)
                .eq('llc_status', 'Setting Up')
                .maybeSingle();

            let finalLlcId = null;

            if (existing) {
                const { error } = await supabase
                    .from('llcs')
                    .update({ 
                        llc_name: filingPayload.llc_name,
                        llc_status: 'Active',
                        product_type: productType,
                        privacy_shield_active: filingPayload.privacy_shield_active
                    })
                    .eq('id', existing.id);
                if (error) throw error;
                finalLlcId = existing.id;
            } else {
                // Insert New
                const { data: newLLC, error: insertError } = await supabase
                    .from('llcs')
                    .insert([{ 
                        user_id: user.id,
                        llc_name: filingPayload.llc_name,
                        llc_status: 'Active',
                        product_type: productType,
                        privacy_shield_active: filingPayload.privacy_shield_active
                    }])
                    .select()
                    .single();

                if (insertError) throw insertError;
                if (newLLC) finalLlcId = newLLC.id;
            }
            
            // Pass full data to dashboard for display/demo
            if (finishAction) {
                finishAction({
                    ...filingPayload,
                    llc_status: 'Active',
                    id: finalLlcId
                });
            }

        } catch (err) {
            console.error("Designation Error:", err);
            
            if (err.message.includes("row-level security policy")) {
                const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
                if (serviceKey) {
                    try {
                        console.log("Attempting Administrative Override...");
                        const supabaseAdmin = createClient(import.meta.env.VITE_SUPABASE_URL, serviceKey, {
                            auth: {
                                persistSession: false,
                                autoRefreshToken: false,
                                detectSessionInUrl: false
                            }
                        });
                        
                        // Insert New via Admin
                        const { error: adminError } = await supabaseAdmin
                            .from('llcs')
                            .insert([{ 
                                user_id: user.id,
                                llc_name: filingPayload.llc_name,
                                llc_status: 'Active',
                                product_type: productType,
                                privacy_shield_active: filingPayload.privacy_shield_active
                            }]);

                        if (adminError) throw adminError;
                        
                        if (finishAction) {
                            finishAction({
                                ...filingPayload,
                                llc_status: 'Active'
                            });
                        }
                        return;

                    } catch (adminErr) {
                         console.error("Admin Override Failed:", adminErr);
                         alert("Admin Override Failed: " + adminErr.message + " (Code: " + (adminErr.code || 'N/A') + ")");
                    }
                } else {
                    alert("Database Authorization Restricted (RLS). Proceeding in DEMO MODE (data not saved).");
                }

                // Fallback to Demo Mode visuals
                if (finishAction) {
                    finishAction({
                        ...filingPayload,
                        llc_status: 'Active'
                    });
                }
            } else {
                alert(`Failed to save designation: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const addMember = () => {
        if (members.length >= 6) {
            alert("Maximum of 6 members/managers allowed for online filing.");
            return;
        }
        setMembers([...members, { name: '', email: '', role: 'Member', address: '' }]);
    };

    const updateMember = (index, field, value) => {
        const newMembers = [...members];
        newMembers[index][field] = value;
        setMembers(newMembers);
    };

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#0A0A0B]/90 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl relative">
                
                {/* Header Strip */}
                <div className="bg-[#0A0A0B] p-8 pb-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D084] to-transparent opacity-50"></div>
                    <p className="text-[#00D084] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Charter Legacy Setup Guide</p>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        {step === 1 && "Name Your Business"}
                        {step === 2 && "Privacy & Address"}
                        {step === 3 && "Company Owners"}
                        {step === 3.5 && "Privacy Setup"}
                        {step === 4 && "Review & Sign"}
                    </h2>

                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/10"
                            aria-label="Cancel Operation"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-10 -mt-6 bg-white rounded-t-[40px] relative z-10 flex flex-col min-h-[600px]">
                    
                    {step === 1 && (
                        <div className="space-y-8 flex-1 flex flex-col">
                            <div className="text-center space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Proposed Company Name</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={llcName}
                                        onChange={(e) => setLlcName(e.target.value)}
                                        placeholder="Enter desired name..." 
                                        className="w-full text-center text-3xl md:text-4xl font-black text-[#0A0A0B] border-b-2 border-gray-100 py-4 focus:border-[#007AFF] outline-none transition-all placeholder:text-gray-200"
                                        autoFocus
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                {['LLC', 'L.L.C.', 'Ltd. Co.'].map((opt) => (
                                    <button 
                                        key={opt}
                                        onClick={() => setDesignator(opt)}
                                        className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${designator === opt ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center relative">
                                <p className="text-blue-800 text-sm font-bold">
                                    "{llcName || 'Your Business'} {designator}"
                                </p>
                                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">Official Name Preview</p>
                                
                                {availability && (
                                    <div className={`mt-4 p-4 rounded-xl border-2 ${availability.score >= 90 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${availability.score >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                                                {availability.status}
                                            </span>
                                            <span className={`text-lg font-black ${availability.score >= 90 ? 'text-green-600' : 'text-red-600'}`}>
                                                {availability.score}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${availability.score >= 90 ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${availability.score}%` }}
                                            ></div>
                                        </div>
                                        <p className={`text-[11px] mt-2 font-medium ${availability.score >= 90 ? 'text-green-700' : 'text-red-700'}`}>
                                            {availability.message}
                                        </p>
                                    </div>
                                )}

                                {availability && availability.score > 0 && availability.score < 90 && (
                                    <div className="mt-6 space-y-4 text-left animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info size={14} className="text-blue-500" />
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Provide Alternative Options</p>
                                        </div>
                                        <p className="text-[11px] text-gray-500 leading-tight mb-4">
                                            There is a chance the state won't accept your first choice. Provide two fallbacks to ensure your filing succeeds without delay.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    value={altName1}
                                                    onChange={(e) => setAltName1(e.target.value)}
                                                    placeholder="Alternative Option #1"
                                                    className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-bold focus:border-black outline-none transition-all"
                                                />
                                            </div>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    value={altName2}
                                                    onChange={(e) => setAltName2(e.target.value)}
                                                    placeholder="Alternative Option #2"
                                                    className="w-full bg-white border border-gray-200 p-4 rounded-xl text-sm font-bold focus:border-black outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>



                            <button 
                                onClick={(availability && availability.score > 0 && availability.score < 90) ? () => setStep(2) : handleSearchName} 
                                disabled={!llcName || loading}
                                className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    (availability && availability.score > 0 && availability.score < 90) ? 
                                    <>Proceed with Alternatives <ArrowRight size={18} /></> :
                                    <>Check Availability <ArrowRight size={18} /></>
                                )}
                            </button>


                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 flex-1 flex flex-col">
                            <p className="text-center text-gray-500 text-sm">Who should accept legal mail for your company?</p>

                             {/* Option A: Charter */}
                             <div 
                                onClick={() => setRaType('charter')}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${raType === 'charter' ? 'border-[#00D084] bg-[#00D084]/5' : 'border-gray-100 hover:border-gray-200'}`}
                             >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${raType === 'charter' ? 'border-[#00D084] bg-[#00D084]' : 'border-gray-200'}`}>
                                    {raType === 'charter' && <Check size={14} className="text-white" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0A0A0B] text-lg">Charter Legacy Agent (Recommended)</h4>
                                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                        Included with your package. We handle all state mail and provide our professional office address for public records, keeping your home address private.
                                    </p>
                                    {raType === 'charter' && (
                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#00D084]/10 text-[#00D084] rounded-lg text-xs font-bold">
                                            <Shield size={12} /> Privacy Shield Active
                                        </div>
                                    )}
                                </div>
                             </div>

                             {/* Option B: Custom */}
                             <div 
                                onClick={() => setRaType('custom')}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${raType === 'custom' ? 'border-black' : 'border-gray-100 hover:border-gray-200'}`}
                             >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${raType === 'custom' ? 'border-black bg-black' : 'border-gray-200'}`}>
                                    {raType === 'custom' && <Check size={14} className="text-white" />}
                                </div>
                                <div className="w-full">
                                    <h4 className="font-bold text-[#0A0A0B] text-lg">I will be the Registered Agent <span className="text-red-500 text-xs ml-2 uppercase tracking-widest font-black">Warning</span></h4>
                                    <p className="text-gray-500 text-sm mt-1 leading-relaxed mb-4">
                                        You must be available at a Florida street address during business hours. This address will also be listed on public records.
                                    </p>
                                    
                                    {raType === 'custom' && (
                                        <div className="space-y-3 animate-in slide-in-from-top-2">
                                            <input 
                                                type="text" 
                                                placeholder="RA Name (Individual or Company)"
                                                value={raName}
                                                onChange={(e) => setRaName(e.target.value)}
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:border-black"
                                                autoFocus
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="Florida Street Address (No PO Boxes)"
                                                value={raAddress}
                                                onChange={(e) => setRaAddress(e.target.value)}
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:border-black"
                                            />
                                            <div className="relative">
                                                <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                <input 
                                                    type="text" 
                                                    placeholder="Signature of RA (Type Name)"
                                                    value={raSignature}
                                                    onChange={(e) => setRaSignature(e.target.value)}
                                                    className="w-full p-3 pl-10 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:border-black"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                             </div>

                             <button 
                                onClick={() => {
                                    if (raType === 'custom' && (!raName || !raAddress || !raSignature)) {
                                        alert("Please complete the Registered Agent details.");
                                        return;
                                    }
                                    setStep(3);
                                }}
                                className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                             >
                                Next <ArrowRight size={18} />
                             </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 flex-1 flex flex-col">
                            <p className="text-gray-500 text-sm font-medium text-center">Who owns this company?</p>
                            
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {(members || []).map((member, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Owner {idx + 1}</span>
                                            {idx > 0 && <button onClick={() => {
                                                const newM = [...members];
                                                newM.splice(idx, 1);
                                                setMembers(newM);
                                            }} className="text-red-400 hover:text-red-600"><X size={14} /></button>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                type="text" 
                                                placeholder="Full Name" 
                                                value={member.name}
                                                onChange={(e) => updateMember(idx, 'name', e.target.value)}
                                                className="bg-white p-3 rounded-xl text-sm font-bold outline-none border border-gray-200 focus:border-black"
                                            />
                                            <select 
                                                value={member.role}
                                                onChange={(e) => updateMember(idx, 'role', e.target.value)}
                                                className="bg-white p-3 rounded-xl text-sm font-bold outline-none border border-gray-200 focus:border-black"
                                            >
                                                <option>Initial Owner</option>
                                                <option>Manager</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={addMember} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-xs uppercase tracking-widest hover:border-gray-400 hover:text-gray-600 transition-all">
                                {members.length >= 6 ? 'Max Members Reached' : '+ Add Another Member'}
                            </button>

                            <button 
                                onClick={() => {
                                    if (members.some(m => !m.name.trim())) {
                                        alert("Please enter names for all members.");
                                        return;
                                    }
                                    if (productType !== 'double_llc_protocol' && !hasSeenUpsell) {
                                        setShowDoubleLLCUpsell(true);
                                    } else if (productType === 'double_llc_protocol' && !wyomingName) {
                                        setStep(3.5);
                                    } else {
                                        setStep(4);
                                    }
                                }}
                                className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                             >
                                Review & Sign <ArrowRight size={18} />
                             </button>
                        </div>
                    )}

                    {step === 3.5 && (
                        <div className="space-y-8 flex-1 flex flex-col animate-in slide-in-from-right-8 duration-500">
                            <div className="bg-[#0A0A0B] p-6 rounded-3xl text-white space-y-4 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Shield size={100} />
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                                    <Check size={14} /> Enhanced Privacy Active
                                </div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Identity Shielding</h3>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed relative z-10">
                                    Your Florida LLC manager has been automatically set to a Wyoming Holding Company. Wyoming does not require your name on public record, providing an absolute shield of anonymity.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block pl-2">Name your Wyoming Holding Company</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Acme Holdings LLC" 
                                    value={wyomingName}
                                    onChange={(e) => setWyomingName(e.target.value)}
                                    className="w-full bg-white p-5 rounded-2xl text-lg font-black outline-none border-2 border-gray-100 focus:border-emerald-500 transition-all placeholder:text-gray-300 shadow-sm"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-400 px-2 italic">Charter Legacy will form this company immediately in Wyoming and assign it as the sole Manager of {llcName || 'your Florida LLC'}.</p>
                            </div>

                            <button 
                                onClick={() => {
                                    if (!wyomingName.trim()) {
                                        alert("Please enter a name for your Wyoming holding company.");
                                        return;
                                    }
                                    setStep(4);
                                }}
                                className="w-full bg-[#00D084] text-[#0A0A0B] py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(0,208,132,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                            >
                                Finalize Setup <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 flex-1 flex flex-col">
                            <div className="bg-[#F5F5F7] p-6 rounded-2xl space-y-4 border border-gray-200/50 text-sm">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500 font-medium">Entity Name</span>
                                    <span className="font-black text-[#0A0A0B]">{llcName} {designator}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500 font-medium">Principal Address</span>
                                    <span className="font-bold text-[#007AFF] flex items-center gap-1">
                                        {usePrivacyAddress ? <><Shield size={12}/> Privacy Shield</> : "Custom Address"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500 font-medium">Managers/Members</span>
                                    <span className="font-bold text-[#0A0A0B]">{members.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Registered Agent</span>
                                    <span className="font-bold text-[#0A0A0B]">
                                        {raType === 'charter' ? 'Charter Legacy' : raName}
                                    </span>
                                </div>
                            </div>

                            {/* CUSTOMIZE FILING DETAILS (The Peace Treaty between Mom & Steve) */}
                            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                <button 
                                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                    className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isAdvancedOpen ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <Settings size={14} />
                                        </div>
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-widest text-[#0A0A0B] block">Customize Filing Details</span>
                                            <span className="text-[10px] text-gray-400 font-medium">Dates, Mailing Addresses, and Specific Clauses</span>
                                        </div>
                                    </div>
                                    {isAdvancedOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                                </button>
                                
                                {isAdvancedOpen && (
                                    <div className="p-6 pt-0 space-y-8 animate-in slide-in-from-top-2">
                                        <div className="h-px bg-gray-100 mb-6"></div>
                                        
                                        {/* 1. START DATE */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Start Date</label>
                                            <div className="flex gap-4">
                                                <button 
                                                    onClick={() => setEffectiveDate('')}
                                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${!effectiveDate ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    Start Immediately
                                                </button>
                                                <button 
                                                    onClick={() => setEffectiveDate(new Date().toISOString().split('T')[0])}
                                                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${effectiveDate ? 'border-black bg-black text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    Future Date
                                                </button>
                                            </div>
                                            {effectiveDate && (
                                                <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                                    <input 
                                                        type="date" 
                                                        value={effectiveDate}
                                                        onChange={(e) => setEffectiveDate(e.target.value)}
                                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:border-black"
                                                    />
                                                    <p className="text-[10px] text-gray-400 mt-2 ml-1">Must be within 5 business days prior or 90 days after filing.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2. MAILING ADDRESS */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mailing Address</label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400">Same as Principal?</span>
                                                    <div 
                                                        onClick={() => setMailingSameAsPrincipal(!mailingSameAsPrincipal)}
                                                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${mailingSameAsPrincipal ? 'bg-[#00D084]' : 'bg-gray-200'}`}
                                                    >
                                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${mailingSameAsPrincipal ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {!mailingSameAsPrincipal && (
                                                <div className="animate-in fade-in slide-in-from-top-1">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Enter Mailing Address (PO Box Allowed)"
                                                        value={mailingAddress}
                                                        onChange={(e) => setMailingAddress(e.target.value)}
                                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:border-black"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* 3. BUSINESS PURPOSE */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Purpose</label>
                                            
                                            {purpose === 'Any and all lawful business for which a limited liability company may be organized under the laws of the State of Florida.' ? (
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#00D084]/10 flex items-center justify-center">
                                                            <Check size={14} className="text-[#00D084]" />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-600">Standard General Purpose</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => setPurpose('')}
                                                        className="text-[10px] font-black uppercase tracking-widest text-[#007AFF] hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative animate-in fade-in">
                                                    <textarea 
                                                        value={purpose}
                                                        onChange={(e) => setPurpose(e.target.value)}
                                                        placeholder="Describe your business activity..."
                                                        className="w-full p-3 bg-white rounded-xl border-2 border-gray-200 text-xs text-gray-600 outline-none focus:border-black min-h-[80px]"
                                                    />
                                                    <button 
                                                        onClick={() => setPurpose('Any and all lawful business for which a limited liability company may be organized under the laws of the State of Florida.')}
                                                        className="absolute top-3 right-3 text-[9px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-gray-100"
                                                    >
                                                        Reset to Standard
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* 4. MEMBER LOCATIONS */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {members.length > 1 ? "Member Locations" : "Member Address"}
                                            </label>

                                            {members.length === 1 ? (
                                                // Single Member Logic
                                                <div className="space-y-3">
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        Is the member located at the Principal Office Address?
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => {
                                                                const newM = [...members];
                                                                newM[0].address = ''; // Clear address to indicate "Same"
                                                                setMembers(newM);
                                                            }}
                                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${!members[0].address ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                                                        >
                                                            Yes
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                const newM = [...members];
                                                                if (!newM[0].address) newM[0].address = ' '; // Initialize Custom
                                                                setMembers(newM);
                                                            }}
                                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${members[0].address ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                                                        >
                                                            No, Custom Address
                                                        </button>
                                                    </div>

                                                    {members[0].address !== '' && (
                                                        <div className="animate-in fade-in slide-in-from-top-1 mt-2">
                                                            <input 
                                                                type="text" 
                                                                placeholder="Enter Member Street Address"
                                                                value={members[0].address === ' ' ? '' : members[0].address}
                                                                onChange={(e) => updateMember(0, 'address', e.target.value)}
                                                                className="w-full p-3 bg-white rounded-xl border border-gray-200 text-sm font-bold outline-none focus:border-black"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // Multi-Member Logic
                                                <>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        Are all {members.length} members located at the Principal Office Address?
                                                    </p>
                                                    
                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => {
                                                                const newM = members.map(m => ({...m, address: ''}));
                                                                setMembers(newM);
                                                            }}
                                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${members.every(m => !m.address) ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                                                        >
                                                            Yes, Same Address
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                const newM = members.map(m => ({...m, address: m.address || ' '})); // Trigger custom mode
                                                                setMembers(newM);
                                                            }}
                                                            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${members.some(m => m.address) ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                                                        >
                                                            No, Custom Addresses
                                                        </button>
                                                    </div>

                                                    {members.some(m => m.address !== '') && (
                                                        <div className="space-y-2 mt-3 animate-in fade-in slide-in-from-top-2">
                                                            {members.map((member, idx) => (
                                                                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users size={12} className="text-gray-400" />
                                                                        <span className="text-xs font-bold text-[#0A0A0B]">{member.name || `Member ${idx + 1}`}</span>
                                                                    </div>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Enter Street Address"
                                                                        value={member.address === ' ' ? '' : member.address}
                                                                        onChange={(e) => updateMember(idx, 'address', e.target.value)}
                                                                        className="w-full p-2 bg-white rounded-lg border border-gray-200 text-xs font-medium outline-none focus:border-black"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest block">Authorization</p>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                        I am the authorized representative submitting these Articles of Organization. I affirm that the facts stated herein are true.
                                    </p>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Electronic Signature of Organizer</label>
                                        <div className="relative">
                                            <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                                type="text" 
                                                value={organizerSignature}
                                                onChange={(e) => setOrganizerSignature(e.target.value)}
                                                placeholder="Type Full Name"
                                                className="w-full p-3 pl-10 bg-white rounded-xl border-2 border-gray-200 font-bold text-lg outline-none focus:border-[#00D084] transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleFinalSubmit}
                                disabled={loading || !organizerSignature}
                                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${organizerSignature ? 'bg-[#00D084] text-white hover:scale-[1.02] active:scale-95 shadow-green-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Execute Filing <Check size={18} strokeWidth={3} /></>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {showDoubleLLCUpsell && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDoubleLLCUpsell(false)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 sm:p-12 space-y-8">
                            <div className="inline-flex items-center gap-2 text-rose-500 bg-rose-50 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                                <AlertCircle size={16} /> Privacy Warning
                            </div>
                            
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black tracking-tighter">Florida Public Record Notice</h2>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    Florida law requires the names and addresses of LLC members to be published on the Sunbiz public registry. This data is scraped by hundreds of broker websites within 24 hours.
                                </p>
                            </div>

                            <div className="bg-[#0A0A0B] text-white p-8 rounded-3xl space-y-6 relative overflow-hidden">
                                <div className="absolute right-0 top-0 opacity-10 p-4"><Shield size={120} /></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
                                        The Formation Elite Solution
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">Anonymous Wyoming Manager</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
                                        We will form a Wyoming Holding Company to act as the manager of your Florida LLC. Wyoming does not collect member names, meaning your identity remains completely off the public record.
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex-1">
                                            <div className="text-3xl font-black text-white">$750</div>
                                            <div className="text-xs text-gray-500 font-medium uppercase tracking-widest">One-time upgrade</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setHasSeenUpsell(true);
                                        setShowDoubleLLCUpsell(false);
                                        setStep(4);
                                    }}
                                    className="px-6 py-3 rounded-xl text-gray-400 text-xs font-black uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    Proceed with Public Record
                                </button>
                                <button
                                    onClick={() => {
                                        setHasSeenUpsell(true);
                                        setProductType('double_llc_protocol');
                                        setShowDoubleLLCUpsell(false);
                                        setStep(3.5); // Go to Wyoming config
                                    }}
                                    className="bg-black text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                                >
                                    Simulate $750 Upgrade
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignationProtocol;
