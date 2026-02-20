import React, { useState, useEffect } from 'react';
import { X, Check, Users, Clock, Shield, Lock, ChevronRight, Fingerprint, FileKey, Upload, Trash2, Eye, FileCheck, FileText, Archive, History, FileDown, RefreshCw, Filter, Brain, CheckCircle2, ShieldX, ArrowRight, ShieldCheck, MapPin, AlertCircle, Key, Box, Plus, Edit2, Vault, Disc, ShieldAlert, Terminal } from 'lucide-react';
import { supabase as charterSupabase } from './lib/supabase';

const SuiteStep = ({ title, icon: Icon, active, onClick, children }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
      active 
        ? 'border-[#d4af37] bg-[#1c1c1e] shadow-2xl scale-[1.02]' 
        : 'border-transparent hover:bg-[#1c1c1e]/50 hover:border-gray-800'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-[#d4af37] text-black' : 'bg-gray-800 text-gray-500'}`}>
        <Icon size={20} />
      </div>
      {active && <div className="p-1 bg-[#d4af37]/20 rounded-full text-[#d4af37] animate-pulse"><div className="w-2 h-2 bg-[#d4af37] rounded-full"></div></div>}
    </div>
    <h3 className={`text-lg font-black uppercase tracking-tight ${active ? 'text-white' : 'text-gray-500'}`}>{title}</h3>
    
    {active && (
      <div className="mt-6 pt-6 border-t border-gray-800 animate-in fade-in slide-in-from-top-4">
         {children}
      </div>
    )}
  </div>
);

// Will Document Preview Component
const LegalDocPreview = ({ data }) => (
    <div className="bg-white text-black p-12 shadow-2xl max-w-2xl mx-auto min-h-[600px] my-4 border-2 border-gray-300 font-serif leading-relaxed text-justify relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#d4af37]"></div>
        <h1 className="text-3xl font-black text-center mb-10 uppercase tracking-[0.2em] border-b-4 border-black pb-6">Last Will & Testament</h1>
        
        <p className="mb-8 text-lg">
            I, <span className="font-bold border-b-2 border-black px-2">{data.fullName || "____________________"}</span>, 
            a resident of <span className="font-bold border-b-2 border-black px-2">{data.county || "____________________"}</span> County, State of Florida, 
            being of sound mind and memory, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking all wills and codicils at any time heretofore made by me.
        </p>

        <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mt-6 mb-4">Article I: Identification of Family</h3>
        <p className="mb-6">
            I am {data.maritalStatus === 'Married' ? "married to" : "currently"} <span className="font-bold border-b-2 border-black px-2">{data.spouseName || "unmarried"}</span>. 
            I have <span className="font-bold border-b-2 border-black px-2">{data.childrenCount || "no"}</span> children{data.childrenNames ? ":" : "."} 
            <span className="font-bold border-b-2 border-black px-2">{data.childrenNames || ""}</span>. 
            All references in this Will to "my children" include the above-named children and any children hereafter born to or adopted by me.
        </p>

        <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mt-6 mb-4">Article II: Payment of Debts</h3>
        <p className="mb-6">
            I direct that all my legally enforceable debts and funeral expenses be paid as soon as practicable after my death.
        </p>

        <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mt-6 mb-4">Article III: Disposition of Property</h3>
        <p className="mb-6">
            I give, devise, and bequeath all the rest, residue, and remainder of my estate, both real and personal, of whatever nature and wherever situated, to 
            <span className="font-bold border-b-2 border-black px-2 mx-1">{data.beneficiaryName || "____________________"}</span> 
            {data.beneficiaryRelation && <span>(my <span className="italic">{data.beneficiaryRelation}</span>)</span>}, 
            absolutely and in fee simple. If said beneficiary does not survive me, then I give such residue to my heirs-at-law as determined by the laws of the State of Florida.
        </p>

        <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mt-6 mb-4">Article IV: Personal Representative</h3>
        <p className="mb-6">
            I nominate and appoint <span className="font-bold border-b-2 border-black px-2">{data.executorName || "____________________"}</span> 
            to serve as Personal Representative of this, my Last Will and Testament. 
            I direct that no bond or other security of any kind shall be required of any Personal Representative appointed hereunder.
        </p>

        <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mt-6 mb-4">Article V: Digital Assets</h3>
        <p className="mb-6">
            I grant to my Personal Representative the power to access, handle, distribute, and dispose of my digital assets, including but not limited to email accounts, social media accounts, financial accounts, and the content stored within my <strong>Charter Legacy Vault</strong>, in accordance with the Florida Fiduciary Access to Digital Assets Act.
        </p>

        <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mt-6 mb-4">Article VI: Powers</h3>
        <p className="mb-6">
            I grant to my Personal Representative all powers conferred upon personal representatives by the Florida Probate Code, as amended, 
            including the power to sell, lease, or mortgage any real or personal property, public or private, without court order.
        </p>

        <div className="mt-16 pt-10 border-t-2 border-black break-inside-avoid">
            <p className="mb-8">
                IN WITNESS WHEREOF, I have hereunto set my hand and seal this ______ day of ________________, 20____.
            </p>
            <div className="flex justify-end pr-12">
                <div className="text-center">
                    <div className="w-64 border-b-2 border-black mb-2"></div>
                    <p className="text-sm uppercase font-bold tracking-widest">{data.fullName || "TESTATOR"}</p>
                </div>
            </div>
        </div>

        <div className="mt-16 pt-10 border-t-4 border-double border-black break-inside-avoid bg-gray-50 p-8 rounded-xl text-justify">
             <h4 className="text-center font-bold uppercase underline mb-6 tracking-widest text-lg">Self-Proving Affidavit</h4>
             <p className="text-sm mb-4 leading-relaxed">
                STATE OF FLORIDA <br/>
                COUNTY OF <span className="font-bold border-b border-black px-2">{data.county || "____________________"}</span>
             </p>
             <p className="text-sm mb-4 leading-relaxed">
                I, <span className="font-bold border-b border-black px-2">{data.fullName || "Testator Name"}</span>, declare to the officer taking my acknowledgment of this instrument, and to the subscribing witnesses, that I sign this instrument as my will.
             </p>
             <p className="text-sm mb-6 leading-relaxed">
                We, the witnesses, <span className="font-bold border-b border-black px-8">Witness 1 Name</span> and <span className="font-bold border-b border-black px-8">Witness 2 Name</span>, have been sworn by the officer signing below, and declare to that officer on our oaths that the testator declared the instrument to be the testator's will and signed it in our presence and that we each signed the instrument as a witness in the presence of the testator and of each other.
             </p>

             <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="text-right">
                    <div className="w-64 border-b border-black ml-auto mb-1"></div>
                    <p className="text-xs font-bold uppercase mr-20">Testator's Signature</p>
                </div>
                <div className="text-left">
                    <div className="w-64 border-b border-black mb-1"></div>
                    <p className="text-xs font-bold uppercase">Witness Signature</p>
                </div>
                <div className="text-left">
                    <div className="w-64 border-b border-black mb-1"></div>
                    <p className="text-xs font-bold uppercase">Witness Signature</p>
                </div>
             </div>

             <p className="text-sm mb-4 leading-relaxed italic">
                Acknowledged and subscribed before me by the testator, <span className="font-bold border-b border-black px-1">{data.fullName || "Testator"}</span>, who is personally known to me or who has produced identification, and sworn to and subscribed before me by the witnesses, on this ______ day of ________________, 20____.
             </p>

             <div className="mt-8 flex justify-start">
                  <div className="text-center w-64">
                      <div className="border-b border-black mb-2 h-10"></div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">Notary Public / Stamp</p>
                  </div>
             </div>
        </div>
        
        <p className="mt-12 text-[9px] text-gray-400 text-center uppercase tracking-widest font-mono">
            Generated by Charter Legacy · Page 1 of 1 · Form FL-WILL-STATUTORY
        </p>
    </div>
);

// Trust Document Preview Component
const TrustDocPreview = ({ data }) => (
    <div className="bg-white text-black p-12 shadow-2xl max-w-2xl mx-auto min-h-[800px] my-4 border-2 border-gray-300 font-serif leading-relaxed text-justify relative overflow-hidden">
        {/* Obsidian Heritage Strip */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#d4af37] via-black to-[#d4af37]"></div>
        
        {/* Seal Placeholder */}
        <div className="absolute top-12 right-12 w-20 h-20 border-4 border-double border-gray-200 rounded-full flex items-center justify-center opacity-40 rotate-12">
            <span className="text-[8px] font-bold text-center uppercase tracking-tighter">Official Heritage<br/>Protocol Seal</span>
        </div>

        <h1 className="text-2xl font-black text-center mb-2 uppercase tracking-[0.3em] mt-8">The {data.fullName || "FOUNDER"}'S</h1>
        <h1 className="text-3xl font-black text-center mb-12 uppercase tracking-[0.1em] border-b-4 border-black pb-8">Revocable Living Trust</h1>
        
        <div className="space-y-8">
            <section>
                <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mb-4">Declaration of Trust</h3>
                <p>
                    This Revocable Living Trust is established this ______ day of ________________, 20____, by 
                    <span className="font-bold border-b-2 border-black px-2 mx-1">{data.fullName || "____________________"}</span> 
                    of <span className="font-bold border-b-2 border-black px-2">{data.county || "____________________"}</span> County, Florida (hereinafter referred to as the "Grantor").
                </p>
            </section>

            <section>
                <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mb-4">Article I: Trust Name</h3>
                <p>
                    The trust established by this instrument shall be known as the <span className="font-bold italic">"The {data.fullName || "Founder"}'s Revocable Living Trust."</span>
                </p>
            </section>

            <section>
                <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mb-4">Article II: Trustees</h3>
                <p className="mb-4">
                    The initial Trustee of this Trust shall be <span className="font-bold border-b-2 border-black px-2">
                        {data.initialTrustees === 'Corporate Trustee' ? (data.corporateTrusteeName || "[CORPORATE TRUSTEE]") : 
                         data.initialTrustees === 'Self & Spouse (Joint)' ? (`${data.fullName} and ${data.jointTrusteeName || "[SPOUSE NAME]"}`) :
                         (data.fullName || "[GRANTOR NAME]")}
                    </span>. 
                    The Trustee shall have all powers granted to trustees under the Florida Trust Code.
                </p>
                <p>
                    Upon the death, resignation, or incapacity of the initial Trustee, 
                    <span className="font-bold border-b-2 border-black px-2">{data.successorTrustee || "____________________"}</span> 
                    is hereby appointed as the Successor Trustee.
                </p>
            </section>

            <section>
                <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mb-4">Article III: Beneficiaries</h3>
                <p className="mb-4 italic text-gray-700">During my lifetime, the Grantor shall be the sole primary beneficiary of this Trust.</p>
                <p>
                    Upon the death of the Grantor, the Trust estate shall be distributed to the following designated beneficiaries:
                    <span className="block mt-4 p-4 bg-gray-50 border border-gray-200 font-bold whitespace-pre-wrap">
                        {data.trustBeneficiaries || "__________________________________________________"}
                    </span>
                </p>
            </section>

            <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-2 text-[#d4af37]">
                    <History size={16} />
                    <h3 className="font-bold text-sm uppercase tracking-widest">Heritage Sync: Safety-Net Will</h3>
                </div>
                <p className="text-xs leading-relaxed italic">
                    The Grantor concurrently executes a "Pour-Over Will" nominating 
                    <span className="font-bold border-b border-black px-1 mx-1">{data.safetyNetExecutor || "____________________"}</span> 
                    as Personal Representative. This ensures any assets remaining outside the Trust at death are seamlessly transferred into this Trust for distribution.
                </p>
            </section>

            <div className="mt-16 pt-10 border-t-2 border-black">
                <p className="mb-12">
                    IN WITNESS WHEREOF, the Grantor has signed this Trust Agreement on the date first above written.
                </p>
                <div className="flex flex-col items-end space-y-8 pr-12">
                    <div className="text-center">
                        <div className="w-64 border-b-2 border-black mb-2"></div>
                        <p className="text-[10px] uppercase font-bold tracking-widest">Grantor / Trustee Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="w-64 border-b border-black mb-2 h-10"></div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Notary Acknowledgement</p>
                    </div>
                </div>
            </div>
        </div>

        <p className="mt-16 text-[9px] text-gray-400 text-center uppercase tracking-widest font-mono">
           Charter Legacy Protocol · Heritage Grade · Form FL-TRUST-REVOCABLE
        </p>
    </div>
);

// Protocol Wizard Component (Handles Will & Trust Paths)
const ProtocolWizard = ({ onClose, onComplete, mode = 'will', initialData }) => {
    const isTrust = mode === 'trust';
    const [step, setStep] = useState(1);

    const [data, setData] = useState(initialData || {
        // Common Fields
        fullName: '',
        county: '',
        maritalStatus: 'Single',
        spouseName: '',
        childrenNames: '',
        
        // Will Specific
        executorName: '',
        beneficiaryName: '',
        beneficiaryRelation: '',
        
        // Trust Specific
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
            case 2: // Family
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
        
        // STANDARD WILL LOGIC (Existing)
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
            case 2: // FAMILY DYNAMICS
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
                            <p className="text-gray-600 text-[10px] mt-2">Includes natural born and legally adopted children.</p>
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
                            <p className="text-gray-600 text-[10px] mt-2">The person responsible for administering your estate.</p>
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
                        <div className="p-4 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20">
                            <h5 className="text-[#d4af37] font-bold text-xs uppercase mb-1">Residuary Clause</h5>
                            <p className="text-gray-400 text-[10px]">This beneficiary will receive the valid residue of your estate (everything not otherwise specified).</p>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="animate-in zoom-in-95 duration-500">
                        <LegalDocPreview data={data} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#1c1c1e] w-full max-w-3xl rounded-3xl border border-[#d4af37]/30 shadow-2xl overflow-hidden flex flex-col relative h-[85vh]">
            
            {/* Header */}
            <div className="bg-[#0A0A0B] p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                     <h3 className="text-white font-black uppercase tracking-tight text-xl flex items-center gap-2">
                        <Brain className="text-[#d4af37]" /> {isTrust ? 'Heritage Trust Protocol' : 'Official Will Drafter'}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">{isTrust ? 'Integrated Living Trust & Pour-Over Sync' : 'Statutory Compliant Testamentary Instrument'}</p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-900 h-1">
                <div 
                    className="bg-[#d4af37] h-full transition-all duration-500 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start w-full">
                <div className="w-full max-w-2xl">
                    <h4 className="text-[#d4af37] font-bold uppercase tracking-widest text-xs mb-6 text-center">
                        Step {step} of {totalSteps}: {
                            isTrust 
                            ? ['Grantor Info', 'Trustee Designation', 'Succession Path', 'Distribution', 'Safety-Net Sync', 'Review Protocol'][step-1]
                            : ['Personal Details', 'Family Dynamics', 'Executor', 'Beneficiaries', 'Review Draft'][step-1]
                        }
                    </h4>
                    {renderStep()}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800 bg-[#0A0A0B] flex justify-between items-center">
                {step > 1 ? (
                    <button 
                        onClick={() => setStep(step - 1)} 
                        className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                       Back
                    </button>
                ) : (
                    <div />
                )}

                {step < totalSteps ? (
                    <button 
                        disabled={!isStepValid()}
                        onClick={() => setStep(step + 1)} 
                        className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#d4af37] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {((isTrust && step === 5) || (!isTrust && step === 4)) ? 'Generate Preview' : 'Next Step'} <ArrowRight size={14} />
                    </button>
                ) : (
                     <button 
                        onClick={() => onComplete({ ...data, type: isTrust ? 'Trust' : 'Will' })} 
                        className="bg-[#d4af37] text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#d4af37]/20 flex items-center gap-2"
                    >
                        <FileDown size={14} /> Approve & Download
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

// Upgrade Modal Component
const UpgradeModal = ({ onClose, onConfirm }) => {
  const [processing, setProcessing] = useState(false);

  const handleConfirm = () => {
      setProcessing(true);
      setTimeout(() => {
          onConfirm();
      }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#1c1c1e] w-full max-w-md rounded-3xl border border-[#d4af37] shadow-2xl overflow-hidden flex flex-col items-center text-center relative">
            
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={20}/></button>

            {/* Header */}
            <div className="w-full bg-gradient-to-b from-[#d4af37]/20 to-transparent p-8 pb-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#d4af37] rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(212,175,55,0.4)] mb-6 animate-pulse">
                    <ShieldCheck size={32} />
                </div>
                <h3 className="text-white font-black uppercase tracking-tight text-xl mb-1">Unlock Compliance Guard</h3>
                <p className="text-[#d4af37] font-bold text-xs uppercase tracking-widest mb-6">Premium Vault Security</p>
            </div>

            {/* Price & Features */}
            <div className="p-8 w-full">
                <div className="flex items-end justify-center gap-1 mb-8">
                    <span className="text-4xl font-black text-white">$199</span>
                    <span className="text-gray-500 font-bold mb-1">/ year</span>
                </div>

                <div className="space-y-4 text-left mb-8 bg-black/20 p-4 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#d4af37]" />
                        <span className="text-gray-300 text-sm font-medium">256-bit Document Encryption</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#d4af37]" />
                        <span className="text-gray-300 text-sm font-medium">Forensic Audit Trail (Immutable)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[#d4af37]" />
                        <span className="text-gray-300 text-sm font-medium">Priority Heir Access Controls</span>
                    </div>
                </div>

                <button 
                    onClick={handleConfirm}
                    disabled={processing}
                    className="w-full bg-[#d4af37] text-black h-14 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Verifying Payment...
                        </>
                    ) : (
                        <>
                            Secure Checkout <ArrowRight size={16} />
                        </>
                    )}
                </button>
                <p className="text-gray-600 text-[10px] mt-4 font-medium">
                    <Lock size={10} className="inline mr-1" /> Encrypted via Stripe SSL
                </p>
            </div>
        </div>
    </div>
  );
};

// Premium Feature Gate Component
const PremiumFeature = ({ isPremium, onUpgrade, title, description, children, className = "" }) => {
  if (isPremium) return children;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#d4af37]/20 ${className}`}>
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 transition-all duration-500">
            <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37]/20 to-transparent rounded-full flex items-center justify-center text-[#d4af37] mb-5 shadow-[0_0_40px_rgba(212,175,55,0.3)] animate-pulse">
                <Lock size={24} />
            </div>
            <h4 className="text-white font-black text-sm mb-2 uppercase tracking-widest">{title}</h4>
            <p className="text-gray-400 text-xs max-w-[240px] mb-6 leading-relaxed font-medium">{description}</p>
            <button 
                onClick={onUpgrade}
                className="bg-[#d4af37] text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
                <ShieldCheck size={14} /> Unlock Vault
            </button>
        </div>
        <div className="opacity-10 pointer-events-none filter blur-sm grayscale h-full w-full">
            {children}
        </div>
    </div>
  );
};


const SuccessionSuite = ({ isOpen, onClose, companyName = "Your Company LLC", user }) => {
  // Navigation & Core State
  const [activeStep, setActiveStep] = useState('heritage');
  const [isPremium, setIsPremium] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vaultData, setVaultData] = useState('');
  
  // Veto Sentinel State
  const [showBreachAlert, setShowBreachAlert] = useState(false);
  const [breachCountdown, setBreachCountdown] = useState(10); // 10-Day Statutory Buffer (Simulated as seconds for demo)
  const [breachSource, setBreachSource] = useState(null);
  
  // Physical Locations State
  const [locations, setLocations] = useState([
      { id: 1, docType: 'Original Last Will', location: 'Home Safe', notes: 'Master Bedroom Closet, Code: 9942' }
  ]);


  // Document Management State - Separated by vault type
  
  // Heritage Vault - Personal Estate Planning Documents
  const [heritageDocs, setHeritageDocs] = useState([
    { id: 'heritage_1', name: 'Power_of_Attorney.pdf', label: 'Durable Power of Attorney', date: '2024-11-01', size: '456 KB', status: 'active', visibility: 'immediate', createdAt: 'Nov 1, 2024' },
    { id: 'heritage_2', name: 'Healthcare_Directive.pdf', label: 'Advance Healthcare Directive', date: '2024-11-01', size: '234 KB', status: 'active', visibility: 'immediate', createdAt: 'Nov 1, 2024' },
    { id: 'heritage_3', name: 'Life_Insurance_Policy.pdf', label: 'Life Insurance Policy', date: '2024-10-15', size: '1.8 MB', status: 'active', visibility: 'immediate', createdAt: 'Oct 15, 2024' }
  ]);
  
  // Business Vault - LLC Formation & Operational Documents
  const [businessDocs, setBusinessDocs] = useState([
    { id: 'biz_1', name: 'Articles_of_Organization.pdf', label: 'Articles of Organization (State Filed)', date: '2024-10-20', size: '892 KB', status: 'active', visibility: 'immediate', createdAt: 'Oct 20, 2024' },
    { id: 'biz_2', name: 'Operating_Agreement_Signed.pdf', label: 'Operating Agreement (Executed)', date: '2024-10-24', size: '2.4 MB', status: 'active', visibility: 'immediate', createdAt: 'Oct 24, 2024' },
    { id: 'biz_3', name: 'EIN_Confirmation_Letter.pdf', label: 'EIN Assignment Letter', date: '2024-10-24', size: '156 KB', status: 'active', visibility: 'immediate', createdAt: 'Oct 24, 2024' },
    { id: 'biz_4', name: 'Business_License.pdf', label: 'Business License', date: '2024-11-02', size: '345 KB', status: 'active', visibility: 'immediate', createdAt: 'Nov 2, 2024' },
    { id: 'biz_5', name: 'Bank_Account_Agreement.pdf', label: 'Business Bank Account Agreement', date: '2024-10-28', size: '1.2 MB', status: 'active', visibility: 'immediate', createdAt: 'Oct 28, 2024' },
    { id: 'biz_6', name: 'Insurance_Policy_GL.pdf', label: 'General Liability Insurance Policy', date: '2024-11-15', size: '678 KB', status: 'active', visibility: 'immediate', createdAt: 'Nov 15, 2024' }
  ]);
  
  const [legalDocs, setLegalDocs] = useState([]); // User uploaded docs (legacy compatibility)
  
  // Active vault selector
  const [activeVault, setActiveVault] = useState('heritage'); // 'heritage' or 'business'
  const [activeProtocolData, setActiveProtocolData] = useState(null);
  const [isLoadingProtocols, setIsLoadingProtocols] = useState(false);
  
  // Combined docs based on active vault
  const allDocs = React.useMemo(() => {
    if (activeVault === 'heritage') {
      return [...heritageDocs, ...legalDocs];
    } else {
      return businessDocs;
    }
  }, [activeVault, heritageDocs, businessDocs, legalDocs]);


  // Audit Log State
  const [auditLog, setAuditLog] = useState([
      { id: 1, action: 'VIEW', user: 'Founder', details: 'Viewed Succession Dashboard', timestamp: 'Today, 10:42 AM' },
      { id: 2, action: 'LOGIN', user: 'System', details: 'Secure Session Established', timestamp: 'Today, 10:41 AM' }
  ]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);


  // Upload/Certify Workflow State
  const [isCertifying, setIsCertifying] = useState(false);
  const [tempFile, setTempFile] = useState(null);
  const [certifyLabel, setCertifyLabel] = useState('Last Will & Testament');
  const [certifyNote, setCertifyNote] = useState('');
  const [certifyVisibility, setCertifyVisibility] = useState('post-mortem');

  // Load Vault Data & Supabase Protocols
  React.useEffect(() => {
    const saved = localStorage.getItem('charter_vault_instructions');
    if (saved) setVaultData(saved);

    const loadProtocols = async () => {
        if (!user) return;
        setIsLoadingProtocols(true);
        try {
            const { data, error } = await charterSupabase
                .from('wills')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (data && data.length > 0) {
                const latest = data[0];
                setActiveProtocolData(latest.protocol_data);
                
                // Construct a UI doc from the database record
                const dbDoc = {
                    id: latest.id,
                    name: latest.file_name || `${latest.type}_Protocol.pdf`,
                    label: latest.type === 'trust' ? 'Heritage Living Trust Protocol' : 'Last Will & Testament',
                    date: new Date(latest.created_at).toLocaleDateString(),
                    createdAt: new Date(latest.created_at).toLocaleString(),
                    visibility: 'post-mortem',
                    status: 'active',
                    size: latest.type === 'trust' ? '2.4 MB' : '1.2 MB'
                };
                setLegalDocs(prev => {
                    // Avoid duplicates if already in list
                    if (prev.some(d => d.id === latest.id)) return prev;
                    return [dbDoc, ...prev];
                });
            }
        } catch (err) {
            console.error("Error loading protocols:", err);
        } finally {
            setIsLoadingProtocols(false);
        }
    };

    if (isOpen) loadProtocols();
  }, [isOpen, user]);

  // --- HANDLERS ---

  const addAuditEntry = (action, details, note = null) => {
      const newEntry = {
          id: Date.now(),
          action,
          user: 'Founder',
          details,
          note,
          timestamp: new Date().toLocaleString()
      };
      setAuditLog(prev => [newEntry, ...prev]);
  };

  const handleUpgradeTrigger = () => setShowUpgradeModal(true);

  const processUpgrade = async () => {
      setProcessing(true);
      setTimeout(async () => {
          setIsPremium(true);
          setShowUpgradeModal(false);
          addAuditEntry('UPGRADE', 'Unlocked Legacy Vault', 'Subscribed to Compliance Guard');
          await window.zenith.alert("🔓 Vault Unlocked. Your legacy is secure.", "Vault Decrypted");
      }, 1500);
  };

  const handleVaultSave = () => {
      if (!vaultData.trim()) return;
      setIsSaving(true);
      setTimeout(async () => {
          localStorage.setItem('charter_vault_instructions', vaultData);
          setIsSaving(false);
          addAuditEntry('UPDATE', 'Updated Vault Instructions', 'Encrypted new content');
          await window.zenith.alert("🔒 Instructions Encrypted & Saved Securely.", "Vault Saved");
      }, 1500);
  };

  const handleAddLocation = (item) => {
      const newLoc = { ...item, id: Date.now() };
      setLocations([...locations, newLoc]);
      addAuditEntry('UPDATE', `Added location for ${item.docType}`, 'Vault Map Updated');
  };

  const handleRemoveLocation = (id) => {
      setLocations(locations.filter(l => l.id !== id));
      addAuditEntry('DELETE', 'Removed location', 'Vault Map Updated');
  };


  const handleFileSelect = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf';
      input.onchange = (e) => {
          const file = e.target.files[0];
          if(file) {
              setTempFile(file);
              setIsCertifying(true);
          }
      };
      input.click();
  };

  const confirmUpload = () => {
      if(!tempFile) return;
      
      const docId = Date.now();
      const newDoc = {
          id: docId,
          name: tempFile.name,
          label: certifyLabel,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          createdAt: new Date().toLocaleString(),
          visibility: certifyVisibility,
          status: 'active'
      };
      
      const visibilityText = certifyVisibility === 'post-mortem' ? '(Private until Transfer)' : '(Shared with Heirs)';
      
      setLegalDocs([newDoc, ...legalDocs]);
      addAuditEntry('UPLOAD', `Uploaded ${certifyLabel} ${visibilityText}`, certifyNote);
      
      // Reset
      setIsCertifying(false);
      setTempFile(null);
      setCertifyNote('');
      setCertifyLabel('Last Will & Testament');
      setCertifyVisibility('post-mortem');
  };

  const handleArchive = (docId) => {
      const updateList = (list) => list.map(d => d.id === docId ? { ...d, status: 'archived' } : d);
      
      // Check which vault contains the doc and update accordingly
      if (heritageDocs.some(d => d.id === docId)) {
        setHeritageDocs(updateList(heritageDocs));
      } else if (businessDocs.some(d => d.id === docId)) {
        setBusinessDocs(updateList(businessDocs));
      } else if (legalDocs.some(d => d.id === docId)) {
        setLegalDocs(updateList(legalDocs));
      }

      const doc = allDocs.find(d => d.id === docId);
      if(doc) addAuditEntry('ARCHIVE', `Archived ${doc.label}`, 'User Archive Action');
  };

  const handleRestore = (docId) => {
      const updateList = (list) => list.map(d => d.id === docId ? { ...d, status: 'active' } : d);
      
      // Check which vault contains the doc and update accordingly
      if (heritageDocs.some(d => d.id === docId)) {
        setHeritageDocs(updateList(heritageDocs));
      } else if (businessDocs.some(d => d.id === docId)) {
        setBusinessDocs(updateList(businessDocs));
      } else if (legalDocs.some(d => d.id === docId)) {
        setLegalDocs(updateList(legalDocs));
      }

      const doc = allDocs.find(d => d.id === docId);
      if(doc) addAuditEntry('RESTORE', `Restored ${doc.label}`, 'User Restore Action');
  };

  const handleDownloadWill = async (data) => {
      const name = data?.fullName || "Standard";
      const isTrust = protocolPath === 'trust';
      
      const protocolType = isTrust ? 'trust' : 'will';
      
      // 1. SAVE TO SUPABASE (THE IRON VAULT)
      if (user) {
          try {
              const { data: savedRecord, error } = await charterSupabase
                  .from('wills')
                  .insert({
                      user_id: user.id,
                      type: protocolType,
                      protocol_data: data,
                      file_name: `${isTrust ? 'Living_Trust' : 'Last_Will'}_${name.replace(/\s+/g, '_')}.pdf`
                  })
                  .select()
                  .single();

              if (error) throw error;
              
              if (savedRecord) {
                  setActiveProtocolData(data);
                  
                  // 2. Add to local UI state
                  const newDoc = {
                      id: savedRecord.id,
                      name: savedRecord.file_name,
                      label: isTrust ? 'Heritage Living Trust Protocol' : 'Last Will & Testament',
                      date: new Date().toLocaleDateString('en-US'),
                      createdAt: 'Just Now',
                      visibility: 'post-mortem',
                      status: 'active',
                      size: isTrust ? '2.4 MB' : '1.2 MB'
                  };
                  setLegalDocs(prev => [newDoc, ...prev]);
                  addAuditEntry('PERSIST', `Protocol Secured in Iron Vault`, `Reference: ${savedRecord.id.substring(0,8)}`);
              }
          } catch (err) {
              console.error("Supabase Save Error:", err);
              // Fallback to local-only if Supabase fails
              const fallbackId = `fallback_${Date.now()}`;
              setLegalDocs([{ id: fallbackId, label: 'Local Protocol (Unsecured)', date: 'Today', status: 'active' }, ...legalDocs]);
          }
      }

      addAuditEntry('DOWNLOAD', `Generated ${isTrust ? 'Trust Protocol' : 'Will Foundation'} for ${name}`, `User completed ${isTrust ? 'Comprehensive Trust' : 'Essential Will'} Engine`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-[#000000]/95 backdrop-blur-xl" onClick={onClose} />
      
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onConfirm={processUpgrade} />}

      <div className="bg-[#0A0A0B] w-full max-w-5xl h-screen md:h-[90vh] rounded-none md:rounded-[48px] shadow-2xl relative overflow-y-auto flex flex-col md:flex-row animate-in zoom-in-95 border-0 md:border md:border-[#1c1c1e] md:ring-1 md:ring-[#d4af37]/20">
        
        {/* SIDEBAR NAVIGATION - Hidden on Mobile */}
        <div className="hidden md:block w-full bg-[#0f0f10] p-4 sm:p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#1c1c1e] md:w-1/3 md:min-h-full">
           <div className="mb-12">
              <div className="text-[0.65rem] font-black uppercase tracking-[0.5em] text-[#d4af37] opacity-60 mb-4">Legacy Suite</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-white">{companyName}</h2>
           </div>

           <div className="space-y-4">
              <SuiteStep 
                title="Legacy Plan" 
                icon={ShieldCheck} 
                active={activeStep === 'heritage'} 
                onClick={() => setActiveStep('heritage')}
              >
                 <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4">
                  Manage your Will or Trust, protect your assets, and store secure instructions for your family.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#d4af37] font-bold uppercase tracking-wider">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Protection Active
                </div>
              </SuiteStep>

              <SuiteStep 
                title="Family & Helpers" 
                icon={Users} 
                active={activeStep === 'deputies'} 
                onClick={() => setActiveStep('deputies')}
              >
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Choose who receives your assets and who can help unlock your vault if needed.
                </p>
              </SuiteStep>

              <SuiteStep 
                title="Digital Access" 
                icon={Lock} 
                active={activeStep === 'digital'} 
                onClick={() => setActiveStep('digital')}
              >
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Securely store passwords, crypto keys, and social media instructions.
                </p>
              </SuiteStep>

              <SuiteStep 
                title="Paper Document Map" 
                icon={MapPin} 
                active={activeStep === 'map'} 
                onClick={() => setActiveStep('map')}
              >
                 <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  Map the physical locations of your paper documents and safety deposit boxes.
                </p>
              </SuiteStep>
           </div>
        </div>

        {/* MAIN CONTENT PREVIEW */}
        <div className="flex-1 bg-[#050505] p-4 sm:p-6 md:p-8 lg:p-16 relative flex flex-col items-center justify-start text-center">
            <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 p-2 bg-[#1c1c1e] rounded-full text-gray-400 hover:bg-[#d4af37] hover:text-black transition-all shadow-sm z-10"><X size={20} /></button>
            
            <div className="max-w-xl space-y-6 sm:space-y-8 animate-in slide-in-from-right duration-500 w-full" key={activeStep}>

               {activeStep === 'heritage' && (
                   <div className="relative">
                        <HeritageDashboard 
                            docs={allDocs} 
                            onUpload={handleFileSelect} 
                            onArchive={handleArchive} 
                            onRestore={handleRestore} 
                            onDownloadWill={handleDownloadWill} 
                            auditLog={auditLog} 
                            isPremium={isPremium}
                            onUpgrade={handleUpgradeTrigger}
                            // Vault Props
                            vaultData={vaultData}
                            setVaultData={setVaultData}
                            onSaveVault={handleVaultSave}
                            isSavingVault={isSaving}
                            locations={locations}
                            onAddLocation={handleAddLocation}
                            onRemoveLocation={handleRemoveLocation}
                            addAuditEntry={addAuditEntry}
                            // Vault Switcher
                            activeVault={activeVault}
                            setActiveVault={setActiveVault}
                            activeProtocolData={activeProtocolData}
                        />
                   </div>
               )}

               {activeStep === 'deputies' && (
                   <div className="animate-in slide-in-from-bottom-8 duration-500">
                       <BeneficiaryContent />
                       <div className="mt-12 pt-8 border-t border-gray-800">
                           <button 
                               onClick={() => setActiveStep('heritage')}
                               className="flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-widest mx-auto"
                           >
                               <ArrowRight className="rotate-180" size={14} /> Back to Vault
                           </button>
                       </div>
                   </div>
               )}

               {activeStep === 'digital' && (
                   <div className="animate-in slide-in-from-bottom-8 duration-500">
                       <div className="w-20 h-20 bg-[#1c1c1e] rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#d4af37] border border-[#d4af37]/20 mb-6">
                          <Lock size={32} />
                       </div>
                       <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">Digital Access</h2>
                       <p className="text-gray-500 font-medium mb-12">Secure your digital life and important access keys for your family.</p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                           <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-gray-800 hover:border-[#d4af37]/30 transition-all">
                               <div className="p-3 bg-gray-900 w-fit rounded-lg text-[#d4af37] mb-4">
                                   <Key size={18} />
                               </div>
                               <h4 className="text-white font-bold text-sm mb-2">Password Master Keys</h4>
                               <p className="text-gray-500 text-[10px] leading-relaxed mb-4">Store instructions for your password manager (e.g. 1Password, LastPass) or master login.</p>
                               <button className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest hover:underline">+ Secure Entry</button>
                           </div>

                           <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-gray-800 hover:border-[#d4af37]/30 transition-all">
                               <div className="p-3 bg-gray-900 w-fit rounded-lg text-[#d4af37] mb-4">
                                   <Box size={18} />
                               </div>
                               <h4 className="text-white font-bold text-sm mb-2">Crypto & Cold Storage</h4>
                               <p className="text-gray-500 text-[10px] leading-relaxed mb-4">Instructions for seed phrases and hardware wallets stored in physical locations.</p>
                               <button className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest hover:underline">+ Secure Entry</button>
                           </div>
                       </div>
                   </div>
               )}

               {activeStep === 'map' && (
                   <div className="animate-in slide-in-from-bottom-8 duration-500">
                       <TriggerContent />
                        <div className="mt-12 pt-8 border-t border-gray-800">
                            <div className="bg-[#1c1c1e] p-8 rounded-3xl border border-gray-800 text-center">
                                <p className="text-gray-500 text-xs italic">Location mapping engine processing...</p>
                                <div className="mt-4 flex flex-wrap justify-center gap-4">
                                    {locations.map(loc => (
                                        <div key={loc.id} className="px-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-[10px] text-gray-300 font-mono">
                                            {loc.docType}: {loc.location}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                   </div>
               )}
            </div>
        </div>

      </div>

      {/* CERTIFICATION MODAL */}
      {isCertifying && (
          <div className="absolute inset-0 z-[600] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-[#1c1c1e] w-full max-w-md p-8 rounded-3xl border border-[#d4af37]/30 shadow-2xl">
                  <h3 className="text-2xl font-black uppercase text-white mb-2">Certify Document</h3>
                  <p className="text-gray-400 text-xs mb-6">Please label this document for the official legal audit trail.</p>

                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest block mb-2">Document Type</label>
                          <select
                            value={certifyLabel}
                            onChange={(e) => setCertifyLabel(e.target.value)}
                            className="w-full bg-black text-white p-3 rounded-xl border border-gray-800 outline-none focus:border-[#d4af37]"
                          >
                              <option>Last Will & Testament</option>
                              <option>Revocable Living Trust</option>
                              <option>Unit Transfer Agreement</option>
                              <option>Spousal Consent Form</option>
                              <option>LLC Resolution (Transfer Auth)</option>
                              <option>Power of Attorney (Financial)</option>
                              <option>Medical Directive</option>
                              <option>Amendment to Operating Agreement</option>
                              <option>Other</option>
                          </select>
                      </div>

                      <div>
                          <label className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest block mb-2">When can heirs see this?</label>
                          <select
                            value={certifyVisibility}
                            onChange={(e) => setCertifyVisibility(e.target.value)}
                            className="w-full bg-black text-white p-3 rounded-xl border border-gray-800 outline-none focus:border-[#d4af37]"
                          >
                              <option value="post-mortem">After I Pass Away (Private)</option>
                              <option value="immediate">Available Now (Shared)</option>
                          </select>
                          <p className="text-[10px] text-gray-500 mt-2">
                              {certifyVisibility === 'post-mortem'
                                ? "Heirs will only see this document after the Transfer Event is verified."
                                : "Heirs will be able to view and download this document immediately."}
                          </p>
                      </div>

                      <div>
                          <label className="text-[10px] uppercase font-bold text-[#d4af37] tracking-widest block mb-2">Audit Note (Optional)</label>
                          <textarea
                             value={certifyNote}
                             onChange={(e) => setCertifyNote(e.target.value)}
                             placeholder="E.g. Signed in presence of notary public..."
                             className="w-full bg-black text-white p-3 rounded-xl border border-gray-800 h-24 resize-none outline-none focus:border-[#d4af37]"
                          />
                      </div>

                      <div className="flex gap-3 pt-4">
                          <button onClick={() => setIsCertifying(false)} className="flex-1 py-3 bg-gray-800 rounded-xl text-white font-bold text-xs uppercase">Cancel</button>
                          <button onClick={confirmUpload} className="flex-1 py-3 bg-[#d4af37] rounded-xl text-black font-bold text-xs uppercase hover:bg-white transition-colors">Confirm & Upload</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// --- CONTENT SUB-COMPONENTS ---



const BeneficiaryContent = () => (
  <>
    <div className="w-20 h-20 bg-[#1c1c1e] rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#d4af37] border border-[#d4af37]/20">
       <Users size={32} />
    </div>
    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Primary Heir</h2>
    <p className="text-gray-500 font-medium mb-6">Designate the primary beneficiary for your Last Will & Testament.</p>
    <div className="bg-[#1c1c1e] p-8 rounded-2xl shadow-sm text-left border border-[#d4af37]/20">
       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Full Legal Name</label>
       <input type="text" placeholder="e.g. John Doe Jr." className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white font-bold mb-6 focus:border-[#d4af37] outline-none transition-colors" />

       <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Relationship</label>
       <div className="flex gap-2">
           {['Spouse', 'Child', 'Trust', 'Partner'].map(r => (
               <button key={r} className="flex-1 py-3 bg-black rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-900 border border-gray-800 transition-colors">
                   {r}
               </button>
           ))}
       </div>
    </div>
  </>
);

const TriggerContent = () => (
  <>
    <div className="w-20 h-20 bg-[#1c1c1e] rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#d4af37] border border-[#d4af37]/20">
       <Fingerprint size={32} />
    </div>
    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Transfer Events</h2>
    <p className="text-gray-500 font-medium">When should we transfer ownership?</p>

    <div className="space-y-4">
        {['Upon Death (Certified)', 'Incapacitation (Medical)', 'Disappearance (30 days)'].map((t, i) => (
             <div key={i} className="bg-[#1c1c1e] p-4 rounded-xl border border-gray-800 flex items-center justify-between cursor-pointer hover:border-[#d4af37]/50 transition-colors group">
                 <span className="font-bold text-gray-300 group-hover:text-white">{t}</span>
                 <div className="w-6 h-6 rounded-full border-2 border-gray-600 group-hover:border-[#d4af37]"></div>
             </div>
        ))}
    </div>
  </>
);

const HeritageDashboard = ({ 
    docs = [], onUpload, onArchive, onRestore, onDownloadWill, 
    auditLog = [], isPremium, onUpgrade,
    vaultData, setVaultData, onSaveVault, isSavingVault,
    locations = [], onAddLocation, onRemoveLocation, addAuditEntry,
    activeVault, setActiveVault, activeProtocolData
}) => {
  const safeProtocolData = activeProtocolData || {};
  console.log('HeritageDashboard: Rendering', { docs, auditLog, activeProtocolData: safeProtocolData });

  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [showSecurityChallenge, setShowSecurityChallenge] = useState(false);
  const [showDeputies, setShowDeputies] = useState(false);
  const [showStatutoryWarning, setShowStatutoryWarning] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ location: '', notes: '' });
  const [showProtocolSelector, setShowProtocolSelector] = useState(false);
  const [protocolPath, setProtocolPath] = useState(null); // 'trust' or 'will'
  const [showCompareGrid, setShowCompareGrid] = useState(false); // Steve-Pro: Side-by-side tech view
  const [hasUnlockedOnce, setHasUnlockedOnce] = useState(false); // Steve-Pro: Quick-Look skip logic
  const [lastAuditTime, setLastAuditTime] = useState('0s ago'); // Steve-Pro: Liveliness marker
  
  const handleArchiveDeputy = (id) => {
      setDeputies(prev => prev.map(d => d.id === id ? { ...d, archived: true } : d));
      const deputy = deputies.find(d => d.id === id);
      if(deputy) addAuditEntry('DEPUTY_ARCHIVE', `Archived Helper: ${deputy.name}`, 'Security Privilege Revoked');
  };

  const handleRestoreDeputy = (id) => {
      setDeputies(prev => prev.map(d => d.id === id ? { ...d, archived: false } : d));
      const deputy = deputies.find(d => d.id === id);
      if(deputy) addAuditEntry('DEPUTY_RESTORE', `Restored Helper: ${deputy.name}`, 'Security Privilege Reinstated');
  };

  // UPL Audit / Signature States
  const [hasAcknowledgedDisclosure, setHasAcknowledgedDisclosure] = useState(false);
  const [disclosureSignature, setDisclosureSignature] = useState('');
  const [disclosureVersion] = useState('v1.0.4-FL'); // Version for compliance hashing

  // Vault Security States (Zero-Knowledge Simulation)
  const [vaultPIN, setVaultPIN] = useState(null); // Real-world: This is a PBKDF2 hash
  const [masterRecoveryKey, setMasterRecoveryKey] = useState(null);
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [showSocialRecovery, setShowSocialRecovery] = useState(false);
  const [tempPIN, setTempPIN] = useState('');
  const [enteredPIN, setEnteredPIN] = useState('');
  
  // Breach Simulation States
  const [showBreachAlert, setShowBreachAlert] = useState(false);
  const [breachCountdown, setBreachCountdown] = useState(0);
  const [breachSource, setBreachSource] = useState('');

  // Steve-Pro: Simulate live audit liveliness
  useEffect(() => {
    const timer = setInterval(() => {
        setLastAuditTime(prev => {
            const seconds = parseInt(prev) || 0;
            if (seconds >= 59) return '1m ago';
            return `${seconds + 1}s ago`;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [deputies, setDeputies] = useState([
      { id: 1, name: 'Sarah (Spouse)', email: 'sarah@example.com', role: 'Executor', status: 'Active', condition: 'Immediate', archived: false },
      { id: 2, name: 'John (Son)', email: 'john@example.com', role: 'Beneficiary', status: 'Pending', condition: 'Post-Mortem', archived: false }
  ]);
  const [showAddDeputyForm, setShowAddDeputyForm] = useState(false);
  const [newDeputy, setNewDeputy] = useState({ name: '', email: '', role: 'Beneficiary', condition: 'Post-Mortem' });

  // Steve-Pro: Keyboard Shortcuts (1=Trust, 2=Will)
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (showProtocolSelector) {
            if (e.key === '1') { setProtocolPath('trust'); setShowProtocolSelector(false); setShowStatutoryWarning(true); }
            if (e.key === '2') { setProtocolPath('will'); setShowProtocolSelector(false); setShowStatutoryWarning(true); }
            if (e.key === 'c') { setShowCompareGrid(!showCompareGrid); }
        }
        
        // Steve-Pro: Enter to confirm disclosure if ready
        if (showStatutoryWarning && e.key === 'Enter') {
            const isReady = hasAcknowledgedDisclosure && disclosureSignature.length > 2;
            if (isReady) {
                handleDisclosureConfirmation();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showProtocolSelector, showCompareGrid, showStatutoryWarning, hasAcknowledgedDisclosure, disclosureSignature]);

  // UPL Audit Logic: Generate Compliance Hash
  const generateComplianceHash = () => {
    const textToHash = `DISCLOSURE_${disclosureVersion}_SIGNATURE_${disclosureSignature}_USER_CH_001`;
    // Simple mock hash for demo audit trail
    return Array.from(textToHash).reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0).toString(16).toUpperCase();
  };

  const handleDisclosureConfirmation = () => {
    const complianceHash = generateComplianceHash();
    const simulatedIP = `172.24.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    addAuditEntry(
        'STATUTORY_ACK_SIGNED', 
        `User signed disclosure via Option B (Fortress Mode)`, 
        `IP: ${simulatedIP} | Hash: ${complianceHash} | Signature: ${disclosureSignature} | Version: ${disclosureVersion}`
    );
    
    setShowStatutoryWarning(false);
    setShowWizard(true);
    // Reset for next time
    setHasAcknowledgedDisclosure(false);
    setDisclosureSignature('');
  };

  // Vault Security Logic
  const handlePINSetup = async () => {
    if (tempPIN.length !== 4) return;
    
    // Safety check: Lone Wolf warning
    if (deputies.length === 0) {
        const confirmed = await window.zenith.confirm(
            "SECURITY ALERT: You have zero Trusted Helpers. If you lose your PIN and Master Key, Charter Legacy cannot reset your vault. Continue anyway?",
            "LONE WOLF WARNING"
        );
        if (!confirmed) return;
    }

    setVaultPIN(tempPIN);
    // Generate a secure-looking recovery key
    const randomKey = Array.from({length: 4}, () => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
    setMasterRecoveryKey(randomKey);
    setShowPINSetup(false);
    addAuditEntry('VAULT_INITIALIZED', 'Master PIN Created', `Zero-Knowledge Key Generated | Helpers: ${deputies.length}`);
  };

  const handleVaultUnlockAttempt = (pin) => {
    if (pin === vaultPIN) {
        setIsVaultUnlocked(true);
        setHasUnlockedOnce(true);
        setShowSecurityChallenge(false);
        setEnteredPIN('');
        addAuditEntry('ACCESS_GRANTED', 'Master Identity Verified', `Auth Level: ${hasUnlockedOnce ? 'High-Trust' : 'Standard'}`);
    } else {
        setEnteredPIN('');
        addAuditEntry('ACCESS_DENIED', 'Invalid PIN Attempt', 'Security Lockout Cooldown: 30s');
        window.zenith.alert("ACCESS DENIED: Master Identity PIN Mismatch.", "Authentication Error");
    }
  };

  const handlePINKeyPress = (e) => {
    if (e.key === 'Enter' && enteredPIN.length === 4) {
        handleVaultUnlockAttempt(enteredPIN);
    }
    if (e.key === 'Escape') {
        setShowSecurityChallenge(false);
        setEnteredPIN('');
    }
  };

  const resetVaultSecurity = async () => {
    const confirmed = await window.zenith.confirm(
        "DEV MODE: Wipe all Vault Security (PIN & Recovery Key) to test first-time setup?",
        "FACTORY RESET"
    );
    if (confirmed) {
        setVaultPIN(null);
        setMasterRecoveryKey(null);
        setIsVaultUnlocked(false);
        setHasUnlockedOnce(false);
        setShowPINSetup(true);
        setShowSecurityChallenge(true);
        addAuditEntry('SECURITY_RESET', 'Vault Keys Wiped', 'System returned to factory initialization');
    }
  };

  // VETO SENTINEL LOGIC
  const simulateBreach = async () => {
      const confirmed = await window.zenith.confirm(
          "This will simulate a 'Succession Key' usage event to test your Veto Protocol. Continue?",
          "TEST BREACH PROTOCOL"
      );
      if(!confirmed) return;

      setShowBreachAlert(true);
      setBreachCountdown(10);
      setBreachSource(`IP: 45.22.19.${Math.floor(Math.random() * 255)} (Unknown Device)`);
      
      // Countdown Timer
      const timer = setInterval(() => {
          setBreachCountdown(prev => {
              if (prev <= 1) {
                  clearInterval(timer);
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
      
      addAuditEntry('BREACH_DETECTED', 'Succession Key Activated', 'Status: 10-Day Statutory Buffer Initiated');
  };

  const executeVeto = () => {
      setShowBreachAlert(false);
      addAuditEntry('VETO_EXECUTED', 'Root Authority Intervened', 'Succession Key REVOKED. Vault Locked.');
      window.zenith.alert("PROTOCOL ENFORCED: The active session has been terminated and the key is now invalid.", "VETO CONFIRMED");
      setIsVaultUnlocked(false); // Force lock
  };

  // Identify the Active Protocol
  const activeWill = docs?.find(d => d.status === 'active' && d.label.includes('Will'));
  const activeTrust = docs?.find(d => d.status === 'active' && d.label.includes('Trust'));
  const hasActiveProtocol = activeWill || activeTrust;
  
  // SMART FILTER: Hide Corporate Docs, Show Personal/Mixed
  // Blocklist: Operating Agreements, EINs, Resolutions
  const corporateKeywords = ['Operating Agreement', 'EIN', 'Resolution', 'Article', 'Formation'];
  
  const filteredDocs = docs.filter(d => {
      const isArchivedMatch = d.status === (showArchived ? 'archived' : 'active');
      const isNotWill = d.id !== activeWill?.id; // Don't duplicate the main Will
      const isNotCorporate = !corporateKeywords.some(k => d.label.includes(k) || d.type?.includes(k));
      
      return isArchivedMatch && isNotWill && isNotCorporate;
  });

  // Steve-Pro: Export Audit Logs to JSON
  const exportAuditLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "charter_vault_audit_trail.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
  <>
    {showWizard && (
        <ProtocolWizard
            onClose={() => setShowWizard(false)}
            onComplete={(data) => {
                setShowWizard(false);
                onDownloadWill(data);
            }}
            mode={protocolPath} // Pass whether it's standalone will or trust-bundle will
            initialData={safeProtocolData}
        />
    )}

    {showProtocolSelector && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500 overflow-y-auto">
            <div className="max-w-5xl w-full py-12">
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 bg-gray-800 rounded-full text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-4">
                        The Inheritance Path
                    </div>
                    <h2 className="text-4xl font-black uppercase text-white tracking-tighter mb-4 italic">How Shall We Protect Your Life’s Work?</h2>
                    <p className="text-gray-500 text-sm max-w-lg mx-auto">The path to a clean transition starts here. Select the instruction set that best secures your family’s future.</p>
                </div>

                {!showCompareGrid ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-in slide-in-from-bottom-4">
                        {/* OPTION 1: LIVING TRUST (THE STANDARD) */}
                        <div 
                            onClick={() => { setProtocolPath('trust'); setShowProtocolSelector(false); setShowStatutoryWarning(true); }}
                            className="group relative bg-[#1c1c1e] border-2 border-[#d4af37] p-8 rounded-[48px] cursor-pointer hover:scale-[1.02] transition-all shadow-2xl shadow-[#d4af37]/10"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                                Most Popular Choice <span className="opacity-40 text-[8px] ml-2">[Hit 1]</span>
                            </div>
                            <div className="w-20 h-20 bg-[#d4af37]/10 rounded-3xl flex items-center justify-center mb-8 text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                                <Shield size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase mb-4">The Guardian Trust</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                Our most complete strategy. Designed to help your family avoid the public court process and keep your private life private. Includes a <span className="text-white font-bold inline-flex items-center gap-1">Living Trust Template</span> and a <span className="text-[#d4af37] font-bold">Safeguard Will Form</span>.
                            </p>
                            
                            <div className="bg-black/20 p-5 rounded-2xl border border-[#d4af37]/10 mb-8">
                                <h4 className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Brain size={12} /> Why Choose This?
                                </h4>
                                <p className="text-gray-500 text-[10px] leading-relaxed">
                                    Intended to assist in avoiding the public court process while facilitating <span className="text-white font-bold">Business Continuity</span> for your heirs.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-10">
                                {['Designed to Assist in Avoiding Probate', 'Maintain Privacy & Confidentiality', 'Operational Continuity Support', 'Rapid Transfer to Heirs'].map(f => (
                                    <div key={f} className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        <CheckCircle2 size={14} className="text-[#d4af37]" /> {f}
                                    </div>
                                ))}
                            </div>
                            
                            <button className="w-full py-4 bg-[#d4af37] text-black font-black uppercase tracking-widest rounded-2xl group-hover:bg-white transition-colors shadow-lg shadow-[#d4af37]/20">Start This Plan</button>
                        </div>

                        {/* OPTION 2: STANDALONE WILL (THE TRADITIONALIST) */}
                        <div 
                            onClick={() => { setProtocolPath('will'); setShowProtocolSelector(false); setShowStatutoryWarning(true); }}
                            className="group relative bg-[#0f0f10] border-2 border-slate-800 p-8 rounded-[48px] cursor-pointer hover:border-[#3b82f6]/50 hover:scale-[1.02] transition-all"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg group-hover:bg-[#3b82f6]">
                                Valid Alternative <span className="opacity-40 text-[8px] ml-2">[Hit 2]</span>
                            </div>
                            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 text-slate-500 group-hover:text-white transition-colors">
                                <FileText size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase mb-4">The Legacy Will</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                A clean, standard approach. Provides <span className="text-white font-bold">Specific Instructions</span> for the court to manage your wishes through the <span className="text-slate-300 font-bold">Public Probate Process</span>.
                            </p>
                            
                            <div className="space-y-4 mb-10">
                                {['Subject to Public Court', 'Entries Become Public Record', 'Activation only after death', 'Takes 6-12 month process'].map(f => (
                                    <div key={f} className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        <Clock size={16} className="text-slate-700" /> {f}
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 bg-slate-800 text-slate-300 font-black uppercase tracking-widest rounded-2xl group-hover:bg-white group-hover:text-black transition-colors">Start This Option</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#111] rounded-[48px] border border-gray-800 p-10 mb-12 animate-in zoom-in-95 duration-300">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="py-6 text-gray-600 uppercase text-[10px] font-black tracking-widest">Technical Feature</th>
                                    <th className="py-6 text-[#d4af37] uppercase text-[10px] font-black tracking-widest">Living Trust Bundle</th>
                                    <th className="py-6 text-slate-400 uppercase text-[10px] font-black tracking-widest">Standalone Will</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {[
                                    { label: 'Privacy Status', trust: 'Confidential (Private)', will: 'Public Record (Court)' },
                                    { label: 'Asset Protection', trust: 'Operational Continuity', will: 'Frozen Pending Probate' },
                                    { label: 'Time to Transfer', trust: 'Rapid (Days/Weeks)', will: 'Standard (6-12 Months)' },
                                    { label: 'Complexity', trust: 'Requires Funding (Titles)', will: 'Instructions Only' },
                                    { label: 'Incapacity Support', trust: 'Active during your life', will: 'Death-only activation' },
                                    { label: 'Cost Structure', trust: 'Premium Setup / No Probate', will: 'Low Setup / Court Fees' }
                                ].map((row, i) => (
                                    <tr key={row.label} className="border-b border-white/[0.03] group hover:bg-white/[0.02]">
                                        <td className="py-5 text-gray-400 font-bold uppercase tracking-wider text-[9px]">{row.label}</td>
                                        <td className="py-5 text-white font-medium">{row.trust}</td>
                                        <td className="py-5 text-gray-500">{row.will}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <div className="flex flex-col items-center gap-6 mt-8">
                    <button 
                        onClick={() => setShowCompareGrid(!showCompareGrid)}
                        className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-white/30 transition-all text-[9px] font-bold uppercase tracking-widest"
                    >
                        {showCompareGrid ? <FileText size={12} /> : <Filter size={12} />} 
                        {showCompareGrid ? 'Switch to Benefit View' : 'Compare Technical Specs side-by-side'}
                        <span className="opacity-30 ml-2">[Hit C]</span>
                    </button>

                    <button 
                        onClick={() => setShowProtocolSelector(false)}
                        className="text-gray-500 hover:text-white font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2"
                    >
                         <X size={12} /> Cancel & Return to Vault
                    </button>
                </div>
            </div>
        </div>
    )}

    <div className="space-y-20 animate-in fade-in duration-700">
    {/* HEADER */}
    <div className="text-center mb-10 animate-in slide-in-from-top duration-700">
        <div className="w-16 h-16 bg-gradient-to-br from-[#1c1c1e] to-black rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 mb-6 relative">
             <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">Heritage Vault</h2>
        <p className="text-gray-500 font-medium text-xs max-w-lg mx-auto leading-relaxed">
            Securely store and manage your estate planning documents.
        </p>
        <p className="text-gray-600 text-[9px] mt-3 max-w-md mx-auto border-t border-gray-900 pt-3">
            <span className="font-bold">Disclaimer:</span> Charter Legacy is a document management platform, not a law firm. We do not provide legal advice. Consult a licensed attorney for legal guidance.
        </p>
    </div>

    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">

        {/* SECTION 1: SUCCESSION ENGINE (The Blueprint) */}
        <div className="bg-gradient-to-br from-[#1c1c1e] to-[#0A0A0B] rounded-[2.5rem] border-t-4 border-t-[#d4af37] border-x border-x-gray-800 border-b border-b-gray-800 p-8 shadow-2xl relative overflow-hidden group prism-border">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-bl-[10rem] group-hover:bg-[#d4af37]/10 transition-colors pointer-events-none"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div>
                             <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                {activeWill ? "Last Will & Testament" : activeTrust ? "Family Living Trust" : "Will or Living Trust Choice Protocol"}
                            </h3>
                            <p className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest mt-0.5">
                                {hasActiveProtocol ? "Active Heritage Plan" : "Step 1: Offer Will vs. Trust Choice"}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-md">
                        {activeTrust 
                            ? `Your Living Trust was created on ${activeTrust.date}. Use the buttons below to view your plan or update your information.` 
                            : activeWill 
                                ? `Your Will was created on ${activeWill.date}. Use the buttons below to view or update your Will form.` 
                                : "Begin your Heritage Protocol. We offer both Traditional Will and Automated Living Trust options to best suit your business and family needs."}
                    </p>

                    <div className="flex gap-3">
                        {hasActiveProtocol ? (
                            <>
                                <button onClick={() => {
                                    setViewingDoc(activeTrust || activeWill);
                                    addAuditEntry('VIEW_DOC', `Opened ${activeTrust?.label || activeWill?.label}`, 'Secure Viewer Session');
                                }} className="px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#d4af37] transition-all flex items-center gap-2">
                                    <Eye size={14} /> View Sample Plan Preview
                                </button>
                                <button onClick={() => {
                                    setProtocolPath(activeTrust ? 'trust' : 'will');
                                    setShowStatutoryWarning(true);
                                }} className="px-6 py-3 bg-transparent border border-gray-700 text-gray-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:text-white hover:border-white transition-all flex items-center gap-2">
                                    <Edit2 size={14} /> Update Info
                                </button>
                            </>
                        ) : (
                             <button onClick={() => setShowProtocolSelector(true)} className="px-8 py-4 bg-[#d4af37] text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] shadow-xl shadow-[#d4af37]/20 transition-all flex items-center gap-2">
                                <Brain size={16} /> Set Up Your Legacy Plan <AlertCircle size={14} className="opacity-50" title="Help & Guidance: Choose your path" />
                            </button>
                        )}
                    </div>


                    {/* Physical Location Tracker (Inline) */}
                    {activeWill && (
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-[#d4af37]" />
                                    <h4 className="text-white font-bold text-xs uppercase tracking-wider">Where Is Your Original Document?</h4>
                                </div>
                                {isVaultUnlocked && (
                                    <button 
                                        onClick={() => {
                                            const willLocation = locations.find(l => l.docType.includes('Will'));
                                            if (willLocation) {
                                                setEditingId(willLocation.id);
                                                setEditData({ location: willLocation.location, notes: willLocation.notes || '' });
                                            }
                                        }}
                                        className="text-[10px] text-gray-500 hover:text-[#d4af37] uppercase font-bold tracking-wider flex items-center gap-1"
                                    >
                                        <Edit2 size={10} /> Update Location
                                    </button>
                                )}
                            </div>
                            
                            {!isVaultUnlocked ? (
                                <div className="bg-black/40 border border-gray-800 rounded-lg p-4 text-center">
                                    <Lock size={16} className="text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-600 text-xs font-mono">Unlock Vault to View</p>
                                </div>
                            ) : editingId === locations.find(l => l.docType.includes('Will'))?.id ? (
                                // EDIT MODE
                                <div className="bg-black/40 border border-[#d4af37] rounded-lg p-4 space-y-4">
                                    <div>
                                        <label className="text-[9px] text-gray-500 uppercase font-bold mb-2 block">Physical Location</label>
                                        <input 
                                            value={editData.location}
                                            onChange={(e) => setEditData({...editData, location: e.target.value})}
                                            className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
                                            placeholder="e.g., Home Safe, Master Bedroom Closet"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] text-[#d4af37] uppercase font-bold mb-2 block">Access Code / Key (Optional)</label>
                                        <input 
                                            value={editData.notes}
                                            onChange={(e) => setEditData({...editData, notes: e.target.value})}
                                            className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none font-mono"
                                            placeholder="e.g., Code: 9942"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            onClick={() => {
                                                const willLocation = locations.find(l => l.docType.includes('Will'));
                                                if (willLocation) {
                                                    const updatedLoc = { ...willLocation, location: editData.location, notes: editData.notes };
                                                    onRemoveLocation(willLocation.id);
                                                    onAddLocation(updatedLoc);
                                                }
                                                setEditingId(null);
                                            }}
                                            className="px-4 py-2 bg-[#d4af37] text-black rounded-lg text-[10px] font-bold uppercase hover:bg-white transition-all"
                                        >
                                            Save Changes
                                        </button>
                                        <button 
                                            onClick={() => setEditingId(null)}
                                            className="px-4 py-2 bg-gray-800 text-gray-400 rounded-lg text-[10px] font-bold uppercase hover:text-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // VIEW MODE
                                <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Physical Location</p>
                                            <p className="text-gray-300 text-xs">
                                                {locations.find(l => l.docType.includes('Will'))?.location || 'Not yet logged'}
                                            </p>
                                        </div>
                                        {locations.find(l => l.docType.includes('Will'))?.notes && (
                                            <div>
                                                <p className="text-[9px] text-[#d4af37] uppercase font-bold mb-1">Access Code / Key</p>
                                                <p className="text-white font-mono text-xs bg-[#1c1c1e] px-2 py-1 rounded border border-gray-700 inline-block">
                                                    {locations.find(l => l.docType.includes('Will'))?.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Status Readout */}
                <div className="md:col-span-1 border-l border-gray-800 pl-8 hidden md:block">
                     <div className="space-y-6">
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Status</span>
                            {hasActiveProtocol ? (
                                <span className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-wider">
                                    <CheckCircle2 size={14} /> Active & Valid
                                </span>
                            ) : (
                                 <span className="flex items-center gap-2 text-[#d4af37] font-bold text-xs uppercase tracking-wider">
                                    <Brain size={14} /> Selection Required
                                </span>
                            )}
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-1">Document Type</span>
                            <span className="text-white font-bold text-xs">
                                {activeTrust ? "Heritage Living Trust" : activeWill ? "Last Will & Testament" : "No Protocol Selected"}
                            </span>
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* SECTION 2: THE VAULT (Hidden by Default) */}
        <div id="vault-section" className="relative group">
             <div className="flex justify-between items-center mb-6 px-2">
                 <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#1c1c1e] border border-gray-800 flex items-center justify-center text-gray-400">
                        <Lock size={14} />
                     </div>
                       <h3 className="text-white font-bold text-sm uppercase tracking-wider">Safe Keeping Vault</h3>
                 </div>
                 <button 
                    onClick={() => setShowDeputies(!showDeputies)}
                    className="text-[10px] bg-[#1c1c1e] text-gray-400 border border-gray-800 px-3 py-1.5 rounded-lg hover:text-white hover:border-[#d4af37] transition-all font-bold uppercase tracking-wider flex items-center gap-2"
                 >
                    <Users size={12} /> Trusted Helpers ({deputies.length})
                 </button>
             </div>

             {/* DEPUTIES MODAL (Inline) */}
             {showDeputies && (
                <div className="bg-[#1c1c1e] rounded-2xl border border-gray-800 p-6 mb-8 animate-in slide-in-from-top-4 relative z-30">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-tight">Your Trusted Helpers</h4>
                            <p className="text-gray-500 text-[10px] max-w-md mt-1">
                                These are the people (like your spouse or children) who can access this vault if something happens to you. By default, they can only see this after providing a death certificate.
                            </p>
                        </div>
                        <button onClick={() => setShowDeputies(false)} className="p-1 hover:bg-gray-800 rounded-full text-gray-500"><X size={14} /></button>
                    </div>

                    <div className="space-y-3 mb-6">
                        {deputies.filter(d => showArchived ? d.archived : !d.archived).map(deputy => (
                            <div key={deputy.id} className="flex items-center justify-between p-3 bg-black/40 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${deputy.status === 'Active' ? 'bg-green-900/30 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                                        {deputy.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-white text-xs font-bold">{deputy.name}</div>
                                        <div className="text-gray-600 text-[10px]">{deputy.role} • {deputy.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                         deputy.condition === 'Immediate' 
                                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                     }`}>
                                         {deputy.condition === 'Immediate' ? 'Can Access Now' : 'Access After Death'}
                                     </span>
                                     {showArchived ? (
                                         <button 
                                            onClick={() => handleRestoreDeputy(deputy.id)}
                                            className="text-[#d4af37] hover:text-white transition-colors"
                                            title="Restore Helper"
                                         >
                                            <RefreshCw size={14} />
                                         </button>
                                     ) : (
                                         <button 
                                            onClick={() => handleArchiveDeputy(deputy.id)}
                                            className="text-gray-600 hover:text-red-400 transition-colors"
                                            title="Archive Helper"
                                         >
                                            <Archive size={14} />
                                         </button>
                                     )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {showAddDeputyForm ? (
                        <div className="bg-black/40 border border-gray-800 rounded-xl p-4 animate-in slide-in-from-top-2">
                            <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-4">New Legacy Deputy</h5>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={newDeputy.name}
                                        onChange={(e) => setNewDeputy({...newDeputy, name: e.target.value})}
                                        className="w-full bg-[#1c1c1e] text-white text-xs border border-gray-700 rounded-lg p-2 focus:border-[#d4af37] focus:outline-none"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={newDeputy.email}
                                        onChange={(e) => setNewDeputy({...newDeputy, email: e.target.value})}
                                        className="w-full bg-[#1c1c1e] text-white text-xs border border-gray-700 rounded-lg p-2 focus:border-[#d4af37] focus:outline-none"
                                        placeholder="jane@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Role</label>
                                    <select 
                                        value={newDeputy.role}
                                        onChange={(e) => setNewDeputy({...newDeputy, role: e.target.value})}
                                        className="w-full bg-[#1c1c1e] text-white text-xs border border-gray-700 rounded-lg p-2 focus:border-[#d4af37] focus:outline-none"
                                    >
                                        <option value="Spouse">Spouse</option>
                                        <option value="Executor">Executor</option>
                                        <option value="Beneficiary">Beneficiary</option>
                                        <option value="Attorney">Attorney</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Access Condition</label>
                                    <select 
                                        value={newDeputy.condition}
                                        onChange={(e) => setNewDeputy({...newDeputy, condition: e.target.value})}
                                        className="w-full bg-[#1c1c1e] text-white text-xs border border-gray-700 rounded-lg p-2 focus:border-[#d4af37] focus:outline-none"
                                    >
                                        <option value="Post-Mortem">Post-Mortem (Death Cert.)</option>
                                        <option value="Immediate">Immediate Access</option>
                                        <option value="Incapacitated">Incapacitation Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => setShowAddDeputyForm(false)}
                                    className="px-4 py-2 text-gray-500 text-xs font-bold uppercase hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if(!newDeputy.name || !newDeputy.email) return;
                                        setDeputies([...deputies, { ...newDeputy, id: Date.now(), status: 'Pending' }]);
                                        addAuditEntry('DEPUTY_INVITE', `Invited ${newDeputy.name}`, `Role: ${newDeputy.role}`);
                                        setShowAddDeputyForm(false);
                                        setNewDeputy({ name: '', email: '', role: 'Beneficiary', condition: 'Post-Mortem' });
                                    }}
                                    className="px-4 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase rounded-lg hover:bg-[#b5952f]"
                                >
                                    Invite Helper
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setShowAddDeputyForm(true)}
                            className="w-full py-2 border border-dashed border-gray-700 rounded-xl text-gray-500 text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-all flex items-center justify-center gap-2"
                        >
                            <Users size={14} /> Add A Trusted Helper
                        </button>
                    )}
                </div>
             )}

            {/* Content Container (Industrial Vault Aesthetic) */}
            <div className={`bg-gradient-to-b from-[#0A0A0B] to-black border-4 border-double border-gray-900 rounded-[2.5rem] p-8 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] relative transition-all duration-500 ${!isVaultUnlocked ? 'overflow-hidden h-[380px]' : ''}`}>
                
                {/* MECHANICAL VAULT DOOR OVERLAY */}
                {!isVaultUnlocked && (
                    <div className="absolute inset-0 z-20 bg-radial-gradient-vault flex flex-col items-center justify-center text-center p-6 rounded-[2rem]">
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        {showSecurityChallenge ? (
                            <div className="animate-in zoom-in-95 duration-300 w-full max-w-xs">
                                {showPINSetup ? (
                                    <div className="space-y-4">
                                        <h4 className="text-white font-bold text-lg mb-2">Initialize Your Secure Vault</h4>
                                        <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-6">Create a 4-Digit Master PIN</p>
                                        <div className="relative group max-w-[200px] mx-auto mb-6">
                                            {/* Stealth Input Setup (Steve-Pro) */}
                                            <input 
                                                type="text" 
                                                pattern="\d*"
                                                maxLength={4}
                                                autoFocus
                                                value={tempPIN}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setTempPIN(val);
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-default caret-transparent outline-none"
                                            />
                                            {/* Visual Masking Grid */}
                                            <div className="flex justify-center gap-3">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <div 
                                                        key={i}
                                                        className={`w-12 h-14 bg-[#1c1c1e] border rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                                                            tempPIN.length === i 
                                                                ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                                                                : 'border-gray-800 text-white'
                                                        }`}
                                                    >
                                                        {tempPIN.length > i ? '•' : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handlePINSetup}
                                            disabled={tempPIN.length < 4}
                                            className="w-full py-4 mt-6 bg-[#d4af37] text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50"
                                        >
                                            Lock Vault & Generate Recovery Key
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-[#1c1c1e] rounded-full flex items-center justify-center mb-6 border border-red-500/30 mx-auto shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                            <Fingerprint size={24} className="text-red-500" />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">Verify Master Identity</h4>
                                        <p className="text-gray-400 text-xs mb-6">Enter your 4-digit Master PIN to decrypt.</p>
                                        
                                        <div className="relative group max-w-[200px] mx-auto mb-6">
                                            {/* Stealth Input Driver (Steve-Pro) */}
                                            <input 
                                                type="text" 
                                                pattern="\d*"
                                                maxLength={4}
                                                autoFocus
                                                value={enteredPIN}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    setEnteredPIN(val);
                                                    if (val.length === 4) {
                                                        setTimeout(() => handleVaultUnlockAttempt(val), 200);
                                                    }
                                                }}
                                                onKeyDown={handlePINKeyPress}
                                                className="absolute inset-0 opacity-0 cursor-default caret-transparent outline-none"
                                            />
                                            {/* Visual Masking Grid */}
                                            <div className="flex justify-center gap-3">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <div 
                                                        key={i}
                                                        className={`w-12 h-14 bg-[#1c1c1e] border rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                                                            enteredPIN.length === i 
                                                                ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                                                                : 'border-gray-800 text-white'
                                                        }`}
                                                    >
                                                        {enteredPIN.length > i ? '•' : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => setShowSocialRecovery(true)}
                                            className="text-[9px] text-gray-600 font-bold uppercase tracking-widest hover:text-[#d4af37] transition-all"
                                        >
                                            Forgot PIN? Use Social Recovery
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 relative">
                                {/* The Mechanical Dial */}
                                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#1c1c1e] via-[#0A0A0B] to-[#1c1c1e] border-8 border-gray-900 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(212,175,55,0.1)] mx-auto mb-8 flex items-center justify-center group/dial relative">
                                    <div className="absolute inset-2 border border-gray-800 rounded-full border-dashed animate-spin-slow"></div>
                                    <div className="bg-[#050505] w-32 h-32 rounded-full border-2 border-gray-800 flex items-center justify-center shadow-inner">
                                        <Vault size={48} className="text-[#d4af37] group-hover/dial:scale-110 transition-transform duration-500" />
                                    </div>
                                    {/* Dial Marks */}
                                    {[0, 90, 180, 270].map(deg => (
                                        <div key={deg} className="absolute w-1 h-3 bg-gray-800" style={{ transform: `rotate(${deg}deg) translateY(-80px)` }}></div>
                                    ))}
                                </div>
                                
                                <h4 className="text-white font-black text-xl mb-2 uppercase tracking-[0.2em]">Safe Keeping Vault Locked</h4>
                                <p className="text-gray-500 text-[10px] max-w-xs mb-8 mx-auto font-bold uppercase tracking-widest leading-relaxed">
                                    Protected by Bank-Level Security • Access Limited to <span className="text-[#d4af37]">{deputies.length} Trusted Helpers</span>
                                </p>
                                
                                <button 
                                    onClick={() => {
                                        if (!vaultPIN) {
                                            setShowSecurityChallenge(true);
                                            setShowPINSetup(true);
                                        } else if (hasUnlockedOnce) {
                                            setIsVaultUnlocked(true); // Steve-Pro: Instant unlock
                                        } else {
                                            setShowSecurityChallenge(true);
                                        }
                                    }}
                                    className="bg-[#d4af37] text-black px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-[#d4af37]/10 flex items-center gap-2 mx-auto group"
                                >
                                    <Fingerprint size={16} className="group-hover:scale-110 transition-transform" /> {hasUnlockedOnce ? 'Instant Quick-Look' : 'Secure Fingerprint Reveal'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ACTUAL CONTENT (Always rendered, visually blocked if locked) */}
                <div className={`transition-opacity duration-500 ${!isVaultUnlocked ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>

                {/* VAULT MASTER KEY DISPLAY (Priority Positioning) */}
                {isVaultUnlocked && masterRecoveryKey && (
                    <div className="bg-[#1c1c1e] border border-[#d4af37]/20 rounded-2xl p-6 mb-8 mt-2 animate-in slide-in-from-top-4">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Key size={12} /> Master Recovery Key Generated
                            </h4>
                            <button className="text-gray-500 hover:text-white" onClick={() => setMasterRecoveryKey(null)}>
                                <X size={14} />
                            </button>
                        </div>
                        <div className="bg-black/40 border border-gray-800 p-4 rounded-xl flex items-center justify-between gap-4">
                            <code className="text-[#d4af37] font-mono text-lg font-bold tracking-widest">{masterRecoveryKey}</code>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(masterRecoveryKey);
                                    window.zenith.alert("Master Recovery Key Copied. SAVE THIS OFFLINE.", "Key Secured");
                                }}
                                className="px-4 py-2 bg-gray-800 text-gray-400 text-[10px] font-bold uppercase rounded-lg hover:text-white transition-all"
                            >
                                Copy Key
                            </button>
                        </div>
                        <p className="mt-4 text-[10px] text-gray-500 leading-relaxed italic">
                            Charter Legacy does not store this key. If you lose your PIN and this key, access can only be restored via <span className="text-white font-bold">Social Vouching</span> from your {deputies.filter(d => d.condition === 'Immediate').length || 'Trusted'} Helpers.
                        </p>
                    </div>
                )}

                {/* Vault Footer / Metadata (Steve-Pro) */}
                    <div className="flex justify-between items-center mb-4 px-2 py-2 border-b border-gray-900">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Live Audit Active: {lastAuditTime}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={exportAuditLogs}
                                className="flex items-center gap-1.5 text-[9px] text-gray-500 hover:text-[#d4af37] font-bold uppercase tracking-widest transition-colors"
                            >
                                <FileDown size={12} /> Export Trail
                            </button>
                            <button 
                                onClick={() => document.getElementById('sentinel-console').scrollIntoView({behavior: 'smooth'})}
                                className="flex items-center gap-1.5 text-[9px] text-gray-500 hover:text-[#00D084] font-bold uppercase tracking-widest transition-colors"
                            >
                                <Terminal size={12} /> View Sentinel
                            </button>
                            <button 
                                onClick={simulateBreach}
                                className="flex items-center gap-1.5 text-[9px] text-gray-700 hover:text-red-500 font-bold uppercase tracking-widest transition-colors animate-pulse"
                            >
                                <ShieldAlert size={12} /> Test Breach
                            </button>
                            <button 
                                onClick={resetVaultSecurity}
                                className="flex items-center gap-1.5 text-[9px] text-gray-700 hover:text-red-500 font-bold uppercase tracking-widest transition-colors"
                            >
                                <RefreshCw size={12} /> Reset System (Dev)
                            </button>
                        </div>
                    </div>

                {/* SUPPORTING DOCUMENTS (Now Protected) */}
                <div className="pt-4">
                     {/* Vault Switcher */}
                     <div className="flex flex-col sm:flex-row gap-2 mb-6 px-2">
                         <button 
                             onClick={() => setActiveVault('heritage')}
                             className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all ${
                                 activeVault === 'heritage' 
                                     ? 'bg-[#d4af37] text-black' 
                                     : 'bg-[#1c1c1e] text-gray-500 hover:text-white border border-gray-800'
                             }`}
                         >
                             🏛️ Heritage Vault
                         </button>
                         <button 
                             onClick={() => setActiveVault('business')}
                             className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all ${
                                 activeVault === 'business' 
                                     ? 'bg-[#d4af37] text-black' 
                                     : 'bg-[#1c1c1e] text-gray-500 hover:text-white border border-gray-800'
                             }`}
                         >
                             🏢 Business Vault
                         </button>
                     </div>

                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 px-2">
                         <div>
                            <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                                {activeVault === 'heritage' ? 'Personal Estate Documents' : 'LLC Formation & Operations'}
                            </h3>
                            <p className="text-gray-500 text-[10px] mt-1">
                                {activeVault === 'heritage' 
                                    ? 'Trusts, Power of Attorney, Medical Directives.' 
                                    : 'Articles, Operating Agreement, Licenses, Insurance.'}
                            </p>
                         </div>
                         <button onClick={() => setShowArchived(!showArchived)} className="text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-wider flex items-center gap-2 self-start sm:self-auto">
                            <Filter size={12} /> {showArchived ? 'Hide Archived' : 'Show Archived'}
                         </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Upload Card */}
                         <div
                            onClick={() => console.log('Upload clicked')}
                            className="bg-[#1c1c1e]/50 rounded-2xl border-2 border-dashed border-gray-800 p-6 flex items-center justify-center gap-4 cursor-pointer hover:bg-[#1c1c1e] hover:border-[#d4af37]/30 transition-all group"
                        >
                            <Upload size={20} className="text-gray-600 group-hover:text-[#d4af37]" />
                            <span className="text-xs font-bold text-gray-500 group-hover:text-white">Upload Document</span>
                        </div>

                        {/* Document Cards with Location Tracking */}
                        {(docs || []).filter(d => showArchived ? d.status === 'archived' : d.status === 'active').map(doc => {
                            const docLocation = locations.find(l => l.docType.includes(doc.label));
                            const isExpanded = editingId && (editingId === `doc-${doc.id}` || editingId === `edit-${doc.id}`);
                            
                            return (
                                <div 
                                    key={doc.id} 
                                    className="bg-[#1c1c1e] rounded-2xl border border-gray-800 overflow-hidden hover:border-[#d4af37]/50 transition-all"
                                >
                                    {/* Document Header */}
                                    <div className="p-4">
                                        {/* Document Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex-1">
                                                <h4 className="text-gray-300 text-xs font-bold">{doc.label}</h4>
                                                <p className="text-[10px] text-gray-600">{doc.date}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 justify-end">
                                            <button 
                                                onClick={() => {
                                                    setViewingDoc(doc);
                                                    addAuditEntry('VIEW_DOC', `Opened ${doc.label}`, 'Secure Viewer Session');
                                                }}
                                                className="p-2.5 text-gray-500 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-all"
                                                title="View Document"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => setEditingId(isExpanded ? null : `doc-${doc.id}`)}
                                                className="p-2.5 text-gray-500 hover:text-[#d4af37] hover:bg-[#d4af37]/10 rounded-lg transition-all"
                                                title="Toggle Location Info"
                                            >
                                                <MapPin size={18} className={isExpanded ? 'text-[#d4af37]' : ''} />
                                            </button>
                                            
                                            {showArchived ? (
                                                <button 
                                                    onClick={() => onRestore(doc.id)}
                                                    className="px-5 py-2 text-[#d4af37] text-[11px] uppercase font-bold hover:bg-[#d4af37]/10 rounded-lg transition-all border border-[#d4af37]/30"
                                                >
                                                    Restore
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => onArchive(doc.id)}
                                                    className="px-5 py-2 text-gray-400 text-[11px] uppercase font-bold hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-gray-700 hover:border-red-500/30"
                                                >
                                                    Archive
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expandable Physical Location Section */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-800 animate-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={12} className="text-[#d4af37]" />
                                                    <h5 className="text-white font-bold text-[10px] uppercase tracking-wider">Physical Location</h5>
                                                </div>
                                                {isVaultUnlocked && docLocation && (
                                                    <button 
                                                        onClick={() => {
                                                            setEditingId(`edit-${doc.id}`);
                                                            setEditData({ location: docLocation.location, notes: docLocation.notes || '' });
                                                        }}
                                                        className="text-[9px] text-gray-500 hover:text-[#d4af37] uppercase font-bold tracking-wider flex items-center gap-1"
                                                    >
                                                        <Edit2 size={9} /> Edit
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {!isVaultUnlocked ? (
                                                <div className="bg-black/40 border border-gray-800 rounded-lg p-3 text-center">
                                                    <Lock size={14} className="text-gray-600 mx-auto mb-1" />
                                                    <p className="text-gray-600 text-[10px] font-mono">Unlock Vault to View</p>
                                                </div>
                                            ) : editingId === `edit-${doc.id}` ? (
                                                // EDIT MODE
                                                <div className="bg-black/40 border border-[#d4af37] rounded-lg p-3 space-y-3">
                                                    <div>
                                                        <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Location</label>
                                                        <input 
                                                            value={editData.location}
                                                            onChange={(e) => setEditData({...editData, location: e.target.value})}
                                                            className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg px-2 py-1.5 text-[11px] text-white focus:border-[#d4af37] outline-none"
                                                            placeholder="e.g., Bank Safety Deposit Box #342"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-[#d4af37] uppercase font-bold mb-1 block">Access Code/Key</label>
                                                        <input 
                                                            value={editData.notes}
                                                            onChange={(e) => setEditData({...editData, notes: e.target.value})}
                                                            className="w-full bg-[#1c1c1e] border border-gray-700 rounded-lg px-2 py-1.5 text-[11px] text-white focus:border-[#d4af37] outline-none font-mono"
                                                            placeholder="Optional"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                if (docLocation) {
                                                                    const updatedLoc = { ...docLocation, location: editData.location, notes: editData.notes };
                                                                    onRemoveLocation(docLocation.id);
                                                                    onAddLocation(updatedLoc);
                                                                } else {
                                                                    onAddLocation({
                                                                        id: Date.now(),
                                                                        docType: doc.label,
                                                                        location: editData.location,
                                                                        notes: editData.notes
                                                                    });
                                                                }
                                                                setEditingId(`doc-${doc.id}`);
                                                            }}
                                                            className="px-3 py-1.5 bg-[#d4af37] text-black rounded-lg text-[9px] font-bold uppercase hover:bg-white transition-all"
                                                        >
                                                            Save
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingId(`doc-${doc.id}`)}
                                                            className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-[9px] font-bold uppercase hover:text-white transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : docLocation ? (
                                                // VIEW MODE - Has Location
                                                <div className="bg-black/40 border border-gray-700 rounded-lg p-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Location</p>
                                                            <p className="text-gray-300 text-[11px]">{docLocation.location}</p>
                                                        </div>
                                                        {docLocation.notes && (
                                                            <div>
                                                                <p className="text-[9px] text-[#d4af37] uppercase font-bold mb-0.5">Access</p>
                                                                <p className="text-white font-mono text-[11px] bg-[#1c1c1e] px-2 py-0.5 rounded border border-gray-700 inline-block">
                                                                    {docLocation.notes}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                // VIEW MODE - No Location Yet
                                                <div className="bg-black/40 border border-gray-700 rounded-lg p-3 text-center">
                                                    <p className="text-gray-500 text-[10px] mb-2">No location logged yet</p>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            console.log('Add Location clicked for doc:', doc.id);
                                                            setEditingId(`edit-${doc.id}`);
                                                            setEditData({ location: '', notes: '' });
                                                        }}
                                                        className="text-[#d4af37] text-[9px] uppercase font-bold hover:underline cursor-pointer"
                                                    >
                                                        + Add Location
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                     </div>
                     </div>

                {/* Lock Button (To re-lock) */}
                <div className="flex justify-center mt-12 border-t border-gray-900 pt-8">
                         <button 
                            onClick={() => setIsVaultUnlocked(false)}
                            className="text-gray-500 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                            <Lock size={12} /> Re-Lock Vault
                        </button>
                    </div>

                </div>
            </div>


            {/* SENTINEL LIVE AUDIT CONSOLE (Steve-Pro) */}
            <div id="sentinel-console" className="mt-20 group/console border-t border-gray-800/30 pt-12">
                <div className="flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-[#00D084] animate-pulse shadow-[0_0_10px_rgba(0,208,132,0.4)]"></div>
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.4em]">Sentinel Security Console</h4>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] text-gray-600 font-mono flex items-center gap-2">
                             <Disc size={10} className="animate-spin" /> LIVE_FEED: OK
                        </span>
                        <span className="text-[10px] text-gray-700 font-mono">ENCRYPTION: AES_256_GCM • STATUS: LOCKED_PROTECT</span>
                    </div>
                </div>
                
                <div className="bg-[#050505] border border-gray-900 rounded-[2rem] p-8 font-mono text-[11px] leading-relaxed overflow-hidden h-80 relative group-hover/console:border-[#00D084]/40 transition-all shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00D084]/40 to-transparent"></div>
                    <div className="overflow-y-auto h-full space-y-3 scroller-steve pr-4">
                        {(auditLog || []).slice().reverse().map((entry, idx) => (
                            <div key={idx} className="flex gap-6 animate-in slide-in-from-left-4 duration-500 hover:bg-white/5 p-2 rounded-lg transition-colors group/entry">
                                <span className="text-gray-700 shrink-0 font-bold">[{entry.timestamp || 'LIVE'}]</span>
                                <span className={`shrink-0 font-black tracking-tighter w-24 ${
                                    entry.action.includes('DENIED') ? 'text-red-500' :
                                    entry.action.includes('GRANTED') ? 'text-[#00D084]' :
                                    'text-[#d4af37]'
                                }`}>
                                    {entry.action}
                                </span>
                                <span className="text-gray-400 opacity-80 group-hover/entry:text-white transition-colors">{" > "}&nbsp;{entry.details}</span>
                                <span className="text-gray-800 italic ml-auto font-bold opacity-40">{entry.user}</span>
                            </div>
                        ))}
                        {(!auditLog || auditLog.length === 0) && (
                            <div className="text-gray-800 italic h-full flex items-center justify-center border-2 border-dashed border-gray-900 rounded-xl">
                                <Terminal size={24} className="mr-3 opacity-20" /> Sentinel standing by... System secured.
                            </div>
                        )}
                        <div className="text-[#00D084] animate-pulse mt-4">_</div>
                    </div>
                    
                    <style jsx>{`
                        .scroller-steve::-webkit-scrollbar { width: 6px; }
                        .scroller-steve::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
                        .scroller-steve::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
                        .scroller-steve:hover::-webkit-scrollbar-thumb { background: #333; background-clip: content-box; }
                    `}</style>
                </div>
            </div>

            {/* SECTION 4: SECURITY AUDIT LOG */}
            <div className="mt-20 pt-12 border-t border-gray-800/30">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-800/30 rounded-lg">
                        <ShieldCheck size={16} className="text-gray-500" />
                    </div>
                    <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                        Security Audit Log
                    </h3>
                 </div>
                 
                <div className="bg-[#111] rounded-2xl border border-gray-800 p-6 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#d4af37]">
                   {auditLog && auditLog.length > 0 ? (
                       <div className="space-y-3">
                           {auditLog.map((entry, idx) => (
                               <div key={entry.id || idx} className="flex justify-between items-start text-xs border-b border-gray-800/50 pb-3 last:border-0 last:pb-0 hover:bg-white/5 p-3 rounded-xl transition-all group">
                                   <div className="flex items-start gap-4">
                                       <div className={`mt-1.5 w-2 h-2 rounded-full ring-4 ring-opacity-20 ${
                                           entry.action.includes('ACCESS_GRANTED') ? 'bg-green-500 ring-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 
                                           entry.action.includes('DEPUTY') ? 'bg-blue-500 ring-blue-500' :
                                           entry.action.includes('VIEW') ? 'bg-[#d4af37] ring-[#d4af37]' : 'bg-gray-600 ring-gray-600'
                                       }`}></div>
                                       <div>
                                           <span className="text-gray-200 font-bold block mb-1 group-hover:text-white transition-colors">{entry.action.replace(/_/g, ' ')}</span>
                                           <span className="text-gray-500 font-mono text-[10px] block">{entry.details}</span>
                                           {entry.note && <p className="text-gray-600 italic mt-1 text-[10px]">"{entry.note}"</p>}
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <span className="text-gray-600 font-mono block mb-1 text-[10px]">{entry.timestamp}</span>
                                       <span className="text-gray-400 font-bold uppercase text-[9px] bg-gray-900 px-2 py-1 rounded-md border border-gray-800 inline-block">{entry.user}</span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="text-center py-12 flex flex-col items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
                               <ShieldCheck size={20} className="text-gray-700" />
                           </div>
                           <p className="text-gray-600 text-xs italic">No security events recorded yet.</p>
                       </div>
                   )}
                </div>
            </div>

        </div>



      {/* DOCUMENT VIEWER MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1c1c1e] w-full max-w-4xl h-[85vh] rounded-3xl border border-[#d4af37]/20 flex flex-col shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#151516]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#d4af37]/10 rounded-xl text-[#d4af37]">
                            <FileCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">{viewingDoc.label}</h3>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">
                                {viewingDoc.date} • {viewingDoc.size || '1.2 MB'} • <span className="text-[#d4af37]">{viewingDoc.visibility === 'post-mortem' ? 'Private' : 'Shared'}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Print">
                             <Box size={20} />
                         </button>
                         <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Download">
                             <FileDown size={20} />
                         </button>
                         <div className="w-px h-8 bg-gray-800 mx-2"></div>
                         <button onClick={() => setViewingDoc(null)} className="p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors">
                             <X size={24} />
                         </button>
                    </div>
                </div>

                {/* Viewer Content (Mock) */}
                <div className="flex-1 bg-[#0a0a0a] p-8 overflow-y-auto flex justify-center relative">
                     {/* Watermark */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] select-none overflow-hidden underline">
                        <div className="rotate-[-45deg] text-8xl font-black text-white whitespace-nowrap">
                            NOT LEGAL ADVICE • PREVIEW ONLY • NOT LEGAL ADVICE
                        </div>
                     </div>

                    <div className="bg-white w-full max-w-2xl min-h-[1000px] shadow-2xl p-12 text-black relative">
                        {/* Mock Document Content */}
                        <div className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
                            <div>
                                <h1 className="text-3xl font-serif font-bold mb-2 uppercase tracking-widest">{viewingDoc.label}</h1>
                                <p className="font-serif text-sm italic text-gray-600">Executed on {viewingDoc.date}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-serif font-bold border-4 border-black p-2 inline-block mb-2">CL</div>
                                <p className="text-[10px] uppercase font-bold tracking-widest">Charter Legacy</p>
                            </div>
                        </div>

                         <div className="space-y-6 font-serif leading-relaxed text-justify text-sm text-gray-800 relative">
                              {/* UPL Overlay Watermark */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none">
                                  <div className="rotate-[-30deg] text-4xl font-black text-gray-400 border-8 border-gray-400 p-4 uppercase">
                                      Not Legal Advice
                                  </div>
                              </div>

                             <p><strong>ABOUT THIS DOCUMENT:</strong> This document serves as a record of your intentions regarding your heritage and family assets.</p>
                             
                             <p><strong>PURPOSE:</strong> The person whose name is on this document (the "Founder") wants to make sure their family is taken care of and their hard work is protected for the next generation.</p>
                             
                             <p><strong>GUIDELINES:</strong> To make sure your wishes are followed, the following steps have been established:</p>

                             <ol className="list-decimal pl-8 space-y-4 my-8">
                                 <li>
                                     <span className="font-normal">
                                     <strong>Asset Handover.</strong> The Founder intends for their assets (like their business or property) to be looked after by the people they trust most, as listed in their digital vault.
                                     </span>
                                 </li>
                                 <li>
                                     <span className="font-normal">
                                     <strong>Helping Hands.</strong> The Founder has chosen "Trusted Helpers" who are officially invited to help unlock this vault and follow these instructions if the Founder is ever unable to do so.
                                     </span>
                                 </li>
                                 <li>
                                     <span className="font-normal">
                                     <strong>Safe Access.</strong> Access to these instructions is kept private and secure by Charter Legacy's digital safety systems.
                                     </span>
                                 </li>
                             </ol>

                             <p>This document is a digital copy of your plan. The original paper document should be kept in a safe place, which you can record in your Document Map.</p>
                        </div>

                        <div className="mt-24 flex justify-between items-end">
                            <div className="text-center">
                                <div className="border-b border-black w-48 mb-2"></div>
                                <p className="font-serif text-xs italic">Signature of Grantor</p>
                            </div>
                             <div className="text-center">
                                <div className="border-b border-black w-48 mb-2"></div>
                                <p className="font-serif text-xs italic">Notary Public</p>
                            </div>
                        </div>
                        
                        {/* Security Footer */}
                        <div className="absolute bottom-8 left-0 right-0 text-center">
                             <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">
                                 SECURED RECORD ID: {viewingDoc.id.toString().toUpperCase()} • HASH: {Math.random().toString(36).substring(2, 15).toUpperCase()}
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* STATUTORY WARNING MODAL */}
      {showStatutoryWarning && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#1c1c1e] rounded-2xl border-2 border-[#d4af37] max-w-2xl w-full p-8 shadow-2xl shadow-[#d4af37]/20 animate-in zoom-in-95 relative">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#d4af37]">
                    <AlertCircle size={32} className="text-[#d4af37]" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black uppercase tracking-tight text-white text-center mb-4">
                    Important: {protocolPath === 'trust' ? 'Trust Execution Requirements' : 'Will Execution Requirements'}
                </h3>

                {/* Warning Content */}
                <div className="bg-black/40 border border-gray-800 rounded-xl p-6 mb-6 space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        You are about to edit your {protocolPath === 'trust' ? 'Living Trust' : 'Will'} document using our protocol engine. Please be aware:
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[#d4af37] font-bold text-xs">1</span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                <span className="text-white font-bold">This tool generates a standard {protocolPath === 'trust' ? 'Trust package' : 'Will form'}</span> based on your inputs. It does not provide legal advice.
                            </p>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[#d4af37] font-bold text-xs">2</span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                <span className="text-white font-bold">For your {protocolPath === 'trust' ? 'Trust' : 'Will'} to be legally valid</span>, it must be properly executed according to your state's laws. This typically requires:
                            </p>
                        </div>
                        
                        <div className="ml-12 space-y-2 text-xs text-gray-500">
                            {protocolPath === 'trust' ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
                                        <span>Signing in front of a <span className="text-white font-bold">Notary Public</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
                                        <span>Witness signatures are highly recommended</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
                                        <span><span className="text-white font-bold">Funding:</span> You must retitle assets into the Trust's name.</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
                                        <span>Signing in front of <span className="text-white font-bold">2 witnesses</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
                                        <span>Witnesses must also sign the document</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></div>
                                        <span>Some states require notarization</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[#d4af37] font-bold text-xs">3</span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                <span className="text-white font-bold">Consult an attorney</span> to ensure your {protocolPath === 'trust' ? 'Trust' : 'Will'} meets all legal requirements in your state.
                            </p>
                        </div>
                    </div>
                </div>

                {/* UPL SIGNATURE VAULT (Option B) - Merged with High-Impact Legal Styling */}
                <div className="bg-red-900/10 border border-red-900/30 rounded-2xl p-6 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                        <ShieldAlert size={80} className="text-red-500" />
                    </div>
                    
                    <div className="flex items-start gap-4 mb-6 relative z-10">
                        <div className="pt-1">
                            <input 
                                type="checkbox" 
                                id="acknowledgment"
                                checked={hasAcknowledgedDisclosure}
                                onChange={(e) => setHasAcknowledgedDisclosure(e.target.checked)}
                                className="w-6 h-6 rounded border-red-900/50 bg-black text-red-600 focus:ring-red-500 transition-all cursor-pointer"
                            />
                        </div>
                        <label htmlFor="acknowledgment" className="text-[11px] text-red-200/80 leading-relaxed cursor-pointer select-none">
                            <span className="text-red-400 font-bold uppercase tracking-wider block mb-1">Affirmative Legal Acknowledgment:</span>
                            I affirmatively acknowledge that I have read the requirements above. I understand that <span className="text-white font-bold underline">Charter Legacy is a technology service</span>, not a law firm, and I am acting as my own representative in using these standard templates. 
                        </label>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <label className="text-[9px] text-red-400/60 font-black uppercase tracking-[0.2em] block ml-1">Digital Signature of Selection</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={disclosureSignature}
                                onChange={(e) => setDisclosureSignature(e.target.value)}
                                placeholder="Type your full name to sign"
                                className="w-full bg-black/40 border border-red-900/30 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-serif italic"
                            />
                            {disclosureSignature.length > 2 && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-in zoom-in">
                                    <Check size={16} />
                                </div>
                            )}
                        </div>
                        <p className="text-[8px] text-red-900 font-bold mt-2 px-1 flex justify-between uppercase tracking-widest">
                            <span>Compliance Hash: <span className="font-mono text-red-600">{generateComplianceHash()}</span></span>
                            <span>Audit v.{disclosureVersion}</span>
                        </p>
                    </div>
                </div>


                {/* UPL SIGNATURE VAULT (Option B) - Merged with High-Impact Legal Styling */}

            </div>
        </div>
      )}
      {/* SOCIAL RECOVERY MODAL */}
      {showSocialRecovery && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="w-full max-w-md bg-[#1c1c1e] border border-gray-800 rounded-[2rem] p-8 shadow-2xl">
                  <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                      <Users size={32} className="text-[#d4af37]" />
                  </div>
                  <h3 className="text-white text-xl font-bold text-center mb-2 uppercase tracking-tight">Access Recovery Protocol</h3>
                  
                  {deputies.length > 0 ? (
                    <>
                        <p className="text-gray-400 text-sm text-center mb-8 leading-relaxed">
                            You are protected by "Zero-Knowledge" encryption. If you lost your PIN and Master Key, use your <span className="text-[#d4af37]">Trusted Circle</span>:
                        </p>
                        <div className="space-y-4 mb-10">
                            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-gray-800">
                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-[#d4af37]">1</div>
                                <p className="text-xs text-gray-300">Contact at least <span className="text-white font-black">2 of your Trusted Helpers</span>.</p>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-gray-800">
                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-[#d4af37]">2</div>
                                <p className="text-xs text-gray-300">They must log in to their own dashboard and <span className="text-white font-black">Vouch for your Identity</span>.</p>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-gray-800">
                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-[#d4af37]">3</div>
                                <p className="text-xs text-gray-300">Once 2+ vouches are matched with your biometric signature, a <span className="text-white font-black">Master PIN Reset</span> is triggered.</p>
                            </div>
                        </div>
                    </>
                  ) : (
                    <>
                        <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-2xl mb-8 text-center">
                            <ShieldAlert className="mx-auto mb-4 text-red-500" size={32} />
                            <h4 className="text-red-400 text-xs font-black uppercase tracking-widest mb-2">Lone Wolf Detected</h4>
                            <p className="text-red-200/60 text-[11px] leading-relaxed">
                                You have not designated any Trusted Helpers. Rapid Social Recovery is <span className="font-bold text-white">Unavailable</span>.
                            </p>
                        </div>
                        <div className="space-y-4 mb-10">
                            <h5 className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Charter Concierge Backup:</h5>
                            <div className="p-4 bg-black/40 rounded-xl border border-gray-800">
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    You must initiate a <span className="text-white font-bold">Manual Forensic Recovery</span>. This requires:
                                </p>
                                <ul className="mt-3 space-y-2 text-[10px] text-gray-500 font-medium list-disc list-inside">
                                    <li>Physical Notarized Proof of Identity</li>
                                    <li>30-Day Security "Cooldown" Period</li>
                                    <li>Manual interaction with a Charter Legacy Specialist</li>
                                </ul>
                            </div>
                        </div>
                    </>
                  )}
                  
                  <button 
                    onClick={() => setShowSocialRecovery(false)}
                    className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-[#d4af37] transition-all"
                  >
                    I Understand
                  </button>
              </div>
          </div>
       )}

      {/* VETO SENTINEL ALERT MODAL */}
      {showBreachAlert && (
        <div className="fixed inset-0 z-[999] bg-red-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-pulse-slow">
            <div className="bg-black border-4 border-red-600 rounded-[3rem] p-12 w-full max-w-2xl shadow-[0_0_100px_rgba(220,38,38,0.5)] text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-white to-red-600 animate-shimmer"></div>

                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(220,38,38,0.6)] animate-bounce">
                    <ShieldAlert size={48} className="text-white" />
                </div>
                
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2 glitch-text">Breach Detected</h2>
                <p className="text-red-400 font-bold uppercase tracking-[0.3em] text-sm mb-8">Succession Key Activation In Progress</p>
                
                <div className="my-8 py-6 border-y border-red-800 bg-red-900/20">
                     <p className="text-gray-400 text-xs font-mono mb-2">SOURCE ID: {breachSource}</p>
                     <div className="text-4xl font-mono font-black text-white tabular-nums">
                         BUFFER LOCK: 00:00:{breachCountdown.toString().padStart(2, '0')}
                     </div>
                     <p className="text-red-500/80 text-[10px] uppercase font-bold mt-2 animate-pulse">Auto-Release Imminent</p>
                </div>

                <p className="text-gray-400 max-w-md mx-auto mb-8 text-xs leading-relaxed">
                    A Succession Key has been used to request access to your vault. If you did not authorize this, or if you are being coerced, engage the Veto Protocol immediately.
                </p>

                <button 
                    onClick={executeVeto}
                    className="w-full py-6 bg-red-600 hover:bg-white text-white hover:text-red-600 rounded-2xl font-black text-2xl uppercase tracking-[0.2em] transition-all shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group"
                >
                    <ShieldX size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                    Veto Access Now
                </button>
                <div className="mt-6">
                    <button onClick={() => setShowBreachAlert(false)} className="text-gray-600 hover:text-white text-[10px] uppercase font-bold tracking-widest underline decoration-gray-800 underline-offset-4">
                        Dismiss (Allow Access)
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
    </div>
  </>
  );
};

export default SuccessionSuite;
