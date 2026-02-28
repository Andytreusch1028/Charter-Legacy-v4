import React, { useState } from 'react';
import { X, Shield, Brain, ArrowRight, FileDown, Info, Plus } from 'lucide-react';
import { TodDesignationPreview } from './LegalArtifacts';

// --- UI SUB-COMPONENTS ---

const ProtocolHeader = ({ onClose }) => (
    <div className="bg-[#0A0A0B] p-6 border-b border-gray-800 flex justify-between items-center">
        <div>
             <h3 className="text-white font-black uppercase tracking-tight text-xl flex items-center gap-2">
                <Brain className="text-[#d4af37]" /> Corporate Succession Protocol
            </h3>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
    </div>
);

const StepProgress = ({ current, total }) => (
    <div className="w-full bg-gray-900 h-1">
        <div 
            className="bg-[#d4af37] h-full transition-all duration-500 ease-out" 
            style={{ width: `${(current / total) * 100}%` }}
        ></div>
    </div>
);

const ProtocolActions = ({ step, totalSteps, isStepValid, onBack, onNext, onFinalize }) => (
    <div className="p-6 border-t border-gray-800 bg-[#0A0A0B] flex justify-between items-center">
        {step > 1 ? (
            <button onClick={onBack} className="text-gray-400 font-bold uppercase tracking-widest hover:text-white transition-colors">
                Back
            </button>
        ) : <div />}
        
        {step < totalSteps ? (
            <button 
                disabled={!isStepValid} 
                onClick={onNext} 
                className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#d4af37] transition-all disabled:opacity-50"
            >
                Next Step <ArrowRight size={14} className="inline ml-1" />
            </button>
        ) : (
            <button 
                disabled={!isStepValid}
                onClick={onFinalize} 
                className="bg-[#d4af37] text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 group overflow-hidden relative disabled:opacity-50"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <FileDown size={14} className="relative z-10" /> 
                <span className="relative z-10">Sign & Secure Ledger</span>
            </button>
        )}
    </div>
);

// --- STEP RENDERERS ---

const FormInput = ({ label, value, onChange, placeholder, isTextArea = false, type = "text", subLabel }) => (
    <div className="animate-in slide-in-from-right duration-500 mb-6">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">{label}</label>
        {isTextArea ? (
            <textarea 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors min-h-[120px]"
                placeholder={placeholder}
            />
        ) : (
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-black/40 border border-gray-800 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                placeholder={placeholder}
            />
        )}
        {subLabel && <p className="text-gray-600 text-[10px] mt-2 font-medium uppercase tracking-tighter">{subLabel}</p>}
    </div>
);

/**
 * PROTOCOL WIZARD (TOD Corporate Succession Version)
 */
const ProtocolWizard = ({ onClose, onComplete, initialData }) => {
    const [step, setStep] = useState(1);

    const [data, setData] = useState(initialData || {
        fullName: '',
        llcName: '',
        county: '',
        beneficiaries: [{ name: '', relation: '', percentage: 100 }],
        beneficiaryName: '',
        beneficiaryRelation: '',
        uplAcknowledged: false,
        esignature: ''
    });

    const handleChange = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const syncBeneficiariesToLegacyStrings = (bens) => {
        const names = bens.map(b => b.name ? `${b.name} (${b.percentage}%)` : '').filter(Boolean).join(', ');
        const rels = bens.map(b => b.relation).filter(Boolean).join(', ');
        setData(prev => ({ ...prev, beneficiaries: bens, beneficiaryName: names, beneficiaryRelation: rels }));
    };

    const addBeneficiary = () => {
        const currentCount = data.beneficiaries.length;
        // Auto-distribute equal shares if possible as a convenience
        const newShare = Math.floor(100 / (currentCount + 1));
        const newBens = data.beneficiaries.map(b => ({ ...b, percentage: newShare }));
        newBens.push({ name: '', relation: '', percentage: 100 - (newShare * currentCount) });
        syncBeneficiariesToLegacyStrings(newBens);
    };

    const removeBeneficiary = (index) => {
        const newBens = data.beneficiaries.filter((_, i) => i !== index);
        // Correct shares if only 1 remains
        if (newBens.length === 1) newBens[0].percentage = 100;
        syncBeneficiariesToLegacyStrings(newBens);
    };

    const updateBeneficiary = (index, field, value) => {
        const newBens = [...data.beneficiaries];
        newBens[index][field] = value;
        syncBeneficiariesToLegacyStrings(newBens);
    };

    const totalSteps = 4;

    const isStepValid = () => {
        switch(step) {
            case 1: return data.fullName && data.llcName && data.county;
            case 2: 
                const bensList = data.beneficiaries || [];
                const validDetails = bensList.every(b => b.name && b.relation && Number(b.percentage) > 0);
                const totalPercent = bensList.reduce((sum, b) => sum + Number(b.percentage || 0), 0);
                return bensList.length > 0 && validDetails && totalPercent === 100;
            case 3: return data.uplAcknowledged;
            case 4: return data.esignature && data.fullName && data.esignature.trim().toLowerCase() === data.fullName.trim().toLowerCase();
            default: return true;
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-2">
                        <FormInput label="Member Identity" value={data.fullName} onChange={(val) => handleChange('fullName', val)} placeholder="Your Full Legal Name" />
                        <FormInput label="Entity Affiliation" value={data.llcName} onChange={(val) => handleChange('llcName', val)} placeholder="e.g. Apex Holdings LLC" subLabel="The exact legal name of the Florida LLC." />
                        <FormInput label="Primary Operating County" value={data.county} onChange={(val) => handleChange('county', val)} placeholder="e.g. Miami-Dade" />
                    </div>
                );
            case 2:
                const step2Bens = data.beneficiaries || [{ name: '', relation: '', percentage: 100 }];
                const step2TotalPercent = step2Bens.reduce((sum, b) => sum + Number(b.percentage || 0), 0);
                return (
                    <div className="space-y-4 animate-in slide-in-from-right duration-500 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar pb-6 relative">
                        <div className="p-4 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20 flex items-start gap-3 mb-6 sticky top-0 z-10 backdrop-blur-md">
                            <Shield size={24} className="text-[#d4af37] flex-shrink-0" />
                            <div>
                                <h5 className="text-[#d4af37] font-bold text-xs uppercase mb-1 flex items-center justify-between">
                                    Succession Designation
                                    {step2Bens.length > 1 && (
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-widest ${step2TotalPercent === 100 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500 animate-pulse'}`}>
                                            Total: {step2TotalPercent}%
                                        </span>
                                    )}
                                </h5>
                                <p className="text-gray-400 text-[10px] leading-relaxed">Designate the individual(s) or entity(ies) who will receive your membership interest upon your passing. Ensure equity splitting equals exactly 100%.</p>
                            </div>
                        </div>

                        {step2Bens.map((ben, idx) => (
                            <div key={idx} className="p-6 bg-[#1c1c1e] border border-gray-800 rounded-2xl relative group shadow-lg">
                                {step2Bens.length > 1 && (
                                    <button 
                                        onClick={() => removeBeneficiary(idx)} 
                                        className="absolute top-4 right-4 text-gray-600 hover:text-red-500 bg-white/5 hover:bg-red-500/10 p-2 rounded-full transition-all shadow-sm"
                                        title="Remove Successor"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <h6 className="text-[#d4af37] font-black text-[10px] uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
                                    {step2Bens.length > 1 ? `Joint Successor ${idx + 1}` : 'Primary Successor'}
                                </h6>
                                <div className="space-y-4">
                                    <FormInput label="Full Name" value={ben.name} onChange={(v) => updateBeneficiary(idx, 'name', v)} placeholder="Name of Beneficiary" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Relationship" value={ben.relation} onChange={(v) => updateBeneficiary(idx, 'relation', v)} placeholder="e.g. Son, Trust" />
                                        <div className="relative">
                                            <label className="block text-gray-500 font-bold text-[9px] uppercase tracking-widest mb-1 pl-1">Equity Split (%)</label>
                                            <input 
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={ben.percentage}
                                                onChange={(e) => updateBeneficiary(idx, 'percentage', e.target.value)}
                                                className={`w-full bg-black/50 border-2 rounded-xl p-3 text-white text-sm font-black outline-none transition-all ${step2TotalPercent !== 100 ? 'border-red-500/50 focus:border-red-500' : 'border-gray-800 focus:border-[#d4af37]'}`}
                                            />
                                            {step2TotalPercent !== 100 && <p className="text-red-500 text-[8px] uppercase tracking-widest font-bold mt-1 absolute -bottom-4">Must equal 100%</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button 
                            onClick={addBeneficiary}
                            className="w-full py-5 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 hover:text-[#d4af37] hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all flex items-center justify-center gap-2 uppercase tracking-widest font-black text-[10px]"
                        >
                            <Plus size={16} /> Add Joint Beneficiary
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <h4 className="text-white font-black uppercase text-lg mb-2">Protocol Assurances</h4>
                        
                        {/* Jony Ive Tooltip / Micro-copy design for Inter Vivos transfer reassurance */}
                        <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl p-6 relative group overflow-visible">
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Note: A standard LLC Transfer-on-Death (TOD) designation is a revocable mechanism. Activating this feature does not restrict a member's ability to sell, transfer, or gift their equity during their lifetime. 
                                <span className="inline-block ml-2 relative">
                                    <Info size={14} className="text-gray-500 hover:text-[#d4af37] cursor-pointer inline transition-colors peer" />
                                    {/* Glass Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-300 z-50">
                                        <h5 className="text-white font-bold text-[10px] uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Does a TOD restrict business transfers?</h5>
                                        <p className="text-gray-400 text-[10px] leading-relaxed">
                                            No. This standard form designates a successor only for the LLC membership interest held at the time of passing. If a member sells, gifts, or transfers their equity during their lifetime, the TOD designation for those specific shares is rendered void. The buyer does not require beneficiary consent.
                                        </p>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/90 border-r border-b border-white/10 rotate-45"></div>
                                    </div>
                                </span>
                            </p>
                        </div>

                        {/* UPL Compliance Acknowledgment */}
                        <label className="flex items-start gap-4 cursor-pointer group mt-8">
                            <div className="relative flex items-center justify-center mt-1">
                                <input 
                                    type="checkbox" 
                                    className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded checked:border-[#d4af37] checked:bg-[#d4af37]/20 transition-all cursor-pointer"
                                    checked={data.uplAcknowledged}
                                    onChange={(e) => handleChange('uplAcknowledged', e.target.checked)}
                                />
                                <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-[#d4af37]">
                                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.5 5.5L4.5 8.5L10.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-1 group-hover:text-[#d4af37] transition-colors">Self-Help Acknowledgment</h5>
                                <p className="text-gray-500 text-[10px] leading-relaxed">
                                    I understand that Charter Legacy provides self-help corporate forms, not legal advice. I am designating a successor for my business equity only, and I am responsible for how this interacts with my personal estate plan. I know there are other ways to do this, but I am choosing this standard self-help TOD form.
                                </p>
                            </div>
                        </label>
                    </div>
                );
            case 4: 
                return (
                    <div className="animate-in zoom-in-95 duration-500 space-y-6">
                        <div className="bg-gradient-to-br from-[#1c1c1e] to-black border border-[#d4af37]/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(212,175,55,0.05)]">
                            <h4 className="text-[#d4af37] font-black uppercase tracking-[0.2em] text-sm mb-4">Execute Sovereign Record</h4>
                            <p className="text-gray-400 text-xs leading-relaxed mb-6">
                                Review your record. To cryptographically lock your LLC equity transfer, affix your electronic signature by typing your full legal name precisely as it appears on the form: <span className="text-white font-bold tracking-widest uppercase">{data.fullName}</span>
                            </p>
                            <input 
                                type="text"
                                value={data.esignature}
                                onChange={(e) => handleChange('esignature', e.target.value)}
                                className={`w-full bg-black/50 border-2 rounded-2xl p-6 text-white outline-none transition-all duration-300 ${data.esignature && data.fullName && data.esignature.trim().toLowerCase() === data.fullName.trim().toLowerCase() ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.1)] text-green-400' : 'border-gray-800 focus:border-[#d4af37]'}`}
                                placeholder="Affix Electronic Signature..."
                                style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", fontSize: '1.5rem' }}
                            />
                        </div>
                        <div className="h-[40vh] overflow-y-auto rounded-3xl border border-gray-800 custom-scrollbar opacity-90 pb-12 shadow-inner bg-black/50 relative">
                             <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10 shadow-xl">
                                 <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest">Live Record Preview</span>
                             </div>
                             <div className="scale-[0.85] origin-top mt-4">
                                <TodDesignationPreview data={data} />
                             </div>
                        </div>
                    </div>
                );
        }
    };


    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1c1c1e] w-full max-w-3xl rounded-3xl border border-[#d4af37]/30 shadow-2xl overflow-hidden flex flex-col relative h-[85vh]">
                <ProtocolHeader onClose={onClose} />
                <StepProgress current={step} total={totalSteps} />
                
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start w-full">
                    <div className="w-full max-w-2xl">
                        <h4 className="text-[#d4af37] font-bold uppercase tracking-widest text-xs mb-6 text-center">
                            Institutional Step {step} of {totalSteps}
                        </h4>
                        {renderStep()}
                    </div>
                </div>

                <ProtocolActions 
                    step={step} 
                    totalSteps={totalSteps} 
                    isStepValid={isStepValid()} 
                    onBack={() => setStep(step - 1)} 
                    onNext={() => setStep(step + 1)} 
                    onFinalize={() => {
                        console.log("Finalizing Protocol:", data);
                        onComplete({ ...data, type: 'TOD_Designation', finalizedAt: new Date().toISOString() });
                    }} 
                />
            </div>
        </div>
    );
};

export default ProtocolWizard;
