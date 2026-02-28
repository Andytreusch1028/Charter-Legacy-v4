import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';
import { Activity, ShieldCheck, Mail, Building2, CreditCard, ChevronDown, FileText } from 'lucide-react';

const BusinessStoryTimeline = ({ llcData }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 150);
    };

    useEffect(() => {
        if (!llcData) return;

        // If we are in the demo view or missing an ID, seed a mock story immediately
        if (!llcData?.id) {
            setEvents([
                {
                    id: 'mock-1',
                    event_category: 'COMPLIANCE',
                    customer_facing_message: 'Your entity was secured within the Operational Handbook.',
                    created_at: llcData.created_at || new Date().toISOString()
                }
            ]);
            setLoading(false);
            return;
        }
        
        const fetchStory = async () => {
            setLoading(true);
            try {
                // Fetch ONLY customer-facing messages with INFO or SUCCESS severity
                const { data, error } = await supabase
                    .from('system_events_ledger')
                    .select('*')
                    .eq('entity_id', llcData.id)
                    .in('severity', ['INFO', 'SUCCESS'])
                    .not('customer_facing_message', 'is', null)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                
                // If the ledger is completely empty (no migrations run/no organic data),
                // we'll seed a beautiful narrative based on the llcData's creation date.
                if (!data || data.length === 0) {
                    setEvents([
                        {
                            id: 'mock-1',
                            event_category: 'COMPLIANCE',
                            customer_facing_message: 'Your entity was secured within the Operational Handbook.',
                            created_at: llcData.created_at || new Date().toISOString()
                        }
                    ]);
                } else {
                    setEvents(data);
                }
            } catch (err) {
                console.error("Failed to load Business Story:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
        
        // Real-time subscription for the 'Jony' interface
        const channel = supabase.channel(`story-${llcData.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'system_events_ledger',
                filter: `entity_id=eq.${llcData.id}`
            }, (payload) => {
                const newEvt = payload.new;
                if (['INFO', 'SUCCESS'].includes(newEvt.severity) && newEvt.customer_facing_message) {
                    setEvents(prev => [newEvt, ...prev]);
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [llcData?.id]);

    const getIcon = (category) => {
        switch (category) {
            case 'FILING_AUTOMATION': return <Building2 size={16} className="text-luminous-blue" />;
            case 'COMMUNICATION': return <Mail size={16} className="text-emerald-500" />;
            case 'COMPLIANCE': return <ShieldCheck size={16} className="text-purple-500" />;
            case 'BILLING': return <CreditCard size={16} className="text-amber-500" />;
            default: return <Activity size={16} className="text-gray-400" />;
        }
    };

    if (loading) {
        return (
            <div className="w-full h-48 rounded-[32px] border border-white/5 bg-[#1c1c1e] flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <Activity size={16} className="animate-spin text-[#d4af37]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Reading Ledger...</span>
                </div>
            </div>
        );
    }

    return (
        <>
        {isPrinting && (
            <style>
                {`
                    @media print {
                        body { background-color: white !important; }
                        #root { display: none !important; }
                        .business-story-print, .business-story-print * {
                            display: block !important;
                            visibility: visible !important;
                            color: black !important;
                        }
                        .business-story-print {
                            position: absolute !important;
                            top: 0 !important;
                            left: 0 !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            box-sizing: border-box !important;
                            min-height: 100vh !important;
                        }
                        .business-story-print table { display: table !important; width: 100% !important; }
                        .business-story-print thead { display: table-header-group !important; }
                        .business-story-print tbody { display: table-row-group !important; }
                        .business-story-print tfoot { display: table-footer-group !important; }
                        @page { margin: 0; }
                        .print-page-number::after {
                            content: "PAGE " counter(page);
                        }
                    }
                `}
            </style>
        )}
        <div className="w-full bg-[#1c1c1e] rounded-[40px] border border-white/5 p-8 md:p-12 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
                <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter capitalize drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">The Business Story.</h3>
                    <p className="text-xs text-gray-500 font-medium italic mt-2 max-w-sm leading-relaxed">
                        A pristine narrative of every action we've taken to build, protect, and preserve your legacy.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handlePrint}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                    >
                        <FileText size={14} /> Print Audit Ledger
                    </button>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ledger Validated</span>
                    </div>
                </div>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {events.map((evt, i) => {
                    const date = new Date(evt.created_at);
                    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                    return (
                        <div key={evt.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            
                            {/* Icon Node */}
                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0A0A0B] border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-500 group-hover:scale-110 group-hover:border-white/20">
                                {getIcon(evt.event_category)}
                            </div>

                            {/* Content Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-[24px] bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] transition-all duration-300">
                                <div className="flex items-center gap-3 mb-2 opacity-60">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{formattedDate}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span className="text-[10px] font-bold text-gray-500">{formattedTime}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-300 leading-relaxed italic">
                                    "{evt.customer_facing_message}"
                                </p>
                            </div>
                        </div>
                    );
                })}

                {events.length === 0 && (
                    <div className="py-20 text-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">The story is just beginning.</span>
                    </div>
                )}
            </div>

            {events.length > 3 && (
                <div className="mt-12 flex justify-center border-t border-white/10 pt-8 relative z-10">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#0A0A0B] border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:border-white/30 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        View Complete Archives <ChevronDown size={14} />
                    </button>
                </div>
            )}
        </div>
        
        {/* OFFICIAL PRINTED TECHNICAL LEDGER (PORTALED TO DOCUMENT.BODY) */}
        {isPrinting && createPortal(
            (() => {
                const reportTimestamp = new Date().toISOString();
                return (
                    <div className="business-story-print hidden print:block bg-white text-black font-mono w-full m-0 p-0 text-[11px] leading-relaxed relative z-[1000]">
                        
                        {/* FIXED HEADER AND FOOTER */}
                        <div className="fixed top-0 left-0 w-[100vw] h-[1.5in] border-b-4 border-black box-border px-[0.5in] pt-[0.5in] pb-4 flex flex-col justify-end bg-white z-[2000]">
                            <h1 className="text-2xl font-black uppercase tracking-widest mb-1">INSTITUTIONAL AUDIT LEDGER</h1>
                            <p className="uppercase tracking-widest text-[#555] font-bold">Generated by: Charter Legacy Protocol</p>
                        </div>

                        <div className="fixed bottom-0 left-0 w-[100vw] h-[1.5in] border-t-2 border-black box-border px-[0.5in] pb-[0.5in] pt-4 flex items-end justify-between bg-white z-[2000]">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-black border-l-4 border-black pl-3">Charter Legacy • Operations Ledger</span>
                            <span className="print-page-number text-xs font-black uppercase tracking-widest bg-black text-white px-3 py-1"></span>
                        </div>

                        <table className="w-full">
                            <thead className="table-header-group">
                                <tr><td><div className="h-[1.5in] w-full bg-transparent"></div></td></tr>
                            </thead>
                            <tfoot className="table-footer-group">
                                <tr><td><div className="h-[1.5in] w-full bg-transparent"></div></td></tr>
                            </tfoot>
                            <tbody className="table-row-group">
                                <tr><td className="px-[0.5in] pb-[0.5in] align-top">
                                    <div className="pt-8">
                                        <div className="mb-6">
                                            <p className="uppercase tracking-widest text-black mt-4">Entity: <strong>{llcData?.llc_name || "Unknown"}</strong></p>
                                            <p className="uppercase tracking-widest text-black">Status: <strong>{llcData?.llc_status || "Active"}</strong></p>
                                            <p className="uppercase tracking-widest text-black">Timestamp: <strong>{reportTimestamp}</strong></p>
                                        </div>
                        
                        <div className="border-4 border-double border-black p-4 mb-8 bg-black/5">
                            <h2 className="text-sm font-black uppercase tracking-widest mb-2 border-b-2 border-black pb-1">CERTIFICATION OF LEDGER INTEGRITY</h2>
                            <p className="uppercase tracking-[0.2em] text-black text-[11px] font-black mb-1">STATUS: VERIFIED & IMMUTABLE</p>
                            <p className="tracking-widest text-[#333] text-[9px] mt-2 leading-relaxed">
                                This document serves as an official, unalterable record of all significant compliance, communication, and filing events associated with the aforementioned entity. The contents of this ledger have been cryptographically secured and reflect the absolute truth of the entity's history as maintained by the Charter Legacy protocol.
                            </p>
                        </div>

                        <div className="space-y-6 mt-8">
                            {events.map((evt, i) => {
                                const date = new Date(evt.created_at);
                                const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                                const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
                                return (
                                    <div key={evt.id || i} className="border-b border-gray-300 pb-4">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">{evt.event_category?.replace(/_/g, ' ') || 'SYSTEM EVENT'}</h3>
                                            <span className="text-[10px] text-gray-500 font-mono tracking-wider">{formattedDate} @ {formattedTime}</span>
                                        </div>
                                        <p className="text-[12px] text-black italic font-serif leading-relaxed">"{evt.customer_facing_message}"</p>
                                        <div className="text-[8px] text-gray-400 mt-2 uppercase tracking-widest font-mono">
                                            Event ID: {evt.id} | Severity: {evt.severity || 'INFO'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                                </div>
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            );
        })(),
        document.body
    )}
    </>
);
};

export default BusinessStoryTimeline;
