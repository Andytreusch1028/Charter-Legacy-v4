import React from 'react';
import { 
    FilePlus, Search, CheckCircle2, AlertTriangle, Download, Maximize, Brain, Zap, Plus, X, XCircle 
} from 'lucide-react';
import tinyfish from '../../../lib/tinyfish';
import { getInitials } from '../hooks/useSentryActions';

export const SentryWorkspace = ({ 
    activeItem, 
    queue, 
    activeDocUrl,
    ocrProgress,
    aiClassifications,
    customCategories,
    setCustomCategories,
    newCategoryName,
    setNewCategoryName,
    setQueue,
    setDialogModal,
    linkedEntities,
    setLinkedEntities,
    entitySearch,
    setEntitySearch,
    entityDropdownOpen,
    setEntityDropdownOpen,
    clients,
    forwardingRecipients,
    manualEmail,
    setManualEmail,
    tinyfishStatus,
    setTinyfishStatus,
    DOCUMENT_CATEGORIES,
    handleAcceptMatch,
    handleOverride,
    handleManualLink,
    handleAddRecipient,
    handleRemoveRecipient,
    handleFinalize,
    setToast,
    setActiveItem
}) => {
    if (!activeItem) {
        return (
            <main className="flex-1 bg-white border border-gray-200 rounded-[32px] overflow-hidden flex flex-col shadow-sm">
                <div className="h-full flex flex-col items-center justify-center text-center p-12 gap-6 bg-gray-50/50">
                    <Search size={32} className="text-gray-200" />
                    <h3 className="text-lg font-black text-gray-300 uppercase tracking-tight">Select a task to begin</h3>
                </div>
            </main>
        );
    }

    const doc = queue.find(q => q.id === activeItem);
    if (!doc) return null;

    return (
        <main className="flex-1 bg-white border border-gray-200 rounded-[32px] overflow-hidden flex flex-col shadow-sm">
            <div className="h-full flex flex-col">
                {/* Workspace Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc.aiStatus === 'needs_review' ? 'bg-amber-50 text-amber-500' : doc.urgent ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
                            <FilePlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-luminous-ink uppercase tracking-tight">{doc.docTitle}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.entity ? `${doc.entity} (${doc.sunbizId})` : 'Unlinked — entity match required'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2.5 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-luminous-ink rounded-xl transition-all" title="Download Local Copy">
                            <Download size={16} />
                        </button>
                        <button 
                            onClick={() => {
                                if (activeDocUrl) window.open(activeDocUrl, '_blank');
                                else setToast({ type: 'warning', message: "No source document available for full view." });
                            }}
                            className="px-4 py-2 bg-luminous-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Maximize size={12} /> Full View
                        </button>
                    </div>
                </div>

                {/* Main Workspace Content */}
                <div className="flex-1 flex min-h-0">
                    {/* Document Preview */}
                    <div className="flex-1 bg-[#F1F3F5] flex items-center justify-center overflow-hidden border-r border-gray-100 p-8 relative">
                        {ocrProgress[activeItem] !== undefined && ocrProgress[activeItem] < 100 && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                                <Brain size={48} className="text-luminous-blue mb-4 animate-pulse shadow-sm" />
                                <h3 className="text-xl font-black text-luminous-ink uppercase tracking-tight">Extracting Legal Data...</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-6">Real-Time Browser-Native OCR Engine</p>
                                <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden mb-2 shadow-inner">
                                    <div className="h-full bg-luminous-blue transition-all duration-300" style={{ width: `${ocrProgress[activeItem]}%` }} />
                                </div>
                                <p className="text-[10px] text-gray-400 italic max-w-xs mt-6 leading-relaxed">Analyzing document structure locally...</p>
                            </div>
                        )}

                        {activeDocUrl && doc.meta?.type?.includes('pdf') ? (
                            <div className="w-full h-full bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col">
                                <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">{doc.docTitle}</span>
                                    <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded font-bold">LIVE SOURCE</span>
                                </div>
                                <iframe src={activeDocUrl} className="w-full h-full border-none" title="PDF Preview" />
                            </div>
                        ) : (
                            <div className="w-full max-w-lg bg-white shadow-xl rounded-lg p-8 flex flex-col gap-4 font-serif">
                                <h4 className="text-sm font-bold text-center tracking-wide">{doc.preview?.heading || 'Document Preview'}</h4>
                                <div className="w-full h-px bg-gray-200" />
                                <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
                                    {doc.rawFile ? `SYSTEM LOG: SOURCE BINARY DETECTED\n--------------------------------\n${doc.preview?.body || ''}` : doc.preview?.body || ''}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Action Controls */}
                    <div className="w-72 p-6 flex flex-col gap-5 shrink-0 overflow-y-auto custom-scrollbar">
                        {/* AI Classification Banner */}
                        {doc.aiStatus !== 'confirmed' && (
                            <div className={`p-3 rounded-2xl border ${doc.aiConfidence >= 80 ? 'bg-emerald-50 border-emerald-100' : doc.aiConfidence >= 50 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-200'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${doc.aiConfidence >= 80 ? 'text-emerald-700' : doc.aiConfidence >= 50 ? 'text-blue-700' : 'text-amber-700'}`}>
                                        {doc.aiConfidence >= 80 ? '✓ AI Matched' : doc.aiConfidence >= 50 ? '○ AI Partial' : '⚠ Needs Review'}
                                    </p>
                                    <span className="text-[10px] font-black">{doc.aiConfidence || 0}%</span>
                                </div>
                                <p className="text-[9px] text-gray-500 italic leading-relaxed mb-3">{aiClassifications[doc.id]?.aiSource || 'Analyzing...'}</p>
                                {doc.aiConfidence >= 50 ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAcceptMatch(doc.id)} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-1"><Zap size={9} /> Accept Match</button>
                                        <button onClick={() => handleOverride(doc.id)} className="py-2 px-3 bg-white text-gray-500 border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-red-300 hover:text-red-500 transition-all">Override</button>
                                    </div>
                                ) : (
                                    <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Link entity manually below ↓</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                <h5 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Native Metadata</h5>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><span className="text-[7px] font-black text-gray-300 uppercase">File Context</span><span className="text-[9px] font-mono text-gray-500">{doc.meta?.size || '—'}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-[7px] font-black text-gray-300 uppercase">MIME Type</span><span className="text-[8px] font-mono text-gray-400 truncate max-w-[100px]">{doc.meta?.type || 'unknown'}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Classification</h5>
                            <div className="grid grid-cols-2 gap-1.5 mb-2">
                                {[...DOCUMENT_CATEGORIES, ...customCategories.map(c => ({ id: `custom_${c}`, label: c, custom: true }))].map(cat => {
                                    const currentCategories = doc.category ? doc.category.split(', ') : [];
                                    const isActive = currentCategories.includes(cat.label);
                                    return (
                                        <div key={cat.id} className="relative group/cat flex">
                                            <button 
                                                onClick={() => {
                                                    setQueue(prev => prev.map(q => {
                                                        if (q.id === doc.id) {
                                                            let nextCats = q.category ? q.category.split(', ') : [];
                                                            if (nextCats.includes(cat.label)) {
                                                                nextCats = nextCats.filter(c => c !== cat.label);
                                                            } else {
                                                                nextCats = [...nextCats.filter(c => c !== 'Unclassified'), cat.label];
                                                            }
                                                            if (nextCats.length === 0) nextCats = ['Unclassified'];
                                                            return { ...q, category: nextCats.join(', ') };
                                                        }
                                                        return q;
                                                    }));
                                                }}
                                                className={`w-full px-2 py-1.5 border rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${isActive ? (cat.urgent ? 'bg-red-500 text-white border-red-500' : 'bg-luminous-blue text-white border-luminous-blue') : (cat.urgent ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-luminous-blue')}`}
                                            >
                                                {cat.urgent && <span className="mr-0.5">⚠</span>}{cat.label}
                                            </button>
                                            {cat.custom && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDialogModal({
                                                            title: 'Delete Classification',
                                                            message: `Are you sure you want to delete the custom classification "${cat.label}"?`,
                                                            isDestructive: true,
                                                            onConfirm: () => {
                                                                const updated = customCategories.filter(c => c !== cat.label);
                                                                setCustomCategories(updated);
                                                                localStorage.setItem('cl_custom_categories', JSON.stringify(updated));
                                                                if (isActive) {
                                                                     setQueue(prev => prev.map(q => {
                                                                         if (q.id === doc.id) {
                                                                             let nextCats = (q.category ? q.category.split(', ') : []).filter(c => c !== cat.label);
                                                                             if (nextCats.length === 0) nextCats = ['Unclassified'];
                                                                             return { ...q, category: nextCats.join(', ') };
                                                                         }
                                                                         return q;
                                                                     }));
                                                                }
                                                                setDialogModal(null);
                                                            }
                                                        });
                                                    }}
                                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/cat:opacity-100 transition-opacity shadow-sm hover:bg-red-500 hover:text-white"
                                                    title="Delete Custom Classification"
                                                >
                                                    <X size={8} />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const trimmed = newCategoryName.trim();
                                if (trimmed && !customCategories.includes(trimmed)) {
                                    const updated = [...customCategories, trimmed];
                                    setCustomCategories(updated);
                                    localStorage.setItem('cl_custom_categories', JSON.stringify(updated));
                                    setNewCategoryName('');
                                }
                            }} className="flex items-center gap-1.5 bg-gray-50/50 border border-gray-100 rounded-lg px-2 py-1.5 focus-within:ring-2 focus-within:ring-luminous-blue/20 transition-all">
                                <Plus size={10} className="text-gray-400" />
                                <input 
                                    type="text" 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Add classification..." 
                                    className="flex-1 bg-transparent border-none text-[8px] font-bold outline-none uppercase tracking-widest placeholder:text-gray-300 placeholder:normal-case placeholder:font-medium placeholder:tracking-normal"
                                />
                            </form>
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Linked Entity</h5>
                            {linkedEntities[doc.id] ? (
                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-luminous-ink">{linkedEntities[doc.id].name}</p>
                                        <button onClick={() => setLinkedEntities(prev => { const n = {...prev}; delete n[doc.id]; return n; })} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                        <div><p className="text-[8px] font-black text-gray-400 uppercase">SunBiz ID</p><p className="text-[9px] font-bold text-luminous-ink font-mono">{linkedEntities[doc.id].sunbizId}</p></div>
                                        <div><p className="text-[8px] font-black text-gray-400 uppercase">Status</p><p className={`text-[9px] font-black uppercase ${linkedEntities[doc.id].status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>{linkedEntities[doc.id].status}</p></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl py-2.5 px-3">
                                        <Search size={12} className="text-gray-300" />
                                        <input 
                                            type="text" 
                                            value={entitySearch}
                                            onChange={(e) => { setEntitySearch(e.target.value); setEntityDropdownOpen(true); }}
                                            onFocus={() => setEntityDropdownOpen(true)}
                                            placeholder="Link entity manually..."
                                            className="flex-1 bg-transparent border-none text-xs font-bold outline-none"
                                        />
                                    </div>
                                    {entityDropdownOpen && entitySearch.length >= 2 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                                            {clients.filter(e => e.name.toLowerCase().includes(entitySearch.toLowerCase()) || (e.sunbizId || '').toLowerCase().includes(entitySearch.toLowerCase())).map(ent => (
                                                <button key={ent.id} onClick={() => { handleManualLink(doc.id, ent); setEntitySearch(''); setEntityDropdownOpen(false); }} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                                                    <p className="text-[10px] font-black text-luminous-ink">{ent.name}</p>
                                                    <p className="text-[8px] text-gray-400 font-mono">{ent.sunbizId} · {ent.owner_name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Forward To</h5>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {(forwardingRecipients[doc.id] || []).map(rec => (
                                    <div key={rec.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl group transition-all hover:bg-gray-100/80">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-luminous-blue/10 flex items-center justify-center text-[8px] font-black text-luminous-blue shrink-0">{rec.initials}</div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-luminous-ink truncate">{rec.name || 'Manual'}</p>
                                                <p className="text-[8px] text-gray-400 font-medium truncate italic">{rec.email}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveRecipient(doc.id, rec.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="relative">
                                <div className="flex items-center gap-2 bg-gray-50/50 border border-gray-100 rounded-xl px-2.5 py-2">
                                    <Plus size={12} className="text-gray-400" />
                                    <input 
                                        type="text"
                                        value={manualEmail}
                                        onChange={(e) => setManualEmail(e.target.value)}
                                        placeholder="Add email or search..."
                                        className="flex-1 bg-transparent border-none outline-none text-[10px] font-bold"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && manualEmail.includes('@')) {
                                                handleAddRecipient(doc.id, { id: Date.now(), email: manualEmail, name: '', initials: getInitials('', manualEmail), source: 'manual' });
                                                setManualEmail('');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto space-y-3">
                           {doc.urgent && (
                               <div className="p-3 bg-red-50 border border-red-100 rounded-2xl">
                                    <p className="text-[9px] font-black text-red-600 uppercase mb-1 flex items-center gap-1.5"><AlertTriangle size={10} /> SOP Detected</p>
                                    <p className="text-[9px] text-red-500 font-medium leading-relaxed italic">Triggers 24h SLA & SMS interrupt to client.</p>
                               </div>
                           )}
                           <div className="flex gap-2">
                               <button 
                                   onClick={() => {
                                       setDialogModal({
                                           title: 'Abort Task',
                                           message: 'Abort processing for this document? It will be removed from the queue.',
                                           isDestructive: true,
                                           onConfirm: () => {
                                               setQueue(prev => {
                                                   const filtered = prev.filter(q => q.id !== doc.id);
                                                   if (filtered.length > 0) setActiveItem(filtered[0].id);
                                                   else setActiveItem(null);
                                                   return filtered;
                                               });
                                               setDialogModal(null);
                                           }
                                       });
                                   }}
                                   className="flex items-center justify-center p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all font-bold group"
                                   title="Abort task"
                               >
                                   <XCircle size={16} className="group-hover:scale-110 transition-transform" />
                               </button>
                               <button 
                                   onClick={() => handleFinalize(doc.id)}
                                   disabled={(forwardingRecipients[doc.id] || []).length === 0}
                                   className="flex-1 py-4 bg-luminous-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-hacker-blue shadow-xl shadow-luminous-blue/20 transition-all disabled:opacity-30"
                               >
                                   {(forwardingRecipients[doc.id] || []).length > 0 ? 'Finalize & Forward' : 'Add Recipient to Proceed'}
                               </button>
                           </div>

                           {/* TinyFish Autonomous Bridge */}
                           {(doc.category?.includes('Annual Report') || doc.category?.includes('State Notice')) && (
                               <div className="mt-4 p-4 bg-violet-50 border border-violet-100 rounded-2xl space-y-3 relative overflow-hidden group/tf">
                                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/tf:opacity-30 transition-opacity">
                                       <Brain size={32} className="text-violet-600" />
                                   </div>
                                   <div className="relative z-10">
                                       <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                           <Zap size={10} /> TinyFish Protocol
                                       </p>
                                       <p className="text-[10px] text-violet-500 font-medium italic leading-relaxed">
                                           Autonomous state filing detected. Trigger high-fidelity web agent?
                                       </p>
                                   </div>
                                   
                                   {(tinyfishStatus[doc.id]?.status === 'running') ? (
                                       <div className="space-y-2">
                                           <div className="h-1 bg-violet-100 rounded-full overflow-hidden">
                                               <div className="h-full bg-violet-600 animate-pulse w-full" />
                                           </div>
                                           <div className="bg-white/50 rounded-lg p-2 max-h-24 overflow-y-auto custom-scrollbar">
                                               {tinyfishStatus[doc.id].logs.map((log, i) => (
                                                   <p key={i} className="text-[7px] font-mono text-violet-400 leading-tight">› {log}</p>
                                               ))}
                                           </div>
                                       </div>
                                   ) : (
                                       <button 
                                           onClick={async () => {
                                               const goal = `File the ${doc.category} for ${doc.entity || 'this entity'} on Sunbiz. Use the data from the attached document: ${doc.docTitle}.`;
                                               setTinyfishStatus(prev => ({ ...prev, [doc.id]: { status: 'running', logs: ['Initializing session...', 'Goal: ' + goal] } }));
                                               
                                               try {
                                                   const settings = JSON.parse(localStorage.getItem('ra_node_settings') || '{}');
                                                   const apiKey = settings.tinyfish_api_key || 'sk-tinyfish-_900RKNoZIA38xSHqFNhUl957VIGUMXw';
                                                   
                                                   await tinyfish.run({
                                                       url: 'https://dos.myflorida.com/sunbiz/',
                                                       goal: goal,
                                                       apiKey: apiKey,
                                                       onEvent: (data) => {
                                                           setTinyfishStatus(prev => ({
                                                               ...prev,
                                                               [doc.id]: {
                                                                   ...prev[doc.id],
                                                                   logs: [...prev[doc.id].logs.slice(-10), data.message]
                                                               }
                                                           }));
                                                           if (data.event === 'completed') {
                                                               setTinyfishStatus(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], status: 'completed' } }));
                                                               setToast({ type: 'success', message: 'TinyFish autonomous filing completed successfully.' });
                                                           }
                                                       },
                                                       onError: (err) => {
                                                           setTinyfishStatus(prev => ({ ...prev, [doc.id]: { ...prev[doc.id], status: 'error' } }));
                                                           setToast({ type: 'error', message: 'TinyFish Failure: ' + err.message });
                                                       }
                                                   });
                                               } catch (err) {
                                                   setTinyfishStatus(prev => ({ ...prev, [doc.id]: { status: 'error', logs: [err.message] } }));
                                               }
                                           }}
                                           className="w-full py-2.5 bg-violet-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-violet-700 shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
                                       >
                                           <Zap size={10} /> Run Autonomous Filing
                                       </button>
                                   )}
                                   
                                   {tinyfishStatus[doc.id]?.status === 'completed' && (
                                       <div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest pt-1">
                                           <CheckCircle2 size={12} /> Filing Finalized
                                       </div>
                                   )}
                               </div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
