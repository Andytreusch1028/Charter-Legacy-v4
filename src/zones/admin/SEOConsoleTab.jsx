import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { generateSEOMetadata } from '../../lib/localAI';
import { Globe, Plus, Save, X, Loader2, Code, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';

const AVAILABLE_ROUTES = [
    // 🟢 The "Must-Index" Pages (Public Marketing)
    { path: '/', label: 'Landing Page (/)' },
    { path: '/services/llc-formation', label: 'LLC Formation (/services/llc-formation)' },
    { path: '/services/registered-agent', label: 'Registered Agent (/services/registered-agent)' },
    { path: '/services/homestead-trust', label: 'Homestead Trust (/services/homestead-trust)' },
    { path: '/pricing', label: 'Pricing Hub (/pricing)' },
    
    // 🟡 The "Entryway" Pages (Index the Login, not the Dashboard)
    { path: '/app', label: 'Client Console Login (/app)' },
    { path: '/checkout', label: 'Secure Checkout (/checkout)' }
    
    // 🔴 Note: /staff, /admin, and /fulfillment are intentionally EXCLUDED to prevent accidental indexing.
];

const SEOConsoleTab = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('A');
    
    // New Advanced Error Handling State
    const [errorContext, setErrorContext] = useState(null);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        const { data } = await supabase.from('seo_discoverability').select('*').order('created_at', { ascending: true });
        if (data) setRecords(data);
        setLoading(false);
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        setActiveSubTab('A');
        const jsonStr = record.json_payload && Object.keys(record.json_payload).length > 0 ? JSON.stringify(record.json_payload, null, 2) : '{}';
        const jsonStrB = record.json_payload_b && Object.keys(record.json_payload_b).length > 0 ? JSON.stringify(record.json_payload_b, null, 2) : '{}';
        setEditForm({ ...record, json_str: jsonStr, json_str_b: jsonStrB });
    };

    const handleNew = () => {
        setEditingId('new');
        setActiveSubTab('A');
        setEditForm({ route: '', title: '', description: '', keywords: '', answer_capsule: '', json_str: '{}', title_b: '', description_b: '', keywords_b: '', answer_capsule_b: '', json_str_b: '{}' });
    };

    // AI Suggestion Engine (Mocked)
    const handleRouteSelection = async (e) => {
        const selectedRoute = e.target.value;
        setEditForm(prev => ({ ...prev, route: selectedRoute }));

        // Only auto-generate if we are creating a new route and fields are still empty
        if (selectedRoute && editingId === 'new' && (!editForm.title && !editForm.description)) {
            setGenerating(true);
            setErrorContext(null); // Clear previous errors
            
            try {
                // Determine if this route requires a "noindex" robot directive (e.g. login pages)
                const requiresNoIndex = ['/app', '/checkout'].includes(selectedRoute);

                // Call the real Local AI via the bridge
                const seoData = await generateSEOMetadata(selectedRoute);
                
                // Ensure profile pages get the noindex/nofollow tags if the AI failed to include them
                if (requiresNoIndex) {
                    seoData.schema = {
                        ...seoData.schema,
                        "@type": "ProfilePage",
                        "robots": "noindex, nofollow"
                    };
                }

                setEditForm(prev => ({
                    ...prev,
                    route: selectedRoute,
                    title: seoData.title,
                    description: seoData.description,
                    keywords: seoData.keywords,
                    answer_capsule: seoData.answer_capsule,
                    json_str: JSON.stringify(seoData.schema, null, 2)
                }));
            } catch (err) {
                console.error("Failed to generate metadata from Local AI:", err);
                setErrorContext({
                    type: "ai_error",
                    title: "Local Inference Failed",
                    message: err.message || "Failed to communicate with Local AI.",
                    suggestion: "Ensure Ollama is running (`ollama run llama3`) locally on port 11434, or try selecting the route again."
                });
            } finally {
                setGenerating(false);
            }
        }
    };

    const handleRegenerate = async (variation) => {
        if (!editForm.route) return;
        setGenerating(true);
        setErrorContext(null);
        try {
            const requiresNoIndex = ['/app', '/checkout'].includes(editForm.route);
            const seoData = await generateSEOMetadata(editForm.route);
            
            if (requiresNoIndex) {
                seoData.schema = {
                    ...seoData.schema,
                    "@type": "ProfilePage",
                    "robots": "noindex, nofollow"
                };
            }

            if (variation === 'A') {
                setEditForm(prev => ({
                    ...prev,
                    title: seoData.title,
                    description: seoData.description,
                    keywords: seoData.keywords,
                    answer_capsule: seoData.answer_capsule,
                    json_str: JSON.stringify(seoData.schema, null, 2)
                }));
            } else {
                setEditForm(prev => ({
                    ...prev,
                    title_b: seoData.title,
                    description_b: seoData.description,
                    keywords_b: seoData.keywords,
                    answer_capsule_b: seoData.answer_capsule,
                    json_str_b: JSON.stringify(seoData.schema, null, 2)
                }));
            }
        } catch (err) {
            console.error("Failed to regenerate metadata:", err);
            setErrorContext({
                type: "ai_error",
                title: "Local Inference Failed",
                message: err.message || "Failed to communicate with Local AI.",
                suggestion: "Ensure Ollama is running (`ollama run llama3`) locally on port 11434."
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setErrorContext(null); // Clear previous errors
        
        try {
            let parsedJson = {};
            let parsedJsonB = {};
            try {
                parsedJson = JSON.parse(editForm.json_str || '{}');
                parsedJsonB = JSON.parse(editForm.json_str_b || '{}');
            } catch (e) {
                setErrorContext({
                    type: "validation",
                    title: "Invalid JSON Schema",
                    message: "The structured data payload contains invalid JSON syntax. Please check for missing brackets, quotes, or trailing commas.",
                    suggestion: "Use a JSON validator or review the raw payload above.",
                    example: "Ensure all keys are wrapped in double quotes, e.g., \"@context\": \"https://schema.org\""
                });
                setSaving(false);
                return;
            }

            const payload = {
                route: editForm.route,
                title: editForm.title,
                description: editForm.description,
                keywords: editForm.keywords,
                answer_capsule: editForm.answer_capsule,
                json_payload: parsedJson,
                title_b: editForm.title_b,
                description_b: editForm.description_b,
                keywords_b: editForm.keywords_b,
                answer_capsule_b: editForm.answer_capsule_b,
                json_payload_b: parsedJsonB,
                updated_at: new Date().toISOString()
            };

            if (editingId === 'new') {
                const { error } = await supabase.from('seo_discoverability').insert([payload]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('seo_discoverability').update(payload).eq('id', editingId);
                if (error) throw error;
            }
            
            setEditingId(null);
            setErrorContext(null);
            fetchRecords();
        } catch (e) {
            console.error("SEO Matrix Save Error:", e);
            
            // Catch Postgres Duplicate Constraint
            if (e.code === '23505' || e.message?.includes('seo_discoverability_route_key')) {
                 setErrorContext({
                    type: "constraint",
                    title: "Route Already Optimized",
                    message: `We cannot create a new SEO profile for the route "${editForm.route}" because one already exists in the system.`,
                    suggestion: "Instead of creating a new entry, simply update the existing one.",
                    example: `If you are trying to optimize "${editForm.route}", close this window, locate the existing entry in the table below, and click the 'Edit' button next to it.`
                });
            } else {
                 // Generic Database Fallback Error
                 setErrorContext({
                    type: "database",
                    title: "Database Connection Error",
                    message: e.message || "An unexpected error occurred while saving to the database.",
                    suggestion: "Please try saving the route again in a few moments.",
                    example: "If the issue persists, contact technical support."
                });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex p-12 justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <section className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                    <Globe size={18} className="text-gray-400" />
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-800">Agentic Discoverability Matrix</h3>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Dynamic Routing Injection for AI & SEO</p>
                    </div>
                </div>
                {editingId === null && (
                    <button 
                        onClick={handleNew}
                        className="flex items-center gap-2 bg-[#1D1D1F] text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
                    >
                        <Plus size={14} /> New Route
                    </button>
                )}
            </div>

            {editingId && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 relative">
                    <button onClick={() => { setEditingId(null); setErrorContext(null); }} className="absolute top-4 right-4 text-gray-400 py-1 px-2 border hover:bg-white rounded"><X size={16}/></button>
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-800 mb-4">{editingId === 'new' ? 'Create Route' : 'Edit Route'}</h4>
                    
                    {/* CUSTOM ERROR RENDERER */}
                    {errorContext && (
                        <div className="mb-8 overflow-hidden rounded-xl border bg-white border-amber-500/30 shadow-sm animate-in fade-in duration-300">
                            <div className="bg-amber-50 p-4 border-b border-amber-500/20 flex gap-3 items-center">
                                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                                <h3 className="text-amber-800 font-bold uppercase tracking-widest text-xs">{errorContext.title}</h3>
                            </div>
                            <div className="p-5 space-y-4 text-sm text-gray-700">
                                <p className="leading-relaxed font-medium">{errorContext.message}</p>
                                
                                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                                    <Lightbulb className="text-blue-500 shrink-0" size={18} />
                                    <div>
                                        <span className="text-blue-900 font-bold block mb-1 text-xs tracking-widest uppercase">Suggested Fix</span>
                                        <p className="text-gray-600">{errorContext.suggestion}</p>
                                    </div>
                                </div>

                                <div className="text-xs bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-500 leading-relaxed font-mono">
                                    <span className="text-gray-400 font-bold block mb-1 uppercase tracking-widest text-[10px]">Example</span>
                                    {errorContext.example}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="grid gap-4 md:grid-cols-2 mb-6">
                       <div className="md:col-span-2">
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Target Route</label>
                           <select 
                             value={editForm.route} 
                             onChange={handleRouteSelection} 
                             className="w-full text-xs p-3 rounded-lg border border-gray-200 bg-white"
                           >
                               <option value="" disabled>Select Target Route...</option>
                               {AVAILABLE_ROUTES.map(r => (
                                   <option key={r.path} value={r.path}>{r.label}</option>
                               ))}
                           </select>
                           {generating && <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-1 animate-pulse"><Sparkles size={12}/> AI Formatting SEO...</p>}
                       </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-px">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setActiveSubTab('A')} 
                                className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${activeSubTab === 'A' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Variation A (Champion)
                            </button>
                            <button 
                                onClick={() => setActiveSubTab('B')} 
                                className={`px-4 py-2 text-xs font-black uppercase tracking-widest border-b-2 transition-colors flex items-center gap-1 ${activeSubTab === 'B' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Variation B (Challenger) <Sparkles size={10} />
                            </button>
                        </div>
                        <button 
                            onClick={() => handleRegenerate(activeSubTab)}
                            disabled={generating || !editForm.route}
                            className="text-[10px] bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 font-bold uppercase flex items-center gap-2 hover:bg-purple-100 disabled:opacity-50 transition-colors"
                        >
                            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
                            {generating ? 'Generating Data...' : 'AI Regenerate'}
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                       {activeSubTab === 'A' ? (
                           <>
                               <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Optimized Page Title (A)</label>
                                   <input type="text" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all" />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Optimized Meta Description (A)</label>
                                   <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 h-20 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all" />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Search Keywords (A)</label>
                                   <input type="text" value={editForm.keywords || ''} onChange={e => setEditForm({...editForm, keywords: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all" placeholder="comma-separated list" />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Answer Capsule (A)</label>
                                   <textarea value={editForm.answer_capsule || ''} onChange={e => setEditForm({...editForm, answer_capsule: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-amber-200 h-20 bg-amber-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-amber-300 text-amber-900" placeholder="120-150 character direct answer with no links..." />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"><Code size={12}/> JSON-LD Schema (A)</label>
                                   <textarea value={editForm.json_str || '{}'} onChange={e => setEditForm({...editForm, json_str: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 h-32 font-mono bg-[#1D1D1F] text-green-400" />
                               </div>
                           </>
                       ) : (
                           <>
                               <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Optimized Page Title (B)</label>
                                   <input type="text" value={editForm.title_b || ''} onChange={e => setEditForm({...editForm, title_b: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all" />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Optimized Meta Description (B)</label>
                                   <textarea value={editForm.description_b || ''} onChange={e => setEditForm({...editForm, description_b: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 h-20 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all" />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Search Keywords (B)</label>
                                   <input type="text" value={editForm.keywords_b || ''} onChange={e => setEditForm({...editForm, keywords_b: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="comma-separated list" />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Answer Capsule (B)</label>
                                   <textarea value={editForm.answer_capsule_b || ''} onChange={e => setEditForm({...editForm, answer_capsule_b: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-blue-200 h-20 bg-blue-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-blue-300 text-blue-900" placeholder="AI Challenger payload..." />
                               </div>
                               <div className="md:col-span-2">
                                   <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"><Code size={12}/> JSON-LD Schema (B)</label>
                                   <textarea value={editForm.json_str_b || '{}'} onChange={e => setEditForm({...editForm, json_str_b: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 h-32 font-mono bg-[#1D1D1F] text-blue-400" />
                               </div>
                           </>
                       )}
                    </div>
                    
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-500 text-white flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-colors"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                    </button>
                </div>
            )}

            {!editingId && (
                <div className="grid gap-4 mt-4">
                   {records.map(record => (
                       <div key={record.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
                          <div>
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md mb-2">{record.route}</span>
                              <h4 className="font-bold text-sm text-gray-900 mb-1">{record.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-2 md:w-3/4 mb-4">{record.description}</p>
                              <div className="flex gap-2 text-[10px] font-mono text-gray-400 uppercase">
                                 <span className="bg-gray-50 px-2 py-1 rounded">Keywords: {record.keywords ? 'Yes' : 'No'}</span>
                                 <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">JSON-LD: {record.json_payload && Object.keys(record.json_payload).length > 0 ? 'Linked' : 'None'}</span>
                              </div>
                          </div>
                          <button 
                              onClick={() => handleEdit(record)}
                              className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:underline whitespace-nowrap"
                          >
                              Edit Data
                          </button>
                       </div>
                   ))}
                   {records.length === 0 && (
                       <p className="text-gray-400 text-xs italic p-4 text-center">No SEO rules defined yet.</p>
                   )}
                </div>
            )}
        </section>
    );
};

export default SEOConsoleTab;
