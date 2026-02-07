import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { ArrowRight, Loader2, Search, Building2, MapPin, Users, Check, X } from 'lucide-react';

const DesignationProtocol = ({ user, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Form Data
    const [llcName, setLlcName] = useState('');
    const [designator, setDesignator] = useState('LLC'); // LLC vs L.L.C.
    const [principalAddress, setPrincipalAddress] = useState('');
    const [usePrivacyAddress, setUsePrivacyAddress] = useState(true);
    const [members, setMembers] = useState([{ name: '', email: user?.email || '', role: 'Manager' }]);

    const handleSearchName = async () => {
        // In a real app, this would hit Sunbiz API.
        // For now, we simulate a check.
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            // Update the LLC record in Supabase
            // We assume there's only one LLC per user for now, or we grab the latest one "Setting Up"
            const { error } = await supabase
                .from('llcs')
                .update({ 
                    llc_name: `${llcName} ${designator}`,
                    llc_status: 'Filing Initiated', // Move to next status
                    // In a real app, we'd save address/member JSON blobs here too
                })
                .eq('user_id', user.id)
                .eq('llc_status', 'Setting Up');

            if (error) throw error;
            
            // Trigger parent refresh
            onSuccess();

        } catch (err) {
            console.error("Designation Error:", err);
            alert("Failed to save designation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const addMember = () => {
        setMembers([...members, { name: '', email: '', role: 'Member' }]);
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
                    <p className="text-[#00D084] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Charter Legacy Designation Protocol</p>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        {step === 1 && "Name Your Entity"}
                        {step === 2 && "Corporate Address"}
                        {step === 3 && "Board of Members"}
                        {step === 4 && "Review & Commit"}
                    </h2>
                </div>

                {/* Content Area */}
                <div className="p-10 -mt-6 bg-white rounded-t-[40px] relative z-10 min-h-[400px] flex flex-col">
                    
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-300">
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

                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                                <p className="text-blue-800 text-sm font-bold">
                                    "{llcName} {designator}"
                                </p>
                                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">Preview</p>
                            </div>

                            <button 
                                onClick={handleSearchName} 
                                disabled={!llcName || loading}
                                className="w-full bg-[#007AFF] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Check Availability <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-300">
                             <div 
                                onClick={() => setUsePrivacyAddress(true)}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${usePrivacyAddress ? 'border-[#00D084] bg-[#00D084]/5' : 'border-gray-100 hover:border-gray-200'}`}
                             >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${usePrivacyAddress ? 'border-[#00D084] bg-[#00D084]' : 'border-gray-200'}`}>
                                    {usePrivacyAddress && <Check size={14} className="text-white" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#0A0A0B] text-lg">Use Charter Privacy Address</h4>
                                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                        Protect your home address. We will use our registered office in Ft. Lauderdale for all public filings.
                                    </p>
                                    {usePrivacyAddress && (
                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#00D084]/10 text-[#00D084] rounded-lg text-xs font-bold">
                                            <Shield size={12} /> Privacy Shield Active
                                        </div>
                                    )}
                                </div>
                             </div>

                             <div 
                                onClick={() => setUsePrivacyAddress(false)}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${!usePrivacyAddress ? 'border-black' : 'border-gray-100 hover:border-gray-200'}`}
                             >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${!usePrivacyAddress ? 'border-black bg-black' : 'border-gray-200'}`}>
                                    {!usePrivacyAddress && <Check size={14} className="text-white" />}
                                </div>
                                <div className="w-full">
                                    <h4 className="font-bold text-[#0A0A0B] text-lg">Use My Own Address</h4>
                                    {!usePrivacyAddress && (
                                        <input 
                                            type="text" 
                                            value={principalAddress}
                                            onChange={(e) => setPrincipalAddress(e.target.value)}
                                            placeholder="123 Founder Way, Miami FL..."
                                            className="w-full mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:border-black transition-colors"
                                            autoFocus
                                        />
                                    )}
                                </div>
                             </div>

                             <button 
                                onClick={() => setStep(3)}
                                className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                             >
                                Confirm Address <ArrowRight size={18} />
                             </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300 flex-1 flex flex-col">
                            <p className="text-gray-500 text-sm font-medium text-center">Who owns/manages this LLC?</p>
                            
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {members.map((member, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Member {idx + 1}</span>
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
                                                <option>Authorized Member</option>
                                                <option>Manager</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={addMember} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold text-xs uppercase tracking-widest hover:border-gray-400 hover:text-gray-600 transition-all">
                                + Add Another Member
                            </button>

                            <button 
                                onClick={() => {
                                    if (members.some(m => !m.name.trim())) {
                                        alert("Please enter names for all members.");
                                        return;
                                    }
                                    setStep(4);
                                }}
                                className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-auto"
                            >
                                Review Protocol <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-300">
                            <div className="bg-[#F5F5F7] p-6 rounded-2xl space-y-4 border border-gray-200/50">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500 font-medium text-sm">Entity Name</span>
                                    <span className="font-black text-[#0A0A0B]">{llcName} {designator}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-gray-500 font-medium text-sm">Principal Address</span>
                                    <span className="font-bold text-[#007AFF] text-sm flex items-center gap-1">
                                        {usePrivacyAddress ? <><Shield size={12}/> Privacy Shield</> : "Custom Address"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium text-sm">Members</span>
                                    <span className="font-black text-[#0A0A0B]">{members.length}</span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 text-center leading-relaxed">
                                By proceeding, you authorize Charter Legacy to file these Articles of Organization with the Florida Division of Corporations.
                            </p>

                            <button 
                                onClick={handleFinalSubmit}
                                disabled={loading}
                                className="w-full bg-[#00D084] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-green-200"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Execute Filing <Check size={18} strokeWidth={3} /></>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignationProtocol;
