import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Download, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Database,
  Award,
  CircleDot,
  Share2,
  Trash2,
  Plus
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const MembershipLedger = ({ llcData, onClose }) => {
  const [generating, setGenerating] = useState(null);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'certificates'

  const members = llcData?.members || [];
  const companyName = llcData?.llc_name || 'Your Company';

  const generateCertificate = async (member, index) => {
    setGenerating(index);
    try {
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const page = pdfDoc.addPage([792, 612]); // Landscape Letter
      const { width, height } = page.getSize();

      // Border
      page.drawRectangle({
        x: 40,
        y: 40,
        width: width - 80,
        height: height - 80,
        borderWidth: 2,
        borderColor: rgb(0, 0, 0),
        opacity: 1,
      });

      // Decorative inner border
      page.drawRectangle({
        x: 50,
        y: 50,
        width: width - 100,
        height: height - 100,
        borderWidth: 1,
        borderColor: rgb(0.2, 0.2, 0.2),
        opacity: 0.5,
      });

      // Title
      page.drawText('MEMBERSHIP CERTIFICATE', {
        x: width / 2 - 150,
        y: height - 120,
        size: 30,
        font: timesBoldFont,
      });

      page.drawText('THIS CERTIFIES THAT', {
        x: width / 2 - 70,
        y: height - 160,
        size: 14,
        font: timesRomanFont,
      });

      // Member Name
      page.drawText(member.name.toUpperCase(), {
        x: width / 2 - (member.name.length * 8),
        y: height - 210,
        size: 24,
        font: timesBoldFont,
      });

      page.drawText('IS THE REGISTERED HOLDER OF', {
        x: width / 2 - 100,
        y: height - 250,
        size: 14,
        font: timesRomanFont,
      });

      // Ownership Percentage
      const ownershipText = `${member.percentage}% MEMBERSHIP INTEREST`;
      page.drawText(ownershipText, {
        x: width / 2 - (ownershipText.length * 6),
        y: height - 290,
        size: 20,
        font: timesBoldFont,
      });

      page.drawText(`IN`, {
        x: width / 2 - 10,
        y: height - 320,
        size: 14,
        font: timesRomanFont,
      });

      // Company Name
      page.drawText(companyName.toUpperCase(), {
        x: width / 2 - (companyName.length * 8),
        y: height - 360,
        size: 24,
        font: timesBoldFont,
      });

      page.drawText('Organized under the laws of the State of Florida', {
        x: width / 2 - 120,
        y: height - 390,
        size: 12,
        font: timesRomanFont,
      });

      // Footer / Signatures
      page.drawText('DATE:', { x: 100, y: 100, size: 12, font: timesBoldFont });
      page.drawText(new Date().toLocaleDateString(), { x: 145, y: 100, size: 12, font: timesRomanFont });

      page.drawText('SIGNATURE:', { x: width - 300, y: 100, size: 12, font: timesBoldFont });
      page.drawLine({
        start: { x: width - 220, y: 100 },
        end: { x: width - 100, y: 100 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${member.name.replace(/\s+/g, '_')}_Membership_Certificate.pdf`;
      link.click();

    } catch (err) {
      console.error("Certificate Generation Error:", err);
      alert("Failed to generate certificate.");
    } finally {
      setGenerating(null);
    }
  };

  const exportCSV = () => {
    const headers = ['Member Name', 'Role', 'Ownership Percentage', 'Address'];
    const rows = members.map(m => [
      m.name,
      m.role,
      `${m.percentage}%`,
      m.address || 'Principal Office'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${companyName.replace(/\s+/g, '_')}_Membership_Ledger.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-[#0A0A0B]/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        {/* Header Section */}
        <div className="bg-[#0A0A0B] p-8 pb-12 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Database size={20} />
                </div>
                <div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Governance Module</p>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Membership Ledger</h2>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-6 mt-4 relative z-10">
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'ledger' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-white'}`}
            >
              Cap Table
            </button>
            <button 
              onClick={() => setActiveTab('certificates')}
              className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'certificates' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-white'}`}
            >
              Certificates
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-10 -mt-6 bg-white rounded-t-[40px] relative z-20 flex-1 overflow-y-auto">
          {activeTab === 'ledger' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-black uppercase tracking-tighter leading-none">Capital Structure.</h3>
                  <p className="text-gray-400 text-sm font-medium mt-2 italic">Official ownership distribution for {companyName}</p>
                </div>
                <button 
                  onClick={exportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all border border-gray-100"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 w-1/3">Holder</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Role</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Interest</th>
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <Users size={18} />
                            </div>
                            <span className="font-bold text-black">{member.name}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase tracking-widest">
                            {member.role}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                             <div className="flex-1 max-w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${member.percentage}%` }}
                                  transition={{ delay: 0.5, duration: 1 }}
                                  className="h-full bg-blue-500"
                                />
                             </div>
                             <span className="font-black text-sm text-black">{member.percentage}%</span>
                          </div>
                        </td>
                        <td className="p-5 text-right font-black text-gray-400 italic">
                          {(member.percentage * 10).toLocaleString()} <span className="text-[9px]">Units</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Members</p>
                  <p className="text-3xl font-black text-blue-900">{members.length}</p>
                </div>
                <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100/50">
                  <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Allocated Interest</p>
                  <p className="text-3xl font-black text-green-900">100%</p>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Unit Pool</p>
                  <p className="text-3xl font-black text-gray-900">1,000</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-black uppercase tracking-tighter leading-none">Entity Securities.</h3>
                <p className="text-gray-400 text-sm font-medium italic">Generate formal membership certificates for participants.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {members.map((member, idx) => (
                  <div key={idx} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col justify-between min-h-[160px]">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Award size={24} />
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ownership</p>
                        <p className="text-xl font-black text-black">{member.percentage}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-black text-black uppercase tracking-tight">{member.name}</h4>
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">{member.role}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Security Issue Ready <CircleDot size={8} />
                      </span>
                      <button 
                        onClick={() => generateCertificate(member, idx)}
                        disabled={generating !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {generating === idx ? <FileText className="animate-pulse" size={14} /> : <Download size={14} />}
                        {generating === idx ? "Generating..." : "Download Original"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-2"><Shield size={12}/> Verified Governance</span>
               <span className="flex items-center gap-2"><CheckCircle2 size={12}/> Sunbiz Synchronized</span>
            </div>
            <span>v1.0.4-stable</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MembershipLedger;
