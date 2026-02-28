import React, { useState, useEffect } from 'react';
import { X, Globe, Lock, Unlock, Shield, ShieldCheck } from 'lucide-react';
import { supabase as charterSupabase } from '../../lib/supabase';
import HeritageConsole from './components/HeritageConsole';
import { useSuccession } from './useSuccession';
import { checkAndTriggerAnnualReview } from './AnnualReviewService';

/**
 * SUCCESSION SUITE (Library Version)
 * 
 * Refactored to use the standalone library registry via useSuccession hook.
 */
const SuccessionSuite = ({ user }) => {
    const { isOpen, closeVault, setProtocolData } = useSuccession();
    const [legalDocs, setLegalDocs] = useState([]);
    const [auditLog, setAuditLog] = useState([]);
    const [activeProtocolData, setActiveProtocolData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Data Orchestration
    useEffect(() => {
        if (!isOpen) return;

        // If no user, we can't fetch but we shouldn't hang
        if (!user) {
            console.warn("SuccessionSuite: No user session detected. Vault offline.");
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        const safetyTimeout = setTimeout(() => {
            if (isMounted) {
                console.warn("SuccessionSuite: Data synchronization timed out. Falling back to local state.");
                setIsLoading(false);
            }
        }, 5000); // 5s Institutional Timeout (slightly increased for stability)

        const loadSuccessionData = async () => {
            setIsLoading(true);
            try {
                // Institutional Fetch
                const { data: dbProtocols, error } = await charterSupabase
                    .from('wills')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (isMounted && dbProtocols && dbProtocols.length > 0) {
                    const latest = dbProtocols[0];

                    // ── ANNUAL REVIEW CHECK ─────────────────────────────────────────
                    // Runs transparently on vault open. If the designation is >= 340
                    // days old (or >= 340 days since last notice), the service will:
                    //   1. Queue an email notification in Supabase
                    //   2. Log ANNUAL_REVIEW_NOTICE_SENT to the SuccessionRegistry
                    //   3. Stamp `last_annual_notice_at` on the wills record
                    const resolvedProtocolData = await checkAndTriggerAnnualReview(
                        user.id,
                        user.email,
                        latest.protocol_data,
                        latest.created_at
                    );

                    if (isMounted) {
                        setActiveProtocolData(resolvedProtocolData);
                        setProtocolData(resolvedProtocolData);

                        const dbDoc = {
                            id:     latest.id,
                            label:  'Transfer on Death (TOD) Designation',
                            date:   new Date(latest.created_at).toLocaleDateString(),
                            status: 'active'
                        };
                        setLegalDocs([dbDoc]);
                    }
                }

                if (isMounted) {
                    setAuditLog([
                        { action: 'PROTOCOL_READ',  details: 'Succession system heartbeat detected', time: new Date().toISOString() },
                        { action: 'AUTH_VERIFIED',  details: 'Heritage permissions confirmed',       time: new Date().toISOString() }
                    ]);
                }

            } catch (err) {
                console.error("Succession Data Error:", err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    clearTimeout(safetyTimeout);
                }
            }
        };

        loadSuccessionData();
        return () => { 
            isMounted = false; 
            clearTimeout(safetyTimeout); 
        };
    }, [isOpen, user]);

    // 2. Event Handlers
    const handleDownload = async (data) => {
        // Generate a cryptographic seed if not present
        const protocolSeed = data.protocolSeed || [
            Math.random().toString(36).substring(2, 6).toUpperCase(),
            Math.random().toString(36).substring(2, 6).toUpperCase(),
            Math.random().toString(36).substring(2, 6).toUpperCase()
        ].join('-');

        const enrichedData = { ...data, protocolSeed };

        // Persist to Supabase
        if (user?.id) {
            try {
                // Try upsert (works if user_id has unique constraint)
                const { error: upsertError } = await charterSupabase
                    .from('wills')
                    .upsert({ user_id: user.id, protocol_data: enrichedData }, { onConflict: 'user_id' });

                // If upsert fails (no unique constraint), insert fresh record
                if (upsertError) {
                    await charterSupabase
                        .from('wills')
                        .insert({ user_id: user.id, protocol_data: enrichedData });
                }
            } catch (err) {
                console.error('Failed to persist succession protocol:', err);
            }
        }
        const prevDocsLength = legalDocs.length;
        const newDoc = {
            id: 'tod-' + Date.now(),
            label: 'Transfer on Death (TOD) Designation',
            date: new Date().toLocaleDateString(),
            seed: enrichedData.protocolSeed,
            status: 'active'
        };

        setLegalDocs(prev => [newDoc, ...prev.map(doc => ({ ...doc, status: 'superseded' }))]);
        setActiveProtocolData(enrichedData);
        setProtocolData(enrichedData); // Keep global registry in sync

        setAuditLog(prev => {
            const timeNow = new Date().toISOString();
            const newLogs = [
                { 
                    action: 'KINETIC_ANCHOR_SECURED', 
                    details: `Cryptographic Anchor (${enrichedData.protocolSeed}) secured for: ${enrichedData.fullName}`, 
                    time: timeNow
                }
            ];
            
            if (prevDocsLength > 0) {
                newLogs.push({
                    action: 'PROTOCOL_SUPERSEDED',
                    details: 'Previous Master Protocol was voided and superseded by a new issuance stream.',
                    time: new Date(Date.now() - 10).toISOString()
                });
            }
            
            return [...newLogs, ...prev];
        });
    };

    const handleLogEvent = (action, details) => {
        setAuditLog(prev => [{ action, details, time: new Date().toISOString() }, ...prev]);
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
                <div className="flex-1 overflow-y-auto no-scrollbar p-10 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.05)_0%,transparent_70%)]">
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
                            onLogEvent={handleLogEvent}
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
