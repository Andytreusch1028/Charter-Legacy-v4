import React, { useState } from 'react';
import {
    X, Fingerprint, CheckCircle2, Activity, ArrowRight,
    Eye, EyeOff, Shield, AlertTriangle, Bell, RefreshCw, Lock
} from 'lucide-react';

const NAV_TABS = [
    { id: 'overview', label: 'Overview', icon: Fingerprint },
    { id: 'broker', label: 'Broker Shield', icon: Shield },
    { id: 'exposure', label: 'Exposure Report', icon: Eye },
    { id: 'alerts', label: 'Alerts', icon: Bell },
];

const MONITORING = [
    { label: 'Whitepages', status: 'Opt-Out Processed', type: 'ok' },
    { label: 'Spokeo', status: 'Opt-Out Processed', type: 'ok' },
    { label: 'BeenVerified', status: 'Removal Pending (2-3 days)', type: 'pending' },
    { label: 'Intelius', status: 'Opt-Out Processed', type: 'ok' },
    { label: 'PeopleFinder', status: 'Scan Queued', type: 'pending' },
    { label: 'MyLife', status: 'Opt-Out Processed', type: 'ok' },
];

const ACCOMPLISHMENTS = [
    { date: 'Feb 14, 2026', event: '4 Broker Opt-Outs Confirmed', detail: 'Whitepages, Spokeo, Intelius, MyLife cleared.' },
    { date: 'Feb 10, 2026', event: 'Address Leak Scan Completed', detail: 'No residential address found in primary index.' },
    { date: 'Feb 05, 2026', event: 'Information Shield Activated', detail: 'Business address updated to DeLand hub.' },
    { date: 'Jan 28, 2026', event: 'Initial Broker Scan Run', detail: '12 brokers scanned, 6 removal requests submitted.' },
];

const ACTIONS = [
    { label: 'Run New Broker Scan', desc: 'Check all 50+ data brokers for new listings', cta: 'Scan Now', urgent: false, accent: 'luminous-blue' },
    { label: 'Request Manual Removal', desc: 'Submit a manual opt-out for a specific broker', cta: 'Request', urgent: false, accent: 'white' },
    { label: 'View Full Exposure Report', desc: 'See every record found and its removal status', cta: 'View', urgent: false, accent: 'white' },
    { label: 'Enable SMS Breach Alerts', desc: 'Get notified instantly if your info reappears', cta: 'Enable', urgent: true, accent: 'luminous-blue' },
];

const StatusDot = ({ type }) => {
    if (type === 'ok') return <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] inline-block" />;
    return <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] inline-block animate-pulse" />;
};

const PrivacyShieldConsole = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [privacyBlur, setPrivacyBlur] = useState(true);

    const removedCount = MONITORING.filter(m => m.type === 'ok').length;
    const pendingCount = MONITORING.filter(m => m.type === 'pending').length;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" onClick={onClose} />
            
            <div className="relative z-10 w-full max-w-6xl h-[90vh] rounded-[48px] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-3xl">

                {/* Header */}
                <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 shrink-0 bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-luminous-blue shadow-[0_0_20px_rgba(0,122,255,0.1)]">
                            <Fingerprint size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-luminous-blue animate-pulse"/>
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Privacy Shield Protocol</p>
                            </div>
                            <h2 className="text-2xl font-light text-white leading-none tracking-tight">Identity Abstraction <span className="text-gray-500 font-medium">Console.</span></h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setPrivacyBlur(!privacyBlur)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-300"
                        >
                            {privacyBlur ? <EyeOff size={14} className="text-gray-400" /> : <Eye size={14} className="text-gray-400" />}
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                {privacyBlur ? 'Reveal Data' : 'Conceal Data'}
                            </span>
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-luminous-blue/10 border border-luminous-blue/20 rounded-full">
                            <Activity size={12} className="text-luminous-blue" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue">Sentinel Active</span>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300">
                            <X size={18} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-64 border-r border-white/5 p-6 flex flex-col gap-2 shrink-0 bg-black/40 overflow-y-auto no-scrollbar">
                        {NAV_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all text-left ${
                                    activeTab === tab.id 
                                        ? 'bg-luminous-blue/10 text-luminous-blue border border-luminous-blue/20 shadow-[0_0_20px_rgba(0,122,255,0.1)]' 
                                        : 'text-gray-500 border border-transparent hover:text-white hover:bg-white/5 hover:border-white/10'
                                }`}
                            >
                                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
                                {tab.label}
                            </button>
                        ))}

                        {/* Stats */}
                        <div className="mt-auto pt-8 border-t border-white/10 space-y-6">
                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/80 mb-1">Scrubbed</p>
                                <p className="text-4xl font-light text-emerald-400">{removedCount}</p>
                            </div>
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80 mb-1">Queue</p>
                                <p className="text-4xl font-light text-amber-400">{pendingCount}</p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Pane */}
                    <main className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-12 bg-black/20 relative">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-luminous-blue/5 rounded-full blur-[100px] pointer-events-none" />

                        {/* Owner Info Bar */}
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center gap-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-xl">
                            <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-gray-800 to-black border border-white/10 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                O
                            </div>
                            <div>
                                <p className={`text-xl font-medium text-white tracking-wide transition-all duration-500 ${privacyBlur ? 'blur-md select-none opacity-50' : ''}`}>
                                    Owner Name Redacted
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-luminous-blue shadow-[0_0_8px_rgba(0,122,255,0.8)]" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-luminous-blue">Abstraction Active</p>
                                </div>
                            </div>
                        </div>

                        {/* BROKER MONITORING */}
                        <section>
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-3">
                                <div className="w-12 h-px bg-white/10" /> Data Broker Monitoring
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {MONITORING.map((item, i) => (
                                    <div key={i} className="p-5 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm flex items-center justify-between gap-4 hover:border-white/10 hover:bg-white/10 transition-colors duration-300">
                                        <div>
                                            <p className="text-[13px] font-bold text-white tracking-wide">{item.label}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 font-medium">{item.status}</p>
                                        </div>
                                        <StatusDot type={item.type} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ACTIVITY LOG */}
                        <section>
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-3">
                                <div className="w-12 h-px bg-white/10" /> System Activity Log
                            </h3>
                            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                                {ACCOMPLISHMENTS.map((item, i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-black text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:border-luminous-blue/50 group-hover:text-luminous-blue transition-colors duration-500">
                                            <div className="w-2 h-2 bg-gray-600 rounded-full group-hover:bg-luminous-blue transition-colors duration-500 group-hover:shadow-[0_0_10px_rgba(0,122,255,0.8)]" />
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm group-hover:border-white/10 group-hover:bg-white/10 transition-all duration-300">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-white text-[13px] tracking-wide">{item.event}</h4>
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">{item.date}</p>
                                            <p className="text-[12px] text-gray-400 font-light leading-relaxed">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ACTIONS */}
                        <section>
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-3">
                                <div className="w-12 h-px bg-white/10" /> Available Actions
                            </h3>
                            <div className="space-y-4">
                                {ACTIONS.map((action, i) => (
                                    <div key={i} className={`p-6 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-500 ${
                                        action.urgent 
                                            ? 'border-luminous-blue/30 bg-luminous-blue/5 shadow-[0_0_30px_rgba(0,122,255,0.1)]' 
                                            : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                                    }`}>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                {action.urgent && <div className="w-2 h-2 rounded-full bg-luminous-blue shadow-[0_0_8px_rgba(0,122,255,0.8)] animate-pulse" />}
                                                <p className="text-[14px] font-bold text-white tracking-wide">{action.label}</p>
                                            </div>
                                            <p className="text-[12px] font-light text-gray-400">{action.desc}</p>
                                        </div>
                                        <button className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-2 transition-all duration-300 shadow-lg ${
                                            action.urgent 
                                                ? 'bg-luminous-blue text-white hover:bg-luminous-blue/80 hover:shadow-[0_0_20px_rgba(0,122,255,0.4)]' 
                                                : 'bg-white/10 text-white hover:bg-white hover:text-black border border-white/10'
                                        }`}>
                                            {action.cta} <ArrowRight size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default PrivacyShieldConsole;
