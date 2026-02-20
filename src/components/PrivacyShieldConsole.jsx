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
    { label: 'Whitepages', status: 'Removed — Confirmed', type: 'ok' },
    { label: 'Spokeo', status: 'Removed — Confirmed', type: 'ok' },
    { label: 'BeenVerified', status: 'Removal Pending (2-3 days)', type: 'pending' },
    { label: 'Intelius', status: 'Removed — Confirmed', type: 'ok' },
    { label: 'PeopleFinder', status: 'Scan Queued', type: 'pending' },
    { label: 'MyLife', status: 'Removed — Confirmed', type: 'ok' },
];

const ACCOMPLISHMENTS = [
    { date: 'Feb 14, 2026', event: '4 Broker Removals Confirmed', detail: 'Whitepages, Spokeo, Intelius, MyLife cleared.' },
    { date: 'Feb 10, 2026', event: 'Address Leak Scan Completed', detail: 'No residential address found in public index.' },
    { date: 'Feb 05, 2026', event: 'Privacy Shield Deployed', detail: 'Ownership records removed from Sunbiz public view.' },
    { date: 'Jan 28, 2026', event: 'Initial Broker Scan Run', detail: '12 brokers scanned, 6 removal requests submitted.' },
];

const ACTIONS = [
    { label: 'Run New Broker Scan', desc: 'Check all 50+ data brokers for new listings', cta: 'Scan Now', urgent: false, accent: 'purple' },
    { label: 'Request Manual Removal', desc: 'Submit a manual opt-out for a specific broker', cta: 'Request', urgent: false, accent: 'slate' },
    { label: 'View Full Exposure Report', desc: 'See every record found and its removal status', cta: 'View', urgent: false, accent: 'slate' },
    { label: 'Enable SMS Breach Alerts', desc: 'Get notified instantly if your info reappears', cta: 'Enable', urgent: true, accent: 'purple' },
];

const StatusDot = ({ type }) => {
    if (type === 'ok') return <span className="w-2 h-2 rounded-full bg-[#00D084] inline-block" />;
    return <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />;
};

const PrivacyShieldConsole = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [privacyBlur, setPrivacyBlur] = useState(true);

    const removedCount = MONITORING.filter(m => m.type === 'ok').length;
    const pendingCount = MONITORING.filter(m => m.type === 'pending').length;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-10 py-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white">
                            <Fingerprint size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-600">Privacy Shield Console</p>
                            <h2 className="text-lg font-black text-slate-900 leading-none">Owner Identity Protection</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPrivacyBlur(!privacyBlur)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            {privacyBlur ? <EyeOff size={12} className="text-gray-500" /> : <Eye size={12} className="text-gray-500" />}
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-500">{privacyBlur ? 'Show Data' : 'Hide Data'}</span>
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                            <Activity size={10} className="text-purple-600" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-purple-600">Sentinel Active</span>
                        </div>
                        <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors">
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-52 border-r border-gray-100 p-6 flex flex-col gap-1 shrink-0">
                        {NAV_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-left ${activeTab === tab.id ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-slate-900 hover:bg-gray-50'}`}
                            >
                                <tab.icon size={15} />
                                {tab.label}
                            </button>
                        ))}

                        {/* Stats */}
                        <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Removed</p>
                                <p className="text-2xl font-black text-[#00D084]">{removedCount}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Pending</p>
                                <p className="text-2xl font-black text-amber-400">{pendingCount}</p>
                            </div>
                        </div>
                    </aside>

                    {/* Main */}
                    <main className="flex-1 overflow-y-auto p-8 space-y-8">

                        {/* Owner Info */}
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">O</div>
                            <div>
                                <p className={`text-sm font-black text-slate-900 transition-all ${privacyBlur ? 'blur-md select-none' : ''}`}>Owner Name Redacted</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">Identity Protected — Shield Level: Maximum</p>
                            </div>
                        </div>

                        {/* BROKER MONITORING */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4">Data Broker Monitoring</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {MONITORING.map((item, i) => (
                                    <div key={i} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{item.label}</p>
                                            <p className="text-[10px] text-gray-400">{item.status}</p>
                                        </div>
                                        <StatusDot type={item.type} />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ACCOMPLISHMENTS */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4">Accomplishments</h3>
                            <div className="space-y-3">
                                {ACCOMPLISHMENTS.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center shrink-0 pt-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                                            {i < ACCOMPLISHMENTS.length - 1 && <div className="w-px bg-gray-100 mt-1 h-8" />}
                                        </div>
                                        <div className="pb-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">{item.date}</p>
                                            <p className="text-sm font-black text-slate-900">{item.event}</p>
                                            <p className="text-xs text-gray-400">{item.detail}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ACTIONS */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4">Available Actions</h3>
                            <div className="space-y-3">
                                {ACTIONS.map((action, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${action.urgent ? 'border-purple-200 bg-purple-50' : 'border-gray-100 bg-white hover:shadow-md'}`}>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{action.label}</p>
                                            <p className="text-[10px] text-gray-400">{action.desc}</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-all ${action.urgent ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-900 text-white hover:bg-purple-600'}`}>
                                            {action.cta} <ArrowRight size={12} />
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
