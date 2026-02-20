import React, { useState } from 'react';
import {
    X, Shield, CheckCircle2, Clock, AlertCircle, FileText,
    Building2, ArrowRight, Download, RefreshCw, ChevronRight,
    Activity, Calendar, Zap, Lock
} from 'lucide-react';

const NAV_TABS = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle2 },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Lock },
];

const MONITORING = [
    { label: 'Annual Report', status: 'Due May 1, 2026', type: 'warning', icon: Calendar },
    { label: 'Registered Agent', status: 'Active — Charter Legacy LLC', type: 'ok', icon: Shield },
    { label: 'Sunbiz Standing', status: 'Good Standing — Verified', type: 'ok', icon: CheckCircle2 },
    { label: 'BOI Filing', status: 'Filed — FinCEN Confirmed', type: 'ok', icon: FileText },
];

const TIMELINE = [
    { date: 'Feb 12, 2026', event: 'Privacy Shield Deployed', detail: 'Ownership records shielded from public index.' },
    { date: 'Jan 28, 2026', event: 'Registered Agent Activated', detail: 'Charter Legacy LLC assigned as statutory RA.' },
    { date: 'Jan 15, 2026', event: 'Entity Formation Complete', detail: 'Articles of Organization filed with Sunbiz.' },
    { date: 'Jan 10, 2026', event: 'BOI Report Submitted', detail: 'Beneficial Ownership filed with FinCEN.' },
];

const ACTIONS = [
    { label: 'File Annual Report', desc: 'Due May 1, 2026 — avoid $400 late fee', cta: 'File Now', urgent: true },
    { label: 'Download Articles of Organization', desc: 'Official formation document from Sunbiz', cta: 'Download', urgent: false },
    { label: 'Update Registered Agent', desc: 'Change or verify RA information', cta: 'Update', urgent: false },
    { label: 'Open BOI Filing', desc: 'View or amend your FinCEN report', cta: 'View', urgent: false },
];

const StatusBadge = ({ type }) => {
    if (type === 'ok') return (
        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[#00D084]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] inline-block" /> Active
        </span>
    );
    return (
        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" /> Action Needed
        </span>
    );
};

const EntityShieldConsole = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300">
            <div className="w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-10 py-6 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600">Entity Shield Console</p>
                            <h2 className="text-lg font-black text-slate-900 leading-none">Legal Entity Protection</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00D084]/10 rounded-full">
                            <Activity size={10} className="text-[#00D084]" />
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#00D084]">Active & Good Standing</span>
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
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-left ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-slate-900 hover:bg-gray-50'}`}
                            >
                                <tab.icon size={15} />
                                {tab.label}
                            </button>
                        ))}
                        <div className="mt-auto pt-6 border-t border-gray-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 mb-1">Console ID</p>
                            <p className="text-xs font-mono text-blue-600">ES-FL-001</p>
                        </div>
                    </aside>

                    {/* Main */}
                    <main className="flex-1 overflow-y-auto p-8 space-y-8">

                        {/* MONITORING */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4">Live Monitoring</h3>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {MONITORING.map((item, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${item.type === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-white text-blue-600 shadow-sm'}`}>
                                            <item.icon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{item.label}</p>
                                            <StatusBadge type={item.type} />
                                            <p className="text-[10px] text-gray-400 mt-0.5">{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* TIMELINE */}
                        <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-4">Accomplishments</h3>
                            <div className="space-y-3">
                                {TIMELINE.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="flex flex-col items-center shrink-0 pt-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1 h-8" />}
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
                                    <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${action.urgent ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white hover:shadow-md'} transition-all`}>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{action.label}</p>
                                            <p className="text-[10px] text-gray-400">{action.desc}</p>
                                        </div>
                                        <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-all ${action.urgent ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-900 text-white hover:bg-blue-600'}`}>
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

export default EntityShieldConsole;
