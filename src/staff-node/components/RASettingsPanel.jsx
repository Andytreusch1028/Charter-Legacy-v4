import React, { useState, useEffect } from 'react';
import { Save, Server, FolderOpen, Printer, AlertCircle, ShieldCheck, Lock, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const RASettingsPanel = ({ 
    onClose, 
    watchFolder, 
    setWatchFolder, 
    setToast 
}) => {
    const [settings, setSettings] = useState({
        node_id: '',
        watch_folder: watchFolder || '',
        printer_name: '',
        context_info: '',
        tinyfish_api_key: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [activeTab, setActiveTab] = useState('general'); // 'general' or 'security'
    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [updatingPassword, setUpdatingPassword] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase.from('ra_settings').select('*');
            if (error) throw error;
            
            // Convert array of key-value pairs to object
            const config = {
                node_id: '',
                watch_folder: '',
                printer_name: '',
                context_info: '',
                tinyfish_api_key: ''
            };
            data?.forEach(row => {
                config[row.key] = row.value;
            });
            setSettings(config);
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!passwordData.new || passwordData.new.length < 6) {
            setMsg({ type: 'error', text: 'New password must be at least 6 characters' });
            return;
        }
        if (passwordData.new !== passwordData.confirm) {
            setMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setUpdatingPassword(true);
        setMsg(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Store the Node Key LOCALLY for emergency access regardless of server status
            const nodeSettings = JSON.parse(localStorage.getItem('ra_node_settings') || '{}');
            nodeSettings.node_access_key = passwordData.new;
            localStorage.setItem('ra_node_settings', JSON.stringify(nodeSettings));

            // If we're in "Protocol Alpha" (Bypass Mode), just simulate success
            if (user?.id === 'mock-admin') {
                await new Promise(r => setTimeout(r, 800));
                setMsg({ type: 'success', text: 'Local Node Key established! You can now log in using this key even if emails fail.' });
                setPasswordData({ current: '', new: '', confirm: '' });
                return;
            }

            if (!user) {
                setMsg({ type: 'success', text: 'Local Node Key saved. Note: Real cloud password was not changed because session is mock.' });
                setPasswordData({ current: '', new: '', confirm: '' });
                return;
            }

            const { error } = await supabase.auth.updateUser({ password: passwordData.new });
            if (error) throw error;
            setMsg({ type: 'success', text: 'Success! Both your Cloud Password and Local Node Key have been updated.' });
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: err.message || 'Failed to update password' });
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg(null);
        try {
            // Upsert each setting individually
            const updates = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase.from('ra_settings').upsert(updates);
            if (error) throw error;
            
            setMsg({ type: 'success', text: 'Settings saved successfully' });
            // Cache locally for immediate use
            localStorage.setItem('ra_node_settings', JSON.stringify(settings));
            localStorage.setItem('cl_watch_folder', settings.watch_folder);
            
            if (setWatchFolder) {
                setWatchFolder(settings.watch_folder);
            }
            
            if (setToast) {
                setToast({ type: 'success', message: 'Node configuration synchronized.' });
            }
        } catch (err) {
            console.error(err);
            setMsg({ type: 'error', text: 'Failed to save settings to cloud' });
            if (setToast) setToast({ type: 'error', message: 'Sync failed.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white text-luminous-ink rounded-2xl shadow-2xl w-[500px] overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-black uppercase tracking-tighter text-luminous-ink">Node Configuration</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold px-2">×</button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-white text-luminous-ink shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Server size={12} /> General Config
                        </button>
                        <button 
                            onClick={() => setActiveTab('security')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-white text-luminous-ink shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ShieldCheck size={12} /> Security
                        </button>
                    </div>

                    {activeTab === 'general' ? (
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <Server size={12} /> Node Identifier
                                </label>
                                <input 
                                    type="text" 
                                    value={settings.node_id}
                                    onChange={e => setSettings({...settings, node_id: e.target.value})}
                                    placeholder="e.g. DL-FL-001"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-medium focus:ring-2 focus:ring-luminous-blue/20 focus:border-luminous-blue outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <FolderOpen size={12} /> Default Watch Folder
                                </label>
                                <input 
                                    type="text" 
                                    value={settings.watch_folder}
                                    onChange={e => setSettings({...settings, watch_folder: e.target.value})}
                                    placeholder="C:\Scanner\Inbox"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-medium focus:ring-2 focus:ring-luminous-blue/20 focus:border-luminous-blue outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <Printer size={12} /> Printer Target
                                </label>
                                <input 
                                    type="text" 
                                    value={settings.printer_name}
                                    onChange={e => setSettings({...settings, printer_name: e.target.value})}
                                    placeholder="Network Printer IP or Name"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-medium focus:ring-2 focus:ring-luminous-blue/20 focus:border-luminous-blue outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <AlertCircle size={12} /> Context Info
                                </label>
                                <textarea 
                                    value={settings.context_info}
                                    onChange={e => setSettings({...settings, context_info: e.target.value})}
                                    placeholder="Additional context about this processing node..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-luminous-blue/20 focus:border-luminous-blue outline-none h-24 resize-none transition-all"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="p-4 bg-luminous-blue/5 border border-luminous-blue/10 rounded-2xl">
                                <p className="text-[11px] font-bold text-luminous-blue mb-1">Secure Key Update</p>
                                <p className="text-[9px] text-gray-500 font-medium italic">Changes your primary access key across all secure nodes.</p>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <Lock size={12} /> New Secure Key
                                </label>
                                <input 
                                    type="password" 
                                    value={passwordData.new}
                                    onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                                    placeholder="Enter new complex key"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-luminous-blue/20 focus:border-luminous-blue outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <Lock size={12} /> Confirm Secure Key
                                </label>
                                <input 
                                    type="password" 
                                    value={passwordData.confirm}
                                    onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                                    placeholder="Repeat new key"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-luminous-blue/20 focus:border-luminous-blue outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                    <Zap size={12} className="text-violet-500" /> TinyFish API Key
                                </label>
                                <input 
                                    type="password" 
                                    value={settings.tinyfish_api_key}
                                    onChange={e => setSettings({...settings, tinyfish_api_key: e.target.value})}
                                    placeholder="Enter TF-xxx key"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono font-medium focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                />
                                <p className="text-[8px] text-gray-400 italic">Required for autonomous SunBiz filing protocols.</p>
                            </div>

                            <button 
                                onClick={handleUpdatePassword}
                                disabled={updatingPassword || !passwordData.new}
                                className="w-full py-3 bg-luminous-ink text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                {updatingPassword ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Access Key'}
                            </button>
                        </div>
                    )}

                    {msg && (
                        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {msg.type === 'success' ? <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> : <AlertCircle size={12}/>} 
                            {msg.text}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 bg-luminous-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                        {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={12} />}
                        Save Config
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RASettingsPanel;
