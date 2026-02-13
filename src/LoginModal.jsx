import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { X, Lock, ArrowRight, Loader2, Mail, ShieldAlert } from 'lucide-react';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    if (!isOpen) return null;

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            onSuccess(data.user);
        } catch (err) {
             // If invalid login, suggest magic link
             if (err.message.includes("Invalid login credentials") || err.message.includes("Infvalid login credentials")) {
                setError("Invalid credentials. Try the Magic Link if you forgot your password.");
             } else {
                setError(err.message);
             }
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        if (!email) {
            setError("Please enter your email address first.");
            return;
        }
        setLoading(true);
        setError('');
        setMsg('');
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                }
            });
            if (error) throw error;
            setMsg("✨ Magic Link Sent! Check your email to login instantly.");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmergencyLogin = async () => {
        const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
        if (!serviceKey) return;
        
        setLoading(true);
        try {
            console.log("Attempting Emergency Override...");
            const supabaseAdmin = createClient(import.meta.env.VITE_SUPABASE_URL, serviceKey);
            const { data, error } = await supabaseAdmin.auth.admin.generateLink({
                type: 'magiclink',
                email: email || 'imalivenowwhat@gmail.com'
            });

            if (error) throw error;
            
            console.log("Magic Link Generated:", data.properties.action_link);
            window.location.href = data.properties.action_link;

        } catch (err) {
            console.error("Emergency Login Failed:", err);
            setError("Emergency Login Failed: " + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-[48px] p-12 shadow-2xl relative overflow-hidden animate-in zoom-in-95 text-left border border-gray-100 transition-all duration-500">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-all z-10">
                    <X size={18} />
                </button>

                <div className="space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-2 text-[#007AFF] text-[9px] font-black uppercase tracking-widest mb-4">
                            <Lock size={12} /> Secure Access
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1D1D1F]">Client Login</h2>
                        <p className="text-gray-500 mt-2 text-sm italic">Access your secure console.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                    
                    {msg && (
                        <div className="p-4 bg-green-50 text-green-600 text-xs font-bold rounded-xl animate-in slide-in-from-top-2 flex items-center gap-2">
                             {msg}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="founder@legacy.com" 
                                    className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 pl-12 pr-4 font-bold text-lg focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••" 
                                    className="w-full bg-[#F5F5F7] border-0 rounded-xl py-4 pl-12 pr-4 font-bold text-lg focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button onClick={handleLogin} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="animate-spin" /> : <>Enter Console <ArrowRight size={18} /></>}
                        </button>
                        
                        <button onClick={handleMagicLink} disabled={loading} className="w-full bg-white text-gray-500 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                             Email me a Magic Link
                        </button>

                        {import.meta.env.VITE_SUPABASE_SERVICE_KEY && (
                            <button onClick={handleEmergencyLogin} className="w-full mt-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                                <ShieldAlert size={12} /> Emergency Override (Dev Only)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
