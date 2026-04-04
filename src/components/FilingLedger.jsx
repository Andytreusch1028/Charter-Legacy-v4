import React, { useState, useEffect } from 'react';
import { 
    FileText, Calendar, Clock, ShieldCheck, 
    ChevronRight, AlertCircle, CheckCircle2, Lock,
    X, FileSignature, Shield
} from 'lucide-react';
import { GlassCard, PremiumToggle, StatusBadge } from '../shared/design-system/UIPrimitives';
import { supabase } from '../lib/supabase';
import { useAudit } from '../hooks/useAudit';

/**
 * FilingLedger
 * 
 * Dynamic list for active filings with integrated auto-renewal logic and consent modules.
 */
const FilingLedger = ({ llc, userId }) => {
    const { logAction } = useAudit();
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [signatureName, setSignatureName] = useState('');
    const [localAutoRenewal, setLocalAutoRenewal] = useState(llc?.auto_renewal || false);
    const [filings, setFilings] = useState([]);

    useEffect(() => {
        if (llc) {
            setLocalAutoRenewal(llc.auto_renewal);
            fetchFilings();
        }
    }, [llc]);

    const fetchFilings = async () => {
        try {
            // 1. Initial Formation Document
            const baseFiling = {
                id: 'formation-' + llc.id,
                name: llc.product_type === 'Shield' ? 'Articles of Organization (Privacy Shield)' : 'Articles of Organization',
                dateFiled: llc.filed_at || llc.created_at,
                expiryDate: llc.next_deadline,
                status: llc.llc_status === 'Active' ? 'Active' : 'Pending'
            };

            // 2. Fetch other documents from Registered Agent vault
            const { data: docs } = await supabase
                .from('registered_agent_documents')
                .select('*')
                .eq('llc_id', llc.id);

            const fetchedFilings = (docs || []).map(doc => ({
                id: doc.id,
                name: doc.title || doc.type,
                dateFiled: doc.date,
                expiryDate: null, // Only relevant for annual reports/renewals
                status: 'Filed'
            }));

            setFilings([baseFiling, ...fetchedFilings]);
        } catch (err) {
            console.error("Filing Retrieval Failure:", err);
        }
    };

    const handleToggleAttempt = (newValue) => {
        if (newValue === true) {
            setShowConsentModal(true);
        } else {
            updateAutoRenewal(false);
        }
    };

    const updateAutoRenewal = async (status, consentData = null) => {
        setIsProcessing(true);
        try {
            // 1. Update LLC Status
            const { error: updateError } = await supabase
                .from('llcs')
                .update({ 
                    auto_renewal: status,
                    renewal_consent_at: status ? new Date().toISOString() : null
                })
                .eq('id', llc.id);

            if (updateError) throw updateError;

            // 2. Create IMMUTABLE Audit Log entry via central hook
            await logAction(
                status ? 'Auto-Renewal Enabled' : 'Auto-Renewal Disabled',
                'Success',
                { 
                    llcId: llc.id, 
                    llcName: llc.llc_name,
                    consent: consentData,
                    source: 'FilingLedger'
                }
            );

            setLocalAutoRenewal(status);
            setShowConsentModal(false);
        } catch (err) {
            console.error("Auto-Renewal Update Failed:", err);
            alert("Security Protocol Verification Failed. Action logged.");
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmConsent = () => {
        if (!signatureName.trim()) return;
        updateAutoRenewal(true, { 
            signature: signatureName, 
            method: 'Typed Signature',
            authorized_at: new Date().toISOString()
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Active Filings Ledger</h3>
                    <p className="text-[11px] text-white/10 font-medium">Verified legal records and renewal controls.</p>
                </div>
            </div>

            <GlassCard variant="solid" className="overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Filing Name</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Date Filed</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Expiration</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Status</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-right">Auto-Renewal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filings.map((filing) => (
                                <tr key={filing.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white group-hover:text-black transition-all">
                                                <FileText size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-white/90">{filing.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-xs text-white/40 font-medium font-mono">
                                        {new Date(filing.dateFiled).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 text-xs text-white/40 font-medium font-mono">
                                        {new Date(filing.expiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center">
                                            <StatusBadge active={true} label="Eligible" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end scale-75 origin-right">
                                            <PremiumToggle 
                                                value={localAutoRenewal} 
                                                onChange={handleToggleAttempt}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Consent Modal */}
            {showConsentModal && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowConsentModal(false)} />
                    <GlassCard variant="glass" className="relative w-full max-w-lg p-10 border-white/20 animate-in zoom-in-95 duration-500">
                        <div className="space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                    <Lock size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Legal Disclosure</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Auto-Renewal Consent Required</p>
                                </div>
                            </div>

                            <div className="p-6 bg-black/40 rounded-[24px] border border-white/5 space-y-4">
                                <p className="text-sm text-white/60 leading-relaxed font-medium">
                                    I hereby authorize <span className="text-white">Charter Legacy</span> to securely store my payment information and automatically charge the credit card on file for future annual renewal fees and associated service charges for this entity. 
                                </p>
                                <p className="text-xs text-white/30 italic">
                                    I understand that I can disable this at any time before the renewal window. All transactions will be logged in the Master Audit Ledger.
                                </p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1 px-1">Full Legal Name Signature</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-emerald-500 transition-colors">
                                        <FileSignature size={18} />
                                    </div>
                                    <input 
                                        type="text"
                                        value={signatureName}
                                        onChange={(e) => setSignatureName(e.target.value)}
                                        placeholder="Type your name to authorize..."
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/10 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-medium"
                                    />
                                    {signatureName.length > 2 && (
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-500 animate-in zoom-in duration-300">
                                            <CheckCircle2 size={18} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-white/20 italic px-1 font-medium">
                                    By typing your name, you provide an electronic signature with the same legal effect as a handwritten signature.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button 
                                    onClick={() => setShowConsentModal(false)}
                                    className="py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmConsent}
                                    disabled={signatureName.length < 2 || isProcessing}
                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        signatureName.length >= 2 && !isProcessing 
                                            ? 'bg-white text-black shadow-2xl hover:scale-[1.02] active:scale-95' 
                                            : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
                                    }`}
                                >
                                    {isProcessing ? 'Verifying...' : 'Accept & Sign'}
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default FilingLedger;
