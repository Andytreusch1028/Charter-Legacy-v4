import React, { useState } from 'react';
import { X, Check, FileText, Building2, Landmark, Shield, ChevronRight, Loader2, Download, ScrollText, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const BlueprintStep = ({ title, status, icon: Icon, active, onClick, children }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-[32px] border transition-all duration-500 cursor-pointer ${
      active 
        ? 'border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' 
        : 'border-transparent hover:bg-white/5 hover:border-white/10'
    }`}
  >
    <div className="flex items-center justify-between mb-6">
      <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-500 ${active ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      {status === 'complete' && <div className="p-1.5 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"><Check size={14} strokeWidth={3} /></div>}
    </div>
    <h3 className={`text-[13px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${active ? 'text-white' : 'text-gray-500'}`}>{title}</h3>
    
    {active && (
      <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
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
      
      // Trigger marketing aggregate event for BOI
      if (step === 'boi') {
          import('./lib/MarketingTriggerService').then(({ marketingTriggerService }) => {
              marketingTriggerService.triggerMilestone('BOI Compliance Filed', {
                  companyRef: companyName || 'Entity',
                  type: 'Federal Compliance'
              }).catch(e => console.error(e));
          });
      }
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
                        <div className="flex items-center justify-between group/item cursor-pointer hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onClose('articles'); }}>
                            <span className="text-xs font-bold text-slate-700 group-hover/item:text-blue-600 transition-colors">Articles of Organization</span>
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">FILED</span>
                        </div>
                        <div className="flex items-center justify-between group/item cursor-pointer hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onClose('ein'); }}>
                            <span className="text-xs font-bold text-slate-700 group-hover/item:text-blue-600 transition-colors">EIN Designation</span>
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">ISSUED</span>
                        </div>
                        <div className="flex items-center justify-between group/item cursor-pointer hover:bg-orange-50/50 p-2 -mx-2 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onClose('boi'); }}>
                            <span className="text-xs font-bold text-slate-700 group-hover/item:text-orange-600 transition-colors">BOI Report (FinCEN)</span>
                            <span className="text-[9px] font-mono text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded animate-pulse cursor-pointer border border-orange-200/50 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                              PENDING (START)
                            </span>
                        </div>
                        <div className="flex items-center justify-between group/item cursor-pointer hover:bg-amber-50/50 p-2 -mx-2 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onClose('annual_report'); }}>
                            <span className="text-xs font-bold text-slate-700 group-hover/item:text-amber-600 transition-colors">2026 Annual Report</span>
                            <span className="text-[9px] font-mono text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded cursor-pointer animate-pulse border border-amber-200 hover:bg-amber-100 hover:scale-110 transition-all">
                              DUE (MAY 1)
                            </span>
                        </div>
                     </div>

                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 pt-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Governance</span>
                    </div>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between group/item cursor-pointer hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onClose('oa'); }}>
                            <span className="text-xs font-bold text-slate-700 group-hover/item:text-blue-600 transition-colors">Operating Agreement</span>
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">DRAFTED</span>
                        </div>
                        <div className="flex items-center justify-between group/item cursor-pointer hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onClose('banking'); }}>
                            <span className="text-xs font-bold text-slate-700 group-hover/item:text-blue-600 transition-colors">Banking Resolution</span>
                            <div className="flex items-center gap-1 text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                <span className="text-[9px] font-black uppercase tracking-widest">Generatable</span>
                                <ArrowRight size={10} />
                            </div>
                        </div>
                         <div className="flex items-center justify-between group/item opacity-50 cursor-pointer hover:bg-gray-50/50 p-2 -mx-2 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); onClose('ledger'); }}>
                            <span className="text-xs font-bold text-slate-700">Membership Ledger</span>
                            <span className="text-[9px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">WAITING</span>
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-6xl h-[90vh] rounded-[48px] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-3xl">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-1/3 bg-black/40 p-10 border-r border-white/10 overflow-y-auto">
           <div className="mb-12">
              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-4 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-luminous-blue animate-pulse"/> Operational Handbook
              </div>
              <h2 className="text-3xl font-light tracking-tight text-white mb-2">{companyName}</h2>
              <p className="text-xs text-gray-400 font-medium">Internal Corporate Documentation</p>
           </div>

           <div className="space-y-4">
              <BlueprintStep 
                title="Articles of Organization" 
                icon={FileText} 
                active={activeStep === 'articles'} 
                status={completedSteps.includes('articles') ? 'complete' : 'pending'}
                onClick={() => setActiveStep('articles')}
              >
                <p className="text-[13px] text-gray-400 font-light leading-relaxed mb-6">
                  The initial founding document filed with the State of Florida establishing the existence of your LLC.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); generatePDF('articles'); }}
                  disabled={generating}
                  className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="animate-spin" size={16}/> : <><Download size={16}/> Access Articles</>}
                </button>
              </BlueprintStep>

              <BlueprintStep 
                title="Federal EIN" 
                icon={Building2} 
                active={activeStep === 'ein'} 
                status={completedSteps.includes('ein') ? 'complete' : 'pending'}
                onClick={() => setActiveStep('ein')}
              >
                <p className="text-[13px] text-gray-400 font-light leading-relaxed mb-6">
                  Your Employer Identification Number is the tax identifier for your business entity. Usually required to establish banking relationships.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); markComplete('ein'); }}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-luminous-blue hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] focus:outline-none"
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
                 <p className="text-[13px] text-gray-400 font-light leading-relaxed mb-6">
                  The primary internal document outlining your LLC's ownership structure and operational procedures.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); generatePDF('oa'); }}
                  disabled={generating}
                  className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="animate-spin" size={16}/> : <><ScrollText size={16}/> Draft Agreement</>}
                </button>
              </BlueprintStep>

              <BlueprintStep 
                title="Banking Resolution" 
                icon={Landmark} 
                active={activeStep === 'banking'} 
                status={completedSteps.includes('banking') ? 'complete' : 'pending'}
                onClick={() => setActiveStep('banking')}
              >
                 <p className="text-[13px] text-gray-400 font-light leading-relaxed mb-6">
                  An internal corporate resolution authorizing designated members to open commercial bank accounts.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); generatePDF('banking'); }}
                  disabled={generating}
                  className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                   {generating ? <Loader2 className="animate-spin" size={16}/> : <><Download size={16}/> Generate Document</>}
                </button>
              </BlueprintStep>

              <BlueprintStep 
                title="FinCEN BOI Report" 
                icon={Shield} 
                active={activeStep === 'boi'} 
                status={completedSteps.includes('boi') ? 'complete' : 'pending'}
                onClick={() => setActiveStep('boi')}
              >
                 <p className="text-[13px] text-gray-400 font-light leading-relaxed mb-6">
                  A mandatory federal report disclosing beneficial owners. Must be filed within 90 days.
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); markComplete('boi'); }}
                  className="w-full py-4 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.1)] focus:outline-none"
                >
                   {completedSteps.includes('boi') ? 'View Confirmation' : 'File BOI Report'}
                </button>
              </BlueprintStep>
           </div>
        </div>

        {/* MAIN CONTENT PREVIEW */}
        <div className="flex-1 bg-black/20 p-8 md:p-16 relative overflow-y-auto flex flex-col items-center justify-center text-center">
            <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-500 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 shadow-sm"><X size={20} /></button>
            
            <div className="w-full max-w-xl animate-in slide-in-from-right-8 duration-500" key={activeStep}>
               {activeStep === 'articles' && <ArticlesContent companyName={companyName} />}
               {activeStep === 'ein' && <EINContent companyName={companyName} />}
               {activeStep === 'oa' && <OAContent companyName={companyName} />}
               {activeStep === 'banking' && <BankContent companyName={companyName} />}
               {activeStep === 'boi' && <BOIContent companyName={companyName} />}
               {activeStep === 'ledger' && <LedgerContent companyName={companyName} />}
               {activeStep === 'annual_report' && (
                 <div className="text-center p-8 bg-black/40 border border-white/10 rounded-3xl">
                     <Building2 size={48} className="mx-auto text-amber-500 mb-6" />
                     <h3 className="text-2xl text-white font-medium mb-4">Annual Report Filing</h3>
                     <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">This compliance action requires verification of your entity's core data points.</p>
                     <button onClick={() => onClose('annual_report')} className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">
                         Open Verification Wizard
                     </button>
                 </div>
               )}
            </div>
        </div>

      </div>
    </div>
  );
};

// --- CONTENT SUB-COMPONENTS ---

const ArticlesContent = ({ companyName }) => (
  <>
    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.02)] text-blue-400 group transition-all duration-500 hover:border-blue-500/50 hover:bg-blue-500/10 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
       <Building2 size={36} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="text-center mt-8">
        <h2 className="text-5xl font-light tracking-tight text-white mb-4">Articles of <span className="font-medium text-gray-500">Organization.</span></h2>
        <p className="text-gray-400 font-light mt-4 max-w-md mx-auto text-[15px] leading-relaxed">
        The primary state filing establishing the legal existence of <strong className="text-white font-medium">{companyName}</strong>.
        </p>
    </div>
    <div className="bg-black/40 p-10 rounded-[40px] border border-white/10 mt-10 w-full max-w-lg mx-auto group hover:border-white/20 transition-all duration-500 shadow-2xl">
       <div className="space-y-6 font-mono text-[13px] text-gray-400">
          <div className="flex justify-between items-center border-b border-white/5 pb-5 group-hover:border-white/10 transition-colors">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Entity Name</span>
             <span className="font-bold text-white text-[15px] truncate max-w-[200px]">{companyName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-5 group-hover:border-white/10 transition-colors">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Filing Status</span>
             <span className="font-bold text-emerald-400 bg-emerald-400/10 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest border border-emerald-400/20 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Active</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-5 group-hover:border-white/10 transition-colors">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">State</span>
             <span className="font-bold text-white">Florida (Sunbiz)</span>
          </div>
       </div>
    </div>
  </>
);

const EINContent = ({ companyName }) => (
  <>
    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.02)] text-luminous-blue group transition-all duration-500 hover:border-luminous-blue/50 hover:bg-luminous-blue/10 hover:shadow-[0_0_40px_rgba(0,122,255,0.2)]">
       <Building2 size={36} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="text-center mt-8">
        <h2 className="text-5xl font-light tracking-tight text-white mb-4">Federal Tax <span className="font-medium text-gray-500">ID.</span></h2>
    </div>
    <div className="bg-black/40 p-10 rounded-[40px] border border-white/10 mt-10 w-full max-w-lg mx-auto group hover:border-white/20 transition-all duration-500 shadow-2xl">
       <div className="space-y-6 font-mono text-[13px] text-gray-400">
          <div className="flex justify-between items-center border-b border-white/5 pb-5 group-hover:border-white/10 transition-colors">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Entity Name</span>
             <span className="font-bold text-white text-[15px] truncate max-w-[200px]">{companyName}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-5 group-hover:border-white/10 transition-colors">
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">EIN Status</span>
             <span className="font-bold text-luminous-blue bg-luminous-blue/10 px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-widest border border-luminous-blue/20 drop-shadow-[0_0_15px_rgba(0,122,255,0.3)] animate-pulse">Pending IRS Assignment</span>
          </div>
          <p className="pt-2 text-[11px] text-gray-500 font-light leading-relaxed font-sans text-center px-4">
             * Note: The IRS assigns this identifier digitally. Upon assignment, the CP-575 confirmation letter will be deposited into your vault.
          </p>
       </div>
    </div>
  </>
);

const OAContent = ({ companyName }) => (
  <>
    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.02)] text-emerald-400 group transition-all duration-500 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]">
       <FileText size={36} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="text-center mt-8">
        <h2 className="text-5xl font-light tracking-tight text-white mb-4">Operating <span className="font-medium text-gray-500">Agreement.</span></h2>
        <p className="text-gray-400 font-light mt-4 max-w-md mx-auto text-[15px] leading-relaxed">
        This internal agreement defines the ownership structure and operational parameters for <strong className="text-white font-medium">{companyName}</strong>.
        </p>
    </div>
    <div className="h-72 bg-black/40 rounded-[40px] border border-white/10 w-full max-w-lg mx-auto flex items-center justify-center relative overflow-hidden mt-10 group cursor-pointer hover:border-white/20 transition-all duration-500 shadow-2xl">
       <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:24px_24px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
       <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 to-transparent"></div>
       <div className="relative z-10 flex flex-col items-center gap-5">
           <ScrollText size={56} strokeWidth={1} className="text-gray-600 group-hover:text-emerald-400 transition-colors duration-500" />
           <p className="font-bold uppercase tracking-[0.3em] text-[10px] text-gray-500 group-hover:text-white transition-colors duration-500">Document Blueprint Preview</p>
       </div>
    </div>
  </>
);

const BankContent = ({ companyName }) => (
  <>
    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.02)] text-purple-400 group transition-all duration-500 hover:border-purple-500/50 hover:bg-purple-500/10 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]">
       <Landmark size={36} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="text-center mt-8">
        <h2 className="text-5xl font-light tracking-tight text-white mb-4">Banking <span className="font-medium text-gray-500">Resolution.</span></h2>
        <p className="text-gray-400 font-light mt-4 max-w-md mx-auto text-[15px] leading-relaxed">
        A standard internal corporate resolution authorizing designated members to establish commercial banking relationships.
        </p>
    </div>
    <div className="p-10 bg-black/40 rounded-[40px] border border-white/10 text-left mt-10 w-full max-w-lg mx-auto group hover:border-purple-500/20 transition-all duration-500 shadow-2xl">
       <h4 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.2em] mb-8 flex items-center gap-4">
            <div className="w-10 h-[1px] bg-slate-700"></div>
            Suggested Partner Banks
       </h4>
       <ul className="space-y-6 text-[14px] text-gray-300 font-light">
         <li className="flex items-center gap-5 group/item cursor-pointer"><div className="w-10 h-10 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover/item:bg-purple-500/10 group-hover/item:border-purple-500/30 transition-all shadow-sm"><Check size={16} strokeWidth={2} /></div> <span className="group-hover/item:text-white transition-colors">Mercury (Tech-Forward)</span></li>
         <li className="flex items-center gap-5 group/item cursor-pointer"><div className="w-10 h-10 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover/item:bg-purple-500/10 group-hover/item:border-purple-500/30 transition-all shadow-sm"><Check size={16} strokeWidth={2} /></div> <span className="group-hover/item:text-white transition-colors">Chase Business (Traditional)</span></li>
         <li className="flex items-center gap-5 group/item cursor-pointer"><div className="w-10 h-10 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover/item:bg-purple-500/10 group-hover/item:border-purple-500/30 transition-all shadow-sm"><Check size={16} strokeWidth={2} /></div> <span className="group-hover/item:text-white transition-colors">Relay Financial (No Fees)</span></li>
       </ul>
    </div>
  </>
);

const BOIContent = ({ companyName }) => (
  <>
    <div className="w-24 h-24 bg-orange-500/10 border border-orange-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.1)] text-orange-500 group transition-all duration-500 hover:border-orange-500/50 hover:bg-orange-500/20 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)]">
       <Shield size={36} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="text-center mt-8">
        <h2 className="text-5xl font-light tracking-tight text-white mb-4">FinCEN <span className="font-medium text-gray-500">BOI.</span></h2>
        <p className="text-gray-400 font-light mt-4 max-w-lg mx-auto text-[15px] leading-relaxed">
        The <strong>Beneficial Ownership Information (BOI)</strong> report must be filed federally within 90 days. Non-compliance results in statutory penalties.
        </p>
    </div>
    
    <div className="mt-10 space-y-6 w-full max-w-lg mx-auto">
        <div className="bg-black/40 p-8 rounded-[32px] border border-orange-500/20 shadow-2xl flex items-start gap-5 relative overflow-hidden group hover:border-orange-500/40 transition-colors duration-500">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-1000 -mr-10 -mt-10 pointer-events-none"></div>
             <div className="w-10 h-10 rounded-[12px] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 shadow-sm relative z-10">
                 <AlertCircle size={18} strokeWidth={2} />
             </div>
             <div className="relative z-10">
                 <h4 className="font-bold text-white text-[15px] mb-2">Mandatory Requirement</h4>
                 <p className="text-[13px] text-gray-400 font-light leading-relaxed">
                     All entities must report their beneficial owners to the U.S. Treasury. This is non-negotiable compliance.
                 </p>
             </div>
        </div>

        <button className="w-full py-5 bg-orange-600/90 text-white rounded-2xl font-bold text-[12px] uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] flex items-center justify-center gap-3 group focus:outline-none">
            Compile Federal Report <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300"/>
        </button>
        
        <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest mt-4">
            Transmission heavily encrypted via 256-bit protocol
        </p>
    </div>
  </>
);
const LedgerContent = ({ companyName }) => (
  <>
    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.02)] text-gray-400 group transition-all duration-500">
       <FileText size={36} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="text-center mt-8">
        <h2 className="text-5xl font-light tracking-tight text-white mb-4">Membership <span className="font-medium text-gray-500">Ledger.</span></h2>
        <p className="text-gray-400 font-light mt-4 max-w-md mx-auto text-[15px] leading-relaxed">
        This document tracks capitalization and ownership units.
        </p>
    </div>
    <div className="h-40 bg-black/40 rounded-[32px] border border-white/10 w-full max-w-lg mx-auto flex items-center justify-center mt-10 opacity-50">
        <p className="font-bold uppercase tracking-[0.3em] text-[10px] text-gray-500">Feature Arriving Soon</p>
    </div>
  </>
);

export default FoundersBlueprint;
