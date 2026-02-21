import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Download, Mail, Archive, Filter,
    ChevronDown, CheckCircle2, XCircle, Clock,
    Shield, AlertTriangle, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Event display config ─────────────────────────────────────────────────────
const EVENT_CONFIG = {
    DOC_VIEWED:              { label: 'Document Viewed',          icon: Eye,           color: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-200' },
    DOWNLOAD_REQUESTED:      { label: 'Download Requested',       icon: Download,      color: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-200' },
    DOWNLOAD_URL_ISSUED:     { label: 'Download Link Issued',     icon: Download,      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    EMAIL_REQUESTED:         { label: 'Email Requested',          icon: Mail,          color: 'text-purple-500',  bg: 'bg-purple-50',  border: 'border-purple-200' },
    ZIP_DOWNLOAD_REQUESTED:  { label: 'ZIP Download Requested',   icon: Archive,       color: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-200' },
    ZIP_EMAIL_REQUESTED:     { label: 'ZIP Email Requested',      icon: Archive,       color: 'text-purple-500',  bg: 'bg-purple-50',  border: 'border-purple-200' },
    DOC_RECEIVED:            { label: 'Document Received at Hub', icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    DOC_SCANNED:             { label: 'Document Scanned to PDF',  icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    DOC_MADE_AVAILABLE:      { label: 'Made Available in Vault',  icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    AVAILABILITY_EMAIL_SENT: { label: 'Availability Email Sent',  icon: Mail,          color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    EMAIL_DELIVERY_CONFIRMED:{ label: 'Email Delivery Confirmed', icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    EMAIL_DELIVERY_FAILED:   { label: 'Email Delivery Failed',    icon: XCircle,       color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-200' },
    EMAIL_OPENED:            { label: 'Email Opened by User',     icon: Eye,           color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    EMAIL_SENT:              { label: 'Document Email Sent',      icon: Mail,          color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    ZIP_GENERATED:           { label: 'ZIP Archive Created',      icon: Archive,       color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    ZIP_EMAIL_SENT:          { label: 'ZIP Email Sent',           icon: Mail,          color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    ZIP_DOWNLOAD_URL_ISSUED: { label: 'ZIP Download Link Issued', icon: Archive,       color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    URGENT_SMS_QUEUED:       { label: 'Urgent SMS Queued',        icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200' },
    URGENT_SMS_SENT:         { label: 'Urgent SMS Sent',          icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    URGENT_SMS_DELIVERED:    { label: 'Urgent SMS Delivered',     icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    ADMIN_DOC_UPLOADED:      { label: 'Admin: Document Uploaded', icon: CheckCircle2,  color: 'text-gray-500',    bg: 'bg-gray-50',    border: 'border-gray-200' },
    ADMIN_DOC_DELETED:       { label: 'Admin: Document Removed',  icon: XCircle,       color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-200' },
    ADMIN_AUDIT_EXPORTED:    { label: 'Admin: Audit Exported',    icon: Download,      color: 'text-gray-500',    bg: 'bg-gray-50',    border: 'border-gray-200' },
};

const ACTOR_BADGE = {
    USER:          { label: 'You',            bg: 'bg-blue-100 text-blue-700' },
    SYSTEM:        { label: 'Charter Legacy', bg: 'bg-emerald-100 text-emerald-700' },
    CHARTER_ADMIN: { label: 'CL Staff',       bg: 'bg-purple-100 text-purple-700' },
};

const OUTCOME_BADGE = {
    SUCCESS: 'bg-emerald-100 text-emerald-700',
    FAILURE: 'bg-red-100 text-red-700',
    PENDING: 'bg-amber-100 text-amber-700',
};

function maskIp(ip) {
    if (!ip) return '—';
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
    return ip.substring(0, 8) + '…';
}

function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    });
}

function exportCsv(rows, isAdmin) {
    const headers = isAdmin
        ? ['Timestamp (UTC)', 'Action', 'Actor Type', 'Actor Email', 'Document ID', 'Outcome', 'IP Address', 'User Agent', 'Metadata']
        : ['Timestamp', 'Action', 'Actor', 'Outcome', 'IP (Masked)'];

    const lines = rows.map(r => {
        const cfg = EVENT_CONFIG[r.action] || {};
        if (isAdmin) {
            return [r.created_at, r.action, r.actor_type, r.actor_email || '', r.document_id || '', r.outcome, r.ip_address || '', r.user_agent || '', JSON.stringify(r.metadata || {})]
                .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        }
        return [formatDateTime(r.created_at), cfg.label || r.action, ACTOR_BADGE[r.actor_type]?.label || r.actor_type, r.outcome, maskIp(r.ip_address)]
            .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charter-legacy-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Single audit row ─────────────────────────────────────────────────────────
const AuditRow = ({ row, isAdmin, isExpanded, onToggle }) => {
    const cfg = EVENT_CONFIG[row.action] || { label: row.action, icon: ClipboardList, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
    const Icon = cfg.icon;
    const actor = ACTOR_BADGE[row.actor_type] || { label: row.actor_type, bg: 'bg-gray-100 text-gray-600' };

    return (
        <div className={`border rounded-2xl overflow-hidden transition-all ${cfg.border}`}>
            <div onClick={onToggle} className={`flex items-center gap-4 p-4 cursor-pointer ${cfg.bg} hover:opacity-90 transition-opacity`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-xs font-black ${cfg.color}`}>{cfg.label}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${actor.bg}`}>{actor.label}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${OUTCOME_BADGE[row.outcome]}`}>{row.outcome}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{formatDateTime(row.created_at)}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {isExpanded && (
                <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                    {row.metadata && Object.keys(row.metadata).length > 0 && (
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Details</p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(row.metadata).map(([k, v]) => (
                                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{k.replace(/_/g, ' ')}</p>
                                        <p className="text-xs font-mono text-gray-700 mt-0.5 break-all">{String(v)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">IP Address</p>
                            <p className="text-xs font-mono text-gray-700 mt-0.5">{isAdmin ? (row.ip_address || '—') : maskIp(row.ip_address)}</p>
                        </div>
                        {isAdmin && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Actor Email</p>
                                <p className="text-xs font-mono text-gray-700 mt-0.5">{row.actor_email || '—'}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main export ──────────────────────────────────────────────────────────────
const RADocumentAuditLog = ({ isAdmin = false }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [expandedId, setExpandedId] = useState(null);

    const FILTERS = [
        { value: 'ALL',    label: 'All Events' },
        { value: 'USER',   label: 'Your Actions' },
        { value: 'SYSTEM', label: 'System' },
        { value: 'ADMIN',  label: 'Admin/Staff' },
        { value: 'FAILURE',label: 'Failures' },
        { value: 'URGENT', label: 'Urgent' },
    ];

    useEffect(() => {
        load();
    }, [filter, dateRange.start, dateRange.end]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(load, 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    async function load() {
        setLoading(true);
        try {
            let query = supabase
                .from('ra_document_audit')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);

            // Apply Filters
            if (filter !== 'ALL') {
                if (filter === 'FAILURE') query = query.eq('outcome', 'FAILURE');
                else if (filter === 'URGENT') query = query.like('action', '%URGENT%');
                else if (filter === 'ADMIN') query = query.eq('actor_type', 'CHARTER_ADMIN');
                else query = query.eq('actor_type', filter);
            }

            // Apply Search (using GIN-indexed FTS column)
            if (searchQuery.trim()) {
                const term = searchQuery.trim();
                // If it's a single word, textSearch is great. 
                // For phrases, we use the 'fts' column with ' & ' logic
                const searchTerms = term.split(/\s+/).join(' & ');
                query = query.textSearch('fts', searchTerms, {
                    config: 'english',
                    type: 'phrase'
                });
            }

            // Apply Date Range
            if (dateRange.start) query = query.gte('created_at', new Date(dateRange.start).toISOString());
            if (dateRange.end) query = query.lte('created_at', new Date(dateRange.end + 'T23:59:59').toISOString());

            const { data, error } = await query;
            if (error) throw error;
            setRows(data || []);
        } catch (err) {
            console.error('Audit Load Error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-[#1D1D1F]">Audit Log.</h3>
                    <p className="text-gray-500 font-medium italic mt-1">
                        {isAdmin ? 'Complete tamper-proof record of all document events.' : 'Every action on your documents, timestamped and permanent.'}
                    </p>
                </div>
                <div className="flex gap-2">
                     <button
                        onClick={load}
                        className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-luminous-blue transition-colors"
                        title="Refresh Log"
                    >
                        <Clock size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={async () => {
                            if (rows.length === 0) return;
                            setLoading(true);
                            try {
                                const { data: { user } } = await supabase.auth.getUser();
                                await supabase.functions.invoke('ra-document-action', {
                                    body: {
                                        action: 'EMAIL_AUDIT_LOG',
                                        data: {
                                            recipient: user.email,
                                            rows: rows.slice(0, 50), // Limit for email readability
                                            filterContext: filter
                                        }
                                    }
                                });
                                alert(`Audit Log Summary (last 50 matches) sent to ${user.email}`);
                            } catch (err) {
                                alert('Failed to send email: ' + err.message);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-luminous-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-hacker-blue transition-colors"
                    >
                        <Mail size={12} /> Email Report
                    </button>
                    <button
                        onClick={() => exportCsv(rows, isAdmin)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#1D1D1F] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                    >
                        <Download size={12} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <Shield size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                    This log is <strong>append-only and tamper-proof</strong>. No entry can ever be modified or deleted.
                    It serves as contemporaneous legal evidence of all actions taken on your documents.
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 focus-within:ring-2 focus-within:ring-luminous-blue/20 focus-within:border-luminous-blue transition-all">
                    <Filter size={14} className="text-gray-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search actions, emails, or outcomes..."
                        className="bg-transparent border-none outline-none text-xs font-medium w-full placeholder:text-gray-400"
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600"><XCircle size={14} /></button>}
                </div>
                
                <div className="flex gap-2 items-center">
                    <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold uppercase text-gray-500 outline-none focus:ring-2 focus:ring-luminous-blue/20"
                    />
                    <span className="text-gray-300 font-black">-</span>
                    <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[10px] font-bold uppercase text-gray-500 outline-none focus:ring-2 focus:ring-luminous-blue/20"
                    />
                </div>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
                {FILTERS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filter === opt.value ? 'bg-[#1D1D1F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400">{rows.length} events found</span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 gap-3">
                    <div className="w-5 h-5 border-2 border-luminous-blue border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading audit log...</p>
                </div>
            ) : rows.length === 0 ? (
                <div className="text-center py-16">
                    <ClipboardList size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No matching events</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search filters.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {rows.map(row => (
                        <AuditRow
                            key={row.id}
                            row={row}
                            isAdmin={isAdmin}
                            isExpanded={expandedId === row.id}
                            onToggle={() => setExpandedId(expandedId === row.id ? null : row.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RADocumentAuditLog;
