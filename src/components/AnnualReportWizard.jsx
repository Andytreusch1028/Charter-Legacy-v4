import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, User, Users, CheckCircle2, ChevronRight, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const InputField = ({ label, name, value, onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
        <input 
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        />
    </div>
);

const AnnualReportWizard = ({ llcData, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        fein: '',
        principalStreet: llcData?.principal_address?.split(',')[0]?.trim() || '123 Business Way',
        principalCity: llcData?.principal_address?.split(',')[1]?.trim() || 'Miami',
        principalZip: llcData?.principal_address?.split(',')[2]?.trim() || '33101',
        isMailingSame: true,
        mailingStreet: '',
        mailingCity: '',
        mailingZip: '',
        raName: 'Charter Legacy Services LLC',
        raStreet: '456 Guardian Way',
        raCity: 'DeLand',
        raZip: '32724',
        personnel: [{ title: 'MGR', name: 'Current Member', street: '', city: '', zip: '' }]
    });

    const handlePersonnelChange = (index, field, value) => {
        setData(prev => {
            const newPersonnel = [...prev.personnel];
            newPersonnel[index] = { ...newPersonnel[index], [field]: value };
            return { ...prev, personnel: newPersonnel };
        });
    };

    const addPersonnel = () => {
        setData(prev => ({ ...prev, personnel: [...prev.personnel, { title: 'MGR', name: '', street: '', city: '', zip: '' }] }));
    };

    const removePersonnel = (index) => {
        setData(prev => ({ ...prev, personnel: prev.personnel.filter((_, i) => i !== index) }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileReport = async () => {
        setLoading(true);
        try {
            const newAddress = `${data.principalStreet}, ${data.principalCity}, ${data.principalZip}`;
            const { error } = await supabase
                .from('llcs')
                .update({ 
                    llc_status: 'AR Pending',
                    principal_address: newAddress,
                    sunbiz_document_number: llcData?.sunbiz_document_number || 'L24000392044'
                })
                .eq('id', llcData.id);

            if (error) throw error;
            
            // Optionally, add to an audit log or events table here
            await supabase.from('ra_document_audit').insert([{
                user_id: llcData.user_id,
                action: 'ANNUAL_REPORT_FILED',
                actor_type: 'CLIENT',
                metadata: { updated_data: data }
            }]).catch(() => {});

            onComplete && onComplete();
        } catch (err) {
            console.error('Failed to submit annual report:', err);
            alert("Error submitting annual report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[600px] animate-in zoom-in-95 duration-500 relative">
                
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-gray-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-1">State Compliance</p>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">2026 Annual Report</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 transition-colors">
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
                                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">Verify Your Business Data</h3>
                                <p className="text-gray-500 text-lg leading-relaxed mb-8">
                                    Before we file your 2026 Annual Report with the Florida Division of Corporations, please verify that your business address, registered agent, and ownership information are current.
                                </p>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Entity Name</label>
                                        <div className="text-sm font-bold text-slate-900">{llcData?.llc_name}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Document Number</label>
                                            <div className="text-sm font-bold text-slate-900">{llcData?.sunbiz_document_number || 'L24000392044'}</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Status</label>
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                                            </div>
                                        </div>
                                    </div>
                                    <InputField 
                                        label="FEIN (Federal Employer Identification Number)" 
                                        name="fein" 
                                        value={data.fein} 
                                        onChange={handleChange} 
                                    />
                                    <p className="text-xs text-gray-400 italic px-2">If your LLC was recently formed and does not have an FEIN yet, you can leave this blank.</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><MapPin size={20} /></div>
                                    <h3 className="text-xl font-black text-slate-900">Addresses</h3>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Principal Address</h4>
                                        <div className="space-y-4">
                                            <InputField label="Street Address" name="principalStreet" value={data.principalStreet} onChange={handleChange} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="City" name="principalCity" value={data.principalCity} onChange={handleChange} />
                                                <InputField label="Zip Code" name="principalZip" value={data.principalZip} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-slate-100 pt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mailing Address</h4>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.isMailingSame}
                                                    onChange={(e) => setData(prev => ({ ...prev, isMailingSame: e.target.checked }))}
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20"
                                                />
                                                <span className="text-xs font-bold text-slate-600">Same as Principal</span>
                                            </label>
                                        </div>
                                        
                                        {!data.isMailingSame && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                                                <InputField label="Mailing Street / PO Box" name="mailingStreet" value={data.mailingStreet} onChange={handleChange} />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputField label="City" name="mailingCity" value={data.mailingCity} onChange={handleChange} />
                                                    <InputField label="Zip Code" name="mailingZip" value={data.mailingZip} onChange={handleChange} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center"><User size={20} /></div>
                                    <h3 className="text-xl font-black text-slate-900">Registered Agent</h3>
                                </div>
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mb-6 flex items-start gap-4">
                                    <ShieldCheck size={20} className="textemerald-500 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium text-emerald-800">You are using Charter Legacy as your Registered Agent. Keeping this unchanged ensures your privacy shield remains intact.</p>
                                </div>
                                <div className="space-y-4">
                                    <InputField label="Agent Name" name="raName" value={data.raName} onChange={handleChange} />
                                    <InputField label="Street Address" name="raStreet" value={data.raStreet} onChange={handleChange} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="City" name="raCity" value={data.raCity} onChange={handleChange} />
                                        <InputField label="Zip Code" name="raZip" value={data.raZip} onChange={handleChange} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Users size={20} /></div>
                                    <h3 className="text-xl font-black text-slate-900">Authorized Personnel</h3>
                                </div>
                                <div className="space-y-4">
                                    {data.personnel.map((person, index) => (
                                        <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative">
                                            {data.personnel.length > 1 && (
                                                <button 
                                                    onClick={() => removePersonnel(index)}
                                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputField 
                                                        label="Title (MGR / AMBR)" 
                                                        value={person.title} 
                                                        onChange={(e) => handlePersonnelChange(index, 'title', e.target.value)} 
                                                    />
                                                    <InputField 
                                                        label="Full Name" 
                                                        value={person.name} 
                                                        onChange={(e) => handlePersonnelChange(index, 'name', e.target.value)} 
                                                    />
                                                </div>
                                                <InputField 
                                                    label="Street Address" 
                                                    value={person.street} 
                                                    onChange={(e) => handlePersonnelChange(index, 'street', e.target.value)} 
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputField 
                                                        label="City" 
                                                        value={person.city} 
                                                        onChange={(e) => handlePersonnelChange(index, 'city', e.target.value)} 
                                                    />
                                                    <InputField 
                                                        label="Zip Code" 
                                                        value={person.zip} 
                                                        onChange={(e) => handlePersonnelChange(index, 'zip', e.target.value)} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={addPersonnel}
                                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                                    >
                                        + Add Personnel
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div className="text-center pt-8">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={40} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4">Ready to File</h3>
                                    <p className="text-gray-500 text-lg mb-8 max-w-sm mx-auto">
                                        Your business data has been updated and verified. We will now transmit this to the Florida Division of Corporations.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-slate-50 mt-auto">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-blue-600' : step > i ? 'w-4 bg-blue-200' : 'w-4 bg-gray-200'}`} />
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
                        {step < 5 ? (
                            <button 
                                onClick={() => setStep(step + 1)}
                                className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all hover:pr-6 hover:pl-10"
                            >
                                Continue <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleFileReport}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all"
                            >
                                {loading ? 'Transmitting...' : 'Approve & File'} <CheckCircle2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnnualReportWizard;
