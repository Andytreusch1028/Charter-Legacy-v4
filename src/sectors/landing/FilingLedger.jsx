import React, { useEffect, useState, useMemo } from 'react';
import { Shield, Zap, Globe, Activity } from 'lucide-react';

/**
 * FilingLedger
 * Provides operational transparency (Steve's Review) for the CharterLegacy 10/10 Evolution.
 * Components:
 *  1. Anonymized scrolling ticker of recent "Events".
 *  2. Real-time formation throughput simulation.
 */
const FilingLedger = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const events = useMemo(() => [
        { city: 'MIAMI', type: 'LLC_FORMATION', status: 'SECURED', id: 'CL-892' },
        { city: 'ORLANDO', type: 'PRIVACY_SHIELD', status: 'ACTIVE', id: 'CL-114' },
        { city: 'TAMPA', type: 'DOUBLE_LLC', status: 'FILING', id: 'CL-441' },
        { city: 'JACKSONVILLE', type: 'VAULT_SYNC', status: 'ENCRYPTED', id: 'CL-705' },
        { city: 'TALLAHASSEE', type: 'LLC_FORMATION', status: 'SECURED', id: 'CL-327' },
        { city: 'DELAND', type: 'SYSTEM_AUDIT', status: 'PASS', id: 'CL-055' },
        { city: 'FORT LAUDERDALE', type: 'PRIVACY_SHIELD', status: 'SECURED', id: 'CL-922' }
    ], []);

    return (
        <div className="w-full h-12 bg-white/[0.02] border-y border-white/[0.05] backdrop-blur-md overflow-hidden flex items-center">
            {/* 1. System Pulse Label */}
            <div className="h-full px-6 flex items-center gap-3 bg-white/[0.03] border-r border-white/[0.05] shrink-0">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500">Operational</span>
            </div>

            {/* 2. Scrolling Ticker Content */}
            <div className="flex-1 overflow-hidden relative">
                <div className="flex items-center gap-12 animate-marquee whitespace-nowrap px-8">
                    {/* Duplicate events to create seamless loop */}
                    {[...events, ...events].map((event, idx) => (
                        <div key={idx} className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-gray-500 hover:text-white transition-colors cursor-default">
                            <span className="text-gray-700">[{currentTime.toLocaleTimeString([], { hour12: false })}]</span>
                            <span className="font-bold text-gray-400">{event.city}</span>
                            <span className="px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5 text-[9px] text-gray-400">{event.type}</span>
                            <span className={`${event.status === 'SECURED' ? 'text-emerald-500' : 'text-blue-500'} font-bold`}>{event.status}</span>
                            <span className="text-[9px] text-gray-800 italic">{event.id}</span>
                        </div>
                    ))}
                </div>
                
                {/* 3. Gradient Fades for Smoothness */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050506] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050506] to-transparent z-10 pointer-events-none" />
            </div>

            {/* 4. Infrastructure Pulse (Steve) */}
            <div className="hidden lg:flex h-full px-8 items-center gap-6 border-l border-white/[0.05] text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                <div className="flex items-center gap-2">
                    <Zap size={12} className="text-amber-400" />
                    <span>L: 14ms</span>
                </div>
                <div className="flex items-center gap-2">
                    <Globe size={12} className="text-blue-400" />
                    <span>Filing: Active</span>
                </div>
            </div>

            {/* CSS Marquee Animation */}
            <style jsx>{`
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    display: inline-flex;
                }
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default FilingLedger;
