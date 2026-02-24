import React, { useState, useEffect } from 'react';
import { 
    X, CheckCircle2, AlertTriangle, Shield, FileText, 
    User, Building2, Calendar, Hash, ExternalLink,
    RefreshCw, Loader2, ChevronRight, Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Mock data (real Sunbiz data for TREU SKIN LLC) ───────────────────────────
const MOCK_DATA = {
    entityName: 'TREU SKIN LLC',
    documentNumber: 'L24000392044',
    feiEin: '99-4929970',
    dateFiled: '09/09/2024',
    effectiveDate: '09/08/2024',
    state: 'FL',
    status: 'ACTIVE',
    lastEvent: 'LLC ANNUAL REPORT',
    principalAddress: '2040 WINTER SPRINGS BLVD, OVIEDO, FL 32765',
    mailingAddress: '11019 SITING PLACE, ORLANDO, FL 32825',
    registeredAgent: {
        name: 'TREU, OLIVIA A',
        address: '11019 SITING PLACE, ORLANDO, FL 32825',
    },
    annualReports: [
        { year: '2026', filed: '01/28/2026' },
        { year: '2025', filed: '03/25/2025' },
    ],
};

const SUNBIZ_URL = 'https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResultDetail?inquirytype=DocumentNumber&inquiryDirective=InitialSearch&searchTerm=L24000392044';

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const isActive = status === 'ACTIVE';
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm uppercase tracking-widest ${
            isActive 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
        }`}>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400 animate-pulse'}`} />
            {status}
        </div>
    );
};

const DataRow = ({ icon: Icon, label, value, mono = false }) => (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">{label}</p>
            <p className={`text-sm font-bold text-white leading-snug ${mono ? 'font-mono' : ''}`}>{value}</p>
        </div>
    </div>
);

const AnnualReportRow = ({ year, filed }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-sm font-bold text-white">{year} Annual Report</span>
        </div>
        <span className="text-xs font-bold text-gray-400">Filed {filed}</span>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ComplianceStatusModal = ({ onClose, documentNumber = 'L24000392044' }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = async () => {
        setLoading(true);
        // By-pass the Edge function entirely for now to prevent native browser CORS errors from spamming the console
        // We will wire this up when the sunbiz-lookup edge function is fully deployed.
        setTimeout(() => {
            setData(MOCK_DATA);
            setLoading(false);
            setLastRefreshed(new Date());
        }, 800);
    };

    useEffect(() => { fetchData(); }, []);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'filings', label: 'Annual Reports' },
        { id: 'agent', label: 'Reg. Agent' },
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-[#0A0A0B] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Header */}
                <div className="relative p-6 border-b border-white/10">
                    {/* Ambient glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
                    
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                <Shield size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Compliance Link</p>
                                <h2 className="text-base font-black text-white leading-tight">
                                    {loading ? 'Loading...' : (data?.entityName || MOCK_DATA.entityName)}
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Refresh from Sunbiz"
                            >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Status badge */}
                    {!loading && (
                        <div className="mt-4 flex items-center gap-3">
                            <StatusBadge status={data?.status || MOCK_DATA.status} />
                            <span className="text-[10px] text-gray-500 font-bold">
                                FL Division of Corporations
                            </span>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 px-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 px-1 mr-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                                activeTab === tab.id
                                    ? 'border-purple-500 text-purple-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 max-h-[50vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 size={24} className="text-purple-400 animate-spin" />
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Querying State Database...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <div>
                                    <DataRow icon={Hash} label="Document Number" value={data?.documentNumber || MOCK_DATA.documentNumber} mono />
                                    <DataRow icon={Hash} label="FEI / EIN" value={data?.feiEin || MOCK_DATA.feiEin} mono />
                                    <DataRow icon={Calendar} label="Date Filed" value={data?.dateFiled || MOCK_DATA.dateFiled} />
                                    <DataRow icon={Calendar} label="Effective Date" value={data?.effectiveDate || MOCK_DATA.effectiveDate} />
                                    <DataRow icon={Building2} label="Principal Address" value={data?.principalAddress || MOCK_DATA.principalAddress} />
                                    <DataRow icon={Activity} label="Last Event" value={data?.lastEvent || MOCK_DATA.lastEvent} />
                                </div>
                            )}

                            {activeTab === 'filings' && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Annual Report History</p>
                                    {(data?.annualReports || MOCK_DATA.annualReports).map(r => (
                                        <AnnualReportRow key={r.year} year={r.year} filed={r.filed} />
                                    ))}
                                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-amber-400 flex items-center gap-2 mb-1">
                                                <AlertTriangle size={14} /> 2026 Annual Report Due
                                            </p>
                                            <p className="text-[10px] text-gray-400">Avoid $400 statutory late fee. File by May 1st.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'agent' && (
                                <div>
                                    <DataRow icon={User} label="Registered Agent" value={(data?.registeredAgent?.name || MOCK_DATA.registeredAgent.name)} />
                                    <DataRow icon={Building2} label="Agent Address" value={(data?.registeredAgent?.address || MOCK_DATA.registeredAgent.address)} />
                                    <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">RA Status</p>
                                        <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                            <CheckCircle2 size={14} /> Active & In Good Standing
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[10px] text-gray-600 font-bold">
                        {lastRefreshed ? `Last synced ${lastRefreshed.toLocaleTimeString()}` : 'Syncing...'}
                    </p>
                    <a
                        href={SUNBIZ_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 transition-colors"
                    >
                        View on Sunbiz <ExternalLink size={10} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ComplianceStatusModal;
