import React, { useState } from 'react';
import { X, Check, FileText, Building2, Landmark, Shield, ChevronRight, Loader2, Download } from 'lucide-react';
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

const FoundersBlueprint = ({ isOpen, onClose, companyName }) => {
  const [activeStep, setActiveStep] = useState('ein');
  const [completedSteps, setCompletedSteps] = useState([]);
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

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
            page.drawText(`OPERATING AGREEMENT`, { x: 50, y: height - 50, size: 24, font: timesRomanFont });
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
            page.drawText(`BANKING RESOLUTION`, { x: 50, y: height - 50, size: 24, font: timesRomanFont });
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

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#F0F2F5]/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="bg-[#FBFBFD] w-full max-w-5xl h-[90vh] rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 border border-white">
        
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
                title="Operating Agreement" 
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
                title="Banking Resolution" 
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
    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Federal Tax ID</h2>
    <div className="bg-white p-8 rounded-2xl shadow-sm text-left border border-gray-200/50">
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
    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Operating Agreement</h2>
    <p className="text-gray-500 font-medium">
      This multi-member agreement defines the ownership structure (Membership Units) and management rules for <strong>{companyName}</strong>.
    </p>
    <div className="h-64 bg-white rounded-xl border border-gray-200 w-full opacity-60 flex items-center justify-center relative overflow-hidden">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/lined-paper.png')] opacity-50"></div>
       <p className="font-serif italic text-gray-300 text-2xl">Preview Document</p>
    </div>
  </>
);

const BankContent = ({ companyName }) => (
  <>
    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#007AFF]">
       <Landmark size={32} />
    </div>
    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Banking Resolution</h2>
    <p className="text-gray-500 font-medium">
      Most banks require a "Banking Resolution" signed by the members to open a business checking account.
    </p>
    <div className="p-6 bg-[#007AFF]/5 rounded-2xl border border-[#007AFF]/10 text-left">
       <h4 className="font-bold text-[#007AFF] uppercase text-xs tracking-widest mb-2">Recommended Banks</h4>
       <ul className="space-y-2 text-sm text-gray-600">
         <li className="flex items-center gap-2"><Check size={14} className="text-[#00D084]" /> Mercury (Tech-Forward)</li>
         <li className="flex items-center gap-2"><Check size={14} className="text-[#00D084]" /> Chase Business (Traditional)</li>
         <li className="flex items-center gap-2"><Check size={14} className="text-[#00D084]" /> Relay Financial (No Fees)</li>
       </ul>
    </div>
  </>
);

export default FoundersBlueprint;
