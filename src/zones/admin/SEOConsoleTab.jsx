import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Globe, Plus, Save, X, Loader2, Code } from 'lucide-react';

const SEOConsoleTab = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

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
        const jsonStr = record.json_payload && Object.keys(record.json_payload).length > 0 ? JSON.stringify(record.json_payload, null, 2) : '{}';
        setEditForm({ ...record, json_str: jsonStr });
    };

    const handleNew = () => {
        setEditingId('new');
        setEditForm({ route: '/', title: '', description: '', keywords: '', json_str: '{}' });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let parsedJson = {};
            try {
                parsedJson = JSON.parse(editForm.json_str);
            } catch (e) {
                alert("Invalid JSON payload.");
                setSaving(false);
                return;
            }

            const payload = {
                route: editForm.route,
                title: editForm.title,
                description: editForm.description,
                keywords: editForm.keywords,
                json_payload: parsedJson,
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
            fetchRecords();
        } catch (e) {
            console.error(e);
            alert("Error saving: " + e.message);
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
                    <button onClick={() => setEditingId(null)} className="absolute top-4 right-4 text-gray-400 py-1 px-2 border hover:bg-white rounded"><X size={16}/></button>
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-800 mb-4">{editingId === 'new' ? 'Create Route' : 'Edit Route'}</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2 mb-4">
                       <div>
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Target Route (e.g. '/' or '/packages')</label>
                           <input type="text" value={editForm.route} onChange={e => setEditForm({...editForm, route: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200" placeholder="/" />
                       </div>
                       <div>
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Page Title</label>
                           <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200" />
                       </div>
                       <div className="md:col-span-2">
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Meta Description</label>
                           <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 h-20" />
                       </div>
                       <div className="md:col-span-2">
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Keywords</label>
                           <input type="text" value={editForm.keywords || ''} onChange={e => setEditForm({...editForm, keywords: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200" placeholder="comma-separated" />
                       </div>
                       <div className="md:col-span-2">
                           <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"><Code size={12}/> JSON-LD Schema (Structured Data)</label>
                           <textarea value={editForm.json_str || '{}'} onChange={e => setEditForm({...editForm, json_str: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-gray-200 h-32 font-mono bg-[#1D1D1F] text-green-400" />
                       </div>
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
