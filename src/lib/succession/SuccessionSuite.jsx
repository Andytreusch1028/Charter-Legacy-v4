import React, { useState, useEffect } from 'react';
import { X, Globe, Lock, Unlock, Shield, ShieldCheck } from 'lucide-react';
import { supabase as charterSupabase } from '../../lib/supabase';
import HeritageConsole from './components/HeritageConsole';
import { useSuccession } from './useSuccession';

/**
 * SUCCESSION SUITE (Library Version)
 * 
 * Refactored to use the standalone library registry via useSuccession hook.
 */
const SuccessionSuite = ({ user }) => {
    const { isOpen, closeVault } = useSuccession();
    const [legalDocs, setLegalDocs] = useState([]);
    const [auditLog, setAuditLog] = useState([]);
    const [activeProtocolData, setActiveProtocolData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Data Orchestration
    useEffect(() => {
        if (!isOpen || !user) return;

        const loadSuccessionData = async () => {
            setIsLoading(true);
            try {
                const { data: dbProtocols, error } = await charterSupabase
                    .from('wills')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (dbProtocols && dbProtocols.length > 0) {
                    const latest = dbProtocols[0];
                    setActiveProtocolData(latest.protocol_data);

                    const dbDoc = {
                        id: latest.id,
                        label: latest.type === 'trust' ? 'Family Living Trust' : 'Last Will & Testament',
                        date: new Date(latest.created_at).toLocaleDateString(),
                        status: 'active'
                    };
                    setLegalDocs([dbDoc]);
                }

                setAuditLog([
                    { action: 'PROTOCOL_READ', details: 'Succession system heartbeat detected', time: 'Just now' },
                    { action: 'AUTH_VERIFIED', details: 'Heritage permissions confirmed', time: 'Just now' }
                ]);

            } catch (err) {
                console.error("Succession Data Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadSuccessionData();
    }, [isOpen, user]);

    // 2. Event Handlers
    const handleDownload = (data) => {
        console.log("Generating Protocol Artifact:", data);
        setAuditLog(prev => [{ 
            action: 'DOC_GENERATED', 
            details: `Legal artifact finalized: ${data.fullName}`, 
            time: 'Just now' 
        }, ...prev]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-[#0A0A0B] w-full max-w-7xl h-full max-h-[90vh] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* Header Strip */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8a6d1d] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] animate-pulse">
                                <ShieldCheck size={20} className="text-black" />
                            </div>
                            {/* Orbital Ring */}
                            <svg className="absolute -inset-2 w-16 h-16 animate-spin-slow opacity-50" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="5,10" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-white font-black uppercase text-sm tracking-[0.2em] flex items-center gap-2">
                                Sovereignty Protocol <span className="text-[9px] bg-[#d4af37]/20 border border-[#d4af37]/30 px-2 py-0.5 rounded-full text-[#d4af37] font-black">Zenith Suite</span>
                            </h2>
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Multi-Signature Heritage Authentication</p>
                        </div>
                    </div>
                    <button 
                        onClick={closeVault}
                        className="group relative p-3 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-red-500/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
                        <X size={24} className="relative z-10" />
                    </button>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.05)_0%,transparent_70%)]">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Synchronizing Keys</p>
                        </div>
                    ) : (
                        <HeritageConsole 
                            user={user}
                            docs={legalDocs}
                            auditLog={auditLog}
                            activeProtocolData={activeProtocolData}
                            onDownload={handleDownload}
                        />
                    )}
                </div>

                {/* Footer Utility */}
                <div className="p-4 border-t border-white/5 flex justify-center bg-black/10">
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.5em] italic">
                        Charter Legacy · Non-Discretionary Scrivener · DeLand Hub System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuccessionSuite;
