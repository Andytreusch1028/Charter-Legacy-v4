import React, { useState } from 'react';
import { X, Shield, History, Brain, ArrowRight, FileDown } from 'lucide-react';
import { LegalDocPreview, TrustDocPreview } from './LegalArtifacts';

/**
 * PROTOCOL WIZARD (Library Version)
 */
const ProtocolWizard = ({ onClose, onComplete, mode = 'will', initialData }) => {
    const isTrust = mode === 'trust';
    const [step, setStep] = useState(1);

    const [data, setData] = useState(initialData || {
        fullName: '',
        county: '',
        maritalStatus: 'Single',
        spouseName: '',
        childrenNames: '',
        executorName: '',
        beneficiaryName: '',
        beneficiaryRelation: '',
        initialTrustees: 'Self (Standard)',
        corporateTrusteeName: '',
        jointTrusteeName: '',
        successorTrustee: '',
        trustBeneficiaries: '',
        safetyNetExecutor: ''
    });

    const handleChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const totalSteps = isTrust ? 6 : 5;

    const isStepValid = () => {
        if (isTrust) {
            switch(step) {
                case 1: return data.fullName && data.county;
                case 2: 
                    if (data.initialTrustees === 'Corporate Trustee' && !data.corporateTrusteeName) return false;
                    if (data.initialTrustees === 'Self & Spouse (Joint)' && !data.jointTrusteeName) return false;
                    return data.initialTrustees;
                case 3: return data.successorTrustee;
                case 4: return data.trustBeneficiaries;
                case 5: return data.safetyNetExecutor;
                default: return true;
            }
        }
        switch(step) {
            case 1: return data.fullName && data.county;
            case 2: 
                if (data.maritalStatus === 'Married' && !data.spouseName) return false;
                return true; 
            case 3: return data.executorName;
            case 4: return data.beneficiaryName;
            default: return true;
        }
    };

    const renderStep = () => {
        if (isTrust) {
            switch(step) {
                case 1: // GRANTOR
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Grantor (The Founder)</label>
                                <input 
                                    value={data.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                    placeholder="Your Full Legal Name"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">County of Venue</label>
                                <input 
                                    value={data.county}
                                    onChange={(e) => handleChange('county', e.target.value)}
                                    className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                    placeholder="e.g. Miami-Dade"
                                />
                            </div>
                        </div>
                    );
                case 2: // TRUSTEES
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="p-4 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20 flex items-start gap-3">
                                <Shield size={24} className="text-[#d4af37] flex-shrink-0" />
                                <div>
                                    <h5 className="text-[#d4af37] font-bold text-xs uppercase mb-1">Initial Trustee (The Guardian)</h5>
                                    <p className="text-gray-400 text-[10px] leading-relaxed">By default, you are the Initial Trustee. This ensures you maintain 100% control over all assets during your lifetime.</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Initial Trustee Designation</label>
                                <select 
                                    value={data.initialTrustees}
                                    onChange={(e) => handleChange('initialTrustees', e.target.value)}
                                    className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                >
                                    <option>Self (Standard)</option>
                                    <option>Self & Spouse (Joint)</option>
                                    <option>Corporate Trustee</option>
                                </select>
                            </div>

                            {data.initialTrustees === 'Corporate Trustee' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-2 block">Corporate Trustee Name</label>
                                    <input 
                                        value={data.corporateTrusteeName}
                                        onChange={(e) => handleChange('corporateTrusteeName', e.target.value)}
                                        className="w-full bg-black/40 border border-[#d4af37]/50 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                        placeholder="e.g. Northern Trust, NA"
                                    />
                                    <p className="text-gray-600 text-[10px] mt-2 italic">Ensure the full legal entity name of the institution is provided.</p>
                                </div>
                            )}

                            {data.initialTrustees === 'Self & Spouse (Joint)' && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-2 block">Co-Trustee (Spouse) Name</label>
                                    <input 
                                        value={data.jointTrusteeName}
                                        onChange={(e) => handleChange('jointTrusteeName', e.target.value)}
                                        className="w-full bg-black/40 border border-[#d4af37]/50 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                        placeholder="Full Name of Co-Trustee"
                                    />
                                </div>
                            )}
                        </div>
                    );
                case 3: // SUCCESSION
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Successor Trustee</label>
                                <input 
                                    value={data.successorTrustee}
                                    onChange={(e) => handleChange('successorTrustee', e.target.value)}
                                    className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                    placeholder="Primary Successor Name"
                                />
                                <p className="text-gray-600 text-[10px] mt-2">This person manages the trust only after you pass or become incapacitated.</p>
                            </div>
                        </div>
                    );
                case 4: // DISTRIBUTION
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Trust Beneficiaries</label>
                                <textarea 
                                    value={data.trustBeneficiaries}
                                    onChange={(e) => handleChange('trustBeneficiaries', e.target.value)}
                                    className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors min-h-[120px]"
                                    placeholder="List names and percentages (e.g. Jane Doe 50%, John Doe 50%)"
                                />
                            </div>
                        </div>
                    );
                case 5: // SAFETY-NET WILL
                    return (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4 text-[#d4af37]">
                                    <History size={20} />
                                    <h4 className="font-black uppercase text-sm">Safety-Net Sync (Pour-Over)</h4>
                                </div>
                                <p className="text-gray-400 text-xs leading-relaxed mb-6">
                                    This "Pour-Over" Will form is a standard safety-net instrument. It is designed so that any assets remain titled in your individual name at the time of death are automatically "poured" into the Trust for distribution according to the Trust's private terms.
                                </p>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Safety-Net Executor</label>
                                    <input 
                                        value={data.safetyNetExecutor}
                                        onChange={(e) => handleChange('safetyNetExecutor', e.target.value)}
                                        className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                        placeholder="Full Name of Representative"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                case 6:
                    return (
                        <div className="animate-in zoom-in-95 duration-500">
                             <TrustDocPreview data={data} />
                        </div>
                    );
                default: return null;
            }
        }
        
        switch(step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Legal Name</label>
                            <input 
                                value={data.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                placeholder="e.g. Jonathan Doe"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">County of Residence</label>
                            <input 
                                value={data.county}
                                onChange={(e) => handleChange('county', e.target.value)}
                                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                placeholder="e.g. Miami-Dade"
                            />
                            <p className="text-gray-600 text-[10px] mt-2">* Must be a Florida resident for this form.</p>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Marital Status</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Single', 'Married', 'Divorced', 'Widowed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleChange('maritalStatus', status)}
                                        className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                                            data.maritalStatus === status 
                                            ? 'bg-[#d4af37] text-black border-[#d4af37]' 
                                            : 'bg-[#1c1c1e] text-gray-400 border-gray-800 hover:border-gray-600'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {data.maritalStatus === 'Married' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-2 block">Spouse's Full Name</label>
                                <input 
                                    value={data.spouseName}
                                    onChange={(e) => handleChange('spouseName', e.target.value)}
                                    className="w-full bg-black/40 border border-[#d4af37]/50 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Children (Legal Heirs)</label>
                            <textarea 
                                value={data.childrenNames}
                                onChange={(e) => {
                                    handleChange('childrenNames', e.target.value);
                                }}
                                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors min-h-[100px]"
                                placeholder="List full names of all children, separated by commas. Leave blank if none."
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Personal Representative (Executor)</label>
                            <input 
                                value={data.executorName}
                                onChange={(e) => handleChange('executorName', e.target.value)}
                                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                placeholder="Full Name of Executor"
                            />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Primary Beneficiary</label>
                            <input 
                                value={data.beneficiaryName}
                                onChange={(e) => handleChange('beneficiaryName', e.target.value)}
                                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                placeholder="Full Name of Beneficiary"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Relationship</label>
                            <input 
                                value={data.beneficiaryRelation}
                                onChange={(e) => handleChange('beneficiaryRelation', e.target.value)}
                                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                                placeholder="e.g. Son, Daughter, Friend"
                            />
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="animate-in zoom-in-95 duration-500">
                        <LegalDocPreview data={data} />
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#1c1c1e] w-full max-w-3xl rounded-3xl border border-[#d4af37]/30 shadow-2xl overflow-hidden flex flex-col relative h-[85vh]">
            <div className="bg-[#0A0A0B] p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                     <h3 className="text-white font-black uppercase tracking-tight text-xl flex items-center gap-2">
                        <Brain className="text-[#d4af37]" /> {isTrust ? 'Heritage Trust Protocol' : 'Official Will Drafter'}
                    </h3>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            <div className="w-full bg-gray-900 h-1">
                <div className="bg-[#d4af37] h-full transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start w-full">
                <div className="w-full max-w-2xl">
                    <h4 className="text-[#d4af37] font-bold uppercase tracking-widest text-xs mb-6 text-center">Step {step} of {totalSteps}</h4>
                    {renderStep()}
                </div>
            </div>
            <div className="p-6 border-t border-gray-800 bg-[#0A0A0B] flex justify-between items-center">
                {step > 1 ? <button onClick={() => setStep(step - 1)} className="text-gray-400 font-bold uppercase tracking-widest">Back</button> : <div />}
                {step < totalSteps ? (
                    <button disabled={!isStepValid()} onClick={() => setStep(step + 1)} className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#d4af37] transition-all disabled:opacity-50">Next Step <ArrowRight size={14} /></button>
                ) : (
                    <button onClick={() => {
                        console.log("Finalizing Protocol:", data);
                        onComplete({ ...data, type: isTrust ? 'Trust' : 'Will', finalizedAt: new Date().toISOString() });
                    }} className="bg-[#d4af37] text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 group overflow-hidden relative">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <FileDown size={14} className="relative z-10" /> <span className="relative z-10">Approve & Finalize</span>
                    </button>
                )}
            </div>
        </div>
        </div>
    );
};

export default ProtocolWizard;
