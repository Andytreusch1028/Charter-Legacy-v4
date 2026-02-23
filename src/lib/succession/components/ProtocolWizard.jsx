import React, { useState } from 'react';
import { X, Shield, History, Brain, ArrowRight, FileDown } from 'lucide-react';
import { LegalDocPreview, TrustDocPreview } from './LegalArtifacts';

// --- UI SUB-COMPONENTS ---

const ProtocolHeader = ({ isTrust, onClose }) => (
    <div className="bg-[#0A0A0B] p-6 border-b border-gray-800 flex justify-between items-center">
        <div>
             <h3 className="text-white font-black uppercase tracking-tight text-xl flex items-center gap-2">
                <Brain className="text-[#d4af37]" /> {isTrust ? 'Heritage Trust Protocol' : 'Official Will Drafter'}
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
                onClick={onFinalize} 
                className="bg-[#d4af37] text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2 group overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <FileDown size={14} className="relative z-10" /> 
                <span className="relative z-10">Approve & Finalize</span>
            </button>
        )}
    </div>
);

// --- STEP RENDERERS ---

const FormInput = ({ label, value, onChange, placeholder, isTextArea = false, type = "text", subLabel }) => (
    <div className="animate-in slide-in-from-right duration-500">
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
                    return !!data.initialTrustees;
                case 3: return !!data.successorTrustee;
                case 4: return !!data.trustBeneficiaries;
                case 5: return !!data.safetyNetExecutor;
                default: return true;
            }
        }
        switch(step) {
            case 1: return data.fullName && data.county;
            case 2: 
                if (data.maritalStatus === 'Married' && !data.spouseName) return false;
                return true; 
            case 3: return !!data.executorName;
            case 4: return !!data.beneficiaryName;
            default: return true;
        }
    };

    const renderStep = () => {
        if (isTrust) {
            switch(step) {
                case 1:
                    return (
                        <div className="space-y-6">
                            <FormInput label="Grantor (Founding Identity)" value={data.fullName} onChange={(val) => handleChange('fullName', val)} placeholder="Your Full Legal Name" />
                            <FormInput label="Residence / Venue" value={data.county} onChange={(val) => handleChange('county', val)} placeholder="e.g. Miami-Dade" />
                        </div>
                    );
                case 2:
                    return (
                        <div className="space-y-6">
                             <div className="p-4 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20 flex items-start gap-3">
                                <Shield size={24} className="text-[#d4af37] flex-shrink-0" />
                                <div>
                                    <h5 className="text-[#d4af37] font-bold text-xs uppercase mb-1">Guardian Protocol</h5>
                                    <p className="text-gray-400 text-[10px] leading-relaxed">By default, you maintain 100% sovereign control over all assets.</p>
                                </div>
                            </div>
                            <div className="animate-in slide-in-from-right duration-500">
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
                                <FormInput label="Institution Name" value={data.corporateTrusteeName} onChange={(val) => handleChange('corporateTrusteeName', val)} placeholder="e.g. Northern Trust, NA" subLabel="Use full statutory name." />
                            )}
                            {data.initialTrustees === 'Self & Spouse (Joint)' && (
                                <FormInput label="Co-Trustee (Spouse)" value={data.jointTrusteeName} onChange={(val) => handleChange('jointTrusteeName', val)} placeholder="Full Name of Co-Trustee" />
                            )}
                        </div>
                    );
                case 3: case 4: case 5:
                    const stepProfiles = {
                        3: { label: 'Successor Trustee', field: 'successorTrustee', placeholder: 'Primary Successor Name', sub: 'Manages assets only if you pass or become incapacitated.' },
                        4: { label: 'Trust Beneficiaries', field: 'trustBeneficiaries', placeholder: 'Names and % (e.g. Jane Doe 100%)', isText: true },
                        5: { label: 'Safety-Net Executor', field: 'safetyNetExecutor', placeholder: 'Representative Name', sub: 'Handles assets not yet titled in the Trust.' }
                    };
                    const p = stepProfiles[step];
                    return <FormInput label={p.label} value={data[p.field]} onChange={(v) => handleChange(p.field, v)} placeholder={p.placeholder} subLabel={p.sub} isTextArea={p.isText} />;
                case 6: return <div className="animate-in zoom-in-95 duration-500"><TrustDocPreview data={data} /></div>;
                default: return null;
            }
        }
        
        switch(step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <FormInput label="Legal Name" value={data.fullName} onChange={(v) => handleChange('fullName', v)} placeholder="e.g. Jonathan Doe" />
                        <FormInput label="County / Jurisdiction" value={data.county} onChange={(v) => handleChange('county', v)} placeholder="e.g. Miami-Dade" subLabel="Must be a Florida resident." />
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
                        {data.maritalStatus === 'Married' && <FormInput label="Spouse Full Name" value={data.spouseName} onChange={(v) => handleChange('spouseName', v)} placeholder="Full Name" />}
                        <FormInput label="Children (Legal Heirs)" value={data.childrenNames} onChange={(v) => handleChange('childrenNames', v)} placeholder="Full names, separated by commas." isTextArea={true} />
                    </div>
                );
            case 3: case 4:
                const willSteps = {
                    3: { label: 'Executor (Personal Representative)', field: 'executorName', placeholder: 'Name of Executor' },
                    4: { label: 'Primary Beneficiary', field: 'beneficiaryName', placeholder: 'Name of Primary Heir' }
                };
                const ws = willSteps[step];
                return (
                    <div className="space-y-6">
                        <FormInput label={ws.label} value={data[ws.field]} onChange={(v) => handleChange(ws.field, v)} placeholder={ws.placeholder} />
                        {step === 4 && <FormInput label="Relationship" value={data.beneficiaryRelation} onChange={(v) => handleChange('beneficiaryRelation', v)} placeholder="e.g. Daughter" />}
                    </div>
                );
            case 5: return <div className="animate-in zoom-in-95 duration-500"><LegalDocPreview data={data} /></div>;
            default: return null;
        }
    };


    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1c1c1e] w-full max-w-3xl rounded-3xl border border-[#d4af37]/30 shadow-2xl overflow-hidden flex flex-col relative h-[85vh]">
                <ProtocolHeader isTrust={isTrust} onClose={onClose} />
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
                        onComplete({ ...data, type: isTrust ? 'Trust' : 'Will', finalizedAt: new Date().toISOString() });
                    }} 
                />
            </div>
        </div>
    );
};

export default ProtocolWizard;
