import React, { useState } from 'react';
import { X, Check, FileText, Building2, Landmark, Shield, ChevronRight, Loader2, Download, ScrollText, CheckCircle2, ArrowRight } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const BlueprintStep = ({ title, status, icon: Icon, active, onClick, children }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
      active 
        ? 'border-black bg-white shadow-xl scale-[1.02]' 
        : 'border-transparent hover:bg-white/50 hover:border-gray-200'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
        <Icon size={20} />
      </div>
      {status === 'complete' && <div className="p-1 bg-[#00D084] rounded-full text-white"><Check size={12} strokeWidth={4} /></div>}
    </div>
    <h3 className={`text-lg font-black uppercase tracking-tight ${active ? 'text-black' : 'text-gray-400'}`}>{title}</h3>
    
    {active && (
      <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4">
         {children}
      </div>
    )}
  </div>
);

const FoundersBlueprint = ({ isOpen, onClose, companyName, mode = 'MONOLITH', initialStep = 'ein' }) => {
  const [activeStep, setActiveStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [generating, setGenerating] = useState(false);

  const markComplete = (step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const generatePDF = async (docType) => {
      setGenerating(true);
      try {
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        let filename = `${companyName.replace(/\s+/g, '_')}_Document.pdf`;

        if (docType === 'oa') {
            filename = `${companyName.replace(/\s+/g, '_')}_Operating_Agreement.pdf`;
            page.drawText(`OPERATING AGREEMENT TEMPLATE`, { x: 50, y: height - 50, size: 24, font: timesRomanFont });
            page.drawText(`OF`, { x: 50, y: height - 80, size: 14, font: timesRomanFont });
            page.drawText(companyName.toUpperCase(), { x: 50, y: height - 110, size: 18, font: timesRomanFont });
            
            const bodyText = `
            This Operating Agreement (the "Agreement") contains the entire
            understanding of the Members regarding the Company.
            
            ARTICLE I: FORMATION
            The Members hereby form a Limited Liability Company ("Company")
            subject to the laws of the State of Florida.
            
            ARTICLE II: NAME
            The name of the Company shall be: ${companyName}
            
            ARTICLE III: MANAGEMENT
            The Company shall be managed by its Members.
            
            IN WITNESS WHEREOF, the undersigned have executed this Agreement.
            `;
            
            page.drawText(bodyText, { x: 50, y: height - 200, size: 12, font: timesRomanFont, lineHeight: 18 });
        } else if (docType === 'banking') {
            filename = `${companyName.replace(/\s+/g, '_')}_Banking_Resolution.pdf`;
            page.drawText(`BANKING RESOLUTION FORM`, { x: 50, y: height - 50, size: 24, font: timesRomanFont });
            page.drawText(`AUTHORIZATION TO OPEN ACCOUNTS`, { x: 50, y: height - 80, size: 14, font: timesRomanFont });

            const bodyText = `
            IT IS HEREBY RESOLVED by the Members of ${companyName}:

            1. DESIGNATED BANK. The Company is authorized to open bank accounts.

            2. AUTHORIZED SIGNERS. The Members are authorized to sign checks.
            
            3. EFFECTIVE DATE. This resolution is effective immediately.
            `;
            
            page.drawText(bodyText, { x: 50, y: height - 150, size: 12, font: timesRomanFont, lineHeight: 18 });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        markComplete(docType);

      } catch (err) {
          console.error("PDF Gen Error:", err);
          alert("Failed to generate PDF. Please try again.");
      } finally {
          setGenerating(false);
      }
  };

  // RENDER CARD (Closed State)
  if (!isOpen) { 
      // MODE: SWISS
      if (mode === 'SWISS') {
        return (
            <div onClick={() => onClose(true)} className="p-8 bg-white rounded-[32px] border border-gray-200 h-full flex flex-col justify-between cursor-pointer hover:border-gray-300 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-bl-[150px] -mr-20 -mt-20 group-hover:bg-gray-100 transition-colors pointer-events-none" />
                
                {/* Header */}
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                         <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-black rounded-full animate-pulse"/>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Corporate Status</span>
                         </div>
                         <h3 className="text-4xl font-black text-black tracking-tighter leading-[0.9]">Formation <br/>Blueprint.</h3>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full border border-gray-100 flex items-center justify-center text-black shadow-sm group-hover:bg-black group-hover:text-white transition-colors">
                        <Download size={20} />
                    </div>
                </div>

                {/* Checklist Section */}
                <div className="relative z-10 space-y-4 mt-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Core Filings</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between group/item">
                            <span className="text-xs font-bold text-slate-700">Articles of Organization</span>
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">FILED</span>
                        </div>
                        <div className="flex items-center justify-between group/item">
                            <span className="text-xs font-bold text-slate-700">EIN Designation</span>
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">ISSUED</span>
                        </div>
                        <div className="flex items-center justify-between group/item">
                            <span className="text-xs font-bold text-slate-700">BOI Report (FinCEN)</span>
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose('boi');
                              }}
                              className="text-[9px] font-mono text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded animate-pulse cursor-pointer hover:bg-orange-100 hover:scale-110 transition-all border border-orange-200/50"
                            >
                              PENDING (START)
                            </span>
                        </div>
                     </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 pt-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Governance</span>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between group/item">
                            <span className="text-xs font-bold text-slate-700">Operating Agreement</span>
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">DRAFTED</span>
                        </div>
                        <div className="flex items-center justify-between group/item">
                            <span className="text-xs font-bold text-slate-700">Banking Resolution</span>
                            <div className="flex items-center gap-1 text-red-500">
                                <span className="text-[9px] font-black uppercase tracking-widest">Action</span>
                                <ArrowRight size={10} />
                            </div>
                        </div>
                         <div className="flex items-center justify-between group/item opacity-50">
                            <span className="text-xs font-bold text-slate-700">Membership Ledger</span>
                            <span className="text-[9px] font-mono text-gray-300">WAITING</span>
                        </div>
                     </div>
                </div>
            </div>
        )
      }

      // MODE: CUPERTINO
      if (mode === 'CUPERTINO') {
        return (
            <div onClick={() => onClose(true)} className="p-8 bg-white border border-slate-200 rounded-[32px] h-full flex flex-col justify-between shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all cursor-pointer group relative overflow-hidden">
                {/* Subtle Texture */}
                <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm group-hover:scale-110 group-hover:text-[#007AFF] group-hover:bg-blue-50 transition-all duration-300">
                    <ScrollText size={28} strokeWidth={2} />
                </div>
                
                <div className="relative z-10 w-full">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">Formation & EIN</h3>
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Ready
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                        <Check size={14} className="text-green-500" /> Articles & Operating Agreement
                    </p>
                </div>
            </div>
        )
      }

      // MODE: MONOLITH (Default)
      return (
        <div 
            onClick={() => onClose(true)}
            className="p-16 bg-white rounded-[56px] border border-gray-200 shadow-sm flex flex-col justify-between h-[600px] relative overflow-hidden group cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 w-full"
        >
            <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-gray-100 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-4 text-[#007AFF] text-[10px] font-black uppercase tracking-[0.6em] mb-16">
                    <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-pulse" />
                    Formation Complete
                </div>

                {/* STEVE MODE: Quick Actions */}
                <div className="absolute top-0 right-0 p-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="px-4 py-2 bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#00D084] transition-colors shadow-lg">
                        Download All
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-lg">
                        Share Link
                    </button>
                </div>

                <h3 className="text-6xl font-black uppercase tracking-tighter text-[#1D1D1F] mb-8 leading-[0.8]">Founder's <br/>Blueprint.</h3>
                <p className="text-gray-500 text-base font-medium leading-relaxed max-w-[85%]">
                    "Access your EIN, Operating Agreement, and Company Formation Documents."
                </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto pt-10 border-t border-gray-100">
                <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 border-[3px] border-white flex items-center justify-center text-xs font-bold shadow-sm">OA</div>
                    <div className="w-12 h-12 rounded-full bg-gray-200 border-[3px] border-white flex items-center justify-center text-xs font-bold shadow-sm">EIN</div>
                    <div className="w-12 h-12 rounded-full bg-[#007AFF] border-[3px] border-white flex items-center justify-center text-white shadow-sm">
                        <Check size={16} strokeWidth={3} />
                    </div>
                </div>
                <div className="w-20 h-20 bg-[#0A0A0B] text-white rounded-[32px] flex items-center justify-center group-hover:rotate-45 transition-all shadow-xl">
                    <ChevronRight size={32} />
                </div>
            </div>
        </div>
      );
  }

  // RENDER MODAL (Open State)
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#F0F2F5]/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="vitreous-glass w-full max-w-5xl h-[90vh] rounded-[48px] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 shadow-2xl">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-1/3 bg-white p-8 border-r border-gray-100 overflow-y-auto">
           <div className="mb-12">
              <div className="text-[0.65rem] font-black uppercase tracking-[0.5em] text-[#0A0A0B] opacity-30 mb-4">Operational Handbook</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-[#0A0A0B]">{companyName}</h2>
           </div>

           <div className="space-y-4">
              <BlueprintStep 
                title="Federal EIN" 
                icon={Building2} 
                active={activeStep === 'ein'} 
                status={completedSteps.includes('ein') ? 'complete' : 'pending'}
                onClick={() => setActiveStep('ein')}
              >
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                  Your Employer Identification Number is the "SSN" for your business. Required for banking.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); markComplete('ein'); }}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#00D084] transition-colors"
                >
                  {completedSteps.includes('ein') ? 'Access Letter' : 'Mark as Received'}
                </button>
              </BlueprintStep>

              <BlueprintStep 
                title="Operating Agreement Template" 
                icon={FileText} 
                active={activeStep === 'oa'} 
                status={completedSteps.includes('oa') ? 'complete' : 'pending'}
                onClick={() => setActiveStep('oa')}
              >
                 <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                  The governing constitution of your LLC. Establishes ownership and rules.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); generatePDF('oa'); }}
                  disabled={generating}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#00D084] transition-colors flex items-center justify-center gap-2"
                >
                  {generating ? <Loader2 className="animate-spin" size={14}/> : <><Download size={14}/> Sign Digitally</>}
                </button>
              </BlueprintStep>

              <BlueprintStep 
                title="Banking Resolution Form" 
                icon={Landmark} 
                active={activeStep === 'banking'} 
                status={completedSteps.includes('banking') ? 'complete' : 'pending'}
                onClick={() => setActiveStep('banking')}
              >
                 <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                  Formal authorization to open a corporate bank account.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); generatePDF('banking'); }}
                  disabled={generating}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#00D084] transition-colors flex items-center justify-center gap-2"
                >
                   {generating ? <Loader2 className="animate-spin" size={14}/> : <><Download size={14}/> Generate PDF</>}
                </button>
              </BlueprintStep>
           </div>
        </div>

        {/* MAIN CONTENT PREVIEW */}
        <div className="flex-1 bg-[#F5F5F7] p-8 md:p-16 relative overflow-y-auto flex flex-col items-center justify-center text-center">
            <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-white rounded-full hover:bg-black hover:text-white transition-all shadow-sm"><X size={20} /></button>
            
            <div className="max-w-xl space-y-8 animate-in slide-in-from-right duration-500" key={activeStep}>
               {activeStep === 'ein' && <EINContent companyName={companyName} />}
               {activeStep === 'oa' && <OAContent companyName={companyName} />}
               {activeStep === 'banking' && <BankContent companyName={companyName} />}
               {activeStep === 'boi' && <BOIContent companyName={companyName} />}
            </div>
        </div>

      </div>
    </div>
  );
};

// --- CONTENT SUB-COMPONENTS ---

const EINContent = ({ companyName }) => (
  <>
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#007AFF]">
       <Building2 size={32} />
    </div>
    <div className="text-center mt-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Federal Tax ID</h2>
    </div>
    <div className="bg-white p-8 rounded-2xl shadow-sm text-left border border-gray-200/50 mt-8">
       <div className="space-y-4 font-mono text-sm text-gray-600">
          <div className="flex justify-between border-b border-gray-100 pb-2">
             <span>Entity Name:</span>
             <span className="font-bold text-black">{companyName}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
             <span>EIN Status:</span>
             <span className="font-bold text-[#00D084]">Pending IRS Assignment</span>
          </div>
          <p className="pt-2 text-xs text-gray-400 italic">
             * Note: The IRS creates this number digitally. Once assigned, your CP-575 letter will appear here automatically.
          </p>
       </div>
    </div>
  </>
);

const OAContent = ({ companyName }) => (
  <>
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#007AFF]">
       <FileText size={32} />
    </div>
    <div className="text-center mt-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Operating Agreement</h2>
        <p className="text-gray-500 font-medium mt-2">
        This multi-member agreement defines the ownership structure (Membership Units) and management rules for <strong>{companyName}</strong>.
        </p>
    </div>
    <div className="h-64 bg-white rounded-xl border border-gray-200 w-full opacity-60 flex items-center justify-center relative overflow-hidden mt-8">
       <div className="absolute inset-0 bg-[radial-gradient(#00000033_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
       <p className="font-serif italic text-gray-300 text-2xl">Preview Document</p>
    </div>
  </>
);

const BankContent = ({ companyName }) => (
  <>
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#007AFF]">
       <Landmark size={32} />
    </div>
    <div className="text-center mt-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Banking Resolution</h2>
        <p className="text-gray-500 font-medium mt-2">
        Most banks require a "Banking Resolution" signed by the members to open a business checking account.
        </p>
    </div>
    <div className="p-6 bg-[#007AFF]/5 rounded-2xl border border-[#007AFF]/10 text-left mt-8 w-full">
       <h4 className="font-bold text-[#007AFF] uppercase text-xs tracking-widest mb-2">Suggested Banking Integrations</h4>
       <ul className="space-y-2 text-sm text-gray-600">
         <li className="flex items-center gap-2"><Check size={14} className="text-[#00D084]" /> Mercury (Tech-Forward)</li>
         <li className="flex items-center gap-2"><Check size={14} className="text-[#00D084]" /> Chase Business (Traditional)</li>
         <li className="flex items-center gap-2"><Check size={14} className="text-[#00D084]" /> Relay Financial (No Fees)</li>
       </ul>
    </div>
  </>
);

const BOIContent = ({ companyName }) => (
  <>
    <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto shadow-sm text-orange-500 border border-orange-100">
       <Shield size={32} />
    </div>
    <div className="text-center mt-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Mandatory Filing</h2>
        <p className="text-gray-500 font-medium mt-2">
        The <strong>Beneficial Ownership Information (BOI)</strong> report is required by FinCEN within 90 days of formation. Non-compliance carries severe penalties.
        </p>
    </div>
    
    <div className="mt-8 space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-4">
             <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0 mt-1">
                 <AlertCircle size={16} />
             </div>
             <div>
                 <h4 className="font-bold text-gray-900 text-sm mb-1">Federal Requirement</h4>
                 <p className="text-xs text-gray-500 leading-relaxed">
                     As of Jan 1, 2024, all new LLCs must report their beneficial owners (25%+ ownership) to the U.S. Treasury.
                 </p>
             </div>
        </div>

        <button className="w-full py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-3 group">
            Start Secure Filing <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
        </button>
        
        <p className="text-[10px] text-center text-gray-400 font-medium">
            Secure 256-bit encrypted transmission to FinCEN.gov
        </p>
    </div>
  </>
);

export default FoundersBlueprint;
