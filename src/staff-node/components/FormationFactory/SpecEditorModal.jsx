import React, { useState } from 'react';
import { FileText, MapPin, ShieldCheck, User, CheckCircle2, AlertTriangle, X, Activity, Save } from 'lucide-react';

const SpecEditorModal = ({ editingSpec, setEditingSpec, setShowSpecEditor, setFormations, setToast, setActiveAutomation, validateSpec, supabase }) => {
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

export default SpecEditorModal;
