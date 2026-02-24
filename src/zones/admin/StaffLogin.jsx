import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, Loader2, AlertTriangle } from 'lucide-react';

export default function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Using standard email/password for staff for speed and reliability,
    // compared to the magic link flow used for customers.
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Role verification happens at the router level in App.jsx.
    // We just push them to the admin route. If they aren't admin,
    // App.jsx will automatically bounce them to /app.
    navigate('/admin/growth');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 text-white font-sans selection:bg-purple-500/30">
      
      {/* Brutalist Aesthetic - No Marketing Fluff */}
      <div className="w-full max-w-md bg-[#121214] border border-[#2A2A2E] rounded-none p-10 shadow-2xl relative">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
        
        <div className="flex items-center gap-3 mb-8 opacity-80">
          <Shield size={24} className="text-red-500" />
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Restricted Area</h1>
        </div>

        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Staff Access.</h2>
        <p className="text-xs font-bold text-gray-500 mb-8 uppercase tracking-widest border-l-2 border-red-500 pl-3">
          Authorized Personnel Only. Log interactions are monitored.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Ident</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#2A2A2E] text-white p-4 text-sm font-mono focus:outline-none focus:border-red-500 transition-colors"
              placeholder="admin@charterlegacy.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Passcode</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#2A2A2E] text-white p-4 text-sm font-mono focus:outline-none focus:border-red-500 transition-colors"
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black p-4 font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {loading ? 'Authenticating...' : 'Establish Connection'}
            </button>

            {import.meta.env.DEV && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem('DEV_ADMIN_BYPASS', 'executive');
                    window.location.href = '/admin/growth';
                  }}
                  className="w-full bg-blue-500/10 text-blue-400 border border-blue-500/20 p-3 font-black uppercase tracking-widest text-[9px] hover:bg-blue-500/20 transition-colors flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-white">Auto-Connect</span>
                  [ Executive ]
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem('DEV_ADMIN_BYPASS', 'fulfillment');
                    window.location.href = '/admin/fulfillment';
                  }}
                  className="w-full bg-green-500/10 text-green-400 border border-green-500/20 p-3 font-black uppercase tracking-widest text-[9px] hover:bg-green-500/20 transition-colors flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-white">Auto-Connect</span>
                  [ Fulfillment ]
                </button>
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
