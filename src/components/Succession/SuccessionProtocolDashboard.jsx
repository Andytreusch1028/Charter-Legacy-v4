import React, { useState, useEffect } from 'react';
import { 
    Shield, Users, Lock, Clock, GitBranch, 
    Check, ArrowRight, Plus, Trash2, 
    Info, Activity, Calendar, Zap, MousePointerClick, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { NotaryProvider } from '../../utils/notaryProvider';
import s from './SuccessionProtocolDashboard.module.css';

const SuccessionProtocolDashboard = ({ llc, onClose, logAction }) => {
    const [heirs, setHeirs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sealing, setSealing] = useState(false);
    const [threshold, setThreshold] = useState(llc?.inactivity_threshold_days || 90);
    const [auditLogs, setAuditLogs] = useState([]);
    const [parentName, setParentName] = useState('WYOMING HOLDINGS LLC');
    const [newHeir, setNewHeir] = useState({ name: '', email: '', role: 'Beneficiary', equity: '50' });
    // Trigger mode: 'manual' | 'scheduled' | 'inactivity'
    const [triggerMode, setTriggerMode] = useState('manual');
    const [activationDate, setActivationDate] = useState('');
    const [checkedIn, setCheckedIn] = useState(false);
    const [vatCode, setVatCode] = useState(null); // The Vault Access Token shown after sealing
    const [replacingToken, setReplacingToken] = useState(false);
    const [notifyOnChange, setNotifyOnChange] = useState(llc?.notify_heirs_on_succession_change ?? false);
    // isSealed: drives Token Management panel visibility. Initialize from DB field so returning users see it.
    const [isSealed, setIsSealed] = useState(!!llc?.succession_protocol_active);
    // UPL Consent Gate — must be checked before sealing
    const [uplConsented, setUplConsented] = useState(false);
    const [heirError, setHeirError] = useState(''); // inline error for add-heir form

    const handleCheckIn = () => {
        setCheckedIn(true);
        setTimeout(() => setCheckedIn(false), 3000);
        if (logAction) logAction('OWNER_CHECK_IN', 'SUCCESS', { timestamp: new Date().toISOString() });
    };

    useEffect(() => {
        fetchSuccessionData();
    }, [llc?.id]);

    const fetchSuccessionData = async () => {
        if (!llc?.id) return;
        setLoading(true);
        try {
            const { data: heirsData } = await supabase
                .from('succession_heirs')
                .select('*')
                .eq('llc_id', llc.id);
            
            const { data: logs } = await supabase
                .from('succession_audit_ledger')
                .select('*')
                .eq('llc_id', llc.id)
                .order('created_at', { ascending: false });

            // Fix 5: Dynamically resolve parent LLC name
            if (llc.parent_llc_id) {
                const { data: parent } = await supabase
                    .from('llcs')
                    .select('llc_name')
                    .eq('id', llc.parent_llc_id)
                    .single();
                if (parent?.llc_name) setParentName(parent.llc_name.toUpperCase());
            }

            if (heirsData) setHeirs(heirsData);
            if (logs) setAuditLogs(logs);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceToken = async () => {
        if (!window.confirm('This will permanently disable your current Vault Token and generate a new one. Anyone holding the old token will no longer be able to access the vault. Continue?')) return;
        setReplacingToken(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const bearer = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/replace-vault-token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bearer}`,
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ llcId: llc.id, reason: 'LOST_OR_STOLEN' }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setVatCode(data.newToken);
            await fetchSuccessionData();
            if (logAction) logAction('VAULT_TOKEN_REPLACED', 'SUCCESS', {});
        } catch (err) {
            alert(`Token replacement failed: ${err.message}`);
        } finally {
            setReplacingToken(false);
        }
    };

    const handleNotifyToggle = async () => {
        const newVal = !notifyOnChange;
        setNotifyOnChange(newVal);
        await supabase.from('llcs').update({ notify_heirs_on_succession_change: newVal }).eq('id', llc.id);
        if (logAction) logAction('NOTIFY_TOGGLE_CHANGED', 'SUCCESS', { notify: newVal });
    };

    const handleAddHeir = async () => {
        setHeirError('');
        if (!newHeir.name.trim() || !newHeir.email.trim()) {
            setHeirError('Name and email are required.');
            return;
        }

        // Supabase returns numeric columns as strings — always coerce to Number()
        const currentTotal = heirs.reduce((sum, h) => sum + Number(h.equity_percentage || 0), 0);
        const incoming = parseFloat(newHeir.equity);

        if (incoming <= 0) {
            setHeirError('Equity must be greater than 0%.');
            return;
        }
        if (currentTotal + incoming > 100) {
            const remaining = 100 - currentTotal;
            setHeirError(`Only ${remaining.toFixed(0)}% remaining. Reduce the equity allocation to ${remaining.toFixed(0)}% or less.`);
            return;
        }
        
        const { data, error } = await supabase
            .from('succession_heirs')
            .insert({
                llc_id: llc.id,
                heir_name: newHeir.name.trim(),
                heir_email: newHeir.email.trim(),
                heir_role: newHeir.role,
                equity_percentage: incoming,
                is_sealed: false,
            })
            .select()
            .single();

        if (!error && data) {
            setHeirs([...heirs, data]);
            setNewHeir({ name: '', email: '', role: 'Beneficiary', equity: '50' });
            setHeirError('');
            if (logAction) logAction('ADD_HEIR', 'SUCCESS', { heir: data.heir_name });
        } else if (error) {
            console.error('[AddHeir] DB error:', error.message);
            setHeirError(`Could not add successor: ${error.message}`);
        } else {
            setHeirError('Successor was not saved. Please try again.');
        }
    };

    const handleRemoveHeir = async (id) => {
        const { error } = await supabase
            .from('succession_heirs')
            .delete()
            .eq('id', id);
        
        if (!error) {
            setHeirs(heirs.filter(h => h.id !== id));
        }
    };

    const handleSealProtocol = async () => {
        setSealing(true);
        try {
            const hasCredits = await NotaryProvider.verifyCredits(llc.id);
            if (!hasCredits) {
                alert("Insufficient Notary Credits. Please top up your vault.");
                setSealing(false);
                return;
            }

            const result = await NotaryProvider.sealDocument({
                llcId: llc.id,
                heirs: heirs,
                parentLlcName: parentName
            });

            if (result.success) {
                // Download PDF
                const url = window.URL.createObjectURL(result.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Succession_Protocol_${llc.llc_name.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                // Show the Vault Access Token — the physical code for the heir
                if (result.vatCode) setVatCode(result.vatCode);
                setIsSealed(true); // ← unlock Token Management panel
                
                await fetchSuccessionData();
                if (logAction) logAction('SEAL_SUCCESSION_PROTOCOL', 'SUCCESS', { sealId: result.sealId });
            } else {
                alert(`Protocol Error: ${result.error}`);
            }
        } catch (err) {
            console.error("Sealing failed:", err);
            alert("Critical Error during sealing protocol.");
        } finally {
            setSealing(false);
        }
    };

    return (
        <div className={s.container}>
            <div className={s.neuralMesh} />

            {/* ── VAT Token Reveal Overlay ───────────────────────────────── */}
            {vatCode && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(5,5,6,0.92)', backdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 24,
                }}>
                    <div style={{
                        maxWidth: 480, width: '100%',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(80,255,209,0.2)',
                        borderRadius: 24, padding: 40,
                        boxShadow: '0 0 80px rgba(80,255,209,0.06)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <Shield size={22} color="#50FFD1" />
                            <div>
                                <p style={{ color: '#50FFD1', fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>Protocol Sealed</p>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, margin: '3px 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Vault Access Token has been generated</p>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(80,255,209,0.04)',
                            border: '1px solid rgba(80,255,209,0.15)',
                            borderRadius: 16, padding: '24px 28px', marginBottom: 20, textAlign: 'center',
                        }}>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 12px' }}>Successor Vault Access Token</p>
                            <p style={{ color: '#50FFD1', fontSize: 28, fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'monospace', margin: '0 0 8px' }}>{vatCode}</p>
                            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Also printed in your downloaded PDF</p>
                        </div>

                        <div style={{
                            background: 'rgba(255,160,0,0.05)', border: '1px solid rgba(255,160,0,0.1)',
                            borderRadius: 12, padding: '12px 16px', marginBottom: 16,
                        }}>
                            <p style={{ color: 'rgba(255,200,0,0.7)', fontSize: 10, lineHeight: 1.6, margin: 0 }}>
                                <strong>Print this code and store it with your important papers.</strong> Your designated successors will go to <strong>charterlegacy.com/vault-access</strong> and enter this code to access your succession record.
                            </p>
                        </div>

                        {/* Attorney review suggestion */}
                        <div style={{
                            background: 'rgba(80,255,209,0.03)', border: '1px solid rgba(80,255,209,0.08)',
                            borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                        }}>
                            <p style={{ color: 'rgba(80,255,209,0.5)', fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                                Recommended Next Step
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, lineHeight: 1.6, margin: 0 }}>
                                For full legal protection, have a licensed attorney review this designation record.{' '}
                                <a
                                    href="https://www.floridabar.org/public/lfrs/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#50FFD1', fontWeight: 700, textDecoration: 'none' }}
                                >
                                    Find a Florida attorney →
                                </a>
                            </p>
                        </div>

                        <button
                            onClick={() => setVatCode(null)}
                            style={{
                                width: '100%', background: '#50FFD1', border: 'none',
                                borderRadius: 12, padding: '14px', color: '#050506',
                                fontSize: 12, fontWeight: 900, letterSpacing: '0.15em',
                                textTransform: 'uppercase', cursor: 'pointer',
                            }}
                        >
                            I've Saved My Token
                        </button>
                    </div>
                </div>
            )}
            {/* ─────────────────────────────────────────────────────────── */}

            {/* Header */}
            <div className={s.header}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={18} className="text-[#50FFD1]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#50FFD1]/60">Sovereign Protocol Hub</span>
                        </div>
                        <h2 className={s.glowText}>Succession Module</h2>
                        <p className="text-white/40 text-xs mt-1 font-medium uppercase tracking-widest">Control Transfer Automation: {llc?.llc_name}</p>
                    </div>
                    <button onClick={onClose} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        Exit Hub
                    </button>
                </div>
            </div>

            {/* Entity Visualization */}
            <div className={s.glassCard}>
                <div className="flex items-center justify-center gap-12 py-4">
                    <div className="text-center group">
                        <div className="w-20 h-20 rounded-[24px] bg-[#50FFD1]/5 flex items-center justify-center border border-[#50FFD1]/20 group-hover:bg-[#50FFD1]/10 transition-all duration-500 shadow-[0_0_30px_rgba(80,255,209,0.05)]">
                            <Lock size={32} className="text-[#50FFD1]" />
                        </div>
                        <span className="text-[10px] font-black uppercase mt-3 block text-white/60 tracking-tighter">{parentName}</span>
                        <span className="text-[8px] text-[#50FFD1]/40 font-black uppercase tracking-widest">Holding Parent (WY)</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                             <div className="w-1 h-1 bg-[#50FFD1]/20 rounded-full" />
                             <div className="w-1 h-1 bg-[#50FFD1]/40 rounded-full" />
                             <ArrowRight size={24} className="text-[#50FFD1]/60 mx-2" />
                             <div className="w-1 h-1 bg-[#50FFD1]/40 rounded-full" />
                             <div className="w-1 h-1 bg-[#50FFD1]/20 rounded-full" />
                        </div>
                        <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#50FFD1]/20 to-transparent mt-4" />
                    </div>

                    <div className="text-center group">
                        <div className="w-20 h-20 rounded-[24px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all duration-500">
                            <GitBranch size={32} className="text-white/40" />
                        </div>
                        <span className="text-[10px] font-black uppercase mt-3 block text-white/60 tracking-tighter">{llc?.llc_name}</span>
                        <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">Operating Sub (FL)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Heirs Management */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                            <Users size={14} className="text-[#50FFD1]" />
                            Authorized Recipients
                        </h3>
                        <span className={s.badge}>{heirs.length} Secure Slots</span>
                    </div>

                    <div className="space-y-4">
                        {heirs.map(heir => (
                            <div key={heir.id} className={`${s.glassCard} flex justify-between items-center group relative overflow-hidden`}>
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#50FFD1]/20" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight text-white/90">{heir.heir_name}</p>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{heir.heir_role} • {heir.heir_email}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="text-xs font-black text-[#50FFD1]">{heir.equity_percentage}%</span>
                                        <p className="text-[7px] font-black text-white/20 uppercase">Equity</p>
                                    </div>
                                    <button onClick={() => handleRemoveHeir(heir.id)} className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Heir */}
                        <div className={`${s.glassCard} space-y-4 border-dashed border-[#50FFD1]/20 bg-transparent`}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={s.inputGroup}>
                                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Legal Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Successor Full Name" 
                                        className={s.inputField}
                                        value={newHeir.name}
                                        onChange={(e) => setNewHeir({...newHeir, name: e.target.value})}
                                    />
                                </div>
                                <div className={s.inputGroup}>
                                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Email Node</label>
                                    <input 
                                        type="email" 
                                        placeholder="secure@heir.com" 
                                        className={s.inputField} 
                                        value={newHeir.email}
                                        onChange={(e) => setNewHeir({...newHeir, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 items-end">
                                <div className={`${s.inputGroup} flex-1`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Equity Allocation</label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[8px] text-white/20 font-black uppercase tracking-widest">
                                                {(100 - heirs.reduce((s, h) => s + Number(h.equity_percentage || 0), 0)).toFixed(0)}% remaining
                                            </span>
                                            <span className="text-[10px] font-black text-[#50FFD1]">{newHeir.equity}%</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="range" min="1"
                                        max={Math.max(1, 100 - heirs.reduce((s, h) => s + Number(h.equity_percentage || 0), 0))}
                                        className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#50FFD1]"
                                        value={newHeir.equity}
                                        onChange={(e) => { setNewHeir({...newHeir, equity: e.target.value}); setHeirError(''); }}
                                    />
                                </div>
                                {/* Role selector */}
                                <div className={s.inputGroup} style={{ width: 120, flexShrink: 0 }}>
                                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1 block mb-1">Role</label>
                                    <select
                                        value={newHeir.role}
                                        onChange={(e) => setNewHeir({...newHeir, role: e.target.value})}
                                        className={s.inputField}
                                        style={{ paddingTop: 10, paddingBottom: 10 }}
                                    >
                                        <option value="Beneficiary">Beneficiary</option>
                                        <option value="Co-Manager">Co-Manager</option>
                                        <option value="Trustee">Trustee</option>
                                        <option value="Executor">Executor</option>
                                    </select>
                                </div>
                                <button onClick={handleAddHeir} className={s.accentButton}>
                                    <Plus size={16} strokeWidth={3} />
                                </button>
                            </div>
                            {/* Inline error */}
                            {heirError && (
                                <div style={{
                                    background: 'rgba(255,80,80,0.06)',
                                    border: '1px solid rgba(255,80,80,0.2)',
                                    borderRadius: 10, padding: '8px 12px', marginTop: 10,
                                }}>
                                    <p style={{ color: 'rgba(255,130,130,0.9)', fontSize: 10, margin: 0, fontWeight: 700 }}>
                                        {heirError}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activation Settings & Audit */}
                <div className="space-y-8">
                    <div className={s.glassCard}>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 mb-5 px-2">
                            <Zap size={14} className="text-[#50FFD1]" />
                            Succession Activation
                        </h3>

                        {/* Mode Selector */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {[
                                { id: 'manual', label: 'Manual', sub: 'You decide when', icon: MousePointerClick },
                                { id: 'scheduled', label: 'Scheduled', sub: 'Set a future date', icon: Calendar },
                                { id: 'inactivity', label: 'Auto', sub: 'After login gap', icon: Clock },
                            ].map(({ id, label, sub, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setTriggerMode(id)}
                                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                                        triggerMode === id
                                            ? 'bg-[#50FFD1]/10 border-[#50FFD1]/40 shadow-[0_0_20px_rgba(80,255,209,0.08)]'
                                            : 'bg-white/3 border-white/5 hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={14} className={triggerMode === id ? 'text-[#50FFD1] mb-1' : 'text-white/20 mb-1'} />
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${
                                        triggerMode === id ? 'text-[#50FFD1]' : 'text-white/50'
                                    }`}>{label}</p>
                                    <p className="text-[8px] text-white/20 font-medium uppercase tracking-widest mt-0.5">{sub}</p>
                                </button>
                            ))}
                        </div>

                        {/* Mode Detail Panel */}
                        <div className="bg-black/30 rounded-2xl border border-white/5 p-4 mb-5 min-h-[88px] flex flex-col justify-center">
                            {triggerMode === 'manual' && (
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white/70 mb-1">Owner-Controlled Activation</p>
                                    <p className="text-[9px] text-white/30 leading-relaxed">
                                        Your succession is only activated when <em className="text-white/50 not-italic">you</em> explicitly seal it below. Nothing happens automatically — you stay in full control.
                                    </p>
                                </div>
                            )}
                            {triggerMode === 'scheduled' && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-white/70">Effective Succession Date</p>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={activationDate}
                                        onChange={(e) => setActivationDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-black text-white/80 uppercase tracking-widest focus:outline-none focus:border-[#50FFD1]/40 transition-all"
                                    />
                                    {activationDate && (
                                        <p className="text-[9px] text-[#50FFD1]/60 font-black uppercase tracking-widest">
                                            Active from: {new Date(activationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            )}
                            {triggerMode === 'inactivity' && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black uppercase text-white/70">Auto-Activate After</p>
                                        <span className="text-lg font-black text-[#50FFD1] tracking-tighter">{threshold} days</span>
                                    </div>
                                    <input
                                        type="range" min="30" max="365" step="30"
                                        value={threshold}
                                        onChange={(e) => setThreshold(Number(e.target.value))}
                                        className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#50FFD1]"
                                    />
                                    <div className="flex justify-between text-[8px] text-white/20 font-black uppercase">
                                        <span>30d</span><span>90d</span><span>180d</span><span>1yr</span>
                                    </div>
                                    <p className="text-[9px] text-white/30">
                                        If you haven't logged in for <span className="text-white/60">{threshold} days</span>, your designated successors are notified and given access.
                                    </p>
                                    <button
                                        onClick={handleCheckIn}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                            checkedIn
                                                ? 'bg-[#50FFD1]/10 border-[#50FFD1]/40 text-[#50FFD1]'
                                                : 'bg-white/3 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5'
                                        }`}
                                    >
                                        {checkedIn
                                            ? <><Check size={13} /> Timer Reset — You're Active</>
                                            : <><RefreshCw size={13} /> Confirm I'm Active</>}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── UPL CONSENT GATE ───────────────────────── */}
                        <div style={{
                            background: 'rgba(255,209,102,0.04)',
                            border: '1px solid rgba(255,209,102,0.12)',
                            borderRadius: 14, padding: '14px 16px', marginBottom: 16,
                        }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                                <div
                                    onClick={() => setUplConsented(v => !v)}
                                    style={{
                                        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                                        border: `2px solid ${uplConsented ? '#50FFD1' : 'rgba(255,255,255,0.2)'}`,
                                        background: uplConsented ? '#50FFD1' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s', cursor: 'pointer',
                                    }}
                                >
                                    {uplConsented && <Check size={11} color="#050506" strokeWidth={3} />}
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, lineHeight: 1.6 }}>
                                    I understand that <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Charter Legacy is a document preparation service, not a law firm.</strong> The successor designations I am recording reflect my own independent decisions. No legal advice has been provided to me. I have been advised to consult a licensed attorney in Florida and/or Wyoming to review this record.
                                </span>
                            </label>
                        </div>

                        <button 
                            onClick={handleSealProtocol}
                            disabled={sealing || heirs.length === 0 || !uplConsented || (triggerMode === 'scheduled' && !activationDate)}
                            className={`${s.accentButton} w-full py-5 flex items-center justify-center gap-3 active:scale-95`}
                            style={{ opacity: uplConsented ? 1 : 0.4, transition: 'opacity 0.3s' }}
                        >
                            {sealing ? (
                                <>
                                    <Activity size={18} className={s.liveIndicator} />
                                    <span>Preparing Record...</span>
                                </>
                            ) : (
                                <>
                                    <Lock size={18} strokeWidth={2.5} />
                                    <span>Record & Seal Designations</span>
                                </>
                            )}
                        </button>

                        <p className="text-[8px] text-center text-white/20 font-black uppercase tracking-[0.2em] leading-relaxed mt-3">
                            Document prepared from your instructions · Digitally timestamped on activation
                        </p>
                    </div>

                    {/* ── Vault Token Management ───────────────────────── */}
                    {isSealed && (
                        <div className={s.glassCard} style={{ marginTop: 0 }}>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 mb-4">
                                <Lock size={12} className="text-[#50FFD1]" />
                                Vault Token Management
                            </h4>

                            {/* Token actions */}
                            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                                <button
                                    onClick={handleReplaceToken}
                                    disabled={replacingToken}
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        background: 'rgba(255,80,80,0.05)', border: '1px solid rgba(255,80,80,0.15)',
                                        borderRadius: 12, padding: '11px 14px',
                                        color: 'rgba(255,120,120,0.8)', fontSize: 10, fontWeight: 900,
                                        letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                                    }}
                                >
                                    <RefreshCw size={12} style={replacingToken ? { animation: 'spin 1s linear infinite' } : {}} />
                                    {replacingToken ? 'Replacing...' : 'Replace Token (Lost/Stolen)'}
                                </button>

                                <button
                                    style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        background: 'rgba(80,255,209,0.04)', border: '1px solid rgba(80,255,209,0.1)',
                                        borderRadius: 12, padding: '11px 14px',
                                        color: 'rgba(80,255,209,0.6)', fontSize: 10, fontWeight: 900,
                                        letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                        if (logAction) logAction('VAULT_TOKEN_PDF_REPRINT', 'SUCCESS', {});
                                        alert('To reprint your token PDF, activate the succession plan again — this generates a fresh copy. Your token code will not change.');
                                    }}
                                >
                                    <ArrowRight size={12} />
                                    Print PDF Copy
                                </button>
                            </div>

                            {/* Notify-on-change toggle */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 16px',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: 12,
                            }}>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 800, margin: 0 }}>Notify successors when plan is modified</p>
                                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, margin: '3px 0 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Off by default · Your LLC, your choice</p>
                                </div>
                                <button
                                    onClick={handleNotifyToggle}
                                    style={{
                                        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: notifyOnChange ? '#50FFD1' : 'rgba(255,255,255,0.1)',
                                        position: 'relative', transition: 'background 0.25s', flexShrink: 0,
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: 3, left: notifyOnChange ? 23 : 3,
                                        width: 18, height: 18, borderRadius: '50%',
                                        background: notifyOnChange ? '#050506' : 'rgba(255,255,255,0.4)',
                                        transition: 'left 0.25s',
                                    }} />
                                </button>
                            </div>
                        </div>
                    )}
                    {/* ──────────────────────────────────────────────── */}

                    {/* Audit Ledger */}
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2 px-2">
                            <Activity size={12} className="text-[#50FFD1]" />
                            Intelligence Audit Ledger
                        </h4>
                        <div className={`${s.auditScroll} space-y-2`}>
                            {auditLogs.length > 0 ? auditLogs.map(log => (
                                <div key={log.id} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-[#50FFD1]/5 flex items-center justify-center text-[#50FFD1]/40 group-hover:text-[#50FFD1] transition-all">
                                        <Shield size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/80 uppercase tracking-widest">{log.event_type.replace(/_/g, ' ')}</p>
                                        <p className="text-[8px] text-white/20 font-black uppercase mt-0.5">{new Date(log.created_at).toLocaleDateString()} @ {new Date(log.created_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 bg-white/2 border border-dashed border-white/5 rounded-2xl">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/10">No protocol events recorded.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#50FFD1]/5 rounded-full border border-[#50FFD1]/10">
                    <div className={s.glowRing} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#50FFD1]">
                        Protocol Readiness: {heirs.length > 0 ? '10/10 Secure' : 'Slot Assignment Required'}
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                         <Info size={12} className="text-white/20" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Auth Level: Service Role</span>
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                         <Check size={12} className="text-[#50FFD1]" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-[#50FFD1]">Encrypted Node Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessionProtocolDashboard;
