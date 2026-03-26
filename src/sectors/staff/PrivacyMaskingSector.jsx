import React, { useEffect } from 'react';
import { EyeOff, Mail, Phone, RefreshCw, ToggleLeft, ToggleRight, ShieldCheck, Globe } from 'lucide-react';

const PrivacyMaskingSector = ({ data, loading, onRefresh }) => {
  useEffect(() => {
    onRefresh();
  }, []);

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Vision Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <EyeOff className="w-6 h-6 text-primary" />
            Privacy Masking Layer
          </h2>
          <p className="text-slate-500 text-sm">Managing digital identity aliases and secure forwarding nodes.</p>
        </div>
        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((alias) => (
          <div 
            key={alias.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {/* Status Indicator */}
            <div className="absolute top-0 right-0 p-4">
              {alias.is_active ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                  <ToggleLeft className="w-3 h-3" />
                  Paused
                </span>
              )}
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-primary">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white truncate pr-12">
                {alias.alias_email.split('@')[0]} Node
              </h3>
              <p className="text-xs text-slate-400">ID: {alias.id}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Mail className="w-4 h-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold mb-0.5">Masked Email</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate block">
                    {alias.alias_email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Phone className="w-4 h-4 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold mb-0.5">Masked Phone</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate block">
                    {alias.alias_phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium">Forwarding to Vault Proxy</div>
              <button className="text-primary hover:text-primary-dark font-semibold text-xs transition-colors">
                Regenerate
              </button>
            </div>
          </div>
        ))}

        {/* Action Card */}
        <button className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-2xl text-slate-400 group-hover:text-primary">+</span>
          </div>
          <span className="font-semibold text-slate-500 group-hover:text-primary">New Identity Alias</span>
        </button>
      </div>

      {/* UPL Disclosure Footer */}
      <div className="mt-8 text-center">
        <p className="text-[10px] text-slate-400 max-w-2xl mx-auto italic uppercase tracking-wider">
          Privacy Masking provides technical identity obfuscation only. 
          CharterLegacy does not provide legal representation or immunity from government disclosure requirements.
        </p>
      </div>
    </div>
  );
};

export default PrivacyMaskingSector;
