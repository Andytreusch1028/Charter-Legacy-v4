import React, { useState } from 'react';
import { Lock, Zap, Activity, ShieldAlert } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const StaffLoginForm = ({ onLoginSuccess }) => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('login'); // login, recovery
    const [recoveryEmail, setRecoveryEmail] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsThinking(true);
        setError(null);
        
        try {
            // -- DEV BYPASS PROTOCOL --
            if (id === 'admin' && (password === 'charter1028' || password === 'admin')) {
                console.warn('⚠️  STAFF BYPASS ENGAGED: AUTHORIZING DEVELOPER OVERRIDE ⚠️');
                const mockStaff = {
                    id: 'staff-dev-override',
                    email: 'admin@charterlegacy.com',
                    app_metadata: { staff_role: 'Superuser' },
                    user_metadata: { full_name: 'Andytreusch (Dev)' }
                };
                onLoginSuccess(mockStaff);
                return;
            }

            if (!supabase?.auth) {
                throw new Error('Security Node offline. Please refresh.');
            }

            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email: id.includes('@') ? id : `${id}@charter-staff.internal`,
                password: password
            });

            if (loginError) throw loginError;
            onLoginSuccess(data.user);
        } catch (err) {
            setError(err.message);
            setIsThinking(false);
        }
    };

    const handleRecovery = async (e) => {
        e.preventDefault();
        setIsThinking(true);
        try {
            await supabase.from('staff_recovery_requests').insert({
                staff_email: recoveryEmail,
                requested_node: 'DeLand-01',
                reason: 'Operator forgot access credentials.'
            });
            setError('Recovery Protocol Initiated. Contact Node Superuser.');
            setIsThinking(false);
            setTimeout(() => setMode('login'), 3000);
        } catch (err) {
            setError('Recovery Sync Failed.');
            setIsThinking(false);
        }
    };

    return (
        <div className="min-h-screen bg-luminous-ink flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-luminous-blue rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-hacker-blue rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="mb-12 text-center">
                    <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-[32px] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        {mode === 'login' ? <Lock className="text-luminous-blue" size={32} /> : <ShieldAlert className="text-amber-500" size={32} />}
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                        {mode === 'login' ? 'Internal Vault.' : 'Recovery.'}
                    </h1>
                    <p className="text-[10px] text-luminous-blue font-black uppercase tracking-[0.4em]">Fulfillment Protocol Node</p>
                </div>

                {mode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Credential ID</label>
                            <input 
                                type="text" 
                                required
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="OPERATOR_CODE"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-luminous-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-4 mr-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Access Key</label>
                                <button type="button" onClick={() => setMode('recovery')} className="text-[8px] font-black text-luminous-blue uppercase tracking-widest hover:underline">Forgot?</button>
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-luminous-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                            />
                        </div>
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                {error}
                            </div>
                        )}
                        <button 
                            type="submit"
                            disabled={isThinking}
                            className="w-full bg-luminous-blue hover:bg-hacker-blue text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-luminous-blue/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isThinking ? <Activity className="animate-spin" size={16} /> : <Zap size={16} />}
                            Initiate Session
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRecovery} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Registrar Email</label>
                            <input 
                                type="email" 
                                required
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                placeholder="name@charter-staff.internal"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-luminous-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                            />
                        </div>
                        {error && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-[10px] font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setMode('login')} className="flex-1 py-4 text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Back</button>
                            <button 
                                type="submit"
                                disabled={isThinking}
                                className="flex-2 bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                            >
                                {isThinking ? <Activity size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                                Request Audit
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StaffLoginForm;
