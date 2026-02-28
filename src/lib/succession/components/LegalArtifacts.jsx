import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

// TOD Operating Agreement Addendum Preview
export const TodAddendumPreview = ({ data }) => (
    <div className="bg-[#fcfcfb] text-[#111] p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-2xl mx-auto min-h-[842px] my-12 border border-gray-200 font-serif leading-relaxed text-justify relative overflow-hidden ring-1 ring-black/5">
        {/* Premium Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
            <div className="w-96 h-96 border-[40px] border-black rounded-full"></div>
        </div>
        
        {/* Luxurious Header Strip */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#d4af37] via-[#f3d97e] to-[#d4af37]"></div>
        
        <div className="mb-16 text-center pt-8">
            <h1 className="text-3xl font-black uppercase tracking-[0.3em] mb-4 text-black">Operating Agreement</h1>
            <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-6"></div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">Transfer on Death (TOD) Addendum</h2>
        </div>
        
        <div className="space-y-8 relative z-10 text-lg text-gray-800">
            <p className="first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#d4af37]">
                This Addendum to the Operating Agreement of <span className="font-bold border-b border-gray-400 px-2">{data.llcName || "____________________ LLC"}</span>, 
                a Florida Limited Liability Company (the "Company"), is adopted by the Member(s) on the date set forth below.
            </p>

            <div>
                <h3 className="flex items-center gap-3 font-bold text-sm uppercase tracking-widest text-black mb-4">
                    <div className="w-2 h-2 bg-[#d4af37]"></div> Section I: Authorization
                </h3>
                <p className="pl-5 text-gray-700">
                    Pursuant to the Florida Revised Limited Liability Company Act (Chapter 605), the Company hereby expressly authorizes its Members to designate a transferable interest in the Company to transfer upon the Member's death to one or more designated beneficiaries using a Transfer on Death (TOD) Designation form.
                </p>
            </div>

            <div>
                 <h3 className="flex items-center gap-3 font-bold text-sm uppercase tracking-widest text-black mb-4">
                    <div className="w-2 h-2 bg-[#d4af37]"></div> Section II: Effect of Designation
                </h3>
                <p className="pl-5 text-gray-700">
                    A validly executed TOD Designation shall not affect the Member's ownership, control, or right to transfer their interest in the Company during their lifetime. The designation is completely revocable and shall become effective only upon the death of the Member. If the Member transfers their entire interest prior to death, the TOD Designation shall be immediately rendered null and void.
                </p>
            </div>

            <div>
                 <h3 className="flex items-center gap-3 font-bold text-sm uppercase tracking-widest text-black mb-4">
                    <div className="w-2 h-2 bg-[#d4af37]"></div> Section III: Rights of Beneficiary
                </h3>
                <p className="pl-5 text-gray-700">
                    Upon the death of the Member, the designated beneficiary shall succeed to the Member's transferable interest (economic rights). Admission of the beneficiary as a substituted Member with full voting and management rights shall be governed strictly by the remaining terms of the Company's Operating Agreement and Florida law.
                </p>
            </div>
        </div>

        <div className="mt-24 pt-12 border-t border-gray-200 relative z-10">
            <p className="mb-16 font-serif text-lg italic text-gray-600 text-center">
                Adopted and approved this ______ day of ________________, 20____.
            </p>
            <div className="flex justify-end pr-8">
                <div className="text-center w-64">
                    <div className="border-b border-black mb-1 h-12 flex items-end justify-center pb-1">
                        {(data.esignature) ? (
                            <span className="text-3xl text-blue-900" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive" }}>{data.esignature}</span>
                        ) : null}
                    </div>
                    <p className="text-sm font-black uppercase tracking-[0.2em] font-serif">{data.fullName || "MEMBER SIGNATURE"}</p>
                    <p className="text-[9px] text-[#d4af37] uppercase tracking-widest mt-2 font-bold">Authorized Member</p>
                </div>
            </div>
        </div>
        
        <div className="absolute bottom-12 left-0 w-full flex justify-center opacity-50">
            <p className="text-[8px] text-gray-400 uppercase tracking-[0.4em] font-mono">
                Charter Legacy · Form FL-OA-TOD-AUTH
            </p>
        </div>
    </div>
);

// TOD Designation Form Preview
export const TodDesignationPreview = ({ data }) => (
    <div className="bg-[#fcfcfb] text-[#111] p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-2xl mx-auto min-h-[1000px] my-12 border border-gray-200 font-serif leading-relaxed text-justify relative overflow-hidden ring-1 ring-black/5">
        {/* Premium Top Strip */}
        <div className="absolute top-0 left-0 w-full h-8 bg-black flex items-center justify-center">
            <p className="text-[#d4af37] text-[8px] font-black uppercase tracking-[0.4em]">Official Sovereign Record</p>
        </div>
        
        {/* Modern Minimalist Seal */}
        <div className="absolute top-20 right-16">
            <div className="w-24 h-24 border border-[#d4af37] rounded-full flex flex-col items-center justify-center bg-[#d4af37]/5 backdrop-blur-sm shadow-inner group">
                <ShieldCheck size={28} className="text-[#d4af37] mb-1 opacity-80" />
                <span className="text-[6px] font-black text-center uppercase tracking-[0.3em] text-gray-800">Heritage<br/>Protocol Seal</span>
            </div>
        </div>

        <div className="mb-16 pt-16">
            <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-black">Transfer on Death</h1>
            <h2 className="text-xl font-medium tracking-[0.3em] text-gray-500 uppercase">Designation of Successor</h2>
            <div className="w-16 h-1 bg-[#d4af37] mt-8"></div>
        </div>
        
        <div className="space-y-12 relative z-10 text-lg text-gray-800">
            <section>
                <p className="first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-black">
                    I, <span className="font-black border-b border-gray-400 px-2">{data.fullName || "____________________"}</span>, 
                    am a Member of <span className="font-black border-b border-gray-400 px-2">{data.llcName || "____________________ LLC"}</span>, 
                    a Florida Limited Liability Company (the "Company").
                </p>
            </section>

            <section>
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-[#d4af37]">Designation of Beneficiary</h3>
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                </div>
                <p className="mb-8">
                    Pursuant to the Company's Operating Agreement and Florida Chapter 605, I hereby designate the following individual or entity as the Transfer on Death (TOD) Beneficiary of my entire transferable interest in the Company:
                </p>
                    <div className="bg-white border border-[#d4af37]/30 p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]"></div>
                        <div className="flex flex-col gap-6 pl-4">
                            <span className="font-black uppercase text-[10px] tracking-[0.3em] text-[#d4af37] block border-b border-gray-100 pb-2 w-full">Primary Successor Designation</span>
                            
                            <div className="flex flex-col divide-y divide-gray-100">
                                {(() => {
                                    const namesStr = data.beneficiaryName || "________________";
                                    const relsStr = data.beneficiaryRelation || "________________";
                                    
                                    // If there aren't any commas, just display normally as a single block
                                    if (!namesStr.includes(',')) {
                                        return (
                                            <div className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                                                <span className="font-black text-xl text-black leading-tight break-words">{namesStr}</span>
                                                <span className="font-serif italic text-lg text-gray-500 block md:text-right shrink-0">{relsStr}</span>
                                            </div>
                                        );
                                    }

                                    // Attempt to map comma-separated lists
                                    const names = namesStr.split(',').map(n => n.trim()).filter(Boolean);
                                    const rels = relsStr.split(',').map(r => r.trim()).filter(Boolean);

                                    return names.map((name, idx) => {
                                        const rel = rels[idx] || rels[0] || 'Unknown';
                                        return (
                                            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                                                <span className="font-black text-xl text-black leading-tight break-words">{name}</span>
                                                <span className="font-serif italic text-lg text-gray-500 block md:text-right shrink-0">{rel}</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
            </section>

            <section>
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                    <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-[#d4af37]">Terms and Revocability</h3>
                    <div className="h-[1px] flex-1 bg-gray-200"></div>
                </div>
                <ul className="space-y-4 text-[15px] text-gray-600 leading-relaxed font-sans font-medium">
                    <li className="flex items-start gap-3">
                        <ArrowRight size={16} className="text-[#d4af37] mt-1 flex-shrink-0" />
                        <span>This designation shall only become effective upon my death.</span>
                    </li>
                    <li className="flex items-start gap-3">
                         <ArrowRight size={16} className="text-[#d4af37] mt-1 flex-shrink-0" />
                        <span>During my lifetime, I retain <strong>100% control, ownership, and voting rights</strong> of my interest.</span>
                    </li>
                    <li className="flex items-start gap-3">
                         <ArrowRight size={16} className="text-[#d4af37] mt-1 flex-shrink-0" />
                        <span>This designation is fully revocable by me at any time prior to my death without the consent of the Beneficiary.</span>
                    </li>
                    <li className="flex items-start gap-3">
                         <ArrowRight size={16} className="text-[#d4af37] mt-1 flex-shrink-0" />
                        <span className="text-black font-bold">If I sell, transfer, or assign my interest during my lifetime, this designation shall automatically terminate with respect to the transferred interest.</span>
                    </li>
                    <li className="flex items-start gap-3">
                         <ArrowRight size={16} className="text-[#d4af37] mt-1 flex-shrink-0" />
                        <span>If the designated Beneficiary does not survive me, this designation shall lapse.</span>
                    </li>
                </ul>
            </section>

            <div className="mt-20 pt-16 border-t border-gray-200 relative">
                <p className="mb-10 text-center font-serif text-lg italic text-gray-600">
                    IN WITNESS WHEREOF, I have executed this TOD Designation on this ______ day of ________________, 20____.
                </p>
                
                <div className="flex justify-between items-end mt-16 gap-6 px-1">
                    {/* Kinetic Anchor Stamp */}
                    <div className="border border-[#d4af37]/50 p-4 bg-white shadow-sm w-[48%] flex-shrink-0">
                        <div className="flex items-center gap-1.5 mb-3 border-b border-[#d4af37]/20 pb-2">
                             <ShieldCheck size={14} className="text-[#d4af37] flex-shrink-0" />
                             <span className="font-bold text-[8px] uppercase tracking-[0.15em] text-black">Verified Kinetic Anchor</span>
                        </div>
                        <p className="text-[11px] font-mono text-gray-500 break-all leading-relaxed uppercase font-black tracking-[0.2em]">
                            {data.protocolSeed || "E3B0-C442-98FC"}
                        </p>
                        <p className="text-[8px] uppercase tracking-[0.3em] text-[#d4af37] mt-3 font-bold">Charter Protocol Seed</p>
                    </div>

                    {/* Signature Line */}
                    <div className="text-center w-[48%] flex-shrink-0">
                        <div className="border-b border-black mb-1 h-12 flex items-end justify-center pb-1 relative">
                            {/* The electronic signature is absolutely positioned so it can overflow slightly for visual flair */}
                            {(data.esignature) ? (
                                <span className="absolute bottom-1 whitespace-nowrap text-4xl text-[#0b1f3c]" style={{ fontFamily: "'Brush Script MT', 'Great Vibes', cursive", transform: 'rotate(-2deg)' }}>{data.esignature}</span>
                            ) : null}
                        </div>
                        <p className="text-base font-black uppercase tracking-[0.2em] font-serif">{data.fullName || "MEMBER SIGNATURE"}</p>
                        <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400 mt-2">Authorized Member</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="absolute bottom-8 left-0 w-full flex justify-center opacity-50">
            <p className="text-[7px] text-gray-400 uppercase tracking-[0.4em] font-mono">
                Charter Legacy Protocol · Corporate Record · Form FL-TOD-DESIG
            </p>
        </div>
    </div>
);
