import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, X, ArrowRight, Check, Shield, Database, Zap, Building2, MapPin, Hash, Calendar } from 'lucide-react';

const MercuryApplyWizard = ({ isOpen, onClose, llcData }) => {
    const [step, setStep] = useState('sync'); // sync | confirm
    
    // Auto-advance from sync to confirm
    useEffect(() => {
        if (isOpen && step === 'sync') {
            const timer = setTimeout(() => {
                setStep('confirm');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, step]);

    if (!isOpen) return null;

    const handleLaunch = () => {
        // Construct Mercury URL with metadata (hypothetical parameters based on Mercury's partner API style)
        const baseUrl = "https://mercury.com/partner/charter-legacy";
        const params = new URLSearchParams({
            businessName: llcData?.name || '',
            ein: llcData?.ein || '',
            formationState: 'Florida',
            address: llcData?.business_address || '',
            externalRef: llcData?.id || '',
            partnerSource: 'charter_legacy_oneclick'
        });
        
        window.open(`${baseUrl}?${params.toString()}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0A0A0B] border border-white/10 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="p-12">
                    <AnimatePresence mode="wait">
                        {step === 'sync' ? (
                            <motion.div 
                                key="sync-step"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">
                                        <Database size={40} className="animate-pulse" />
                                    </div>
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-4 border-2 border-dashed border-purple-500/20 rounded-full"
                                    />
                                    <motion.div 
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute -inset-8 border border-white/5 rounded-full"
                                    />
                                </div>
                                <h3 className="text-2xl font-light text-white mb-2">Syncing LLC Metadata</h3>
                                <p className="text-gray-500 text-sm max-w-xs">
                                    Harvesting EIN, Articles, and Address for One-Click Application...
                                </p>
                                
                                <div className="mt-12 flex gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div 
                                            key={i}
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                            className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="confirm-step"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-10"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                                        M
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-light text-white tracking-tight">Mercury <span className="font-medium text-gray-500">Apply.</span></h2>
                                        <p className="text-gray-400 text-sm mt-1">Ready to establish your tech-forward banking core.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-[24px] space-y-4">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Building2 size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Entity Name</span>
                                        </div>
                                        <p className="text-white font-medium">{llcData?.name || 'Loading...'}</p>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-[24px] space-y-4">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Hash size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">EIN Number</span>
                                        </div>
                                        <p className={`font-mono font-bold ${llcData?.ein ? 'text-[#00D084]' : 'text-orange-400'}`}>
                                            {llcData?.ein || 'Pending Assignment'}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/5 rounded-[24px] space-y-4 col-span-2">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <MapPin size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Registered Address</span>
                                        </div>
                                        <p className="text-white text-sm leading-relaxed">{llcData?.business_address || 'Fetching Articles...'}</p>
                                    </div>
                                </div>

                                <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-3xl flex items-start gap-4">
                                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm mb-1">One-Click Efficiency</h4>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            We've securely bundled your formation docs. Mercury will pre-fill these fields to save you ~15 minutes of manual entry.
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleLaunch}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                                >
                                    Confirm & Launch Mercury <ArrowRight size={18} />
                                </button>
                                
                                <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                    Secure Transfer via Charter Legacy Partner Gateway
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default MercuryApplyWizard;
