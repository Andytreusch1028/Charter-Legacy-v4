import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
    Zap, Clock, CheckCircle2, AlertTriangle, Search, Filter,
    FileText, User, Activity, ExternalLink, ShieldCheck, X, 
    Terminal, Play, StopCircle, RefreshCw, ChevronRight, Lock,
    Edit3, Camera, Save, ArrowLeftCircle, Server
} from 'lucide-react';
import { tinyfish } from '../../lib/tinyfish';
import DiagnosticFlightRecorder from '../components/DiagnosticFlightRecorder';

// Tinyfish API Key (Provisioned via Secure Bridge)
const TINYFISH_KEY = window.localStorage.getItem('TINYFISH_KEY') || 'sk-tinyfish-_900RKNoZIA38xSHqFNhUl957VIGUMXw';

const FormationFactory = ({
    supabase,
    setToast
}) => {
    const [viewMode, setViewMode] = useState('queue');
    const [searchQuery, setSearchQuery] = useState('');
    const [formations, setFormations] = useState([]);

    useEffect(() => {
        const fetchQueue = async () => {
            const { data, error } = await supabase
                .from('llcs')
                .select(`
                    id, user_id, llc_name, llc_status, created_at, principal_address,
                    profiles!llcs_user_id_fkey ( full_name, role )
                `)
                .order('created_at', { ascending: false });

            if (data) {
                const mapped = data
                    .filter(llc => !['FILED', 'TRANSMITTED', 'Active'].includes(llc.llc_status))
                    .map(llc => {
                        const isPLLC = llc.llc_name?.includes('PLLC') || llc.llc_name?.includes('Professional');
                        const addrParts = llc.principal_address?.split(',') || [];
                        
                        return {
                            id: llc.id,
                            client_id: llc.user_id,
                            entityName: llc.llc_name || 'Unnamed Entity',
                            type: isPLLC ? 'PLLC' : 'LLC',
                            status: llc.llc_status || 'AWAITING_REVIEW',
                            submitted: new Date(llc.created_at).toLocaleDateString(),
                            owner: llc.profiles?.full_name || 'Client',
                            priority: 'high',
                            filingOptions: { effectiveDate: '', certOfStatus: false, certifiedCopy: true },
                            principalAddress: { 
                                street: addrParts[0]?.trim() || '123 Business Way', 
                                suite: '', 
                                city: addrParts[1]?.trim() || 'Miami', 
                                state: 'FL', 
                                zip: addrParts[2]?.trim() || '33101' 
                            },
                            mailingAddress: { isSame: true, street: '', suite: '', city: '', state: '', zip: '' },
                            registeredAgent: { 
                                type: 'BUSINESS', 
                                businessName: 'Charter Legacy Services LLC',
                                firstName: '',
                                lastName: '',
                                signature: 'Charter Legacy Services LLC', // Auth sign
                                street: '456 Guardian Way', 
                                city: 'DeLand', 
                                state: 'FL', 
                                zip: '32724' 
                            },
                            correspondence: { name: llc.profiles?.full_name || 'Client', email: 'legal@charterlegacy.com' },
                            authPersonnel: [
                                { title: 'MGR', firstName: (llc.profiles?.full_name || 'Authorized').split(' ')[0], lastName: (llc.profiles?.full_name || 'Person').split(' ')[1] || 'Person', street: addrParts[0]?.trim() || '123 Business Way', city: addrParts[1]?.trim() || 'Miami', state: 'FL', zip: addrParts[2]?.trim() || '33101' }
                            ]
                        };
                    });
                let finalFormations = mapped;
                if (finalFormations.length === 0 && window.location.hostname === 'localhost') {
                    finalFormations = [{
                        id: 'mock-llc-for-testing-123',
                        client_id: 'mock-client-id',
                        entityName: 'Charter Legacy Test Entity LLC',
                        type: 'LLC',
                        status: 'AWAITING_REVIEW',
                        submitted: new Date().toLocaleDateString(),
                        owner: 'Demo User',
                        priority: 'high',
                        filingOptions: { effectiveDate: '', certOfStatus: false, certifiedCopy: true },
                        principalAddress: { street: '123 Test St', suite: '', city: 'Miami', state: 'FL', zip: '33101' },
                        mailingAddress: { isSame: true, street: '', suite: '', city: '', state: '', zip: '' },
                        registeredAgent: { type: 'BUSINESS', businessName: 'Charter Legacy Services LLC', firstName: '', lastName: '', signature: 'Charter Legacy Services LLC', street: '456 Guardian Way', city: 'DeLand', state: 'FL', zip: '32724' },
                        correspondence: { name: 'Demo User', email: 'legal@charterlegacy.com' },
                        authPersonnel: [{ title: 'MGR', firstName: 'Demo', lastName: 'User', street: '123 Test St', city: 'Miami', state: 'FL', zip: '33101' }]
                    }];
                }
                setFormations(finalFormations);
            }
        };
        fetchQueue();
    }, [supabase]);

    // -- AUTOMATION STATE --
    const [activeAutomation, setActiveAutomation] = useState(null); // The formation being processed
    const [automationState, setAutomationState] = useState('IDLE'); // IDLE, NAVIGATING, FILING, COMPLETE, ERROR
    const [automationLogs, setAutomationLogs] = useState([]);
    const [lastSnapshot, setLastSnapshot] = useState(null);
    const [showSpecEditor, setShowSpecEditor] = useState(false);
    const [editingSpec, setEditingSpec] = useState(null);
    const [apiKey, setApiKey] = useState(TINYFISH_KEY);
    const [showKeyPrompt, setShowKeyPrompt] = useState(!TINYFISH_KEY);
    const [handoffUrl, setHandoffUrl] = useState(null);
    const [showFullSnapshot, setShowFullSnapshot] = useState(false);
    
    // Flight Recorder State
    const [activeFlightRecorder, setActiveFlightRecorder] = useState(null); // stores { id, name }
    
    const automationAbort = useRef(null);
    const logEndRef = useRef(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);
    const lastEventRef = useRef(Date.now());

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [automationLogs]);

    const filteredFormations = formations.filter(f => 
        f.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const validateSpec = (formation) => {
        const errors = [];
        if (!formation.entityName) errors.push({ id: 'entityName', label: 'Entity Name', tab: 'intake' });
        if (!formation.type) errors.push({ id: 'type', label: 'Filing Type', tab: 'intake' });
        if (!formation.principalAddress?.street) errors.push({ id: 'principal_street', label: 'Principal Street', tab: 'addresses' });
        if (!formation.principalAddress?.city) errors.push({ id: 'principal_city', label: 'Principal City', tab: 'addresses' });
        
        const ra = formation.registeredAgent;
        if (!ra?.street) errors.push({ id: 'ra_street', label: 'RA Street', tab: 'ra' });
        if (!ra?.city) errors.push({ id: 'ra_city', label: 'RA City', tab: 'ra' });
        if (ra?.type === 'INDIVIDUAL' && !ra.firstName) errors.push({ id: 'ra_fname', label: 'RA First Name', tab: 'ra' });
        if (ra?.type === 'INDIVIDUAL' && !ra.lastName) errors.push({ id: 'ra_lname', label: 'RA Last Name', tab: 'ra' });
        if (ra?.type === 'BUSINESS' && !ra.businessName) errors.push({ id: 'ra_bizname', label: 'RA Business Name', tab: 'ra' });
        if (!ra?.signature) errors.push({ id: 'ra_sig', label: 'RA Signature', tab: 'ra' });
        
        if (!formation.correspondence?.email) errors.push({ id: 'corr_email', label: 'Correspondence Email', tab: 'intake' });
        if (!formation.authPersonnel || formation.authPersonnel.length === 0) {
            errors.push({ id: 'add_person', label: 'Add Authorized Person', tab: 'management' });
        } else {
            formation.authPersonnel.forEach((person, i) => {
                if (!person.firstName || !person.lastName) errors.push({ id: `person_${i}_name`, label: `Person ${i+1} Name`, tab: 'management' });
                if (!person.street || !person.city) errors.push({ id: `person_${i}_addr`, label: `Person ${i+1} Address`, tab: 'management' });
            });
        }
        
        return errors;
    };

    const handleSaveKey = () => {
        window.localStorage.setItem('TINYFISH_KEY', apiKey);
        setShowKeyPrompt(false);
        setToast({ type: 'success', message: 'TinyFish API Key Saved locally.' });
    };

    const startAutomation = (formation) => {
        const errors = validateSpec(formation);
        if (errors.length > 0) {
            setEditingSpec({ ...formation });
            setShowSpecEditor(true);
            setToast({ 
                type: 'error', 
                message: `Statutory Check Failed: Missing ${errors.map(e => e.label).join(', ')}` 
            });
            return;
        }

        if (!apiKey) {
            setShowKeyPrompt(true);
            return;
        }
        setActiveAutomation(formation);
        setAutomationState('NAVIGATING');
        setHandoffUrl(null);
        setLastSnapshot(null);
        setAutomationLogs([{
            timestamp: new Date().toLocaleTimeString(),
            message: `Initiating Protocol Tinyfish for ${formation.entityName}...`,
            type: 'system'
        }]);
        
        setElapsedTime(0);
        lastEventRef.current = Date.now();
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
            
            // Proactive "Thinking" logs to show it's not stalled
            if (Date.now() - lastEventRef.current > 15000) {
                const thinkingMessages = [
                    "Analyzing Sunbiz DOM structure...",
                    "Waiting for Florida State servers to respond...",
                    "Verifying field availability...",
                    "Ensuring statutory alignment...",
                    "Calculating next optimal navigation path..."
                ];
                const msg = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
                setAutomationLogs(prev => [...prev.slice(-49), {
                    timestamp: new Date().toLocaleTimeString(),
                    message: `[SYSTEM] ${msg}`,
                    type: 'system'
                }]);
                lastEventRef.current = Date.now();
            }
        }, 1000);
        
        automationAbort.current = new AbortController();
        
        const goal = `Navigate to https://dos.myflorida.com/sunbiz/start-e-filing/efile-articles-of-organization/. 
        1. Start LLC E-Filing.
        2. FILL FILING INFORMATION:
           - LLC Name: "${formation.entityName}"${formation.type === 'PLLC' ? '\n           - Professional Purpose: "Professional Services"' : ''}
           - Effective Date: "${formation.filingOptions?.effectiveDate || 'Today'}"
           - Certificate of Status ($5): ${formation.filingOptions?.certOfStatus ? 'Check yes' : 'Leave unchecked'}
           - Certified Copy ($30): ${formation.filingOptions?.certifiedCopy ? 'Check yes' : 'Leave unchecked'}
        3. FILL PRINCIPAL ADDRESS:
           - Address: "${formation.principalAddress?.street}"
           - Suite: "${formation.principalAddress?.suite || ''}"
           - City, State: "${formation.principalAddress?.city}", "${formation.principalAddress?.state}"
           - Zip: "${formation.principalAddress?.zip}"
        4. FILL MAILING ADDRESS:
           - ${formation.mailingAddress?.isSame ? "Check 'Mailing address same as principal address'" : `Fill: ${formation.mailingAddress?.street}, ${formation.mailingAddress?.city}, ${formation.mailingAddress?.zip}`}
        5. CRITICAL: Take a screenshot and log "Intake & Addresses complete".
        6. FILL REGISTERED AGENT:
           - ${formation.registeredAgent?.type === 'INDIVIDUAL' ? `Individual Name: ${formation.registeredAgent.firstName} ${formation.registeredAgent.lastName}` : `Business Name: ${formation.registeredAgent.businessName}`}
           - RA Address: "${formation.registeredAgent?.street}, ${formation.registeredAgent?.city}, FL ${formation.registeredAgent?.zip}"
           - Sign: Type "${formation.registeredAgent?.firstName} ${formation.registeredAgent?.lastName}" in Signature box.
        7. CRITICAL: Take a screenshot and log "Registered Agent complete".
        8. FILL CORRESPONDENCE:
           - Name: "${formation.correspondence?.name}"
           - Email: "${formation.correspondence?.email}"
        9. FILL AUTHORIZED PERSONNEL (MGR/AMBR):
           ${formation.authPersonnel?.map((p, i) => `
           Entry ${i + 1}:
           - Title: ${p.title}
           - Name: ${p.firstName} ${p.lastName}
           - Address: ${p.street}, ${p.city}, ${p.state} ${p.zip}
           `).join('\n')}
        10. CRITICAL: Stop at the final review/payment screen. Take a final screenshot.`;

        tinyfish.run({
            url: 'https://dos.myflorida.com/sunbiz/',
            goal,
            apiKey,
            controller: automationAbort.current,
            onEvent: async (data) => {
                let message = data.message;
                
                // Enhancement: Specificity Bridge
                if (!message) {
                    if (data.event === 'navigation') message = `Navigating to ${data.payload?.url?.split('/').pop() || 'next section'}...`;
                    else if (data.event === 'field_filled') message = `Synchronizing field: ${data.payload?.field || data.payload?.selector || 'system input'}`;
                    else if (data.event === 'click') message = `Acknowledging ${data.payload?.element || 'interaction point'}...`;
                    else if (data.event === 'completed') message = "Protocol successfully finalized.";
                    else message = data.payload ? (typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload)) : 'Executing protocol step...';
                }

                setAutomationLogs(prev => [...prev.slice(-49), {
                    timestamp: new Date().toLocaleTimeString(),
                    message,
                    type: data.event === 'completed' ? 'success' : 'info'
                }]);
                lastEventRef.current = Date.now();

                // Bridge 1: Sync to Universal Action Ledger
                if (data.event === 'navigation' || data.event === 'field_filled' || data.event === 'completed') {
                    try {
                        await supabase.from('system_events_ledger').insert({
                            entity_id: formation.id,
                            client_id: formation.client_id || null, // Will map to user UUID if logged in
                            actor_id: 'TINYFISH_BOT',
                            actor_type: 'TINYFISH_BOT',
                            event_category: 'FILING_AUTOMATION',
                            event_type: 'SUNBIZ_TELEMETRY',
                            severity: data.event === 'completed' ? 'SUCCESS' : 'INFO',
                            customer_facing_message: data.event === 'completed' ? `Automated filing sequence finalized for ${formation.entityName}.` : null,
                            internal_payload: { step: data.event, message: message, url: data.payload?.url }
                        });
                    } catch (syncErr) {
                        console.error('[Action Ledger] Failed to sync event:', syncErr);
                    }
                }

                if (data.event === 'screenshot') {
                    setLastSnapshot(data.payload?.url || data.payload?.data);
                    setAutomationLogs(prev => [...prev, {
                        timestamp: new Date().toLocaleTimeString(),
                        message: "VISUAL SNAPSHOT CAPTURED",
                        type: 'system'
                    }]);
                }

                if (data.event === 'completed') {
                    setAutomationState('COMPLETE');
                    setHandoffUrl(data.payload?.takeoverUrl || data.payload?.url || null);
                    clearInterval(timerRef.current);
                    setFormations(prev => prev.map(f => f.id === formation.id ? { ...f, status: 'DRAFT_SAVED' } : f));
                    
                    // Mark as filed in DB
                    supabase.from('llcs').update({ llc_status: 'TRANSMITTED', filed_at: new Date().toISOString() }).eq('id', formation.id).then();
                }
            },
            onError: async (err) => {
                setAutomationState('ERROR');
                clearInterval(timerRef.current);
                setAutomationLogs(prev => [...prev, {
                    timestamp: new Date().toLocaleTimeString(),
                    message: `PROTOCOL ABORTED: ${err.message}`,
                    type: 'error'
                }]);
                
                // Log Critical Error & System Snapshot
                try {
                    await supabase.from('system_events_ledger').insert({
                        entity_id: formation.id,
                        client_id: formation.client_id || null,
                        actor_id: 'SYSTEM',
                        actor_type: 'SYSTEM',
                        event_category: 'FILING_AUTOMATION',
                        event_type: 'SUNBIZ_EXCEPTION',
                        severity: 'CRITICAL',
                        customer_facing_message: 'Our automation engine encountered a temporary roadblock with the State portal. Our staff has been alerted.',
                        internal_payload: { error: err.message, stack: err.stack },
                        system_snapshot: formation
                    });
                } catch (auditErr) {}
                
                setToast({ type: 'error', message: 'Automation Failure: Check Logs' });
            }
        });
    };

    const stopAutomation = async () => {
        automationAbort.current?.abort();
        clearInterval(timerRef.current);
        setAutomationState('IDLE');
        
        setAutomationLogs(prev => [...prev.slice(-49), {
            timestamp: new Date().toLocaleTimeString(),
            message: "PROTOCOL REVOKED: Emergency stop triggered. Clearing session footprint.",
            type: 'error'
        }]);

        // Audit Trail: Sync revocation to Universal Action Ledger
        if (activeAutomation) {
            try {
                await supabase.from('system_events_ledger').insert({
                    entity_id: activeAutomation.id,
                    client_id: activeAutomation.client_id || null,
                    actor_id: 'CURRENT_OPERATOR_ID', // Replaced dynamically later if connected
                    actor_type: 'STAFF',
                    event_category: 'FILING_AUTOMATION',
                    event_type: 'MANUAL_ABORT',
                    severity: 'WARNING',
                    internal_payload: { reason: 'Emergency Stop trigger by operator' }
                });
            } catch (err) {
                console.error('[Action Ledger] Failed to log revocation:', err);
            }
        }
    };

    const renderAutomationHub = () => (
        <div className="fixed inset-0 z-[150] bg-luminous-ink/40 backdrop-blur-sm flex items-center justify-center p-6 bg-hacker-mesh">
            <div className="w-full max-w-4xl bg-[#0D1117] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[80vh] border-glow animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-luminous-blue/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-luminous-blue/20 flex items-center justify-center text-luminous-blue animate-pulse-slow">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Protocol Tinyfish</h3>
                                <div className="px-2.5 py-1 rounded-lg bg-luminous-blue/10 border border-luminous-blue/20 flex items-center gap-1.5 shadow-sm shadow-luminous-blue/5">
                                    <div className="w-1 h-1 rounded-full bg-luminous-blue animate-pulse" />
                                    <span className="text-[8px] font-black text-luminous-blue uppercase tracking-[0.15em] whitespace-nowrap">{activeAutomation?.type || 'Statutory Filing'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-[9px] text-luminous-blue font-black uppercase tracking-[0.3em] opacity-50 italic">Sunbiz Automated Bridge // {activeAutomation?.id}</p>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')} Elapsed</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {automationState === 'NAVIGATING' && (
                            <div className="flex gap-0.5 items-center mr-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-1 bg-luminous-blue/40 rounded-full animate-pulse" style={{ height: `${Math.sin(elapsedTime * 2 + i) * 10 + 15}px`, animationDelay: `${i * 150}ms` }} />
                                ))}
                            </div>
                        )}
                        <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                            automationState === 'NAVIGATING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            automationState === 'COMPLETE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                            automationState === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-white/40'
                        }`}>
                            <Activity size={10} className={automationState === 'NAVIGATING' ? 'animate-spin' : ''} />
                            {automationState}
                        </div>
                        <button 
                            onClick={() => { stopAutomation(); setActiveAutomation(null); }}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 flex items-center justify-center transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Split */}
                <div className="flex-1 flex min-h-0">
                    {/* Log Terminal */}
                    <div className="flex-[1.5] bg-black/40 border-r border-white/5 flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
                            <Terminal size={14} className="text-luminous-blue" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">Live Execution Log</span>
                        </div>
                        <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar-dark leading-relaxed">
                            {automationLogs.map((log, i) => (
                                <div key={i} className={`mb-3 animate-in fade-in slide-in-from-left-2 duration-300 ${
                                    log.type === 'error' ? 'text-red-400' : 
                                    log.type === 'success' ? 'text-emerald-400' : 
                                    log.type === 'system' ? 'text-luminous-blue font-bold italic' : 'text-gray-400'
                                }`}>
                                    <span className="opacity-30 mr-3">[{log.timestamp}]</span>
                                    <span className="opacity-20 mr-3">$</span>
                                    {log.message}
                                </div>
                            ))}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    {/* Meta/Controls */}
                    <div className="flex-1 bg-white/2 p-10 flex flex-col gap-8">
                        <section>
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-4 italic">Target Entity</label>
                            <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                <h4 className="text-lg font-black text-white tracking-tight uppercase leading-none mb-2">{activeAutomation?.entityName}</h4>
                                <p className="text-[10px] text-luminous-blue font-bold uppercase tracking-widest">{activeAutomation?.type} · Florida DFS</p>
                            </div>
                        </section>

                        <section className="flex-1">
                            <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] block mb-4 italic">Compliance Guard</label>
                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${automationLogs.some(l => l.message.includes('Intake')) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/5 text-white/20'}`}>
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Intake & Addresses</span>
                                    </div>
                                    {automationLogs.some(l => l.message.includes('Intake')) && <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>}
                                </div>
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${automationLogs.some(l => l.message.includes('Agent complete')) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/5 text-white/20'}`}>
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Registered Agent</span>
                                    </div>
                                    {automationLogs.some(l => l.message.includes('Agent complete')) && <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>}
                                </div>
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${automationState === 'COMPLETE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/5 text-white/20'}`}>
                                    <div className="flex items-center gap-3">
                                        <Lock size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Manual Payment Gating</span>
                                    </div>
                                    {automationState === 'COMPLETE' && <span className="text-[8px] font-black uppercase tracking-tighter">Ready</span>}
                                </div>
                            </div>
                        </section>

                        <div className="mt-auto space-y-3">
                            {automationState === 'COMPLETE' ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-black text-white uppercase tracking-widest leading-none">Protocol Verified</h5>
                                                <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1">Ready for Payment Handoff</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <button 
                                                onClick={() => setShowFullSnapshot(true)}
                                                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                            >
                                                <Camera size={14} /> Review Final Form Snapshot
                                            </button>
                                            
                                            {handoffUrl && (
                                                <button 
                                                    onClick={() => window.open(handoffUrl, '_blank')}
                                                    className="w-full py-4 bg-luminous-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-luminous-blue/20 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink size={16} /> Interactive Takeover (Pay Now)
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                setEditingSpec({ ...activeAutomation });
                                                setShowSpecEditor(true);
                                                setAutomationState('IDLE');
                                            }}
                                            className="w-full py-4 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit3 size={16} /> Spot a mistake? Edit & Retry
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setFormations(prev => prev.map(f => f.id === activeAutomation.id ? { 
                                                    ...f, 
                                                    status: 'FILED', 
                                                    submitted: 'Just now' 
                                                } : f));
                                                setActiveAutomation(null);
                                                setToast({ type: 'success', message: 'Filing Finalized: State Receipt Uploaded' });
                                            }}
                                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            Mark as Paid & File
                                        </button>
                                        <button 
                                            onClick={() => setActiveAutomation(null)}
                                            className="px-6 py-4 bg-white/5 text-white/40 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button 
                                        disabled={automationState !== 'IDLE' && automationState !== 'ERROR'}
                                        onClick={() => {
                                            setEditingSpec({ ...activeAutomation });
                                            setShowSpecEditor(true);
                                        }}
                                        className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                            (automationState !== 'IDLE' && automationState !== 'ERROR')
                                                ? 'bg-white/2 text-white/10 cursor-not-allowed opacity-50'
                                                : 'bg-white/5 hover:bg-white/10 text-white/60'
                                        }`}
                                    >
                                        <Edit3 size={16} /> Edit Spec
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (automationState === 'IDLE' || automationState === 'ERROR') {
                                                startAutomation(activeAutomation);
                                            } else {
                                                stopAutomation();
                                            }
                                        }}
                                        className={`flex-[1.5] py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                            (automationState === 'IDLE' || automationState === 'ERROR') ? 'bg-luminous-blue text-white shadow-xl shadow-luminous-blue/20' : 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20'
                                        }`}
                                    >
                                        {(automationState === 'IDLE' || automationState === 'ERROR') ? (
                                            automationState === 'ERROR' ? <RefreshCw size={16} className="animate-spin-slow" /> : <Play size={16} />
                                        ) : <StopCircle size={16} />}
                                        {automationState === 'IDLE' ? 'Execute Protocol' : 
                                         automationState === 'ERROR' ? 'Retry Protocol' : 'Emergency Stop'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Snapshot Overlay */}
                {lastSnapshot && !showFullSnapshot && (
                    <div className="absolute right-8 bottom-8 w-64 h-40 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl group cursor-zoom-in" onClick={() => setShowFullSnapshot(true)}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">LIVE SNAPSHOT</span>
                            <Camera size={12} className="text-luminous-blue" />
                        </div>
                        <img src={lastSnapshot} alt="Automation Snapshot" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Fullscreen Snapshot Review */}
                {showFullSnapshot && (
                    <div className="absolute inset-0 z-[160] bg-black/95 backdrop-blur-2xl flex flex-col p-10 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-xl font-black text-white uppercase tracking-tighter">Final Filing Verification</h4>
                                <p className="text-[10px] text-luminous-blue font-black uppercase tracking-[0.3em] opacity-80 mt-1">Sunbiz Review Screen Proof</p>
                            </div>
                            <button onClick={() => setShowFullSnapshot(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 transition-all">
                                <ArrowLeftCircle size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden rounded-[40px] border border-white/10 shadow-2xl bg-[#0D1117] relative group">
                            <img src={lastSnapshot} alt="Full Review" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 pointer-events-none border-[20px] border-emerald-500/10" />
                        </div>
                        <div className="mt-8 flex justify-center gap-4">
                            <button 
                                onClick={() => {
                                    setShowFullSnapshot(false);
                                    setEditingSpec({ ...activeAutomation });
                                    setShowSpecEditor(true);
                                    setAutomationState('IDLE');
                                }} 
                                className="px-10 py-4 border border-red-500/20 bg-red-500/10 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
                            >
                                <Edit3 size={16} /> Edit Spec Required
                            </button>
                            <button onClick={() => setShowFullSnapshot(false)} className="px-10 py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-all">Verified: Return to Console</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );


    return (
        <div className="flex flex-1 flex-col min-h-0">
            {/* Sub-Nav */}
            <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
                    { [
                        { id: 'queue', label: 'Formation Queue', icon: Clock, count: formations.filter(f => f.status !== 'FILED').length },
                        { id: 'completed', label: 'Completed', icon: CheckCircle2, count: formations.filter(f => f.status === 'FILED').length },
                        { id: 'stats', label: 'Factory Stats', icon: Activity }
                    ].map(mode => (
                        <button 
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                viewMode === mode.id 
                                    ? 'bg-white text-luminous-ink shadow-sm' 
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <mode.icon size={12} />
                            {mode.label}
                            {mode.count !== undefined && <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[8px] ${viewMode === mode.id ? 'bg-luminous-blue/10 text-luminous-blue' : 'bg-gray-200 text-gray-500'}`}>{mode.count}</span>}
                        </button>
                    )) }
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowKeyPrompt(true)}
                        className={`p-3 rounded-xl border transition-all ${apiKey ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-amber-50 border-amber-100 text-amber-500'}`}
                    >
                        <Lock size={16} />
                    </button>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-luminous-blue transition-colors" size={16} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search entities…" 
                            className="bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none ring-4 ring-transparent focus:ring-luminous-blue/5 focus:border-luminous-blue/20 transition-all w-64 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Formation Cards Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredFormations.map(formation => (
                        <div 
                            key={formation.id}
                            className={`p-6 bg-white border rounded-[32px] transition-all hover:shadow-xl hover:shadow-gray-200/50 group ${
                                formation.priority === 'high' ? 'border-red-100 shadow-sm shadow-red-500/5' : 'border-gray-100'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    formation.status === 'FILED' ? 'bg-emerald-50 text-emerald-500' : 'bg-luminous-blue/10 text-luminous-blue'
                                }`}>
                                    <Zap size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-mono text-gray-300 block">ID: {formation.id}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mt-1 inline-block ${
                                        formation.priority === 'high' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                    }`}>{formation.priority} Priority</span>
                                </div>
                            </div>

                            <h4 className="text-lg font-black text-luminous-ink uppercase tracking-tight mb-1 group-hover:text-luminous-blue transition-colors">{formation.entityName}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{formation.type} · {formation.owner}</p>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-gray-400 uppercase">Status</span>
                                    <span className={`font-black uppercase tracking-widest ${
                                        formation.status === 'FILED' ? 'text-emerald-500' : 'text-amber-500'
                                    }`}>{formation.status.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-gray-400 uppercase">Submitted</span>
                                    <span className="font-bold text-luminous-ink">{formation.submitted}</span>
                                </div>
                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-500 ${
                                        formation.status === 'FILED' ? 'w-full bg-emerald-500' : 
                                        formation.status === 'DRAFTING' ? 'w-2/3 bg-luminous-blue' : 'w-1/3 bg-amber-500'
                                    }`} />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        setEditingSpec({ ...formation });
                                        setShowSpecEditor(true);
                                    }}
                                    className="flex-[2] py-3 bg-gray-50 text-luminous-ink rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <FileText size={14} /> View Spec
                                </button>
                                <button 
                                    onClick={() => formation.status === 'FILED' ? null : startAutomation(formation)}
                                    className="flex-[3] py-3 bg-luminous-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-luminous-blue/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {formation.status === 'FILED' ? 'Download Receipt' : 'File (Automated)'}
                                    <Zap size={12} className={formation.status !== 'FILED' ? 'animate-pulse' : ''} />
                                </button>
                                <button 
                                    onClick={() => setActiveFlightRecorder({ id: formation.id, name: formation.entityName })}
                                    className="flex-[1] py-3 bg-[#1A1F2E] text-white/50 hover:text-white rounded-xl flex items-center justify-center transition-colors group border border-white/5"
                                    title="View Action Ledger"
                                >
                                    <Terminal size={14} className="group-hover:text-luminous-blue transition-colors" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Protocol Hub Modal */}
            {activeAutomation && renderAutomationHub()}

            {/* Spec Editor Modal */}
            {showSpecEditor && (
                <SpecEditor 
                    editingSpec={editingSpec} 
                    setEditingSpec={setEditingSpec} 
                    setShowSpecEditor={setShowSpecEditor} 
                    setFormations={setFormations} 
                    setToast={setToast} 
                    setActiveAutomation={setActiveAutomation} 
                    validateSpec={validateSpec}
                />
            )}

            {/* API Key Modal */}
            {showKeyPrompt && (
                <div className="fixed inset-0 z-[200] bg-luminous-ink/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-amber-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-amber-500">
                            <Lock size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-luminous-ink uppercase tracking-tighter mb-2">Access Key Required</h3>
                        <p className="text-xs text-gray-400 font-medium mb-8 leading-relaxed">Enter your **Tinyfish.ai** API Key to unlock automation for this node.</p>
                        
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="TF-******************"
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-mono focus:border-luminous-blue transition-all mb-4 outline-none"
                        />
                        
                        <div className="flex gap-3">
                            <button onClick={() => setShowKeyPrompt(false)} className="flex-1 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-all">Cancel</button>
                            <button onClick={handleSaveKey} className="flex-2 py-4 bg-luminous-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-luminous-blue/20 hover:scale-[1.02] active:scale-95 transition-all">Enable Node</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Steve Protocol: Diagnostic Flight Recorder Slide-out */}
            {activeFlightRecorder && (
                <DiagnosticFlightRecorder 
                    entityId={activeFlightRecorder.id}
                    entityName={activeFlightRecorder.name}
                    setToast={setToast}
                    onClose={() => setActiveFlightRecorder(null)}
                />
            )}
        </div>
    );
};

export default FormationFactory;

const SpecEditor = ({ editingSpec, setEditingSpec, setShowSpecEditor, setFormations, setToast, setActiveAutomation, validateSpec }) => {
    const tabs = [
        { id: 'intake', label: '1. Filing Info', icon: FileText },
        { id: 'addresses', label: '2. Addresses', icon: MapPin },
        { id: 'ra', label: '3. Reg Agent', icon: ShieldCheck },
        { id: 'management', label: '4. Management', icon: User }
    ];
    const [activeTab, setActiveTab] = useState('intake');
    const errors = validateSpec(editingSpec);
    const readinessScore = Math.max(0, 100 - (errors.length * 10));

    const jumpToField = (tab, id) => {
        setActiveTab(tab);
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.focus();
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('animate-pulse-blue');
                setTimeout(() => el.classList.remove('animate-pulse-blue'), 2000);
            }
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-luminous-ink/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex h-[85vh]">
                
                {/* Statutory Guide Sidebar */}
                <div className="w-72 border-r border-gray-100 flex flex-col bg-gray-50/50">
                    <div className="p-8 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-luminous-blue text-white flex items-center justify-center shadow-lg shadow-luminous-blue/20">
                                <ShieldCheck size={16} />
                            </div>
                            <h4 className="text-[11px] font-black text-luminous-ink uppercase tracking-wider">Statutory Guide</h4>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-luminous-blue leading-none">{readinessScore}%</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Ready</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <label className="px-4 text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block italic">Pending Corrections</label>
                        {errors.length === 0 ? (
                            <div className="p-6 text-center space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                                    <CheckCircle2 size={24} />
                                </div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">10/10 Compliance</p>
                            </div>
                        ) : (
                            errors.map((err, i) => (
                                <button 
                                    key={i}
                                    onClick={() => jumpToField(err.tab, err.id)}
                                    className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-left hover:border-luminous-blue hover:shadow-sm transition-all group flex items-start gap-3"
                                >
                                    <div className="w-5 h-5 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <AlertTriangle size={10} />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-luminous-ink uppercase tracking-tight block group-hover:text-luminous-blue">{err.label}</span>
                                        <span className="text-[7px] font-bold text-gray-400 uppercase block mt-0.5">Tab: {err.tab}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-white border-t border-gray-100">
                        <div className="text-[8px] font-bold text-gray-400 uppercase leading-relaxed italic">
                            Filings with missing statutory data will be blocked by the Florida Compliance Engine.
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                        <div>
                            <h3 className="text-2xl font-black text-luminous-ink uppercase tracking-tighter">Compliance Spec Editor</h3>
                            <p className="text-[10px] text-luminous-blue font-black uppercase tracking-[0.3em] opacity-80 mt-1">Florida LLC Statutory Hub</p>
                        </div>
                        <div className="flex gap-2">
                            {tabs.map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center ${
                                        activeTab === tab.id ? 'bg-luminous-blue text-white shadow-lg shadow-luminous-blue/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                                >
                                    <tab.icon size={12} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowSpecEditor(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all ml-4">
                            <X size={18} />
                        </button>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
                        {activeTab === 'intake' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Entity Name</label>
                                        <input 
                                            id="entityName"
                                            value={editingSpec.entityName}
                                            onChange={(e) => setEditingSpec({ ...editingSpec, entityName: e.target.value.toUpperCase() })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-luminous-blue transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Effective Date (Default Today)</label>
                                        <input 
                                            id="eff_date"
                                            type="date"
                                            value={editingSpec.filingOptions?.effectiveDate || ''}
                                            onChange={(e) => setEditingSpec({ ...editingSpec, filingOptions: { ...(editingSpec.filingOptions || {}), effectiveDate: e.target.value } })}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-luminous-blue transition-all"
                                        />
                                    </div>
                                </section>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Correspondence Email (For State Notices)</label>
                                    <input 
                                        id="corr_email"
                                        type="email"
                                        value={editingSpec.correspondence?.email || ''}
                                        onChange={(e) => setEditingSpec({ ...editingSpec, correspondence: { ...(editingSpec.correspondence || {}), email: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-luminous-blue transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-black text-luminous-blue uppercase tracking-[0.2em] italic border-b border-gray-100 pb-2">Principal Place of Business</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input id="principal_street" placeholder="Street Address" value={editingSpec.principalAddress?.street || ''} onChange={(e) => setEditingSpec({...editingSpec, principalAddress: {...(editingSpec.principalAddress || {}), street: e.target.value}})} className="col-span-2 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                        <input id="principal_city" placeholder="City" value={editingSpec.principalAddress?.city || ''} onChange={(e) => setEditingSpec({...editingSpec, principalAddress: {...(editingSpec.principalAddress || {}), city: e.target.value}})} className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                        <div className="flex gap-4">
                                            <input placeholder="FL" value={editingSpec.principalAddress?.state || ''} className="w-16 text-center bg-gray-100 border border-gray-100 rounded-2xl py-4 text-sm font-bold" disabled />
                                            <input id="principal_zip" placeholder="Zip" value={editingSpec.principalAddress?.zip || ''} onChange={(e) => setEditingSpec({...editingSpec, principalAddress: {...(editingSpec.principalAddress || {}), zip: e.target.value}})} className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'ra' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex gap-4 p-1.5 bg-gray-50 rounded-2xl w-fit">
                                    <button onClick={() => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), type: 'INDIVIDUAL'}})}
                                        className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${editingSpec.registeredAgent?.type === 'INDIVIDUAL' ? 'bg-white text-luminous-blue shadow-sm' : 'text-gray-400'}`}
                                    >Individual Agent</button>
                                    <button onClick={() => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), type: 'BUSINESS'}})}
                                        className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${editingSpec.registeredAgent?.type === 'BUSINESS' ? 'bg-white text-luminous-blue shadow-sm' : 'text-gray-400'}`}
                                    >Business RA</button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {editingSpec.registeredAgent?.type === 'INDIVIDUAL' ? (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Agent First Name</label>
                                                <input id="ra_fname" value={editingSpec.registeredAgent?.firstName || ''} onChange={(e) => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), firstName: e.target.value}})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Agent Last Name</label>
                                                <input id="ra_lname" value={editingSpec.registeredAgent?.lastName || ''} onChange={(e) => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), lastName: e.target.value}})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">RA Business Name</label>
                                            <input id="ra_bizname" placeholder="CORPORATION TO SERVE AS RA" value={editingSpec.registeredAgent?.businessName || ''} onChange={(e) => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), businessName: e.target.value}})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                        </div>
                                    )}
                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <input id="ra_street" placeholder="Registered Agent Street" value={editingSpec.registeredAgent?.street || ''} onChange={(e) => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), street: e.target.value}})} className="col-span-2 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                        <input id="ra_city" placeholder="City" value={editingSpec.registeredAgent?.city || ''} onChange={(e) => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), city: e.target.value}})} className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                        <input id="ra_zip" placeholder="Zip" value={editingSpec.registeredAgent?.zip || ''} onChange={(e) => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), zip: e.target.value}})} className="bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm outline-none focus:border-luminous-blue" />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">RA Signature (Acceptance)</label>
                                        <input id="ra_sig" placeholder="TYPE AGENT NAME TO SIGN" value={editingSpec.registeredAgent?.signature || ''} onChange={(e) => setEditingSpec({...editingSpec, registeredAgent: {...(editingSpec.registeredAgent || {}), signature: e.target.value}})} className="w-full bg-luminous-blue/5 border border-luminous-blue/10 rounded-2xl py-4 px-6 text-sm font-black text-luminous-blue outline-none placeholder:text-luminous-blue/20" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'management' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black text-luminous-blue uppercase tracking-widest italic">Authorized Personnel (Managers/Members)</h4>
                                    <button 
                                        id="add_person"
                                        onClick={() => setEditingSpec({...editingSpec, authPersonnel: [...(editingSpec.authPersonnel || []), { title: 'MGR', firstName: '', lastName: '', street: '', city: '', state: 'FL', zip: '' }]})}
                                        className="px-4 py-2 bg-luminous-blue text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                                    >+ Add Person</button>
                                </div>
                                
                                {editingSpec.authPersonnel?.map((person, i) => (
                                    <div key={i} className="p-8 bg-gray-50 border border-gray-100 rounded-[32px] relative group">
                                        <button onClick={() => setEditingSpec({...editingSpec, authPersonnel: (editingSpec.authPersonnel || []).filter((_, idx) => idx !== i)})}
                                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                        ><X size={14} /></button>
                                        <div className="grid grid-cols-3 gap-4">
                                            <select value={person.title} onChange={(e) => {
                                                const newList = [...(editingSpec.authPersonnel || [])];
                                                newList[i] = { ...newList[i], title: e.target.value };
                                                setEditingSpec({...editingSpec, authPersonnel: newList});
                                            }} className="bg-white border rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-luminous-blue">
                                                <option>MGR</option><option>AMBR</option><option>AP</option>
                                            </select>
                                            <input id={`person_${i}_fname`} placeholder="First Name" value={person.firstName} onChange={(e) => {
                                                const newList = [...(editingSpec.authPersonnel || [])];
                                                newList[i] = { ...newList[i], firstName: e.target.value };
                                                setEditingSpec({...editingSpec, authPersonnel: newList});
                                            }} className="bg-white border rounded-xl py-3 px-4 text-xs font-bold" />
                                            <input id={`person_${i}_lname`} placeholder="Last Name" value={person.lastName} onChange={(e) => {
                                                const newList = [...(editingSpec.authPersonnel || [])];
                                                newList[i] = { ...newList[i], lastName: e.target.value };
                                                setEditingSpec({...editingSpec, authPersonnel: newList});
                                            }} className="bg-white border rounded-xl py-3 px-4 text-xs font-bold" />
                                            <input id={`person_${i}_street`} placeholder="Address" value={person.street} onChange={(e) => {
                                                const newList = [...(editingSpec.authPersonnel || [])];
                                                newList[i] = { ...newList[i], street: e.target.value };
                                                setEditingSpec({...editingSpec, authPersonnel: newList});
                                            }} className="col-span-2 bg-white border rounded-xl py-3 px-4 text-xs font-bold" />
                                            <input id={`person_${i}_city`} placeholder="City" value={person.city} onChange={(e) => {
                                                const newList = [...(editingSpec.authPersonnel || [])];
                                                newList[i] = { ...newList[i], city: e.target.value };
                                                setEditingSpec({...editingSpec, authPersonnel: newList});
                                            }} className="bg-white border rounded-xl py-3 px-4 text-xs font-bold" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-luminous-blue/10 flex items-center justify-center text-luminous-blue">
                                <Activity size={18} />
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">System Telemetry</span>
                                <span className="text-[10px] font-black text-luminous-ink uppercase tracking-tight block">Local Workspace Persisted</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowSpecEditor(false)} className="px-8 py-4 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 transition-all">Close</button>
                            <button 
                                onClick={async () => {
                                    setFormations(prev => prev.map(f => f.id === editingSpec.id ? editingSpec : f));
                                    setActiveAutomation(editingSpec);
                                    try {
                                        await supabase.from('ra_service_log').insert({
                                            client_id: editingSpec.client_id || '00000000-0000-0000-0000-000000000000',
                                            status: 'SPEC_CORRECTED',
                                            staff_notes: `[HUMAN INTERVENTION] Statutory Spec updated locally.`,
                                            document_hash: editingSpec.id
                                        });
                                        setToast({ type: 'success', message: 'Statutory Spec Sync\'d to Ledger' });
                                    } catch (err) {
                                        setToast({ type: 'warning', message: 'Local Update Persistent (Ledger Offline)' });
                                    }
                                    setShowSpecEditor(false);
                                }}
                                className="px-10 py-4 bg-luminous-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-luminous-blue/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                            ><Save size={16} /> Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(45, 108, 223, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(45, 108, 223, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(45, 108, 223, 0); }
                }
                .animate-pulse-blue {
                    animation: pulse-blue 1s infinite;
                    border-color: #2D6CDF !important;
                    background-color: rgba(45, 108, 223, 0.05) !important;
                }
            `}} />
        </div>
    );
};
