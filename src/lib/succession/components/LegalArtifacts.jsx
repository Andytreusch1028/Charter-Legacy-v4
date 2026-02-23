import React from 'react';

// Will Document Preview Component
export const LegalDocPreview = ({ data }) => (
    <div className="bg-[#FAF9F6] text-black p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] max-w-2xl mx-auto min-h-[842px] my-8 border border-gray-200 font-serif leading-relaxed text-justify relative overflow-hidden">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200"></div>
        <h1 className="text-3xl font-black text-center mb-12 uppercase tracking-[0.25em] border-b-2 border-black pb-8 relative z-10">Last Will & Testament</h1>
        
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
export const TrustDocPreview = ({ data }) => (
    <div className="bg-[#FAF9F6] text-black p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] max-w-2xl mx-auto min-h-[1000px] my-8 border border-gray-200 font-serif leading-relaxed text-justify relative overflow-hidden">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
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

            <section>
                <h3 className="font-bold text-lg uppercase tracking-widest border-b-2 border-black inline-block mb-4 text-[#d4af37]">Article IV: Safety-Net Coordination</h3>
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
